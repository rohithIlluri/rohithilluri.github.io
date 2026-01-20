# COMPRESSION QUALITY DETAILS PLAN
## Messenger-Style Game Asset Optimization Pipeline

**Reference:** https://messenger.abeto.co/
**Parent Document:** messenger-game-complete-plan.md

---

# TABLE OF CONTENTS

1. [Asset Budget Overview](#1-asset-budget-overview)
2. [Texture Compression (KTX2/Basis Universal)](#2-texture-compression-ktx2basis-universal)
3. [Mesh Compression (Draco)](#3-mesh-compression-draco)
4. [Audio Compression](#4-audio-compression)
5. [GLTF Optimization Pipeline](#5-gltf-optimization-pipeline)
6. [Quality Presets](#6-quality-presets)
7. [Validation & Testing](#7-validation--testing)
8. [Automation Scripts](#8-automation-scripts)

---

# 1. ASSET BUDGET OVERVIEW

## Total Budget Allocation

| Category | Initial Load | Lazy Load | Total Budget |
|----------|--------------|-----------|--------------|
| **3D Models (meshes)** | 1.5 MB | 4 MB | 5.5 MB |
| **Textures** | 2.5 MB | 5 MB | 7.5 MB |
| **Audio** | 0.5 MB | 2.5 MB | 3 MB |
| **Code/WASM** | 1.5 MB | - | 1.5 MB |
| **Total** | **6 MB** | **11.5 MB** | **17.5 MB** |

## Per-Asset Limits

| Asset Type | Max Uncompressed | Target Compressed | Compression Ratio |
|------------|------------------|-------------------|-------------------|
| Main world model | 15 MB | 1.2 MB | ~12:1 |
| Character model | 2 MB | 150 KB | ~13:1 |
| NPC model | 1 MB | 80 KB | ~12:1 |
| Environment prop | 500 KB | 40 KB | ~12:1 |
| Texture (2048x2048) | 16 MB | 400 KB | ~40:1 |
| Texture (1024x1024) | 4 MB | 150 KB | ~26:1 |
| Texture (512x512) | 1 MB | 50 KB | ~20:1 |

---

# 2. TEXTURE COMPRESSION (KTX2/BASIS UNIVERSAL)

## Why KTX2?

- **GPU-compressed format** - Decompresses on GPU, not CPU
- **Universal support** - Transcodes to BCn (Desktop), ETC/ASTC (Mobile)
- **~75% smaller** than PNG/JPG
- **Instant GPU upload** - No decode step needed

## Quality Settings Matrix

### For Diffuse/Albedo Textures

| Quality Level | `--quality` | UASTC Mode | File Size (1024px) | Visual Quality |
|---------------|-------------|------------|-------------------|----------------|
| Ultra | 255 | UASTC | 350 KB | Lossless-like |
| High | 192 | UASTC | 280 KB | Excellent |
| **Medium (Recommended)** | **128** | **ETC1S** | **150 KB** | **Good** |
| Low | 64 | ETC1S | 80 KB | Acceptable |
| Mobile | 32 | ETC1S | 50 KB | Noticeable artifacts |

### For Normal Maps

| Quality Level | Settings | File Size (1024px) | Notes |
|---------------|----------|-------------------|-------|
| **High (Recommended)** | `--uastc --uastc_level 2` | 300 KB | Required for accurate lighting |
| Medium | `--uastc --uastc_level 1` | 220 KB | Slight banding |
| Low | ETC1S (NOT recommended) | 120 KB | Visible artifacts |

### For Roughness/Metallic/AO

| Quality Level | Settings | File Size (1024px) | Notes |
|---------------|----------|-------------------|-------|
| High | `--quality 192` | 180 KB | - |
| **Medium (Recommended)** | **`--quality 128`** | **100 KB** | **Channel pack R/M/AO** |
| Low | `--quality 64` | 60 KB | Acceptable for stylized |

## Compression Commands

### Using gltf-transform (Recommended)

```bash
# High quality (for hero assets)
gltf-transform ktx2 input.glb output.glb \
  --encoder basisu \
  --uastc \
  --uastc-level 2 \
  --uastc-zstd 18

# Medium quality (for most assets)
gltf-transform ktx2 input.glb output.glb \
  --encoder basisu \
  --quality 128 \
  --power-of-two

# Low quality (for distant/small objects)
gltf-transform ktx2 input.glb output.glb \
  --encoder basisu \
  --quality 64 \
  --resize 512x512
```

### Using toktx (Direct KTX2 encoding)

```bash
# UASTC (high quality, larger)
toktx --t2 --encode uastc --uastc_quality 2 \
  --zcmp 18 output.ktx2 input.png

# ETC1S (medium quality, smaller)
toktx --t2 --encode etc1s --clevel 4 --qlevel 128 \
  output.ktx2 input.png

# With mipmaps
toktx --t2 --genmipmap --encode etc1s --qlevel 128 \
  output.ktx2 input.png
```

## Texture Resolution Guidelines

| Object Type | Max Resolution | Recommended | Notes |
|-------------|----------------|-------------|-------|
| Player character | 2048x2048 | 1024x1024 | Closest to camera |
| NPCs | 1024x1024 | 512x512 | Medium distance |
| Buildings | 1024x1024 | 512x512 | Large UV space |
| Props (large) | 512x512 | 256x256 | Shared atlases |
| Props (small) | 256x256 | 128x128 | Use color tinting |
| Skybox/Environment | 2048x2048 | 1024x1024 | HDR if needed |
| Ground/Terrain | 1024x1024 | 512x512 | Tiled |

---

# 3. MESH COMPRESSION (DRACO)

## How Draco Works

- **Quantization** - Reduces precision of vertex positions
- **Prediction** - Encodes differences from predicted values
- **Entropy coding** - Further compresses the result

## Quantization Bits Explained

| Attribute | Bits | Precision | Use Case |
|-----------|------|-----------|----------|
| Position (14 bits) | 14 | ~0.006% of bbox | Large environments |
| **Position (12 bits)** | **12** | **~0.024%** | **Recommended default** |
| Position (10 bits) | 10 | ~0.1% | Small props, mobile |
| Normal (10 bits) | 10 | ~0.1% | Smooth shading |
| **Normal (8 bits)** | **8** | **~0.4%** | **Toon/flat shading** |
| UV (12 bits) | 12 | ~0.024% | Detailed textures |
| **UV (10 bits)** | **10** | **~0.1%** | **Recommended** |

## Quality Presets

### Ultra Quality (Hero Assets)

```bash
gltf-transform draco input.glb output.glb \
  --method edgebreaker \
  --quantize-position 14 \
  --quantize-normal 10 \
  --quantize-texcoord 12 \
  --compression-level 7
```

- **File size:** ~20% of original
- **Use for:** Player character, main buildings

### High Quality (Standard Assets)

```bash
gltf-transform draco input.glb output.glb \
  --method edgebreaker \
  --quantize-position 12 \
  --quantize-normal 10 \
  --quantize-texcoord 10 \
  --compression-level 7
```

- **File size:** ~15% of original
- **Use for:** NPCs, medium props

### Medium Quality (Environment)

```bash
gltf-transform draco input.glb output.glb \
  --method edgebreaker \
  --quantize-position 11 \
  --quantize-normal 8 \
  --quantize-texcoord 10 \
  --compression-level 7
```

- **File size:** ~12% of original
- **Use for:** Trees, rocks, distant objects

### Low Quality (Instanced/Distant)

```bash
gltf-transform draco input.glb output.glb \
  --method edgebreaker \
  --quantize-position 10 \
  --quantize-normal 8 \
  --quantize-texcoord 8 \
  --compression-level 7
```

- **File size:** ~10% of original
- **Use for:** Grass, particles, LOD levels

## Compression Level Impact

| Level | Encode Speed | Decode Speed | File Size |
|-------|--------------|--------------|-----------|
| 1 | Fastest | Fastest | Largest |
| 4 | Fast | Fast | Medium |
| **7** | **Medium** | **Fast** | **Smallest** |
| 10 | Slowest | Medium | Smallest |

**Recommendation:** Use level 7 (best size/decode tradeoff)

---

# 4. AUDIO COMPRESSION

## Codec Comparison

| Codec | Quality | File Size | Browser Support | Use Case |
|-------|---------|-----------|-----------------|----------|
| WAV | Lossless | Huge | Universal | Source only |
| MP3 | Good | Medium | Universal | Fallback |
| **OGG Vorbis** | **Excellent** | **Small** | **Chrome/Firefox** | **Recommended** |
| AAC | Excellent | Small | Safari | iOS fallback |
| Opus | Best | Smallest | Modern only | Future-proof |

## Quality Settings (OGG Vorbis)

| Quality | Bitrate | File Size (1 min) | Use Case |
|---------|---------|-------------------|----------|
| q10 | ~500 kbps | 3.75 MB | Mastering only |
| q8 | ~256 kbps | 1.9 MB | High fidelity |
| **q6** | **~192 kbps** | **1.4 MB** | **Background music** |
| q4 | ~128 kbps | 960 KB | Ambient loops |
| **q2** | **~80 kbps** | **600 KB** | **SFX, voices** |
| q0 | ~64 kbps | 480 KB | Low priority SFX |

## FFmpeg Commands

### Background Music (Stereo)

```bash
# High quality music
ffmpeg -i music.wav -c:a libvorbis -q:a 6 -ac 2 music.ogg

# Lower quality for ambient loops
ffmpeg -i ambient.wav -c:a libvorbis -q:a 4 -ac 2 ambient.ogg
```

### Sound Effects (Mono)

```bash
# Standard SFX
ffmpeg -i effect.wav -c:a libvorbis -q:a 2 -ac 1 effect.ogg

# UI sounds (can be lower)
ffmpeg -i click.wav -c:a libvorbis -q:a 0 -ac 1 click.ogg
```

### Batch Conversion Script

```bash
#!/bin/bash
# convert-audio.sh

for file in *.wav; do
  # Detect if stereo or mono
  channels=$(ffprobe -v error -select_streams a:0 \
    -show_entries stream=channels -of csv=p=0 "$file")

  if [ "$channels" -eq 2 ]; then
    # Music (stereo, higher quality)
    ffmpeg -i "$file" -c:a libvorbis -q:a 6 -ac 2 "${file%.wav}.ogg"
  else
    # SFX (mono, lower quality)
    ffmpeg -i "$file" -c:a libvorbis -q:a 2 -ac 1 "${file%.wav}.ogg"
  fi
done
```

## Audio Budget Breakdown

| Category | Duration | Quality | Size Target |
|----------|----------|---------|-------------|
| Main BGM | 3-5 min | q6 stereo | 1.5-2 MB |
| Ambient loops | 30-60 sec | q4 stereo | 300-600 KB |
| Footsteps (set) | 10 variants | q2 mono | 100 KB total |
| UI sounds | 5-10 sounds | q0 mono | 50 KB total |
| Nature ambience | 1-2 min loop | q4 stereo | 400 KB |

---

# 5. GLTF OPTIMIZATION PIPELINE

## Complete Pipeline

```
                    [Source Assets]
                          │
                          ▼
    ┌─────────────────────────────────────────────┐
    │           STEP 1: BLENDER EXPORT            │
    │  - Apply transforms                          │
    │  - Remove unused materials                   │
    │  - Check UV overlaps                         │
    │  - Export as .glb (embedded textures)        │
    └─────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────┐
    │         STEP 2: MESH OPTIMIZATION           │
    │  gltf-transform dedup                        │
    │  gltf-transform prune                        │
    │  gltf-transform weld --tolerance 0.0001     │
    └─────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────┐
    │         STEP 3: DRACO COMPRESSION           │
    │  gltf-transform draco                        │
    │  --quantize-position 12                      │
    │  --quantize-normal 8                         │
    │  --compression-level 7                       │
    └─────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────┐
    │        STEP 4: TEXTURE COMPRESSION          │
    │  gltf-transform ktx2                         │
    │  --quality 128                               │
    │  --power-of-two                              │
    └─────────────────────────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────┐
    │         STEP 5: FINAL OPTIMIZATION          │
    │  gltf-transform optimize                     │
    │  (merges buffers, sorts extensions)          │
    └─────────────────────────────────────────────┘
                          │
                          ▼
                   [Optimized .glb]
```

## Combined Command

```bash
# Full optimization pipeline in one command
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress ktx2 \
  --texture-size 1024 \
  --simplify-ratio 0.75 \
  --simplify-error 0.001
```

## Additional Optimizations

### Mesh Simplification (LOD Generation)

```bash
# Generate LOD levels
gltf-transform simplify input.glb lod0.glb --ratio 1.0    # Full detail
gltf-transform simplify input.glb lod1.glb --ratio 0.5    # 50% triangles
gltf-transform simplify input.glb lod2.glb --ratio 0.25   # 25% triangles
gltf-transform simplify input.glb lod3.glb --ratio 0.1    # 10% triangles
```

### Remove Unused Data

```bash
# Remove animation bones not needed
gltf-transform prune input.glb output.glb

# Remove duplicate vertices
gltf-transform dedup input.glb output.glb

# Weld nearby vertices
gltf-transform weld input.glb output.glb --tolerance 0.0001
```

### Texture Resizing

```bash
# Resize all textures to max 1024
gltf-transform resize input.glb output.glb --max-texture-size 1024

# Resize specific texture types
gltf-transform resize input.glb output.glb \
  --max-texture-size 512 \
  --texture-slots "occlusionTexture,metallicRoughnessTexture"
```

---

# 6. QUALITY PRESETS

## Preset: HERO (Player Character, Main Buildings)

```bash
#!/bin/bash
# optimize-hero.sh

INPUT=$1
OUTPUT="${INPUT%.glb}-optimized.glb"

gltf-transform \
  weld $INPUT /tmp/welded.glb --tolerance 0.00001 && \
gltf-transform \
  draco /tmp/welded.glb /tmp/draco.glb \
    --method edgebreaker \
    --quantize-position 14 \
    --quantize-normal 10 \
    --quantize-texcoord 12 \
    --compression-level 7 && \
gltf-transform \
  ktx2 /tmp/draco.glb $OUTPUT \
    --encoder basisu \
    --uastc \
    --uastc-level 2 \
    --uastc-zstd 18

rm /tmp/welded.glb /tmp/draco.glb
echo "Optimized: $OUTPUT"
```

| Metric | Target |
|--------|--------|
| Texture quality | UASTC level 2 |
| Mesh quantization | 14-bit position |
| Expected compression | 10-15:1 |
| Max file size | 200 KB |

## Preset: STANDARD (NPCs, Medium Props)

```bash
#!/bin/bash
# optimize-standard.sh

INPUT=$1
OUTPUT="${INPUT%.glb}-optimized.glb"

gltf-transform optimize $INPUT $OUTPUT \
  --compress draco \
  --texture-compress ktx2 \
  --texture-size 1024 \
  --simplify-ratio 0.9 \
  --simplify-error 0.0001

echo "Optimized: $OUTPUT"
```

| Metric | Target |
|--------|--------|
| Texture quality | ETC1S quality 128 |
| Mesh quantization | 12-bit position |
| Expected compression | 12-18:1 |
| Max file size | 100 KB |

## Preset: ENVIRONMENT (Trees, Rocks, Terrain)

```bash
#!/bin/bash
# optimize-environment.sh

INPUT=$1
OUTPUT="${INPUT%.glb}-optimized.glb"

gltf-transform optimize $INPUT $OUTPUT \
  --compress draco \
  --texture-compress ktx2 \
  --texture-size 512 \
  --simplify-ratio 0.75 \
  --simplify-error 0.001

echo "Optimized: $OUTPUT"
```

| Metric | Target |
|--------|--------|
| Texture quality | ETC1S quality 96 |
| Mesh quantization | 11-bit position |
| Expected compression | 15-25:1 |
| Max file size | 50 KB |

## Preset: MOBILE (Aggressive Optimization)

```bash
#!/bin/bash
# optimize-mobile.sh

INPUT=$1
OUTPUT="${INPUT%.glb}-mobile.glb"

gltf-transform optimize $INPUT $OUTPUT \
  --compress draco \
  --texture-compress ktx2 \
  --texture-size 256 \
  --simplify-ratio 0.5 \
  --simplify-error 0.01

echo "Optimized: $OUTPUT"
```

| Metric | Target |
|--------|--------|
| Texture quality | ETC1S quality 64 |
| Mesh quantization | 10-bit position |
| Expected compression | 20-40:1 |
| Max file size | 30 KB |

---

# 7. VALIDATION & TESTING

## File Size Validation

```javascript
// validate-assets.js
const fs = require('fs');
const path = require('path');

const LIMITS = {
  'world.glb': 1.5 * 1024 * 1024,      // 1.5 MB
  'character.glb': 200 * 1024,          // 200 KB
  'npc-*.glb': 100 * 1024,              // 100 KB each
  'prop-*.glb': 50 * 1024,              // 50 KB each
  'music.ogg': 2 * 1024 * 1024,         // 2 MB
  'sfx-*.ogg': 100 * 1024,              // 100 KB each
};

function validateAssets(directory) {
  const files = fs.readdirSync(directory);
  const failures = [];

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    for (const [pattern, limit] of Object.entries(LIMITS)) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      if (regex.test(file) && stats.size > limit) {
        failures.push({
          file,
          size: stats.size,
          limit,
          over: ((stats.size / limit - 1) * 100).toFixed(1) + '%'
        });
      }
    }
  }

  return failures;
}

const failures = validateAssets('./assets');
if (failures.length > 0) {
  console.error('Asset size violations:');
  failures.forEach(f => {
    console.error(`  ${f.file}: ${(f.size/1024).toFixed(1)}KB > ${(f.limit/1024).toFixed(1)}KB (${f.over} over)`);
  });
  process.exit(1);
}
console.log('All assets within budget!');
```

## Visual Quality Testing

```javascript
// quality-comparison.html
// A/B comparison tool for compression quality

const comparisons = [
  { original: 'character.glb', compressed: 'character-optimized.glb' },
  { original: 'world.glb', compressed: 'world-optimized.glb' },
];

// Load both versions side-by-side
// Allow toggle between them
// Check for:
// - Vertex snapping/jitter
// - Texture banding
// - Normal map artifacts
// - Animation smoothness
```

## Performance Benchmarks

| Metric | Target | Tool |
|--------|--------|------|
| GLB parse time | < 100ms | Performance.now() |
| Texture decode | < 50ms per texture | GPU timing |
| First frame render | < 500ms | Lighthouse |
| Memory usage | < 150 MB | Chrome DevTools |
| Draw calls | < 50 | Stats.js |

## Cross-Platform Testing Matrix

| Device | Browser | Min FPS | Max Load Time |
|--------|---------|---------|---------------|
| Desktop (high) | Chrome | 60 | 3s |
| Desktop (mid) | Firefox | 60 | 4s |
| Laptop | Safari | 60 | 4s |
| iPhone 12+ | Safari | 60 | 5s |
| iPhone X | Safari | 30 | 8s |
| Android (high) | Chrome | 60 | 5s |
| Android (mid) | Chrome | 30 | 8s |

---

# 8. AUTOMATION SCRIPTS

## Complete Build Script

```bash
#!/bin/bash
# build-assets.sh

set -e

ASSETS_DIR="./assets-source"
OUTPUT_DIR="./public/assets"
PRESET=${1:-"standard"}  # hero, standard, environment, mobile

echo "Building assets with preset: $PRESET"

# Create output directory
mkdir -p $OUTPUT_DIR

# Process each GLB file
for file in $ASSETS_DIR/*.glb; do
  filename=$(basename "$file")
  echo "Processing: $filename"

  case $PRESET in
    hero)
      gltf-transform optimize "$file" "$OUTPUT_DIR/$filename" \
        --compress draco \
        --texture-compress ktx2 \
        --texture-size 2048
      ;;
    standard)
      gltf-transform optimize "$file" "$OUTPUT_DIR/$filename" \
        --compress draco \
        --texture-compress ktx2 \
        --texture-size 1024 \
        --simplify-ratio 0.9
      ;;
    environment)
      gltf-transform optimize "$file" "$OUTPUT_DIR/$filename" \
        --compress draco \
        --texture-compress ktx2 \
        --texture-size 512 \
        --simplify-ratio 0.75
      ;;
    mobile)
      gltf-transform optimize "$file" "$OUTPUT_DIR/$filename" \
        --compress draco \
        --texture-compress ktx2 \
        --texture-size 256 \
        --simplify-ratio 0.5
      ;;
  esac
done

# Process audio files
for file in $ASSETS_DIR/audio/*.wav; do
  filename=$(basename "${file%.wav}.ogg")
  echo "Converting audio: $filename"
  ffmpeg -y -i "$file" -c:a libvorbis -q:a 4 "$OUTPUT_DIR/audio/$filename"
done

# Generate manifest
echo "Generating asset manifest..."
node generate-manifest.js $OUTPUT_DIR

echo "Build complete!"
echo "Total size: $(du -sh $OUTPUT_DIR | cut -f1)"
```

## Asset Manifest Generator

```javascript
// generate-manifest.js
const fs = require('fs');
const path = require('path');

const outputDir = process.argv[2] || './public/assets';

function generateManifest(directory) {
  const manifest = {
    version: Date.now(),
    assets: [],
    totalSize: 0
  };

  function processDirectory(dir, prefix = '') {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        processDirectory(filePath, prefix + file + '/');
      } else {
        const asset = {
          path: prefix + file,
          size: stats.size,
          type: getAssetType(file),
          priority: getAssetPriority(file)
        };
        manifest.assets.push(asset);
        manifest.totalSize += stats.size;
      }
    }
  }

  processDirectory(directory);

  // Sort by priority (lower = load first)
  manifest.assets.sort((a, b) => a.priority - b.priority);

  return manifest;
}

function getAssetType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const types = {
    '.glb': 'model',
    '.gltf': 'model',
    '.ktx2': 'texture',
    '.ogg': 'audio',
    '.mp3': 'audio',
    '.json': 'data'
  };
  return types[ext] || 'other';
}

function getAssetPriority(filename) {
  // Lower number = higher priority
  if (filename.includes('world')) return 1;
  if (filename.includes('character')) return 2;
  if (filename.includes('npc')) return 3;
  if (filename.includes('music')) return 5;
  if (filename.includes('sfx')) return 10;
  return 5;
}

const manifest = generateManifest(outputDir);
fs.writeFileSync(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`Manifest generated: ${manifest.assets.length} assets`);
console.log(`Total size: ${(manifest.totalSize / 1024 / 1024).toFixed(2)} MB`);
```

## CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/build-assets.yml
name: Build Game Assets

on:
  push:
    paths:
      - 'assets-source/**'

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install gltf-transform
        run: npm install -g @gltf-transform/cli

      - name: Install FFmpeg
        run: sudo apt-get install -y ffmpeg

      - name: Build assets
        run: ./scripts/build-assets.sh standard

      - name: Validate sizes
        run: node scripts/validate-assets.js

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: optimized-assets
          path: public/assets/
```

---

# SUMMARY CHECKLIST

## Before Export (Blender)

- [ ] Apply all transforms (Ctrl+A)
- [ ] Remove unused materials
- [ ] Merge meshes where possible
- [ ] Check UV layouts (no overlaps for lightmaps)
- [ ] Set texture resolution appropriate to object size
- [ ] Name objects clearly (for debugging)

## Compression Settings Quick Reference

| Asset Type | Draco Position | Texture Format | Max Size |
|------------|---------------|----------------|----------|
| Player | 14-bit | UASTC L2 | 200 KB |
| NPC | 12-bit | ETC1S Q128 | 100 KB |
| Building | 12-bit | ETC1S Q128 | 150 KB |
| Tree/Rock | 11-bit | ETC1S Q96 | 50 KB |
| Grass/Decal | 10-bit | ETC1S Q64 | 20 KB |

## Quality Targets

- [ ] Initial load under 6 MB
- [ ] Total assets under 18 MB
- [ ] 60 FPS on mid-range devices
- [ ] No visible compression artifacts at normal camera distance
- [ ] Audio plays without stuttering
- [ ] Textures load without visible pop-in

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Parent:** messenger-game-complete-plan.md
