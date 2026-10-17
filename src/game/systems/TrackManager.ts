/**
 * Metro Dash 3D - Procedural Track, Obstacle & Collectible Spawner
 * Manages chunk recycling, moving oncoming trains, obstacle hazards, coin lines, and power-up placements.
 */

import * as THREE from 'three';
import { EnvironmentTheme, PowerUpType } from '../../types/game';
import { 
  createTrackChunk, 
  createTunnelChunk, 
  LANE_WIDTH, 
  TRACK_LANES 
} from '../procedural/environmentModels';
import { 
  createCoinMesh, 
  createFreightTrain, 
  createPassengerTrain, 
  createPowerUpMesh, 
  createRailwayHurdle,
  createTokenMesh
} from '../procedural/trainModels';

export const CHUNK_LENGTH = 40;
export const TOTAL_CHUNKS = 7; // 280m visible track horizon

export interface TrackObstacle {
  id: string;
  type: 'train_moving' | 'train_static' | 'hurdle_jump' | 'hurdle_slide';
  mesh: THREE.Group;
  lane: number; // -1, 0, 1
  z: number;
  speed: number; // for moving trains (speeds towards player)
  width: number;
  height: number;
  length: number;
  hasRamp?: boolean;
  cleared?: boolean;
}

export interface TrackCoin {
  id: string;
  mesh: THREE.Group;
  lane: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export interface TrackPowerUp {
  id: string;
  type: PowerUpType;
  mesh: THREE.Group;
  lane: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export interface TrackToken {
  id: string;
  mesh: THREE.Group;
  lane: number;
  x: number;
  y: number;
  z: number;
  collected: boolean;
}

export class TrackManager {
  public scene: THREE.Scene;
  public theme: EnvironmentTheme;
  public chunks: THREE.Group[] = [];
  public obstacles: TrackObstacle[] = [];
  public coins: TrackCoin[] = [];
  public powerups: TrackPowerUp[] = [];
  public tokens: TrackToken[] = [];

  private nextChunkZ: number = 0;
  private nextObstacleZ: number = -30;
  private obstacleIdCounter: number = 0;
  private coinIdCounter: number = 0;

  constructor(scene: THREE.Scene, theme: EnvironmentTheme = 'metro') {
    this.scene = scene;
    this.theme = theme;
  }

  public init() {
    this.clearAll();

    // Spawn initial runway of track chunks
    for (let i = 0; i < TOTAL_CHUNKS; i++) {
      const z = -i * CHUNK_LENGTH;
      const isTunnel = i >= 4 && i <= 5;
      const chunk = isTunnel 
        ? createTunnelChunk(CHUNK_LENGTH, this.theme) 
        : createTrackChunk(CHUNK_LENGTH, this.theme);
      
      chunk.position.set(0, 0, z);
      this.scene.add(chunk);
      this.chunks.push(chunk);
    }

    this.nextChunkZ = -TOTAL_CHUNKS * CHUNK_LENGTH;
    this.nextObstacleZ = -45; // Leave initial runway clear for cinematic start

    // Populate initial obstacles & coins ahead
    while (this.nextObstacleZ > -240) {
      this.spawnSegmentFeatures(this.nextObstacleZ);
      this.nextObstacleZ -= 22 + Math.random() * 12;
    }
  }

  private spawnSegmentFeatures(z: number) {
    const r = Math.random();
    const laneIndex = Math.floor(Math.random() * 3);
    const laneX = TRACK_LANES[laneIndex];
    const lane = (laneIndex - 1) as -1 | 0 | 1;

    // 1. Obstacle generation
    if (r < 0.35) {
      // Incoming or Parked Passenger Train
      const isMoving = Math.random() > 0.4;
      const hasRamp = !isMoving && Math.random() > 0.4;
      const train = createPassengerTrain(20, this.theme === 'neon' ? '#8b5cf6' : '#0284c7', hasRamp);
      train.position.set(laneX, 0, z);
      this.scene.add(train);

      this.obstacles.push({
        id: `obs_${++this.obstacleIdCounter}`,
        type: isMoving ? 'train_moving' : 'train_static',
        mesh: train,
        lane,
        z,
        speed: isMoving ? 14 : 0,
        width: 2.4,
        height: 3.4,
        length: 20,
        hasRamp
      });

      // Spawn coins on roof if train has ramp!
      if (hasRamp) {
        for (let cz = -8; cz <= 8; cz += 3) {
          this.spawnCoin(laneX, 3.8, z + cz, lane);
        }
      }

    } else if (r < 0.6) {
      // Low jump hurdle
      const hurdle = createRailwayHurdle('jump');
      hurdle.position.set(laneX, 0, z);
      this.scene.add(hurdle);

      this.obstacles.push({
        id: `obs_${++this.obstacleIdCounter}`,
        type: 'hurdle_jump',
        mesh: hurdle,
        lane,
        z,
        speed: 0,
        width: 2.4,
        height: 1.1,
        length: 0.8
      });

      // Coin arc jumping over hurdle
      this.spawnCoin(laneX, 1.2, z + 3, lane);
      this.spawnCoin(laneX, 2.2, z, lane);
      this.spawnCoin(laneX, 1.2, z - 3, lane);

    } else if (r < 0.82) {
      // High slide barrier
      const hurdle = createRailwayHurdle('slide');
      hurdle.position.set(laneX, 0, z);
      this.scene.add(hurdle);

      this.obstacles.push({
        id: `obs_${++this.obstacleIdCounter}`,
        type: 'hurdle_slide',
        mesh: hurdle,
        lane,
        z,
        speed: 0,
        width: 2.6,
        height: 2.4,
        length: 0.8
      });

      // Coins placed low for sliding
      for (let cz = -4; cz <= 4; cz += 2) {
        this.spawnCoin(laneX, 0.4, z + cz, lane);
      }

    } else {
      // Freight train with crates
      const train = createFreightTrain(18, '#dc2626');
      train.position.set(laneX, 0, z);
      this.scene.add(train);

      this.obstacles.push({
        id: `obs_${++this.obstacleIdCounter}`,
        type: 'train_static',
        mesh: train,
        lane,
        z,
        speed: 0,
        width: 2.5,
        height: 3.2,
        length: 18
      });
    }

    // 2. Power-up chance on adjacent lanes
    if (Math.random() < 0.2) {
      const freeLanes = TRACK_LANES.filter((_, idx) => idx !== laneIndex);
      const chosenX = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      const types: PowerUpType[] = ['hoverboard', 'magnet', 'jetpack', 'sneakers', 'multiplier', 'shield', 'speed'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      this.spawnPowerUp(chosenType, chosenX, 1.2, z + 5);
    }

    // 2b. City Tour Token spawn chance (10%)
    if (Math.random() < 0.1) {
      const freeLanes = TRACK_LANES.filter((_, idx) => idx !== laneIndex);
      const tokenX = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      this.spawnToken(tokenX, 1.3, z + 8, Math.round(tokenX / LANE_WIDTH));
    }

    // 3. Coins on another open lane
    if (Math.random() < 0.75) {
      const coinLaneIndex = (laneIndex + 1 + Math.floor(Math.random() * 2)) % 3;
      const coinLaneX = TRACK_LANES[coinLaneIndex];
      const count = 5 + Math.floor(Math.random() * 5);
      for (let i = 0; i < count; i++) {
        this.spawnCoin(coinLaneX, 0.9, z - 6 - i * 2.2, (coinLaneIndex - 1) as -1 | 0 | 1);
      }
    }
  }

  private spawnToken(x: number, y: number, z: number, lane: number) {
    const token = createTokenMesh();
    token.position.set(x, y, z);
    this.scene.add(token);

    this.tokens.push({
      id: `token_${Date.now()}_${Math.random()}`,
      mesh: token,
      lane,
      x,
      y,
      z,
      collected: false
    });
  }

  private spawnCoin(x: number, y: number, z: number, lane: number) {
    const coin = createCoinMesh();
    coin.position.set(x, y, z);
    this.scene.add(coin);

    this.coins.push({
      id: `coin_${++this.coinIdCounter}`,
      mesh: coin,
      lane,
      x,
      y,
      z,
      collected: false
    });
  }

  private spawnPowerUp(type: PowerUpType, x: number, y: number, z: number) {
    const mesh = createPowerUpMesh(type);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);

    this.powerups.push({
      id: `pw_${Date.now()}_${Math.random()}`,
      type,
      mesh,
      lane: Math.round(x / LANE_WIDTH),
      x,
      y,
      z,
      collected: false
    });
  }

  /**
   * Spawns high-altitude golden coin clouds when player activates Jetpack
   */
  public spawnSkyCoins(playerZ: number) {
    for (let i = 0; i < 40; i++) {
      const z = playerZ - 20 - i * 4;
      const laneIndex = (i % 3);
      const x = TRACK_LANES[laneIndex];
      const y = 8.5 + Math.sin(i * 0.4) * 1.5;
      this.spawnCoin(x, y, z, (laneIndex - 1) as -1 | 0 | 1);
    }
  }

  /**
   * Update moving trains, coin spins, chunk recycling every frame
   */
  public update(playerZ: number, delta: number, isJetpackActive: boolean, magnetActive: boolean, playerX: number, playerY: number) {
    // 1. Recycle track chunks behind player
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.position.z > playerZ + CHUNK_LENGTH + 10) {
        chunk.position.z = this.nextChunkZ;
        this.nextChunkZ -= CHUNK_LENGTH;
      }
    }

    // 2. Spawn new obstacles ahead as player advances
    while (this.nextObstacleZ > playerZ - 260) {
      this.spawnSegmentFeatures(this.nextObstacleZ);
      this.nextObstacleZ -= 24 + Math.random() * 12;
    }

    // 3. Update Moving Trains
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      if (obs.type === 'train_moving') {
        obs.z += obs.speed * delta;
        obs.mesh.position.z = obs.z;
      }

      // Cleanup passed obstacles
      if (obs.z > playerZ + 25) {
        this.scene.remove(obs.mesh);
        this.obstacles.splice(i, 1);
      }
    }

    // 4. Update & Animate Coins (spin & magnet attraction)
    const coinRotateSpeed = 4 * delta;
    for (let i = this.coins.length - 1; i >= 0; i--) {
      const coin = this.coins[i];
      if (coin.collected) continue;

      coin.mesh.rotation.z += coinRotateSpeed;
      coin.mesh.position.y = coin.y + Math.sin(Date.now() * 0.005 + coin.z) * 0.12;

      // Magnet pull towards player
      if (magnetActive) {
        const dx = playerX - coin.mesh.position.x;
        const dy = playerY - coin.mesh.position.y;
        const dz = playerZ - coin.mesh.position.z;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < 225) { // 15m radius
          coin.mesh.position.x += dx * 12 * delta;
          coin.mesh.position.y += dy * 12 * delta;
          coin.mesh.position.z += dz * 12 * delta;
        }
      }

      // Cleanup passed coins
      if (coin.z > playerZ + 15) {
        this.scene.remove(coin.mesh);
        this.coins.splice(i, 1);
      }
    }

    // 5. Update & Animate Power-Ups (spin and hover halo)
    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pw = this.powerups[i];
      if (pw.collected) continue;

      pw.mesh.rotation.y += 2.5 * delta;
      pw.mesh.position.y = pw.y + Math.sin(Date.now() * 0.004) * 0.18;

      if (pw.z > playerZ + 15) {
        this.scene.remove(pw.mesh);
        this.powerups.splice(i, 1);
      }
    }

    // 6. Update & Animate City Tour Tokens
    for (let i = this.tokens.length - 1; i >= 0; i--) {
      const tok = this.tokens[i];
      if (tok.collected) continue;

      tok.mesh.rotation.y += 3.0 * delta;
      tok.mesh.position.y = tok.y + Math.sin(Date.now() * 0.005) * 0.15;

      if (tok.z > playerZ + 15) {
        this.scene.remove(tok.mesh);
        this.tokens.splice(i, 1);
      }
    }
  }

  public clearAll() {
    this.chunks.forEach(c => this.scene.remove(c));
    this.chunks = [];

    this.obstacles.forEach(o => this.scene.remove(o.mesh));
    this.obstacles = [];

    this.coins.forEach(c => this.scene.remove(c.mesh));
    this.coins = [];

    this.powerups.forEach(p => this.scene.remove(p.mesh));
    this.powerups = [];

    this.tokens.forEach(t => this.scene.remove(t.mesh));
    this.tokens = [];
  }
}
