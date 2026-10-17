/**
 * Metro Dash 3D - Procedural Train & Obstacle Models
 * Modern white-and-teal subway trains, red-white chevron hurdles, freight ramps, and golden star coins.
 */

import * as THREE from 'three';
import { PowerUpType } from '../../types/game';
import { createCoinTexture, createHazardTexture, createTrainSideTexture } from './textures';

/**
 * Creates modern subway passenger train matching the video (white body, dark windshield, teal stripe)
 */
export function createPassengerTrain(
  length: number = 20,
  themeColor: string = '#06b6d4',
  hasRamp: boolean = false
): THREE.Group {
  const train = new THREE.Group();
  train.name = 'train_passenger';

  const width = 2.4;
  const height = 3.4;

  // 1. Train Body
  const bodyGeo = new THREE.BoxGeometry(width, height - 0.6, length);
  const sideTex = createTrainSideTexture(themeColor);
  
  const bodyMat = new THREE.MeshStandardMaterial({
    map: sideTex,
    metalness: 0.3,
    roughness: 0.3
  });

  const frontMat = new THREE.MeshStandardMaterial({
    color: '#0f172a',
    metalness: 0.7,
    roughness: 0.2
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: '#334155',
    metalness: 0.4,
    roughness: 0.6
  });

  const trainMaterials = [
    bodyMat, // Right
    bodyMat, // Left
    roofMat, // Top
    new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.9 }), // Bottom
    frontMat, // Front
    frontMat  // Back
  ];

  const bodyMesh = new THREE.Mesh(bodyGeo, trainMaterials);
  bodyMesh.position.y = height / 2 + 0.3;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  train.add(bodyMesh);

  // 2. Aerodynamic Sloped Nose (Front Cab)
  const noseGeo = new THREE.ConeGeometry(width * 0.5, 1.8, 4);
  const noseMesh = new THREE.Mesh(noseGeo, frontMat);
  noseMesh.rotation.y = Math.PI / 4;
  noseMesh.rotation.x = Math.PI / 2;
  noseMesh.position.set(0, height / 2 + 0.2, length / 2 + 0.9);
  noseMesh.scale.set(1.4, 1.0, 0.9);
  train.add(noseMesh);

  // Front Windshield Glass
  const glassGeo = new THREE.PlaneGeometry(1.6, 0.85);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#38bdf8',
    transmission: 0.75,
    roughness: 0.1,
    metalness: 0.3,
    reflectivity: 0.9
  });
  const windshield = new THREE.Mesh(glassGeo, glassMat);
  windshield.position.set(0, height - 0.75, length / 2 + 0.52);
  windshield.rotation.x = -0.22;
  train.add(windshield);

  // Glowing Headlights (warm yellow lights seen in video)
  const headlightMat = new THREE.MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#fef08a',
    emissiveIntensity: 2.5,
    roughness: 0.1
  });

  [-0.7, 0.7].forEach(x => {
    const light = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 12), headlightMat);
    light.rotation.x = Math.PI / 2;
    light.position.set(x, 1.25, length / 2 + 0.5);
    train.add(light);
  });

  // Red Taillights at rear
  const tailMat = new THREE.MeshStandardMaterial({
    color: '#ef4444',
    emissive: '#dc2626',
    emissiveIntensity: 1.5
  });
  [-0.7, 0.7].forEach(x => {
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), tailMat);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(x, 1.25, -length / 2 - 0.05);
    train.add(tail);
  });

  // 3. Rooftop AC units
  const acGeo = new THREE.BoxGeometry(1.2, 0.25, 2.5);
  const acMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.5 });
  [-length * 0.25, length * 0.25].forEach(z => {
    const ac = new THREE.Mesh(acGeo, acMat);
    ac.position.set(0, height + 0.1, z);
    train.add(ac);
  });

  // 4. Undercarriage Bogies and Steel Wheels
  const wheelMat = new THREE.MeshStandardMaterial({ color: '#18181b', metalness: 0.9, roughness: 0.3 });
  const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.15, 12);

  [-length * 0.35, length * 0.35].forEach(bogieZ => {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(2.1, 0.2, 2.6),
      new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.8 })
    );
    frame.position.set(0, 0.45, bogieZ);
    train.add(frame);

    [-1.0, 1.0].forEach(wheelX => {
      [-0.8, 0.8].forEach(wheelZOffset => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wheelX, 0.35, bogieZ + wheelZOffset);
        wheel.castShadow = true;
        train.add(wheel);
      });
    });
  });

  // 5. Jump Ramp onto Train Roof (as seen in video!)
  if (hasRamp) {
    const rampLength = 6.0;
    const rampGeo = new THREE.BoxGeometry(2.2, 0.15, rampLength);
    // Vibrant orange wooden planks like the video!
    const rampMat = new THREE.MeshStandardMaterial({
      color: '#ea580c',
      roughness: 0.6,
      metalness: 0.2
    });
    const rampMesh = new THREE.Mesh(rampGeo, rampMat);
    
    rampMesh.rotation.x = Math.atan2(height, rampLength);
    rampMesh.position.set(0, height / 2, length / 2 + rampLength / 2);
    rampMesh.castShadow = true;
    rampMesh.receiveShadow = true;
    train.add(rampMesh);

    // Ramp support truss
    const supportGeo = new THREE.CylinderGeometry(0.08, 0.08, height, 8);
    const supportMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
    const support = new THREE.Mesh(supportGeo, supportMat);
    support.position.set(0, height / 2, length / 2 + rampLength * 0.4);
    train.add(support);
  }

  return train;
}

/**
 * Creates Freight Cargo Train with blue/grey containers & loading ramp
 */
export function createFreightTrain(length: number = 18, color: string = '#2563eb'): THREE.Group {
  const train = new THREE.Group();
  train.name = 'train_freight';

  const width = 2.5;
  const height = 3.2;

  // Flatbed Base
  const baseGeo = new THREE.BoxGeometry(width, 0.4, length);
  const baseMat = new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.8, metalness: 0.6 });
  const base = new THREE.Mesh(baseGeo, baseMat);
  base.position.y = 0.6;
  base.castShadow = true;
  train.add(base);

  // Containers
  const containerCount = 2;
  const containerLength = (length - 1.5) / containerCount;

  for (let i = 0; i < containerCount; i++) {
    const z = -length / 2 + containerLength / 2 + 0.5 + i * (containerLength + 0.5);
    const cGeo = new THREE.BoxGeometry(width - 0.1, height - 0.8, containerLength);
    const cMat = new THREE.MeshStandardMaterial({
      color: i === 0 ? color : '#0284c7', // Vibrant blue cargo seen in video
      roughness: 0.5,
      metalness: 0.3
    });
    const container = new THREE.Mesh(cGeo, cMat);
    container.position.set(0, height / 2 + 0.4, z);
    container.castShadow = true;
    container.receiveShadow = true;
    train.add(container);
  }

  // Rear ramp
  const rampLength = 5.5;
  const rampGeo = new THREE.BoxGeometry(2.2, 0.15, rampLength);
  const rampMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.6 });
  const rampMesh = new THREE.Mesh(rampGeo, rampMat);
  rampMesh.rotation.x = Math.atan2(height, rampLength);
  rampMesh.position.set(0, height / 2, length / 2 + rampLength / 2);
  train.add(rampMesh);

  return train;
}

/**
 * Creates Railway Red-and-White Chevron Hurdles (as seen in video!)
 */
export function createRailwayHurdle(type: 'jump' | 'slide'): THREE.Group {
  const hurdle = new THREE.Group();
  hurdle.name = `hurdle_${type}`;

  const hazardTex = createHazardTexture();
  const hazardMat = new THREE.MeshStandardMaterial({ map: hazardTex, roughness: 0.5 });
  const metalMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8, roughness: 0.3 });

  if (type === 'jump') {
    // Low Hurdle with red-and-white chevron caution board
    const barGeo = new THREE.BoxGeometry(2.5, 0.5, 0.15);
    const bar = new THREE.Mesh(barGeo, hazardMat);
    bar.position.set(0, 0.75, 0);
    bar.castShadow = true;
    hurdle.add(bar);

    [-1.15, 1.15].forEach(x => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), metalMat);
      leg.rotation.z = 0.2 * (x > 0 ? -1 : 1);
      leg.position.set(x, 0.5, 0);
      leg.castShadow = true;
      hurdle.add(leg);

      const light = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.12, 8),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 1.5 })
      );
      light.position.set(x, 1.05, 0);
      hurdle.add(light);
    });

  } else {
    // High Slide Barrier with red chevrons (1.4m clearance below)
    const signGeo = new THREE.BoxGeometry(2.6, 0.85, 0.18);
    const sign = new THREE.Mesh(signGeo, hazardMat);
    sign.position.set(0, 1.95, 0);
    sign.castShadow = true;
    hurdle.add(sign);

    [-1.25, 1.25].forEach(x => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 8), metalMat);
      pole.position.set(x, 1.2, 0);
      pole.castShadow = true;
      hurdle.add(pole);
    });
  }

  return hurdle;
}

/**
 * Creates large, chunky spinning Golden Star Coin (as seen in video!)
 */
export function createCoinMesh(): THREE.Group {
  const coinGroup = new THREE.Group();
  coinGroup.name = 'coin';

  const coinTex = createCoinTexture();
  const coinGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.12, 20);

  const coinMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24',
    metalness: 0.9,
    roughness: 0.15,
    map: coinTex
  });

  const mesh = new THREE.Mesh(coinGeo, coinMat);
  mesh.rotation.x = Math.PI / 2;
  mesh.castShadow = true;
  coinGroup.add(mesh);

  return coinGroup;
}

/**
 * Creates World Tour Eiffel Token mesh
 */
export function createTokenMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'token';

  const tokenGeo = new THREE.ConeGeometry(0.35, 0.9, 4);
  const tokenMat = new THREE.MeshStandardMaterial({
    color: '#f43f5e',
    emissive: '#e11d48',
    emissiveIntensity: 1.2,
    metalness: 0.5,
    roughness: 0.2
  });

  const mesh = new THREE.Mesh(tokenGeo, tokenMat);
  group.add(mesh);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(0.45, 0.03, 8, 16),
    new THREE.MeshBasicMaterial({ color: '#ffffff' })
  );
  halo.rotation.x = Math.PI / 2;
  group.add(halo);

  return group;
}

/**
 * Creates 3D Power-Up Collectibles
 */
export function createPowerUpMesh(type: PowerUpType): THREE.Group {
  const group = new THREE.Group();
  group.name = `powerup_${type}`;

  if (type === 'hoverboard') {
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 1.1),
      new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.5, roughness: 0.2 })
    );
    group.add(board);
  } else if (type === 'magnet') {
    const uShape = new THREE.TorusGeometry(0.38, 0.12, 12, 24, Math.PI);
    const magnetMat = new THREE.MeshStandardMaterial({ color: '#ef4444', metalness: 0.6, roughness: 0.2 });
    const uMesh = new THREE.Mesh(uShape, magnetMat);
    uMesh.rotation.z = Math.PI;
    group.add(uMesh);

    const tipMat = new THREE.MeshStandardMaterial({ color: '#f1f5f9', metalness: 0.95, roughness: 0.1 });
    [-0.38, 0.38].forEach(x => {
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.2, 0.24), tipMat);
      tip.position.set(x, -0.1, 0);
      group.add(tip);
    });
  } else if (type === 'jetpack') {
    [-0.18, 0.18].forEach(x => {
      const tube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12),
        new THREE.MeshStandardMaterial({ color: '#38bdf8', metalness: 0.8, roughness: 0.2 })
      );
      tube.position.set(x, 0, 0);
      group.add(tube);

      const nozzle = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#f59e0b', emissiveIntensity: 1.0 })
      );
      nozzle.position.set(x, -0.38, 0);
      group.add(nozzle);
    });
  } else if (type === 'sneakers') {
    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.24, 0.6),
      new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.8, roughness: 0.2 })
    );
    shoe.position.y = 0.15;
    group.add(shoe);

    const spring = new THREE.Mesh(
      new THREE.TorusGeometry(0.16, 0.04, 8, 16),
      new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9 })
    );
    spring.rotation.x = Math.PI / 2;
    spring.position.y = -0.12;
    group.add(spring);
  } else if (type === 'multiplier') {
    const star = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({ color: '#a855f7', emissive: '#9333ea', emissiveIntensity: 0.8, metalness: 0.4 })
    );
    group.add(star);
  } else if (type === 'shield') {
    const aegis = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.42, 1),
      new THREE.MeshPhysicalMaterial({
        color: '#06b6d4',
        emissive: '#0891b2',
        emissiveIntensity: 0.6,
        roughness: 0.1,
        transmission: 0.7
      })
    );
    group.add(aegis);
  } else {
    const boltGeo = new THREE.ConeGeometry(0.32, 0.7, 5);
    const boltMat = new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#eab308', emissiveIntensity: 1.2 });
    group.add(new THREE.Mesh(boltGeo, boltMat));
  }

  const haloGeo = new THREE.TorusGeometry(0.65, 0.03, 8, 24);
  const haloMat = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.rotation.x = Math.PI / 2;
  group.add(halo);

  return group;
}
