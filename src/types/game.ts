/**
 * Metro Dash 3D - Type Definitions
 */

export type GameState = 'menu' | 'countdown' | 'playing' | 'paused' | 'gameover';

export type Lane = -1 | 0 | 1; // Left: -3.2, Center: 0, Right: +3.2

export type EnvironmentTheme = 'metro' | 'neon' | 'sunset';

export type PowerUpType = 
  | 'magnet' 
  | 'jetpack' 
  | 'sneakers' 
  | 'multiplier' 
  | 'shield' 
  | 'speed'
  | 'hoverboard';

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number;     // Total duration in seconds
  remaining: number;    // Remaining duration in seconds
}

export interface CharacterConfig {
  id: string;
  name: string;
  title: string;
  description: string;
  cost: number;
  unlocked: boolean;
  colors: {
    skin: string;
    hair: string;
    jacket: string;      // Hoodie / jacket color
    hood: string;        // Hood color (when up)
    pants: string;       // Jeans / cargo pants
    shoes: string;       // Sneakers
    accent: string;      // Trim & graffiti graphic
    boardPrimary: string;
    boardSecondary: string;
  };
  specialty: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  completed: boolean;
  claimed: boolean;
  type: 'coins' | 'distance' | 'jumps' | 'slides' | 'powerups' | 'score' | 'tokens';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface UpgradeConfig {
  id: PowerUpType;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  baseDuration: number;
  durationPerLevel: number;
}

export interface RunStats {
  score: number;
  coins: number;
  tokens: number;
  distance: number;
  jumps: number;
  slides: number;
  powerupsCollected: number;
  nearMisses: number;
  maxSpeed: number;
}
