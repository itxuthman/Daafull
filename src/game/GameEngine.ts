/**
 * Metro Dash 3D - Core 3D Game Engine
 * Manages Three.js scene, PBR lighting, follow camera, player kinematics, chaser AI, collision detection, and 60fps render loop.
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { soundEngine } from '../audio/SoundEngine';
import { CHARACTERS, useGameStore } from '../store/gameStore';
import { ActivePowerUp, PowerUpType, RunStats } from '../types/game';
import { 
  animateCharacterRig, 
  animateCompanionDog,
  ArticulatedCharacter, 
  CompanionDog,
  createCharacterModel, 
  createCompanionDog,
  createInspectorModel 
} from './procedural/characterModels';
import { 
  createCitySkylineScenery, 
  LANE_WIDTH, 
  TRACK_LANES 
} from './procedural/environmentModels';
import { ParticleSystem } from './systems/ParticleSystem';
import { TrackManager } from './systems/TrackManager';
import { triggerHaptic } from '../utils/haptics';

export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  // Systems
  private trackManager: TrackManager;
  private particleSystem: ParticleSystem;

  // Characters
  private playerRig: ArticulatedCharacter | null = null;
  private inspectorRig: ArticulatedCharacter;
  private companionDog: CompanionDog;
  private skylineScenery: THREE.Group;

  // Player State
  public targetLane: -1 | 0 | 1 = 0;
  public currentLaneX: number = 0;
  public playerZ: number = 0;
  public playerY: number = 0;
  private velocityY: number = 0;
  private isGrounded: boolean = true;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private animState: 'run' | 'jump' | 'slide' | 'fly' | 'crash' = 'run';
  private runAnimTime: number = 0;
  private baseGroundY: number = 0;

  // Chaser Inspector State
  private chaserOffsetZ: number = 5.0;
  private chaserTargetOffsetZ: number = 5.0;
  private chaserLaneX: number = 0;
  private whistleTimer: number = 0;

  // Game Run State
  private speed: number = 16;
  private maxSpeed: number = 34;
  private distanceTraveled: number = 0;
  private runScore: number = 0;
  private runCoins: number = 0;
  private jumpCount: number = 0;
  private slideCount: number = 0;
  private powerupsCollected: number = 0;
  private nearMisses: number = 0;
  private isInvulnerable: boolean = false;
  private invulnerableTimer: number = 0;
  private cameraShake: number = 0;
  public isHoverboardActive: boolean = true;
  private runTokens: number = 0;

  // Power-Ups
  private activePowerUps: Partial<Record<PowerUpType, ActivePowerUp>> = {};
  private hasShield: boolean = false;

  // Animation Frame Loop
  private animFrameId: number | null = null;
  private isDisposed: boolean = false;

  // Pre-allocated math objects (Zero GC directive)
  private readonly _camTargetPos = new THREE.Vector3();
  private readonly _camLookAt = new THREE.Vector3();

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. Scene & Environment setup (Vibrant sunny azure Mediterranean sky like video!)
    this.scene = new THREE.Scene();
    const theme = useGameStore.getState().environmentTheme;
    this.scene.background = new THREE.Color(
      theme === 'neon' ? 0x05070f : (theme === 'sunset' ? 0x2d171e : 0x38bdf8)
    );
    this.scene.fog = new THREE.FogExp2(this.scene.background.getHex(), 0.005);

    // 2. Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 350);
    this.camera.position.set(0, 3.6, 5.8);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = useGameStore.getState().graphicsQuality === 'high';
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // 4. Mandatory Studio Environment Map (SKILL.md directive)
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();
    const roomEnv = new RoomEnvironment();
    this.scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    this.setupLighting(theme);

    // 6. City Skyline Scenery
    this.skylineScenery = createCitySkylineScenery(theme);
    this.scene.add(this.skylineScenery);

    // 7. Track & Obstacle Manager
    this.trackManager = new TrackManager(this.scene, theme);
    this.trackManager.init();

    // 8. Particle System
    this.particleSystem = new ParticleSystem();
    this.scene.add(this.particleSystem.group);

    // 9. Characters
    this.spawnSelectedPlayer();
    this.inspectorRig = createInspectorModel();
    this.scene.add(this.inspectorRig.root);

    this.companionDog = createCompanionDog();
    this.scene.add(this.companionDog.root);

    // Start loop
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);

    // Handle resize
    window.addEventListener('resize', this.onResize);
  }

  private setupLighting(theme: string) {
    // Key Directional Light (Warm sunny Mediterranean daylight matching video)
    const keyLight = new THREE.DirectionalLight(
      theme === 'sunset' ? 0xffb74d : (theme === 'neon' ? 0x38bdf8 : 0xfffbeb),
      theme === 'neon' ? 1.4 : 2.2
    );
    keyLight.position.set(12, 26, 16);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 100;
    const d = 16;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
    this.scene.add(keyLight);

    // Cool Sky & Ground Hemisphere fill light
    const hemiLight = new THREE.HemisphereLight(
      theme === 'neon' ? 0x38bdf8 : 0xbae6fd,
      0x475569,
      theme === 'neon' ? 0.9 : 1.3
    );
    this.scene.add(hemiLight);

    // Rim backlight for pop
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    rimLight.position.set(-15, 10, -20);
    this.scene.add(rimLight);
  }

  public spawnSelectedPlayer() {
    if (this.playerRig) {
      this.scene.remove(this.playerRig.root);
    }
    const store = useGameStore.getState();
    const config = CHARACTERS.find(c => c.id === store.selectedCharacterId) || CHARACTERS[0];
    this.playerRig = createCharacterModel(config);
    this.scene.add(this.playerRig.root);

    // Initial positioning
    this.playerRig.root.position.set(0, 0, this.playerZ);
    this.playerRig.hoverboard.visible = this.isHoverboardActive;
  }

  public resetRun() {
    this.targetLane = 0;
    this.currentLaneX = 0;
    this.playerZ = 0;
    this.playerY = 0;
    this.velocityY = 0;
    this.isGrounded = true;
    this.isSliding = false;
    this.slideTimer = 0;
    this.animState = 'run';
    this.runAnimTime = 0;
    this.baseGroundY = 0;

    this.speed = 17;
    this.distanceTraveled = 0;
    this.runScore = 0;
    this.runCoins = 0;
    this.runTokens = 0;
    this.jumpCount = 0;
    this.slideCount = 0;
    this.powerupsCollected = 0;
    this.nearMisses = 0;
    this.isInvulnerable = false;
    this.invulnerableTimer = 0;

    // Start with iconic hoverboard surfing like in the video!
    this.isHoverboardActive = true;
    this.activePowerUps = {
      hoverboard: {
        type: 'hoverboard',
        duration: 30,
        remaining: 30
      }
    };
    useGameStore.getState().updatePowerUps(this.activePowerUps, false, true);
    this.hasShield = false;

    this.chaserOffsetZ = 5.0;
    this.chaserTargetOffsetZ = 5.0;
    this.chaserLaneX = 0;

    this.trackManager.init();
    this.particleSystem.reset();

    if (this.playerRig) {
      this.playerRig.root.position.set(0, 0, 0);
      this.playerRig.jetpack.visible = false;
      this.playerRig.shieldMesh.visible = false;
      this.playerRig.hoverboard.visible = true;
    }
  }

  public deployHoverboard() {
    const store = useGameStore.getState();
    if (store.deployHoverboard()) {
      this.isHoverboardActive = true;
      triggerHaptic('powerup');
      if (this.playerRig) {
        this.playerRig.hoverboard.visible = true;
      }
    }
  }

  // Input Handlers
  public moveLeft() {
    const store = useGameStore.getState();
    if (store.gameState !== 'playing') return;

    if (this.targetLane > -1) {
      this.targetLane = (this.targetLane - 1) as -1 | 0 | 1;
      soundEngine.playLaneSwitch();
    }
  }

  public moveRight() {
    const store = useGameStore.getState();
    if (store.gameState !== 'playing') return;

    if (this.targetLane < 1) {
      this.targetLane = (this.targetLane + 1) as -1 | 0 | 1;
      soundEngine.playLaneSwitch();
    }
  }

  public jump() {
    const store = useGameStore.getState();
    if (store.gameState !== 'playing') return;

    if (this.isGrounded) {
      const hasSneakers = !!this.activePowerUps.sneakers;
      this.velocityY = hasSneakers ? 15.5 : 11.2;
      this.isGrounded = false;
      this.isSliding = false;
      this.animState = 'jump';
      this.jumpCount++;
      soundEngine.playJump();
    }
  }

  public slide() {
    const store = useGameStore.getState();
    if (store.gameState !== 'playing') return;

    if (!this.isGrounded) {
      // Air dive / stomp down immediately!
      this.velocityY = -22;
    } else if (!this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0.65;
      this.animState = 'slide';
      this.slideCount++;
      soundEngine.playSlide();
    }
  }

  /**
   * Main Render and Physics Tick
   */
  private animate() {
    if (this.isDisposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.05);
    const store = useGameStore.getState();

    // 1. Particle System Update
    this.particleSystem.update(delta);

    // 2. State specific updates
    if (store.gameState === 'playing') {
      this.updatePlayingPhysics(delta);
    } else if (store.gameState === 'countdown') {
      this.updateCountdownSequence(delta);
    } else if (store.gameState === 'gameover') {
      this.updateGameOverSequence(delta);
    } else {
      // Menu idle preview
      this.updateMenuPreview(delta);
    }

    // 3. Render
    this.renderer.render(this.scene, this.camera);
  }

  private updatePlayingPhysics(delta: number) {
    // 1. Advance Speed & Distance
    const isSpeedBoost = !!this.activePowerUps.speed;
    const isJetpack = !!this.activePowerUps.jetpack;
    const currentSpeed = isSpeedBoost ? 30 : this.speed;

    this.playerZ -= currentSpeed * delta;
    this.distanceTraveled += currentSpeed * delta;

    // Gradual difficulty / speed ramp
    this.speed = Math.min(this.maxSpeed, 16 + (this.distanceTraveled / 400) * 3);

    // 2. Score calculation with multiplier
    const multi = (this.activePowerUps.multiplier ? 2 : 1) * (this.speed / 16);
    this.runScore += Math.round(currentSpeed * delta * 8 * multi);

    // 3. Smooth Lane Interpolation (Exponential Damping)
    const targetX = TRACK_LANES[this.targetLane + 1];
    const prevLaneX = this.currentLaneX;
    this.currentLaneX = THREE.MathUtils.damp(this.currentLaneX, targetX, 16, delta);
    const laneShiftSpeed = (this.currentLaneX - prevLaneX) / delta;

    // 4. Vertical Jump & Gravity Physics
    if (isJetpack) {
      // Jetpack flight
      this.playerY = THREE.MathUtils.damp(this.playerY, 8.8, 6, delta);
      this.animState = 'fly';
      this.particleSystem.emitJetpackFlames(this.currentLaneX, this.playerY + 0.4, this.playerZ);
    } else {
      // Normal Gravity & Landing
      if (!this.isGrounded) {
        this.velocityY -= 32 * delta; // Gravity
        this.playerY += this.velocityY * delta;

        // Check ground / train roof landing
        if (this.playerY <= this.baseGroundY) {
          this.playerY = this.baseGroundY;
          this.velocityY = 0;
          this.isGrounded = true;
          this.animState = this.isSliding ? 'slide' : 'run';
          this.particleSystem.emitRunningDust(this.currentLaneX, this.playerY, this.playerZ);
        }
      } else {
        this.playerY = this.baseGroundY;
      }
    }

    // 5. Sliding Timer
    if (this.isSliding) {
      this.slideTimer -= delta;
      if (this.slideTimer <= 0) {
        this.isSliding = false;
        this.animState = 'run';
      }
    }

    // 6. Running dust puffs
    if (this.isGrounded && !isJetpack && Math.random() < 0.45) {
      this.particleSystem.emitRunningDust(this.currentLaneX, this.playerY, this.playerZ);
    }

    // 7. Update Track Manager (Spawns, recycling, moving trains)
    const magnetActive = !!this.activePowerUps.magnet;
    this.trackManager.update(
      this.playerZ,
      delta,
      isJetpack,
      magnetActive,
      this.currentLaneX,
      this.playerY
    );

    // 8. Update City Skyline position to follow player smoothly
    this.skylineScenery.position.z = this.playerZ;

    // 9. Update Power-Up Timers
    this.updateActivePowerUps(delta);

    // 10. Check Collisions (Coins, Power-ups, Obstacles)
    this.checkCollisions();

    // 11. Chaser Inspector Behavior
    this.updateChaser(delta, laneShiftSpeed);

    // 12. Character Model Rig Animation
    if (this.playerRig) {
      this.playerRig.root.position.set(this.currentLaneX, this.playerY, this.playerZ);
      this.runAnimTime += delta;
      animateCharacterRig(
        this.playerRig,
        this.animState,
        this.runAnimTime,
        this.speed,
        laneShiftSpeed,
        this.isHoverboardActive
      );

      // Visibility toggles
      this.playerRig.jetpack.visible = isJetpack;
      this.playerRig.shieldMesh.visible = this.hasShield;
      this.playerRig.hoverboard.visible = this.isHoverboardActive;
      if (this.hasShield) {
        this.playerRig.shieldMesh.rotation.y += 2.0 * delta;
      }
    }

    // 13. Dynamic Camera Choreography
    this.updateCamera(delta, isSpeedBoost || isJetpack);

    // 14. Update React HUD Store
    useGameStore.getState().updateHUD(
      this.runScore,
      this.runCoins,
      Math.floor(this.distanceTraveled),
      Math.round(currentSpeed * 3.6), // km/h
      this.runTokens
    );
  }

  private updateActivePowerUps(delta: number) {
    let changed = false;
    const current = { ...this.activePowerUps };

    Object.keys(current).forEach(key => {
      const pKey = key as PowerUpType;
      const p = current[pKey];
      if (p) {
        p.remaining -= delta;
        if (p.remaining <= 0) {
          if (pKey === 'jetpack') {
            soundEngine.stopJetpack();
          }
          if (pKey === 'hoverboard') {
            this.isHoverboardActive = false;
            if (this.playerRig) this.playerRig.hoverboard.visible = false;
          }
          delete current[pKey];
          changed = true;
        }
      }
    });

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer -= delta;
      if (this.invulnerableTimer <= 0) {
        this.isInvulnerable = false;
      }
    }

    this.activePowerUps = current;
    if (changed) {
      useGameStore.getState().updatePowerUps(this.activePowerUps, this.hasShield, this.isHoverboardActive);
    }
  }

  private checkCollisions() {
    const isJetpack = !!this.activePowerUps.jetpack;
    const isSpeedBoost = !!this.activePowerUps.speed;
    const playerBox = new THREE.Box3();

    // Player bounding box
    const playerHeight = this.isSliding ? 0.8 : 1.85;
    playerBox.min.set(this.currentLaneX - 0.45, this.playerY, this.playerZ - 0.45);
    playerBox.max.set(this.currentLaneX + 0.45, this.playerY + playerHeight, this.playerZ + 0.45);

    // 1. Coin Pickup Detection
    for (let i = 0; i < this.trackManager.coins.length; i++) {
      const coin = this.trackManager.coins[i];
      if (coin.collected) continue;

      const dx = this.currentLaneX - coin.mesh.position.x;
      const dy = (this.playerY + 0.8) - coin.mesh.position.y;
      const dz = this.playerZ - coin.mesh.position.z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < 2.2) {
        coin.collected = true;
        this.trackManager.scene.remove(coin.mesh);
        this.runCoins += (this.activePowerUps.multiplier ? 2 : 1);
        this.runScore += 25;
        this.particleSystem.emitCoinSparkles(coin.mesh.position.x, coin.mesh.position.y, coin.mesh.position.z);
        soundEngine.playCoin();
      }
    }

    // 2. Power-Up Pickup Detection
    for (let i = 0; i < this.trackManager.powerups.length; i++) {
      const pw = this.trackManager.powerups[i];
      if (pw.collected) continue;

      const dx = this.currentLaneX - pw.x;
      const dy = (this.playerY + 0.8) - pw.y;
      const dz = this.playerZ - pw.z;

      if (dx * dx + dy * dy + dz * dz < 2.8) {
        pw.collected = true;
        this.trackManager.scene.remove(pw.mesh);
        this.powerupsCollected++;
        this.activatePowerUp(pw.type);
      }
    }

    // 2b. City Tour Token Pickup Detection
    for (let i = 0; i < this.trackManager.tokens.length; i++) {
      const tok = this.trackManager.tokens[i];
      if (tok.collected) continue;

      const dx = this.currentLaneX - tok.x;
      const dy = (this.playerY + 0.8) - tok.y;
      const dz = this.playerZ - tok.z;

      if (dx * dx + dy * dy + dz * dz < 2.5) {
        tok.collected = true;
        this.trackManager.scene.remove(tok.mesh);
        this.runTokens++;
        this.runScore += 100;
        this.particleSystem.emitCoinSparkles(tok.x, tok.y, tok.z);
        soundEngine.playPowerUp();
        triggerHaptic('powerup');
      }
    }

    // If flying in sky with jetpack, completely immune to track obstacles!
    if (isJetpack) return;

    // 3. Obstacle Collision Detection
    let onTrainRoof = false;

    for (let i = 0; i < this.trackManager.obstacles.length; i++) {
      const obs = this.trackManager.obstacles[i];
      const obsBox = new THREE.Box3();
      const halfW = obs.width / 2;
      const halfL = obs.length / 2;

      obsBox.min.set(obs.mesh.position.x - halfW, 0, obs.z - halfL);
      obsBox.max.set(obs.mesh.position.x + halfW, obs.height, obs.z + halfL);

      // Check if on train roof with ramp
      if (obs.hasRamp && (obs.type === 'train_static' || obs.type === 'train_moving')) {
        const rampStart = obs.z + halfL + 4;
        const rampEnd = obs.z + halfL;
        if (
          Math.abs(this.currentLaneX - obs.mesh.position.x) < 1.0 &&
          this.playerZ <= rampStart &&
          this.playerZ >= -obs.length + obs.z
        ) {
          if (this.playerZ >= rampEnd) {
            const rampProgress = (rampStart - this.playerZ) / (rampStart - rampEnd);
            this.baseGroundY = rampProgress * obs.height;
          } else {
            this.baseGroundY = obs.height;
          }
          onTrainRoof = true;
          continue;
        }
      }

      // Check intersection
      if (playerBox.intersectsBox(obsBox)) {
        // High Slide barrier check
        if (obs.type === 'hurdle_slide' && this.isSliding) {
          obs.cleared = true;
          continue;
        }

        // Low Jump hurdle check
        if (obs.type === 'hurdle_jump' && this.playerY > 0.9) {
          obs.cleared = true;
          continue;
        }

        // Speed Boost invincibility
        if (isSpeedBoost) {
          this.particleSystem.emitCrashSparks(this.currentLaneX, this.playerY + 1, this.playerZ);
          this.scene.remove(obs.mesh);
          continue;
        }

        // Hoverboard crash protection (Subway Surfers signature mechanic)
        if (this.isHoverboardActive && !this.isInvulnerable) {
          this.isHoverboardActive = false;
          this.isInvulnerable = true;
          this.invulnerableTimer = 1.8;
          this.cameraShake = 0.6;
          triggerHaptic('shield_break');
          soundEngine.playShieldBreak();
          this.particleSystem.emitCrashSparks(this.currentLaneX, this.playerY + 0.5, this.playerZ);
          if (this.playerRig) this.playerRig.hoverboard.visible = false;
          useGameStore.getState().updatePowerUps(this.activePowerUps, this.hasShield, false);
          
          this.chaserTargetOffsetZ = 2.2;
          soundEngine.playWhistle();
          continue;
        }

        // Shield protection
        if (this.hasShield && !this.isInvulnerable) {
          this.hasShield = false;
          this.isInvulnerable = true;
          this.invulnerableTimer = 1.5;
          this.cameraShake = 0.5;
          triggerHaptic('shield_break');
          soundEngine.playShieldBreak();
          this.particleSystem.emitCrashSparks(this.currentLaneX, this.playerY + 1, this.playerZ);
          if (this.playerRig) this.playerRig.shieldMesh.visible = false;
          useGameStore.getState().updatePowerUps(this.activePowerUps, false, this.isHoverboardActive);
          
          this.chaserTargetOffsetZ = 2.0;
          soundEngine.playWhistle();
          continue;
        }

        if (this.isInvulnerable) continue;

        // FATAL COLLISION!
        this.handleFatalCrash();
        return;
      }

      // Near miss bonus detection
      if (
        !obs.cleared &&
        obs.type === 'train_moving' &&
        Math.abs(this.playerZ - obs.z) < 2.0 &&
        Math.abs(this.currentLaneX - obs.mesh.position.x) < 3.0
      ) {
        obs.cleared = true;
        this.nearMisses++;
        this.runScore += 50;
        triggerHaptic('near_miss');
      }
    }

    if (!onTrainRoof && !isJetpack) {
      this.baseGroundY = 0;
    }
  }

  private activatePowerUp(type: PowerUpType) {
    triggerHaptic('powerup');
    const store = useGameStore.getState();
    const upConfig = store.upgrades[type];
    const duration = upConfig 
      ? upConfig.baseDuration + (upConfig.level - 1) * upConfig.durationPerLevel 
      : 10;

    store.activatePowerUp(type, duration);

    if (type === 'shield') {
      this.hasShield = true;
      if (this.playerRig) this.playerRig.shieldMesh.visible = true;
    } else if (type === 'hoverboard') {
      this.isHoverboardActive = true;
      if (this.playerRig) this.playerRig.hoverboard.visible = true;
    } else if (type === 'jetpack') {
      soundEngine.startJetpack();
      this.trackManager.spawnSkyCoins(this.playerZ);
    }

    this.activePowerUps[type] = {
      type,
      duration,
      remaining: duration
    };
  }

  private handleFatalCrash() {
    triggerHaptic('collision');
    this.animState = 'crash';
    this.cameraShake = 0.9;
    this.particleSystem.emitCrashSparks(this.currentLaneX, this.playerY + 1, this.playerZ);

    const stats: RunStats = {
      score: this.runScore,
      coins: this.runCoins,
      tokens: this.runTokens,
      distance: Math.floor(this.distanceTraveled),
      jumps: this.jumpCount,
      slides: this.slideCount,
      powerupsCollected: this.powerupsCollected,
      nearMisses: this.nearMisses,
      maxSpeed: Math.round(this.speed * 3.6)
    };

    useGameStore.getState().endGame(stats);
  }

  private updateChaser(delta: number, playerShiftSpeed: number) {
    // Inspector trails behind the player
    this.chaserLaneX = THREE.MathUtils.damp(this.chaserLaneX, this.currentLaneX, 8, delta);
    this.chaserOffsetZ = THREE.MathUtils.damp(this.chaserOffsetZ, this.chaserTargetOffsetZ, 4, delta);

    const chaserZ = this.playerZ + this.chaserOffsetZ;
    this.inspectorRig.root.position.set(this.chaserLaneX, 0, chaserZ);

    animateCharacterRig(
      this.inspectorRig,
      'run',
      this.runAnimTime,
      this.speed * 1.05,
      playerShiftSpeed
    );

    // Loyal companion guard bulldog sprints beside the Inspector!
    const dogX = this.chaserLaneX - 1.1;
    const dogZ = chaserZ - 0.35;
    this.companionDog.root.position.set(dogX, 0, dogZ);
    this.companionDog.root.rotation.y = Math.PI;
    animateCompanionDog(this.companionDog, this.runAnimTime, this.speed * 1.05);

    // Periodic whistle & playful guard dog bark when trailing
    this.whistleTimer += delta;
    if (this.whistleTimer > 18) {
      this.whistleTimer = 0;
      soundEngine.playWhistle();
      setTimeout(() => soundEngine.playDogBark(), 350);
    }
  }

  private updateCamera(delta: number, isHighSpeed: boolean) {
    // Dynamic FOV widening
    const targetFov = isHighSpeed ? 72 : 60;
    this.camera.fov = THREE.MathUtils.damp(this.camera.fov, targetFov, 6, delta);
    this.camera.updateProjectionMatrix();

    // Camera follow position
    const targetCamX = this.currentLaneX * 0.65;
    const targetCamY = Math.max(3.2, this.playerY + 2.8);
    const targetCamZ = this.playerZ + 6.2;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 12, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 10, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 14, delta);

    // Apply Camera Shake on collision or landing
    if (this.cameraShake > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.cameraShake * 0.4;
      this.camera.position.y += (Math.random() - 0.5) * this.cameraShake * 0.4;
      this.cameraShake = Math.max(0, this.cameraShake - delta * 2.5);
    }

    // Look-at point slightly ahead of the character
    this._camLookAt.set(this.currentLaneX * 0.3, this.playerY + 1.2, this.playerZ - 8);
    this.camera.lookAt(this._camLookAt);

    // Subtle camera tilt during lane turn
    this.camera.rotation.z = THREE.MathUtils.damp(
      this.camera.rotation.z,
      -(this.targetLane - (this.currentLaneX / LANE_WIDTH)) * 0.04,
      8,
      delta
    );
  }

  private updateCountdownSequence(delta: number) {
    // Cinematic chase intro: camera swoops around as inspector and guard dog start the pursuit
    this.runAnimTime += delta;
    if (this.playerRig) {
      animateCharacterRig(this.playerRig, 'run', this.runAnimTime, 12, 0);
    }
    animateCharacterRig(this.inspectorRig, 'run', this.runAnimTime, 12, 0);

    const dogX = this.chaserLaneX - 1.1;
    const dogZ = this.playerZ + 5.0 - 0.35;
    this.companionDog.root.position.set(dogX, 0, dogZ);
    this.companionDog.root.rotation.y = Math.PI;
    animateCompanionDog(this.companionDog, this.runAnimTime, 12);

    this.camera.position.set(
      Math.sin(this.runAnimTime * 2) * 2.5,
      2.8,
      this.playerZ + 5.2
    );
    this.camera.lookAt(0, 1.2, this.playerZ);
  }

  private updateGameOverSequence(delta: number) {
    // Camera smoothly pans around the fallen runner, inspector and guard dog
    this.runAnimTime += delta;
    if (this.playerRig) {
      animateCharacterRig(this.playerRig, 'crash', this.runAnimTime, 0, 0);
    }

    // Inspector reaches the runner
    this.chaserOffsetZ = THREE.MathUtils.damp(this.chaserOffsetZ, 1.4, 3, delta);
    this.inspectorRig.root.position.set(this.currentLaneX, 0, this.playerZ + this.chaserOffsetZ);

    const dogX = this.currentLaneX - 0.9;
    const dogZ = this.playerZ + this.chaserOffsetZ - 0.2;
    this.companionDog.root.position.set(dogX, 0, dogZ);
    this.companionDog.root.rotation.y = Math.PI;
    animateCompanionDog(this.companionDog, this.runAnimTime, 4);

    this.camera.position.x = THREE.MathUtils.damp(
      this.camera.position.x,
      this.currentLaneX + 3.2,
      4,
      delta
    );
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, 2.4, 4, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.playerZ + 2.8, 4, delta);
    this.camera.lookAt(this.currentLaneX, 0.8, this.playerZ);
  }

  private updateMenuPreview(delta: number) {
    // Idle 3D character rotation in main menu
    this.runAnimTime += delta;
    if (this.playerRig) {
      this.playerRig.root.position.set(0, 0, 0);
      this.playerRig.root.rotation.y = Math.sin(this.runAnimTime * 0.8) * 0.35;
      animateCharacterRig(this.playerRig, 'run', this.runAnimTime * 0.6, 8, 0);
    }

    this.inspectorRig.root.position.set(100, -100, 0); // Hide offscreen during menu
    this.companionDog.root.position.set(100, -100, 0);

    this.camera.position.set(0, 1.4, 3.6);
    this.camera.lookAt(0, 1.1, 0);
  }

  private onResize = () => {
    if (!this.container || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  public dispose() {
    this.isDisposed = true;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
    }
    window.removeEventListener('resize', this.onResize);
    this.trackManager.clearAll();
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
