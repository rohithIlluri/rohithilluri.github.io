#!/usr/bin/env node
/**
 * download-assets.mjs - Downloads free 3D assets for the messenger clone
 *
 * Free asset sources (CC0/MIT licensed):
 * - Kenney.nl (CC0)
 * - Kay Kit (CC0)
 * - Quaternius (CC0)
 * - pmndrs market (various licenses)
 *
 * Run with: node scripts/download-assets.mjs
 */

import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

// Asset directories
const DIRS = {
  models: join(ROOT_DIR, 'public/assets/models'),
  textures: join(ROOT_DIR, 'public/assets/textures'),
  audio: join(ROOT_DIR, 'public/assets/audio'),
};

// Free assets to download
// Using publicly available CC0/free models
const ASSETS = [
  // Character models from Quaternius (CC0)
  {
    name: 'character.glb',
    url: 'https://raw.githubusercontent.com/quaternius/cc0_assets/main/Characters/Male/Male.glb',
    dir: 'models',
    fallbackUrl: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',
  },

  // Tree model (simple cone tree works)
  {
    name: 'tree.glb',
    url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb',
    dir: 'models',
    note: 'Placeholder - replace with proper tree model',
  },

  // Test audio (from freesound alternatives)
  {
    name: 'ambient.ogg',
    url: 'https://freesound.org/data/previews/531/531947_7037-lq.mp3',
    dir: 'audio',
    note: 'Background ambient sound',
  },
];

// Kenney.nl asset packs (need manual download - providing instructions)
const KENNEY_PACKS = [
  {
    name: 'City Kit (Roads)',
    url: 'https://kenney.nl/assets/city-kit-roads',
    description: 'Roads, buildings, vehicles for city scenes',
  },
  {
    name: 'City Kit (Suburban)',
    url: 'https://kenney.nl/assets/city-kit-suburban',
    description: 'Houses, trees, fences for suburban areas',
  },
  {
    name: 'Nature Kit',
    url: 'https://kenney.nl/assets/nature-kit',
    description: 'Trees, rocks, plants for natural environments',
  },
  {
    name: 'Animated Characters',
    url: 'https://quaternius.com/packs/ultimateanimatedcharacter.html',
    description: 'Free animated character pack with walk/run/idle animations',
  },
];

/**
 * Download a file from URL
 */
async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`  Redirecting to: ${redirectUrl}`);
        downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(destPath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });

      fileStream.on('error', (err) => {
        reject(err);
      });
    });

    request.on('error', (err) => {
      reject(err);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Ensure directories exist
 */
function ensureDirectories() {
  Object.values(DIRS).forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  });
}

/**
 * Download all assets
 */
async function downloadAssets() {
  console.log('\n🎨 Messenger Clone Asset Downloader\n');
  console.log('=' .repeat(50));

  ensureDirectories();

  console.log('\n📦 Downloading assets...\n');

  for (const asset of ASSETS) {
    const destPath = join(DIRS[asset.dir], asset.name);

    if (existsSync(destPath)) {
      console.log(`✓ ${asset.name} (already exists)`);
      continue;
    }

    console.log(`⬇ Downloading ${asset.name}...`);

    try {
      await downloadFile(asset.url, destPath);
      console.log(`  ✓ Downloaded to ${asset.dir}/${asset.name}`);
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);

      // Try fallback URL if available
      if (asset.fallbackUrl) {
        console.log(`  Trying fallback URL...`);
        try {
          await downloadFile(asset.fallbackUrl, destPath);
          console.log(`  ✓ Downloaded from fallback`);
        } catch (fallbackError) {
          console.log(`  ✗ Fallback also failed: ${fallbackError.message}`);
        }
      }
    }

    if (asset.note) {
      console.log(`  ℹ Note: ${asset.note}`);
    }
  }

  console.log('\n' + '=' .repeat(50));
  console.log('\n📋 MANUAL DOWNLOAD REQUIRED:\n');
  console.log('The following asset packs need manual download (they are FREE):\n');

  KENNEY_PACKS.forEach((pack, index) => {
    console.log(`${index + 1}. ${pack.name}`);
    console.log(`   URL: ${pack.url}`);
    console.log(`   Description: ${pack.description}`);
    console.log('');
  });

  console.log('Instructions:');
  console.log('1. Visit each URL above');
  console.log('2. Download the asset pack (usually a .zip file)');
  console.log('3. Extract GLB/GLTF files to: public/assets/models/');
  console.log('4. Rename files to match expected names (see README)');
  console.log('\n' + '=' .repeat(50));

  console.log('\n✅ Asset download script complete!\n');
}

// Run
downloadAssets().catch(console.error);
