# Messenger Clone - Complete Build Specification

> **Reference**: https://messenger.abeto.co/
> A mail delivery game on a tiny spherical planet with cel-shaded graphics

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture](#3-architecture)
4. [Implementation Phases](#4-implementation-phases)
5. [Visual Style Guide](#5-visual-style-guide)
6. [Core Systems](#6-core-systems)
7. [Shader Implementations](#7-shader-implementations)
8. [Game Features](#8-game-features)
9. [Performance Targets](#9-performance-targets)
10. [Verification Checklist](#10-verification-checklist)

---

## 1. PROJECT OVERVIEW

### What We're Building
A **Messenger Clone** - a 3D mail delivery game where players walk on a tiny spherical planet, deliver mail to NPCs, and explore a stylized world.

### Core Concept
- Players walk anywhere on a small spherical planet (gravity keeps them on surface)
- Cel-shaded/toon graphics matching messenger.abeto.co exactly
- NPCs roam the planet with patrol routes
- Mail delivery quest system (planned)
- Multiplayer - see other players (planned)
- Character customization (planned)

### NOT a Portfolio
This is purely a game clone for learning. Do not add portfolio elements.

---

## 2. TECHNOLOGY STACK

### Dependencies (package.json)
```json
{
  "name": "messenger-clone",
  "version": "2.0.0",
  "type": "module",
  "dependencies": {
    "three": "^0.170.0",
    "gsap": "^3.12.5",
    "three-mesh-bvh": "^0.8.1",
    "zustand": "^5.0.2"
  },
  "devDependencies": {
    "vite": "^6.0.5",
    "gh-pages": "^6.2.0",
    "@gltf-transform/cli": "^4.1.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### Tech Choices Rationale
| Technology | Purpose | Why |
|------------|---------|-----|
| Three.js | 3D rendering | Industry standard WebGL library |
| Vite | Build tool | Fast HMR, ES modules native |
| GSAP | Animations | Smooth tweens, timeline control |
| three-mesh-bvh | Collision | Efficient BVH-based collision detection |
| Zustand | State | Minimal, no boilerplate |

---

## 3. ARCHITECTURE

### Directory Structure
```
src/
├── main.js                 # App entry point
├── World.js                # Scene orchestrator (central hub)
├── Player.js               # Character controller
├── Camera.js               # Third-person camera
├── InputManager.js         # Keyboard/touch input
│
├── environment/
│   ├── TinyPlanet.js       # Spherical coordinate system
│   └── Planet.js           # Planet geometry, buildings, props
│
├── entities/
│   ├── NPC.js              # Individual NPC controller
│   ├── NPCData.js          # NPC presets and waypoints
│   └── NPCManager.js       # NPC spawning/lifecycle
│
├── shaders/
│   ├── toon.js             # Cel-shading material factory
│   └── sky.js              # Procedural sky shader
│
├── effects/
│   ├── PostProcessing.js   # Bloom, SSAO, vignette
│   └── particles/
│       ├── ParticleManager.js
│       └── Emitters.js
│
├── optimization/
│   └── LODManager.js       # Level of detail system
│
├── audio/
│   └── AudioManager.js     # Music and SFX
│
├── constants/
│   └── colors.js           # Complete color palette
│
└── stores/
    └── gameStore.js        # Zustand state management
```

### Module Dependencies Flow
```
main.js
   └── World.js (orchestrator)
        ├── TinyPlanet.js (spherical math)
        ├── Planet.js (environment)
        │    └── colors.js
        │    └── toon.js
        ├── Player.js
        │    └── TinyPlanet.js
        │    └── toon.js
        ├── Camera.js
        │    └── TinyPlanet.js
        ├── NPCManager.js
        │    └── NPC.js
        │    └── NPCData.js
        ├── InputManager.js
        ├── PostProcessing.js
        ├── ParticleManager.js
        ├── AudioManager.js
        └── gameStore.js
```

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Foundation
**Goal**: Basic 3D scene with spherical planet

- [ ] Set up Vite project with Three.js
- [ ] Create World.js scene orchestrator
- [ ] Implement TinyPlanet.js (lat/lon to 3D conversion)
- [ ] Create basic sphere planet geometry
- [ ] Set up WebGL renderer with quality detection
- [ ] Add basic lighting (ambient + directional)
- [ ] Implement render loop with delta time

**Verification**: See a lit sphere on screen

### Phase 2: Player Movement
**Goal**: Walk on spherical surface

- [ ] Create Player.js character controller
- [ ] Implement spherical movement (stay on surface)
- [ ] Add InputManager.js for WASD/arrows
- [ ] Walking speed: 4 units/sec, Running: 8 units/sec
- [ ] Smooth turning (3.5 rad/sec)
- [ ] Player aligns to surface normal (head points away from center)

**Verification**: Player walks around sphere, stays on surface

### Phase 3: Camera System
**Goal**: Smooth third-person camera

- [ ] Create Camera.js
- [ ] Offset: 8 units behind, 4 units above (in local space)
- [ ] Smooth interpolation (0.25 factor)
- [ ] Quaternion-based orientation on sphere
- [ ] Collision avoidance via raycast (min 2 units from objects)

**Verification**: Camera follows player smoothly around sphere

### Phase 4: Visual Style - Cel Shading
**Goal**: Match messenger.abeto.co aesthetic

- [ ] Create toon.js shader material factory
- [ ] 4-band discrete cel-shading (NOT smooth)
- [ ] Band values: Shadow 0.15, Mid 0.4, Light 0.7, Highlight 1.0
- [ ] Shadow color: Blue-gray #5A6B7A (NEVER black)
- [ ] Rim lighting: White, 0.3 intensity for characters
- [ ] Outline meshes: 2px, color #2A2A2A

**Verification**: Objects have visible cel-shading bands

### Phase 5: Sky System
**Goal**: Procedural sky with clouds

- [ ] Create sky.js shader
- [ ] Gradient: Turquoise zenith → lighter horizon
- [ ] Procedural clouds using Simplex noise
- [ ] Fractal Brownian Motion for texture
- [ ] Clouds animate/drift slowly
- [ ] Night mode: Deep blue gradient

**Verification**: Beautiful animated sky visible

### Phase 6: Character Model
**Goal**: Messenger-style player character

- [ ] Procedural character geometry in Player.js
- [ ] Body parts: Head, torso, arms, legs
- [ ] Yellow messenger bag worn diagonally
- [ ] Anime-style eyes with highlights
- [ ] Color scheme: Dark shirt, signature red skirt
- [ ] Procedural walk animation (limb rotation)

**Verification**: Cute character walks with animation

### Phase 7: Environment
**Goal**: Planet with buildings and props

- [ ] Create Planet.js environment builder
- [ ] Procedural buildings (various heights/colors)
- [ ] Trees with foliage
- [ ] Street lights with power lines
- [ ] Benches, bushes, decorations
- [ ] Roads/paths on sphere surface

**Verification**: Rich environment on planet

### Phase 8: NPC System
**Goal**: Characters that walk around

- [ ] Create NPC.js controller
- [ ] NPCManager.js for spawning (max 6 for performance)
- [ ] NPCData.js with presets (villager, shopkeeper, etc.)
- [ ] Waypoint-based patrol routes
- [ ] States: IDLE, WALKING, PAUSED, LOOKING
- [ ] NPCs look at player when nearby

**Verification**: NPCs patrol around planet

### Phase 9: Effects
**Goal**: Polish and atmosphere

- [ ] PostProcessing.js with EffectComposer
- [ ] Bloom: Threshold 0.95, intensity 0.1
- [ ] SSAO: Subtle ambient occlusion
- [ ] Vignette: Soft edge darkening
- [ ] ParticleManager.js
- [ ] Leaf particles (day)
- [ ] Firefly particles (night)

**Verification**: Polished visual atmosphere

### Phase 10: Day/Night Cycle
**Goal**: Dynamic time of day

- [ ] Toggle with N key
- [ ] 1.5 second animated transition
- [ ] Day: Bright lighting (1.8), turquoise sky
- [ ] Night: Dim lighting (0.3), deep blue sky, enhanced bloom
- [ ] Affects sky, lighting, particles

**Verification**: Beautiful day/night transition

### Phase 11: Audio
**Goal**: Ambient sound

- [ ] AudioManager.js
- [ ] Background lo-fi music
- [ ] Footstep sounds
- [ ] Volume: Master 0.7, Music 0.5, SFX 0.7
- [ ] Auto-pause on tab unfocus

**Verification**: Sound plays appropriately

### Phase 12: UI & Polish
**Goal**: Game UI

- [ ] HUD showing location/controls
- [ ] Interaction prompts (E key hint near NPCs)
- [ ] Loading screen with progress
- [ ] Quality settings auto-detection

**Verification**: Clean, functional UI

---

## 5. VISUAL STYLE GUIDE

### CRITICAL RULES
1. **Shadows are NEVER black** - Always use blue-gray #5A6B7A
2. **Cel-shading must be DISCRETE** - Hard band edges, no smooth gradients
3. **Outlines required** - 2-4px dark outlines on characters
4. **Muted, hand-drawn aesthetic** - Not vibrant/saturated

### Complete Color Palette
```javascript
// === SKY ===
SKY_PRIMARY: 0x5BBFBA      // Turquoise/teal (main sky)
SKY_LIGHT: 0x7DD1CD        // Lighter teal (horizon)
CLOUD_WHITE: 0xFFFFFF      // Clouds (40-60% opacity)
NIGHT_ZENITH: 0x1B2838     // Deep night blue
NIGHT_HORIZON: 0x2A3848    // Night horizon

// === GROUND ===
ASPHALT: 0x6B7B7A          // Blue-gray roads
SIDEWALK: 0xD4CFC5         // Warm gray/cream

// === BUILDINGS ===
BUILDING_CREAM: 0xE8DFD0   // Main wall color
BUILDING_WARM_GRAY: 0xB8AFA0
BUILDING_COOL_GRAY: 0x8A9090
BUILDING_CONCRETE: 0xC5C0B8
BUILDING_BRICK: 0x9A7B6A

// === VEGETATION ===
TREE_GREEN: 0x6B9B5A       // Muted tree green
GRASS_GREEN: 0x7AAB6A
TREE_TRUNK: 0x8B7355

// === ACCENTS ===
YELLOW_ACCENT: 0xE8B84A    // Signs, character bag
ORANGE_ACCENT: 0xD87A4A    // Traffic cones
TEAL_ACCENT: 0x5ABBB8      // UI accent
RED_ACCENT: 0xC85A5A       // Warnings

// === OUTLINES ===
OUTLINE_PRIMARY: 0x2A2A2A  // Main outlines
OUTLINE_SOFT: 0x4A4A4A     // Distant objects

// === CHARACTER ===
CHAR_SKIN: 0xF5E1D0        // Warm peach
CHAR_HAIR: 0x2A2A2A        // Black
CHAR_SHIRT: 0x2A2A2A       // Dark shirt
CHAR_SKIRT: 0xB84A5A       // Red/maroon (signature)
CHAR_SOCKS: 0xF5F5F5       // White
CHAR_SHOES: 0x2A2A2A       // Black

// === SHADOWS (CRITICAL!) ===
SHADOW_TINT: 0x5A6B7A      // Blue-gray shadow (NEVER BLACK)
```

### Cel-Shading Bands
```
Band        | Threshold | Intensity | Description
------------|-----------|-----------|-------------
Shadow      | NdotL < 0 | 0.15      | Deepest shadow
Mid         | NdotL < 0.3 | 0.40    | Transition zone
Light       | NdotL < 0.6 | 0.70    | Main lit area
Highlight   | NdotL ≥ 0.6 | 1.00    | Brightest (narrow)
```

### Rim Lighting
- Color: White #FFFFFF
- Character intensity: 0.3
- Environment intensity: 0.15
- Fresnel threshold: 0.5 - 0.7

---

## 6. CORE SYSTEMS

### 6.1 TinyPlanet.js - Spherical Coordinate System

```javascript
/**
 * Convert latitude/longitude to 3D position on sphere
 * @param {number} lat - Latitude in radians (-π/2 to π/2)
 * @param {number} lon - Longitude in radians (0 to 2π)
 * @param {number} radius - Planet radius
 * @returns {THREE.Vector3} Position on sphere
 */
export function latLonToPosition(lat, lon, radius) {
  return new THREE.Vector3(
    radius * Math.cos(lat) * Math.sin(lon),
    radius * Math.sin(lat),
    radius * Math.cos(lat) * Math.cos(lon)
  );
}

/**
 * Get local coordinate frame at a point on sphere
 * Returns up (away from center), forward, and right vectors
 */
export function getLocalFrame(position, radius) {
  const up = position.clone().normalize();

  // Forward is tangent to sphere, pointing "north"
  const worldUp = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(worldUp, up).normalize();
  const forward = new THREE.Vector3().crossVectors(up, right).normalize();

  return { up, forward, right };
}
```

### 6.2 Player Movement on Sphere

```javascript
// Key parameters
const WALK_SPEED = 4;      // units/second
const RUN_SPEED = 8;       // units/second
const TURN_SPEED = 3.5;    // radians/second

// Update loop
update(deltaTime) {
  // Get input direction
  const input = inputManager.getDirection();

  // Calculate movement in local space
  const { up, forward, right } = tinyPlanet.getLocalFrame(this.position);

  // Move along sphere surface
  const moveDir = new THREE.Vector3()
    .addScaledVector(forward, input.y)
    .addScaledVector(right, input.x)
    .normalize();

  const speed = inputManager.isRunning() ? RUN_SPEED : WALK_SPEED;
  this.position.addScaledVector(moveDir, speed * deltaTime);

  // Project back onto sphere surface
  this.position.normalize().multiplyScalar(PLANET_RADIUS);

  // Orient player to stand on surface
  this.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    this.position.clone().normalize()
  );
}
```

### 6.3 Camera Following on Sphere

```javascript
// Key parameters
const CAMERA_DISTANCE = 8;   // Behind player
const CAMERA_HEIGHT = 4;     // Above player (local)
const SMOOTHNESS = 0.25;     // Interpolation factor

update(deltaTime) {
  const { up, forward } = tinyPlanet.getLocalFrame(player.position);

  // Calculate desired position in local space
  const targetPos = player.position.clone()
    .addScaledVector(forward, -CAMERA_DISTANCE)
    .addScaledVector(up, CAMERA_HEIGHT);

  // Smooth interpolation
  this.position.lerp(targetPos, SMOOTHNESS);

  // Look at player
  this.lookAt(player.position);
}
```

### 6.4 Lighting Setup

```javascript
// Ambient light (low fill)
const ambient = new THREE.AmbientLight(0xffffff, 0.2);

// Hemisphere light (sky/ground colors)
const hemisphere = new THREE.HemisphereLight(
  0x87CEEB,  // Sky color
  0x4A4063,  // Ground color (purple)
  0.4
);

// Main directional light (sun)
const sun = new THREE.DirectionalLight(0xffffff, 1.8);
sun.position.set(40, 60, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);  // Quality dependent
sun.shadow.radius = 3;               // Soft shadows

// Rim light (back-lighting for silhouettes)
const rim = new THREE.DirectionalLight(0xffffff, 0.3);
rim.position.set(-20, 20, -30);
```

### 6.5 Quality Presets

```javascript
const QUALITY_PRESETS = {
  high: {
    shadowMapSize: 2048,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    enableBloom: true,
    enableSSAO: true,
    enableAntialias: true,
    particleCount: 2000,
  },
  medium: {
    shadowMapSize: 1024,
    pixelRatio: Math.min(window.devicePixelRatio, 1.5),
    enableBloom: true,
    enableSSAO: false,
    enableAntialias: true,
    particleCount: 1000,
  },
  low: {
    shadowMapSize: 512,
    pixelRatio: 1,
    enableBloom: false,
    enableSSAO: false,
    enableAntialias: false,
    particleCount: 300,
  }
};

// Auto-detect quality
function detectQuality() {
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile) return 'low';

  const gl = document.createElement('canvas').getContext('webgl');
  const renderer = gl.getParameter(gl.RENDERER);
  if (/Intel|integrated/i.test(renderer)) return 'medium';
  return 'high';
}
```

---

## 7. SHADER IMPLEMENTATIONS

### 7.1 Cel-Shading Material

```javascript
/**
 * Create enhanced toon material with DISCRETE bands
 * CRITICAL: Uses if/else for hard bands, NOT smoothstep
 */
export function createEnhancedToonMaterial(options = {}) {
  const { color = 0xffffff, isCharacter = false } = options;
  const rimIntensity = isCharacter ? 0.3 : 0.15;

  return new THREE.ShaderMaterial({
    uniforms: {
      baseColor: { value: new THREE.Color(color) },
      shadowColor: { value: new THREE.Color(0x5A6B7A) }, // Blue-gray!
      rimColor: { value: new THREE.Color(0xffffff) },
      rimIntensity: { value: rimIntensity },
      lightDirection: { value: new THREE.Vector3(1, 1, 1).normalize() },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 baseColor;
      uniform vec3 shadowColor;
      uniform vec3 rimColor;
      uniform float rimIntensity;
      uniform vec3 lightDirection;

      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float NdotL = dot(normal, lightDirection);

        // DISCRETE 4-band cel-shading (hard edges!)
        float intensity;
        if (NdotL > 0.6) intensity = 1.0;       // Highlight
        else if (NdotL > 0.3) intensity = 0.7;  // Light
        else if (NdotL > 0.0) intensity = 0.4;  // Mid
        else intensity = 0.15;                   // Shadow

        // Mix with shadow color (NEVER black)
        vec3 shadedColor = mix(shadowColor, baseColor, intensity);

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

### 7.2 Outline Mesh (Inverted Hull)

```javascript
export function createOutlineMesh(originalMesh, width = 0.05) {
  const outlineMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      uniform float outlineWidth;
      void main() {
        vec3 newPosition = position + normal * outlineWidth;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
      }
    `,
    fragmentShader: `
      void main() {
        gl_FragColor = vec4(0.165, 0.165, 0.165, 1.0); // #2A2A2A
      }
    `,
    uniforms: { outlineWidth: { value: width } },
    side: THREE.BackSide,
  });

  const outline = new THREE.Mesh(originalMesh.geometry.clone(), outlineMaterial);
  outline.renderOrder = -1;
  return outline;
}
```

### 7.3 Sky Shader

```javascript
// Simplex noise for clouds
// Fractal Brownian Motion for texture

export function createSkyMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(0x5BBFBA) },
      bottomColor: { value: new THREE.Color(0x7DD1CD) },
      offset: { value: 0.4 },
      exponent: { value: 0.6 },
      time: { value: 0 },
      cloudDensity: { value: 0.5 },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform float offset;
      uniform float exponent;
      uniform float time;
      uniform float cloudDensity;

      varying vec3 vWorldPosition;

      // Include simplex noise and FBM functions here...

      void main() {
        float h = normalize(vWorldPosition).y;
        float t = max(pow(max(h, 0.0), exponent) - offset, 0.0);
        vec3 skyColor = mix(bottomColor, topColor, t);

        // Add clouds...

        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
}
```

---

## 8. GAME FEATURES

### 8.1 Input Mapping
```
Key         | Action
------------|-------------
W / ↑       | Move forward
S / ↓       | Move backward
A / ←       | Strafe left
D / →       | Strafe right
Shift       | Run (hold)
E           | Interact with NPC
N           | Toggle day/night
Escape      | Close menus
```

### 8.2 NPC Behavior
```javascript
const NPC_STATES = {
  IDLE: 'idle',
  WALKING: 'walking',
  PAUSED: 'paused',
  LOOKING: 'looking'
};

// NPC looks at player when within range
const LOOK_RANGE = 8; // units

// Patrol waypoints defined as lat/lon pairs
const WAYPOINTS = [
  { lat: 0.1, lon: 0.2 },
  { lat: -0.1, lon: 0.4 },
  // ...
];
```

### 8.3 NPC Presets (NPCData.js)
```javascript
export const NPC_PRESETS = {
  villager: {
    skinColor: 0xF5E1D0,
    shirtColor: 0x5ABBB8,
    pantsColor: 0x4A5A6A,
    hairColor: 0x8B7355,
  },
  shopkeeper: {
    skinColor: 0xE8D0C0,
    shirtColor: 0xE8B84A,
    pantsColor: 0x3A4A4A,
    hairColor: 0x2A2A2A,
  },
  mailCarrier: {
    skinColor: 0xF5E1D0,
    shirtColor: 0x5A7ABB,
    pantsColor: 0x2A2A2A,
    hairColor: 0x6A4A3A,
    hasBag: true,
  },
  // More presets...
};
```

### 8.4 Day/Night Cycle
```javascript
// Day settings
const DAY = {
  skyTop: 0x5BBFBA,
  skyBottom: 0x7DD1CD,
  lightIntensity: 1.8,
  ambientIntensity: 0.2,
  bloomIntensity: 0.1,
};

// Night settings
const NIGHT = {
  skyTop: 0x1B2838,
  skyBottom: 0x2A3848,
  lightIntensity: 0.3,
  ambientIntensity: 0.05,
  bloomIntensity: 0.4,
};

// Transition: 1.5 seconds with easing
```

---

## 9. PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| Initial bundle | < 6 MB |
| Frame rate (desktop) | 60 FPS |
| Frame rate (mobile) | 30 FPS |
| Load time (4G) | < 5 seconds |
| Memory usage | < 200 MB |

### Optimization Strategies
1. **LOD System**: Reduce geometry at distance
2. **Frustum Culling**: Don't render off-screen
3. **Instancing**: Reuse geometry for similar objects
4. **Texture Atlasing**: Combine textures
5. **Object Pooling**: Reuse particles
6. **Quality Presets**: Adapt to device capability

---

## 10. VERIFICATION CHECKLIST

### Phase Completion Checks

**After each phase, verify:**
- [ ] `npm run build` succeeds with no errors
- [ ] `npm run dev` runs without console errors
- [ ] Visual output matches description
- [ ] Performance is acceptable (no jank)

### Final Quality Checks

**Visual Style:**
- [ ] Cel-shading has VISIBLE discrete bands
- [ ] Shadows are blue-gray, NOT black
- [ ] Outlines visible on characters
- [ ] Rim lighting on characters
- [ ] Sky has clouds with animation

**Gameplay:**
- [ ] Player walks smoothly on sphere
- [ ] Player stays on surface at all angles
- [ ] Camera follows without clipping
- [ ] NPCs patrol and look at player
- [ ] Day/night toggle works (N key)

**Performance:**
- [ ] 60 FPS on desktop
- [ ] 30+ FPS on mobile
- [ ] No visible stutter/jank
- [ ] Loading time acceptable

---

## REFERENCE MATERIALS

- **Live Reference**: https://messenger.abeto.co/
- **Screenshots**: `.playwright-mcp/messenger-*.png` (if available)

---

## HOW TO USE THIS PROMPT

1. **Start fresh** or continue from current state
2. **Read existing code** before making changes
3. **Follow phases in order** (dependencies matter)
4. **Verify each phase** before moving on
5. **Match visual style exactly** - refer to color palette

## CURRENT TASK

Read the codebase to understand current progress, then continue from the appropriate phase. Focus on:

1. What's already implemented?
2. What's missing or broken?
3. What's the next priority?

**Always verify `npm run build` succeeds after changes.**

When ALL phases are complete and verified, output:
`<RALPH_TASK_COMPLETE>`
