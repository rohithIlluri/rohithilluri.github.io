# MESSENGER-STYLE GAME: COMPLETE PROJECT PLAN
## Asset Sources, Technical Findings & Implementation Blueprint

**Reference:** https://messenger.abeto.co/  
**Studio:** Abeto (abeto.co) - Vicente Lucendo, Michael Sungaila, Kevin Colombin

---

# TABLE OF CONTENTS

1. [How to Extract Assets from Messenger](#1-how-to-extract-assets-from-messenger)
2. [Alternative Free Assets](#2-alternative-free-assets)
3. [Technical Stack Summary](#3-technical-stack-summary)
4. [Art Style Analysis](#4-art-style-analysis)
5. [Game Architecture Overview](#5-game-architecture-overview)
6. [Performance Specifications](#6-performance-specifications)
7. [Key References & Tutorials](#7-key-references--tutorials)
8. [Implementation Checklist](#8-implementation-checklist)

---

# 1. HOW TO EXTRACT ASSETS FROM MESSENGER

## Method 1: Browser Network Tab (Recommended)

1. Open **Chrome DevTools** (F12) → **Network** tab
2. Visit https://messenger.abeto.co/
3. Filter by file type to find assets:
   - `.glb` / `.gltf` - 3D models
   - `.ktx2` - Compressed textures (Basis Universal)
   - `.drc` - Draco-compressed meshes
   - `.ogg` - Audio files
   - `.wasm` - WebAssembly decoders

4. Right-click any asset → **Open in new tab** → **Save as**

### Known Asset Paths (from network analysis):
```
/assets/world.glb          - Main world geometry (~333KB compressed)
/assets/character.glb      - Player character model
/assets/npcs/*.glb         - NPC models
/textures/*.ktx2           - All textures
/audio/music.ogg           - Background music (~2.3MB)
/audio/sfx/*.ogg           - Sound effects
```

## Method 2: WebGL Ripper Extension

**Tool:** https://github.com/Rilshrink/WebGLRipper
- Install as Chrome extension (from source, not store)
- Press `Insert` key on page to extract
- Captures textures and geometry data
- May require manual resizing of textures

## Method 3: Three.js Inspector

- Spector.js browser extension
- Captures WebGL draw calls
- Can export geometry and textures
- Useful for understanding render pipeline

## ⚠️ IMPORTANT: Copyright Notice
The assets from Messenger are proprietary to Abeto. Extraction is for **learning/reference only**. For your project, use the alternative free assets listed below.

---

# 2. ALTERNATIVE FREE ASSETS

## 🎭 CHARACTER MODELS & ANIMATIONS

### Mixamo (FREE - Adobe Account Required)
**URL:** https://www.mixamo.com/
- **Characters:** 100+ free rigged characters
- **Animations:** 2,000+ free animations
- **Recommended for Messenger-style:**
  - Idle, Walk, Run, Jump animations
  - Download as FBX for Unity or GLB
  - Check "In Place" option to prevent root motion

### Sketchfab - Ghibli/Anime Style
**URL:** https://sketchfab.com/tags/ghibli
- Filter by "Downloadable" and "Free"
- Many stylized low-poly characters available
- Export as GLTF/GLB

### Quaternius (FREE Low Poly Packs)
**URL:** https://quaternius.com/
- Ultimate Animated Character Pack (free)
- Stylized characters with animations
- Ready for games, GLTF format

---

## 🏠 ENVIRONMENT MODELS

### Kenney Assets (100% FREE, CC0)
**URL:** https://kenney.nl/assets
- **City Kit** - Buildings, roads, props
- **Nature Kit** - Trees, rocks, foliage
- Low poly, game-ready
- GLTF/OBJ/FBX formats

### Poly Pizza (FREE)
**URL:** https://poly.pizza/
- Thousands of low-poly models
- Filter by "Buildings", "Nature", "Props"
- Many anime/stylized options

### Sketchfab - Stylized Environments
**Search Terms:**
- "low poly town"
- "stylized village"
- "anime environment"
- "ghibli scene"

---

## 🌳 NATURE & FOLIAGE

### Nature Starter Kit 2 (Unity Asset Store - FREE)
- Trees, plants, rocks
- Can export to GLTF via Blender

### Quaternius Nature Pack
**URL:** https://quaternius.com/
- Free trees, bushes, rocks
- Low poly aesthetic

---

## 🎵 AUDIO ASSETS

### Freesound.org (Creative Commons)
**URL:** https://freesound.org/
- Search: "lo-fi ambient", "peaceful nature"
- Footsteps, UI sounds, ambient

### Pixabay Music (FREE, Royalty-Free)
**URL:** https://pixabay.com/music/
- Search: "lofi", "peaceful", "ambient"
- No attribution required

### Kevin MacLeod (FREE, Attribution)
**URL:** https://incompetech.com/
- Huge library of royalty-free music
- Many calm/ambient tracks

### Recommended Messenger-Style Audio:
| Sound | Source | Search Term |
|-------|--------|-------------|
| Background Music | Pixabay | "lofi chill ambient" |
| Footsteps | Freesound | "grass footsteps soft" |
| Ocean Waves | Freesound | "beach waves calm" |
| Bird Ambience | Freesound | "forest birds chirping" |
| UI Clicks | Freesound | "soft click UI" |

---

## 🖼️ TEXTURES

### ambientCG (FREE, CC0)
**URL:** https://ambientcg.com/
- PBR textures
- Ground, wood, stone, etc.

### Texture Haven (FREE, CC0)
**URL:** https://texturehaven.com/
- High quality PBR textures

### For Toon/Stylized Look:
- Use flat colors instead of detailed textures
- Hand-paint in Blender/Substance
- Gradient ramps for cel-shading

---

# 3. TECHNICAL STACK SUMMARY

## Core Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| **3D Rendering** | Three.js | ^0.160+ |
| **Collision/Physics** | three-mesh-bvh | ^0.7+ |
| **Animation** | GSAP | ^3.12+ |
| **Build Tool** | Vite | ^5.0+ |
| **Server** | Node.js + Express | ^20+ |
| **WebSockets** | Socket.io | ^4.7+ |
| **UI Framework** | Svelte (optional) | ^4+ |

## File Formats

| Type | Format | Tool |
|------|--------|------|
| 3D Models | `.glb` (GLTF Binary) | Blender export |
| Compressed Meshes | `.drc` | Draco encoder |
| Textures | `.ktx2` | toktx / gltf-transform |
| Audio | `.ogg` | Audacity |
| Animations | Embedded in GLB | Mixamo → Blender |

## Compression Pipeline

```
Blender (.blend)
    ↓
Export GLTF (.gltf/.glb)
    ↓
gltf-transform draco input.glb output.glb    [Mesh compression]
    ↓
gltf-transform ktx2 input.glb output.glb     [Texture compression]
    ↓
Final optimized .glb file
```

**Install gltf-transform:**
```bash
npm install -g @gltf-transform/cli
```

---

# 4. ART STYLE ANALYSIS

## Visual Characteristics

### Color Palette (from Messenger)
| Element | Hex Colors |
|---------|------------|
| Sky | #87CEEB → #FFB6C1 (gradient) |
| Grass | #7CB342, #558B2F |
| Buildings | #FFCC80, #BCAAA4, #90A4AE |
| Water | #4FC3F7, #29B6F6 |
| Shadows | Soft purple undertone |

### Cel-Shading Approach
1. **2-3 color bands** per material (light, mid, shadow)
2. **Hard edge outlines** (1-3px, dark color)
3. **Rim lighting** on character edges
4. **Soft ambient occlusion** in crevices

### Outline Effect Methods
1. **Inverted hull method** - Scale mesh slightly, flip normals, render black
2. **Post-processing edge detection** - Sobel filter on depth/normals
3. **Shader-based** - Fresnel rim detection

---

## World Design Principles

### Spherical Planet
- Radius: ~50 units in Messenger
- Player always "down" toward center
- No invisible walls (walk anywhere)
- Curvature hides distant geometry naturally

### Zone Layout
```
        [Temple/Mountain]
              |
    [Forest]--+--[Town Square]
              |
         [Beach]
              |
        [Ocean/Boundary]
```

### Level of Detail
- High detail near player
- Simplified distant geometry
- ~10 unique "zones" with distinct feel

---

# 5. GAME ARCHITECTURE OVERVIEW

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      GAME LOOP (60fps)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │ Input Manager│───▶│   Player     │───▶│   Camera     │   │
│  │ (KB/Touch)   │    │  Controller  │    │   Follow     │   │
│  └──────────────┘    └──────┬───────┘    └──────────────┘   │
│                             │                                │
│                             ▼                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐   │
│  │   Network    │◀──▶│  World/BVH   │◀──▶│   Audio      │   │
│  │   Sync       │    │  Collision   │    │   Manager    │   │
│  └──────────────┘    └──────────────┘    └──────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                     THREE.js RENDERER                        │
└─────────────────────────────────────────────────────────────┘
```

## Key Systems

### 1. Player Controller
- Capsule collider (radius 0.3, height 1.6)
- Gravity toward planet center (if spherical)
- Walk speed: 4 units/sec
- Run speed: 8 units/sec
- Jump force: 8 units

### 2. Camera System
- Third-person follow
- Collision avoidance (raycast behind player)
- Smooth interpolation (lerp factor ~0.1)
- FOV: 60°

### 3. Collision (BVH)
- Merge all static meshes into single geometry
- Build MeshBVH with SAH strategy
- Capsule shapecast for player collision
- Raycasts for ground detection

### 4. Multiplayer
- WebSocket connection (Socket.io)
- Broadcast position/rotation every 50ms
- Max 10 players per world instance
- Emoji communication only (no chat)

---

# 6. PERFORMANCE SPECIFICATIONS

## Target Metrics (from Messenger)

| Metric | Target |
|--------|--------|
| Initial Load | < 6 MB |
| Total Assets | < 18 MB |
| Frame Rate | 60 FPS (mobile) |
| Load Time | < 5 seconds (4G) |

## Optimization Techniques

### Asset Optimization
| Technique | Savings |
|-----------|---------|
| Draco mesh compression | ~66% |
| KTX2 texture compression | ~50% |
| GZIP transfer | ~30% |
| LOD (Level of Detail) | Variable |

### Runtime Optimization
- BVH for collision (not naive raycast)
- Frustum culling (automatic in Three.js)
- Object pooling for particles
- Web Workers for asset loading
- Instanced rendering for repeated objects

### Mobile-Specific
- Reduce pixel ratio on low-end devices
- Simplify shaders (no complex post-processing)
- Touch-friendly UI (large buttons)
- Responsive canvas resize

---

# 7. KEY REFERENCES & TUTORIALS

## Official Case Studies from Abeto

1. **Summer Afternoon Case Study**
   - URL: https://www.awwwards.com/summer-afternoon.html
   - Same creator, detailed technical breakdown
   - Explains shader approach, camera, controls

2. **Summer Afternoon Video Talk**
   - URL: https://www.youtube.com/watch?v=KSIxyyEaPr0
   - 20+ minute technical deep-dive
   - Custom tooling explanation

3. **Igloo Inc Case Study**
   - URL: https://www.awwwards.com/igloo-inc-case-study.html
   - Volume rendering, ice effects
   - WebGL UI implementation

## Three.js Tutorials

| Topic | Resource |
|-------|----------|
| Getting Started | https://threejs.org/manual/ |
| GLTF Loading | https://discoverthreejs.com/book/first-steps/load-models/ |
| Character Controller | https://github.com/pmndrs/BVHEcctrl |
| Toon Shader | https://www.maya-ndljk.com/blog/threejs-basic-toon-shader |
| three-mesh-bvh | https://github.com/gkjohnson/three-mesh-bvh |

## Multiplayer Tutorials

| Topic | Resource |
|-------|----------|
| Socket.io + Three.js | https://github.com/juniorxsound/THREE.Multiplayer |
| Multiplayer Architecture | https://hub.packtpub.com/creating-simple-3d-multiplayer-game-threejs/ |
| WebSocket Best Practices | https://socket.io/docs/v4/ |

## Blender to Web Pipeline

| Topic | Resource |
|-------|----------|
| GLTF Export | https://docs.blender.org/manual/en/latest/addons/import_export/scene_gltf2.html |
| Mixamo to Blender | https://www.donmccurdy.com/2017/11/06/creating-animated-gltf-characters-with-mixamo-and-blender/ |
| gltf-transform CLI | https://gltf-transform.donmccurdy.com/ |

---

# 8. IMPLEMENTATION CHECKLIST

## Phase 1: Foundation (Week 1-2)

- [ ] Setup Vite + Three.js project
- [ ] Create basic scene with lighting
- [ ] Implement asset loader (GLTF + Draco + KTX2)
- [ ] Load test environment model
- [ ] Basic orbit camera controls

## Phase 2: Player & Physics (Week 3-4)

- [ ] Implement InputManager (keyboard + touch)
- [ ] Create PlayerController with capsule collider
- [ ] Setup three-mesh-bvh collision
- [ ] Ground detection and gravity
- [ ] Wall collision response
- [ ] Third-person camera with collision avoidance

## Phase 3: Art & Shaders (Week 5-6)

- [ ] Implement toon/cel shader
- [ ] Add outline post-processing
- [ ] Create gradient sky
- [ ] Setup lighting (directional + ambient)
- [ ] Import character with animations
- [ ] Animation state machine (Idle/Walk/Run/Jump)

## Phase 4: World Building (Week 7-8)

- [ ] Model or source environment assets
- [ ] Create spherical planet (if applicable)
- [ ] Design distinct zones (town, forest, beach)
- [ ] Add NPCs with dialogue triggers
- [ ] Implement quest/delivery system
- [ ] Add collectibles and secrets

## Phase 5: Multiplayer (Week 9-10)

- [ ] Setup Node.js + Socket.io server
- [ ] Player position broadcasting
- [ ] Remote player rendering
- [ ] Emoji communication system
- [ ] Character customization sync
- [ ] World instance management (max 10 players)

## Phase 6: Polish (Week 11-12)

- [ ] Add spatial audio system
- [ ] Mobile control overlay (virtual joystick)
- [ ] Loading screen with progress
- [ ] Optimize asset sizes
- [ ] Test on multiple devices
- [ ] Deploy to hosting (Vercel/Netlify)

---

# QUICK START COMMANDS

```bash
# Create project
npm create vite@latest my-messenger-game -- --template vanilla
cd my-messenger-game

# Install dependencies
npm install three three-mesh-bvh gsap

# Install dev dependencies
npm install -D @types/three

# For server
npm install express socket.io cors

# Asset compression tools
npm install -g @gltf-transform/cli

# Compress a model
gltf-transform draco model.glb model-compressed.glb
gltf-transform ktx2 model-compressed.glb model-final.glb
```

---

# SUMMARY

## What Makes Messenger Special

1. **No game engine** - Pure Three.js with custom physics
2. **Tiny planet** - Eliminates invisible walls, creates unique perspective
3. **Cel-shading** - Hand-crafted look, not realistic
4. **< 6MB initial load** - Aggressive compression
5. **10-player limit** - Intentionally intimate multiplayer
6. **Emoji-only communication** - Safe, universal

## Key Success Factors

1. **Performance first** - Optimize before adding features
2. **Art direction** - Simple but cohesive style
3. **Feel over features** - Smooth controls matter most
4. **Small scope** - One small planet, not a huge world
5. **Attention to detail** - Hidden secrets reward exploration

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**For:** Claude Code Implementation
