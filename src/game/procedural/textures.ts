/**
 * Metro Dash 3D - Procedural Canvas Textures
 * Creates zero-dependency, vibrant textures matching the colorful Mediterranean subway style in the video.
 */

import * as THREE from 'three';

/**
 * Creates ballast / gravel texture for railway trackbed
 */
export function createBallastTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Warm Mediterranean gravel ground tone
  ctx.fillStyle = '#64748b';
  ctx.fillRect(0, 0, 512, 512);

  // Gravel specks in varied slate and earth tones
  const colors = ['#475569', '#334155', '#94a3b8', '#64748b', '#cbd5e1'];
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 2.5 + 0.8;
    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates vibrant orange-terracotta railway sleepers (ties) exactly like in the video!
 */
export function createWoodTieTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  // Iconic vibrant terracotta orange wood from the video
  const grad = ctx.createLinearGradient(0, 0, 0, 64);
  grad.addColorStop(0, '#ea580c'); // Bright warm orange
  grad.addColorStop(0.5, '#c2410c'); // Rich terracotta
  grad.addColorStop(1, '#9a3412');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 64);

  // Wood bevel edges
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(0, 0, 256, 4);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.fillRect(0, 60, 256, 4);

  // Steel tie plates & fasteners under rails
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(36, 8, 30, 48);
  ctx.fillRect(190, 8, 30, 48);

  // Shiny silver bolt heads
  ctx.fillStyle = '#94a3b8';
  [43, 58].forEach(x => {
    [18, 46].forEach(y => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  [197, 212].forEach(x => {
    [18, 46].forEach(y => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Hoodie Back Graffiti Spray Badge (like the yellow/red/white subway graphic in the video)
 */
export function createHoodieBackTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Transparent dark base
  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 256, 256);

  // Graffiti burst shape (yellow starburst)
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  const numPoints = 12;
  const outerR = 95;
  const innerR = 65;
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / numPoints;
    const x = 128 + Math.cos(angle) * r;
    const y = 128 + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Red outline
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 8;
  ctx.stroke();

  // Bold "DASH" / "SURF" typography
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 8;
  ctx.fillText('SUBWAY', 128, 118);

  ctx.fillStyle = '#f97316';
  ctx.font = '900 24px sans-serif';
  ctx.fillText('★ DASH ★', 128, 156);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Hoverboard Deck Texture (yellow & blue racing design like in the video)
 */
export function createHoverboardTexture(primary = '#facc15', secondary = '#0284c7'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Primary board color
  ctx.fillStyle = primary;
  ctx.fillRect(0, 0, 256, 512);

  // Blue racing center stripe
  ctx.fillStyle = secondary;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(176, 0);
  ctx.lineTo(176, 512);
  ctx.lineTo(80, 512);
  ctx.closePath();
  ctx.fill();

  // White pinstripe borders
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(80, 512);
  ctx.moveTo(176, 0);
  ctx.lineTo(176, 512);
  ctx.stroke();

  // Black grip tape footpads (front and rear)
  ctx.fillStyle = '#1e293b';
  ctx.roundRect(40, 80, 176, 120, 16);
  ctx.fill();
  ctx.roundRect(40, 312, 176, 120, 16);
  ctx.fill();

  // Glowing neon cyan center core
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(128, 256, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates modern subway train side livery with sleek windows and teal accent stripe
 */
export function createTrainSideTexture(themeColor = '#06b6d4'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // White aerodynamic body
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 1024, 256);

  // Dark roof band
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 1024, 40);

  // Vibrant teal/cyan accent racing stripe along lower body (seen in video)
  ctx.fillStyle = themeColor;
  ctx.fillRect(0, 160, 1024, 45);

  // Secondary bright yellow accent pinstripe
  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 150, 1024, 10);

  // Dark passenger windows with bright glass reflections
  const windowCount = 6;
  const windowWidth = 100;
  const windowHeight = 70;
  const spacing = (1024 - windowCount * windowWidth) / (windowCount + 1);

  for (let i = 0; i < windowCount; i++) {
    const x = spacing + i * (windowWidth + spacing);
    const y = 60;

    // Window frame
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(x - 3, y - 3, windowWidth + 6, windowHeight + 6, 8);
    ctx.fill();

    // Dark tinted glass
    const winGrad = ctx.createLinearGradient(x, y, x, y + windowHeight);
    winGrad.addColorStop(0, '#090d16');
    winGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = winGrad;
    ctx.roundRect(x, y, windowWidth, windowHeight, 6);
    ctx.fill();

    // Glare line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 15, y + windowHeight - 5);
    ctx.lineTo(x + windowWidth - 15, y + 5);
    ctx.stroke();
  }

  // Passenger doors outline
  [220, 580, 940].forEach(doorX => {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.strokeRect(doorX - 25, 45, 50, 165);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates Red & White Chevron warning hurdle barrier (as seen in video)
 */
export function createHazardTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 128);

  // Red chevron stripes `<<<`
  ctx.fillStyle = '#dc2626';
  const chevronW = 48;
  for (let x = -chevronW; x < 256 + chevronW * 2; x += chevronW * 2) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + chevronW, 64);
    ctx.lineTo(x, 128);
    ctx.lineTo(x + 28, 128);
    ctx.lineTo(x + chevronW + 28, 64);
    ctx.lineTo(x + 28, 0);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates colorful Mediterranean townhouse facade texture (windows, awnings, arches)
 */
export function createTownhouseTexture(wallColor = '#f59e0b', awningColor = '#ef4444'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Pastel plaster wall
  ctx.fillStyle = wallColor;
  ctx.fillRect(0, 0, 512, 512);

  // Plaster stone lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 2;
  for (let y = 64; y < 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Windows with white shutters and moldings (2 rows of 2 windows)
  const windowPositions = [
    { x: 90, y: 70 },
    { x: 330, y: 70 },
    { x: 90, y: 230 },
    { x: 330, y: 230 }
  ];

  windowPositions.forEach(pos => {
    // White molding
    ctx.fillStyle = '#ffffff';
    ctx.roundRect(pos.x - 8, pos.y - 8, 106, 126, 6);
    ctx.fill();

    // Dark window interior
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(pos.x, pos.y, 90, 110);

    // Cross frame
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(pos.x + 45, pos.y);
    ctx.lineTo(pos.x + 45, pos.y + 110);
    ctx.moveTo(pos.x, pos.y + 55);
    ctx.lineTo(pos.x + 90, pos.y + 55);
    ctx.stroke();

    // Flower planter box
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(pos.x - 12, pos.y + 110, 114, 16);
    // Green plants / flowers
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(pos.x + 15, pos.y + 110, 8, 0, Math.PI * 2);
    ctx.arc(pos.x + 45, pos.y + 108, 10, 0, Math.PI * 2);
    ctx.arc(pos.x + 75, pos.y + 110, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(pos.x + 42, pos.y + 104, 6, 6);
  });

  // Striped café awning along the ground floor
  const awningH = 70;
  const stripeW = 32;
  const startY = 400;
  for (let x = 0; x < 512; x += stripeW * 2) {
    ctx.fillStyle = awningColor;
    ctx.fillRect(x, startY, stripeW, awningH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + stripeW, startY, stripeW, awningH);
  }

  // Scalloped bottom border on awning
  ctx.fillStyle = '#ffffff';
  for (let x = 16; x < 512; x += 32) {
    ctx.beginPath();
    ctx.arc(x, startY + awningH, 16, 0, Math.PI);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates gold coin face texture with embossed star (as seen in video)
 */
export function createCoinTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Glowing radiant gold gradient
  const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
  grad.addColorStop(0, '#fef08a');
  grad.addColorStop(0.65, '#eab308');
  grad.addColorStop(1, '#b45309');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 60, 0, Math.PI * 2);
  ctx.fill();

  // Chunky outer rim
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(64, 64, 54, 0, Math.PI * 2);
  ctx.stroke();

  // Embossed center star
  ctx.fillStyle = '#fef9c3';
  ctx.shadowColor = '#78350f';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = 64 + Math.cos(angle) * 34;
    const y = 64 + Math.sin(angle) * 34;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
