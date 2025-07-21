const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Player Schema
const PlayerSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  
  // Character Info
  characterName: { type: String, required: true },
  race: { type: String, required: true, enum: ['Human', 'Elf', 'Dwarf', 'Orc', 'Halfling', 'Dragonborn', 'Tiefling'] },
  class: { type: String, required: true, enum: ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Warlock', 'Bard'] },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  appearance: {
    skinColor: String,
    hairColor: String,
    eyeColor: String,
    height: Number,
    weight: Number,
    build: String
  },
  
  // Level and Experience
  level: { type: Number, default: 1 },
  experience: { type: Number, default: 0 },
  experienceToNext: { type: Number, default: 1000 },
  totalExperience: { type: Number, default: 0 },
  skillPoints: { type: Number, default: 0 },
  attributePoints: { type: Number, default: 0 },
  
  // Core Stats
  stats: {
    // Primary Attributes
    strength: { type: Number, default: 10 },
    dexterity: { type: Number, default: 10 },
    constitution: { type: Number, default: 10 },
    intelligence: { type: Number, default: 10 },
    wisdom: { type: Number, default: 10 },
    charisma: { type: Number, default: 10 },
    
    // Combat Stats
    health: { type: Number, default: 100 },
    maxHealth: { type: Number, default: 100 },
    mana: { type: Number, default: 50 },
    maxMana: { type: Number, default: 50 },
    stamina: { type: Number, default: 100 },
    maxStamina: { type: Number, default: 100 },
    
    // Regeneration
    healthRegen: { type: Number, default: 5 },
    manaRegen: { type: Number, default: 10 },
    staminaRegen: { type: Number, default: 15 },
    
    // Combat Attributes
    attack: { type: Number, default: 10 },
    defense: { type: Number, default: 5 },
    magicAttack: { type: Number, default: 5 },
    magicDefense: { type: Number, default: 5 },
    accuracy: { type: Number, default: 85 },
    evasion: { type: Number, default: 5 },
    criticalChance: { type: Number, default: 5 },
    criticalDamage: { type: Number, default: 150 },
    
    // Movement
    movementSpeed: { type: Number, default: 100 },
    attackSpeed: { type: Number, default: 100 },
    castingSpeed: { type: Number, default: 100 }
  },
  
  // Position and Location
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    z: { type: Number, default: 0 },
    region: { type: String, default: 'starter_town' },
    instance: { type: String, default: 'main' }
  },
  
  // Currency
  currency: {
    gold: { type: Number, default: 100 },
    silver: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    tokens: { type: Number, default: 0 }
  },
  
  // Skills
  skills: {
    // Combat Skills
    swordMastery: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    axeMastery: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    bowMastery: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    magicMastery: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    healing: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    defense: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    
    // Crafting Skills
    blacksmithing: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    alchemy: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    cooking: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    tailoring: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    enchanting: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    jewelcrafting: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    
    // Gathering Skills
    mining: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    herbalism: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    fishing: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    lumberjacking: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    skinning: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    
    // Other Skills
    trading: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    leadership: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    luck: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    stealth: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } },
    diplomacy: { level: { type: Number, default: 1 }, experience: { type: Number, default: 0 } }
  },
  
  // Inventory and Equipment
  inventory: {
    slots: { type: Number, default: 50 },
    items: [{
      id: String,
      itemId: String,
      name: String,
      type: String,
      rarity: String,
      quantity: { type: Number, default: 1 },
      durability: Number,
      maxDurability: Number,
      enchantments: [String],
      socketedGems: [String],
      slot: Number,
      bound: { type: Boolean, default: false },
      tradeable: { type: Boolean, default: true }
    }]
  },
  
  equipment: {
    helmet: { type: mongoose.Schema.Types.Mixed, default: null },
    chest: { type: mongoose.Schema.Types.Mixed, default: null },
    legs: { type: mongoose.Schema.Types.Mixed, default: null },
    boots: { type: mongoose.Schema.Types.Mixed, default: null },
    gloves: { type: mongoose.Schema.Types.Mixed, default: null },
    cloak: { type: mongoose.Schema.Types.Mixed, default: null },
    mainHand: { type: mongoose.Schema.Types.Mixed, default: null },
    offHand: { type: mongoose.Schema.Types.Mixed, default: null },
    ring1: { type: mongoose.Schema.Types.Mixed, default: null },
    ring2: { type: mongoose.Schema.Types.Mixed, default: null },
    necklace: { type: mongoose.Schema.Types.Mixed, default: null },
    trinket1: { type: mongoose.Schema.Types.Mixed, default: null },
    trinket2: { type: mongoose.Schema.Types.Mixed, default: null }
  },
  
  // Quests
  activeQuests: [{
    questId: String,
    progress: mongoose.Schema.Types.Mixed,
    startedAt: { type: Date, default: Date.now },
    objectives: [mongoose.Schema.Types.Mixed]
  }],
  
  completedQuests: [String],
  
  // Social
  friends: [{
    playerId: String,
    username: String,
    addedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['online', 'offline', 'busy', 'away'], default: 'offline' }
  }],
  
  blocked: [String],
  
  guild: {
    id: String,
    name: String,
    rank: String,
    joinedAt: Date,
    permissions: [String]
  },
  
  // Achievements
  achievements: [{
    id: String,
    name: String,
    description: String,
    category: String,
    unlockedAt: { type: Date, default: Date.now },
    progress: Number,
    maxProgress: Number,
    rewards: mongoose.Schema.Types.Mixed
  }],
  
  // Player Preferences
  settings: {
    graphics: {
      quality: { type: String, default: 'medium' },
      resolution: { type: String, default: '1920x1080' },
      fullscreen: { type: Boolean, default: true },
      vsync: { type: Boolean, default: true },
      particleEffects: { type: Boolean, default: true }
    },
    audio: {
      masterVolume: { type: Number, default: 100 },
      musicVolume: { type: Number, default: 80 },
      sfxVolume: { type: Number, default: 100 },
      voiceVolume: { type: Number, default: 100 },
      muted: { type: Boolean, default: false }
    },
    ui: {
      chatSize: { type: String, default: 'medium' },
      hudOpacity: { type: Number, default: 80 },
      showDamageNumbers: { type: Boolean, default: true },
      showPlayerNames: { type: Boolean, default: true },
      showHealthBars: { type: Boolean, default: true }
    },
    gameplay: {
      autoLoot: { type: Boolean, default: false },
      autoAttack: { type: Boolean, default: true },
      pvpMode: { type: Boolean, default: false },
      tradeRequests: { type: Boolean, default: true },
      groupInvites: { type: Boolean, default: true },
      guildInvites: { type: Boolean, default: true }
    },
    notifications: {
      questComplete: { type: Boolean, default: true },
      levelUp: { type: Boolean, default: true },
      friendOnline: { type: Boolean, default: true },
      guildMessages: { type: Boolean, default: true },
      tradeOffers: { type: Boolean, default: true }
    }
  },
  
  // Player Statistics
  statistics: {
    playtime: { type: Number, default: 0 }, // in minutes
    loginCount: { type: Number, default: 0 },
    lastLogin: Date,
    lastLogout: Date,
    
    // Combat Stats
    monstersKilled: { type: Number, default: 0 },
    playersKilled: { type: Number, default: 0 },
    deaths: { type: Number, default: 0 },
    damageDealt: { type: Number, default: 0 },
    damageTaken: { type: Number, default: 0 },
    healingDone: { type: Number, default: 0 },
    
    // Economic Stats
    goldEarned: { type: Number, default: 0 },
    goldSpent: { type: Number, default: 0 },
    itemsCrafted: { type: Number, default: 0 },
    itemsTraded: { type: Number, default: 0 },
    
    // Social Stats
    messagesInChat: { type: Number, default: 0 },
    guildContributions: { type: Number, default: 0 },
    playersHelped: { type: Number, default: 0 },
    
    // Exploration Stats
    areasDiscovered: { type: Number, default: 0 },
    distanceTraveled: { type: Number, default: 0 },
    dungeonsCompleted: { type: Number, default: 0 },
    raidsCompleted: { type: Number, default: 0 }
  },
  
  // Player Status
  status: {
    isOnline: { type: Boolean, default: false },
    currentActivity: String,
    inCombat: { type: Boolean, default: false },
    inDungeon: { type: Boolean, default: false },
    inRaid: { type: Boolean, default: false },
    inTrade: { type: Boolean, default: false },
    afk: { type: Boolean, default: false },
    busy: { type: Boolean, default: false }
  },
  
  // Buffs and Debuffs
  buffs: [{
    id: String,
    name: String,
    type: String,
    description: String,
    effects: mongoose.Schema.Types.Mixed,
    duration: Number,
    stackCount: { type: Number, default: 1 },
    appliedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    source: String
  }],
  
  // Cooldowns
  cooldowns: {
    skills: mongoose.Schema.Types.Mixed,
    items: mongoose.Schema.Types.Mixed,
    teleport: Date,
    logout: Date
  },
  
  // Player Titles and Ranks
  titles: [{
    id: String,
    name: String,
    description: String,
    color: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  
  currentTitle: String,
  
  // Housing
  housing: {
    houses: [{
      id: String,
      name: String,
      type: String,
      location: String,
      size: String,
      rooms: Number,
      furnishings: [mongoose.Schema.Types.Mixed],
      visitors: [String],
      permissions: mongoose.Schema.Types.Mixed
    }],
    currentHouse: String
  },
  
  // Pets and Mounts
  pets: [{
    id: String,
    name: String,
    type: String,
    level: Number,
    experience: Number,
    happiness: Number,
    hunger: Number,
    skills: mongoose.Schema.Types.Mixed,
    isActive: { type: Boolean, default: false }
  }],
  
  mounts: [{
    id: String,
    name: String,
    type: String,
    speed: Number,
    stamina: Number,
    abilities: [String],
    isActive: { type: Boolean, default: false }
  }],
  
  // Security and Moderation
  security: {
    loginAttempts: { type: Number, default: 0 },
    lastFailedLogin: Date,
    accountLocked: { type: Boolean, default: false },
    lockExpires: Date,
    twoFactorEnabled: { type: Boolean, default: false },
    recoveryEmail: String
  },
  
  moderation: {
    warnings: [{ 
      reason: String, 
      issuedBy: String, 
      issuedAt: { type: Date, default: Date.now },
      severity: String
    }],
    mutes: [{
      reason: String,
      issuedBy: String,
      issuedAt: { type: Date, default: Date.now },
      expiresAt: Date
    }],
    bans: [{
      reason: String,
      issuedBy: String,
      issuedAt: { type: Date, default: Date.now },
      expiresAt: Date,
      permanent: { type: Boolean, default: false }
    }],
    isMuted: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false }
  },
  
  // Account Info
  accountType: { type: String, enum: ['free', 'premium', 'vip', 'admin'], default: 'free' },
  premiumExpiresAt: Date,
  isAdmin: { type: Boolean, default: false },
  isModerator: { type: Boolean, default: false },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance
PlayerSchema.index({ userId: 1 });
PlayerSchema.index({ username: 1 });
PlayerSchema.index({ email: 1 });
PlayerSchema.index({ 'position.region': 1 });
PlayerSchema.index({ level: -1 });
PlayerSchema.index({ 'currency.gold': -1 });
PlayerSchema.index({ 'status.isOnline': 1 });

const Player = mongoose.model('Player', PlayerSchema);

class PlayerManager {
  constructor() {
    this.activePlayers = new Map();
    this.playerSessions = new Map();
    this.experienceTable = this.generateExperienceTable();
    this.skillExperienceTable = this.generateSkillExperienceTable();
  }
  
  // Account Management
  async createPlayer(userData) {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12);
      
      // Generate unique user ID
      const userId = uuidv4();
      
      // Calculate initial stats based on race and class
      const initialStats = this.calculateInitialStats(userData.race, userData.class);
      
      const playerData = {
        userId,
        username: userData.username,
        email: userData.email,
        passwordHash,
        characterName: userData.characterName,
        race: userData.race,
        class: userData.class,
        gender: userData.gender,
        appearance: userData.appearance,
        stats: initialStats,
        position: this.getStartingPosition(userData.race)
      };
      
      const player = new Player(playerData);
      await player.save();
      
      // Give starting equipment
      await this.giveStartingEquipment(userId, userData.class);
      
      console.log(`✅ Created new player: ${userData.username} (${userId})`);
      return { success: true, player: this.sanitizePlayerData(player) };
      
    } catch (error) {
      console.error('❌ Error creating player:', error);
      
      if (error.code === 11000) {
        return { 
          success: false, 
          error: 'Username or email already exists' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to create player account' 
      };
    }
  }
  
  async authenticatePlayer(username, password) {
    try {
      const player = await Player.findOne({
        $or: [
          { username: username },
          { email: username }
        ]
      });
      
      if (!player) {
        return { success: false, error: 'Player not found' };
      }
      
      // Check if account is banned
      if (player.moderation.isBanned) {
        return { success: false, error: 'Account is banned' };
      }
      
      // Check if account is locked
      if (player.security.accountLocked) {
        if (player.security.lockExpires > new Date()) {
          return { success: false, error: 'Account is temporarily locked' };
        } else {
          player.security.accountLocked = false;
          player.security.loginAttempts = 0;
        }
      }
      
      const isValidPassword = await bcrypt.compare(password, player.passwordHash);
      
      if (!isValidPassword) {
        // Increment failed login attempts
        player.security.loginAttempts += 1;
        player.security.lastFailedLogin = new Date();
        
        // Lock account after 5 failed attempts
        if (player.security.loginAttempts >= 5) {
          player.security.accountLocked = true;
          player.security.lockExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
        
        await player.save();
        return { success: false, error: 'Invalid password' };
      }
      
      // Successful login - reset security counters
      player.security.loginAttempts = 0;
      player.statistics.loginCount += 1;
      player.statistics.lastLogin = new Date();
      player.status.isOnline = true;
      
      await player.save();
      
      return { 
        success: true, 
        player: this.sanitizePlayerData(player) 
      };
      
    } catch (error) {
      console.error('❌ Error authenticating player:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }
  
  async getPlayer(userId) {
    try {
      // Try to get from cache first
      if (this.activePlayers.has(userId)) {
        return this.activePlayers.get(userId);
      }
      
      // Fetch from database
      const player = await Player.findOne({ userId });
      if (player) {
        const sanitizedPlayer = this.sanitizePlayerData(player);
        this.activePlayers.set(userId, sanitizedPlayer);
        return sanitizedPlayer;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting player:', error);
      return null;
    }
  }
  
  async updatePlayer(userId, updateData) {
    try {
      const player = await Player.findOneAndUpdate(
        { userId },
        { $set: updateData, updatedAt: new Date() },
        { new: true }
      );
      
      if (player) {
        const sanitizedPlayer = this.sanitizePlayerData(player);
        this.activePlayers.set(userId, sanitizedPlayer);
        return { success: true, player: sanitizedPlayer };
      }
      
      return { success: false, error: 'Player not found' };
    } catch (error) {
      console.error('❌ Error updating player:', error);
      return { success: false, error: 'Failed to update player' };
    }
  }
  
  async savePlayerState(userId) {
    try {
      const playerData = this.activePlayers.get(userId);
      if (!playerData) return false;
      
      await Player.updateOne(
        { userId },
        { $set: playerData, updatedAt: new Date() }
      );
      
      return true;
    } catch (error) {
      console.error('❌ Error saving player state:', error);
      return false;
    }
  }
  
  // Player Status Management
  async setPlayerOnline(userId) {
    try {
      await Player.updateOne(
        { userId },
        { 
          $set: { 
            'status.isOnline': true,
            'statistics.lastLogin': new Date()
          }
        }
      );
      
      const player = this.activePlayers.get(userId);
      if (player) {
        player.status.isOnline = true;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error setting player online:', error);
      return false;
    }
  }
  
  async setPlayerOffline(userId) {
    try {
      await Player.updateOne(
        { userId },
        { 
          $set: { 
            'status.isOnline': false,
            'statistics.lastLogout': new Date()
          }
        }
      );
      
      // Remove from active players cache
      this.activePlayers.delete(userId);
      this.playerSessions.delete(userId);
      
      return true;
    } catch (error) {
      console.error('❌ Error setting player offline:', error);
      return false;
    }
  }
  
  // Experience and Leveling
  async addExperience(userId, amount, source = 'unknown') {
    try {
      const player = this.activePlayers.get(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      const oldLevel = player.level;
      player.experience += amount;
      player.totalExperience += amount;
      
      // Check for level up
      const levelsGained = this.checkLevelUp(player);
      
      if (levelsGained > 0) {
        this.handleLevelUp(player, levelsGained);
      }
      
      // Save to database
      await this.savePlayerState(userId);
      
      return {
        success: true,
        experienceGained: amount,
        levelsGained,
        newLevel: player.level,
        source
      };
      
    } catch (error) {
      console.error('❌ Error adding experience:', error);
      return { success: false, error: 'Failed to add experience' };
    }
  }
  
  checkLevelUp(player) {
    let levelsGained = 0;
    
    while (player.experience >= player.experienceToNext) {
      player.experience -= player.experienceToNext;
      player.level += 1;
      levelsGained += 1;
      
      // Calculate experience needed for next level
      player.experienceToNext = this.getExperienceForLevel(player.level + 1) - 
                                 this.getExperienceForLevel(player.level);
      
      // Award skill points and attribute points
      player.skillPoints += 3;
      player.attributePoints += 2;
      
      // Stop at max level
      if (player.level >= 100) break;
    }
    
    return levelsGained;
  }
  
  handleLevelUp(player, levelsGained) {
    // Increase base stats
    const statIncreases = this.calculateStatIncreases(player.class, levelsGained);
    
    for (const [stat, increase] of Object.entries(statIncreases)) {
      if (player.stats[stat] !== undefined) {
        player.stats[stat] += increase;
      }
    }
    
    // Recalculate derived stats
    this.recalculateStats(player);
    
    // Full heal on level up
    player.stats.health = player.stats.maxHealth;
    player.stats.mana = player.stats.maxMana;
    player.stats.stamina = player.stats.maxStamina;
    
    console.log(`🎉 Player ${player.username} reached level ${player.level}!`);
  }
  
  // Skill System
  async addSkillExperience(userId, skillName, amount) {
    try {
      const player = this.activePlayers.get(userId);
      if (!player || !player.skills[skillName]) {
        return { success: false, error: 'Player or skill not found' };
      }
      
      const skill = player.skills[skillName];
      const oldLevel = skill.level;
      skill.experience += amount;
      
      // Check for skill level up
      const skillLevelsGained = this.checkSkillLevelUp(skill);
      
      if (skillLevelsGained > 0) {
        console.log(`📈 Player ${player.username} skill ${skillName} reached level ${skill.level}!`);
      }
      
      await this.savePlayerState(userId);
      
      return {
        success: true,
        skillExperienceGained: amount,
        skillLevelsGained,
        newSkillLevel: skill.level
      };
      
    } catch (error) {
      console.error('❌ Error adding skill experience:', error);
      return { success: false, error: 'Failed to add skill experience' };
    }
  }
  
  checkSkillLevelUp(skill) {
    let levelsGained = 0;
    const maxLevel = 100;
    
    while (skill.level < maxLevel) {
      const experienceNeeded = this.getSkillExperienceForLevel(skill.level + 1);
      
      if (skill.experience >= experienceNeeded) {
        skill.level += 1;
        levelsGained += 1;
      } else {
        break;
      }
    }
    
    return levelsGained;
  }
  
  // Inventory Management
  async getInventory(userId) {
    try {
      const player = await this.getPlayer(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      return {
        success: true,
        inventory: player.inventory,
        equipment: player.equipment
      };
    } catch (error) {
      console.error('❌ Error getting inventory:', error);
      return { success: false, error: 'Failed to get inventory' };
    }
  }
  
  async addItemToInventory(userId, item) {
    try {
      const player = this.activePlayers.get(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      // Check for available inventory space
      const availableSlot = this.findAvailableInventorySlot(player);
      if (availableSlot === -1) {
        return { success: false, error: 'Inventory is full' };
      }
      
      // Add item to inventory
      const newItem = {
        id: uuidv4(),
        ...item,
        slot: availableSlot
      };
      
      player.inventory.items.push(newItem);
      await this.savePlayerState(userId);
      
      return {
        success: true,
        item: newItem,
        slot: availableSlot
      };
      
    } catch (error) {
      console.error('❌ Error adding item to inventory:', error);
      return { success: false, error: 'Failed to add item' };
    }
  }
  
  async removeItemFromInventory(userId, itemId, quantity = 1) {
    try {
      const player = this.activePlayers.get(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      const itemIndex = player.inventory.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        return { success: false, error: 'Item not found' };
      }
      
      const item = player.inventory.items[itemIndex];
      
      if (item.quantity <= quantity) {
        // Remove entire item
        player.inventory.items.splice(itemIndex, 1);
      } else {
        // Reduce quantity
        item.quantity -= quantity;
      }
      
      await this.savePlayerState(userId);
      
      return { success: true, removedQuantity: quantity };
      
    } catch (error) {
      console.error('❌ Error removing item from inventory:', error);
      return { success: false, error: 'Failed to remove item' };
    }
  }
  
  // Equipment Management
  async equipItem(userId, itemId, slot) {
    try {
      const player = this.activePlayers.get(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      const itemIndex = player.inventory.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        return { success: false, error: 'Item not found in inventory' };
      }
      
      const item = player.inventory.items[itemIndex];
      
      // Validate item can be equipped in this slot
      if (!this.canEquipItemInSlot(item, slot)) {
        return { success: false, error: 'Item cannot be equipped in this slot' };
      }
      
      // Unequip current item if any
      let unequippedItem = null;
      if (player.equipment[slot]) {
        unequippedItem = player.equipment[slot];
        // Add to inventory
        await this.addItemToInventory(userId, unequippedItem);
      }
      
      // Equip new item
      player.equipment[slot] = item;
      player.inventory.items.splice(itemIndex, 1);
      
      // Recalculate stats
      this.recalculateStats(player);
      
      await this.savePlayerState(userId);
      
      return {
        success: true,
        equippedItem: item,
        unequippedItem,
        slot
      };
      
    } catch (error) {
      console.error('❌ Error equipping item:', error);
      return { success: false, error: 'Failed to equip item' };
    }
  }
  
  // Currency Management
  async addCurrency(userId, type, amount) {
    try {
      const player = this.activePlayers.get(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      if (!player.currency[type]) {
        return { success: false, error: 'Invalid currency type' };
      }
      
      player.currency[type] += amount;
      player.statistics.goldEarned += (type === 'gold' ? amount : 0);
      
      await this.savePlayerState(userId);
      
      return {
        success: true,
        currencyType: type,
        amountAdded: amount,
        newBalance: player.currency[type]
      };
      
    } catch (error) {
      console.error('❌ Error adding currency:', error);
      return { success: false, error: 'Failed to add currency' };
    }
  }
  
  async removeCurrency(userId, type, amount) {
    try {
      const player = this.activePlayers.get(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      if (!player.currency[type] || player.currency[type] < amount) {
        return { success: false, error: 'Insufficient currency' };
      }
      
      player.currency[type] -= amount;
      player.statistics.goldSpent += (type === 'gold' ? amount : 0);
      
      await this.savePlayerState(userId);
      
      return {
        success: true,
        currencyType: type,
        amountRemoved: amount,
        newBalance: player.currency[type]
      };
      
    } catch (error) {
      console.error('❌ Error removing currency:', error);
      return { success: false, error: 'Failed to remove currency' };
    }
  }
  
  // Friends System
  async getFriends(userId) {
    try {
      const player = await this.getPlayer(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      return {
        success: true,
        friends: player.friends
      };
    } catch (error) {
      console.error('❌ Error getting friends:', error);
      return { success: false, error: 'Failed to get friends' };
    }
  }
  
  async addFriend(userId, friendUserId) {
    try {
      const player = this.activePlayers.get(userId);
      const friend = await this.getPlayer(friendUserId);
      
      if (!player || !friend) {
        return { success: false, error: 'Player not found' };
      }
      
      // Check if already friends
      if (player.friends.some(f => f.playerId === friendUserId)) {
        return { success: false, error: 'Already friends' };
      }
      
      // Add to both players' friend lists
      player.friends.push({
        playerId: friendUserId,
        username: friend.username,
        status: friend.status.isOnline ? 'online' : 'offline'
      });
      
      friend.friends.push({
        playerId: userId,
        username: player.username,
        status: player.status.isOnline ? 'online' : 'offline'
      });
      
      await Promise.all([
        this.savePlayerState(userId),
        this.savePlayerState(friendUserId)
      ]);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error adding friend:', error);
      return { success: false, error: 'Failed to add friend' };
    }
  }
  
  // Player Settings
  async getPlayerSettings(userId) {
    try {
      const player = await this.getPlayer(userId);
      if (!player) return { success: false, error: 'Player not found' };
      
      return {
        success: true,
        settings: player.settings
      };
    } catch (error) {
      console.error('❌ Error getting player settings:', error);
      return { success: false, error: 'Failed to get settings' };
    }
  }
  
  async updatePlayerSettings(userId, settings) {
    try {
      const updateResult = await this.updatePlayer(userId, { settings });
      return updateResult;
    } catch (error) {
      console.error('❌ Error updating player settings:', error);
      return { success: false, error: 'Failed to update settings' };
    }
  }
  
  // Utility Methods
  sanitizePlayerData(player) {
    const playerObj = player.toObject ? player.toObject() : player;
    
    // Remove sensitive data
    delete playerObj.passwordHash;
    delete playerObj.security;
    delete playerObj._id;
    delete playerObj.__v;
    
    return playerObj;
  }
  
  calculateInitialStats(race, playerClass) {
    const baseStats = {
      strength: 10, dexterity: 10, constitution: 10,
      intelligence: 10, wisdom: 10, charisma: 10
    };
    
    // Race modifiers
    const raceMods = {
      Human: { strength: 1, charisma: 1 },
      Elf: { dexterity: 2, intelligence: 1 },
      Dwarf: { constitution: 2, strength: 1 },
      Orc: { strength: 2, constitution: 1 },
      Halfling: { dexterity: 2, wisdom: 1 },
      Dragonborn: { strength: 1, charisma: 2 },
      Tiefling: { intelligence: 1, charisma: 2 }
    };
    
    // Class modifiers
    const classMods = {
      Warrior: { strength: 3, constitution: 2 },
      Mage: { intelligence: 4, wisdom: 1 },
      Rogue: { dexterity: 4, intelligence: 1 },
      Cleric: { wisdom: 3, charisma: 2 },
      Ranger: { dexterity: 2, wisdom: 2, strength: 1 },
      Paladin: { strength: 2, charisma: 2, constitution: 1 },
      Warlock: { charisma: 3, intelligence: 2 },
      Bard: { charisma: 3, dexterity: 2 }
    };
    
    // Apply modifiers
    const raceBonus = raceMods[race] || {};
    const classBonus = classMods[playerClass] || {};
    
    for (const [stat, base] of Object.entries(baseStats)) {
      baseStats[stat] = base + (raceBonus[stat] || 0) + (classBonus[stat] || 0);
    }
    
    // Calculate derived stats
    const derivedStats = this.calculateDerivedStats(baseStats);
    
    return { ...baseStats, ...derivedStats };
  }
  
  calculateDerivedStats(primaryStats) {
    const con = primaryStats.constitution;
    const int = primaryStats.intelligence;
    const str = primaryStats.strength;
    const dex = primaryStats.dexterity;
    const wis = primaryStats.wisdom;
    
    return {
      maxHealth: 50 + (con * 10),
      health: 50 + (con * 10),
      maxMana: 20 + (int * 5),
      mana: 20 + (int * 5),
      maxStamina: 80 + (con * 5),
      stamina: 80 + (con * 5),
      healthRegen: Math.floor(con / 2),
      manaRegen: Math.floor(wis / 2),
      staminaRegen: Math.floor(con / 3),
      attack: str + 5,
      defense: Math.floor(con / 2) + 3,
      magicAttack: int + 3,
      magicDefense: Math.floor(wis / 2) + 3,
      accuracy: 75 + Math.floor(dex / 2),
      evasion: Math.floor(dex / 3),
      criticalChance: Math.floor(dex / 4),
      movementSpeed: 100 + Math.floor(dex / 2)
    };
  }
  
  recalculateStats(player) {
    // Recalculate all derived stats based on equipment and buffs
    const baseStats = {
      strength: player.stats.strength,
      dexterity: player.stats.dexterity,
      constitution: player.stats.constitution,
      intelligence: player.stats.intelligence,
      wisdom: player.stats.wisdom,
      charisma: player.stats.charisma
    };
    
    // Apply equipment bonuses
    for (const [slot, item] of Object.entries(player.equipment)) {
      if (item && item.stats) {
        for (const [stat, bonus] of Object.entries(item.stats)) {
          if (baseStats[stat] !== undefined) {
            baseStats[stat] += bonus;
          }
        }
      }
    }
    
    // Apply buff bonuses
    for (const buff of player.buffs) {
      if (buff.effects && buff.effects.stats) {
        for (const [stat, bonus] of Object.entries(buff.effects.stats)) {
          if (baseStats[stat] !== undefined) {
            baseStats[stat] += bonus;
          }
        }
      }
    }
    
    // Update derived stats
    const derivedStats = this.calculateDerivedStats(baseStats);
    Object.assign(player.stats, baseStats, derivedStats);
  }
  
  generateExperienceTable() {
    const table = [0]; // Level 0
    
    for (let level = 1; level <= 100; level++) {
      const exp = Math.floor(100 * Math.pow(level, 2.1));
      table.push(exp);
    }
    
    return table;
  }
  
  generateSkillExperienceTable() {
    const table = [0]; // Level 0
    
    for (let level = 1; level <= 100; level++) {
      const exp = Math.floor(50 * Math.pow(level, 1.8));
      table.push(exp);
    }
    
    return table;
  }
  
  getExperienceForLevel(level) {
    return this.experienceTable[Math.min(level, 100)] || 0;
  }
  
  getSkillExperienceForLevel(level) {
    return this.skillExperienceTable[Math.min(level, 100)] || 0;
  }
  
  getStartingPosition(race) {
    const startingPositions = {
      Human: { x: 100, y: 100, z: 0, region: 'human_city' },
      Elf: { x: 200, y: 50, z: 0, region: 'elf_forest' },
      Dwarf: { x: 50, y: 200, z: 0, region: 'dwarf_mountains' },
      Orc: { x: 300, y: 300, z: 0, region: 'orc_stronghold' },
      Halfling: { x: 150, y: 150, z: 0, region: 'halfling_village' },
      Dragonborn: { x: 250, y: 100, z: 0, region: 'dragon_peaks' },
      Tiefling: { x: 100, y: 250, z: 0, region: 'shadow_realm' }
    };
    
    return startingPositions[race] || startingPositions.Human;
  }
  
  async giveStartingEquipment(userId, playerClass) {
    const startingItems = {
      Warrior: [
        { itemId: 'iron_sword', name: 'Iron Sword', type: 'weapon', rarity: 'common' },
        { itemId: 'leather_armor', name: 'Leather Armor', type: 'chest', rarity: 'common' },
        { itemId: 'health_potion', name: 'Health Potion', type: 'consumable', rarity: 'common', quantity: 5 }
      ],
      Mage: [
        { itemId: 'apprentice_staff', name: 'Apprentice Staff', type: 'weapon', rarity: 'common' },
        { itemId: 'cloth_robes', name: 'Cloth Robes', type: 'chest', rarity: 'common' },
        { itemId: 'mana_potion', name: 'Mana Potion', type: 'consumable', rarity: 'common', quantity: 5 }
      ],
      Rogue: [
        { itemId: 'steel_dagger', name: 'Steel Dagger', type: 'weapon', rarity: 'common' },
        { itemId: 'leather_vest', name: 'Leather Vest', type: 'chest', rarity: 'common' },
        { itemId: 'lockpick_set', name: 'Lockpick Set', type: 'tool', rarity: 'common' }
      ]
      // Add more classes...
    };
    
    const items = startingItems[playerClass] || startingItems.Warrior;
    
    for (const item of items) {
      await this.addItemToInventory(userId, item);
    }
  }
  
  findAvailableInventorySlot(player) {
    const usedSlots = new Set(player.inventory.items.map(item => item.slot));
    
    for (let slot = 0; slot < player.inventory.slots; slot++) {
      if (!usedSlots.has(slot)) {
        return slot;
      }
    }
    
    return -1; // No available slots
  }
  
  canEquipItemInSlot(item, slot) {
    const slotItemTypes = {
      helmet: ['helmet', 'hat', 'crown'],
      chest: ['chest', 'armor', 'robe', 'shirt'],
      legs: ['legs', 'pants', 'greaves'],
      boots: ['boots', 'shoes', 'sandals'],
      gloves: ['gloves', 'gauntlets', 'bracers'],
      cloak: ['cloak', 'cape', 'mantle'],
      mainHand: ['sword', 'axe', 'mace', 'staff', 'bow', 'dagger'],
      offHand: ['shield', 'tome', 'orb', 'dagger'],
      ring1: ['ring'],
      ring2: ['ring'],
      necklace: ['necklace', 'amulet', 'pendant'],
      trinket1: ['trinket', 'charm', 'relic'],
      trinket2: ['trinket', 'charm', 'relic']
    };
    
    const validTypes = slotItemTypes[slot] || [];
    return validTypes.includes(item.type);
  }
  
  calculateStatIncreases(playerClass, levels) {
    const increases = {
      Warrior: { strength: 2, constitution: 1, dexterity: 1 },
      Mage: { intelligence: 2, wisdom: 1, constitution: 1 },
      Rogue: { dexterity: 2, intelligence: 1, strength: 1 },
      Cleric: { wisdom: 2, charisma: 1, constitution: 1 },
      Ranger: { dexterity: 1, wisdom: 1, strength: 1, constitution: 1 },
      Paladin: { strength: 1, charisma: 1, constitution: 1, wisdom: 1 },
      Warlock: { charisma: 2, intelligence: 1, constitution: 1 },
      Bard: { charisma: 2, dexterity: 1, intelligence: 1 }
    };
    
    const classIncreases = increases[playerClass] || increases.Warrior;
    const result = {};
    
    for (const [stat, increase] of Object.entries(classIncreases)) {
      result[stat] = increase * levels;
    }
    
    return result;
  }
}

module.exports = PlayerManager;