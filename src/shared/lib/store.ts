import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface Player {
  userId: string;
  username: string;
  characterName: string;
  level: number;
  experience: number;
  experienceRequired: number;
  race: string;
  class: string;
  gender: string;
  position: {
    x: number;
    y: number;
    region: string;
  };
  stats: {
    health: number;
    maxHealth: number;
    mana: number;
    maxMana: number;
    stamina: number;
    maxStamina: number;
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    luck: number;
  };
  currency: {
    gold: number;
    silver: number;
    copper: number;
  };
  inventory: any[];
  equipment: {
    helmet: any;
    chest: any;
    legs: any;
    boots: any;
    weapon: any;
    shield: any;
    ring1: any;
    ring2: any;
    necklace: any;
  };
  skills: any[];
  quests: any[];
  achievements: any[];
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    chatVisible: boolean;
    uiScale: number;
  };
}

interface GameState {
  // Authentication
  isAuthenticated: boolean;
  authToken: string | null;
  
  // Player data
  player: Player | null;
  
  // Game state
  gameState: 'loading' | 'login' | 'character-creation' | 'playing';
  isConnected: boolean;
  serverStatus: 'online' | 'offline' | 'maintenance';
  
  // World state
  currentRegion: string;
  nearbyPlayers: Map<string, any>;
  nearbyNPCs: Map<string, any>;
  nearbyObjects: Map<string, any>;
  
  // UI state
  activeWindows: Set<string>;
  selectedTarget: string | null;
  chatMessages: any[];
  
  // Performance
  fps: number;
  ping: number;
  
  // Actions
  setAuthenticated: (isAuth: boolean, token?: string) => void;
  setPlayer: (player: Player | null) => void;
  setGameState: (state: 'loading' | 'login' | 'character-creation' | 'playing') => void;
  setConnected: (connected: boolean) => void;
  updatePlayerStats: (stats: Partial<Player['stats']>) => void;
  updatePlayerPosition: (position: Partial<Player['position']>) => void;
  addChatMessage: (message: any) => void;
  setActiveWindow: (window: string, active: boolean) => void;
  setSelectedTarget: (target: string | null) => void;
  updateNearbyEntities: (type: 'players' | 'npcs' | 'objects', entities: Map<string, any>) => void;
  updatePerformance: (fps: number, ping: number) => void;
}

export const useGameStore = create<GameState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      authToken: null,
      player: null,
      gameState: 'loading',
      isConnected: false,
      serverStatus: 'offline',
      currentRegion: '',
      nearbyPlayers: new Map(),
      nearbyNPCs: new Map(),
      nearbyObjects: new Map(),
      activeWindows: new Set(),
      selectedTarget: null,
      chatMessages: [],
      fps: 0,
      ping: 0,

      // Actions
      setAuthenticated: (isAuth, token) =>
        set({ isAuthenticated: isAuth, authToken: token }),

      setPlayer: (player) =>
        set({ player }),

      setGameState: (gameState) =>
        set({ gameState }),

      setConnected: (connected) =>
        set({ isConnected: connected }),

      updatePlayerStats: (stats) =>
        set((state) => ({
          player: state.player
            ? { ...state.player, stats: { ...state.player.stats, ...stats } }
            : null,
        })),

      updatePlayerPosition: (position) =>
        set((state) => ({
          player: state.player
            ? { ...state.player, position: { ...state.player.position, ...position } }
            : null,
        })),

      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages.slice(-99), message],
        })),

      setActiveWindow: (window, active) =>
        set((state) => {
          const newActiveWindows = new Set(state.activeWindows);
          if (active) {
            newActiveWindows.add(window);
          } else {
            newActiveWindows.delete(window);
          }
          return { activeWindows: newActiveWindows };
        }),

      setSelectedTarget: (target) =>
        set({ selectedTarget: target }),

      updateNearbyEntities: (type, entities) =>
        set((state) => {
          switch (type) {
            case 'players':
              return { nearbyPlayers: entities };
            case 'npcs':
              return { nearbyNPCs: entities };
            case 'objects':
              return { nearbyObjects: entities };
            default:
              return state;
          }
        }),

      updatePerformance: (fps, ping) =>
        set({ fps, ping }),
    }),
    {
      name: 'epic-mmo-game-state',
    }
  )
);

// Utility hooks
export const usePlayer = () => useGameStore((state) => state.player);
export const useIsAuthenticated = () => useGameStore((state) => state.isAuthenticated);
export const useGameStatus = () => useGameStore((state) => ({
  gameState: state.gameState,
  isConnected: state.isConnected,
  serverStatus: state.serverStatus,
}));
export const useNearbyEntities = () => useGameStore((state) => ({
  players: state.nearbyPlayers,
  npcs: state.nearbyNPCs,
  objects: state.nearbyObjects,
}));
export const useChatMessages = () => useGameStore((state) => state.chatMessages);
export const useActiveWindows = () => useGameStore((state) => state.activeWindows);
export const useSelectedTarget = () => useGameStore((state) => state.selectedTarget);
export const usePerformance = () => useGameStore((state) => ({
  fps: state.fps,
  ping: state.ping,
})); 