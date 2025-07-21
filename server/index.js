const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cron = require('node-cron');

// Import game systems
const GameEngine = require('./services/GameEngine');
const PlayerManager = require('./services/PlayerManager');
const WorldManager = require('./services/WorldManager');
const CombatSystem = require('./services/CombatSystem');
const QuestSystem = require('./services/QuestSystem');
const EconomySystem = require('./services/EconomySystem');
const GuildSystem = require('./services/GuildSystem');
const ChatSystem = require('./services/ChatSystem');
const EventSystem = require('./services/EventSystem');
const AuctionHouse = require('./services/AuctionHouse');
const PvPSystem = require('./services/PvPSystem');
const DungeonManager = require('./services/DungeonManager');
const RaidManager = require('./services/RaidManager');
const CraftingSystem = require('./services/CraftingSystem');
const TradingSystem = require('./services/TradingSystem');
const AchievementSystem = require('./services/AchievementSystem');
const LeaderboardSystem = require('./services/LeaderboardSystem');
const AdminSystem = require('./services/AdminSystem');
const SecuritySystem = require('./services/SecuritySystem');
const AnalyticsSystem = require('./services/AnalyticsSystem');
const NotificationSystem = require('./services/NotificationSystem');

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const playerRoutes = require('./routes/player');
const worldRoutes = require('./routes/world');
const guildRoutes = require('./routes/guild');
const marketRoutes = require('./routes/market');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');

// Import middleware
const authMiddleware = require('./middleware/auth');
const rateLimitMiddleware = require('./middleware/rateLimit');
const validationMiddleware = require('./middleware/validation');
const loggingMiddleware = require('./middleware/logging');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(loggingMiddleware);
app.use(rateLimitMiddleware);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/epic_mmo_rpg', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('🎮 Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Initialize game systems
const gameEngine = new GameEngine();
const playerManager = new PlayerManager();
const worldManager = new WorldManager();
const combatSystem = new CombatSystem();
const questSystem = new QuestSystem();
const economySystem = new EconomySystem();
const guildSystem = new GuildSystem();
const chatSystem = new ChatSystem();
const eventSystem = new EventSystem();
const auctionHouse = new AuctionHouse();
const pvpSystem = new PvPSystem();
const dungeonManager = new DungeonManager();
const raidManager = new RaidManager();
const craftingSystem = new CraftingSystem();
const tradingSystem = new TradingSystem();
const achievementSystem = new AchievementSystem();
const leaderboardSystem = new LeaderboardSystem();
const adminSystem = new AdminSystem();
const securitySystem = new SecuritySystem();
const analyticsSystem = new AnalyticsSystem();
const notificationSystem = new NotificationSystem();

// Store active connections
const activeConnections = new Map();
const playerSockets = new Map();
const roomSockets = new Map();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', authMiddleware, gameRoutes);
app.use('/api/player', authMiddleware, playerRoutes);
app.use('/api/world', authMiddleware, worldRoutes);
app.use('/api/guild', authMiddleware, guildRoutes);
app.use('/api/market', authMiddleware, marketRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);

// WebSocket connection handling
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error('No token provided');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const player = await playerManager.getPlayer(decoded.userId);
    
    if (!player) {
      throw new Error('Player not found');
    }
    
    socket.userId = decoded.userId;
    socket.player = player;
    next();
  } catch (err) {
    console.error('WebSocket authentication error:', err);
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`🎮 Player connected: ${socket.player.username} (${socket.userId})`);
  
  // Store connection
  activeConnections.set(socket.id, socket);
  playerSockets.set(socket.userId, socket);
  
  // Initialize player in game world
  gameEngine.addPlayer(socket.userId, socket.player);
  worldManager.addPlayerToWorld(socket.userId, socket.player);
  
  // Join player-specific room
  socket.join(`player_${socket.userId}`);
  
  // Join world region room
  const region = worldManager.getPlayerRegion(socket.userId);
  if (region) {
    socket.join(`region_${region.id}`);
    if (!roomSockets.has(`region_${region.id}`)) {
      roomSockets.set(`region_${region.id}`, new Set());
    }
    roomSockets.get(`region_${region.id}`).add(socket);
  }
  
  // Send initial game state
  socket.emit('game:initial_state', {
    player: socket.player,
    world: worldManager.getWorldState(socket.userId),
    inventory: await playerManager.getInventory(socket.userId),
    quests: await questSystem.getPlayerQuests(socket.userId),
    guild: await guildSystem.getPlayerGuild(socket.userId),
    friends: await playerManager.getFriends(socket.userId),
    achievements: await achievementSystem.getPlayerAchievements(socket.userId),
    settings: await playerManager.getPlayerSettings(socket.userId)
  });
  
  // Player movement
  socket.on('player:move', async (data) => {
    try {
      const result = await worldManager.movePlayer(socket.userId, data.position, data.direction);
      if (result.success) {
        // Broadcast to region
        socket.to(`region_${result.region.id}`).emit('player:moved', {
          playerId: socket.userId,
          position: result.position,
          direction: data.direction
        });
        
        // Check for region change
        if (result.regionChanged) {
          socket.leave(`region_${result.previousRegion.id}`);
          socket.join(`region_${result.region.id}`);
          
          socket.emit('world:region_changed', {
            newRegion: result.region,
            nearbyPlayers: worldManager.getNearbyPlayers(socket.userId),
            nearbyNPCs: worldManager.getNearbyNPCs(socket.userId),
            nearbyObjects: worldManager.getNearbyObjects(socket.userId)
          });
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Movement failed', error: error.message });
    }
  });
  
  // Combat system
  socket.on('combat:attack', async (data) => {
    try {
      const result = await combatSystem.processAttack(socket.userId, data.targetId, data.skillId);
      
      if (result.success) {
        // Notify attacker
        socket.emit('combat:attack_result', result);
        
        // Notify target if it's a player
        if (data.targetType === 'player') {
          const targetSocket = playerSockets.get(data.targetId);
          if (targetSocket) {
            targetSocket.emit('combat:attacked', {
              attackerId: socket.userId,
              damage: result.damage,
              effects: result.effects
            });
          }
        }
        
        // Broadcast to nearby players
        socket.to(`region_${worldManager.getPlayerRegion(socket.userId).id}`)
              .emit('combat:battle_update', {
                attackerId: socket.userId,
                targetId: data.targetId,
                damage: result.damage,
                effects: result.effects
              });
      }
    } catch (error) {
      socket.emit('error', { message: 'Attack failed', error: error.message });
    }
  });
  
  // Chat system
  socket.on('chat:message', async (data) => {
    try {
      const result = await chatSystem.processMessage(socket.userId, data);
      
      if (result.success) {
        switch (data.type) {
          case 'global':
            io.emit('chat:message', result.message);
            break;
          case 'regional':
            socket.to(`region_${worldManager.getPlayerRegion(socket.userId).id}`)
                  .emit('chat:message', result.message);
            break;
          case 'guild':
            const guild = await guildSystem.getPlayerGuild(socket.userId);
            if (guild) {
              io.to(`guild_${guild.id}`).emit('chat:message', result.message);
            }
            break;
          case 'whisper':
            const targetSocket = playerSockets.get(data.targetId);
            if (targetSocket) {
              targetSocket.emit('chat:message', result.message);
              socket.emit('chat:message', result.message);
            }
            break;
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Message failed', error: error.message });
    }
  });
  
  // Quest system
  socket.on('quest:accept', async (data) => {
    try {
      const result = await questSystem.acceptQuest(socket.userId, data.questId);
      socket.emit('quest:accepted', result);
      
      if (result.success) {
        await achievementSystem.checkAchievements(socket.userId, 'quest_accepted');
      }
    } catch (error) {
      socket.emit('error', { message: 'Quest acceptance failed', error: error.message });
    }
  });
  
  socket.on('quest:complete', async (data) => {
    try {
      const result = await questSystem.completeQuest(socket.userId, data.questId);
      socket.emit('quest:completed', result);
      
      if (result.success) {
        await achievementSystem.checkAchievements(socket.userId, 'quest_completed');
        await playerManager.addExperience(socket.userId, result.experience);
        await economySystem.addCurrency(socket.userId, result.rewards.gold);
      }
    } catch (error) {
      socket.emit('error', { message: 'Quest completion failed', error: error.message });
    }
  });
  
  // Trading system
  socket.on('trade:initiate', async (data) => {
    try {
      const result = await tradingSystem.initiateTradeRequest(socket.userId, data.targetPlayerId);
      
      if (result.success) {
        const targetSocket = playerSockets.get(data.targetPlayerId);
        if (targetSocket) {
          targetSocket.emit('trade:request', {
            from: socket.player.username,
            fromId: socket.userId,
            tradeId: result.tradeId
          });
        }
      }
      
      socket.emit('trade:initiated', result);
    } catch (error) {
      socket.emit('error', { message: 'Trade initiation failed', error: error.message });
    }
  });
  
  // Guild system
  socket.on('guild:create', async (data) => {
    try {
      const result = await guildSystem.createGuild(socket.userId, data);
      socket.emit('guild:created', result);
      
      if (result.success) {
        socket.join(`guild_${result.guild.id}`);
      }
    } catch (error) {
      socket.emit('error', { message: 'Guild creation failed', error: error.message });
    }
  });
  
  socket.on('guild:invite', async (data) => {
    try {
      const result = await guildSystem.invitePlayer(socket.userId, data.playerId);
      
      if (result.success) {
        const targetSocket = playerSockets.get(data.playerId);
        if (targetSocket) {
          targetSocket.emit('guild:invitation', {
            from: socket.player.username,
            guildName: result.guildName,
            inviteId: result.inviteId
          });
        }
      }
      
      socket.emit('guild:invite_sent', result);
    } catch (error) {
      socket.emit('error', { message: 'Guild invitation failed', error: error.message });
    }
  });
  
  // Crafting system
  socket.on('crafting:start', async (data) => {
    try {
      const result = await craftingSystem.startCrafting(socket.userId, data.recipeId, data.quantity);
      socket.emit('crafting:started', result);
      
      if (result.success) {
        // Set timer for crafting completion
        setTimeout(async () => {
          const completionResult = await craftingSystem.completeCrafting(socket.userId, result.craftingId);
          socket.emit('crafting:completed', completionResult);
        }, result.craftingTime);
      }
    } catch (error) {
      socket.emit('error', { message: 'Crafting failed', error: error.message });
    }
  });
  
  // PvP system
  socket.on('pvp:challenge', async (data) => {
    try {
      const result = await pvpSystem.sendChallenge(socket.userId, data.targetPlayerId);
      
      if (result.success) {
        const targetSocket = playerSockets.get(data.targetPlayerId);
        if (targetSocket) {
          targetSocket.emit('pvp:challenge_received', {
            from: socket.player.username,
            fromId: socket.userId,
            challengeId: result.challengeId
          });
        }
      }
      
      socket.emit('pvp:challenge_sent', result);
    } catch (error) {
      socket.emit('error', { message: 'PvP challenge failed', error: error.message });
    }
  });
  
  // Auction house
  socket.on('auction:bid', async (data) => {
    try {
      const result = await auctionHouse.placeBid(socket.userId, data.auctionId, data.bidAmount);
      socket.emit('auction:bid_placed', result);
      
      if (result.success && result.outbidPlayerId) {
        const outbidSocket = playerSockets.get(result.outbidPlayerId);
        if (outbidSocket) {
          outbidSocket.emit('auction:outbid', {
            auctionId: data.auctionId,
            newBid: data.bidAmount
          });
        }
      }
    } catch (error) {
      socket.emit('error', { message: 'Auction bid failed', error: error.message });
    }
  });
  
  // Admin commands
  socket.on('admin:command', async (data) => {
    try {
      if (!socket.player.isAdmin) {
        throw new Error('Insufficient permissions');
      }
      
      const result = await adminSystem.executeCommand(socket.userId, data.command, data.args);
      socket.emit('admin:command_result', result);
      
      // Log admin action
      await analyticsSystem.logAdminAction(socket.userId, data.command, data.args);
    } catch (error) {
      socket.emit('error', { message: 'Admin command failed', error: error.message });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log(`🎮 Player disconnected: ${socket.player.username} (${socket.userId})`);
    
    try {
      // Save player state
      await playerManager.savePlayerState(socket.userId);
      
      // Remove from game world
      gameEngine.removePlayer(socket.userId);
      worldManager.removePlayerFromWorld(socket.userId);
      
      // Clean up connections
      activeConnections.delete(socket.id);
      playerSockets.delete(socket.userId);
      
      // Remove from region room
      const region = worldManager.getPlayerRegion(socket.userId);
      if (region && roomSockets.has(`region_${region.id}`)) {
        roomSockets.get(`region_${region.id}`).delete(socket);
      }
      
      // Notify nearby players
      if (region) {
        socket.to(`region_${region.id}`).emit('player:disconnected', {
          playerId: socket.userId,
          username: socket.player.username
        });
      }
      
      // Cancel any active trades
      await tradingSystem.cancelPlayerTrades(socket.userId);
      
      // Set player as offline
      await playerManager.setPlayerOffline(socket.userId);
      
    } catch (error) {
      console.error('Error during player disconnect cleanup:', error);
    }
  });
  
  // Send welcome message
  socket.emit('game:welcome', {
    message: `Добро пожаловать в Epic MMO RPG, ${socket.player.username}!`,
    onlinePlayers: activeConnections.size,
    serverTime: new Date().toISOString()
  });
  
  // Track analytics
  analyticsSystem.trackPlayerLogin(socket.userId);
});

// Game loop - runs every 50ms (20 FPS)
setInterval(() => {
  gameEngine.update();
  
  // Broadcast world updates to all connected players
  const worldUpdates = worldManager.getUpdates();
  if (worldUpdates.length > 0) {
    io.emit('world:updates', worldUpdates);
  }
  
  // Process combat updates
  const combatUpdates = combatSystem.getUpdates();
  if (combatUpdates.length > 0) {
    io.emit('combat:updates', combatUpdates);
  }
  
  // Process economy updates
  const economyUpdates = economySystem.getUpdates();
  if (economyUpdates.length > 0) {
    io.emit('economy:updates', economyUpdates);
  }
}, 50);

// Slower game loop for less frequent updates - runs every 5 seconds
setInterval(() => {
  // Update leaderboards
  leaderboardSystem.updateLeaderboards();
  
  // Process auction house
  auctionHouse.processExpiredAuctions();
  
  // Update guild activities
  guildSystem.updateGuildActivities();
  
  // Process world events
  eventSystem.processWorldEvents();
  
  // Clean up expired sessions
  securitySystem.cleanupExpiredSessions();
  
  // Update analytics
  analyticsSystem.updateMetrics();
}, 5000);

// Daily reset tasks
cron.schedule('0 0 * * *', async () => {
  console.log('🎮 Running daily reset tasks...');
  
  try {
    await questSystem.resetDailyQuests();
    await dungeonManager.resetDailyLimits();
    await pvpSystem.resetDailyRankings();
    await achievementSystem.processWeeklyAchievements();
    await economySystem.processInflationAdjustment();
    await leaderboardSystem.archiveWeeklyResults();
    
    console.log('✅ Daily reset tasks completed');
  } catch (error) {
    console.error('❌ Error during daily reset:', error);
  }
});

// Weekly maintenance
cron.schedule('0 3 * * 0', async () => {
  console.log('🎮 Running weekly maintenance...');
  
  try {
    await worldManager.cleanupInactiveAreas();
    await playerManager.cleanupInactivePlayers();
    await guildSystem.processInactiveGuilds();
    await auctionHouse.cleanupExpiredListings();
    await analyticsSystem.generateWeeklyReports();
    
    console.log('✅ Weekly maintenance completed');
  } catch (error) {
    console.error('❌ Error during weekly maintenance:', error);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    activePlayers: activeConnections.size,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Epic MMO RPG Server is running on port ${PORT}`);
  console.log(`🎮 WebSocket server is ready for connections`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🎮 Received SIGTERM, shutting down gracefully...');
  
  // Save all player states
  for (const [userId, socket] of playerSockets) {
    try {
      await playerManager.savePlayerState(userId);
    } catch (error) {
      console.error(`Error saving player ${userId}:`, error);
    }
  }
  
  // Close database connection
  await mongoose.connection.close();
  
  server.close(() => {
    console.log('🎮 Server shut down complete');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🎮 Received SIGINT, shutting down gracefully...');
  
  // Save all player states
  for (const [userId, socket] of playerSockets) {
    try {
      await playerManager.savePlayerState(userId);
    } catch (error) {
      console.error(`Error saving player ${userId}:`, error);
    }
  }
  
  // Close database connection
  await mongoose.connection.close();
  
  server.close(() => {
    console.log('🎮 Server shut down complete');
    process.exit(0);
  });
});

module.exports = { app, server, io };