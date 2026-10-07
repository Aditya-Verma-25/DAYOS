import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Ensure assets directories exist
const assetsDir = path.join(rootDir, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Full Icon SVG (1024x1024)
const fullIconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Deep Black Hardware Background -->
  <rect width="1024" height="1024" rx="224" fill="#050505" />

  <!-- Hardware Squircle Outer Rim -->
  <rect x="112" y="112" width="800" height="800" rx="192" fill="#0B0E13" stroke="#222832" stroke-width="12" />

  <!-- Soft Ambient Glow -->
  <circle cx="512" cy="512" r="280" fill="#DFFF00" opacity="0.08" filter="blur(40px)" />

  <!-- Inner Hardware Plate -->
  <rect x="212" y="212" width="600" height="600" rx="140" fill="#08090C" stroke="#DFFF00" stroke-width="6" stroke-opacity="0.4" />

  <!-- Calendar Body in Electric Yellow #DFFF00 -->
  <rect x="332" y="362" width="360" height="360" rx="64" fill="none" stroke="#DFFF00" stroke-width="36" stroke-linejoin="round" />

  <!-- Binder Pins -->
  <line x1="432" y1="292" x2="432" y2="402" stroke="#DFFF00" stroke-width="36" stroke-linecap="round" />
  <line x1="592" y1="292" x2="592" y2="402" stroke="#DFFF00" stroke-width="36" stroke-linecap="round" />

  <!-- Calendar Header Divider -->
  <line x1="332" y1="462" x2="692" y2="462" stroke="#DFFF00" stroke-width="32" stroke-linecap="round" />

  <!-- Crisp Checkmark -->
  <path d="M422 572 L492 642 L622 512" fill="none" stroke="#DFFF00" stroke-width="40" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

// 2. Foreground SVG (1024x1024) with safe margin for adaptive icons
const foregroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Center Hardware Badge -->
  <rect x="252" y="252" width="520" height="520" rx="120" fill="#0B0E13" stroke="#222832" stroke-width="10" />

  <!-- Inner Accent Border -->
  <rect x="264" y="264" width="496" height="496" rx="108" fill="none" stroke="#DFFF00" stroke-width="4" stroke-opacity="0.35" />

  <!-- Calendar Body in Electric Yellow #DFFF00 -->
  <rect x="372" y="392" width="280" height="280" rx="52" fill="none" stroke="#DFFF00" stroke-width="28" stroke-linejoin="round" />

  <!-- Binder Pins -->
  <line x1="452" y1="336" x2="452" y2="422" stroke="#DFFF00" stroke-width="28" stroke-linecap="round" />
  <line x1="572" y1="336" x2="572" y2="422" stroke="#DFFF00" stroke-width="28" stroke-linecap="round" />

  <!-- Calendar Header Divider -->
  <line x1="372" y1="472" x2="652" y2="472" stroke="#DFFF00" stroke-width="24" stroke-linecap="round" />

  <!-- Checkmark -->
  <path d="M442 562 L497 617 L592 522" fill="none" stroke="#DFFF00" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`;

// 3. Background SVG (1024x1024)
const backgroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="#050505" />
</svg>
`;

// 4. Splash Screen SVG (2732x2732)
const splashSvg = `
<svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
  <!-- Deep Obsidian Black Background -->
  <rect width="2732" height="2732" fill="#050505" />

  <!-- Ambient Electric Yellow Bloom Behind Logo -->
  <circle cx="1366" cy="1200" r="380" fill="#DFFF00" opacity="0.06" filter="blur(60px)" />

  <!-- Logo Outer Hardware Plate -->
  <rect x="1156" y="990" width="420" height="420" rx="100" fill="#0B0D10" stroke="#1F242C" stroke-width="8" />

  <!-- Logo Inner Highlight -->
  <rect x="1170" y="1004" width="392" height="392" rx="88" fill="none" stroke="#DFFF00" stroke-width="4" stroke-opacity="0.4" />

  <!-- Calendar Body in Electric Yellow #DFFF00 -->
  <rect x="1246" y="1080" width="240" height="240" rx="44" fill="none" stroke="#DFFF00" stroke-width="24" stroke-linejoin="round" />

  <!-- Binder Pins -->
  <line x1="1316" y1="1030" x2="1316" y2="1106" stroke="#DFFF00" stroke-width="24" stroke-linecap="round" />
  <line x1="1416" y1="1030" x2="1416" y2="1106" stroke="#DFFF00" stroke-width="24" stroke-linecap="round" />

  <!-- Calendar Header Line -->
  <line x1="1246" y1="1146" x2="1486" y2="1146" stroke="#DFFF00" stroke-width="20" stroke-linecap="round" />

  <!-- Checkmark -->
  <path d="M1306 1224 L1352 1270 L1434 1188" fill="none" stroke="#DFFF00" stroke-width="28" stroke-linecap="round" stroke-linejoin="round" />

  <!-- DAYOS Title -->
  <text x="1366" y="1560" font-family="system-ui, -apple-system, sans-serif" font-size="84" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="12">DAYOS</text>

  <!-- Tagline -->
  <text x="1366" y="1630" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="600" fill="#94A3B8" text-anchor="middle" letter-spacing="2">Run your day.</text>

  <!-- Made by attribution -->
  <text x="1366" y="2460" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="500" fill="#475569" text-anchor="middle" letter-spacing="1">Made by Aditya Verma</text>
</svg>
`;

async function generate() {
  console.log('Generating high-res source assets...');

  const fullIconBuf = Buffer.from(fullIconSvg);
  const foregroundBuf = Buffer.from(foregroundSvg);
  const backgroundBuf = Buffer.from(backgroundSvg);
  const splashBuf = Buffer.from(splashSvg);

  // Write base assets
  await sharp(fullIconBuf).png().toFile(path.join(assetsDir, 'icon-only.png'));
  await sharp(foregroundBuf).png().toFile(path.join(assetsDir, 'icon-foreground.png'));
  await sharp(backgroundBuf).png().toFile(path.join(assetsDir, 'icon-background.png'));
  await sharp(splashBuf).png().toFile(path.join(assetsDir, 'splash.png'));
  await sharp(splashBuf).png().toFile(path.join(assetsDir, 'splash-dark.png'));

  console.log('Assets saved to assets/ directory.');

  // Android mipmap densities for launcher icons
  const densities = [
    { dir: 'mipmap-mdpi', size: 48, fgSize: 108 },
    { dir: 'mipmap-hdpi', size: 72, fgSize: 162 },
    { dir: 'mipmap-xhdpi', size: 96, fgSize: 216 },
    { dir: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
    { dir: 'mipmap-xxxhdpi', size: 192, fgSize: 432 },
  ];

  const resDir = path.join(rootDir, 'android', 'app', 'src', 'main', 'res');

  for (const d of densities) {
    const targetDir = path.join(resDir, d.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

    // ic_launcher.png
    await sharp(fullIconBuf)
      .resize(d.size, d.size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // ic_launcher_round.png
    await sharp(fullIconBuf)
      .resize(d.size, d.size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png
    await sharp(foregroundBuf)
      .resize(d.fgSize, d.fgSize)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`Generated launcher icons for ${d.dir}`);
  }

  // Splash drawables
  const splashDrawables = [
    { dir: 'drawable', width: 480, height: 800 },
    { dir: 'drawable-port-mdpi', width: 320, height: 480 },
    { dir: 'drawable-port-hdpi', width: 480, height: 800 },
    { dir: 'drawable-port-xhdpi', width: 720, height: 1280 },
    { dir: 'drawable-port-xxhdpi', width: 960, height: 1600 },
    { dir: 'drawable-port-xxxhdpi', width: 1280, height: 1920 },
    { dir: 'drawable-land-mdpi', width: 480, height: 320 },
    { dir: 'drawable-land-hdpi', width: 800, height: 480 },
    { dir: 'drawable-land-xhdpi', width: 1280, height: 720 },
    { dir: 'drawable-land-xxhdpi', width: 1600, height: 960 },
    { dir: 'drawable-land-xxxhdpi', width: 1920, height: 1280 },
  ];

  for (const s of splashDrawables) {
    const sDir = path.join(resDir, s.dir);
    if (!fs.existsSync(sDir)) fs.mkdirSync(sDir, { recursive: true });

    await sharp(splashBuf)
      .resize(s.width, s.height, { fit: 'cover' })
      .png()
      .toFile(path.join(sDir, 'splash.png'));

    console.log(`Generated splash for ${s.dir} (${s.width}x${s.height})`);
  }

  console.log('All Android icons and splash screens successfully generated!');
}

generate().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
