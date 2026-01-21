# Messenger.abeto.co UI Revamp Plan

## Executive Summary

This document provides a complete analysis of what changes are needed to achieve visual parity with [messenger.abeto.co](https://messenger.abeto.co/) - the anime-style tiny planet mail delivery game.

**Goal**: Recreate the exact same anime-style UI and tiny planet visual experience with your NYC Street portfolio theme.

---

## Current State Analysis

### What You Have (Working Well)

| Feature | Status | Quality |
|---------|--------|---------|
| Three.js setup | Complete | Good |
| Tiny Planet sphere | Complete | Good |
| Spherical movement | Complete | Good |
| Basic cel-shading | Complete | Needs Enhancement |
| Post-processing pipeline | Complete | Good foundation |
| Procedural character | Complete | Needs Replacement |
| Procedural props | Complete | Needs Replacement |
| Day/night cycle | Complete | Good |
| Particle system | Complete | Good |

### Key Gaps vs Messenger.abeto.co

| Gap | Current | Messenger | Priority |
|-----|---------|-----------|----------|
| 3D Models | Procedural boxes/spheres | Artist-modeled GLB assets | Critical |
| Character | Primitive shapes | Cute stylized character | Critical |
| Textures | Solid colors only | Painted/stylized textures | Critical |
| World Detail | ~50 simple props | 81k vertices world model | Critical |
| Loading/UI | Basic loading bar | Polished, animated UI | High |
| Camera | Standard follow cam | Tilt-shift DOF effect | High |
| Audio | None | Ambient music + SFX | Medium |
| Customization | None | Character customization | Medium |

---

## Technical Analysis: messenger.abeto.co

Based on network analysis and community discussion:

### Asset Pipeline
```
Format             | Purpose              | Size
-------------------|---------------------|--------
.glb + Draco       | 3D models           | 333KB world (81k verts)
.ktx2              | GPU textures        | Compressed to ~1/4 size
.mp3               | Music/SFX           | 2.3MB music loop
Total assets       | Everything          | ~4MB
```

### Visual Style Breakdown
- **Cel-shading**: Hard 3-4 band lighting
- **Outlines**: Thick (2-3px) dark outlines on everything
- **Colors**: Saturated, warm palette
- **Shadows**: Soft, purple-tinted (not black)
- **Camera**: Slight DOF for miniature effect
- **Post-processing**: Subtle bloom, color grading

---

## Implementation Plan

### Phase 1: Asset Pipeline (Foundation)
**Goal**: Set up proper asset loading with compression

#### 1.1 Add Asset Compression Support
```bash
npm install @gltf-transform/core @gltf-transform/extensions three/examples/jsm/loaders/KTX2Loader three/examples/jsm/loaders/DRACOLoader
```

**Files to modify**:
- `src/utils/loader.js` - Add DRACOLoader and KTX2Loader

```javascript
// loader.js additions
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

const ktx2Loader = new KTX2Loader();
ktx2Loader.setTranscoderPath('https://www.gstatic.com/basis-universal/versioned/2021-04-15-ba1c3e4/');

export function configureGLTFLoader(gltfLoader, renderer) {
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.setKTX2Loader(ktx2Loader.detectSupport(renderer));
}
```

#### 1.2 Asset Organization
```
assets/
├── models/
│   ├── world/
│   │   ├── planet.glb        # Base planet with biomes
│   │   ├── buildings.glb     # All buildings combined
│   │   └── props.glb         # Street props
│   ├── character/
│   │   ├── character.glb     # Stylized character
│   │   └── animations/       # Walk, run, idle
│   └── vehicles/
│       └── taxi.glb
├── textures/
│   ├── planet/
│   │   ├── grass.ktx2
│   │   ├── sand.ktx2
│   │   └── path.ktx2
│   └── buildings/
│       ├── brick.ktx2
│       └── window.ktx2
└── audio/
    ├── ambient.mp3
    ├── footsteps.mp3
    └── ui-click.mp3
```

---

### Phase 2: Character Overhaul (Critical)
**Goal**: Replace procedural character with stylized 3D model

#### 2.1 Character Requirements
The messenger character has these key traits:
- **Proportions**: Chibi-style (large head, small body)
- **Simplicity**: Low-poly with smooth shading
- **Charm**: Big eyes, simple face
- **Animation**: Walk, run, idle with squash/stretch

#### 2.2 Character Model Specification
```
Target Specs:
- Polycount: 1,500-2,500 triangles
- Rig: Simple 20-bone skeleton
- Animations:
  - idle.glb (breathing, subtle sway)
  - walk.glb (bouncy walk cycle)
  - run.glb (energetic run)
- Style: Painted vertex colors or simple textures
```

#### 2.3 Player.js Modifications
```javascript
// Key changes needed in Player.js:

// 1. Add animation system
import { AnimationMixer, LoopRepeat } from 'three';

// 2. Load actual character model
async loadCharacterModel() {
  const loader = new GLTFLoader();
  configureGLTFLoader(loader, this.renderer);

  const gltf = await loader.loadAsync('/assets/models/character/character.glb');
  this.characterModel = gltf.scene;

  // Apply toon materials
  this.characterModel.traverse((child) => {
    if (child.isMesh) {
      const originalColor = child.material.color?.getHex() || 0xFFFFFF;
      child.material = createEnhancedToonMaterial({
        color: originalColor,
        isCharacter: true,
      });

      // Add outline
      const outline = createOutlineMesh(child, 0.02);
      child.add(outline);
    }
  });

  // Setup animation mixer
  this.mixer = new AnimationMixer(this.characterModel);

  // Load and assign animations
  this.animations = {
    idle: this.mixer.clipAction(gltf.animations.find(a => a.name.includes('idle'))),
    walk: this.mixer.clipAction(gltf.animations.find(a => a.name.includes('walk'))),
    run: this.mixer.clipAction(gltf.animations.find(a => a.name.includes('run'))),
  };

  // Hide procedural character
  this.characterGroup.visible = false;
  this.container.add(this.characterModel);
}

// 3. Add animation blending
transitionToAnimation(newAnim, duration = 0.2) {
  if (this.currentAnim === newAnim) return;

  const current = this.animations[this.currentAnim];
  const next = this.animations[newAnim];

  current?.fadeOut(duration);
  next?.reset().fadeIn(duration).play();

  this.currentAnim = newAnim;
}
```

---

### Phase 3: World Model Overhaul (Critical)
**Goal**: Replace procedural geometry with artist-made world model

#### 3.1 World Model Strategy

**Option A: Single Merged World (Messenger Approach)**
- One large GLB with everything baked together
- Most efficient for rendering
- Harder to modify individual parts

**Option B: Modular World (Recommended)**
- Separate GLB for each building type
- Props as instanced meshes
- More flexible for your portfolio

#### 3.2 World Structure
```javascript
// Recommended structure for Planet.js

class Planet {
  async init() {
    // Load base planet with painted terrain
    this.planetMesh = await this.loadModel('/assets/models/world/planet.glb');

    // Load and place buildings
    await this.loadBuildings();

    // Load and instance props
    await this.loadProps();

    // Create ground scatter (instanced grass, flowers, rocks)
    this.createGroundScatter();
  }

  async loadBuildings() {
    const buildingConfigs = [
      { model: 'brownstone.glb', lat: 0, lon: 90, name: 'Skills' },
      { model: 'tower.glb', lat: 45, lon: 0, name: 'Projects' },
      { model: 'shop.glb', lat: 0, lon: -90, name: 'Music' },
      { model: 'cafe.glb', lat: -45, lon: 0, name: 'Contact' },
    ];

    for (const config of buildingConfigs) {
      const gltf = await this.loader.loadAsync(`/assets/models/buildings/${config.model}`);
      const building = gltf.scene;

      // Apply toon materials and outlines
      this.applyToonStyle(building);

      // Place on planet surface
      this.placeOnSurface(building, config.lat, config.lon);
    }
  }
}
```

#### 3.3 Building Model Specifications
```
Skills Library (Brownstone):
- Style: NYC brownstone with ornate details
- Features: Steps, railings, window sills
- Neon sign: "SKILLS" in blue
- Polycount: ~2,000 triangles

Projects Tower (Modern):
- Style: Modern glass/steel tower
- Features: Rooftop antenna, balconies
- Neon sign: "PROJECTS" in pink
- Polycount: ~3,000 triangles

Vinyl Records (Shop):
- Style: Retro record store
- Features: Awning, window display
- Neon sign: Vinyl record shape in green
- Polycount: ~1,500 triangles

Contact Cafe (Coffee Shop):
- Style: Cozy cafe with outdoor seating
- Features: Umbrella, chairs, chalkboard
- Neon sign: Coffee cup in orange
- Polycount: ~2,000 triangles
```

---

### Phase 4: Camera & DOF Enhancement (High Priority)
**Goal**: Add tilt-shift depth of field for miniature/toy world effect

#### 4.1 Add DOF to Post-Processing
```javascript
// Add to PostProcessing.js

import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

// In init():
this.dofPass = new BokehPass(this.scene, this.camera, {
  focus: 50,      // Distance to focus point (planet center)
  aperture: 0.003, // Very subtle for tilt-shift
  maxblur: 0.01,
});
this.composer.addPass(this.dofPass);

// Method to focus on player distance
setDOFFocus(distance) {
  this.dofPass.uniforms['focus'].value = distance;
}
```

#### 4.2 Tilt-Shift Style DOF Shader (Alternative)
```glsl
// Custom tilt-shift shader for horizontal blur band

uniform sampler2D tDiffuse;
uniform sampler2D tDepth;
uniform float focusY;        // Y position of focus band (0-1)
uniform float bandWidth;     // Width of sharp band
uniform float blurAmount;

varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  // Distance from focus band
  float dist = abs(vUv.y - focusY);

  // Blur increases outside the band
  float blur = smoothstep(bandWidth, bandWidth * 2.0, dist) * blurAmount;

  // Simple box blur for DOF effect
  vec4 blurred = vec4(0.0);
  float samples = 0.0;

  for (float x = -4.0; x <= 4.0; x++) {
    for (float y = -4.0; y <= 4.0; y++) {
      vec2 offset = vec2(x, y) * blur * 0.002;
      blurred += texture2D(tDiffuse, vUv + offset);
      samples++;
    }
  }
  blurred /= samples;

  gl_FragColor = mix(color, blurred, blur * 10.0);
}
```

---

### Phase 5: UI/UX Polish (High Priority)
**Goal**: Match messenger's polished, animated UI

#### 5.1 Loading Screen Overhaul
```html
<!-- New loading screen structure -->
<div id="loading-screen" class="loading-screen">
  <div class="loading-content">
    <!-- Animated logo/title -->
    <div class="loading-logo">
      <span class="logo-char" style="--delay: 0">N</span>
      <span class="logo-char" style="--delay: 1">Y</span>
      <span class="logo-char" style="--delay: 2">C</span>
      <span class="logo-char" style="--delay: 3"> </span>
      <span class="logo-char" style="--delay: 4">S</span>
      <span class="logo-char" style="--delay: 5">T</span>
      <span class="logo-char" style="--delay: 6">R</span>
      <span class="logo-char" style="--delay: 7">E</span>
      <span class="logo-char" style="--delay: 8">E</span>
      <span class="logo-char" style="--delay: 9">T</span>
    </div>

    <!-- Animated character silhouette -->
    <div class="loading-character">
      <!-- SVG walking character animation -->
    </div>

    <!-- Progress -->
    <div class="loading-progress">
      <div class="progress-track">
        <div class="progress-fill" id="progress-fill"></div>
      </div>
      <span class="progress-text" id="progress-text">0%</span>
    </div>

    <!-- Loading tip -->
    <p class="loading-tip" id="loading-tip">Use WASD to explore...</p>
  </div>
</div>
```

```css
/* Loading screen animations */
.loading-logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  letter-spacing: 0.2em;
}

.logo-char {
  display: inline-block;
  animation: letterBounce 0.8s ease-out infinite;
  animation-delay: calc(var(--delay) * 0.1s);
}

@keyframes letterBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.loading-character {
  width: 100px;
  height: 100px;
  margin: 2rem auto;
  animation: walkCycle 0.6s steps(4) infinite;
}

.progress-track {
  width: 200px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD54F, #FF6B35);
  border-radius: 4px;
  transition: width 0.3s ease;
}
```

#### 5.2 HUD Improvements
```css
/* Messenger-style minimal HUD */
.hud {
  pointer-events: none;
}

.hud-top {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
}

.location-name {
  font-size: 1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(26, 26, 46, 0.6);
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.controls-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  background: rgba(26, 26, 46, 0.6);
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  font-size: 0.85rem;
}

.controls-hint span {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  margin-right: 0.25rem;
}
```

#### 5.3 Building Modal Improvements
```css
/* Messenger-style modal */
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.modal:not(.hidden) {
  opacity: 1;
  pointer-events: all;
}

.modal-content {
  background: #1A1A2E;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  transform: scale(0.9) translateY(20px);
  transition: transform 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modal:not(.hidden) .modal-content {
  transform: scale(1) translateY(0);
}

.modal-header {
  background: linear-gradient(135deg, #4A4063 0%, #1A1A2E 100%);
  padding: 1.5rem;
  position: relative;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  max-height: 60vh;
}
```

---

### Phase 6: Enhanced Shaders (Medium Priority)
**Goal**: Improve visual fidelity of cel-shading

#### 6.1 Improved Cel-Shading with Texture Support
```javascript
// Enhanced toon material with texture support
export function createEnhancedToonMaterialTextured(options = {}) {
  const {
    color = 0xffffff,
    map = null,           // Color/albedo texture
    normalMap = null,     // Normal map for detail
    isCharacter = false,
  } = options;

  const rimIntensity = isCharacter ? 0.4 : 0.25;

  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(color) },
      colorMap: { value: map },
      normalMap: { value: normalMap },
      useColorMap: { value: map !== null },
      useNormalMap: { value: normalMap !== null },
      shadowColor: { value: new THREE.Color(0x4A4063) },
      rimColor: { value: new THREE.Color(0xFFFFFF) },
      rimIntensity: { value: rimIntensity },
      lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform sampler2D colorMap;
      uniform sampler2D normalMap;
      uniform bool useColorMap;
      uniform bool useNormalMap;
      uniform vec3 shadowColor;
      uniform vec3 rimColor;
      uniform float rimIntensity;
      uniform vec3 lightDirection;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        // Get base color from texture or uniform
        vec3 albedo = useColorMap ? texture2D(colorMap, vUv).rgb : baseColor;

        // Get normal from map or vertex
        vec3 normal = normalize(vNormal);
        if (useNormalMap) {
          vec3 mapN = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
          // Simple tangent space to world space
          normal = normalize(normal + mapN * 0.5);
        }

        vec3 viewDir = normalize(vViewPosition);
        float NdotL = dot(normal, normalize(lightDirection));

        // 4-band discrete cel-shading
        float intensity;
        if (NdotL > 0.6) intensity = 1.0;
        else if (NdotL > 0.3) intensity = 0.7;
        else if (NdotL > 0.0) intensity = 0.4;
        else intensity = 0.15;

        intensity = max(intensity, 0.08);
        vec3 shadedColor = mix(shadowColor, albedo, intensity);

        // Rim lighting
        float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
        float rimAmount = smoothstep(0.5, 0.7, fresnel) * step(0.0, NdotL);
        vec3 rim = rimColor * rimAmount * rimIntensity;

        gl_FragColor = vec4(shadedColor + rim, 1.0);
      }
    `,
  });
}
```

#### 6.2 Improved Outline Shader
```javascript
// Better outline that respects distance
export const ImprovedOutlineShader = {
  uniforms: {
    outlineWidth: { value: 0.03 },
    outlineColor: { value: new THREE.Color(0x1A1A2E) },
    cameraDistance: { value: 10 }, // For distance-based scaling
  },
  vertexShader: `
    uniform float outlineWidth;
    uniform float cameraDistance;

    void main() {
      // Scale outline based on camera distance for consistent apparent width
      float scale = outlineWidth * (cameraDistance / 10.0);
      scale = clamp(scale, outlineWidth * 0.5, outlineWidth * 2.0);

      vec3 newPosition = position + normal * scale;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 outlineColor;

    void main() {
      gl_FragColor = vec4(outlineColor, 1.0);
    }
  `,
};
```

---

### Phase 7: Audio System (Medium Priority)
**Goal**: Add ambient sound and effects like messenger

#### 7.1 Audio Manager
```javascript
// src/audio/AudioManager.js
import { Howl, Howler } from 'howler';

export class AudioManager {
  constructor() {
    this.sounds = {};
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    this.enabled = true;
  }

  async init() {
    // Load sounds
    this.sounds = {
      music: new Howl({
        src: ['/assets/audio/ambient.mp3'],
        loop: true,
        volume: this.musicVolume,
      }),
      footsteps: new Howl({
        src: ['/assets/audio/footsteps.mp3'],
        loop: true,
        volume: 0,
        rate: 1.0,
      }),
      interact: new Howl({
        src: ['/assets/audio/interact.mp3'],
        volume: this.sfxVolume,
      }),
    };
  }

  startMusic() {
    if (this.enabled && this.sounds.music) {
      this.sounds.music.play();
    }
  }

  setFootsteps(isMoving, isRunning) {
    if (!this.sounds.footsteps) return;

    const targetVolume = isMoving ? this.sfxVolume : 0;
    const rate = isRunning ? 1.4 : 1.0;

    this.sounds.footsteps.volume(targetVolume);
    this.sounds.footsteps.rate(rate);

    if (isMoving && !this.sounds.footsteps.playing()) {
      this.sounds.footsteps.play();
    }
  }

  playInteract() {
    if (this.enabled && this.sounds.interact) {
      this.sounds.interact.play();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    Howler.mute(!this.enabled);
  }
}
```

---

### Phase 8: Performance Optimizations

#### 8.1 Asset Optimization Checklist
```
Before deployment:
[ ] Compress all GLB files with Draco (gltf-transform)
[ ] Convert textures to KTX2 format (toktx)
[ ] Combine small models into single GLB
[ ] Use texture atlases where possible
[ ] Implement LOD for distant objects
[ ] Remove unused vertices/faces
```

#### 8.2 Rendering Optimizations
```javascript
// World.js optimizations

// 1. Frustum culling (automatic in Three.js)
mesh.frustumCulled = true;

// 2. Instance meshes for repeated objects
const treesInstanced = new THREE.InstancedMesh(treeGeometry, treeMaterial, 50);

// 3. Merge static geometry
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const mergedGeo = mergeBufferGeometries([geo1, geo2, geo3]);
const mergedMesh = new THREE.Mesh(mergedGeo, sharedMaterial);

// 4. Object pooling for particles
// Already implemented in ParticleManager.js

// 5. Lazy loading for distant content
class LazyLoader {
  constructor(camera, threshold = 100) {
    this.camera = camera;
    this.threshold = threshold;
    this.pending = [];
  }

  register(position, loadFn) {
    this.pending.push({ position, loadFn, loaded: false });
  }

  update() {
    this.pending.forEach(item => {
      if (!item.loaded) {
        const distance = this.camera.position.distanceTo(item.position);
        if (distance < this.threshold) {
          item.loadFn();
          item.loaded = true;
        }
      }
    });
  }
}
```

---

## Asset Creation Guidelines

### For 3D Modelers

#### Style Guide
- **Aesthetic**: Studio Ghibli meets Jet Set Radio
- **Topology**: Clean quads, no n-gons
- **Polycount**: Keep under 5k tris per building
- **UV Layout**: Maximize texture usage
- **Colors**: Saturated, warm tones
- **Details**: Suggest rather than model every detail

#### Export Settings
```
Format: GLB (binary glTF)
Draco compression: ON
Texture format: PNG (will convert to KTX2)
Embed textures: YES
Scale: 1 unit = 1 meter
Up axis: Y
Forward axis: -Z
```

### For Texture Artists

#### Style Guide
- **Technique**: Hand-painted, not photorealistic
- **Palette**: Warm colors, purple shadows
- **Resolution**: 512x512 or 1024x1024 max
- **Format**: KTX2 with UASTC encoding

#### Color Palette
```
Primary:
- Grass green: #7CB342
- Sky blue: #87CEEB
- Sand: #FFD54F
- Brick: #B55239

Accent:
- Neon pink: #FF1493
- Neon blue: #00BFFF
- Neon green: #00FF7F
- Neon orange: #FF6B35

Shadows:
- Base shadow: #4A4063
- Dark: #1A1A2E
```

---

## Implementation Priority Order

### Sprint 1: Core Assets (Weeks 1-2)
1. Set up asset pipeline (Draco, KTX2)
2. Create/source character model
3. Create basic building models
4. Implement model loading in code

### Sprint 2: Visual Polish (Weeks 3-4)
1. Add DOF post-processing
2. Improve loading screen UI
3. Polish HUD and modals
4. Add audio system

### Sprint 3: Details & Optimization (Weeks 5-6)
1. Add more props and details
2. Create textures for buildings
3. Optimize all assets
4. Performance testing

---

## Quick Wins (Do First)

These changes require minimal art assets and give immediate visual improvement:

1. **Add DOF to Camera** - Instant tiny-world feel
2. **Improve Loading Screen** - Better first impression
3. **Polish CSS** - Glassmorphism, animations
4. **Better Outline Shader** - Consistent outline width
5. **Increase Shadow Contrast** - More visible cel-shading
6. **Add Ambient Music** - Immediate atmosphere boost

---

## Resources

### Free 3D Asset Sources
- [Kenney.nl](https://kenney.nl/assets) - Free game assets
- [Quaternius](https://quaternius.com/) - Free low-poly characters
- [Poly Pizza](https://poly.pizza/) - Free 3D models
- [Sketchfab](https://sketchfab.com/) - Search "cel shaded" or "low poly"

### Tools
- [glTF Transform CLI](https://gltf-transform.dev/) - Asset optimization
- [PBR Texture Tools](https://texturehaven.com/) - Free textures (for reference)
- [Blender](https://www.blender.org/) - 3D modeling
- [toktx](https://github.com/KhronosGroup/KTX-Software) - KTX2 conversion

### References
- [Three.js Examples](https://threejs.org/examples/) - Technical reference
- [Messenger Game](https://messenger.abeto.co/) - Primary visual reference
- [Three.js Forum Discussion](https://discourse.threejs.org/) - Community insights

---

## Summary

To achieve messenger.abeto.co visual parity:

1. **Replace procedural geometry with artist-made 3D models** (Critical)
2. **Create/source stylized character model** (Critical)
3. **Add depth-of-field for miniature effect** (High)
4. **Polish all UI elements** (High)
5. **Add ambient audio** (Medium)
6. **Optimize assets with Draco/KTX2** (Medium)

The codebase foundation is solid. The main gap is **art assets** - the code is ready, but needs proper 3D models instead of procedural geometry.

**Recommended approach**: Start with free/placeholder models to validate the pipeline, then commission or create custom assets for final polish.

---

*Document created: January 2026*
*Last updated: January 2026*
