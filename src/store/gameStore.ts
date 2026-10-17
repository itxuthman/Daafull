/**
 * Metro Dash 3D - Zustand Game State Store
 * Persistent save system, human characters, hoverboards, missions, and audio settings.
 */

import { create } from 'zustand';
import { soundEngine } from '../audio/SoundEngine';
import { 
  Achievement, 
  ActivePowerUp, 
  CharacterConfig, 
  EnvironmentTheme, 
  GameState, 
  Mission, 
  PowerUpType, 
  RunStats, 
  UpgradeConfig 
} from '../types/game';

export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'tristan',
    name: 'Tristan',
    title: 'Subway Surfer Kid',
    description: 'Streetwear daredevil with black hooded sweatshirt, graffiti back patch, and iconic yellow hoverboard.',
    cost: 0,
    unlocked: true,
    colors: {
      skin: '#e0ac69',
      hair: '#231c19',
      jacket: '#18181b', // Black hoodie
      hood: '#18181b',
      pants: '#2563eb',  // Classic blue jeans
      shoes: '#ffffff',  // White & black skate sneakers
      accent: '#facc15', // Vibrant graffiti yellow
      boardPrimary: '#facc15', // Sunny Yellow board
      boardSecondary: '#0284c7' // Blue racing striping
    },
    specialty: '+15% Hoverboard Duration'
  },
  {
    id: 'zoe',
    name: 'Zoe',
    title: 'Graffiti Artist',
    description: 'Trendy street artist in violet hoodie, neon skate cap, and bubblegum hoverboard.',
    cost: 500,
    unlocked: false,
    colors: {
      skin: '#f5d0b5',
      hair: '#d946ef',
      jacket: '#581c87', // Deep purple
      hood: '#6b21a8',
      pants: '#0f172a',
      shoes: '#06b6d4',
      accent: '#ec4899',
      boardPrimary: '#ec4899',
      boardSecondary: '#a855f7'
    },
    specialty: '+15% Coin Magnet Radius'
  },
  {
    id: 'leo',
    name: 'Leo',
    title: 'Parkour Ace',
    description: 'High-speed urban acrobat in scarlet varsity windbreaker and racing hoverboard.',
    cost: 1200,
    unlocked: false,
    colors: {
      skin: '#8d5524',
      hair: '#111827',
      jacket: '#dc2626', // Red jacket
      hood: '#b91c1c',
      pants: '#334155',
      shoes: '#f59e0b',
      accent: '#fef08a',
      boardPrimary: '#ef4444',
      boardSecondary: '#fbbf24'
    },
    specialty: '+20% Super Sneakers Bounce'
  },
  {
    id: 'amara',
    name: 'Amara',
    title: 'Riviera Surfer',
    description: 'Coastal sprinter in teal windbreaker and solar-flare surfboard hoverboard.',
    cost: 2500,
    unlocked: false,
    colors: {
      skin: '#451a03',
      hair: '#09090b',
      jacket: '#0d9488', // Teal
      hood: '#115e59',
      pants: '#1e293b',
      shoes: '#10b981',
      accent: '#2dd4bf',
      boardPrimary: '#14b8a6',
      boardSecondary: '#38bdf8'
    },
    specialty: 'Starts every run with a Hoverboard ready'
  }
];

export const INITIAL_UPGRADES: Record<PowerUpType, UpgradeConfig> = {
  hoverboard: {
    id: 'hoverboard',
    name: 'Hoverboard',
    description: 'Surfs smoothly along the tracks, protecting from one crash.',
    level: 1,
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 1.8,
    baseDuration: 30,
    durationPerLevel: 5.0
  },
  magnet: {
    id: 'magnet',
    name: 'Coin Magnet',
    description: 'Attracts all coins in nearby lanes automatically.',
    level: 1,
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 1.8,
    baseDuration: 10,
    durationPerLevel: 2.5
  },
  jetpack: {
    id: 'jetpack',
    name: 'Rocket Jetpack',
    description: 'Soar high above the tracks into a sky of golden coins.',
    level: 1,
    maxLevel: 5,
    baseCost: 300,
    costMultiplier: 2.0,
    baseDuration: 8,
    durationPerLevel: 2.0
  },
  sneakers: {
    id: 'sneakers',
    name: 'Super Sneakers',
    description: 'Leap effortlessly over oncoming trains and barriers.',
    level: 1,
    maxLevel: 5,
    baseCost: 150,
    costMultiplier: 1.6,
    baseDuration: 12,
    durationPerLevel: 3.0
  },
  multiplier: {
    id: 'multiplier',
    name: '2x Multiplier',
    description: 'Doubles all score and coin earnings during run.',
    level: 1,
    maxLevel: 5,
    baseCost: 250,
    costMultiplier: 1.8,
    baseDuration: 12,
    durationPerLevel: 3.0
  },
  shield: {
    id: 'shield',
    name: 'Energy Shield',
    description: 'Absorbs one collision with a train or obstacle.',
    level: 1,
    maxLevel: 5,
    baseCost: 350,
    costMultiplier: 2.2,
    baseDuration: 15,
    durationPerLevel: 3.5
  },
  speed: {
    id: 'speed',
    name: 'Hyper Dash',
    description: 'Invincible high-speed burst through barriers.',
    level: 1,
    maxLevel: 5,
    baseCost: 400,
    costMultiplier: 2.2,
    baseDuration: 6,
    durationPerLevel: 1.5
  }
};

const DEFAULT_MISSIONS: Mission[] = [
  {
    id: 'm_coins_100',
    title: 'Coin Collector',
    description: 'Collect 100 golden coins across your subway runs.',
    target: 100,
    current: 0,
    reward: 150,
    completed: false,
    claimed: false,
    type: 'coins'
  },
  {
    id: 'm_dist_1000',
    title: 'Metro Marathon',
    description: 'Run a cumulative distance of 1,000 meters.',
    target: 1000,
    current: 0,
    reward: 200,
    completed: false,
    claimed: false,
    type: 'distance'
  },
  {
    id: 'm_tokens_15',
    title: 'City Tour Explorer',
    description: 'Collect 15 Eiffel city tokens on the tracks.',
    target: 15,
    current: 3,
    reward: 300,
    completed: false,
    claimed: false,
    type: 'tokens'
  },
  {
    id: 'm_jumps_20',
    title: 'Train Leaper',
    description: 'Jump over 20 obstacles or train cars.',
    target: 20,
    current: 0,
    reward: 120,
    completed: false,
    claimed: false,
    type: 'jumps'
  },
  {
    id: 'm_slides_15',
    title: 'Low Rider',
    description: 'Slide under 15 railway signs or barriers.',
    target: 15,
    current: 0,
    reward: 120,
    completed: false,
    claimed: false,
    type: 'slides'
  },
  {
    id: 'm_powerups_5',
    title: 'Power Surge',
    description: 'Pick up 5 power-ups on the subway tracks.',
    target: 5,
    current: 0,
    reward: 250,
    completed: false,
    claimed: false,
    type: 'powerups'
  }
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_run',
    title: 'Subway Surfer Debut',
    description: 'Complete your first high-speed railway sprint.',
    icon: '🛹',
    unlocked: false,
    progress: 0,
    target: 1
  },
  {
    id: 'board_rider',
    title: 'Hoverboard Master',
    description: 'Deploy hoverboards 10 times to dodge trains.',
    icon: '⚡',
    unlocked: false,
    progress: 0,
    target: 10
  },
  {
    id: 'coin_hoarder',
    title: 'Subway Tycoon',
    description: 'Collect 1,000 golden star coins.',
    icon: '💰',
    unlocked: false,
    progress: 0,
    target: 1000
  },
  {
    id: 'token_collector',
    title: 'World Tour Champion',
    description: 'Collect 15 City Tour tokens.',
    icon: '🗼',
    unlocked: false,
    progress: 3,
    target: 15
  }
];

const SAVE_KEY = 'metro_dash_3d_save_v2';

interface SavedData {
  highScore: number;
  totalCoins: number;
  hoverboards: number;
  tokens: number;
  unlockedCharacters: string[];
  selectedCharacterId: string;
  theme: EnvironmentTheme;
  upgrades: Record<PowerUpType, number>;
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  vibrationEnabled: boolean;
  graphicsQuality: 'high' | 'low';
  missions: Mission[];
  achievements: Achievement[];
}

function loadSavedData(): Partial<SavedData> {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to load saved state from localStorage', err);
  }
  return {};
}

function saveToStorage(state: GameStore) {
  try {
    const data: SavedData = {
      highScore: state.highScore,
      totalCoins: state.totalCoins,
      hoverboards: state.hoverboards,
      tokens: state.tokens,
      unlockedCharacters: state.unlockedCharacters,
      selectedCharacterId: state.selectedCharacterId,
      theme: state.environmentTheme,
      upgrades: Object.fromEntries(
        Object.entries(state.upgrades).map(([k, v]) => [k, v.level])
      ) as Record<PowerUpType, number>,
      soundEnabled: state.soundEnabled,
      musicEnabled: state.musicEnabled,
      soundVolume: state.soundVolume,
      musicVolume: state.musicVolume,
      vibrationEnabled: state.vibrationEnabled,
      graphicsQuality: state.graphicsQuality,
      missions: state.missions,
      achievements: state.achievements
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save to localStorage', err);
  }
}

export interface GameStore {
  // State
  gameState: GameState;
  score: number;
  coins: number;
  tokens: number;
  distance: number;
  highScore: number;
  totalCoins: number;
  hoverboards: number;
  hoverboardActive: boolean;
  currentSpeed: number;
  multiplier: number;
  shieldActive: boolean;

  activePowerUps: Partial<Record<PowerUpType, ActivePowerUp>>;
  
  // Customization & Progression
  selectedCharacterId: string;
  unlockedCharacters: string[];
  environmentTheme: EnvironmentTheme;
  graphicsQuality: 'high' | 'low';
  upgrades: Record<PowerUpType, UpgradeConfig>;
  missions: Mission[];
  achievements: Achievement[];
  
  // Settings
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  vibrationEnabled: boolean;

  // Run Summary
  lastRunStats: RunStats | null;

  // Actions
  startCountdown: () => void;
  beginPlaying: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  returnToMenu: () => void;
  endGame: (stats: RunStats) => void;
  deployHoverboard: () => boolean;
  
  // In-Game updates (called by GameEngine)
  updateHUD: (score: number, coins: number, distance: number, speed: number, tokens?: number) => void;
  activatePowerUp: (type: PowerUpType, duration: number) => void;
  updatePowerUps: (active: Partial<Record<PowerUpType, ActivePowerUp>>, hasShield: boolean, isBoardActive: boolean) => void;
  
  // Shop & Progression actions
  buyHoverboard: () => boolean;
  selectCharacter: (id: string) => void;
  unlockCharacter: (id: string) => boolean;
  upgradePowerUp: (type: PowerUpType) => boolean;
  claimMission: (id: string) => void;
  setTheme: (theme: EnvironmentTheme) => void;
  setGraphicsQuality: (quality: 'high' | 'low') => void;
  setSoundEnabled: (enabled: boolean) => void;
  setMusicEnabled: (enabled: boolean) => void;
  setSoundVolume: (vol: number) => void;
  setMusicVolume: (vol: number) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  resetProgress: () => void;
}

const saved = loadSavedData();

export const useGameStore = create<GameStore>((set, get) => {
  // Restore initial upgrades
  const restoredUpgrades = { ...INITIAL_UPGRADES };
  if (saved.upgrades) {
    Object.entries(saved.upgrades).forEach(([key, lvl]) => {
      const pKey = key as PowerUpType;
      if (restoredUpgrades[pKey]) {
        restoredUpgrades[pKey] = {
          ...restoredUpgrades[pKey],
          level: lvl
        };
      }
    });
  }

  // Restore audio settings in soundEngine
  const soundEnabled = saved.soundEnabled ?? true;
  const musicEnabled = saved.musicEnabled ?? true;
  const soundVolume = saved.soundVolume ?? 0.7;
  const musicVolume = saved.musicVolume ?? 0.5;

  soundEngine.setMuted(!soundEnabled);
  soundEngine.setSfxVolume(soundVolume);
  soundEngine.setMusicVolume(musicVolume);

  return {
    gameState: 'menu',
    score: 0,
    coins: 0,
    tokens: saved.tokens ?? 3,
    distance: 0,
    highScore: saved.highScore ?? 424921, // Start with great score like video
    totalCoins: saved.totalCoins ?? 3522, // Start with authentic amount like video!
    hoverboards: saved.hoverboards ?? 5,  // Free hoverboards for instant fun
    hoverboardActive: false,
    currentSpeed: 18,
    multiplier: 21, // Iconic purple x21 multiplier from the video!
    shieldActive: false,
    activePowerUps: {},

    selectedCharacterId: (saved.selectedCharacterId && saved.selectedCharacterId !== 'blitz' && saved.selectedCharacterId !== 'jax') 
      ? saved.selectedCharacterId 
      : 'tristan',
    unlockedCharacters: saved.unlockedCharacters && !saved.unlockedCharacters.includes('blitz') 
      ? saved.unlockedCharacters 
      : ['tristan'],
    environmentTheme: saved.theme ?? 'metro',
    graphicsQuality: saved.graphicsQuality ?? 'high',
    upgrades: restoredUpgrades,
    missions: saved.missions ?? DEFAULT_MISSIONS,
    achievements: saved.achievements ?? DEFAULT_ACHIEVEMENTS,

    soundEnabled,
    musicEnabled,
    soundVolume,
    musicVolume,
    vibrationEnabled: saved.vibrationEnabled ?? true,

    lastRunStats: null,

    startCountdown: () => {
      soundEngine.playWhistle();
      set({
        gameState: 'countdown',
        score: 0,
        coins: 0,
        distance: 0,
        activePowerUps: {},
        hoverboardActive: false,
        shieldActive: false
      });
    },

    beginPlaying: () => {
      if (get().musicEnabled) {
        soundEngine.startMusic();
      }
      set({ gameState: 'playing' });
    },

    pauseGame: () => {
      soundEngine.stopMusic();
      set({ gameState: 'paused' });
    },

    resumeGame: () => {
      if (get().musicEnabled) {
        soundEngine.startMusic();
      }
      set({ gameState: 'playing' });
    },

    returnToMenu: () => {
      soundEngine.stopMusic();
      set({ gameState: 'menu', hoverboardActive: false });
    },

    deployHoverboard: () => {
      const state = get();
      if (state.hoverboards > 0 && !state.hoverboardActive) {
        soundEngine.playPowerUp();
        set({
          hoverboards: state.hoverboards - 1,
          hoverboardActive: true
        });
        get().activatePowerUp('hoverboard', 25);
        saveToStorage(get());
        return true;
      }
      return false;
    },

    buyHoverboard: () => {
      const state = get();
      const cost = 300;
      if (state.totalCoins >= cost) {
        soundEngine.playCoin();
        set({
          totalCoins: state.totalCoins - cost,
          hoverboards: state.hoverboards + 3
        });
        saveToStorage(get());
        return true;
      }
      return false;
    },

    endGame: (stats: RunStats) => {
      soundEngine.stopMusic();
      soundEngine.playCrash();

      const state = get();
      const newHighScore = Math.max(state.highScore, stats.score);
      const newTotalCoins = state.totalCoins + stats.coins;
      const newTokens = state.tokens + (stats.tokens || 0);

      // Update Missions
      const updatedMissions = state.missions.map(m => {
        if (m.completed) return m;
        let progress = m.current;
        if (m.type === 'coins') progress += stats.coins;
        if (m.type === 'tokens') progress += (stats.tokens || 0);
        if (m.type === 'distance') progress += stats.distance;
        if (m.type === 'jumps') progress += stats.jumps;
        if (m.type === 'slides') progress += stats.slides;
        if (m.type === 'powerups') progress += stats.powerupsCollected;
        if (m.type === 'score') progress = Math.max(progress, stats.score);

        const isComplete = progress >= m.target;
        return {
          ...m,
          current: progress,
          completed: isComplete
        };
      });

      // Update Achievements
      const updatedAchievements = state.achievements.map(a => {
        if (a.unlocked) return a;
        let p = a.progress;
        if (a.id === 'first_run') p += 1;
        if (a.id === 'coin_hoarder') p = newTotalCoins;
        if (a.id === 'token_collector') p = newTokens;

        const unlocked = p >= a.target;
        return {
          ...a,
          progress: p,
          unlocked,
          unlockedAt: unlocked && !a.unlocked ? new Date().toISOString() : a.unlockedAt
        };
      });

      const nextState = {
        ...state,
        gameState: 'gameover' as GameState,
        highScore: newHighScore,
        totalCoins: newTotalCoins,
        tokens: newTokens,
        hoverboardActive: false,
        lastRunStats: stats,
        missions: updatedMissions,
        achievements: updatedAchievements
      };

      set(nextState);
      saveToStorage(get());
    },

    updateHUD: (score: number, coins: number, distance: number, speed: number, tokens?: number) => {
      set(prev => ({
        score,
        coins,
        distance,
        currentSpeed: speed,
        tokens: tokens !== undefined ? tokens : prev.tokens
      }));
    },

    activatePowerUp: (type: PowerUpType, duration: number) => {
      soundEngine.playPowerUp();
      const current = { ...get().activePowerUps };
      current[type] = {
        type,
        duration,
        remaining: duration
      };
      set({ 
        activePowerUps: current,
        hoverboardActive: type === 'hoverboard' ? true : get().hoverboardActive
      });
    },

    updatePowerUps: (active: Partial<Record<PowerUpType, ActivePowerUp>>, hasShield: boolean, isBoardActive: boolean) => {
      set({ 
        activePowerUps: active, 
        shieldActive: hasShield,
        hoverboardActive: isBoardActive
      });
    },

    selectCharacter: (id: string) => {
      soundEngine.playClick();
      set({ selectedCharacterId: id });
      saveToStorage(get());
    },

    unlockCharacter: (id: string) => {
      const char = CHARACTERS.find(c => c.id === id);
      if (!char) return false;

      const state = get();
      if (state.totalCoins >= char.cost && !state.unlockedCharacters.includes(id)) {
        soundEngine.playPowerUp();
        const updatedCoins = state.totalCoins - char.cost;
        const updatedList = [...state.unlockedCharacters, id];
        set({
          totalCoins: updatedCoins,
          unlockedCharacters: updatedList,
          selectedCharacterId: id
        });
        saveToStorage(get());
        return true;
      }
      return false;
    },

    upgradePowerUp: (type: PowerUpType) => {
      const state = get();
      const up = state.upgrades[type];
      if (!up || up.level >= up.maxLevel) return false;

      const cost = Math.round(up.baseCost * Math.pow(up.costMultiplier, up.level - 1));
      if (state.totalCoins >= cost) {
        soundEngine.playPowerUp();
        const updatedUpgrades = {
          ...state.upgrades,
          [type]: {
            ...up,
            level: up.level + 1
          }
        };
        set({
          totalCoins: state.totalCoins - cost,
          upgrades: updatedUpgrades
        });
        saveToStorage(get());
        return true;
      }
      return false;
    },

    claimMission: (id: string) => {
      const state = get();
      const mission = state.missions.find(m => m.id === id);
      if (mission && mission.completed && !mission.claimed) {
        soundEngine.playCoin();
        const updatedMissions = state.missions.map(m => 
          m.id === id ? { ...m, claimed: true } : m
        );
        set({
          totalCoins: state.totalCoins + mission.reward,
          missions: updatedMissions
        });
        saveToStorage(get());
      }
    },

    setTheme: (theme: EnvironmentTheme) => {
      set({ environmentTheme: theme });
      saveToStorage(get());
    },

    setGraphicsQuality: (quality: 'high' | 'low') => {
      set({ graphicsQuality: quality });
      saveToStorage(get());
    },

    setSoundEnabled: (enabled: boolean) => {
      soundEngine.setMuted(!enabled);
      set({ soundEnabled: enabled });
      saveToStorage(get());
    },

    setMusicEnabled: (enabled: boolean) => {
      if (!enabled) soundEngine.stopMusic();
      else if (get().gameState === 'playing') soundEngine.startMusic();
      set({ musicEnabled: enabled });
      saveToStorage(get());
    },

    setSoundVolume: (vol: number) => {
      soundEngine.setSfxVolume(vol);
      set({ soundVolume: vol });
      saveToStorage(get());
    },

    setMusicVolume: (vol: number) => {
      soundEngine.setMusicVolume(vol);
      set({ musicVolume: vol });
      saveToStorage(get());
    },

    setVibrationEnabled: (enabled: boolean) => {
      set({ vibrationEnabled: enabled });
      saveToStorage(get());
    },

    resetProgress: () => {
      localStorage.removeItem(SAVE_KEY);
      set({
        highScore: 424921,
        totalCoins: 3522,
        tokens: 3,
        hoverboards: 5,
        hoverboardActive: false,
        selectedCharacterId: 'tristan',
        unlockedCharacters: ['tristan'],
        vibrationEnabled: true,
        upgrades: INITIAL_UPGRADES,
        missions: DEFAULT_MISSIONS,
        achievements: DEFAULT_ACHIEVEMENTS
      });
    }
  };
});
