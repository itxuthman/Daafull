/**
 * Metro Dash 3D - Procedural Track, Tunnel, Station & Mediterranean City Models
 * Generates vibrant 3-lane railway tracks, overhead catenary wires, townhouses, and arched tunnels.
 */

import * as THREE from 'three';
import { EnvironmentTheme } from '../../types/game';
import { 
  createBallastTexture, 
  createTownhouseTexture, 
  createWoodTieTexture 
} from './textures';

export const LANE_WIDTH = 3.2;
export const TRACK_LANES = [-LANE_WIDTH, 0, LANE_WIDTH] as const;

/**
 * Creates a 40-meter segment of 3-lane railway tracks with Mediterranean street scenery
 */
export function createTrackChunk(length: number = 40, theme: EnvironmentTheme = 'metro'): THREE.Group {
  const chunk = new THREE.Group();
  chunk.name = 'track_chunk';

  // 1. Gravel / Ballast Bed (ground)
  const ballastGeo = new THREE.PlaneGeometry(16, length);
  const ballastTex = createBallastTexture();
  ballastTex.repeat.set(2, length / 4);

  const ballastMat = new THREE.MeshStandardMaterial({
    map: ballastTex,
    roughness: 0.85,
    metalness: 0.1
  });

  const ballastMesh = new THREE.Mesh(ballastGeo, ballastMat);
  ballastMesh.rotation.x = -Math.PI / 2;
  ballastMesh.position.y = 0;
  ballastMesh.receiveShadow = true;
  chunk.add(ballastMesh);

  // 2. Iconic Vibrant Terracotta Sleepers (Ties) as seen in video!
  const tieTex = createWoodTieTexture();
  const tieGeo = new THREE.BoxGeometry(2.4, 0.14, 0.4);
  const tieMat = new THREE.MeshStandardMaterial({
    map: tieTex,
    roughness: 0.6,
    metalness: 0.1
  });

  const tieSpacing = 1.35;
  const numTies = Math.floor(length / tieSpacing);

  TRACK_LANES.forEach(laneX => {
    for (let i = 0; i < numTies; i++) {
      const tieMesh = new THREE.Mesh(tieGeo, tieMat);
      tieMesh.position.set(laneX, 0.07, -length / 2 + i * tieSpacing + tieSpacing / 2);
      tieMesh.receiveShadow = true;
      chunk.add(tieMesh);
    }

    // 3. Polished Steel Rails per lane
    const railMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      metalness: 0.95,
      roughness: 0.15
    });

    [-0.85, 0.85].forEach(railOffset => {
      const railGeo = new THREE.BoxGeometry(0.1, 0.18, length);
      const rail = new THREE.Mesh(railGeo, railMat);
      rail.position.set(laneX + railOffset, 0.22, 0);
      rail.receiveShadow = true;
      chunk.add(rail);
    });
  });

  // 4. Overhead Catenary Gantries & Black Power Cables (as seen in video!)
  const gantryMat = new THREE.MeshStandardMaterial({ color: '#1e293b', metalness: 0.9, roughness: 0.3 });
  const gantry = new THREE.Group();

  // Left & right steel truss towers
  [-6.8, 6.8].forEach(x => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 7.5, 8), gantryMat);
    tower.position.set(x, 3.75, 0);
    tower.castShadow = true;
    gantry.add(tower);
  });

  // Cross truss beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(14.0, 0.35, 0.4), gantryMat);
  beam.position.set(0, 7.2, 0);
  beam.castShadow = true;
  gantry.add(beam);

  // Power Cable suspension droppers
  TRACK_LANES.forEach(lx => {
    const dropper = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 1.2, 6),
      gantryMat
    );
    dropper.position.set(lx, 6.5, 0);
    gantry.add(dropper);
  });

  chunk.add(gantry);

  // Continuous overhead power wires along the chunk length
  const wireMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
  TRACK_LANES.forEach(lx => {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, length, 4), wireMat);
    wire.rotation.x = Math.PI / 2;
    wire.position.set(lx, 5.9, 0);
    chunk.add(wire);
  });

  // 5. Flanking Mediterranean Townhouses, Trees & Vintage Street Lanterns
  // Colorful townhouse wall colors from the video
  const townColors = ['#f59e0b', '#f97316', '#ef4444', '#06b6d4', '#eab308', '#ec4899'];
  const awningColors = ['#dc2626', '#0284c7', '#ea580c', '#16a34a'];

  [-1, 1].forEach((side, sideIdx) => {
    const buildingX = side * 11.5;
    const wallColor = townColors[(sideIdx * 2 + Math.floor(Math.random() * 2)) % townColors.length];
    const awningColor = awningColors[(sideIdx + Math.floor(Math.random() * 2)) % awningColors.length];
    const townTex = createTownhouseTexture(wallColor, awningColor);

    // Townhouse block
    const bGeo = new THREE.BoxGeometry(6, 12, length);
    const bMat = new THREE.MeshStandardMaterial({ map: townTex, roughness: 0.6 });
    const townhouse = new THREE.Mesh(bGeo, bMat);
    townhouse.position.set(buildingX, 6, 0);
    townhouse.castShadow = true;
    townhouse.receiveShadow = true;
    chunk.add(townhouse);

    // Vintage wrought-iron street lamp post (seen in video)
    const lamp = new THREE.Group();
    lamp.position.set(side * 7.5, 0, -length * 0.25);
    
    const postMat = new THREE.MeshStandardMaterial({ color: '#0f172a', metalness: 0.8, roughness: 0.3 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8), postMat);
    post.position.y = 2.1;
    lamp.add(post);

    // Glowing warm lantern head
    const lanternMat = new THREE.MeshStandardMaterial({
      color: '#fef08a',
      emissive: '#fef08a',
      emissiveIntensity: 1.8,
      roughness: 0.1
    });
    const lanternHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.45, 0.35), lanternMat);
    lanternHead.position.set(0, 4.3, 0);
    lamp.add(lanternHead);
    chunk.add(lamp);

    // Stylized Round Green Tree (as seen in video)
    if (Math.random() > 0.35) {
      const tree = new THREE.Group();
      tree.position.set(side * 8.2, 0, length * 0.25);

      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.28, 2.2, 8),
        new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 })
      );
      trunk.position.y = 1.1;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(
        new THREE.SphereGeometry(1.4, 12, 12),
        new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.7 })
      );
      foliage.scale.set(1, 1.2, 1);
      foliage.position.y = 3.2;
      foliage.castShadow = true;
      tree.add(foliage);

      chunk.add(tree);
    }
  });

  return chunk;
}

/**
 * Creates arched Mediterranean Stucco Tunnel / Archway segment
 */
export function createTunnelChunk(length: number = 40, theme: EnvironmentTheme = 'metro'): THREE.Group {
  const tunnel = createTrackChunk(length, theme);
  tunnel.name = 'tunnel_chunk';

  // Warm terracotta stucco archway spanning over tracks
  const archGeo = new THREE.CylinderGeometry(8.5, 8.5, length, 24, 1, true, 0, Math.PI);
  const archMat = new THREE.MeshStandardMaterial({
    color: '#c2410c', // Terracotta orange stone
    roughness: 0.85,
    metalness: 0.1,
    side: THREE.BackSide
  });

  const archMesh = new THREE.Mesh(archGeo, archMat);
  archMesh.rotation.z = Math.PI / 2;
  archMesh.rotation.y = Math.PI / 2;
  archMesh.position.set(0, 1.4, 0);
  tunnel.add(archMesh);

  // Center support pillars between tracks (as seen in video!)
  [-1.6, 1.6].forEach(x => {
    for (let z = -length / 2 + 6; z < length / 2; z += 12) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 7.5, 0.8),
        new THREE.MeshStandardMaterial({ color: '#9a3412', roughness: 0.8 })
      );
      pillar.position.set(x, 3.75, z);
      pillar.castShadow = true;
      tunnel.add(pillar);
    }
  });

  // Glowing round wall lights inside tunnel (seen in video)
  const lampMat = new THREE.MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#fde047',
    emissiveIntensity: 2.2
  });

  for (let z = -length / 2 + 5; z < length / 2; z += 10) {
    [-7.2, 7.2].forEach(x => {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), lampMat);
      lamp.position.set(x, 4.5, z);
      tunnel.add(lamp);
    });
  }

  return tunnel;
}

/**
 * Creates Mediterranean skyline backdrop with azure coastal hills
 */
export function createCitySkylineScenery(theme: EnvironmentTheme = 'metro'): THREE.Group {
  const skyline = new THREE.Group();
  skyline.name = 'city_skyline';

  // Distant pastel Mediterranean buildings & azure hills
  const hillMat = new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.9 });
  const hill = new THREE.Mesh(new THREE.ConeGeometry(80, 45, 12), hillMat);
  hill.position.set(0, -10, -180);
  skyline.add(hill);

  return skyline;
}
