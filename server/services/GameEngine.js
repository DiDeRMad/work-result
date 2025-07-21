const EventEmitter = require('events');
const { performance } = require('perf_hooks');

class GameEngine extends EventEmitter {
  constructor() {
    super();
    
    this.isRunning = false;
    this.tickRate = 20; // 20 FPS
    this.tickInterval = 1000 / this.tickRate;
    this.lastTick = 0;
    this.deltaTime = 0;
    this.gameTime = 0;
    
    // Performance monitoring
    this.performanceMetrics = {
      averageTickTime: 0,
      maxTickTime: 0,
      minTickTime: Infinity,
      ticksPerSecond: 0,
      memoryUsage: 0,
      activePlayers: 0,
      activeEntities: 0
    };
    
    // Game systems
    this.systems = new Map();
    this.entities = new Map();
    this.players = new Map();
    this.npcs = new Map();
    this.objects = new Map();
    this.projectiles = new Map();
    this.effects = new Map();
    this.zones = new Map();
    
    // Update queues for optimization
    this.playerUpdateQueue = [];
    this.npcUpdateQueue = [];
    this.objectUpdateQueue = [];
    this.projectileUpdateQueue = [];
    this.effectUpdateQueue = [];
    
    // Spatial partitioning for efficient collision detection and area queries
    this.spatialGrid = new Map();
    this.gridSize = 100; // 100x100 units per grid cell
    
    // Event scheduling system
    this.scheduledEvents = [];
    this.eventIdCounter = 0;
    
    // Performance optimization settings
    this.updateDistances = {
      critical: 50,    // Always update within this distance
      high: 100,       // Update frequently
      medium: 200,     // Update moderately
      low: 500,        // Update occasionally
      disabled: 1000   // Update rarely or disable
    };
    
    // Combat and interaction ranges
    this.interactionRanges = {
      melee: 5,
      ranged: 50,
      magic: 75,
      sight: 200,
      chat: 100,
      trade: 10
    };
    
    this.initializeSystems();
    this.setupPerformanceMonitoring();
  }
  
  initializeSystems() {
    // Initialize core game systems
    this.registerSystem('physics', new PhysicsSystem(this));
    this.registerSystem('combat', new CombatEngineSystem(this));
    this.registerSystem('ai', new AISystem(this));
    this.registerSystem('spawning', new SpawningSystem(this));
    this.registerSystem('weather', new WeatherSystem(this));
    this.registerSystem('dayNight', new DayNightSystem(this));
    this.registerSystem('economy', new EconomyEngineSystem(this));
    this.registerSystem('events', new EventEngineSystem(this));
    this.registerSystem('quests', new QuestEngineSystem(this));
    this.registerSystem('skills', new SkillSystem(this));
    this.registerSystem('buffs', new BuffSystem(this));
    this.registerSystem('pets', new PetSystem(this));
    this.registerSystem('mounts', new MountSystem(this));
    this.registerSystem('housing', new HousingSystem(this));
    this.registerSystem('crafting', new CraftingEngineSystem(this));
    this.registerSystem('farming', new FarmingSystem(this));
    this.registerSystem('fishing', new FishingSystem(this));
    this.registerSystem('mining', new MiningSystem(this));
    this.registerSystem('magic', new MagicSystem(this));
    this.registerSystem('social', new SocialSystem(this));
    this.registerSystem('reputation', new ReputationSystem(this));
    this.registerSystem('seasons', new SeasonSystem(this));
    this.registerSystem('festivals', new FestivalSystem(this));
    this.registerSystem('dungeons', new DungeonEngineSystem(this));
    this.registerSystem('raids', new RaidEngineSystem(this));
    this.registerSystem('pvp', new PvPEngineSystem(this));
    this.registerSystem('guilds', new GuildEngineSystem(this));
    this.registerSystem('auction', new AuctionEngineSystem(this));
    this.registerSystem('mail', new MailSystem(this));
    this.registerSystem('lottery', new LotterySystem(this));
    this.registerSystem('casino', new CasinoSystem(this));
    this.registerSystem('racing', new RacingSystem(this));
    this.registerSystem('tournaments', new TournamentSystem(this));
    this.registerSystem('achievements', new AchievementEngineSystem(this));
    this.registerSystem('statistics', new StatisticsSystem(this));
    this.registerSystem('security', new SecurityEngineSystem(this));
    this.registerSystem('analytics', new AnalyticsEngineSystem(this));
    this.registerSystem('backup', new BackupSystem(this));
    this.registerSystem('moderation', new ModerationSystem(this));
    this.registerSystem('reporting', new ReportingSystem(this));
    this.registerSystem('tutorial', new TutorialSystem(this));
    this.registerSystem('localization', new LocalizationSystem(this));
    this.registerSystem('optimization', new OptimizationSystem(this));
    
    console.log(`🎮 Initialized ${this.systems.size} game systems`);
  }
  
  registerSystem(name, system) {
    this.systems.set(name, system);
    system.engine = this;
    
    if (typeof system.initialize === 'function') {
      system.initialize();
    }
  }
  
  getSystem(name) {
    return this.systems.get(name);
  }
  
  start() {
    if (this.isRunning) {
      console.log('🎮 Game engine is already running');
      return;
    }
    
    this.isRunning = true;
    this.lastTick = performance.now();
    
    // Start all systems
    for (const [name, system] of this.systems) {
      if (typeof system.start === 'function') {
        system.start();
      }
    }
    
    console.log('🚀 Game engine started');
    this.emit('started');
  }
  
  stop() {
    if (!this.isRunning) {
      console.log('🎮 Game engine is already stopped');
      return;
    }
    
    this.isRunning = false;
    
    // Stop all systems
    for (const [name, system] of this.systems) {
      if (typeof system.stop === 'function') {
        system.stop();
      }
    }
    
    console.log('🛑 Game engine stopped');
    this.emit('stopped');
  }
  
  update() {
    if (!this.isRunning) return;
    
    const now = performance.now();
    this.deltaTime = now - this.lastTick;
    this.gameTime += this.deltaTime;
    this.lastTick = now;
    
    const tickStartTime = performance.now();
    
    try {
      // Update core systems in order of priority
      this.updateSpatialGrid();
      this.updatePlayers();
      this.updateNPCs();
      this.updateObjects();
      this.updateProjectiles();
      this.updateEffects();
      this.updateZones();
      this.processScheduledEvents();
      
      // Update game systems
      this.updateSystems();
      
      // Process update queues
      this.processUpdateQueues();
      
      // Emit update event for external listeners
      this.emit('update', this.deltaTime);
      
    } catch (error) {
      console.error('❌ Error in game engine update:', error);
      this.emit('error', error);
    }
    
    // Update performance metrics
    this.updatePerformanceMetrics(performance.now() - tickStartTime);
  }
  
  updateSystems() {
    // Update systems in priority order
    const systemUpdateOrder = [
      'physics', 'ai', 'combat', 'skills', 'buffs', 'magic',
      'spawning', 'weather', 'dayNight', 'seasons',
      'economy', 'events', 'quests', 'achievements',
      'pets', 'mounts', 'housing', 'crafting',
      'farming', 'fishing', 'mining', 'social',
      'reputation', 'festivals', 'dungeons', 'raids',
      'pvp', 'guilds', 'auction', 'mail',
      'lottery', 'casino', 'racing', 'tournaments',
      'statistics', 'security', 'analytics',
      'moderation', 'tutorial', 'optimization'
    ];
    
    for (const systemName of systemUpdateOrder) {
      const system = this.systems.get(systemName);
      if (system && typeof system.update === 'function') {
        try {
          system.update(this.deltaTime);
        } catch (error) {
          console.error(`❌ Error updating system ${systemName}:`, error);
        }
      }
    }
  }
  
  updateSpatialGrid() {
    // Clear previous grid
    this.spatialGrid.clear();
    
    // Add all entities to spatial grid
    for (const [id, player] of this.players) {
      this.addToSpatialGrid(player, 'player');
    }
    
    for (const [id, npc] of this.npcs) {
      this.addToSpatialGrid(npc, 'npc');
    }
    
    for (const [id, object] of this.objects) {
      this.addToSpatialGrid(object, 'object');
    }
    
    for (const [id, projectile] of this.projectiles) {
      this.addToSpatialGrid(projectile, 'projectile');
    }
  }
  
  addToSpatialGrid(entity, type) {
    if (!entity.position) return;
    
    const gridX = Math.floor(entity.position.x / this.gridSize);
    const gridY = Math.floor(entity.position.y / this.gridSize);
    const gridKey = `${gridX},${gridY}`;
    
    if (!this.spatialGrid.has(gridKey)) {
      this.spatialGrid.set(gridKey, {
        players: [],
        npcs: [],
        objects: [],
        projectiles: []
      });
    }
    
    this.spatialGrid.get(gridKey)[type + 's'].push(entity);
  }
  
  getEntitiesInRange(position, range, types = ['players', 'npcs', 'objects']) {
    const entities = [];
    const gridRange = Math.ceil(range / this.gridSize);
    const centerGridX = Math.floor(position.x / this.gridSize);
    const centerGridY = Math.floor(position.y / this.gridSize);
    
    for (let x = centerGridX - gridRange; x <= centerGridX + gridRange; x++) {
      for (let y = centerGridY - gridRange; y <= centerGridY + gridRange; y++) {
        const gridKey = `${x},${y}`;
        const cell = this.spatialGrid.get(gridKey);
        
        if (cell) {
          for (const type of types) {
            for (const entity of cell[type]) {
              const distance = this.calculateDistance(position, entity.position);
              if (distance <= range) {
                entities.push({ entity, distance, type: type.slice(0, -1) });
              }
            }
          }
        }
      }
    }
    
    return entities.sort((a, b) => a.distance - b.distance);
  }
  
  updatePlayers() {
    for (const [id, player] of this.players) {
      try {
        this.updatePlayer(player);
      } catch (error) {
        console.error(`❌ Error updating player ${id}:`, error);
      }
    }
  }
  
  updatePlayer(player) {
    if (!player.isActive) return;
    
    // Update player physics
    this.updateEntityPhysics(player);
    
    // Update player stats and regeneration
    this.updatePlayerStats(player);
    
    // Update player buffs and debuffs
    this.updatePlayerBuffs(player);
    
    // Update player skills cooldowns
    this.updatePlayerSkills(player);
    
    // Update player interactions
    this.updatePlayerInteractions(player);
    
    // Update player visibility to others
    this.updatePlayerVisibility(player);
    
    // Mark for client update if needed
    if (player.needsUpdate) {
      this.playerUpdateQueue.push(player);
      player.needsUpdate = false;
    }
  }
  
  updatePlayerStats(player) {
    const regenRate = this.deltaTime / 1000; // Convert to seconds
    
    // Health regeneration
    if (player.stats.health < player.stats.maxHealth && !player.inCombat) {
      const healthRegen = player.stats.healthRegen || 5;
      player.stats.health = Math.min(
        player.stats.maxHealth,
        player.stats.health + (healthRegen * regenRate)
      );
      player.needsUpdate = true;
    }
    
    // Mana regeneration
    if (player.stats.mana < player.stats.maxMana) {
      const manaRegen = player.stats.manaRegen || 10;
      player.stats.mana = Math.min(
        player.stats.maxMana,
        player.stats.mana + (manaRegen * regenRate)
      );
      player.needsUpdate = true;
    }
    
    // Stamina regeneration
    if (player.stats.stamina < player.stats.maxStamina && !player.isRunning) {
      const staminaRegen = player.stats.staminaRegen || 15;
      player.stats.stamina = Math.min(
        player.stats.maxStamina,
        player.stats.stamina + (staminaRegen * regenRate)
      );
      player.needsUpdate = true;
    }
    
    // Update combat state
    if (player.inCombat && player.lastCombatTime) {
      if (this.gameTime - player.lastCombatTime > 10000) { // 10 seconds out of combat
        player.inCombat = false;
        player.needsUpdate = true;
      }
    }
  }
  
  updatePlayerBuffs(player) {
    if (!player.buffs || player.buffs.length === 0) return;
    
    const currentTime = this.gameTime;
    let buffsChanged = false;
    
    for (let i = player.buffs.length - 1; i >= 0; i--) {
      const buff = player.buffs[i];
      
      // Check if buff has expired
      if (buff.expiresAt && currentTime >= buff.expiresAt) {
        this.removeBuff(player, i);
        buffsChanged = true;
        continue;
      }
      
      // Apply periodic effects
      if (buff.periodicEffect && buff.nextTick && currentTime >= buff.nextTick) {
        this.applyBuffEffect(player, buff);
        buff.nextTick = currentTime + (buff.tickInterval || 1000);
        buffsChanged = true;
      }
    }
    
    if (buffsChanged) {
      this.recalculatePlayerStats(player);
      player.needsUpdate = true;
    }
  }
  
  updatePlayerSkills(player) {
    if (!player.skills || !player.skillCooldowns) return;
    
    const currentTime = this.gameTime;
    let cooldownsChanged = false;
    
    for (const [skillId, cooldownEnd] of Object.entries(player.skillCooldowns)) {
      if (currentTime >= cooldownEnd) {
        delete player.skillCooldowns[skillId];
        cooldownsChanged = true;
      }
    }
    
    if (cooldownsChanged) {
      player.needsUpdate = true;
    }
  }
  
  updateNPCs() {
    for (const [id, npc] of this.npcs) {
      try {
        this.updateNPC(npc);
      } catch (error) {
        console.error(`❌ Error updating NPC ${id}:`, error);
      }
    }
  }
  
  updateNPC(npc) {
    if (!npc.isActive) return;
    
    // Update NPC AI
    if (npc.ai && typeof npc.ai.update === 'function') {
      npc.ai.update(this.deltaTime);
    }
    
    // Update NPC physics
    this.updateEntityPhysics(npc);
    
    // Update NPC stats
    this.updateNPCStats(npc);
    
    // Update NPC behavior
    this.updateNPCBehavior(npc);
    
    // Mark for update if needed
    if (npc.needsUpdate) {
      this.npcUpdateQueue.push(npc);
      npc.needsUpdate = false;
    }
  }
  
  updateObjects() {
    for (const [id, object] of this.objects) {
      try {
        this.updateObject(object);
      } catch (error) {
        console.error(`❌ Error updating object ${id}:`, error);
      }
    }
  }
  
  updateProjectiles() {
    for (const [id, projectile] of this.projectiles) {
      try {
        this.updateProjectile(projectile);
      } catch (error) {
        console.error(`❌ Error updating projectile ${id}:`, error);
        this.removeProjectile(id);
      }
    }
  }
  
  updateProjectile(projectile) {
    // Update projectile position
    if (projectile.velocity) {
      const deltaSeconds = this.deltaTime / 1000;
      projectile.position.x += projectile.velocity.x * deltaSeconds;
      projectile.position.y += projectile.velocity.y * deltaSeconds;
      projectile.position.z = (projectile.position.z || 0) + (projectile.velocity.z || 0) * deltaSeconds;
    }
    
    // Check collision with targets
    this.checkProjectileCollisions(projectile);
    
    // Check if projectile has exceeded its range or lifetime
    if (projectile.maxRange && projectile.startPosition) {
      const distanceTraveled = this.calculateDistance(projectile.position, projectile.startPosition);
      if (distanceTraveled >= projectile.maxRange) {
        this.removeProjectile(projectile.id);
        return;
      }
    }
    
    if (projectile.lifetime && this.gameTime >= projectile.createdAt + projectile.lifetime) {
      this.removeProjectile(projectile.id);
      return;
    }
    
    projectile.needsUpdate = true;
  }
  
  checkProjectileCollisions(projectile) {
    const nearbyEntities = this.getEntitiesInRange(
      projectile.position,
      projectile.collisionRadius || 5,
      ['players', 'npcs', 'objects']
    );
    
    for (const { entity, type } of nearbyEntities) {
      if (entity.id === projectile.sourceId) continue; // Don't hit the source
      
      if (this.checkCollision(projectile, entity)) {
        this.handleProjectileCollision(projectile, entity, type);
        return; // Projectile is destroyed on first collision
      }
    }
  }
  
  updateEffects() {
    for (const [id, effect] of this.effects) {
      try {
        this.updateEffect(effect);
      } catch (error) {
        console.error(`❌ Error updating effect ${id}:`, error);
        this.removeEffect(id);
      }
    }
  }
  
  updateEffect(effect) {
    // Check if effect has expired
    if (effect.duration && this.gameTime >= effect.createdAt + effect.duration) {
      this.removeEffect(effect.id);
      return;
    }
    
    // Update effect animation/state
    if (effect.update && typeof effect.update === 'function') {
      effect.update(this.deltaTime);
    }
    
    // Apply area effects
    if (effect.areaOfEffect && effect.position) {
      this.processAreaEffect(effect);
    }
    
    effect.needsUpdate = true;
  }
  
  processScheduledEvents() {
    const currentTime = this.gameTime;
    
    for (let i = this.scheduledEvents.length - 1; i >= 0; i--) {
      const event = this.scheduledEvents[i];
      
      if (currentTime >= event.executeAt) {
        try {
          event.callback();
        } catch (error) {
          console.error('❌ Error executing scheduled event:', error);
        }
        
        this.scheduledEvents.splice(i, 1);
      }
    }
  }
  
  scheduleEvent(callback, delay) {
    const event = {
      id: ++this.eventIdCounter,
      callback,
      executeAt: this.gameTime + delay
    };
    
    this.scheduledEvents.push(event);
    return event.id;
  }
  
  cancelScheduledEvent(eventId) {
    const index = this.scheduledEvents.findIndex(event => event.id === eventId);
    if (index !== -1) {
      this.scheduledEvents.splice(index, 1);
      return true;
    }
    return false;
  }
  
  addPlayer(playerId, playerData) {
    const player = {
      id: playerId,
      ...playerData,
      isActive: true,
      needsUpdate: true,
      lastUpdate: this.gameTime,
      inCombat: false,
      lastCombatTime: 0,
      buffs: playerData.buffs || [],
      skillCooldowns: {},
      position: playerData.position || { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 },
      direction: playerData.direction || 0
    };
    
    this.players.set(playerId, player);
    this.entities.set(playerId, player);
    
    console.log(`🎮 Player ${playerId} added to game engine`);
    this.emit('playerAdded', player);
    
    return player;
  }
  
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (player) {
      this.players.delete(playerId);
      this.entities.delete(playerId);
      
      console.log(`🎮 Player ${playerId} removed from game engine`);
      this.emit('playerRemoved', player);
    }
  }
  
  getPlayer(playerId) {
    return this.players.get(playerId);
  }
  
  addNPC(npcId, npcData) {
    const npc = {
      id: npcId,
      ...npcData,
      isActive: true,
      needsUpdate: true,
      lastUpdate: this.gameTime,
      position: npcData.position || { x: 0, y: 0, z: 0 },
      velocity: { x: 0, y: 0, z: 0 }
    };
    
    this.npcs.set(npcId, npc);
    this.entities.set(npcId, npc);
    
    this.emit('npcAdded', npc);
    return npc;
  }
  
  removeNPC(npcId) {
    const npc = this.npcs.get(npcId);
    if (npc) {
      this.npcs.delete(npcId);
      this.entities.delete(npcId);
      this.emit('npcRemoved', npc);
    }
  }
  
  addProjectile(projectileData) {
    const projectile = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...projectileData,
      createdAt: this.gameTime,
      needsUpdate: true,
      startPosition: { ...projectileData.position }
    };
    
    this.projectiles.set(projectile.id, projectile);
    this.emit('projectileAdded', projectile);
    
    return projectile;
  }
  
  removeProjectile(projectileId) {
    const projectile = this.projectiles.get(projectileId);
    if (projectile) {
      this.projectiles.delete(projectileId);
      this.emit('projectileRemoved', projectile);
    }
  }
  
  addEffect(effectData) {
    const effect = {
      id: `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...effectData,
      createdAt: this.gameTime,
      needsUpdate: true
    };
    
    this.effects.set(effect.id, effect);
    this.emit('effectAdded', effect);
    
    return effect;
  }
  
  removeEffect(effectId) {
    const effect = this.effects.get(effectId);
    if (effect) {
      this.effects.delete(effectId);
      this.emit('effectRemoved', effect);
    }
  }
  
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = (pos1.z || 0) - (pos2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  checkCollision(entity1, entity2) {
    const distance = this.calculateDistance(entity1.position, entity2.position);
    const combinedRadius = (entity1.collisionRadius || 1) + (entity2.collisionRadius || 1);
    return distance <= combinedRadius;
  }
  
  processUpdateQueues() {
    // Emit batched updates for performance
    if (this.playerUpdateQueue.length > 0) {
      this.emit('playersUpdated', [...this.playerUpdateQueue]);
      this.playerUpdateQueue.length = 0;
    }
    
    if (this.npcUpdateQueue.length > 0) {
      this.emit('npcsUpdated', [...this.npcUpdateQueue]);
      this.npcUpdateQueue.length = 0;
    }
    
    if (this.objectUpdateQueue.length > 0) {
      this.emit('objectsUpdated', [...this.objectUpdateQueue]);
      this.objectUpdateQueue.length = 0;
    }
    
    if (this.projectileUpdateQueue.length > 0) {
      this.emit('projectilesUpdated', [...this.projectileUpdateQueue]);
      this.projectileUpdateQueue.length = 0;
    }
    
    if (this.effectUpdateQueue.length > 0) {
      this.emit('effectsUpdated', [...this.effectUpdateQueue]);
      this.effectUpdateQueue.length = 0;
    }
  }
  
  updatePerformanceMetrics(tickTime) {
    this.performanceMetrics.averageTickTime = 
      (this.performanceMetrics.averageTickTime * 0.9) + (tickTime * 0.1);
    
    this.performanceMetrics.maxTickTime = Math.max(
      this.performanceMetrics.maxTickTime,
      tickTime
    );
    
    this.performanceMetrics.minTickTime = Math.min(
      this.performanceMetrics.minTickTime,
      tickTime
    );
    
    this.performanceMetrics.activePlayers = this.players.size;
    this.performanceMetrics.activeEntities = this.entities.size;
    this.performanceMetrics.memoryUsage = process.memoryUsage().heapUsed;
  }
  
  setupPerformanceMonitoring() {
    setInterval(() => {
      // Reset performance counters
      this.performanceMetrics.maxTickTime = 0;
      this.performanceMetrics.minTickTime = Infinity;
      
      // Log performance if there are issues
      if (this.performanceMetrics.averageTickTime > 50) { // Over 50ms
        console.warn(`⚠️ High average tick time: ${this.performanceMetrics.averageTickTime.toFixed(2)}ms`);
      }
      
      // Emit performance metrics for monitoring
      this.emit('performanceUpdate', { ...this.performanceMetrics });
    }, 30000); // Every 30 seconds
  }
  
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  
  // Helper methods for game systems
  updateEntityPhysics(entity) {
    if (!entity.velocity) return;
    
    const deltaSeconds = this.deltaTime / 1000;
    
    // Apply velocity to position
    entity.position.x += entity.velocity.x * deltaSeconds;
    entity.position.y += entity.velocity.y * deltaSeconds;
    entity.position.z = (entity.position.z || 0) + (entity.velocity.z || 0) * deltaSeconds;
    
    // Apply friction
    const friction = entity.friction || 0.9;
    entity.velocity.x *= friction;
    entity.velocity.y *= friction;
    entity.velocity.z = (entity.velocity.z || 0) * friction;
    
    // Stop very small velocities
    if (Math.abs(entity.velocity.x) < 0.1) entity.velocity.x = 0;
    if (Math.abs(entity.velocity.y) < 0.1) entity.velocity.y = 0;
    if (Math.abs(entity.velocity.z || 0) < 0.1) entity.velocity.z = 0;
  }
  
  updatePlayerVisibility(player) {
    // Determine which players should see this player
    const nearbyPlayers = this.getEntitiesInRange(
      player.position,
      this.updateDistances.high,
      ['players']
    );
    
    player.visibleTo = nearbyPlayers.map(p => p.entity.id);
  }
  
  updatePlayerInteractions(player) {
    // Check for nearby interactive objects and NPCs
    const nearbyEntities = this.getEntitiesInRange(
      player.position,
      this.interactionRanges.chat,
      ['npcs', 'objects']
    );
    
    player.nearbyInteractions = nearbyEntities.filter(e => e.entity.interactive);
  }
  
  updateNPCStats(npc) {
    // Similar to player stats but for NPCs
    const regenRate = this.deltaTime / 1000;
    
    if (npc.stats && npc.stats.health < npc.stats.maxHealth && !npc.inCombat) {
      const healthRegen = npc.stats.healthRegen || 10;
      npc.stats.health = Math.min(
        npc.stats.maxHealth,
        npc.stats.health + (healthRegen * regenRate)
      );
      npc.needsUpdate = true;
    }
  }
  
  updateNPCBehavior(npc) {
    // Update NPC behavior patterns
    if (npc.behavior && typeof npc.behavior.update === 'function') {
      npc.behavior.update(this.deltaTime);
    }
    
    // Check for nearby players for interaction
    const nearbyPlayers = this.getEntitiesInRange(
      npc.position,
      npc.detectionRange || 50,
      ['players']
    );
    
    if (nearbyPlayers.length > 0 && !npc.nearbyPlayers) {
      npc.nearbyPlayers = nearbyPlayers;
      npc.needsUpdate = true;
    }
  }
  
  updateObject(object) {
    // Update object state (e.g., doors, chests, interactive objects)
    if (object.updateFunction && typeof object.updateFunction === 'function') {
      object.updateFunction(this.deltaTime);
    }
    
    if (object.needsUpdate) {
      this.objectUpdateQueue.push(object);
      object.needsUpdate = false;
    }
  }
  
  handleProjectileCollision(projectile, target, targetType) {
    // Apply projectile damage/effects
    if (projectile.damage && target.stats) {
      const damage = this.calculateDamage(projectile, target);
      target.stats.health -= damage;
      
      if (target.stats.health <= 0 && targetType === 'npc') {
        this.handleNPCDeath(target, projectile.sourceId);
      }
    }
    
    // Create impact effect
    if (projectile.impactEffect) {
      this.addEffect({
        type: projectile.impactEffect,
        position: { ...projectile.position },
        duration: 1000
      });
    }
    
    // Remove projectile
    this.removeProjectile(projectile.id);
    
    this.emit('projectileHit', {
      projectile,
      target,
      targetType
    });
  }
  
  calculateDamage(source, target) {
    // Basic damage calculation - can be extended
    let damage = source.damage || 0;
    
    // Apply target defense
    if (target.stats && target.stats.defense) {
      damage = Math.max(1, damage - target.stats.defense);
    }
    
    // Add randomness
    damage = Math.floor(damage * (0.8 + Math.random() * 0.4));
    
    return damage;
  }
  
  processAreaEffect(effect) {
    const affectedEntities = this.getEntitiesInRange(
      effect.position,
      effect.areaOfEffect,
      ['players', 'npcs']
    );
    
    for (const { entity, type } of affectedEntities) {
      if (effect.applyEffect && typeof effect.applyEffect === 'function') {
        effect.applyEffect(entity, type);
      }
    }
  }
  
  // System management methods
  enableSystem(systemName) {
    const system = this.systems.get(systemName);
    if (system) {
      system.enabled = true;
      console.log(`🎮 System ${systemName} enabled`);
    }
  }
  
  disableSystem(systemName) {
    const system = this.systems.get(systemName);
    if (system) {
      system.enabled = false;
      console.log(`🎮 System ${systemName} disabled`);
    }
  }
  
  getGameState() {
    return {
      isRunning: this.isRunning,
      gameTime: this.gameTime,
      players: this.players.size,
      npcs: this.npcs.size,
      objects: this.objects.size,
      projectiles: this.projectiles.size,
      effects: this.effects.size,
      performance: this.performanceMetrics
    };
  }
}

// Basic system classes that can be extended
class PhysicsSystem {
  constructor(engine) {
    this.engine = engine;
    this.enabled = true;
  }
  
  update(deltaTime) {
    if (!this.enabled) return;
    // Physics calculations handled in main engine
  }
}

class CombatEngineSystem {
  constructor(engine) {
    this.engine = engine;
    this.enabled = true;
  }
  
  update(deltaTime) {
    if (!this.enabled) return;
    // Combat system logic
  }
}

class AISystem {
  constructor(engine) {
    this.engine = engine;
    this.enabled = true;
  }
  
  update(deltaTime) {
    if (!this.enabled) return;
    // AI behavior processing
  }
}

// Export additional system classes to be implemented
class SpawningSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class WeatherSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class DayNightSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class EconomyEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class EventEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class QuestEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class SkillSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class BuffSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class PetSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class MountSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class HousingSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class CraftingEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class FarmingSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class FishingSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class MiningSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class MagicSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class SocialSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class ReputationSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class SeasonSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class FestivalSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class DungeonEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class RaidEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class PvPEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class GuildEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class AuctionEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class MailSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class LotterySystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class CasinoSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class RacingSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class TournamentSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class AchievementEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class StatisticsSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class SecurityEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class AnalyticsEngineSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class BackupSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class ModerationSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class ReportingSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class TutorialSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class LocalizationSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }
class OptimizationSystem { constructor(engine) { this.engine = engine; this.enabled = true; } }

module.exports = GameEngine;