/**
 * Metro Dash 3D - Procedural Character Generator & Articulated Hoverboard Rig
 * Generates stylized human skater kids (with hoodie up and graffiti back patch) and racing hoverboards.
 */

import * as THREE from 'three';
import { CharacterConfig } from '../../types/game';
import { createHoodieBackTexture, createHoverboardTexture } from './textures';

export interface ArticulatedCharacter {
  root: THREE.Group;
  pelvis: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftArmPivot: THREE.Group;
  rightArmPivot: THREE.Group;
  leftForearm: THREE.Group;
  rightForearm: THREE.Group;
  leftLegPivot: THREE.Group;
  rightLegPivot: THREE.Group;
  leftShin: THREE.Group;
  rightShin: THREE.Group;
  leftFoot: THREE.Group;
  rightFoot: THREE.Group;
  hoverboard: THREE.Group;
  jetpack: THREE.Group;
  shieldMesh: THREE.Mesh;
  shadowMesh: THREE.Mesh;
}

/**
 * Creates a stylized human skateboarder / subway runner matching the video
 */
export function createCharacterModel(config: CharacterConfig): ArticulatedCharacter {
  const root = new THREE.Group();
  root.name = `character_${config.id}`;

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: config.colors.skin,
    roughness: 0.65,
    metalness: 0.05
  });

  const hoodieMat = new THREE.MeshStandardMaterial({
    color: config.colors.jacket,
    roughness: 0.75,
    metalness: 0.1
  });

  const jeansMat = new THREE.MeshStandardMaterial({
    color: config.colors.pants,
    roughness: 0.8,
    metalness: 0.05
  });

  const shoeMat = new THREE.MeshStandardMaterial({
    color: config.colors.shoes,
    roughness: 0.35,
    metalness: 0.1
  });

  const soleMat = new THREE.MeshStandardMaterial({
    color: '#d97706', // Gum rubber sole
    roughness: 0.5,
    metalness: 0.0
  });

  // 1. Soft radial contact shadow directly grounded beneath feet
  const shadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 128;
  shadowCanvas.height = 128;
  const sCtx = shadowCanvas.getContext('2d')!;
  const sGrad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
  sGrad.addColorStop(0, 'rgba(0,0,0,0.65)');
  sGrad.addColorStop(0.6, 'rgba(0,0,0,0.25)');
  sGrad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 128, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.65,
    depthWrite: false
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02;
  root.add(shadowMesh);

  // 2. Hoverboard (Subway Surfer yellow racing board as seen in video)
  const hoverboard = new THREE.Group();
  hoverboard.name = 'hoverboard';
  hoverboard.position.y = 0.15;
  root.add(hoverboard);

  // Board Deck
  const boardGeo = new THREE.BoxGeometry(0.72, 0.08, 1.6);
  const boardTex = createHoverboardTexture(config.colors.boardPrimary, config.colors.boardSecondary);
  const boardMat = new THREE.MeshStandardMaterial({
    map: boardTex,
    roughness: 0.3,
    metalness: 0.4
  });
  const deckMesh = new THREE.Mesh(boardGeo, boardMat);
  deckMesh.castShadow = true;
  hoverboard.add(deckMesh);

  // Curved Nose and Tail
  [-0.85, 0.85].forEach(z => {
    const kickGeo = new THREE.BoxGeometry(0.68, 0.08, 0.22);
    const kickMesh = new THREE.Mesh(kickGeo, boardMat);
    kickMesh.rotation.x = z > 0 ? 0.3 : -0.3;
    kickMesh.position.set(0, 0.04, z);
    kickMesh.castShadow = true;
    hoverboard.add(kickMesh);
  });

  // Glowing neon thruster pucks underneath board
  const thrusterMat = new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    emissive: '#0284c7',
    emissiveIntensity: 2.0,
    roughness: 0.2
  });
  [-0.45, 0.45].forEach(z => {
    const puck = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.06, 16), thrusterMat);
    puck.position.set(0, -0.05, z);
    hoverboard.add(puck);
  });

  // 3. Pelvis / Hips Group
  const pelvis = new THREE.Group();
  pelvis.position.y = 0.95;
  root.add(pelvis);

  // Pelvis / Jeans Waistband
  const hipsGeo = new THREE.CylinderGeometry(0.24, 0.2, 0.22, 12);
  const hipsMesh = new THREE.Mesh(hipsGeo, jeansMat);
  hipsMesh.castShadow = true;
  pelvis.add(hipsMesh);

  // 4. Torso with Hooded Sweatshirt & Graffiti Back Patch
  const torso = new THREE.Group();
  torso.position.y = 0.12;
  pelvis.add(torso);

  // Hoodie Torso
  const chestGeo = new THREE.BoxGeometry(0.52, 0.58, 0.34);
  const chestMesh = new THREE.Mesh(chestGeo, hoodieMat);
  chestMesh.position.y = 0.29;
  chestMesh.castShadow = true;
  torso.add(chestMesh);

  // Graffiti Subway Spray Badge on Back of Hoodie (as seen in video!)
  const backPatchTex = createHoodieBackTexture();
  const backPatchGeo = new THREE.PlaneGeometry(0.38, 0.38);
  const backPatchMat = new THREE.MeshBasicMaterial({
    map: backPatchTex,
    transparent: true
  });
  const backPatch = new THREE.Mesh(backPatchGeo, backPatchMat);
  backPatch.position.set(0, 0.3, -0.175);
  backPatch.rotation.y = Math.PI; // Face backward
  torso.add(backPatch);

  // Front Hoodie Pocket (Kangaroo pocket)
  const pocketGeo = new THREE.BoxGeometry(0.34, 0.18, 0.08);
  const pocketMesh = new THREE.Mesh(pocketGeo, hoodieMat);
  pocketMesh.position.set(0, 0.16, 0.18);
  torso.add(pocketMesh);

  // Hoodie Drawstrings
  const stringMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  [-0.06, 0.06].forEach(x => {
    const str = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), stringMat);
    str.position.set(x, 0.42, 0.19);
    torso.add(str);
  });

  // 5. Head with Hood UP (matching the video!)
  const head = new THREE.Group();
  head.position.y = 0.72;
  torso.add(head);

  // Hood shape wrapping over head
  const hoodMat = new THREE.MeshStandardMaterial({
    color: config.colors.hood,
    roughness: 0.8
  });
  const hoodOuterGeo = new THREE.SphereGeometry(0.28, 16, 16);
  const hoodOuter = new THREE.Mesh(hoodOuterGeo, hoodMat);
  hoodOuter.scale.set(1.0, 1.15, 1.1);
  hoodOuter.castShadow = true;
  head.add(hoodOuter);

  // Inner face opening inside the hood
  const faceGeo = new THREE.SphereGeometry(0.2, 14, 14);
  const faceMesh = new THREE.Mesh(faceGeo, skinMat);
  faceMesh.position.set(0, -0.02, 0.08);
  faceMesh.castShadow = true;
  head.add(faceMesh);

  // Stylized Expressive Eyes
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const pupilMat = new THREE.MeshBasicMaterial({ color: '#1e293b' });

  [-0.07, 0.07].forEach(x => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeWhiteMat);
    eyeWhite.scale.set(1, 1.2, 0.5);
    eyeWhite.position.set(x, 0.02, 0.24);
    head.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.022, 8, 8), pupilMat);
    pupil.position.set(x, 0.02, 0.26);
    head.add(pupil);
  });

  // Hair bangs peeking out under hood brim
  const hairMat = new THREE.MeshStandardMaterial({ color: config.colors.hair, roughness: 0.9 });
  const bangsGeo = new THREE.BoxGeometry(0.22, 0.06, 0.08);
  const bangs = new THREE.Mesh(bangsGeo, hairMat);
  bangs.position.set(0, 0.12, 0.22);
  head.add(bangs);

  // 6. Left Arm Hierarchy
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.32, 0.52, 0);
  torso.add(leftArmPivot);

  const upperArmGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.28, 8);
  const leftUpperMesh = new THREE.Mesh(upperArmGeo, hoodieMat);
  leftUpperMesh.position.y = -0.14;
  leftUpperMesh.castShadow = true;
  leftArmPivot.add(leftUpperMesh);

  const leftForearm = new THREE.Group();
  leftForearm.position.y = -0.28;
  leftArmPivot.add(leftForearm);

  const forearmGeo = new THREE.CylinderGeometry(0.065, 0.055, 0.26, 8);
  const leftForearmMesh = new THREE.Mesh(forearmGeo, hoodieMat);
  leftForearmMesh.position.y = -0.13;
  leftForearmMesh.castShadow = true;
  leftForearm.add(leftForearmMesh);

  const handGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const leftHandMesh = new THREE.Mesh(handGeo, skinMat);
  leftHandMesh.position.y = -0.28;
  leftForearm.add(leftHandMesh);

  // 7. Right Arm Hierarchy
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.32, 0.52, 0);
  torso.add(rightArmPivot);

  const rightUpperMesh = new THREE.Mesh(upperArmGeo, hoodieMat);
  rightUpperMesh.position.y = -0.14;
  rightUpperMesh.castShadow = true;
  rightArmPivot.add(rightUpperMesh);

  const rightForearm = new THREE.Group();
  rightForearm.position.y = -0.28;
  rightArmPivot.add(rightForearm);

  const rightForearmMesh = new THREE.Mesh(forearmGeo, hoodieMat);
  rightForearmMesh.position.y = -0.13;
  rightForearmMesh.castShadow = true;
  rightForearm.add(rightForearmMesh);

  const rightHandMesh = new THREE.Mesh(handGeo, skinMat);
  rightHandMesh.position.y = -0.28;
  rightForearm.add(rightHandMesh);

  // 8. Left Leg Hierarchy (Jeans)
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.14, -0.1, 0);
  pelvis.add(leftLegPivot);

  const thighGeo = new THREE.CylinderGeometry(0.095, 0.08, 0.42, 8);
  const leftThighMesh = new THREE.Mesh(thighGeo, jeansMat);
  leftThighMesh.position.y = -0.21;
  leftThighMesh.castShadow = true;
  leftLegPivot.add(leftThighMesh);

  const leftShin = new THREE.Group();
  leftShin.position.y = -0.42;
  leftLegPivot.add(leftShin);

  const shinGeo = new THREE.CylinderGeometry(0.08, 0.07, 0.42, 8);
  const leftShinMesh = new THREE.Mesh(shinGeo, jeansMat);
  leftShinMesh.position.y = -0.21;
  leftShinMesh.castShadow = true;
  leftShin.add(leftShinMesh);

  // Left Skate Sneaker (White/black classic skate shoe)
  const leftFoot = new THREE.Group();
  leftFoot.position.set(0, -0.42, 0);
  leftShin.add(leftFoot);

  const shoeUpperGeo = new THREE.BoxGeometry(0.15, 0.12, 0.28);
  const leftShoeUpper = new THREE.Mesh(shoeUpperGeo, shoeMat);
  leftShoeUpper.position.set(0, 0.06, 0.05);
  leftShoeUpper.castShadow = true;
  leftFoot.add(leftShoeUpper);

  const soleGeo = new THREE.BoxGeometry(0.16, 0.04, 0.3);
  const leftSole = new THREE.Mesh(soleGeo, soleMat);
  leftSole.position.set(0, 0.02, 0.05);
  leftFoot.add(leftSole);

  // 9. Right Leg Hierarchy (Jeans)
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.14, -0.1, 0);
  pelvis.add(rightLegPivot);

  const rightThighMesh = new THREE.Mesh(thighGeo, jeansMat);
  rightThighMesh.position.y = -0.21;
  rightThighMesh.castShadow = true;
  rightLegPivot.add(rightThighMesh);

  const rightShin = new THREE.Group();
  rightShin.position.y = -0.42;
  rightLegPivot.add(rightShin);

  const rightShinMesh = new THREE.Mesh(shinGeo, jeansMat);
  rightShinMesh.position.y = -0.21;
  rightShinMesh.castShadow = true;
  rightShin.add(rightShinMesh);

  // Right Skate Sneaker
  const rightFoot = new THREE.Group();
  rightFoot.position.set(0, -0.42, 0);
  rightShin.add(rightFoot);

  const rightShoeUpper = new THREE.Mesh(shoeUpperGeo, shoeMat);
  rightShoeUpper.position.set(0, 0.06, 0.05);
  rightShoeUpper.castShadow = true;
  rightFoot.add(rightShoeUpper);

  const rightSole = new THREE.Mesh(soleGeo, soleMat);
  rightSole.position.set(0, 0.02, 0.05);
  rightFoot.add(rightSole);

  // 10. Jetpack Attachment
  const jetpack = new THREE.Group();
  jetpack.position.set(0, 0.28, -0.22);
  jetpack.visible = false;
  torso.add(jetpack);

  [-0.12, 0.12].forEach(x => {
    const tankGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.38, 12);
    const tankMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.8, roughness: 0.2 });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(x, 0, 0);
    jetpack.add(tank);

    const nozzle = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.1, 10),
      new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.9, roughness: 0.3 })
    );
    nozzle.position.set(x, -0.24, 0);
    jetpack.add(nozzle);
  });

  // 11. Energy Shield Sphere
  const shieldGeo = new THREE.SphereGeometry(1.2, 20, 20);
  const shieldMat = new THREE.MeshPhysicalMaterial({
    color: '#06b6d4',
    transmission: 0.85,
    opacity: 0.45,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1,
    emissive: '#0891b2',
    emissiveIntensity: 0.3,
    depthWrite: false
  });
  const shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
  shieldMesh.position.y = 0.9;
  shieldMesh.visible = false;
  root.add(shieldMesh);

  return {
    root,
    pelvis,
    torso,
    head,
    leftArmPivot,
    rightArmPivot,
    leftForearm,
    rightForearm,
    leftLegPivot,
    rightLegPivot,
    leftShin,
    rightShin,
    leftFoot,
    rightFoot,
    hoverboard,
    jetpack,
    shieldMesh,
    shadowMesh
  };
}

/**
 * Creates Inspector Chaser character with peaked cap, security uniform and whistle
 */
export function createInspectorModel(): ArticulatedCharacter {
  const inspectorConfig: CharacterConfig = {
    id: 'inspector',
    name: 'Inspector Grump',
    title: 'Metro Security Chief',
    description: 'Relentless railway inspector who enforces subway safety rules.',
    cost: 0,
    unlocked: true,
    colors: {
      skin: '#e0ac69',
      hair: '#475569',
      jacket: '#1e3a8a', // Security Navy
      hood: '#1e3a8a',
      pants: '#0f172a',
      shoes: '#18181b',  // Black duty boots
      accent: '#facc15', // Gold badge
      boardPrimary: '#1e3a8a',
      boardSecondary: '#facc15'
    },
    specialty: 'The Law'
  };

  const character = createCharacterModel(inspectorConfig);
  character.hoverboard.visible = false; // Inspector runs on foot

  // Add Peaked Security Cap
  const capGeo = new THREE.CylinderGeometry(0.27, 0.23, 0.14, 16);
  const capMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.5 });
  const cap = new THREE.Mesh(capGeo, capMat);
  cap.position.set(0, 0.18, 0);
  character.head.add(cap);

  // Black glossy cap visor
  const capBrimGeo = new THREE.BoxGeometry(0.3, 0.03, 0.16);
  const brimMat = new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.1, metalness: 0.5 });
  const brim = new THREE.Mesh(capBrimGeo, brimMat);
  brim.position.set(0, 0.12, 0.2);
  character.head.add(brim);

  // Gold officer badge
  const badgeGeo = new THREE.BoxGeometry(0.06, 0.07, 0.02);
  const badgeMat = new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.9, roughness: 0.2 });
  const badge = new THREE.Mesh(badgeGeo, badgeMat);
  badge.position.set(0, 0.2, 0.24);
  character.head.add(badge);

  // Mustache
  const stacheGeo = new THREE.BoxGeometry(0.14, 0.04, 0.04);
  const stacheMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 });
  const stache = new THREE.Mesh(stacheGeo, stacheMat);
  stache.position.set(0, -0.06, 0.22);
  character.head.add(stache);

  return character;
}

export interface CompanionDog {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftEar: THREE.Group;
  rightEar: THREE.Group;
  frontLeftLeg: THREE.Group;
  frontRightLeg: THREE.Group;
  backLeftLeg: THREE.Group;
  backRightLeg: THREE.Group;
  tail: THREE.Group;
}

/**
 * Creates Inspector's loyal security guard dog (classic cartoon bulldog companion)
 */
export function createCompanionDog(): CompanionDog {
  const root = new THREE.Group();
  root.name = 'companion_bulldog';

  // Soft contact shadow beneath the dog
  const shadowGeo = new THREE.PlaneGeometry(0.9, 1.1);
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 64;
  shadowCanvas.height = 64;
  const sCtx = shadowCanvas.getContext('2d')!;
  const sGrad = sCtx.createRadialGradient(32, 32, 4, 32, 32, 30);
  sGrad.addColorStop(0, 'rgba(0,0,0,0.6)');
  sGrad.addColorStop(0.7, 'rgba(0,0,0,0.2)');
  sGrad.addColorStop(1, 'rgba(0,0,0,0)');
  sCtx.fillStyle = sGrad;
  sCtx.fillRect(0, 0, 64, 64);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.6,
    depthWrite: false
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.y = 0.02;
  root.add(shadowMesh);

  // Materials
  const furMat = new THREE.MeshStandardMaterial({
    color: '#b46d32', // Warm caramel bulldog fur
    roughness: 0.8,
    metalness: 0.05
  });

  const muzzleMat = new THREE.MeshStandardMaterial({
    color: '#603813', // Dark chocolate muzzle
    roughness: 0.85
  });

  const whiteFurMat = new THREE.MeshStandardMaterial({
    color: '#f8fafc', // Cream white chest & paws
    roughness: 0.85
  });

  const collarMat = new THREE.MeshStandardMaterial({
    color: '#dc2626', // Vibrant red collar
    roughness: 0.4,
    metalness: 0.1
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: '#fbbf24', // Shiny brass tag & studs
    metalness: 0.85,
    roughness: 0.2
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: '#18181b', // Glossy nose & pupils
    roughness: 0.2
  });

  const tongueMat = new THREE.MeshStandardMaterial({
    color: '#f472b6', // Pink panting tongue
    roughness: 0.5
  });

  // Body Group
  const body = new THREE.Group();
  body.position.set(0, 0.38, 0);
  root.add(body);

  // Stocky Torso
  const torsoGeo = new THREE.BoxGeometry(0.42, 0.34, 0.58);
  const torsoMesh = new THREE.Mesh(torsoGeo, furMat);
  torsoMesh.castShadow = true;
  torsoMesh.position.set(0, 0, 0);
  body.add(torsoMesh);

  // White chest patch
  const chestGeo = new THREE.BoxGeometry(0.32, 0.24, 0.08);
  const chestMesh = new THREE.Mesh(chestGeo, whiteFurMat);
  chestMesh.position.set(0, -0.04, 0.26);
  body.add(chestMesh);

  // Red Spiked Collar
  const collarGeo = new THREE.BoxGeometry(0.38, 0.08, 0.1);
  const collarMesh = new THREE.Mesh(collarGeo, collarMat);
  collarMesh.position.set(0, 0.14, 0.24);
  body.add(collarMesh);

  // Golden Collar Tag
  const tagGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 12);
  const tagMesh = new THREE.Mesh(tagGeo, goldMat);
  tagMesh.rotation.x = Math.PI / 2;
  tagMesh.position.set(0, 0.09, 0.3);
  body.add(tagMesh);

  // Head Group
  const head = new THREE.Group();
  head.position.set(0, 0.22, 0.28);
  body.add(head);

  // Chubby Head
  const headGeo = new THREE.BoxGeometry(0.38, 0.34, 0.36);
  const headMesh = new THREE.Mesh(headGeo, furMat);
  headMesh.castShadow = true;
  head.add(headMesh);

  // Wrinkled Muzzle
  const muzzleGeo = new THREE.BoxGeometry(0.26, 0.18, 0.18);
  const muzzleMesh = new THREE.Mesh(muzzleGeo, muzzleMat);
  muzzleMesh.position.set(0, -0.07, 0.2);
  head.add(muzzleMesh);

  // Black button nose
  const noseGeo = new THREE.BoxGeometry(0.1, 0.08, 0.06);
  const noseMesh = new THREE.Mesh(noseGeo, blackMat);
  noseMesh.position.set(0, 0.01, 0.3);
  head.add(noseMesh);

  // Panting Tongue
  const tongueGeo = new THREE.BoxGeometry(0.08, 0.03, 0.12);
  const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
  tongueMesh.rotation.x = 0.25;
  tongueMesh.position.set(0, -0.15, 0.24);
  head.add(tongueMesh);

  // Cartoon Eyes (White sclera + black pupil + shiny highlight)
  [-0.11, 0.11].forEach(eyeX => {
    const eyeWhiteGeo = new THREE.BoxGeometry(0.09, 0.09, 0.04);
    const eyeWhite = new THREE.Mesh(eyeWhiteGeo, whiteFurMat);
    eyeWhite.position.set(eyeX, 0.06, 0.19);
    head.add(eyeWhite);

    const pupilGeo = new THREE.BoxGeometry(0.05, 0.05, 0.02);
    const pupil = new THREE.Mesh(pupilGeo, blackMat);
    pupil.position.set(eyeX, 0.06, 0.215);
    head.add(pupil);
  });

  // Floppy Folded Bulldog Ears
  const leftEar = new THREE.Group();
  leftEar.position.set(-0.2, 0.16, 0.04);
  head.add(leftEar);
  const earGeo = new THREE.BoxGeometry(0.08, 0.16, 0.12);
  const leftEarMesh = new THREE.Mesh(earGeo, muzzleMat);
  leftEarMesh.rotation.z = -0.3;
  leftEarMesh.rotation.x = 0.2;
  leftEar.add(leftEarMesh);

  const rightEar = new THREE.Group();
  rightEar.position.set(0.2, 0.16, 0.04);
  head.add(rightEar);
  const rightEarMesh = new THREE.Mesh(earGeo, muzzleMat);
  rightEarMesh.rotation.z = 0.3;
  rightEarMesh.rotation.x = 0.2;
  rightEar.add(rightEarMesh);

  // Helper to build a stubby animated leg with white paw
  const createLeg = (x: number, z: number): THREE.Group => {
    const legPivot = new THREE.Group();
    legPivot.position.set(x, -0.12, z);

    const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.22, 8), furMat);
    legMesh.position.set(0, -0.1, 0);
    legMesh.castShadow = true;
    legPivot.add(legMesh);

    const pawMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.16), whiteFurMat);
    pawMesh.position.set(0, -0.2, 0.04);
    legPivot.add(pawMesh);

    body.add(legPivot);
    return legPivot;
  };

  const frontLeftLeg = createLeg(-0.16, 0.18);
  const frontRightLeg = createLeg(0.16, 0.18);
  const backLeftLeg = createLeg(-0.16, -0.18);
  const backRightLeg = createLeg(0.16, -0.18);

  // Tail
  const tail = new THREE.Group();
  tail.position.set(0, 0.1, -0.29);
  body.add(tail);

  const tailGeo = new THREE.ConeGeometry(0.05, 0.18, 8);
  const tailMesh = new THREE.Mesh(tailGeo, furMat);
  tailMesh.rotation.x = -Math.PI / 3;
  tailMesh.position.set(0, 0.06, -0.06);
  tail.add(tailMesh);

  return {
    root,
    body,
    head,
    leftEar,
    rightEar,
    frontLeftLeg,
    frontRightLeg,
    backLeftLeg,
    backRightLeg,
    tail
  };
}

/**
 * Backwards compatibility helper for any previous drone references
 */
export function createCompanionDrone(): THREE.Group {
  return createCompanionDog().root;
}

/**
 * Animates Inspector's companion bulldog with enthusiastic canine run cycle & tail wag
 */
export function animateCompanionDog(
  dog: CompanionDog,
  time: number,
  speed: number
) {
  const runFreq = speed * 0.9;
  
  // Trot / Gallop leg swing
  dog.frontLeftLeg.rotation.x = Math.sin(time * runFreq) * 0.75;
  dog.frontRightLeg.rotation.x = -Math.sin(time * runFreq) * 0.75;
  dog.backLeftLeg.rotation.x = -Math.sin(time * runFreq + 0.4) * 0.7;
  dog.backRightLeg.rotation.x = Math.sin(time * runFreq + 0.4) * 0.7;

  // Running bounce
  dog.body.position.y = 0.38 + Math.abs(Math.sin(time * runFreq)) * 0.09;

  // Head bob
  dog.head.rotation.x = Math.sin(time * runFreq) * 0.14;
  dog.head.rotation.y = Math.sin(time * 3) * 0.08;

  // Enthusiastic tail wagging
  dog.tail.rotation.y = Math.sin(time * 26) * 0.6;
  dog.tail.rotation.z = Math.cos(time * 26) * 0.2;

  // Floppy ear bounce
  dog.leftEar.rotation.z = -0.25 + Math.sin(time * runFreq) * 0.15;
  dog.rightEar.rotation.z = 0.25 - Math.sin(time * runFreq) * 0.15;
}

/**
 * Updates articulated character animation smoothly with hoverboard surfing mechanics
 */
export function animateCharacterRig(
  rig: ArticulatedCharacter,
  state: 'run' | 'jump' | 'slide' | 'fly' | 'crash',
  time: number,
  speed: number,
  laneXOffset: number,
  isHoverboardActive: boolean = true
) {
  // Show/Hide hoverboard
  rig.hoverboard.visible = isHoverboardActive;

  // Lane banking tilt
  rig.root.rotation.z = THREE.MathUtils.damp(rig.root.rotation.z, -laneXOffset * 0.12, 10, 0.016);
  rig.root.rotation.y = THREE.MathUtils.damp(rig.root.rotation.y, laneXOffset * 0.1, 10, 0.016);

  if (isHoverboardActive) {
    // Hoverboard gentle floating hover bob
    rig.hoverboard.position.y = 0.12 + Math.sin(time * 8) * 0.04;
    rig.hoverboard.rotation.z = -laneXOffset * 0.08;

    if (state === 'run') {
      // Surfing pose: side-angled stance on board
      rig.pelvis.position.y = 0.92 + Math.sin(time * 8) * 0.04;
      rig.pelvis.rotation.y = 0.45; // Turn hips slightly sideways (skate stance)
      rig.torso.rotation.y = -0.3;  // Face shoulders forward

      // Slight knee bend for balance
      rig.leftLegPivot.rotation.x = -0.2;
      rig.rightLegPivot.rotation.x = 0.1;
      rig.leftShin.rotation.x = 0.35;
      rig.rightShin.rotation.x = 0.25;

      // Arms outstretched for surfing balance
      rig.leftArmPivot.rotation.x = -0.25 + Math.sin(time * 4) * 0.08;
      rig.leftArmPivot.rotation.z = -0.4;
      rig.rightArmPivot.rotation.x = 0.2 + Math.cos(time * 4) * 0.08;
      rig.rightArmPivot.rotation.z = 0.4;

    } else if (state === 'jump') {
      // Board 360 kickflip air trick!
      rig.hoverboard.rotation.y = time * 12;
      rig.hoverboard.rotation.x = Math.sin(time * 10) * 0.3;

      rig.pelvis.position.y = 0.95;
      rig.pelvis.rotation.x = -0.2;
      rig.torso.rotation.x = 0.2;

      rig.leftArmPivot.rotation.x = -1.2;
      rig.rightArmPivot.rotation.x = -1.2;
      rig.leftLegPivot.rotation.x = -0.7;
      rig.rightLegPivot.rotation.x = -0.6;
      rig.leftShin.rotation.x = 1.0;
      rig.rightShin.rotation.x = 0.9;

    } else if (state === 'slide') {
      // Crouching low on hoverboard
      rig.pelvis.position.y = 0.45;
      rig.pelvis.rotation.x = -0.6;
      rig.torso.rotation.x = -0.4;

      rig.leftArmPivot.rotation.x = 0.6;
      rig.rightArmPivot.rotation.x = 0.6;
      rig.leftLegPivot.rotation.x = -1.1;
      rig.rightLegPivot.rotation.x = -1.1;

    } else if (state === 'fly') {
      rig.hoverboard.rotation.x = 0.3;
      rig.pelvis.position.y = 0.95;
      rig.pelvis.rotation.x = 0.4;
      rig.torso.rotation.x = 0.35;

    } else if (state === 'crash') {
      rig.hoverboard.rotation.z = 1.5;
      rig.hoverboard.position.y = 0.05;
      rig.pelvis.rotation.x = -0.9;
      rig.torso.rotation.x = -0.5;
    }

  } else {
    // Normal Running on foot (e.g. when hoverboard is not active or for Inspector)
    if (state === 'run') {
      const freq = speed * 0.75;
      const stride = Math.sin(time * freq);
      const cosStride = Math.cos(time * freq);

      rig.pelvis.position.y = 0.95 + Math.abs(stride) * 0.06;
      rig.pelvis.rotation.x = 0.05;
      rig.pelvis.rotation.y = 0;

      rig.torso.rotation.y = stride * 0.12;
      rig.torso.rotation.x = 0.08;

      rig.head.rotation.x = -0.05;
      rig.head.rotation.y = -stride * 0.08;

      rig.leftArmPivot.rotation.x = stride * 0.8;
      rig.rightArmPivot.rotation.x = -stride * 0.8;
      rig.leftArmPivot.rotation.z = 0;
      rig.rightArmPivot.rotation.z = 0;

      rig.leftForearm.rotation.x = -0.4 - Math.max(0, stride) * 0.4;
      rig.rightForearm.rotation.x = -0.4 - Math.max(0, -stride) * 0.4;

      rig.leftLegPivot.rotation.x = -stride * 0.85;
      rig.rightLegPivot.rotation.x = stride * 0.85;

      rig.leftShin.rotation.x = Math.max(0, stride) * 1.1;
      rig.rightShin.rotation.x = Math.max(0, -stride) * 1.1;

      rig.leftFoot.rotation.x = cosStride * 0.2;
      rig.rightFoot.rotation.x = -cosStride * 0.2;

    } else if (state === 'jump') {
      rig.pelvis.position.y = 0.95;
      rig.pelvis.rotation.x = -0.15;
      rig.torso.rotation.x = 0.15;

      rig.leftArmPivot.rotation.x = -1.1;
      rig.rightArmPivot.rotation.x = -1.2;
      rig.leftLegPivot.rotation.x = -0.7;
      rig.rightLegPivot.rotation.x = -0.4;
      rig.leftShin.rotation.x = 1.0;
      rig.rightShin.rotation.x = 0.8;

    } else if (state === 'slide') {
      rig.pelvis.position.y = 0.42;
      rig.pelvis.rotation.x = -0.8;
      rig.torso.rotation.x = -0.6;

      rig.leftArmPivot.rotation.x = 0.7;
      rig.rightArmPivot.rotation.x = 0.7;
      rig.leftLegPivot.rotation.x = -1.2;
      rig.rightLegPivot.rotation.x = -1.35;
      rig.leftShin.rotation.x = 0.15;
      rig.rightShin.rotation.x = 0.2;

    } else if (state === 'fly') {
      rig.pelvis.position.y = 0.95;
      rig.pelvis.rotation.x = 0.4;
      rig.torso.rotation.x = 0.35;

    } else if (state === 'crash') {
      rig.pelvis.rotation.x = -0.9;
      rig.torso.rotation.x = -0.5;
    }
  }
}
