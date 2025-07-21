/**
 * Epic MMORPG Game Engine
 * High-performance game engine with ECS architecture
 */

import { World } from './core/World';
import { EntityManager } from './core/EntityManager';
import { ComponentManager } from './core/ComponentManager';
import { SystemManager } from './core/SystemManager';
import { EventBus } from './core/EventBus';
import { ResourceManager } from './core/ResourceManager';
import { NetworkManager } from './networking/NetworkManager';
import { PhysicsEngine } from './physics/PhysicsEngine';
import { RenderingEngine } from './rendering/RenderingEngine';
import { AudioEngine } from './audio/AudioEngine';
import { AISystem } from './ai/AISystem';
import { SceneManager } from './core/SceneManager';
import { PerformanceMonitor } from './utils/PerformanceMonitor';
import { Logger } from './utils/Logger';

export interface EngineConfig {
  targetFPS: number;
  fixedTimeStep: number;
  maxSubSteps: number;
  gravity: { x: number; y: number; z: number };
  worldBounds: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } };
  networking: {
    tickRate: number;
    interpolation: boolean;
    compression: boolean;
  };
  rendering: {
    canvas?: HTMLCanvasElement;
    antialias: boolean;
    shadows: boolean;
    maxLights: number;
  };
  physics: {
    engine: 'cannon' | 'matter';
    iterations: number;
    tolerance: number;
  };
  performance: {
    monitoring: boolean;
    adaptiveQuality: boolean;
    workerThreads: number;
  };
}

export class GameEngine {
  private world: World;
  private entityManager: EntityManager;
  private componentManager: ComponentManager;
  private systemManager: SystemManager;
  private eventBus: EventBus;
  private resourceManager: ResourceManager;
  private networkManager: NetworkManager;
  private physicsEngine: PhysicsEngine;
  private renderingEngine: RenderingEngine;
  private audioEngine: AudioEngine;
  private aiSystem: AISystem;
  private sceneManager: SceneManager;
  private performanceMonitor: PerformanceMonitor;
  private logger: Logger;

  private isRunning: boolean = false;
  private lastTime: number = 0;
  private accumulator: number = 0;
  private frameId: number = 0;
  private config: EngineConfig;

  constructor(config: Partial<EngineConfig> = {}) {
    this.config = this.mergeConfig(config);
    this.logger = new Logger('GameEngine');
    this.initialize();
  }

  private mergeConfig(config: Partial<EngineConfig>): EngineConfig {
    return {
      targetFPS: 60,
      fixedTimeStep: 1 / 60,
      maxSubSteps: 10,
      gravity: { x: 0, y: -9.81, z: 0 },
      worldBounds: {
        min: { x: -10000, y: -1000, z: -10000 },
        max: { x: 10000, y: 1000, z: 10000 },
      },
      networking: {
        tickRate: 30,
        interpolation: true,
        compression: true,
      },
      rendering: {
        antialias: true,
        shadows: true,
        maxLights: 100,
      },
      physics: {
        engine: 'cannon',
        iterations: 10,
        tolerance: 0.001,
      },
      performance: {
        monitoring: true,
        adaptiveQuality: true,
        workerThreads: navigator.hardwareConcurrency || 4,
      },
      ...config,
    };
  }

  private initialize(): void {
    this.logger.info('Initializing game engine...');

    // Core systems
    this.world = new World(this.config.worldBounds);
    this.eventBus = new EventBus();
    this.entityManager = new EntityManager(this.eventBus);
    this.componentManager = new ComponentManager();
    this.systemManager = new SystemManager(this.entityManager, this.componentManager, this.eventBus);
    this.resourceManager = new ResourceManager();
    this.sceneManager = new SceneManager(this.world, this.entityManager);

    // Engine systems
    this.physicsEngine = new PhysicsEngine(this.config.physics, this.config.gravity);
    this.renderingEngine = new RenderingEngine(this.config.rendering);
    this.audioEngine = new AudioEngine();
    this.networkManager = new NetworkManager(this.config.networking);
    this.aiSystem = new AISystem();

    // Performance monitoring
    if (this.config.performance.monitoring) {
      this.performanceMonitor = new PerformanceMonitor();
    }

    // Register core systems
    this.registerCoreSystems();

    // Setup event listeners
    this.setupEventListeners();

    this.logger.info('Game engine initialized successfully');
  }

  private registerCoreSystems(): void {
    // Physics systems
    this.systemManager.registerSystem('PhysicsSystem', {
      update: (deltaTime: number) => {
        this.physicsEngine.update(deltaTime);
      },
      priority: 100,
    });

    // Rendering system
    this.systemManager.registerSystem('RenderingSystem', {
      update: (deltaTime: number) => {
        this.renderingEngine.render(this.world, this.entityManager, this.componentManager);
      },
      priority: 200,
    });

    // AI system
    this.systemManager.registerSystem('AISystem', {
      update: (deltaTime: number) => {
        this.aiSystem.update(deltaTime, this.world, this.entityManager);
      },
      priority: 50,
    });

    // Network system
    this.systemManager.registerSystem('NetworkSystem', {
      update: (deltaTime: number) => {
        this.networkManager.update(deltaTime);
      },
      priority: 10,
    });

    // Audio system
    this.systemManager.registerSystem('AudioSystem', {
      update: (deltaTime: number) => {
        this.audioEngine.update(deltaTime);
      },
      priority: 150,
    });
  }

  private setupEventListeners(): void {
    // Handle window resize
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.renderingEngine.handleResize();
      });

      // Handle visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });
    }

    // Performance adaptation
    this.eventBus.on('performance:low', () => {
      if (this.config.performance.adaptiveQuality) {
        this.adjustQualitySettings('low');
      }
    });

    this.eventBus.on('performance:normal', () => {
      if (this.config.performance.adaptiveQuality) {
        this.adjustQualitySettings('normal');
      }
    });
  }

  private adjustQualitySettings(quality: 'low' | 'normal' | 'high'): void {
    switch (quality) {
      case 'low':
        this.renderingEngine.setQuality({
          shadows: false,
          antialias: false,
          particleCount: 0.5,
          viewDistance: 0.7,
        });
        break;
      case 'normal':
        this.renderingEngine.setQuality({
          shadows: true,
          antialias: true,
          particleCount: 1.0,
          viewDistance: 1.0,
        });
        break;
      case 'high':
        this.renderingEngine.setQuality({
          shadows: true,
          antialias: true,
          particleCount: 1.5,
          viewDistance: 1.5,
        });
        break;
    }
  }

  public start(): void {
    if (this.isRunning) return;

    this.logger.info('Starting game engine...');
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  public stop(): void {
    if (!this.isRunning) return;

    this.logger.info('Stopping game engine...');
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public pause(): void {
    this.isRunning = false;
    this.logger.info('Game engine paused');
  }

  public resume(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.gameLoop();
      this.logger.info('Game engine resumed');
    }
  }

  private gameLoop(): void {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const frameTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Prevent spiral of death
    const cappedFrameTime = Math.min(frameTime, 0.25);
    this.accumulator += cappedFrameTime;

    // Performance monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.startFrame();
    }

    // Fixed timestep for physics
    let substeps = 0;
    while (this.accumulator >= this.config.fixedTimeStep && substeps < this.config.maxSubSteps) {
      this.systemManager.fixedUpdate(this.config.fixedTimeStep);
      this.accumulator -= this.config.fixedTimeStep;
      substeps++;
    }

    // Variable timestep for other systems
    this.systemManager.update(frameTime);

    // Interpolation for smooth rendering
    const interpolation = this.accumulator / this.config.fixedTimeStep;
    this.renderingEngine.setInterpolation(interpolation);

    // Performance monitoring
    if (this.performanceMonitor) {
      this.performanceMonitor.endFrame();
      const stats = this.performanceMonitor.getStats();
      
      if (stats.fps < 30) {
        this.eventBus.emit('performance:low', stats);
      } else if (stats.fps >= 50) {
        this.eventBus.emit('performance:normal', stats);
      }
    }

    // Schedule next frame
    this.frameId = requestAnimationFrame(() => this.gameLoop());
  }

  // Public API
  public createEntity(): number {
    return this.entityManager.createEntity();
  }

  public destroyEntity(entityId: number): void {
    this.entityManager.destroyEntity(entityId);
  }

  public addComponent<T>(entityId: number, componentType: string, data: T): void {
    this.componentManager.addComponent(entityId, componentType, data);
  }

  public getComponent<T>(entityId: number, componentType: string): T | null {
    return this.componentManager.getComponent<T>(entityId, componentType);
  }

  public removeComponent(entityId: number, componentType: string): void {
    this.componentManager.removeComponent(entityId, componentType);
  }

  public registerSystem(name: string, system: any): void {
    this.systemManager.registerSystem(name, system);
  }

  public loadScene(sceneName: string): Promise<void> {
    return this.sceneManager.loadScene(sceneName);
  }

  public getWorld(): World {
    return this.world;
  }

  public getEventBus(): EventBus {
    return this.eventBus;
  }

  public getNetworkManager(): NetworkManager {
    return this.networkManager;
  }

  public getPhysicsEngine(): PhysicsEngine {
    return this.physicsEngine;
  }

  public getRenderingEngine(): RenderingEngine {
    return this.renderingEngine;
  }

  public getAudioEngine(): AudioEngine {
    return this.audioEngine;
  }

  public getResourceManager(): ResourceManager {
    return this.resourceManager;
  }

  public getPerformanceStats(): any {
    return this.performanceMonitor?.getStats() || null;
  }

  public destroy(): void {
    this.stop();
    this.renderingEngine.destroy();
    this.audioEngine.destroy();
    this.physicsEngine.destroy();
    this.networkManager.disconnect();
    this.eventBus.removeAllListeners();
    this.logger.info('Game engine destroyed');
  }
}

// Export main engine class and utilities
export { World } from './core/World';
export { Entity } from './core/Entity';
export { Component } from './core/Component';
export { System } from './core/System';
export { EventBus } from './core/EventBus';
export { Vector3 } from './math/Vector3';
export { Quaternion } from './math/Quaternion';
export { Matrix4 } from './math/Matrix4';
export { MathUtils } from './math/MathUtils';

// Export component types
export * from './components';

// Export system types
export * from './systems';

// Create and export default engine instance
const engine = new GameEngine();
export default engine;