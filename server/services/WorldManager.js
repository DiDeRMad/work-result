const mongoose = require('mongoose');
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

// World Region Schema
const RegionSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['city', 'forest', 'mountain', 'desert', 'ocean', 'dungeon', 'plains', 'swamp', 'tundra', 'volcano'], required: true },
  level: { type: Number, default: 1 },
  boundaries: {
    minX: { type: Number, required: true },
    maxX: { type: Number, required: true },
    minY: { type: Number, required: true },
    maxY: { type: Number, required: true },
    minZ: { type: Number, default: 0 },
    maxZ: { type: Number, default: 100 }
  },
  connections: [{
    regionId: String,
    connectionType: { type: String, enum: ['portal', 'path', 'teleport', 'bridge', 'tunnel'] },
    position: {
      x: Number,
      y: Number,
      z: Number
    },
    requirements: mongoose.Schema.Types.Mixed
  }],
  terrain: {
    heightMap: [Number],
    biome: String,
    climate: String,
    vegetation: Number,
    waterLevel: Number,
    rockiness: Number,
    fertility: Number
  },
  weather: {
    currentWeather: { type: String, default: 'clear' },
    temperature: { type: Number, default: 20 },
    humidity: { type: Number, default: 50 },
    windSpeed: { type: Number, default: 0 },
    windDirection: { type: Number, default: 0 },
    visibility: { type: Number, default: 100 }
  },
  dayNight: {
    timeOfDay: { type: Number, default: 12 }, // 0-24 hours
    dayLength: { type: Number, default: 24 }, // minutes
    currentPhase: { type: String, default: 'day' }
  },
  pvpEnabled: { type: Boolean, default: false },
  safeZone: { type: Boolean, default: false },
  allowBuilding: { type: Boolean, default: false },
  maxPlayers: { type: Number, default: 100 },
  description: String,
  lore: String,
  questHubs: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// NPC Schema
const NPCSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['merchant', 'questgiver', 'guard', 'enemy', 'boss', 'critter', 'companion'], required: true },
  race: String,
  class: String,
  level: { type: Number, default: 1 },
  
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, default: 0 },
    regionId: { type: String, required: true }
  },
  
  stats: {
    health: { type: Number, default: 100 },
    maxHealth: { type: Number, default: 100 },
    mana: { type: Number, default: 50 },
    maxMana: { type: Number, default: 50 },
    attack: { type: Number, default: 10 },
    defense: { type: Number, default: 5 },
    movementSpeed: { type: Number, default: 50 },
    detectionRange: { type: Number, default: 50 },
    aggroRange: { type: Number, default: 25 }
  },
  
  behavior: {
    aiType: { type: String, enum: ['passive', 'aggressive', 'defensive', 'patrol', 'guard', 'merchant'], default: 'passive' },
    patrolPath: [{ x: Number, y: Number, z: Number }],
    spawnPoint: { x: Number, y: Number, z: Number },
    respawnTime: { type: Number, default: 300000 }, // 5 minutes in ms
    wanderRadius: { type: Number, default: 10 }
  },
  
  dialogue: [{
    id: String,
    text: String,
    conditions: mongoose.Schema.Types.Mixed,
    responses: [{
      text: String,
      action: String,
      conditions: mongoose.Schema.Types.Mixed
    }]
  }],
  
  inventory: [{
    itemId: String,
    name: String,
    quantity: Number,
    dropChance: { type: Number, default: 0 }
  }],
  
  quests: [String], // Quest IDs this NPC can give
  
  abilities: [{
    id: String,
    name: String,
    type: String,
    cooldown: Number,
    damage: Number,
    effects: mongoose.Schema.Types.Mixed
  }],
  
  appearance: {
    model: String,
    texture: String,
    size: { type: Number, default: 1 },
    color: String
  },
  
  faction: String,
  reputation: mongoose.Schema.Types.Mixed,
  
  isAlive: { type: Boolean, default: true },
  lastDeathTime: Date,
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// World Object Schema
const WorldObjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['chest', 'door', 'portal', 'tree', 'rock', 'building', 'decoration', 'resource', 'trap'], required: true },
  
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, default: 0 },
    regionId: { type: String, required: true },
    rotation: { type: Number, default: 0 }
  },
  
  properties: {
    interactive: { type: Boolean, default: false },
    solid: { type: Boolean, default: true },
    destructible: { type: Boolean, default: false },
    health: Number,
    maxHealth: Number
  },
  
  inventory: [{
    itemId: String,
    name: String,
    quantity: Number,
    respawnTime: Number
  }],
  
  state: {
    isOpen: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
    keyRequired: String,
    lastInteracted: Date,
    interactedBy: String
  },
  
  respawn: {
    enabled: { type: Boolean, default: false },
    time: Number,
    lastRespawn: Date
  },
  
  effects: [{
    type: String,
    radius: Number,
    strength: Number,
    duration: Number
  }],
  
  appearance: {
    model: String,
    texture: String,
    size: { x: Number, y: Number, z: Number },
    color: String
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Region = mongoose.model('Region', RegionSchema);
const NPC = mongoose.model('NPC', NPCSchema);
const WorldObject = mongoose.model('WorldObject', WorldObjectSchema);

class WorldManager extends EventEmitter {
  constructor() {
    super();
    
    // World state
    this.regions = new Map();
    this.npcs = new Map();
    this.worldObjects = new Map();
    this.activePlayers = new Map(); // regionId -> Set of playerIds
    
    // Terrain generation
    this.noiseGenerator = new NoiseGenerator();
    this.biomeGenerator = new BiomeGenerator();
    
    // Weather system
    this.weatherSystem = new WeatherSystem();
    
    // Day/Night cycle
    this.timeSystem = new TimeSystem();
    
    // World updates queue
    this.updateQueue = [];
    
    // Performance optimization
    this.updateTickCount = 0;
    this.maxUpdatesPerTick = 100;
    
    // Event scheduling
    this.scheduledEvents = new Map();
    
    this.initialize();
  }
  
  async initialize() {
    try {
      console.log('🌍 Initializing World Manager...');
      
      // Load existing regions from database
      await this.loadRegions();
      
      // Load NPCs
      await this.loadNPCs();
      
      // Load world objects
      await this.loadWorldObjects();
      
      // Initialize weather system
      this.weatherSystem.initialize(this);
      
      // Initialize time system
      this.timeSystem.initialize(this);
      
      // Generate missing world data
      await this.generateMissingContent();
      
      console.log(`🌍 World Manager initialized with ${this.regions.size} regions, ${this.npcs.size} NPCs, and ${this.worldObjects.size} objects`);
      
    } catch (error) {
      console.error('❌ Error initializing World Manager:', error);
    }
  }
  
  async loadRegions() {
    try {
      const regions = await Region.find({});
      
      for (const region of regions) {
        this.regions.set(region.id, region);
        this.activePlayers.set(region.id, new Set());
      }
      
      // Create default regions if none exist
      if (regions.length === 0) {
        await this.createDefaultRegions();
      }
      
    } catch (error) {
      console.error('❌ Error loading regions:', error);
    }
  }
  
  async loadNPCs() {
    try {
      const npcs = await NPC.find({});
      
      for (const npc of npcs) {
        this.npcs.set(npc.id, npc);
      }
      
    } catch (error) {
      console.error('❌ Error loading NPCs:', error);
    }
  }
  
  async loadWorldObjects() {
    try {
      const objects = await WorldObject.find({});
      
      for (const object of objects) {
        this.worldObjects.set(object.id, object);
      }
      
    } catch (error) {
      console.error('❌ Error loading world objects:', error);
    }
  }
  
  async createDefaultRegions() {
    const defaultRegions = [
      {
        id: 'starter_town',
        name: 'Starter Town',
        type: 'city',
        level: 1,
        boundaries: { minX: 0, maxX: 200, minY: 0, maxY: 200, minZ: 0, maxZ: 50 },
        safeZone: true,
        pvpEnabled: false,
        description: 'A peaceful starting town for new adventurers',
        connections: [
          { regionId: 'grasslands', connectionType: 'path', position: { x: 200, y: 100, z: 0 } }
        ]
      },
      {
        id: 'grasslands',
        name: 'Peaceful Grasslands',
        type: 'plains',
        level: 1,
        boundaries: { minX: 200, maxX: 600, minY: 0, maxY: 400, minZ: 0, maxZ: 30 },
        safeZone: false,
        pvpEnabled: false,
        description: 'Rolling hills covered in green grass, perfect for beginners',
        connections: [
          { regionId: 'starter_town', connectionType: 'path', position: { x: 200, y: 100, z: 0 } },
          { regionId: 'dark_forest', connectionType: 'path', position: { x: 600, y: 200, z: 0 } }
        ]
      },
      {
        id: 'dark_forest',
        name: 'Dark Forest',
        type: 'forest',
        level: 5,
        boundaries: { minX: 600, maxX: 1000, minY: 0, maxY: 400, minZ: 0, maxZ: 60 },
        safeZone: false,
        pvpEnabled: true,
        description: 'A mysterious forest filled with dangerous creatures',
        connections: [
          { regionId: 'grasslands', connectionType: 'path', position: { x: 600, y: 200, z: 0 } },
          { regionId: 'mountain_pass', connectionType: 'path', position: { x: 1000, y: 100, z: 0 } }
        ]
      },
      {
        id: 'mountain_pass',
        name: 'Mountain Pass',
        type: 'mountain',
        level: 10,
        boundaries: { minX: 1000, maxX: 1200, minY: 0, maxY: 200, minZ: 0, maxZ: 150 },
        safeZone: false,
        pvpEnabled: true,
        description: 'Treacherous mountain paths with stunning views',
        connections: [
          { regionId: 'dark_forest', connectionType: 'path', position: { x: 1000, y: 100, z: 0 } },
          { regionId: 'dragon_peaks', connectionType: 'path', position: { x: 1200, y: 100, z: 50 } }
        ]
      },
      {
        id: 'dragon_peaks',
        name: 'Dragon Peaks',
        type: 'mountain',
        level: 50,
        boundaries: { minX: 1200, maxX: 1600, minY: 0, maxY: 400, minZ: 50, maxZ: 300 },
        safeZone: false,
        pvpEnabled: true,
        description: 'The highest peaks where ancient dragons once soared',
        connections: [
          { regionId: 'mountain_pass', connectionType: 'path', position: { x: 1200, y: 100, z: 50 } }
        ]
      },
      {
        id: 'human_city',
        name: 'Capital City',
        type: 'city',
        level: 1,
        boundaries: { minX: 100, maxX: 300, minY: 100, maxY: 300, minZ: 0, maxZ: 100 },
        safeZone: true,
        pvpEnabled: false,
        description: 'The grand capital city of the human kingdom',
        connections: [
          { regionId: 'starter_town', connectionType: 'portal', position: { x: 200, y: 200, z: 0 } }
        ]
      },
      {
        id: 'elf_forest',
        name: 'Elven Sanctuary',
        type: 'forest',
        level: 1,
        boundaries: { minX: 200, maxX: 400, minY: 50, maxY: 250, minZ: 0, maxZ: 80 },
        safeZone: true,
        pvpEnabled: false,
        description: 'The mystical home of the elves, protected by ancient magic',
        connections: [
          { regionId: 'starter_town', connectionType: 'portal', position: { x: 150, y: 150, z: 0 } }
        ]
      },
      {
        id: 'dwarf_mountains',
        name: 'Dwarven Halls',
        type: 'mountain',
        level: 1,
        boundaries: { minX: 50, maxX: 250, minY: 200, maxY: 400, minZ: -50, maxZ: 50 },
        safeZone: true,
        pvpEnabled: false,
        description: 'The underground halls of the dwarven clans',
        connections: [
          { regionId: 'starter_town', connectionType: 'tunnel', position: { x: 100, y: 200, z: -10 } }
        ]
      }
    ];
    
    for (const regionData of defaultRegions) {
      const region = new Region(regionData);
      await region.save();
      this.regions.set(region.id, region);
      this.activePlayers.set(region.id, new Set());
    }
    
    console.log('🌍 Created default regions');
  }
  
  async generateMissingContent() {
    // Generate terrain for regions that don't have it
    for (const [regionId, region] of this.regions) {
      if (!region.terrain.heightMap || region.terrain.heightMap.length === 0) {
        await this.generateTerrain(regionId);
      }
    }
    
    // Generate NPCs for regions that need them
    await this.generateNPCs();
    
    // Generate world objects
    await this.generateWorldObjects();
  }
  
  async generateTerrain(regionId) {
    const region = this.regions.get(regionId);
    if (!region) return;
    
    const width = region.boundaries.maxX - region.boundaries.minX;
    const height = region.boundaries.maxY - region.boundaries.minY;
    
    // Generate height map using noise
    const heightMap = this.noiseGenerator.generateHeightMap(
      width / 10, // Resolution
      height / 10,
      region.type
    );
    
    // Generate biome data
    const biomeData = this.biomeGenerator.generateBiome(region.type);
    
    region.terrain = {
      heightMap: heightMap,
      biome: biomeData.biome,
      climate: biomeData.climate,
      vegetation: biomeData.vegetation,
      waterLevel: biomeData.waterLevel,
      rockiness: biomeData.rockiness,
      fertility: biomeData.fertility
    };
    
    await Region.updateOne({ id: regionId }, { terrain: region.terrain });
    console.log(`🌍 Generated terrain for region: ${region.name}`);
  }
  
  async generateNPCs() {
    const npcTemplates = [
      // Starter Town NPCs
      {
        name: 'Mayor Thompson',
        type: 'questgiver',
        regionId: 'starter_town',
        position: { x: 100, y: 100, z: 0 },
        level: 5,
        dialogue: [
          {
            id: 'greeting',
            text: 'Welcome to our humble town, adventurer! I have some tasks that could use your help.',
            responses: [
              { text: 'What kind of tasks?', action: 'show_quests' },
              { text: 'Maybe later.', action: 'close' }
            ]
          }
        ],
        quests: ['starter_delivery', 'rat_problem']
      },
      {
        name: 'Blacksmith Gareth',
        type: 'merchant',
        regionId: 'starter_town',
        position: { x: 80, y: 120, z: 0 },
        level: 10,
        inventory: [
          { itemId: 'iron_sword', name: 'Iron Sword', quantity: 5 },
          { itemId: 'leather_armor', name: 'Leather Armor', quantity: 3 },
          { itemId: 'health_potion', name: 'Health Potion', quantity: 20 }
        ]
      },
      {
        name: 'Town Guard',
        type: 'guard',
        regionId: 'starter_town',
        position: { x: 200, y: 100, z: 0 },
        level: 15,
        behavior: { aiType: 'guard', wanderRadius: 5 }
      },
      
      // Grasslands NPCs
      {
        name: 'Rabbit',
        type: 'critter',
        regionId: 'grasslands',
        position: { x: 300, y: 200, z: 0 },
        level: 1,
        behavior: { aiType: 'passive', wanderRadius: 20 },
        stats: { health: 10, maxHealth: 10, attack: 1, defense: 0 }
      },
      {
        name: 'Wild Boar',
        type: 'enemy',
        regionId: 'grasslands',
        position: { x: 400, y: 150, z: 0 },
        level: 3,
        behavior: { aiType: 'aggressive', aggroRange: 30, wanderRadius: 15 },
        stats: { health: 50, maxHealth: 50, attack: 8, defense: 2 }
      },
      
      // Dark Forest NPCs
      {
        name: 'Forest Wolf',
        type: 'enemy',
        regionId: 'dark_forest',
        position: { x: 700, y: 200, z: 0 },
        level: 8,
        behavior: { aiType: 'aggressive', aggroRange: 40, wanderRadius: 25 },
        stats: { health: 120, maxHealth: 120, attack: 15, defense: 5 }
      },
      {
        name: 'Dark Treant',
        type: 'boss',
        regionId: 'dark_forest',
        position: { x: 800, y: 300, z: 0 },
        level: 15,
        behavior: { aiType: 'aggressive', aggroRange: 50, wanderRadius: 10 },
        stats: { health: 500, maxHealth: 500, attack: 30, defense: 15 }
      }
    ];
    
    for (const template of npcTemplates) {
      // Check if NPC already exists
      const existingNPC = Array.from(this.npcs.values()).find(npc => 
        npc.name === template.name && npc.position.regionId === template.regionId
      );
      
      if (!existingNPC) {
        const npcData = {
          id: uuidv4(),
          ...template,
          stats: {
            health: template.stats?.health || 100,
            maxHealth: template.stats?.maxHealth || 100,
            mana: template.stats?.mana || 50,
            maxMana: template.stats?.maxMana || 50,
            attack: template.stats?.attack || 10,
            defense: template.stats?.defense || 5,
            movementSpeed: template.stats?.movementSpeed || 50,
            detectionRange: template.stats?.detectionRange || 50,
            aggroRange: template.stats?.aggroRange || 25
          },
          behavior: {
            aiType: template.behavior?.aiType || 'passive',
            wanderRadius: template.behavior?.wanderRadius || 10,
            aggroRange: template.behavior?.aggroRange || 25,
            spawnPoint: { ...template.position }
          }
        };
        
        const npc = new NPC(npcData);
        await npc.save();
        this.npcs.set(npc.id, npc);
      }
    }
    
    console.log(`🌍 Generated ${npcTemplates.length} NPCs`);
  }
  
  async generateWorldObjects() {
    const objectTemplates = [
      // Starter Town Objects
      {
        name: 'Town Well',
        type: 'decoration',
        regionId: 'starter_town',
        position: { x: 100, y: 100, z: 0 },
        properties: { interactive: true, solid: true }
      },
      {
        name: 'Treasure Chest',
        type: 'chest',
        regionId: 'starter_town',
        position: { x: 150, y: 150, z: 0 },
        properties: { interactive: true, solid: true },
        inventory: [
          { itemId: 'gold_coin', name: 'Gold Coin', quantity: 50 },
          { itemId: 'health_potion', name: 'Health Potion', quantity: 2 }
        ],
        state: { isLocked: false }
      },
      
      // Grasslands Objects
      {
        name: 'Apple Tree',
        type: 'tree',
        regionId: 'grasslands',
        position: { x: 350, y: 250, z: 0 },
        properties: { interactive: true, destructible: true, health: 50, maxHealth: 50 },
        inventory: [
          { itemId: 'apple', name: 'Apple', quantity: 3, respawnTime: 300000 }
        ],
        respawn: { enabled: true, time: 600000 }
      },
      {
        name: 'Iron Ore Vein',
        type: 'resource',
        regionId: 'grasslands',
        position: { x: 500, y: 100, z: 0 },
        properties: { interactive: true, destructible: true, health: 100, maxHealth: 100 },
        inventory: [
          { itemId: 'iron_ore', name: 'Iron Ore', quantity: 5, respawnTime: 600000 }
        ],
        respawn: { enabled: true, time: 1200000 }
      },
      
      // Dark Forest Objects
      {
        name: 'Mysterious Portal',
        type: 'portal',
        regionId: 'dark_forest',
        position: { x: 900, y: 350, z: 0 },
        properties: { interactive: true, solid: false },
        state: { isLocked: true, keyRequired: 'portal_key' }
      },
      {
        name: 'Hidden Chest',
        type: 'chest',
        regionId: 'dark_forest',
        position: { x: 750, y: 120, z: 0 },
        properties: { interactive: true, solid: true },
        inventory: [
          { itemId: 'magic_scroll', name: 'Magic Scroll', quantity: 1 },
          { itemId: 'gold_coin', name: 'Gold Coin', quantity: 100 }
        ],
        state: { isLocked: true, keyRequired: 'forest_key' }
      }
    ];
    
    for (const template of objectTemplates) {
      // Check if object already exists
      const existingObject = Array.from(this.worldObjects.values()).find(obj => 
        obj.name === template.name && obj.position.regionId === template.regionId
      );
      
      if (!existingObject) {
        const objectData = {
          id: uuidv4(),
          ...template
        };
        
        const worldObject = new WorldObject(objectData);
        await worldObject.save();
        this.worldObjects.set(worldObject.id, worldObject);
      }
    }
    
    console.log(`🌍 Generated ${objectTemplates.length} world objects`);
  }
  
  // Player Management
  addPlayerToWorld(playerId, player) {
    const regionId = player.position.region;
    const region = this.regions.get(regionId);
    
    if (!region) {
      console.error(`❌ Region ${regionId} not found for player ${playerId}`);
      return false;
    }
    
    // Add player to region
    if (!this.activePlayers.has(regionId)) {
      this.activePlayers.set(regionId, new Set());
    }
    
    this.activePlayers.get(regionId).add(playerId);
    
    console.log(`🌍 Player ${playerId} added to region ${region.name}`);
    this.emit('playerEnteredRegion', { playerId, regionId, region });
    
    return true;
  }
  
  removePlayerFromWorld(playerId) {
    // Remove player from all regions
    for (const [regionId, playerSet] of this.activePlayers) {
      if (playerSet.has(playerId)) {
        playerSet.delete(playerId);
        this.emit('playerLeftRegion', { playerId, regionId });
        console.log(`🌍 Player ${playerId} removed from region ${regionId}`);
      }
    }
  }
  
  async movePlayer(playerId, newPosition, direction) {
    try {
      const currentRegion = this.getPlayerRegion(playerId);
      const newRegion = this.getRegionAtPosition(newPosition);
      
      if (!newRegion) {
        return { success: false, error: 'Invalid position' };
      }
      
      // Check if position is within region boundaries
      if (!this.isPositionInRegion(newPosition, newRegion)) {
        return { success: false, error: 'Position outside region boundaries' };
      }
      
      // Check for collisions with solid objects
      const collision = this.checkCollisions(newPosition, playerId);
      if (collision) {
        return { success: false, error: 'Collision detected' };
      }
      
      let regionChanged = false;
      let previousRegion = null;
      
      // Handle region change
      if (!currentRegion || currentRegion.id !== newRegion.id) {
        regionChanged = true;
        previousRegion = currentRegion;
        
        // Remove from old region
        if (currentRegion) {
          this.activePlayers.get(currentRegion.id)?.delete(playerId);
          this.emit('playerLeftRegion', { playerId, regionId: currentRegion.id });
        }
        
        // Add to new region
        if (!this.activePlayers.has(newRegion.id)) {
          this.activePlayers.set(newRegion.id, new Set());
        }
        this.activePlayers.get(newRegion.id).add(playerId);
        this.emit('playerEnteredRegion', { playerId, regionId: newRegion.id, region: newRegion });
      }
      
      return {
        success: true,
        position: newPosition,
        region: newRegion,
        regionChanged,
        previousRegion
      };
      
    } catch (error) {
      console.error('❌ Error moving player:', error);
      return { success: false, error: 'Movement failed' };
    }
  }
  
  getPlayerRegion(playerId) {
    for (const [regionId, playerSet] of this.activePlayers) {
      if (playerSet.has(playerId)) {
        return this.regions.get(regionId);
      }
    }
    return null;
  }
  
  getRegionAtPosition(position) {
    for (const [regionId, region] of this.regions) {
      if (this.isPositionInRegion(position, region)) {
        return region;
      }
    }
    return null;
  }
  
  isPositionInRegion(position, region) {
    return position.x >= region.boundaries.minX &&
           position.x <= region.boundaries.maxX &&
           position.y >= region.boundaries.minY &&
           position.y <= region.boundaries.maxY &&
           position.z >= region.boundaries.minZ &&
           position.z <= region.boundaries.maxZ;
  }
  
  checkCollisions(position, excludePlayerId = null) {
    // Check collision with world objects
    for (const [objectId, worldObject] of this.worldObjects) {
      if (worldObject.properties.solid) {
        const distance = this.calculateDistance(position, worldObject.position);
        const objectSize = worldObject.appearance?.size || { x: 1, y: 1, z: 1 };
        const collisionRadius = Math.max(objectSize.x, objectSize.y) / 2;
        
        if (distance < collisionRadius + 1) { // +1 for player radius
          return { type: 'object', object: worldObject };
        }
      }
    }
    
    // Check collision with other players (if needed)
    // This could be implemented for more realistic physics
    
    return null;
  }
  
  // World State
  getWorldState(playerId) {
    const playerRegion = this.getPlayerRegion(playerId);
    if (!playerRegion) return null;
    
    return {
      region: this.sanitizeRegionData(playerRegion),
      nearbyPlayers: this.getNearbyPlayers(playerId),
      nearbyNPCs: this.getNearbyNPCs(playerId),
      nearbyObjects: this.getNearbyObjects(playerId),
      weather: playerRegion.weather,
      timeOfDay: playerRegion.dayNight
    };
  }
  
  getNearbyPlayers(playerId, radius = 100) {
    const playerRegion = this.getPlayerRegion(playerId);
    if (!playerRegion) return [];
    
    const nearbyPlayers = [];
    const regionPlayers = this.activePlayers.get(playerRegion.id);
    
    if (regionPlayers) {
      for (const nearbyPlayerId of regionPlayers) {
        if (nearbyPlayerId !== playerId) {
          // In a real implementation, you'd get player positions and calculate distance
          nearbyPlayers.push({
            id: nearbyPlayerId,
            // Add player data here
          });
        }
      }
    }
    
    return nearbyPlayers;
  }
  
  getNearbyNPCs(playerId, radius = 100) {
    const playerRegion = this.getPlayerRegion(playerId);
    if (!playerRegion) return [];
    
    const nearbyNPCs = [];
    
    for (const [npcId, npc] of this.npcs) {
      if (npc.position.regionId === playerRegion.id && npc.isAlive) {
        // In a real implementation, calculate distance from player position
        nearbyNPCs.push(this.sanitizeNPCData(npc));
      }
    }
    
    return nearbyNPCs;
  }
  
  getNearbyObjects(playerId, radius = 100) {
    const playerRegion = this.getPlayerRegion(playerId);
    if (!playerRegion) return [];
    
    const nearbyObjects = [];
    
    for (const [objectId, worldObject] of this.worldObjects) {
      if (worldObject.position.regionId === playerRegion.id) {
        // In a real implementation, calculate distance from player position
        nearbyObjects.push(this.sanitizeObjectData(worldObject));
      }
    }
    
    return nearbyObjects;
  }
  
  // Updates and Events
  getUpdates() {
    const updates = [...this.updateQueue];
    this.updateQueue.length = 0;
    return updates;
  }
  
  queueUpdate(updateData) {
    if (this.updateQueue.length < this.maxUpdatesPerTick) {
      this.updateQueue.push(updateData);
    }
  }
  
  update(deltaTime) {
    this.updateTickCount++;
    
    // Update weather system
    this.weatherSystem.update(deltaTime);
    
    // Update time system
    this.timeSystem.update(deltaTime);
    
    // Update NPCs (staggered for performance)
    this.updateNPCs(deltaTime);
    
    // Update world objects
    this.updateWorldObjects(deltaTime);
    
    // Process scheduled events
    this.processScheduledEvents();
    
    // Every 10 seconds, save world state
    if (this.updateTickCount % 200 === 0) {
      this.saveWorldState();
    }
  }
  
  updateNPCs(deltaTime) {
    const npcsToUpdate = Math.min(this.maxUpdatesPerTick / 4, this.npcs.size);
    let updated = 0;
    
    for (const [npcId, npc] of this.npcs) {
      if (updated >= npcsToUpdate) break;
      
      if (npc.isAlive) {
        this.updateNPC(npc, deltaTime);
        updated++;
      }
    }
  }
  
  updateNPC(npc, deltaTime) {
    // Update NPC AI behavior
    switch (npc.behavior.aiType) {
      case 'passive':
        this.updatePassiveNPC(npc, deltaTime);
        break;
      case 'aggressive':
        this.updateAggressiveNPC(npc, deltaTime);
        break;
      case 'patrol':
        this.updatePatrolNPC(npc, deltaTime);
        break;
      case 'merchant':
        this.updateMerchantNPC(npc, deltaTime);
        break;
    }
    
    // Update NPC stats (health regen, etc.)
    this.updateNPCStats(npc, deltaTime);
  }
  
  updatePassiveNPC(npc, deltaTime) {
    // Random wandering within radius
    if (Math.random() < 0.01) { // 1% chance per update
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * npc.behavior.wanderRadius;
      
      const newX = npc.behavior.spawnPoint.x + Math.cos(angle) * distance;
      const newY = npc.behavior.spawnPoint.y + Math.sin(angle) * distance;
      
      const newPosition = { x: newX, y: newY, z: npc.position.z };
      
      // Check if new position is valid
      if (!this.checkCollisions(newPosition)) {
        npc.position.x = newX;
        npc.position.y = newY;
        this.queueUpdate({
          type: 'npc_moved',
          npcId: npc.id,
          position: newPosition
        });
      }
    }
  }
  
  updateAggressiveNPC(npc, deltaTime) {
    // Look for nearby players to attack
    const nearbyPlayers = this.getPlayersInRange(npc.position, npc.stats.aggroRange);
    
    if (nearbyPlayers.length > 0) {
      const target = nearbyPlayers[0]; // Attack closest player
      
      // Move towards target
      const dx = target.position.x - npc.position.x;
      const dy = target.position.y - npc.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) { // Move closer if not in melee range
        const moveSpeed = npc.stats.movementSpeed * deltaTime / 1000;
        npc.position.x += (dx / distance) * moveSpeed;
        npc.position.y += (dy / distance) * moveSpeed;
        
        this.queueUpdate({
          type: 'npc_moved',
          npcId: npc.id,
          position: { ...npc.position }
        });
      } else {
        // Attack target
        this.npcAttackPlayer(npc, target);
      }
    } else {
      // No targets, wander back to spawn point
      this.returnToSpawn(npc, deltaTime);
    }
  }
  
  updateWorldObjects(deltaTime) {
    for (const [objectId, worldObject] of this.worldObjects) {
      this.updateWorldObject(worldObject, deltaTime);
    }
  }
  
  updateWorldObject(worldObject, deltaTime) {
    // Handle respawning resources
    if (worldObject.respawn.enabled && worldObject.respawn.lastRespawn) {
      const timeSinceRespawn = Date.now() - worldObject.respawn.lastRespawn.getTime();
      if (timeSinceRespawn >= worldObject.respawn.time) {
        this.respawnWorldObject(worldObject);
      }
    }
    
    // Handle object effects (if any)
    if (worldObject.effects && worldObject.effects.length > 0) {
      this.processObjectEffects(worldObject);
    }
  }
  
  // Utility methods
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = (pos1.z || 0) - (pos2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  getPlayersInRange(position, range) {
    // This would need to be implemented to get actual player positions
    // For now, return empty array
    return [];
  }
  
  npcAttackPlayer(npc, player) {
    // Implement NPC attacking player logic
    this.queueUpdate({
      type: 'npc_attack',
      npcId: npc.id,
      targetId: player.id,
      damage: npc.stats.attack
    });
  }
  
  returnToSpawn(npc, deltaTime) {
    const dx = npc.behavior.spawnPoint.x - npc.position.x;
    const dy = npc.behavior.spawnPoint.y - npc.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 1) {
      const moveSpeed = npc.stats.movementSpeed * deltaTime / 1000;
      npc.position.x += (dx / distance) * moveSpeed;
      npc.position.y += (dy / distance) * moveSpeed;
      
      this.queueUpdate({
        type: 'npc_moved',
        npcId: npc.id,
        position: { ...npc.position }
      });
    }
  }
  
  updateNPCStats(npc, deltaTime) {
    // Health regeneration for living NPCs
    if (npc.isAlive && npc.stats.health < npc.stats.maxHealth) {
      const regenRate = deltaTime / 1000; // per second
      npc.stats.health = Math.min(
        npc.stats.maxHealth,
        npc.stats.health + (5 * regenRate) // 5 HP per second
      );
    }
  }
  
  respawnWorldObject(worldObject) {
    // Reset object inventory
    if (worldObject.inventory) {
      for (const item of worldObject.inventory) {
        if (item.respawnTime) {
          // Reset item quantity
          item.quantity = item.originalQuantity || 1;
        }
      }
    }
    
    // Reset object health
    if (worldObject.properties.destructible) {
      worldObject.properties.health = worldObject.properties.maxHealth;
    }
    
    worldObject.respawn.lastRespawn = new Date();
    
    this.queueUpdate({
      type: 'object_respawned',
      objectId: worldObject.id
    });
  }
  
  processObjectEffects(worldObject) {
    // Process area effects like healing springs, damage zones, etc.
    for (const effect of worldObject.effects) {
      const playersInRange = this.getPlayersInRange(worldObject.position, effect.radius);
      
      for (const player of playersInRange) {
        this.queueUpdate({
          type: 'area_effect',
          effectType: effect.type,
          playerId: player.id,
          strength: effect.strength
        });
      }
    }
  }
  
  processScheduledEvents() {
    const currentTime = Date.now();
    
    for (const [eventId, event] of this.scheduledEvents) {
      if (currentTime >= event.executeAt) {
        try {
          event.callback();
        } catch (error) {
          console.error('❌ Error executing scheduled world event:', error);
        }
        
        this.scheduledEvents.delete(eventId);
      }
    }
  }
  
  scheduleEvent(callback, delay) {
    const eventId = uuidv4();
    this.scheduledEvents.set(eventId, {
      callback,
      executeAt: Date.now() + delay
    });
    return eventId;
  }
  
  async saveWorldState() {
    try {
      // Save modified NPCs
      for (const [npcId, npc] of this.npcs) {
        if (npc.isModified && npc.isModified()) {
          await npc.save();
        }
      }
      
      // Save modified world objects
      for (const [objectId, worldObject] of this.worldObjects) {
        if (worldObject.isModified && worldObject.isModified()) {
          await worldObject.save();
        }
      }
      
      // Save modified regions
      for (const [regionId, region] of this.regions) {
        if (region.isModified && region.isModified()) {
          await region.save();
        }
      }
      
    } catch (error) {
      console.error('❌ Error saving world state:', error);
    }
  }
  
  // Data sanitization
  sanitizeRegionData(region) {
    const regionObj = region.toObject ? region.toObject() : region;
    delete regionObj._id;
    delete regionObj.__v;
    return regionObj;
  }
  
  sanitizeNPCData(npc) {
    const npcObj = npc.toObject ? npc.toObject() : npc;
    delete npcObj._id;
    delete npcObj.__v;
    return npcObj;
  }
  
  sanitizeObjectData(worldObject) {
    const objectObj = worldObject.toObject ? worldObject.toObject() : worldObject;
    delete objectObj._id;
    delete objectObj.__v;
    return objectObj;
  }
  
  // Cleanup methods
  async cleanupInactiveAreas() {
    // Remove or reduce activity in areas with no players
    for (const [regionId, playerSet] of this.activePlayers) {
      if (playerSet.size === 0) {
        // Reduce NPC activity in empty regions
        for (const [npcId, npc] of this.npcs) {
          if (npc.position.regionId === regionId) {
            // Reduce update frequency for NPCs in empty regions
            npc.lastUpdate = Date.now();
          }
        }
      }
    }
  }
  
  // Public API methods
  getRegion(regionId) {
    return this.regions.get(regionId);
  }
  
  getAllRegions() {
    return Array.from(this.regions.values()).map(region => this.sanitizeRegionData(region));
  }
  
  getNPC(npcId) {
    return this.npcs.get(npcId);
  }
  
  getWorldObject(objectId) {
    return this.worldObjects.get(objectId);
  }
  
  getRegionPlayerCount(regionId) {
    return this.activePlayers.get(regionId)?.size || 0;
  }
}

// Helper classes for terrain generation
class NoiseGenerator {
  generateHeightMap(width, height, regionType) {
    const heightMap = [];
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let elevation = 0;
        
        // Generate different terrain based on region type
        switch (regionType) {
          case 'mountain':
            elevation = this.mountainNoise(x, y) * 100;
            break;
          case 'plains':
            elevation = this.plainsNoise(x, y) * 20;
            break;
          case 'forest':
            elevation = this.forestNoise(x, y) * 40;
            break;
          case 'desert':
            elevation = this.desertNoise(x, y) * 30;
            break;
          default:
            elevation = Math.random() * 10;
        }
        
        heightMap.push(Math.max(0, elevation));
      }
    }
    
    return heightMap;
  }
  
  mountainNoise(x, y) {
    return Math.sin(x * 0.1) * Math.cos(y * 0.1) + Math.random() * 0.5;
  }
  
  plainsNoise(x, y) {
    return Math.sin(x * 0.05) * Math.cos(y * 0.05) * 0.5 + Math.random() * 0.3;
  }
  
  forestNoise(x, y) {
    return Math.sin(x * 0.08) * Math.cos(y * 0.08) * 0.7 + Math.random() * 0.4;
  }
  
  desertNoise(x, y) {
    return Math.sin(x * 0.03) * Math.cos(y * 0.03) * 0.8 + Math.random() * 0.2;
  }
}

class BiomeGenerator {
  generateBiome(regionType) {
    const biomes = {
      city: {
        biome: 'urban',
        climate: 'temperate',
        vegetation: 10,
        waterLevel: 5,
        rockiness: 20,
        fertility: 30
      },
      forest: {
        biome: 'temperate_forest',
        climate: 'temperate',
        vegetation: 90,
        waterLevel: 20,
        rockiness: 10,
        fertility: 80
      },
      mountain: {
        biome: 'alpine',
        climate: 'cold',
        vegetation: 20,
        waterLevel: 5,
        rockiness: 95,
        fertility: 10
      },
      desert: {
        biome: 'arid',
        climate: 'hot',
        vegetation: 5,
        waterLevel: 2,
        rockiness: 60,
        fertility: 5
      },
      plains: {
        biome: 'grassland',
        climate: 'temperate',
        vegetation: 60,
        waterLevel: 15,
        rockiness: 5,
        fertility: 70
      },
      ocean: {
        biome: 'marine',
        climate: 'temperate',
        vegetation: 30,
        waterLevel: 100,
        rockiness: 20,
        fertility: 40
      }
    };
    
    return biomes[regionType] || biomes.plains;
  }
}

class WeatherSystem {
  constructor() {
    this.weatherPatterns = ['clear', 'cloudy', 'rain', 'storm', 'fog', 'snow'];
    this.lastWeatherUpdate = 0;
    this.weatherUpdateInterval = 300000; // 5 minutes
  }
  
  initialize(worldManager) {
    this.worldManager = worldManager;
  }
  
  update(deltaTime) {
    const currentTime = Date.now();
    
    if (currentTime - this.lastWeatherUpdate >= this.weatherUpdateInterval) {
      this.updateWeatherForAllRegions();
      this.lastWeatherUpdate = currentTime;
    }
  }
  
  updateWeatherForAllRegions() {
    for (const [regionId, region] of this.worldManager.regions) {
      this.updateRegionWeather(region);
    }
  }
  
  updateRegionWeather(region) {
    const currentWeather = region.weather.currentWeather;
    const newWeather = this.generateWeather(region.type, currentWeather);
    
    if (newWeather !== currentWeather) {
      region.weather.currentWeather = newWeather;
      region.weather.temperature = this.generateTemperature(region.type, newWeather);
      region.weather.humidity = this.generateHumidity(newWeather);
      region.weather.windSpeed = this.generateWindSpeed(newWeather);
      region.weather.visibility = this.generateVisibility(newWeather);
      
      this.worldManager.queueUpdate({
        type: 'weather_changed',
        regionId: region.id,
        weather: { ...region.weather }
      });
    }
  }
  
  generateWeather(regionType, currentWeather) {
    // Weather transition probabilities based on current weather
    const transitions = {
      clear: { clear: 0.7, cloudy: 0.2, rain: 0.1 },
      cloudy: { clear: 0.3, cloudy: 0.4, rain: 0.25, fog: 0.05 },
      rain: { cloudy: 0.6, rain: 0.3, storm: 0.1 },
      storm: { rain: 0.7, storm: 0.2, cloudy: 0.1 },
      fog: { cloudy: 0.5, clear: 0.3, fog: 0.2 },
      snow: { snow: 0.6, cloudy: 0.3, clear: 0.1 }
    };
    
    const weights = transitions[currentWeather] || transitions.clear;
    const random = Math.random();
    let cumulative = 0;
    
    for (const [weather, probability] of Object.entries(weights)) {
      cumulative += probability;
      if (random <= cumulative) {
        return weather;
      }
    }
    
    return currentWeather;
  }
  
  generateTemperature(regionType, weather) {
    const baseTemps = {
      desert: 35,
      mountain: 5,
      tundra: -10,
      forest: 15,
      plains: 20,
      city: 22
    };
    
    const weatherModifiers = {
      clear: 5,
      cloudy: 0,
      rain: -5,
      storm: -8,
      fog: -2,
      snow: -15
    };
    
    const baseTemp = baseTemps[regionType] || 20;
    const modifier = weatherModifiers[weather] || 0;
    
    return baseTemp + modifier + (Math.random() - 0.5) * 10;
  }
  
  generateHumidity(weather) {
    const humidityRanges = {
      clear: [30, 50],
      cloudy: [60, 80],
      rain: [85, 95],
      storm: [90, 100],
      fog: [95, 100],
      snow: [70, 90]
    };
    
    const range = humidityRanges[weather] || [40, 60];
    return range[0] + Math.random() * (range[1] - range[0]);
  }
  
  generateWindSpeed(weather) {
    const windRanges = {
      clear: [0, 10],
      cloudy: [5, 15],
      rain: [10, 25],
      storm: [25, 50],
      fog: [0, 5],
      snow: [5, 20]
    };
    
    const range = windRanges[weather] || [0, 10];
    return range[0] + Math.random() * (range[1] - range[0]);
  }
  
  generateVisibility(weather) {
    const visibilityRanges = {
      clear: [95, 100],
      cloudy: [80, 95],
      rain: [50, 80],
      storm: [20, 50],
      fog: [10, 30],
      snow: [30, 70]
    };
    
    const range = visibilityRanges[weather] || [80, 100];
    return range[0] + Math.random() * (range[1] - range[0]);
  }
}

class TimeSystem {
  constructor() {
    this.timeMultiplier = 60; // 1 real minute = 1 game hour
    this.lastUpdate = Date.now();
  }
  
  initialize(worldManager) {
    this.worldManager = worldManager;
    
    // Initialize time for all regions
    for (const [regionId, region] of worldManager.regions) {
      if (!region.dayNight.timeOfDay) {
        region.dayNight.timeOfDay = 12; // Start at noon
      }
    }
  }
  
  update(deltaTime) {
    const realTimeElapsed = deltaTime / 1000; // Convert to seconds
    const gameTimeElapsed = realTimeElapsed * this.timeMultiplier / 3600; // Convert to game hours
    
    for (const [regionId, region] of this.worldManager.regions) {
      this.updateRegionTime(region, gameTimeElapsed);
    }
  }
  
  updateRegionTime(region, gameTimeElapsed) {
    const oldTime = region.dayNight.timeOfDay;
    region.dayNight.timeOfDay += gameTimeElapsed;
    
    // Handle day rollover
    if (region.dayNight.timeOfDay >= 24) {
      region.dayNight.timeOfDay -= 24;
    }
    
    // Determine time phase
    const newPhase = this.getTimePhase(region.dayNight.timeOfDay);
    
    if (newPhase !== region.dayNight.currentPhase) {
      region.dayNight.currentPhase = newPhase;
      
      this.worldManager.queueUpdate({
        type: 'time_phase_changed',
        regionId: region.id,
        phase: newPhase,
        timeOfDay: region.dayNight.timeOfDay
      });
    }
  }
  
  getTimePhase(timeOfDay) {
    if (timeOfDay >= 6 && timeOfDay < 12) return 'morning';
    if (timeOfDay >= 12 && timeOfDay < 18) return 'day';
    if (timeOfDay >= 18 && timeOfDay < 21) return 'evening';
    return 'night';
  }
}

module.exports = WorldManager;