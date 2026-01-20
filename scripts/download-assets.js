#!/usr/bin/env node
/**
 * Asset Download Script
 * Downloads free 3D models and textures from various sources
 *
 * Usage: node scripts/download-assets.js
 *
 * Sources:
 * - Kenney.nl: CC0 low-poly assets
 * - Poly.pizza: Free 3D models
 * - Mixamo: Character animations (requires account)
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Asset directories
const MODELS_DIR = path.join(rootDir, 'assets', 'models');
const TEXTURES_DIR = path.join(rootDir, 'assets', 'textures');
const AUDIO_DIR = path.join(rootDir, 'assets', 'audio');

// Kenney.nl asset packs (CC0)
const KENNEY_PACKS = {
  cityKit: {
    name: 'City Kit (Roads)',
    url: 'https://kenney.nl/media/pages/assets/city-kit-roads/5e5f5f0c06-1709725991/kenney_city-kit-roads.zip',
    description: 'Low-poly city roads and buildings'
  },
  cityKitSuburban: {
    name: 'City Kit (Suburban)',
    url: 'https://kenney.nl/media/pages/assets/city-kit-suburban/9dd0e8e8c1-1709725991/kenney_city-kit-suburban.zip',
    description: 'Suburban buildings and props'
  },
  minigolf: {
    name: 'Minigolf Kit',
    url: 'https://kenney.nl/media/pages/assets/minigolf-kit/0ea2b6ec51-1709725991/kenney_minigolf-kit.zip',
    description: 'Can be used for stylized props'
  }
};

// Free model URLs (Poly.pizza, Sketchfab CC0, etc.)
const FREE_MODELS = {
  // Note: These are example URLs - actual downloads require manual verification
  // or using the respective site's API
  character: {
    description: 'Basic character model (from Mixamo)',
    note: 'Download manually from mixamo.com with walk/run/idle animations'
  },
  streetLight: {
    description: 'Street lamp post',
    note: 'Available from Kenney City Kit'
  },
  fireHydrant: {
    description: 'Fire hydrant',
    note: 'Available from Kenney City Kit or Poly.pizza'
  }
};

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

/**
 * Download a file from URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading: ${url}`);

    const file = fs.createWriteStream(destPath);

    https.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${destPath}`);
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {}); // Delete partial file
      reject(err);
    });
  });
}

/**
 * Print asset requirements
 */
function printAssetRequirements() {
  console.log('\n========================================');
  console.log('NYC Street Portfolio - Asset Requirements');
  console.log('========================================\n');

  console.log('BUILDINGS (Low-poly, stylized):');
  console.log('  - Brownstone (3-4 story, brick texture)');
  console.log('  - Corner Deli/Shop (1-2 story, awning)');
  console.log('  - Office Tower (10+ story, glass/concrete)');
  console.log('  - Coffee Shop (1 story, warm colors)');
  console.log('  - Subway Entrance (steps going down)');
  console.log('\n');

  console.log('STREET PROPS:');
  console.log('  - Street lights (NYC style)');
  console.log('  - Traffic lights');
  console.log('  - Fire hydrants');
  console.log('  - Mailboxes');
  console.log('  - Benches');
  console.log('  - Trash cans');
  console.log('  - Trees (deciduous)');
  console.log('  - Newspaper stands');
  console.log('\n');

  console.log('CHARACTER (from Mixamo):');
  console.log('  - Basic humanoid character');
  console.log('  - Walk animation');
  console.log('  - Run animation');
  console.log('  - Idle animation');
  console.log('\n');

  console.log('RECOMMENDED SOURCES:');
  console.log('  1. Kenney.nl - https://kenney.nl/assets');
  console.log('     - City Kit (Roads)');
  console.log('     - City Kit (Suburban)');
  console.log('     - City Kit (Commercial)');
  console.log('\n');
  console.log('  2. Poly.pizza - https://poly.pizza');
  console.log('     - Search for "low poly building", "street prop"');
  console.log('\n');
  console.log('  3. Mixamo - https://www.mixamo.com');
  console.log('     - Free character + animations (requires Adobe account)');
  console.log('\n');
  console.log('  4. Sketchfab - https://sketchfab.com');
  console.log('     - Filter by CC0 license');
  console.log('\n');
}

/**
 * Create placeholder files
 */
function createPlaceholders() {
  ensureDir(MODELS_DIR);
  ensureDir(TEXTURES_DIR);
  ensureDir(AUDIO_DIR);

  // Create README files explaining where to get assets
  const modelsReadme = `# 3D Models Directory

Place your GLB/GLTF models here.

## Recommended Sources

1. **Kenney.nl** (CC0 License)
   - City Kit: https://kenney.nl/assets/city-kit-roads
   - Download and extract GLB files here

2. **Poly.pizza** (Free)
   - https://poly.pizza
   - Search for low-poly buildings and props

3. **Mixamo** (Free with Adobe account)
   - https://mixamo.com
   - Download character with FBX format, then convert to GLB

## Expected Files

- character.glb (player avatar)
- brownstone.glb
- tower.glb
- deli.glb
- coffee-shop.glb
- street-light.glb
- fire-hydrant.glb
- bench.glb
- trash-can.glb
- tree.glb
`;

  const texturesReadme = `# Textures Directory

Place your textures here.

## Formats
- Prefer WebP or KTX2 for production
- PNG/JPG for development

## Recommended Textures
- brick.png (brownstone buildings)
- concrete.png (sidewalks, modern buildings)
- asphalt.png (street surface)
- window-glow.png (night windows)
`;

  const audioReadme = `# Audio Directory

Place your audio files here.

## Formats
- Prefer OGG for best browser support
- MP3 as fallback

## Expected Files
- ambient-city.ogg (background ambience)
- footstep-concrete.ogg
- footstep-asphalt.ogg
- door-open.ogg
- music-background.ogg
`;

  fs.writeFileSync(path.join(MODELS_DIR, 'README.md'), modelsReadme);
  fs.writeFileSync(path.join(TEXTURES_DIR, 'README.md'), texturesReadme);
  fs.writeFileSync(path.join(AUDIO_DIR, 'README.md'), audioReadme);

  console.log('Created placeholder README files in asset directories');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node scripts/download-assets.js [options]');
    console.log('\nOptions:');
    console.log('  --requirements  Print asset requirements');
    console.log('  --setup         Create directory structure and READMEs');
    console.log('  --help          Show this help message');
    return;
  }

  if (args.includes('--requirements')) {
    printAssetRequirements();
    return;
  }

  if (args.includes('--setup')) {
    createPlaceholders();
    return;
  }

  // Default: print requirements and setup
  printAssetRequirements();
  createPlaceholders();
}

main().catch(console.error);
