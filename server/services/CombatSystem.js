const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');

class CombatSystem extends EventEmitter {
  constructor() {
    super();
    
    // Combat state
    this.activeCombats = new Map(); // combatId -> combat instance
    this.playerCombats = new Map(); // playerId -> combatId
    this.combatUpdateQueue = [];
    
    // Combat configuration
    this.combatSettings = {
      maxCombatDuration: 300000, // 5 minutes
      autoTargetRange: 50,
      combatExitDelay: 10000, // 10 seconds to exit combat
      criticalHitMultiplier: 2.0,
      glancingBlowMultiplier: 0.5,
      missChance: 0.05, // 5% base miss chance
      maxDamageVariance: 0.2 // 20% damage variance
    };
    
    // Damage types and resistances
    this.damageTypes = [
      'physical', 'fire', 'ice', 'lightning', 'poison', 
      'holy', 'dark', 'arcane', 'nature', 'psychic'
    ];
    
    // Status effects
    this.statusEffects = new Map();
    this.initializeStatusEffects();
    
    // Combat formulas
    this.formulas = {
      accuracy: this.calculateAccuracy.bind(this),
      damage: this.calculateDamage.bind(this),
      criticalChance: this.calculateCriticalChance.bind(this),
      blockChance: this.calculateBlockChance.bind(this),
      dodgeChance: this.calculateDodgeChance.bind(this)
    };
  }
  
  initializeStatusEffects() {
    const effects = [
      {
        id: 'bleeding',
        name: 'Bleeding',
        type: 'debuff',
        category: 'damage_over_time',
        description: 'Takes damage over time',
        maxStacks: 5,
        tickInterval: 2000, // 2 seconds
        effects: {
          healthPerTick: -10,
          moveSpeedModifier: -0.1
        }
      },
      {
        id: 'poisoned',
        name: 'Poisoned',
        type: 'debuff',
        category: 'damage_over_time',
        description: 'Poisoned, takes damage and reduces healing',
        maxStacks: 3,
        tickInterval: 3000,
        effects: {
          healthPerTick: -15,
          healingModifier: -0.5
        }
      },
      {
        id: 'burning',
        name: 'Burning',
        type: 'debuff',
        category: 'damage_over_time',
        description: 'On fire, takes fire damage over time',
        maxStacks: 10,
        tickInterval: 1000,
        effects: {
          healthPerTick: -20,
          fireResistance: -0.2
        }
      },
      {
        id: 'frozen',
        name: 'Frozen',
        type: 'debuff',
        category: 'crowd_control',
        description: 'Cannot move or act',
        maxStacks: 1,
        effects: {
          moveSpeedModifier: -1.0,
          actionSpeedModifier: -1.0,
          stunned: true
        }
      },
      {
        id: 'stunned',
        name: 'Stunned',
        type: 'debuff',
        category: 'crowd_control',
        description: 'Cannot act',
        maxStacks: 1,
        effects: {
          actionSpeedModifier: -1.0,
          stunned: true
        }
      },
      {
        id: 'blessed',
        name: 'Blessed',
        type: 'buff',
        category: 'enhancement',
        description: 'Increased damage and healing',
        maxStacks: 1,
        effects: {
          damageModifier: 0.25,
          healingModifier: 0.5,
          holyResistance: 0.3
        }
      },
      {
        id: 'rage',
        name: 'Rage',
        type: 'buff',
        category: 'enhancement',
        description: 'Increased attack speed and damage',
        maxStacks: 3,
        effects: {
          attackSpeedModifier: 0.2,
          damageModifier: 0.15,
          defenseModifier: -0.1
        }
      },
      {
        id: 'shield',
        name: 'Shield',
        type: 'buff',
        category: 'protection',
        description: 'Absorbs incoming damage',
        maxStacks: 1,
        effects: {
          absorbDamage: 100
        }
      },
      {
        id: 'haste',
        name: 'Haste',
        type: 'buff',
        category: 'enhancement',
        description: 'Increased movement and attack speed',
        maxStacks: 1,
        effects: {
          moveSpeedModifier: 0.5,
          attackSpeedModifier: 0.3,
          castSpeedModifier: 0.3
        }
      },
      {
        id: 'regeneration',
        name: 'Regeneration',
        type: 'buff',
        category: 'healing_over_time',
        description: 'Slowly restores health',
        maxStacks: 3,
        tickInterval: 2000,
        effects: {
          healthPerTick: 25
        }
      }
    ];
    
    for (const effect of effects) {
      this.statusEffects.set(effect.id, effect);
    }
  }
  
  // Main combat processing
  async processAttack(attackerId, targetId, skillId, options = {}) {
    try {
      // Validate participants
      const attacker = await this.getEntity(attackerId);
      const target = await this.getEntity(targetId);
      
      if (!attacker || !target) {
        return { success: false, error: 'Invalid attacker or target' };
      }
      
      // Check if attacker can perform the action
      if (!this.canPerformAction(attacker)) {
        return { success: false, error: 'Cannot perform action' };
      }
      
      // Get skill data
      const skill = await this.getSkill(skillId);
      if (!skill) {
        return { success: false, error: 'Invalid skill' };
      }
      
      // Check cooldowns and resources
      const resourceCheck = this.checkResources(attacker, skill);
      if (!resourceCheck.success) {
        return resourceCheck;
      }
      
      // Calculate range and line of sight
      const rangeCheck = this.checkRange(attacker, target, skill);
      if (!rangeCheck.success) {
        return rangeCheck;
      }
      
      // Start or update combat
      const combatId = this.initializeCombat(attackerId, targetId);
      
      // Calculate attack outcome
      const attackResult = this.calculateAttackOutcome(attacker, target, skill, options);
      
      // Apply damage and effects
      const damageResult = await this.applyDamage(target, attackResult);
      
      // Apply skill effects
      await this.applySkillEffects(attacker, target, skill, attackResult);
      
      // Consume resources
      this.consumeResources(attacker, skill);
      
      // Apply cooldown
      this.applyCooldown(attacker, skill);
      
      // Update combat state
      this.updateCombatState(combatId, attackResult);
      
      // Queue combat update
      this.queueCombatUpdate({
        type: 'attack',
        combatId,
        attackerId,
        targetId,
        skillId,
        result: attackResult,
        damage: damageResult,
        timestamp: Date.now()
      });
      
      // Check for death
      if (target.stats.health <= 0) {
        await this.handleDeath(target, attacker);
      }
      
      return {
        success: true,
        result: attackResult,
        damage: damageResult.finalDamage,
        effects: damageResult.appliedEffects,
        combatId
      };
      
    } catch (error) {
      console.error('❌ Error processing attack:', error);
      return { success: false, error: 'Attack processing failed' };
    }
  }
  
  calculateAttackOutcome(attacker, target, skill, options = {}) {
    const outcome = {
      hit: false,
      critical: false,
      glancing: false,
      blocked: false,
      dodged: false,
      damage: 0,
      damageType: skill.damageType || 'physical',
      effects: []
    };
    
    // Calculate accuracy
    const accuracy = this.formulas.accuracy(attacker, target, skill);
    const hitRoll = Math.random();
    
    // Check for miss
    if (hitRoll > accuracy) {
      outcome.hit = false;
      return outcome;
    }
    
    outcome.hit = true;
    
    // Check for dodge
    const dodgeChance = this.formulas.dodgeChance(target, attacker, skill);
    if (Math.random() < dodgeChance) {
      outcome.dodged = true;
      outcome.hit = false;
      return outcome;
    }
    
    // Check for block
    const blockChance = this.formulas.blockChance(target, attacker, skill);
    if (Math.random() < blockChance) {
      outcome.blocked = true;
      // Blocked attacks still deal reduced damage
      outcome.damage = this.formulas.damage(attacker, target, skill) * 0.2;
      return outcome;
    }
    
    // Calculate damage
    let baseDamage = this.formulas.damage(attacker, target, skill);
    
    // Check for critical hit
    const criticalChance = this.formulas.criticalChance(attacker, target, skill);
    if (Math.random() < criticalChance) {
      outcome.critical = true;
      baseDamage *= this.combatSettings.criticalHitMultiplier;
    }
    
    // Check for glancing blow
    else if (Math.random() < 0.1) { // 10% chance for glancing blow
      outcome.glancing = true;
      baseDamage *= this.combatSettings.glancingBlowMultiplier;
    }
    
    // Apply damage variance
    const variance = 1 + (Math.random() - 0.5) * this.combatSettings.maxDamageVariance;
    baseDamage *= variance;
    
    outcome.damage = Math.floor(Math.max(1, baseDamage));
    
    // Apply skill effects
    if (skill.effects) {
      outcome.effects = [...skill.effects];
    }
    
    return outcome;
  }
  
  async applyDamage(target, attackResult) {
    const result = {
      originalDamage: attackResult.damage,
      finalDamage: 0,
      absorbed: 0,
      resisted: 0,
      appliedEffects: []
    };
    
    if (!attackResult.hit || attackResult.dodged) {
      return result;
    }
    
    let damage = attackResult.damage;
    
    // Apply damage absorption (shields, etc.)
    const absorptionResult = this.applyDamageAbsorption(target, damage, attackResult.damageType);
    damage = absorptionResult.remainingDamage;
    result.absorbed = absorptionResult.absorbed;
    
    // Apply resistances
    const resistanceResult = this.applyDamageResistance(target, damage, attackResult.damageType);
    damage = resistanceResult.finalDamage;
    result.resisted = resistanceResult.resisted;
    
    // Apply final damage
    result.finalDamage = Math.floor(damage);
    target.stats.health = Math.max(0, target.stats.health - result.finalDamage);
    
    // Apply status effects from attack
    for (const effect of attackResult.effects) {
      const appliedEffect = await this.applyStatusEffect(target, effect);
      if (appliedEffect) {
        result.appliedEffects.push(appliedEffect);
      }
    }
    
    return result;
  }
  
  applyDamageAbsorption(target, damage, damageType) {
    let absorbed = 0;
    let remainingDamage = damage;
    
    // Check for shield buffs
    const shields = target.buffs.filter(buff => 
      buff.effects && buff.effects.absorbDamage && buff.effects.absorbDamage > 0
    );
    
    for (const shield of shields) {
      if (remainingDamage <= 0) break;
      
      const absorbAmount = Math.min(shield.effects.absorbDamage, remainingDamage);
      absorbed += absorbAmount;
      remainingDamage -= absorbAmount;
      shield.effects.absorbDamage -= absorbAmount;
      
      // Remove shield if depleted
      if (shield.effects.absorbDamage <= 0) {
        this.removeStatusEffect(target, shield.id);
      }
    }
    
    return { absorbed, remainingDamage };
  }
  
  applyDamageResistance(target, damage, damageType) {
    let resistance = 0;
    
    // Base resistance from stats
    if (target.stats.resistances && target.stats.resistances[damageType]) {
      resistance += target.stats.resistances[damageType];
    }
    
    // Resistance from buffs
    for (const buff of target.buffs) {
      if (buff.effects && buff.effects[`${damageType}Resistance`]) {
        resistance += buff.effects[`${damageType}Resistance`];
      }
    }
    
    // Equipment resistance
    if (target.equipment) {
      for (const [slot, item] of Object.entries(target.equipment)) {
        if (item && item.resistances && item.resistances[damageType]) {
          resistance += item.resistances[damageType];
        }
      }
    }
    
    // Cap resistance at 95%
    resistance = Math.min(0.95, Math.max(-1, resistance));
    
    const finalDamage = damage * (1 - resistance);
    const resisted = damage - finalDamage;
    
    return { finalDamage, resisted, resistance };
  }
  
  async applyStatusEffect(target, effectData) {
    const effectTemplate = this.statusEffects.get(effectData.id);
    if (!effectTemplate) {
      console.warn(`Unknown status effect: ${effectData.id}`);
      return null;
    }
    
    // Check for immunity or resistance
    if (this.isImmuneToEffect(target, effectData.id)) {
      return null;
    }
    
    // Create effect instance
    const effect = {
      id: uuidv4(),
      templateId: effectData.id,
      name: effectTemplate.name,
      type: effectTemplate.type,
      category: effectTemplate.category,
      description: effectTemplate.description,
      duration: effectData.duration || 30000, // 30 seconds default
      stackCount: 1,
      appliedAt: Date.now(),
      expiresAt: Date.now() + (effectData.duration || 30000),
      source: effectData.source,
      effects: { ...effectTemplate.effects },
      tickInterval: effectTemplate.tickInterval,
      nextTick: effectTemplate.tickInterval ? Date.now() + effectTemplate.tickInterval : null
    };
    
    // Override effect values if provided
    if (effectData.effects) {
      Object.assign(effect.effects, effectData.effects);
    }
    
    // Check for existing effect stacking
    const existingEffect = target.buffs.find(buff => buff.templateId === effectData.id);
    
    if (existingEffect) {
      // Stack or refresh existing effect
      if (existingEffect.stackCount < effectTemplate.maxStacks) {
        existingEffect.stackCount++;
        existingEffect.expiresAt = effect.expiresAt; // Refresh duration
        
        // Stack effect values
        for (const [key, value] of Object.entries(effect.effects)) {
          if (typeof value === 'number') {
            existingEffect.effects[key] = (existingEffect.effects[key] || 0) + value;
          }
        }
        
        return existingEffect;
      } else {
        // Refresh duration
        existingEffect.expiresAt = effect.expiresAt;
        return existingEffect;
      }
    } else {
      // Add new effect
      target.buffs.push(effect);
      return effect;
    }
  }
  
  removeStatusEffect(target, effectId) {
    const index = target.buffs.findIndex(buff => buff.id === effectId);
    if (index !== -1) {
      target.buffs.splice(index, 1);
      return true;
    }
    return false;
  }
  
  isImmuneToEffect(target, effectId) {
    // Check for immunity buffs
    for (const buff of target.buffs) {
      if (buff.effects && buff.effects.immunities && buff.effects.immunities.includes(effectId)) {
        return true;
      }
    }
    
    // Check for racial or class immunities
    if (target.immunities && target.immunities.includes(effectId)) {
      return true;
    }
    
    return false;
  }
  
  async applySkillEffects(attacker, target, skill, attackResult) {
    if (!skill.specialEffects) return;
    
    for (const effect of skill.specialEffects) {
      switch (effect.type) {
        case 'heal':
          await this.applyHealing(attacker, effect.amount);
          break;
        case 'teleport':
          await this.applyTeleport(attacker, effect);
          break;
        case 'area_damage':
          await this.applyAreaDamage(attacker, target, effect);
          break;
        case 'summon':
          await this.applySummon(attacker, effect);
          break;
        case 'transform':
          await this.applyTransform(attacker, effect);
          break;
      }
    }
  }
  
  async applyHealing(target, amount) {
    // Calculate healing modifiers
    let healingModifier = 1.0;
    
    for (const buff of target.buffs) {
      if (buff.effects && buff.effects.healingModifier) {
        healingModifier *= (1 + buff.effects.healingModifier);
      }
    }
    
    const finalHealing = Math.floor(amount * healingModifier);
    target.stats.health = Math.min(target.stats.maxHealth, target.stats.health + finalHealing);
    
    return finalHealing;
  }
  
  // Combat state management
  initializeCombat(attackerId, targetId) {
    // Check if combat already exists
    let combatId = this.playerCombats.get(attackerId) || this.playerCombats.get(targetId);
    
    if (combatId && this.activeCombats.has(combatId)) {
      const combat = this.activeCombats.get(combatId);
      
      // Add participants if not already in combat
      if (!combat.participants.has(attackerId)) {
        combat.participants.add(attackerId);
        this.playerCombats.set(attackerId, combatId);
      }
      
      if (!combat.participants.has(targetId)) {
        combat.participants.add(targetId);
        this.playerCombats.set(targetId, combatId);
      }
      
      combat.lastActivity = Date.now();
      return combatId;
    }
    
    // Create new combat
    combatId = uuidv4();
    const combat = {
      id: combatId,
      participants: new Set([attackerId, targetId]),
      startTime: Date.now(),
      lastActivity: Date.now(),
      actions: [],
      state: 'active'
    };
    
    this.activeCombats.set(combatId, combat);
    this.playerCombats.set(attackerId, combatId);
    this.playerCombats.set(targetId, combatId);
    
    this.emit('combatStarted', { combatId, participants: [attackerId, targetId] });
    
    return combatId;
  }
  
  updateCombatState(combatId, attackResult) {
    const combat = this.activeCombats.get(combatId);
    if (!combat) return;
    
    combat.lastActivity = Date.now();
    combat.actions.push({
      timestamp: Date.now(),
      type: 'attack',
      result: attackResult
    });
    
    // Limit action history
    if (combat.actions.length > 100) {
      combat.actions = combat.actions.slice(-50);
    }
  }
  
  async endCombat(combatId, reason = 'completed') {
    const combat = this.activeCombats.get(combatId);
    if (!combat) return;
    
    combat.state = 'ended';
    combat.endTime = Date.now();
    combat.endReason = reason;
    
    // Remove participants from combat tracking
    for (const participantId of combat.participants) {
      this.playerCombats.delete(participantId);
      
      // Set participant out of combat
      const participant = await this.getEntity(participantId);
      if (participant) {
        participant.inCombat = false;
        participant.lastCombatTime = Date.now();
      }
    }
    
    this.activeCombats.delete(combatId);
    
    this.emit('combatEnded', { 
      combatId, 
      reason, 
      duration: combat.endTime - combat.startTime,
      participants: Array.from(combat.participants)
    });
  }
  
  // Resource and validation checks
  checkResources(attacker, skill) {
    // Check mana/energy
    if (skill.manaCost && attacker.stats.mana < skill.manaCost) {
      return { success: false, error: 'Insufficient mana' };
    }
    
    if (skill.staminaCost && attacker.stats.stamina < skill.staminaCost) {
      return { success: false, error: 'Insufficient stamina' };
    }
    
    // Check special resources
    if (skill.resourceCost) {
      for (const [resource, cost] of Object.entries(skill.resourceCost)) {
        if (attacker.resources && attacker.resources[resource] < cost) {
          return { success: false, error: `Insufficient ${resource}` };
        }
      }
    }
    
    return { success: true };
  }
  
  consumeResources(attacker, skill) {
    if (skill.manaCost) {
      attacker.stats.mana = Math.max(0, attacker.stats.mana - skill.manaCost);
    }
    
    if (skill.staminaCost) {
      attacker.stats.stamina = Math.max(0, attacker.stats.stamina - skill.staminaCost);
    }
    
    if (skill.resourceCost) {
      for (const [resource, cost] of Object.entries(skill.resourceCost)) {
        if (attacker.resources) {
          attacker.resources[resource] = Math.max(0, attacker.resources[resource] - cost);
        }
      }
    }
  }
  
  checkRange(attacker, target, skill) {
    const distance = this.calculateDistance(attacker.position, target.position);
    const maxRange = skill.range || 5; // Default melee range
    
    if (distance > maxRange) {
      return { success: false, error: 'Target out of range' };
    }
    
    // TODO: Add line of sight check
    
    return { success: true };
  }
  
  canPerformAction(entity) {
    // Check if stunned or incapacitated
    for (const buff of entity.buffs) {
      if (buff.effects && buff.effects.stunned) {
        return false;
      }
    }
    
    // Check if dead
    if (entity.stats.health <= 0) {
      return false;
    }
    
    return true;
  }
  
  applyCooldown(attacker, skill) {
    if (!skill.cooldown) return;
    
    if (!attacker.skillCooldowns) {
      attacker.skillCooldowns = {};
    }
    
    attacker.skillCooldowns[skill.id] = Date.now() + skill.cooldown;
  }
  
  // Combat formulas
  calculateAccuracy(attacker, target, skill) {
    let accuracy = 0.85; // Base 85% accuracy
    
    // Attacker accuracy bonus
    if (attacker.stats.accuracy) {
      accuracy += attacker.stats.accuracy / 100;
    }
    
    // Target evasion
    if (target.stats.evasion) {
      accuracy -= target.stats.evasion / 100;
    }
    
    // Skill accuracy modifier
    if (skill.accuracyModifier) {
      accuracy *= (1 + skill.accuracyModifier);
    }
    
    // Apply buffs/debuffs
    for (const buff of attacker.buffs) {
      if (buff.effects && buff.effects.accuracyModifier) {
        accuracy *= (1 + buff.effects.accuracyModifier);
      }
    }
    
    for (const debuff of target.buffs) {
      if (debuff.effects && debuff.effects.evasionModifier) {
        accuracy *= (1 - debuff.effects.evasionModifier);
      }
    }
    
    return Math.max(0.05, Math.min(0.95, accuracy));
  }
  
  calculateDamage(attacker, target, skill) {
    let baseDamage = 0;
    
    // Base weapon/spell damage
    if (skill.baseDamage) {
      baseDamage = skill.baseDamage;
    } else {
      // Calculate from attacker stats
      baseDamage = attacker.stats.attack || 10;
    }
    
    // Apply attacker damage modifiers
    let damageModifier = 1.0;
    
    // Stat scaling
    if (skill.statScaling) {
      for (const [stat, scaling] of Object.entries(skill.statScaling)) {
        const statValue = attacker.stats[stat] || 0;
        baseDamage += statValue * scaling;
      }
    }
    
    // Apply buffs
    for (const buff of attacker.buffs) {
      if (buff.effects && buff.effects.damageModifier) {
        damageModifier += buff.effects.damageModifier;
      }
    }
    
    // Apply target defense
    let defense = target.stats.defense || 0;
    
    // Apply target defense modifiers
    for (const buff of target.buffs) {
      if (buff.effects && buff.effects.defenseModifier) {
        defense *= (1 + buff.effects.defenseModifier);
      }
    }
    
    // Defense reduction formula
    const finalDamage = Math.max(1, (baseDamage * damageModifier) - (defense * 0.5));
    
    return finalDamage;
  }
  
  calculateCriticalChance(attacker, target, skill) {
    let critChance = 0.05; // Base 5% crit chance
    
    // Attacker crit chance
    if (attacker.stats.criticalChance) {
      critChance += attacker.stats.criticalChance / 100;
    }
    
    // Skill crit modifier
    if (skill.criticalChanceModifier) {
      critChance += skill.criticalChanceModifier;
    }
    
    // Apply buffs
    for (const buff of attacker.buffs) {
      if (buff.effects && buff.effects.criticalChanceModifier) {
        critChance += buff.effects.criticalChanceModifier;
      }
    }
    
    return Math.max(0, Math.min(0.95, critChance));
  }
  
  calculateBlockChance(target, attacker, skill) {
    let blockChance = 0;
    
    // Check if target has a shield equipped
    if (target.equipment && target.equipment.offHand && target.equipment.offHand.type === 'shield') {
      blockChance = 0.15; // Base 15% block chance with shield
      
      // Shield-specific block chance
      if (target.equipment.offHand.blockChance) {
        blockChance = target.equipment.offHand.blockChance / 100;
      }
    }
    
    // Target block skill
    if (target.stats.blockChance) {
      blockChance += target.stats.blockChance / 100;
    }
    
    // Apply buffs
    for (const buff of target.buffs) {
      if (buff.effects && buff.effects.blockChanceModifier) {
        blockChance += buff.effects.blockChanceModifier;
      }
    }
    
    return Math.max(0, Math.min(0.75, blockChance));
  }
  
  calculateDodgeChance(target, attacker, skill) {
    let dodgeChance = 0;
    
    // Target dodge stat
    if (target.stats.dodgeChance) {
      dodgeChance = target.stats.dodgeChance / 100;
    }
    
    // Dexterity-based dodge
    if (target.stats.dexterity) {
      dodgeChance += (target.stats.dexterity - 10) * 0.002; // 0.2% per dex above 10
    }
    
    // Apply buffs
    for (const buff of target.buffs) {
      if (buff.effects && buff.effects.dodgeChanceModifier) {
        dodgeChance += buff.effects.dodgeChanceModifier;
      }
    }
    
    return Math.max(0, Math.min(0.75, dodgeChance));
  }
  
  // Update and maintenance
  update(deltaTime) {
    this.updateStatusEffects(deltaTime);
    this.updateCombatTimeouts();
    this.processPeriodicEffects(deltaTime);
  }
  
  updateStatusEffects(deltaTime) {
    // This would normally iterate through all entities
    // For now, we'll process when entities are accessed
  }
  
  updateCombatTimeouts() {
    const currentTime = Date.now();
    const combatsToEnd = [];
    
    for (const [combatId, combat] of this.activeCombats) {
      if (combat.state === 'active') {
        // End combat if no activity for too long
        if (currentTime - combat.lastActivity > this.combatSettings.combatExitDelay) {
          combatsToEnd.push(combatId);
        }
        
        // End combat if maximum duration exceeded
        if (currentTime - combat.startTime > this.combatSettings.maxCombatDuration) {
          combatsToEnd.push(combatId);
        }
      }
    }
    
    for (const combatId of combatsToEnd) {
      this.endCombat(combatId, 'timeout');
    }
  }
  
  processPeriodicEffects(deltaTime) {
    // Process periodic effects for all entities in combat
    for (const [combatId, combat] of this.activeCombats) {
      for (const participantId of combat.participants) {
        this.processEntityPeriodicEffects(participantId);
      }
    }
  }
  
  async processEntityPeriodicEffects(entityId) {
    const entity = await this.getEntity(entityId);
    if (!entity || !entity.buffs) return;
    
    const currentTime = Date.now();
    
    for (const buff of entity.buffs) {
      // Process tick-based effects
      if (buff.tickInterval && buff.nextTick && currentTime >= buff.nextTick) {
        await this.processPeriodicEffect(entity, buff);
        buff.nextTick = currentTime + buff.tickInterval;
      }
      
      // Remove expired effects
      if (buff.expiresAt && currentTime >= buff.expiresAt) {
        this.removeStatusEffect(entity, buff.id);
      }
    }
  }
  
  async processPeriodicEffect(entity, effect) {
    if (!effect.effects) return;
    
    // Health over time
    if (effect.effects.healthPerTick) {
      const healthChange = effect.effects.healthPerTick * effect.stackCount;
      
      if (healthChange > 0) {
        // Healing
        await this.applyHealing(entity, healthChange);
      } else {
        // Damage
        entity.stats.health = Math.max(0, entity.stats.health + healthChange);
        
        this.queueCombatUpdate({
          type: 'periodic_damage',
          entityId: entity.id,
          effectId: effect.id,
          damage: Math.abs(healthChange),
          timestamp: Date.now()
        });
      }
    }
    
    // Mana over time
    if (effect.effects.manaPerTick) {
      const manaChange = effect.effects.manaPerTick * effect.stackCount;
      entity.stats.mana = Math.max(0, Math.min(entity.stats.maxMana, entity.stats.mana + manaChange));
    }
  }
  
  async handleDeath(victim, killer) {
    // Remove from combat
    const combatId = this.playerCombats.get(victim.id);
    if (combatId) {
      const combat = this.activeCombats.get(combatId);
      if (combat) {
        combat.participants.delete(victim.id);
        this.playerCombats.delete(victim.id);
        
        // End combat if no participants left
        if (combat.participants.size <= 1) {
          await this.endCombat(combatId, 'death');
        }
      }
    }
    
    // Clear buffs/debuffs
    victim.buffs = [];
    victim.inCombat = false;
    
    // Set death state
    victim.isDead = true;
    victim.deathTime = Date.now();
    
    this.emit('entityDied', { 
      victim: victim.id, 
      killer: killer ? killer.id : null,
      combatId 
    });
  }
  
  // Utility methods
  async getEntity(entityId) {
    // This should interface with PlayerManager or NPCManager
    // For now, return mock data structure
    return null;
  }
  
  async getSkill(skillId) {
    // This should interface with SkillManager
    // For now, return mock skill data
    const mockSkills = {
      'basic_attack': {
        id: 'basic_attack',
        name: 'Basic Attack',
        type: 'attack',
        damageType: 'physical',
        baseDamage: 20,
        range: 5,
        cooldown: 1000,
        manaCost: 0,
        staminaCost: 10,
        statScaling: { strength: 1.2 }
      },
      'fireball': {
        id: 'fireball',
        name: 'Fireball',
        type: 'spell',
        damageType: 'fire',
        baseDamage: 40,
        range: 30,
        cooldown: 3000,
        manaCost: 25,
        statScaling: { intelligence: 1.5 },
        effects: [
          { id: 'burning', duration: 5000, source: 'fireball' }
        ]
      }
    };
    
    return mockSkills[skillId] || null;
  }
  
  calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = (pos1.z || 0) - (pos2.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
  
  queueCombatUpdate(updateData) {
    this.combatUpdateQueue.push(updateData);
  }
  
  getUpdates() {
    const updates = [...this.combatUpdateQueue];
    this.combatUpdateQueue.length = 0;
    return updates;
  }
  
  // Public API methods
  getCombatState(playerId) {
    const combatId = this.playerCombats.get(playerId);
    if (!combatId) return null;
    
    return this.activeCombats.get(combatId);
  }
  
  isInCombat(playerId) {
    return this.playerCombats.has(playerId);
  }
  
  getActiveCombats() {
    return Array.from(this.activeCombats.values());
  }
  
  async forceEndCombat(combatId) {
    await this.endCombat(combatId, 'forced');
  }
  
  // Advanced combat features
  async processAreaAttack(attackerId, centerPosition, radius, skillId, options = {}) {
    const targets = await this.getEntitiesInArea(centerPosition, radius);
    const results = [];
    
    for (const target of targets) {
      if (target.id === attackerId) continue; // Don't hit self
      
      const result = await this.processAttack(attackerId, target.id, skillId, options);
      results.push({
        targetId: target.id,
        result
      });
    }
    
    return results;
  }
  
  async getEntitiesInArea(centerPosition, radius) {
    // This should interface with WorldManager to get nearby entities
    return [];
  }
  
  async processChanneledSkill(attackerId, targetId, skillId, channelTime) {
    // Implementation for channeled abilities
    const channelId = uuidv4();
    
    const channel = {
      id: channelId,
      attackerId,
      targetId,
      skillId,
      startTime: Date.now(),
      channelTime,
      interrupted: false
    };
    
    // Store channel for interruption tracking
    // Implementation would depend on game requirements
    
    return channelId;
  }
}

module.exports = CombatSystem;