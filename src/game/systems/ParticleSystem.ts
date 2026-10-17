/**
 * Metro Dash 3D - High Performance Particle System
 * Zero-garbage collection particle pools for coin sparkles, jetpack flames, dust puffs, and crash bursts.
 */

import * as THREE from 'three';

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
  maxLife: number;
  size: number;
  r: number;
  g: number;
  b: number;
  active: boolean;
}

const MAX_PARTICLES = 350;

export class ParticleSystem {
  public group: THREE.Group;
  private geometry: THREE.BufferGeometry;
  private positions: Float32Array;
  private colors: Float32Array;
  private sizes: Float32Array;
  private particles: Particle[];
  private pointsMesh: THREE.Points;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'particle_system';

    this.positions = new Float32Array(MAX_PARTICLES * 3);
    this.colors = new Float32Array(MAX_PARTICLES * 3);
    this.sizes = new Float32Array(MAX_PARTICLES);

    this.particles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.particles.push({
        x: 0,
        y: -100,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1,
        size: 0,
        r: 1,
        g: 1,
        b: 1,
        active: false
      });
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

    // Circle particle texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      map: texture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.pointsMesh = new THREE.Points(this.geometry, material);
    this.group.add(this.pointsMesh);
  }

  private spawnParticle(
    x: number,
    y: number,
    z: number,
    vx: number,
    vy: number,
    vz: number,
    r: number,
    g: number,
    b: number,
    size: number,
    maxLife: number
  ) {
    const p = this.particles.find(part => !part.active);
    if (!p) return;

    p.x = x;
    p.y = y;
    p.z = z;
    p.vx = vx;
    p.vy = vy;
    p.vz = vz;
    p.r = r;
    p.g = g;
    p.b = b;
    p.size = size;
    p.life = maxLife;
    p.maxLife = maxLife;
    p.active = true;
  }

  /**
   * Spawns radiant golden spark burst when picking up a coin
   */
  public emitCoinSparkles(x: number, y: number, z: number) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.spawnParticle(
        x,
        y,
        z,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed + 2,
        (Math.random() - 0.5) * 3,
        1.0, // Red
        0.85, // Green
        0.15, // Blue (Golden yellow)
        0.6,
        0.45
      );
    }
  }

  /**
   * Spawns ground dust puffs behind running sneakers
   */
  public emitRunningDust(x: number, y: number, z: number) {
    for (let i = 0; i < 2; i++) {
      this.spawnParticle(
        x + (Math.random() - 0.5) * 0.4,
        y + 0.05,
        z + 0.3,
        (Math.random() - 0.5) * 0.8,
        Math.random() * 0.8 + 0.2,
        Math.random() * 2 + 1,
        0.5,
        0.5,
        0.5,
        0.4,
        0.35
      );
    }
  }

  /**
   * Spawns twin jetpack rocket exhaust flames
   */
  public emitJetpackFlames(x: number, y: number, z: number) {
    [-0.12, 0.12].forEach(xOffset => {
      this.spawnParticle(
        x + xOffset,
        y,
        z + 0.2,
        (Math.random() - 0.5) * 0.5,
        -Math.random() * 6 - 3,
        Math.random() * 2 + 2,
        1.0,
        0.45 + Math.random() * 0.4,
        0.05,
        0.55,
        0.25
      );
    });
  }

  /**
   * Spawns explosive crash debris and sparks upon fatal impact
   */
  public emitCrashSparks(x: number, y: number, z: number) {
    for (let i = 0; i < 35; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const speed = Math.random() * 9 + 3;
      this.spawnParticle(
        x,
        y,
        z,
        Math.cos(theta) * Math.cos(phi) * speed,
        Math.abs(Math.sin(phi)) * speed + 3,
        Math.sin(theta) * Math.cos(phi) * speed,
        1.0,
        0.4 + Math.random() * 0.5,
        0.1,
        0.75,
        0.65
      );
    }
  }

  /**
   * Updates particle physics and buffers every frame
   */
  public update(delta: number) {
    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = this.geometry.attributes.color as THREE.BufferAttribute;
    const sizeAttr = this.geometry.attributes.size as THREE.BufferAttribute;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      const idx3 = i * 3;

      if (p.active) {
        p.life -= delta;
        if (p.life <= 0) {
          p.active = false;
          this.positions[idx3 + 1] = -100;
          this.sizes[i] = 0;
          continue;
        }

        // Physics
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        p.vy -= 9.8 * delta; // Gravity

        const lifeRatio = p.life / p.maxLife;

        this.positions[idx3] = p.x;
        this.positions[idx3 + 1] = p.y;
        this.positions[idx3 + 2] = p.z;

        this.colors[idx3] = p.r * lifeRatio;
        this.colors[idx3 + 1] = p.g * lifeRatio;
        this.colors[idx3 + 2] = p.b * lifeRatio;

        this.sizes[i] = p.size * lifeRatio;
      } else {
        this.positions[idx3 + 1] = -100;
        this.sizes[i] = 0;
      }
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  }

  public reset() {
    this.particles.forEach(p => (p.active = false));
    this.positions.fill(-100);
    this.sizes.fill(0);
    (this.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  }
}
