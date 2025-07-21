-- Epic MMORPG Database Schema
-- Version: 1.0.0
-- Generated: 2024

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create custom types
CREATE TYPE account_status AS ENUM ('active', 'suspended', 'banned', 'deleted');
CREATE TYPE character_class AS ENUM ('warrior', 'mage', 'archer', 'rogue', 'priest', 'paladin', 'necromancer', 'druid', 'shaman', 'monk');
CREATE TYPE character_race AS ENUM ('human', 'elf', 'dwarf', 'orc', 'undead', 'troll', 'goblin', 'dragon', 'demon', 'angel');
CREATE TYPE item_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'artifact');
CREATE TYPE item_type AS ENUM ('weapon', 'armor', 'accessory', 'consumable', 'material', 'quest', 'currency', 'container');
CREATE TYPE skill_type AS ENUM ('active', 'passive', 'ultimate');
CREATE TYPE quest_status AS ENUM ('available', 'active', 'completed', 'failed', 'abandoned');
CREATE TYPE guild_rank AS ENUM ('master', 'officer', 'veteran', 'member', 'recruit');
CREATE TYPE pvp_mode AS ENUM ('duel', 'arena_2v2', 'arena_3v3', 'arena_5v5', 'battleground', 'world_pvp');
CREATE TYPE trade_status AS ENUM ('pending', 'accepted', 'cancelled', 'expired');
CREATE TYPE achievement_category AS ENUM ('combat', 'exploration', 'social', 'economic', 'collection', 'seasonal', 'special');

-- Create schemas
CREATE SCHEMA IF NOT EXISTS game_core;
CREATE SCHEMA IF NOT EXISTS game_world;
CREATE SCHEMA IF NOT EXISTS game_economy;
CREATE SCHEMA IF NOT EXISTS game_social;
CREATE SCHEMA IF NOT EXISTS game_combat;
CREATE SCHEMA IF NOT EXISTS game_analytics;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Accounts table
CREATE TABLE game_core.accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(32) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    status account_status DEFAULT 'active' NOT NULL,
    premium_until TIMESTAMP,
    last_login TIMESTAMP,
    last_ip INET,
    two_factor_secret VARCHAR(32),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_accounts_email ON game_core.accounts(email);
CREATE INDEX idx_accounts_username ON game_core.accounts(username);
CREATE INDEX idx_accounts_status ON game_core.accounts(status);

-- Account security table
CREATE TABLE game_core.account_security (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id UUID REFERENCES game_core.accounts(id) ON DELETE CASCADE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    security_questions JSONB,
    recovery_email VARCHAR(255),
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Characters table
CREATE TABLE game_core.characters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id UUID REFERENCES game_core.accounts(id) ON DELETE CASCADE,
    name VARCHAR(32) UNIQUE NOT NULL,
    class character_class NOT NULL,
    race character_race NOT NULL,
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    experience BIGINT DEFAULT 0,
    health_current INTEGER DEFAULT 100,
    health_max INTEGER DEFAULT 100,
    mana_current INTEGER DEFAULT 100,
    mana_max INTEGER DEFAULT 100,
    energy_current INTEGER DEFAULT 100,
    energy_max INTEGER DEFAULT 100,
    strength INTEGER DEFAULT 10,
    agility INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    vitality INTEGER DEFAULT 10,
    wisdom INTEGER DEFAULT 10,
    luck INTEGER DEFAULT 10,
    attribute_points INTEGER DEFAULT 0,
    skill_points INTEGER DEFAULT 0,
    gold BIGINT DEFAULT 0,
    premium_currency INTEGER DEFAULT 0,
    playtime_seconds BIGINT DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    kills_pvp INTEGER DEFAULT 0,
    kills_pve INTEGER DEFAULT 0,
    honor_points INTEGER DEFAULT 0,
    arena_rating INTEGER DEFAULT 1000,
    achievement_points INTEGER DEFAULT 0,
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    appearance JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_characters_account_id ON game_core.characters(account_id);
CREATE INDEX idx_characters_name ON game_core.characters(name);
CREATE INDEX idx_characters_level ON game_core.characters(level);
CREATE INDEX idx_characters_class ON game_core.characters(class);
CREATE INDEX idx_characters_race ON game_core.characters(race);
CREATE INDEX idx_characters_is_online ON game_core.characters(is_online);

-- Character statistics
CREATE TABLE game_core.character_stats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    stat_name VARCHAR(64) NOT NULL,
    stat_value NUMERIC(20,4) DEFAULT 0,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, stat_name)
);

-- =====================================================
-- WORLD TABLES
-- =====================================================

-- World zones
CREATE TABLE game_world.zones (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    min_level INTEGER DEFAULT 1,
    max_level INTEGER DEFAULT 100,
    zone_type VARCHAR(32),
    parent_zone_id UUID REFERENCES game_world.zones(id),
    world_position GEOMETRY(Point, 4326),
    bounds GEOMETRY(Polygon, 4326),
    is_pvp_enabled BOOLEAN DEFAULT FALSE,
    is_safe_zone BOOLEAN DEFAULT FALSE,
    respawn_point GEOMETRY(Point, 4326),
    weather_settings JSONB DEFAULT '{}'::jsonb,
    ambient_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_zones_name ON game_world.zones(name);
CREATE INDEX idx_zones_level_range ON game_world.zones(min_level, max_level);
CREATE INDEX idx_zones_world_position ON game_world.zones USING GIST(world_position);
CREATE INDEX idx_zones_bounds ON game_world.zones USING GIST(bounds);

-- Character positions
CREATE TABLE game_world.character_positions (
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE PRIMARY KEY,
    zone_id UUID REFERENCES game_world.zones(id),
    position GEOMETRY(Point, 4326) NOT NULL,
    rotation REAL DEFAULT 0,
    is_indoor BOOLEAN DEFAULT FALSE,
    last_safe_position GEOMETRY(Point, 4326),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_character_positions_zone ON game_world.character_positions(zone_id);
CREATE INDEX idx_character_positions_position ON game_world.character_positions USING GIST(position);

-- NPCs (Non-Player Characters)
CREATE TABLE game_world.npcs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    template_id VARCHAR(128) NOT NULL,
    name VARCHAR(128) NOT NULL,
    title VARCHAR(128),
    level INTEGER DEFAULT 1,
    health_max INTEGER DEFAULT 100,
    mana_max INTEGER DEFAULT 100,
    faction_id UUID,
    behavior_type VARCHAR(32),
    is_hostile BOOLEAN DEFAULT FALSE,
    is_vendor BOOLEAN DEFAULT FALSE,
    is_quest_giver BOOLEAN DEFAULT FALSE,
    is_trainer BOOLEAN DEFAULT FALSE,
    respawn_time_seconds INTEGER DEFAULT 300,
    loot_table_id UUID,
    dialogue_tree JSONB DEFAULT '{}'::jsonb,
    ai_parameters JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_npcs_template_id ON game_world.npcs(template_id);
CREATE INDEX idx_npcs_name ON game_world.npcs(name);
CREATE INDEX idx_npcs_level ON game_world.npcs(level);

-- NPC spawns
CREATE TABLE game_world.npc_spawns (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    npc_id UUID REFERENCES game_world.npcs(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES game_world.zones(id),
    spawn_position GEOMETRY(Point, 4326) NOT NULL,
    spawn_rotation REAL DEFAULT 0,
    patrol_path GEOMETRY(LineString, 4326),
    spawn_radius REAL DEFAULT 10,
    max_count INTEGER DEFAULT 1,
    current_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    last_spawn_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_npc_spawns_zone ON game_world.npc_spawns(zone_id);
CREATE INDEX idx_npc_spawns_position ON game_world.npc_spawns USING GIST(spawn_position);

-- World objects (interactive objects)
CREATE TABLE game_world.world_objects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    object_type VARCHAR(64) NOT NULL,
    name VARCHAR(128) NOT NULL,
    zone_id UUID REFERENCES game_world.zones(id),
    position GEOMETRY(Point, 4326) NOT NULL,
    rotation REAL DEFAULT 0,
    scale REAL DEFAULT 1,
    is_interactive BOOLEAN DEFAULT TRUE,
    interaction_radius REAL DEFAULT 5,
    respawn_time_seconds INTEGER,
    loot_table_id UUID,
    quest_id UUID,
    required_skill VARCHAR(64),
    required_skill_level INTEGER,
    state_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_world_objects_zone ON game_world.world_objects(zone_id);
CREATE INDEX idx_world_objects_position ON game_world.world_objects USING GIST(position);
CREATE INDEX idx_world_objects_type ON game_world.world_objects(object_type);

-- Dungeons and instances
CREATE TABLE game_world.dungeons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    min_level INTEGER DEFAULT 1,
    max_level INTEGER DEFAULT 100,
    min_players INTEGER DEFAULT 1,
    max_players INTEGER DEFAULT 5,
    difficulty_modes JSONB DEFAULT '["normal", "heroic", "mythic"]'::jsonb,
    entry_requirements JSONB DEFAULT '{}'::jsonb,
    boss_list JSONB DEFAULT '[]'::jsonb,
    loot_tables JSONB DEFAULT '{}'::jsonb,
    time_limit_minutes INTEGER,
    reset_schedule VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dungeon instances
CREATE TABLE game_world.dungeon_instances (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    dungeon_id UUID REFERENCES game_world.dungeons(id),
    instance_owner_id UUID REFERENCES game_core.characters(id),
    difficulty VARCHAR(32) DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    progress_data JSONB DEFAULT '{}'::jsonb,
    participants UUID[] DEFAULT ARRAY[]::UUID[]
);

CREATE INDEX idx_dungeon_instances_dungeon ON game_world.dungeon_instances(dungeon_id);
CREATE INDEX idx_dungeon_instances_owner ON game_world.dungeon_instances(instance_owner_id);
CREATE INDEX idx_dungeon_instances_active ON game_world.dungeon_instances(is_active);

-- =====================================================
-- ITEM SYSTEM TABLES
-- =====================================================

-- Item templates
CREATE TABLE game_core.item_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    item_id VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    type item_type NOT NULL,
    subtype VARCHAR(64),
    rarity item_rarity DEFAULT 'common',
    level_requirement INTEGER DEFAULT 1,
    class_requirement character_class[],
    race_requirement character_race[],
    bind_type VARCHAR(32) DEFAULT 'none',
    max_stack INTEGER DEFAULT 1,
    vendor_price BIGINT DEFAULT 0,
    is_tradeable BOOLEAN DEFAULT TRUE,
    is_destroyable BOOLEAN DEFAULT TRUE,
    icon_path VARCHAR(255),
    model_path VARCHAR(255),
    stats JSONB DEFAULT '{}'::jsonb,
    effects JSONB DEFAULT '[]'::jsonb,
    set_id UUID,
    upgrade_paths JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item_templates_item_id ON game_core.item_templates(item_id);
CREATE INDEX idx_item_templates_name ON game_core.item_templates(name);
CREATE INDEX idx_item_templates_type ON game_core.item_templates(type);
CREATE INDEX idx_item_templates_rarity ON game_core.item_templates(rarity);
CREATE INDEX idx_item_templates_level ON game_core.item_templates(level_requirement);

-- Character inventory
CREATE TABLE game_core.character_inventory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    item_template_id UUID REFERENCES game_core.item_templates(id),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    slot_position INTEGER,
    is_equipped BOOLEAN DEFAULT FALSE,
    equipment_slot VARCHAR(32),
    durability_current INTEGER,
    durability_max INTEGER,
    enhancement_level INTEGER DEFAULT 0,
    gem_slots JSONB DEFAULT '[]'::jsonb,
    enchantments JSONB DEFAULT '[]'::jsonb,
    custom_stats JSONB DEFAULT '{}'::jsonb,
    bound_to UUID,
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_inventory_character ON game_core.character_inventory(character_id);
CREATE INDEX idx_inventory_equipped ON game_core.character_inventory(character_id, is_equipped);
CREATE INDEX idx_inventory_slot ON game_core.character_inventory(character_id, slot_position);

-- Bank storage
CREATE TABLE game_core.character_bank (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    tab_number INTEGER DEFAULT 1,
    item_template_id UUID REFERENCES game_core.item_templates(id),
    quantity INTEGER DEFAULT 1,
    slot_position INTEGER,
    stored_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    item_data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_bank_character ON game_core.character_bank(character_id);
CREATE INDEX idx_bank_tab ON game_core.character_bank(character_id, tab_number);

-- Crafting recipes
CREATE TABLE game_core.crafting_recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    recipe_id VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    profession VARCHAR(64) NOT NULL,
    skill_level_required INTEGER DEFAULT 1,
    result_item_id UUID REFERENCES game_core.item_templates(id),
    result_quantity INTEGER DEFAULT 1,
    ingredients JSONB NOT NULL, -- [{item_id, quantity}]
    tools_required JSONB DEFAULT '[]'::jsonb,
    crafting_time_seconds INTEGER DEFAULT 5,
    experience_gained INTEGER DEFAULT 10,
    discovery_based BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recipes_profession ON game_core.crafting_recipes(profession);
CREATE INDEX idx_recipes_skill_level ON game_core.crafting_recipes(skill_level_required);

-- Character professions
CREATE TABLE game_core.character_professions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    profession VARCHAR(64) NOT NULL,
    skill_level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    recipes_learned UUID[] DEFAULT ARRAY[]::UUID[],
    daily_cooldowns JSONB DEFAULT '{}'::jsonb,
    UNIQUE(character_id, profession)
);

CREATE INDEX idx_char_professions ON game_core.character_professions(character_id);

-- =====================================================
-- SKILL AND ABILITY SYSTEM
-- =====================================================

-- Skill templates
CREATE TABLE game_core.skill_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    skill_id VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    type skill_type NOT NULL,
    class_requirement character_class[],
    level_requirement INTEGER DEFAULT 1,
    skill_tree VARCHAR(64),
    max_rank INTEGER DEFAULT 5,
    cooldown_seconds NUMERIC(10,2) DEFAULT 0,
    cast_time_seconds NUMERIC(10,2) DEFAULT 0,
    range_meters NUMERIC(10,2) DEFAULT 0,
    resource_cost JSONB DEFAULT '{}'::jsonb,
    damage_formula JSONB DEFAULT '{}'::jsonb,
    healing_formula JSONB DEFAULT '{}'::jsonb,
    effects JSONB DEFAULT '[]'::jsonb,
    animation_id VARCHAR(128),
    icon_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_skill_id ON game_core.skill_templates(skill_id);
CREATE INDEX idx_skills_class ON game_core.skill_templates USING GIN(class_requirement);
CREATE INDEX idx_skills_type ON game_core.skill_templates(type);

-- Character skills
CREATE TABLE game_core.character_skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    skill_template_id UUID REFERENCES game_core.skill_templates(id),
    current_rank INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    is_on_hotbar BOOLEAN DEFAULT FALSE,
    hotbar_slot INTEGER,
    last_used_at TIMESTAMP,
    usage_count BIGINT DEFAULT 0,
    UNIQUE(character_id, skill_template_id)
);

CREATE INDEX idx_char_skills_character ON game_core.character_skills(character_id);
CREATE INDEX idx_char_skills_hotbar ON game_core.character_skills(character_id, is_on_hotbar);

-- Talent trees
CREATE TABLE game_core.talent_trees (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class character_class NOT NULL,
    tree_name VARCHAR(64) NOT NULL,
    tree_data JSONB NOT NULL, -- Complex tree structure
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class, tree_name)
);

-- Character talents
CREATE TABLE game_core.character_talents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    talent_tree_id UUID REFERENCES game_core.talent_trees(id),
    allocated_points JSONB DEFAULT '{}'::jsonb,
    active_build INTEGER DEFAULT 1,
    saved_builds JSONB DEFAULT '[]'::jsonb,
    UNIQUE(character_id, talent_tree_id)
);

-- =====================================================
-- QUEST SYSTEM
-- =====================================================

-- Quest templates
CREATE TABLE game_core.quest_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quest_id VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    level_requirement INTEGER DEFAULT 1,
    level_recommended INTEGER,
    quest_giver_npc_id UUID,
    quest_type VARCHAR(64) DEFAULT 'main',
    is_repeatable BOOLEAN DEFAULT FALSE,
    is_daily BOOLEAN DEFAULT FALSE,
    is_weekly BOOLEAN DEFAULT FALSE,
    prerequisite_quests UUID[] DEFAULT ARRAY[]::UUID[],
    objectives JSONB NOT NULL, -- [{type, target, count, description}]
    rewards JSONB DEFAULT '{}'::jsonb, -- {experience, gold, items[], reputation}
    dialogue_start TEXT,
    dialogue_progress TEXT,
    dialogue_complete TEXT,
    time_limit_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_quests_quest_id ON game_core.quest_templates(quest_id);
CREATE INDEX idx_quests_level ON game_core.quest_templates(level_requirement);
CREATE INDEX idx_quests_type ON game_core.quest_templates(quest_type);

-- Character quests
CREATE TABLE game_core.character_quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    quest_template_id UUID REFERENCES game_core.quest_templates(id),
    status quest_status DEFAULT 'active',
    progress JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    turn_in_ready BOOLEAN DEFAULT FALSE,
    UNIQUE(character_id, quest_template_id)
);

CREATE INDEX idx_char_quests_character ON game_core.character_quests(character_id);
CREATE INDEX idx_char_quests_status ON game_core.character_quests(character_id, status);

-- Quest chains
CREATE TABLE game_core.quest_chains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chain_name VARCHAR(128) NOT NULL,
    description TEXT,
    quests UUID[] NOT NULL, -- Ordered array of quest_template_ids
    final_rewards JSONB DEFAULT '{}'::jsonb,
    achievement_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ACHIEVEMENT SYSTEM
-- =====================================================

-- Achievement templates
CREATE TABLE game_core.achievement_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    achievement_id VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(256) NOT NULL,
    description TEXT,
    category achievement_category NOT NULL,
    points INTEGER DEFAULT 10,
    icon_path VARCHAR(255),
    is_hidden BOOLEAN DEFAULT FALSE,
    criteria JSONB NOT NULL, -- Complex criteria structure
    rewards JSONB DEFAULT '{}'::jsonb,
    parent_achievement_id UUID REFERENCES game_core.achievement_templates(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_achievements_category ON game_core.achievement_templates(category);
CREATE INDEX idx_achievements_points ON game_core.achievement_templates(points);

-- Character achievements
CREATE TABLE game_core.character_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    achievement_template_id UUID REFERENCES game_core.achievement_templates(id),
    progress JSONB DEFAULT '{}'::jsonb,
    completed_at TIMESTAMP,
    UNIQUE(character_id, achievement_template_id)
);

CREATE INDEX idx_char_achievements ON game_core.character_achievements(character_id);
CREATE INDEX idx_char_achievements_completed ON game_core.character_achievements(character_id, completed_at);

-- =====================================================
-- SOCIAL SYSTEM
-- =====================================================

-- Guilds
CREATE TABLE game_social.guilds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    tag VARCHAR(8) UNIQUE NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES game_core.characters(id),
    level INTEGER DEFAULT 1,
    experience BIGINT DEFAULT 0,
    member_count INTEGER DEFAULT 1,
    max_members INTEGER DEFAULT 50,
    bank_gold BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disbanded_at TIMESTAMP,
    settings JSONB DEFAULT '{}'::jsonb,
    perks JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_guilds_name ON game_social.guilds(name);
CREATE INDEX idx_guilds_tag ON game_social.guilds(tag);
CREATE INDEX idx_guilds_leader ON game_social.guilds(leader_id);

-- Guild members
CREATE TABLE game_social.guild_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    guild_id UUID REFERENCES game_social.guilds(id) ON DELETE CASCADE,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    rank guild_rank DEFAULT 'recruit',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    contribution_points INTEGER DEFAULT 0,
    notes TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    UNIQUE(character_id)
);

CREATE INDEX idx_guild_members_guild ON game_social.guild_members(guild_id);
CREATE INDEX idx_guild_members_character ON game_social.guild_members(character_id);

-- Friends system
CREATE TABLE game_social.friendships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    status VARCHAR(32) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(character_id, friend_id),
    CHECK (character_id != friend_id)
);

CREATE INDEX idx_friendships_character ON game_social.friendships(character_id);
CREATE INDEX idx_friendships_friend ON game_social.friendships(friend_id);
CREATE INDEX idx_friendships_status ON game_social.friendships(status);

-- Block list
CREATE TABLE game_social.block_list (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    blocked_character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    reason TEXT,
    blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, blocked_character_id)
);

CREATE INDEX idx_blocks_character ON game_social.block_list(character_id);
CREATE INDEX idx_blocks_blocked ON game_social.block_list(blocked_character_id);

-- Chat channels
CREATE TABLE game_social.chat_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    type VARCHAR(32) NOT NULL, -- global, zone, trade, guild, party, custom
    owner_id UUID REFERENCES game_core.characters(id),
    password_hash VARCHAR(255),
    max_members INTEGER DEFAULT 100,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_chat_channels_type ON game_social.chat_channels(type);
CREATE INDEX idx_chat_channels_public ON game_social.chat_channels(is_public);

-- Chat messages
CREATE TABLE game_social.chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES game_social.chat_channels(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES game_core.characters(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP,
    reported_count INTEGER DEFAULT 0
);

CREATE INDEX idx_chat_messages_channel ON game_social.chat_messages(channel_id, sent_at DESC);
CREATE INDEX idx_chat_messages_sender ON game_social.chat_messages(sender_id);

-- Private messages
CREATE TABLE game_social.private_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES game_core.characters(id) ON DELETE SET NULL,
    recipient_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    subject VARCHAR(256),
    message TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    deleted_by_sender BOOLEAN DEFAULT FALSE,
    deleted_by_recipient BOOLEAN DEFAULT FALSE,
    attachments JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_pm_recipient ON game_social.private_messages(recipient_id, sent_at DESC);
CREATE INDEX idx_pm_sender ON game_social.private_messages(sender_id, sent_at DESC);

-- Parties/Groups
CREATE TABLE game_social.parties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    leader_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    max_members INTEGER DEFAULT 5,
    loot_mode VARCHAR(32) DEFAULT 'round_robin',
    loot_threshold item_rarity DEFAULT 'rare',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    instance_id UUID,
    is_raid BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_parties_leader ON game_social.parties(leader_id);

-- Party members
CREATE TABLE game_social.party_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    party_id UUID REFERENCES game_social.parties(id) ON DELETE CASCADE,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(32), -- tank, healer, dps
    is_ready BOOLEAN DEFAULT FALSE,
    UNIQUE(character_id)
);

CREATE INDEX idx_party_members_party ON game_social.party_members(party_id);
CREATE INDEX idx_party_members_character ON game_social.party_members(character_id);

-- =====================================================
-- PVP SYSTEM
-- =====================================================

-- PvP seasons
CREATE TABLE game_combat.pvp_seasons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    season_number INTEGER UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    rewards JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT FALSE
);

-- PvP statistics
CREATE TABLE game_combat.pvp_statistics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    season_id UUID REFERENCES game_combat.pvp_seasons(id),
    rating INTEGER DEFAULT 1000,
    matches_played INTEGER DEFAULT 0,
    matches_won INTEGER DEFAULT 0,
    matches_lost INTEGER DEFAULT 0,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    damage_done BIGINT DEFAULT 0,
    healing_done BIGINT DEFAULT 0,
    honor_earned INTEGER DEFAULT 0,
    highest_rating INTEGER DEFAULT 1000,
    UNIQUE(character_id, season_id)
);

CREATE INDEX idx_pvp_stats_character ON game_combat.pvp_statistics(character_id);
CREATE INDEX idx_pvp_stats_season ON game_combat.pvp_statistics(season_id);
CREATE INDEX idx_pvp_stats_rating ON game_combat.pvp_statistics(rating DESC);

-- PvP matches
CREATE TABLE game_combat.pvp_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_type pvp_mode NOT NULL,
    season_id UUID REFERENCES game_combat.pvp_seasons(id),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    winning_team INTEGER,
    map_name VARCHAR(128),
    match_data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_pvp_matches_type ON game_combat.pvp_matches(match_type);
CREATE INDEX idx_pvp_matches_season ON game_combat.pvp_matches(season_id);
CREATE INDEX idx_pvp_matches_time ON game_combat.pvp_matches(started_at DESC);

-- PvP match participants
CREATE TABLE game_combat.pvp_match_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    match_id UUID REFERENCES game_combat.pvp_matches(id) ON DELETE CASCADE,
    character_id UUID REFERENCES game_core.characters(id),
    team INTEGER NOT NULL,
    kills INTEGER DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    damage_done BIGINT DEFAULT 0,
    healing_done BIGINT DEFAULT 0,
    objectives_captured INTEGER DEFAULT 0,
    rating_change INTEGER DEFAULT 0,
    rewards JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_pvp_participants_match ON game_combat.pvp_match_participants(match_id);
CREATE INDEX idx_pvp_participants_character ON game_combat.pvp_match_participants(character_id);

-- Battlegrounds
CREATE TABLE game_combat.battlegrounds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    map_id VARCHAR(128) NOT NULL,
    min_players INTEGER DEFAULT 10,
    max_players INTEGER DEFAULT 40,
    min_level INTEGER DEFAULT 10,
    max_level INTEGER DEFAULT 100,
    objectives JSONB NOT NULL,
    duration_minutes INTEGER DEFAULT 20,
    queue_enabled BOOLEAN DEFAULT TRUE
);

-- Arena teams
CREATE TABLE game_combat.arena_teams (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL,
    team_type VARCHAR(16) NOT NULL, -- 2v2, 3v3, 5v5
    leader_id UUID REFERENCES game_core.characters(id),
    rating INTEGER DEFAULT 1000,
    season_games_played INTEGER DEFAULT 0,
    season_games_won INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    disbanded_at TIMESTAMP
);

CREATE INDEX idx_arena_teams_name ON game_combat.arena_teams(name);
CREATE INDEX idx_arena_teams_rating ON game_combat.arena_teams(rating DESC);

-- Arena team members
CREATE TABLE game_combat.arena_team_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    team_id UUID REFERENCES game_combat.arena_teams(id) ON DELETE CASCADE,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    UNIQUE(team_id, character_id)
);

-- =====================================================
-- ECONOMY SYSTEM
-- =====================================================

-- Auction house
CREATE TABLE game_economy.auctions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID REFERENCES game_core.characters(id),
    item_id UUID NOT NULL,
    item_data JSONB NOT NULL,
    quantity INTEGER DEFAULT 1,
    starting_price BIGINT NOT NULL,
    buyout_price BIGINT,
    current_bid BIGINT DEFAULT 0,
    current_bidder_id UUID REFERENCES game_core.characters(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    sold_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_auctions_seller ON game_economy.auctions(seller_id);
CREATE INDEX idx_auctions_expires ON game_economy.auctions(expires_at);
CREATE INDEX idx_auctions_active ON game_economy.auctions(expires_at) WHERE sold_at IS NULL AND cancelled_at IS NULL;

-- Auction bids
CREATE TABLE game_economy.auction_bids (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    auction_id UUID REFERENCES game_economy.auctions(id) ON DELETE CASCADE,
    bidder_id UUID REFERENCES game_core.characters(id),
    bid_amount BIGINT NOT NULL,
    bid_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_winning BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_bids_auction ON game_economy.auction_bids(auction_id);
CREATE INDEX idx_bids_bidder ON game_economy.auction_bids(bidder_id);

-- Trading
CREATE TABLE game_economy.trades (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    initiator_id UUID REFERENCES game_core.characters(id),
    recipient_id UUID REFERENCES game_core.characters(id),
    status trade_status DEFAULT 'pending',
    initiator_gold BIGINT DEFAULT 0,
    recipient_gold BIGINT DEFAULT 0,
    initiator_items JSONB DEFAULT '[]'::jsonb,
    recipient_items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

CREATE INDEX idx_trades_initiator ON game_economy.trades(initiator_id);
CREATE INDEX idx_trades_recipient ON game_economy.trades(recipient_id);
CREATE INDEX idx_trades_status ON game_economy.trades(status);

-- Currency transactions
CREATE TABLE game_economy.currency_transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id),
    transaction_type VARCHAR(64) NOT NULL,
    currency_type VARCHAR(32) NOT NULL,
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    source VARCHAR(128),
    reference_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_currency_trans_character ON game_economy.currency_transactions(character_id, created_at DESC);
CREATE INDEX idx_currency_trans_type ON game_economy.currency_transactions(transaction_type);

-- Vendor shops
CREATE TABLE game_economy.vendor_shops (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    npc_id UUID REFERENCES game_world.npcs(id),
    shop_name VARCHAR(128) NOT NULL,
    shop_type VARCHAR(64),
    faction_requirement UUID,
    reputation_requirement INTEGER DEFAULT 0,
    items JSONB NOT NULL, -- [{item_id, price, currency, stock, restock_time}]
    refresh_interval_hours INTEGER DEFAULT 24,
    last_refresh TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendor_shops_npc ON game_economy.vendor_shops(npc_id);

-- =====================================================
-- COMBAT SYSTEM
-- =====================================================

-- Combat logs
CREATE TABLE game_combat.combat_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source_id UUID,
    source_type VARCHAR(32), -- player, npc, environment
    target_id UUID,
    target_type VARCHAR(32),
    action_type VARCHAR(64) NOT NULL,
    action_id VARCHAR(128),
    damage_amount INTEGER DEFAULT 0,
    healing_amount INTEGER DEFAULT 0,
    absorbed_amount INTEGER DEFAULT 0,
    overkill_amount INTEGER DEFAULT 0,
    critical_hit BOOLEAN DEFAULT FALSE,
    damage_type VARCHAR(32),
    zone_id UUID REFERENCES game_world.zones(id),
    position GEOMETRY(Point, 4326)
);

CREATE INDEX idx_combat_logs_time ON game_combat.combat_logs(timestamp DESC);
CREATE INDEX idx_combat_logs_source ON game_combat.combat_logs(source_id, timestamp DESC);
CREATE INDEX idx_combat_logs_target ON game_combat.combat_logs(target_id, timestamp DESC);

-- Damage meters
CREATE TABLE game_combat.damage_meters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    encounter_id UUID,
    character_id UUID REFERENCES game_core.characters(id),
    damage_done BIGINT DEFAULT 0,
    healing_done BIGINT DEFAULT 0,
    damage_taken BIGINT DEFAULT 0,
    healing_taken BIGINT DEFAULT 0,
    deaths INTEGER DEFAULT 0,
    duration_seconds INTEGER,
    dps NUMERIC(20,2),
    hps NUMERIC(20,2),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE INDEX idx_damage_meters_encounter ON game_combat.damage_meters(encounter_id);
CREATE INDEX idx_damage_meters_character ON game_combat.damage_meters(character_id);

-- Buff/Debuff tracking
CREATE TABLE game_combat.active_effects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    target_id UUID NOT NULL,
    target_type VARCHAR(32) NOT NULL,
    effect_id VARCHAR(128) NOT NULL,
    source_id UUID,
    stack_count INTEGER DEFAULT 1,
    duration_seconds NUMERIC(10,2),
    expires_at TIMESTAMP,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effect_data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_active_effects_target ON game_combat.active_effects(target_id, target_type);
CREATE INDEX idx_active_effects_expires ON game_combat.active_effects(expires_at);

-- Threat table
CREATE TABLE game_combat.threat_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    npc_instance_id UUID NOT NULL,
    character_id UUID REFERENCES game_core.characters(id),
    threat_amount INTEGER DEFAULT 0,
    last_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(npc_instance_id, character_id)
);

CREATE INDEX idx_threat_npc ON game_combat.threat_tables(npc_instance_id);
CREATE INDEX idx_threat_amount ON game_combat.threat_tables(npc_instance_id, threat_amount DESC);

-- =====================================================
-- LOOT SYSTEM
-- =====================================================

-- Loot tables
CREATE TABLE game_core.loot_tables (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(128) UNIQUE NOT NULL,
    description TEXT,
    loot_entries JSONB NOT NULL, -- [{item_id, chance, min_quantity, max_quantity, conditions}]
    gold_min BIGINT DEFAULT 0,
    gold_max BIGINT DEFAULT 0,
    experience_bonus INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loot_tables_name ON game_core.loot_tables(table_name);

-- Loot history
CREATE TABLE game_core.loot_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id),
    source_type VARCHAR(64) NOT NULL,
    source_id UUID,
    item_id UUID REFERENCES game_core.item_templates(id),
    quantity INTEGER DEFAULT 1,
    looted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    zone_id UUID REFERENCES game_world.zones(id)
);

CREATE INDEX idx_loot_history_character ON game_core.loot_history(character_id, looted_at DESC);
CREATE INDEX idx_loot_history_item ON game_core.loot_history(item_id);

-- =====================================================
-- REPUTATION SYSTEM
-- =====================================================

-- Factions
CREATE TABLE game_core.factions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    faction_id VARCHAR(128) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    base_reputation INTEGER DEFAULT 0,
    max_reputation INTEGER DEFAULT 42000,
    reputation_levels JSONB NOT NULL, -- [{level, min_rep, name, perks}]
    opposing_factions UUID[] DEFAULT ARRAY[]::UUID[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_factions_faction_id ON game_core.factions(faction_id);

-- Character reputation
CREATE TABLE game_core.character_reputation (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_id UUID REFERENCES game_core.characters(id) ON DELETE CASCADE,
    faction_id UUID REFERENCES game_core.factions(id),
    reputation_value INTEGER DEFAULT 0,
    reputation_level VARCHAR(64),
    is_at_war BOOLEAN DEFAULT FALSE,
    daily_cap_remaining INTEGER DEFAULT 0,
    weekly_cap_remaining INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(character_id, faction_id)
);

CREATE INDEX idx_char_reputation ON game_core.character_reputation(character_id);
CREATE INDEX idx_char_rep_faction ON game_core.character_reputation(faction_id);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- Player sessions
CREATE TABLE game_analytics.player_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    account_id UUID REFERENCES game_core.accounts(id),
    character_id UUID REFERENCES game_core.characters(id),
    session_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP,
    duration_seconds INTEGER,
    ip_address INET,
    client_version VARCHAR(32),
    activities JSONB DEFAULT '[]'::jsonb
);

CREATE INDEX idx_sessions_account ON game_analytics.player_sessions(account_id);
CREATE INDEX idx_sessions_character ON game_analytics.player_sessions(character_id);
CREATE INDEX idx_sessions_time ON game_analytics.player_sessions(session_start DESC);

-- Economy analytics
CREATE TABLE game_analytics.economy_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    snapshot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_gold_circulation BIGINT,
    active_auctions INTEGER,
    average_item_prices JSONB,
    gold_sinks JSONB,
    gold_sources JSONB
);

CREATE INDEX idx_economy_snapshots_time ON game_analytics.economy_snapshots(snapshot_time DESC);

-- Performance metrics
CREATE TABLE game_analytics.performance_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    metric_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    server_name VARCHAR(64),
    metric_type VARCHAR(64),
    metric_value NUMERIC(20,4),
    additional_data JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_performance_time ON game_analytics.performance_metrics(metric_time DESC);
CREATE INDEX idx_performance_type ON game_analytics.performance_metrics(metric_type);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Updated timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON game_core.accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON game_core.characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_security_updated_at BEFORE UPDATE ON game_core.account_security
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Character online status function
CREATE OR REPLACE FUNCTION update_character_online_status(
    p_character_id UUID,
    p_is_online BOOLEAN
)
RETURNS VOID AS $$
BEGIN
    UPDATE game_core.characters
    SET is_online = p_is_online,
        last_seen = CASE WHEN NOT p_is_online THEN CURRENT_TIMESTAMP ELSE last_seen END
    WHERE id = p_character_id;
END;
$$ LANGUAGE plpgsql;

-- Add experience to character
CREATE OR REPLACE FUNCTION add_character_experience(
    p_character_id UUID,
    p_experience INTEGER
)
RETURNS TABLE(new_level INTEGER, total_experience BIGINT) AS $$
DECLARE
    v_current_level INTEGER;
    v_current_exp BIGINT;
    v_new_exp BIGINT;
    v_new_level INTEGER;
BEGIN
    SELECT level, experience INTO v_current_level, v_current_exp
    FROM game_core.characters
    WHERE id = p_character_id;
    
    v_new_exp := v_current_exp + p_experience;
    v_new_level := v_current_level;
    
    -- Simple level calculation (customize as needed)
    WHILE v_new_exp >= (v_new_level * 1000 * v_new_level) LOOP
        v_new_level := v_new_level + 1;
    END LOOP;
    
    UPDATE game_core.characters
    SET experience = v_new_exp,
        level = v_new_level,
        attribute_points = attribute_points + (v_new_level - v_current_level) * 5,
        skill_points = skill_points + (v_new_level - v_current_level) * 2
    WHERE id = p_character_id;
    
    RETURN QUERY SELECT v_new_level, v_new_exp;
END;
$$ LANGUAGE plpgsql;

-- Calculate item stats with enhancements
CREATE OR REPLACE FUNCTION calculate_item_stats(
    p_item_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_base_stats JSONB;
    v_enhanced_stats JSONB;
    v_enhancement_level INTEGER;
    v_custom_stats JSONB;
BEGIN
    SELECT 
        it.stats,
        ci.enhancement_level,
        ci.custom_stats
    INTO v_base_stats, v_enhancement_level, v_custom_stats
    FROM game_core.character_inventory ci
    JOIN game_core.item_templates it ON ci.item_template_id = it.id
    WHERE ci.id = p_item_id;
    
    -- Apply enhancement bonuses
    v_enhanced_stats := v_base_stats;
    
    IF v_enhancement_level > 0 THEN
        -- Add enhancement bonus logic here
        v_enhanced_stats := jsonb_set(
            v_enhanced_stats,
            '{power}',
            to_jsonb(COALESCE((v_base_stats->>'power')::INTEGER, 0) + (v_enhancement_level * 10))
        );
    END IF;
    
    -- Merge with custom stats
    v_enhanced_stats := v_enhanced_stats || COALESCE(v_custom_stats, '{}'::jsonb);
    
    RETURN v_enhanced_stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Additional performance indexes
CREATE INDEX idx_characters_online_level ON game_core.characters(level DESC) WHERE is_online = TRUE;
CREATE INDEX idx_items_rarity_level ON game_core.item_templates(rarity, level_requirement);
CREATE INDEX idx_quests_daily ON game_core.quest_templates(level_requirement) WHERE is_daily = TRUE;
CREATE INDEX idx_pvp_leaderboard ON game_combat.pvp_statistics(season_id, rating DESC) WHERE matches_played >= 10;

-- =====================================================
-- INITIAL SEEDS AND PERMISSIONS
-- =====================================================

-- Create default factions
INSERT INTO game_core.factions (faction_id, name, description, reputation_levels) VALUES
('alliance', 'The Alliance', 'Noble defenders of justice and order', 
 '[{"level": "hated", "min_rep": -42000}, {"level": "hostile", "min_rep": -6000}, 
   {"level": "unfriendly", "min_rep": -3000}, {"level": "neutral", "min_rep": 0}, 
   {"level": "friendly", "min_rep": 3000}, {"level": "honored", "min_rep": 9000}, 
   {"level": "revered", "min_rep": 21000}, {"level": "exalted", "min_rep": 42000}]'::jsonb),
('horde', 'The Horde', 'Fierce warriors fighting for survival and honor',
 '[{"level": "hated", "min_rep": -42000}, {"level": "hostile", "min_rep": -6000}, 
   {"level": "unfriendly", "min_rep": -3000}, {"level": "neutral", "min_rep": 0}, 
   {"level": "friendly", "min_rep": 3000}, {"level": "honored", "min_rep": 9000}, 
   {"level": "revered", "min_rep": 21000}, {"level": "exalted", "min_rep": 42000}]'::jsonb);

-- Create default chat channels
INSERT INTO game_social.chat_channels (name, type, is_public) VALUES
('General', 'global', TRUE),
('Trade', 'trade', TRUE),
('LookingForGroup', 'global', TRUE),
('Recruitment', 'global', TRUE);

-- Grant permissions
GRANT USAGE ON SCHEMA game_core TO PUBLIC;
GRANT USAGE ON SCHEMA game_world TO PUBLIC;
GRANT USAGE ON SCHEMA game_economy TO PUBLIC;
GRANT USAGE ON SCHEMA game_social TO PUBLIC;
GRANT USAGE ON SCHEMA game_combat TO PUBLIC;
GRANT USAGE ON SCHEMA game_analytics TO PUBLIC;

-- Performance configuration
ALTER SYSTEM SET shared_buffers = '2GB';
ALTER SYSTEM SET effective_cache_size = '6GB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;
ALTER SYSTEM SET work_mem = '16MB';
ALTER SYSTEM SET min_wal_size = '1GB';
ALTER SYSTEM SET max_wal_size = '4GB';