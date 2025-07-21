/**
 * Epic MMORPG Server
 * Main entry point for the game server
 */

import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

// Import configurations
import { config } from '@config/index';
import { logger } from '@utils/logger';
import { connectDatabase } from '@lib/database';
import { connectRedis, redisClient, redisSubscriber } from '@lib/redis';
import { connectRabbitMQ } from '@lib/rabbitmq';
import { connectMongoDB } from '@lib/mongodb';
import { initializeMetrics } from '@lib/metrics';

// Import middleware
import { errorHandler } from '@middleware/errorHandler';
import { authMiddleware } from '@middleware/auth';
import { validationMiddleware } from '@middleware/validation';
import { loggingMiddleware } from '@middleware/logging';

// Import routes
import authRoutes from '@routes/auth.routes';
import characterRoutes from '@routes/character.routes';
import inventoryRoutes from '@routes/inventory.routes';
import questRoutes from '@routes/quest.routes';
import combatRoutes from '@routes/combat.routes';
import socialRoutes from '@routes/social.routes';
import economyRoutes from '@routes/economy.routes';
import adminRoutes from '@routes/admin.routes';

// Import socket handlers
import { setupSocketHandlers } from '@lib/socket/handlers';
import { GameStateManager } from '@services/game/GameStateManager';
import { WorldManager } from '@services/world/WorldManager';
import { CombatEngine } from '@services/combat/CombatEngine';
import { QuestSystem } from '@services/quest/QuestSystem';
import { ChatManager } from '@services/social/ChatManager';
import { EconomyManager } from '@services/economy/EconomyManager';

// Import workers
import { startWorkers } from '@workers/index';

// Initialize Sentry for error tracking
if (config.sentry.dsn) {
  Sentry.init({
    dsn: config.sentry.dsn,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: express() }),
      new ProfilingIntegration(),
    ],
    tracesSampleRate: config.sentry.tracesSampleRate,
    profilesSampleRate: config.sentry.profilesSampleRate,
    environment: config.env,
  });
}

// Create Express app
const app = express();
const httpServer = createServer(app);

// Create Socket.IO server with Redis adapter
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.cors.origin,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Global middleware
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
}));
app.use(cors(config.cors));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(loggingMiddleware);

// Morgan logging for HTTP requests
if (config.env !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env,
    version: config.version,
  });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await initializeMetrics().register.metrics();
    res.set('Content-Type', initializeMetrics().register.contentType);
    res.end(metrics);
  } catch (error) {
    res.status(500).end();
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/characters', authMiddleware, characterRoutes);
app.use('/api/v1/inventory', authMiddleware, inventoryRoutes);
app.use('/api/v1/quests', authMiddleware, questRoutes);
app.use('/api/v1/combat', authMiddleware, combatRoutes);
app.use('/api/v1/social', authMiddleware, socialRoutes);
app.use('/api/v1/economy', authMiddleware, economyRoutes);
app.use('/api/v1/admin', authMiddleware, adminRoutes);

// Static files for game assets
app.use('/assets', express.static('public/assets', {
  maxAge: '1d',
  etag: true,
}));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path,
  });
});

// Sentry error handler (must be before other error handlers)
app.use(Sentry.Handlers.errorHandler());

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize game systems
let gameStateManager: GameStateManager;
let worldManager: WorldManager;
let combatEngine: CombatEngine;
let questSystem: QuestSystem;
let chatManager: ChatManager;
let economyManager: EconomyManager;

async function initializeGameSystems() {
  logger.info('Initializing game systems...');

  // Initialize core game systems
  gameStateManager = new GameStateManager();
  worldManager = new WorldManager();
  combatEngine = new CombatEngine();
  questSystem = new QuestSystem();
  chatManager = new ChatManager();
  economyManager = new EconomyManager();

  // Start game systems
  await Promise.all([
    gameStateManager.initialize(),
    worldManager.initialize(),
    combatEngine.initialize(),
    questSystem.initialize(),
    chatManager.initialize(),
    economyManager.initialize(),
  ]);

  logger.info('Game systems initialized successfully');
}

// Initialize server
async function startServer() {
  try {
    logger.info('Starting Epic MMORPG Server...');

    // Connect to databases
    await connectDatabase();
    logger.info('PostgreSQL connected');

    await connectRedis();
    logger.info('Redis connected');

    await connectRabbitMQ();
    logger.info('RabbitMQ connected');

    await connectMongoDB();
    logger.info('MongoDB connected');

    // Setup Redis adapter for Socket.IO
    io.adapter(createAdapter(redisClient, redisSubscriber));
    logger.info('Socket.IO Redis adapter configured');

    // Initialize game systems
    await initializeGameSystems();

    // Setup Socket.IO handlers
    setupSocketHandlers(io, {
      gameStateManager,
      worldManager,
      combatEngine,
      questSystem,
      chatManager,
      economyManager,
    });

    // Start background workers
    if (config.workers.enabled) {
      await startWorkers();
      logger.info('Background workers started');
    }

    // Initialize metrics collection
    initializeMetrics();
    logger.info('Metrics collection initialized');

    // Start HTTP server
    const PORT = config.server.port || 3000;
    httpServer.listen(PORT, () => {
      logger.info(`🎮 Epic MMORPG Server is running on port ${PORT}`);
      logger.info(`📊 Environment: ${config.env}`);
      logger.info(`🔧 Node.js version: ${process.version}`);
      logger.info(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`);
    });

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, starting graceful shutdown...`);

      // Stop accepting new connections
      httpServer.close(() => {
        logger.info('HTTP server closed');
      });

      // Close Socket.IO connections
      io.close(() => {
        logger.info('Socket.IO server closed');
      });

      // Shutdown game systems
      await Promise.all([
        gameStateManager.shutdown(),
        worldManager.shutdown(),
        combatEngine.shutdown(),
        questSystem.shutdown(),
        chatManager.shutdown(),
        economyManager.shutdown(),
      ]);

      // Close database connections
      await Promise.all([
        redisClient.quit(),
        redisSubscriber.quit(),
        // Add other cleanup tasks
      ]);

      logger.info('Graceful shutdown completed');
      process.exit(0);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      Sentry.captureException(error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      Sentry.captureException(reason);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    Sentry.captureException(error);
    process.exit(1);
  }
}

// Start the server
startServer();

export { app, io, httpServer };