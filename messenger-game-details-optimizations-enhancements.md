# MESSENGER-STYLE GAME: TECHNICAL DEEP DIVE
## Complete Details, Optimizations & Enhancements Guide

---

# TABLE OF CONTENTS

1. [Rendering System Details](#1-rendering-system-details)
2. [Shader Specifications](#2-shader-specifications)
3. [Physics & Collision System](#3-physics--collision-system)
4. [Character Controller Details](#4-character-controller-details)
5. [Camera System Details](#5-camera-system-details)
6. [Animation System](#6-animation-system)
7. [Multiplayer Architecture](#7-multiplayer-architecture)
8. [Audio System Details](#8-audio-system-details)
9. [Asset Pipeline & Compression](#9-asset-pipeline--compression)
10. [Performance Optimizations](#10-performance-optimizations)
11. [Mobile Optimizations](#11-mobile-optimizations)
12. [UI/UX Specifications](#12-uiux-specifications)
13. [Enhancements & Features](#13-enhancements--features)
14. [Debug & Monitoring Tools](#14-debug--monitoring-tools)
15. [Deployment & Hosting](#15-deployment--hosting)
16. [Quick Reference Tables](#16-quick-reference-tables)

---

# 1. RENDERING SYSTEM DETAILS

## 1.1 Three.js Renderer Configuration

### Optimal Initialization Settings
| Setting | Value | Reason |
|---------|-------|--------|
| `antialias` | `true` (desktop) / `false` (low-end mobile) | Smooth edges but performance cost |
| `powerPreference` | `'high-performance'` | Use dedicated GPU when available |
| `alpha` | `false` | Opaque background = faster compositing |
| `stencil` | `false` | Not needed, saves GPU memory |
| `depth` | `true` | Required for 3D depth testing |
| `premultipliedAlpha` | `true` | Better transparency blending |
| `preserveDrawingBuffer` | `false` | Better performance (true only for screenshots) |
| `failIfMajorPerformanceCaveat` | `false` | Allow software rendering fallback |

### Pixel Ratio Strategy
```
High-end Desktop: Math.min(window.devicePixelRatio, 2)
Standard Desktop: Math.min(window.devicePixelRatio, 1.5)
Mobile High-end: Math.min(window.devicePixelRatio, 2)
Mobile Standard: Math.min(window.devicePixelRatio, 1.5)
Mobile Low-end: 1.0
```

### Color Management Settings
| Setting | Value | Notes |
|---------|-------|-------|
| `outputColorSpace` | `THREE.SRGBColorSpace` | Correct color display |
| `toneMapping` | `THREE.ACESFilmicToneMapping` | Natural HDR to LDR |
| `toneMappingExposure` | `1.0 - 1.2` | Slight boost for vibrancy |

---

## 1.2 Lighting System

### Primary Directional Light (Sun)
| Property | Value | Notes |
|----------|-------|-------|
| Color | `#FFFAF0` | Warm white |
| Intensity | `1.0 - 1.5` | Main illumination |
| Position | `(50, 100, 50)` | High angle |
| castShadow | `true` | Enable shadows |
| shadow.mapSize | `1024×1024` to `2048×2048` | Quality vs performance |
| shadow.camera.near | `0.5` | Shadow frustum |
| shadow.camera.far | `200` | Cover entire world |
| shadow.camera.left/right/top/bottom | `±60` | Match world bounds |
| shadow.bias | `-0.0001` | Prevent shadow acne |
| shadow.normalBias | `0.02` | Reduce peter-panning |

### Fill Lighting Setup
| Light Type | Color | Intensity | Purpose |
|------------|-------|-----------|---------|
| AmbientLight | `#6B7B8C` | `0.4` | Global fill, prevents pure black |
| HemisphereLight sky | `#87CEEB` | `0.6` | Sky color bounce |
| HemisphereLight ground | `#8B7355` | `0.6` | Ground color bounce |

### Shadow Type Comparison
| Type | Quality | Performance | Use Case |
|------|---------|-------------|----------|
| BasicShadowMap | Low | Fast | Mobile low-end |
| PCFShadowMap | Medium | Medium | Default |
| PCFSoftShadowMap | High | Slow | Desktop |
| VSMShadowMap | High | Slow | Special cases |

---

## 1.3 Render Loop Architecture

### Frame Budget Breakdown (16.67ms for 60 FPS)
| Operation | Budget | Notes |
|-----------|--------|-------|
| Input Processing | 0.5ms | Polling, events |
| Physics/Collision | 2.0ms | BVH queries, response |
| Animation Update | 1.0ms | Skeletal, procedural |
| Network Sync | 1.0ms | Send/receive, interpolation |
| Audio Update | 0.5ms | Spatial positioning |
| Scene Graph Update | 1.0ms | Matrix calculations |
| Render Call | 9.0ms | Draw calls, GPU work |
| Buffer/Margin | 1.67ms | Safety margin |

### Update Order (Critical)
```
1. Input polling
2. Network message receive
3. Physics simulation step
4. Collision detection & response
5. Player/NPC movement
6. Camera position update
7. Animation mixer update
8. Audio listener position
9. Network message send
10. Renderer.render()
```

### Delta Time Handling
```
Raw delta: time since last frame
Clamped delta: Math.min(rawDelta, 0.1) // Max 100ms
Reason: Prevents physics explosion after tab switch
Fixed timestep: 1/60 (for deterministic physics)
```

---

# 2. SHADER SPECIFICATIONS

## 2.1 Toon/Cel Shader System

### Core Algorithm
```
1. Calculate diffuse: N·L (normal dot light direction)
2. Quantize into bands using step/smoothstep
3. Apply band color multipliers
4. Add rim lighting (fresnel)
5. Apply ambient occlusion
6. Output final color
```

### Band Configuration
| Band Name | Threshold Range | Color Multiplier | Visual Result |
|-----------|----------------|------------------|---------------|
| Highlight | N·L > 0.9 | 1.1 | Specular-like bright |
| Light | 0.5 < N·L ≤ 0.9 | 1.0 | Full illumination |
| Mid-tone | 0.2 < N·L ≤ 0.5 | 0.75 | Transition zone |
| Shadow | 0.0 < N·L ≤ 0.2 | 0.5 | Shaded area |
| Deep Shadow | N·L ≤ 0.0 | 0.3 | Facing away |

### Rim/Fresnel Lighting
```
ViewDir = normalize(cameraPosition - worldPosition)
Fresnel = 1.0 - max(0.0, dot(ViewDir, Normal))
Rim = smoothstep(0.6, 1.0, Fresnel)
RimContribution = rimColor * Rim * rimIntensity

Recommended:
  rimColor: #FFFFFF (white) or #FFE4B5 (warm)
  rimIntensity: 0.3 - 0.5
```

### Soft vs Hard Transitions
```
Hard edges (classic cel):
  float band = step(threshold, NdotL);

Soft edges (modern cel):
  float band = smoothstep(threshold - 0.05, threshold + 0.05, NdotL);
```

---

## 2.2 Outline Rendering

### Method 1: Inverted Hull (Object Space)
```
Technique:
1. First pass: Render scene normally
2. Second pass: 
   - Extrude vertices along normals: position += normal * outlineWidth
   - Enable front-face culling
   - Render with solid outline color
   - Apply slight depth offset

Parameters:
  outlineWidth: 0.02 - 0.05 (world units)
  outlineColor: #1A1A2E or #2D2D44
  depthOffset: 0.00001
```

### Method 2: Screen-Space Edge Detection
```
Technique:
1. Render scene to MRT (color + depth + normal)
2. Apply Sobel/Roberts filter to detect edges
3. Composite edges over color buffer

Edge sources:
  - Depth discontinuity
  - Normal discontinuity
  - Color discontinuity (optional)

Parameters:
  depthThreshold: 0.001
  normalThreshold: 0.5
  lineWidth: 1-3 pixels
```

### Method 3: Shader-Based (Single Pass)
```
In fragment shader:
  float edgeFactor = 1.0 - dot(viewDir, normal);
  edgeFactor = smoothstep(0.4, 0.5, edgeFactor);
  color = mix(color, outlineColor, edgeFactor);

Limitation: Only detects silhouette edges
```

### Recommended Approach
- Characters: Inverted hull (consistent thickness)
- Environment: Post-process (catches all edges)
- Combine both for best results

---

## 2.3 Special Effect Shaders

### Water Shader
| Component | Implementation | Parameters |
|-----------|----------------|------------|
| Wave distortion | Animated UV offset using sin/cos | speed: 0.3, scale: 0.1 |
| Transparency | Fresnel-based alpha | minAlpha: 0.4, maxAlpha: 0.9 |
| Edge foam | Depth-based mask | threshold: 0.5, width: 0.1 |
| Reflection | Environment map or SSR | intensity: 0.3 |
| Color gradient | Depth-based tint | shallow: #4FC3F7, deep: #0288D1 |

### Foliage/Vegetation Shader
| Component | Implementation | Parameters |
|-----------|----------------|------------|
| Wind sway | Vertex animation using world position | strength: 0.2, speed: 1.0 |
| Subsurface | Light transmission approximation | color: #90EE90, intensity: 0.3 |
| Alpha cutout | Texture-based with dithering | threshold: 0.5 |
| Two-sided | Flip normal for back faces | |

### Stylized Sky Shader
| Component | Implementation | Parameters |
|-----------|----------------|------------|
| Gradient | View-Y based color blend | zenith: #1E90FF, horizon: #FFB6C1 |
| Sun disc | Distance from sun direction | size: 0.05, glow: 0.2 |
| Clouds | Animated noise texture | speed: 0.01, opacity: 0.4 |
| Stars | Point sampling (night) | threshold: 0.98 |

---

# 3. PHYSICS & COLLISION SYSTEM

## 3.1 BVH (Bounding Volume Hierarchy)

### What is BVH?
A spatial acceleration structure that divides geometry into a tree of bounding boxes, enabling O(log n) collision queries instead of O(n).

### Performance Comparison
| Geometry Size | Naive Raycast | BVH Raycast |
|---------------|---------------|-------------|
| 1,000 tris | 1,000 checks | ~10 checks |
| 10,000 tris | 10,000 checks | ~14 checks |
| 100,000 tris | 100,000 checks | ~17 checks |

### three-mesh-bvh Configuration
| Parameter | Value | Notes |
|-----------|-------|-------|
| `strategy` | `SAH` | Best bounds, slow build |
| `maxLeafTris` | `10` | Triangles per leaf |
| `maxDepth` | `40` | Tree depth limit |
| `verbose` | `false` | Debug output |

### Build Strategies Comparison
| Strategy | Build Speed | Query Speed | Memory |
|----------|-------------|-------------|--------|
| CENTER | Fast | Medium | Low |
| AVERAGE | Medium | Medium | Low |
| SAH | Slow | Fast | Medium |

**Use SAH** for static geometry (built once at load time).

---

## 3.2 Collision Mesh Preparation

### Steps to Create Optimized Collision Mesh
```
1. Collect all static meshes in scene
2. Filter to only solid geometry (no foliage, decorations)
3. Apply all world transforms to geometry
4. Merge into single BufferGeometry
5. Remove unnecessary attributes:
   - Keep: position, index
   - Remove: uv, normal, color, tangent
6. Optionally simplify (reduce triangle count)
7. Build BVH on merged geometry
8. Store as invisible object (visible = false)
```

### Recommended Simplification
| Original | Collision Mesh | Reduction |
|----------|----------------|-----------|
| 50,000 tris | 5,000 tris | 90% |
| Player won't notice collision precision | | |

### Excluded from Collision
- Foliage (grass, small plants)
- Decorations (signs, small props)
- Transparent objects
- Moving objects (handled separately)

---

## 3.3 Player Capsule Collider

### Dimensions
| Parameter | Value | Notes |
|-----------|-------|-------|
| Radius | 0.3 units | Width of player |
| Segment Height | 1.0 units | Cylinder part |
| Total Height | 1.6 units | Segment + 2×Radius |
| Center Height | 0.8 units | From ground to capsule center |

### Collision Detection Methods

**Ground Check:**
```
Origin: capsule center
Direction: down (or toward planet center)
Length: segment half-height + radius + 0.1
Hit within (half-height + radius + 0.05) = grounded
```

**Wall Check:**
```
Origin: capsule center
Direction: normalized velocity
Length: radius + velocity magnitude × deltaTime
```

**Ceiling Check:**
```
Origin: capsule center
Direction: up
Length: segment half-height + radius + 0.1
```

### Collision Response
```
1. Detect collision point and normal
2. Calculate penetration depth
3. Push player out: position += normal × (penetration + epsilon)
4. Adjust velocity: remove component into surface
   velocity -= normal × dot(velocity, normal)
```

### Step Climbing
```
Max step height: 0.3 units
Detection: Short forward-down raycast
If step detected and height < max:
  Smoothly raise player over step
```

---

## 3.4 Spherical World Physics

### Gravity Modification
```
Flat world: gravity = Vector3(0, -9.8, 0)
Spherical: gravity = -normalize(playerPosition) × 9.8

Player is always pulled toward world origin (0, 0, 0)
```

### Surface Orientation
```
Up vector: normalize(playerPosition)
Forward: Project desired direction onto tangent plane
Right: cross(up, forward)
Construct rotation matrix from these vectors
Apply to player mesh
```

### Movement on Curved Surface
```
1. Get input direction (camera-relative)
2. Transform to world space
3. Project onto sphere tangent plane at player position
4. Apply as velocity
5. After movement, project position back to sphere:
   position = normalize(position) × sphereRadius
```

---

# 4. CHARACTER CONTROLLER DETAILS

## 4.1 Movement Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Walk Speed | 4.0 units/sec | Default movement |
| Run Speed | 8.0 units/sec | Sprint (hold shift/button) |
| Acceleration | 25.0 units/sec² | How fast to reach max speed |
| Deceleration | 35.0 units/sec² | How fast to stop (faster than accel) |
| Turn Speed | 720°/sec | Rotation rate |
| Air Control | 0.3 | Multiplier when airborne |

## 4.2 Jump Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Jump Force | 10.0 units | Initial upward velocity |
| Gravity | -30.0 units/sec² | Downward acceleration |
| Max Fall Speed | -25.0 units/sec | Terminal velocity |
| Jump Cooldown | 0.1 sec | Prevent spam |
| Coyote Time | 0.15 sec | Jump grace period after leaving edge |
| Jump Buffer | 0.1 sec | Input buffer before landing |

### Jump Curve Feel
```
Rise time: ~0.33 sec
Fall time: ~0.5 sec (gravity pulls down faster)
Max height: ~1.67 units

For floatier feel: Reduce gravity to -20, jump force to 8
For snappier feel: Increase gravity to -40, jump force to 12
```

## 4.3 Slope Handling

| Slope Angle | Behavior |
|-------------|----------|
| 0° - 45° | Normal walking, full speed |
| 45° - 55° | Reduced speed (75%) |
| 55° - 70° | Sliding down slowly |
| 70°+ | Cannot climb, slide down fast |

### Slope Detection
```
Ground normal from collision raycast
Slope angle = acos(dot(groundNormal, upVector))
```

---

# 5. CAMERA SYSTEM DETAILS

## 5.1 Third-Person Camera Parameters

| Parameter | Value | Notes |
|-----------|-------|-------|
| FOV | 60° | Good for exploration |
| Near Plane | 0.1 | Close object visibility |
| Far Plane | 500-1000 | Cover entire world |
| Distance Behind | 5.0 units | From player |
| Height Above | 2.0 units | Above player pivot |
| Look At Offset | (0, 1.0, 0) | Look slightly above player center |

## 5.2 Camera Smoothing

| Parameter | Value | Notes |
|-----------|-------|-------|
| Position Lerp Factor | 5.0 | Multiply by deltaTime |
| Rotation Lerp Factor | 8.0 | Slightly faster than position |
| Zoom Lerp Factor | 10.0 | Quick zoom response |

### Lerp Formula
```
currentPosition = lerp(currentPosition, targetPosition, lerpFactor × deltaTime)

Where lerp(a, b, t) = a + (b - a) × t
```

## 5.3 Camera Collision

### Raycast Method
```
1. Calculate ideal camera position (behind player)
2. Cast ray from player head to ideal position
3. If hit:
   - New position = hit point - direction × offset (0.3 units)
   - Clamp to minimum distance (1.5 units from player)
4. Smoothly interpolate to new position
```

### Enhanced: Spherecast
```
Use sphere (radius 0.3) instead of ray
Catches near-misses that ray would ignore
Better for tight spaces
```

### Collision Response Speeds
| Situation | Lerp Speed | Notes |
|-----------|------------|-------|
| Pulling in (obstructed) | 15.0 | Fast to avoid clip |
| Pushing out (clear) | 3.0 | Slow for smooth feel |

---

# 6. ANIMATION SYSTEM

## 6.1 State Machine

```
┌──────────────────────────────────────────────────────────────┐
│                       ANIMATION STATES                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│    ┌────────┐  speed > 0.1  ┌────────┐  speed > 5  ┌────────┐│
│    │  IDLE  │──────────────▶│  WALK  │────────────▶│  RUN   ││
│    └───┬────┘◀──────────────└───┬────┘◀────────────└───┬────┘│
│        │     speed < 0.1        │     speed < 5        │     │
│        │                        │                      │     │
│        │ jump                   │ jump                 │ jump│
│        ▼                        ▼                      ▼     │
│    ┌─────────────────────────────────────────────────────┐   │
│    │                      JUMP                           │   │
│    │   (returns to appropriate state when grounded)      │   │
│    └─────────────────────────────────────────────────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 6.2 Transition Configuration

| Transition | Duration | Condition |
|------------|----------|-----------|
| Idle → Walk | 0.2s | speed > 0.1 |
| Walk → Idle | 0.25s | speed < 0.1 for 0.1s |
| Walk → Run | 0.15s | speed > 5.0 |
| Run → Walk | 0.2s | speed < 5.0 |
| Any → Jump | 0.1s | jump triggered && grounded |
| Jump → Idle/Walk | 0.2s | grounded |

## 6.3 Animation Blending

### Cross-Fade
```
When transitioning from A to B over duration D:
weight_A = 1 - (elapsed / D)
weight_B = elapsed / D

Apply both animations with respective weights
```

### Blend Tree (Locomotion)
```
Parameter: speed (0 to 10)

Ranges:
  0.0 - 0.5: 100% Idle
  0.5 - 2.0: Idle→Walk blend
  2.0 - 5.0: 100% Walk
  5.0 - 7.0: Walk→Run blend
  7.0+: 100% Run
```

## 6.4 Mixamo Animation Guidelines

### Download Settings
| Setting | Value |
|---------|-------|
| Format | FBX for Unity (.fbx) |
| Skin | With Skin |
| Frames per Second | 30 |
| Keyframe Reduction | none |

### Required Animations
| Animation | Mixamo Search | Loop |
|-----------|---------------|------|
| Idle | "breathing idle" | Yes |
| Walk | "walking" | Yes |
| Run | "running" | Yes |
| Jump Start | "jump" | No |
| Jump Loop | "falling idle" | Yes |
| Jump Land | "landing" | No |

### In-Place Option
```
Always enable "In Place" checkbox
Physics drives movement, animation is visual only
If not available, remove root motion in Blender
```

---

# 7. MULTIPLAYER ARCHITECTURE

## 7.1 Network Topology

```
                    ┌─────────────┐
                    │   SERVER    │
                    │  (Node.js)  │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
      │ Client1 │    │ Client2 │    │ Client3 │
      │  (You)  │    │ (Other) │    │ (Other) │
      └─────────┘    └─────────┘    └─────────┘
```

## 7.2 Message Protocol

### Client → Server Messages
| Message | Frequency | Data |
|---------|-----------|------|
| `join` | Once | playerId, name, customization |
| `position` | 20/sec | x, y, z, rotY, animState |
| `emoji` | On event | emojiId |
| `customize` | On event | customization object |
| `leave` | On disconnect | (automatic) |

### Server → Client Messages
| Message | Frequency | Data |
|---------|-----------|------|
| `welcome` | Once | playerId, worldState |
| `playerJoined` | On event | playerId, data |
| `playerLeft` | On event | playerId |
| `worldState` | 20/sec | all player positions |
| `emoji` | On event | playerId, emojiId |

## 7.3 Data Packet Optimization

### Minimal Position Packet
```
{
  i: "abc123",      // 6 char ID
  p: [x, y, z],     // 3 × 4 bytes = 12 bytes (float32)
  r: rotY,          // 4 bytes (float32)
  a: 1,             // 1 byte (animation state enum)
  t: 1234567890     // 4 bytes (timestamp, truncated)
}

Total: ~30 bytes per player
```

### Animation State Enum
```
0: idle
1: walk
2: run
3: jump
4: fall
```

### Bandwidth Calculation
```
30 bytes × 10 players × 20 updates/sec = 6 KB/sec
Very manageable for any connection
```

## 7.4 Interpolation System

### Buffer Configuration
| Parameter | Value |
|-----------|-------|
| Buffer size | 3 positions |
| Interpolation delay | 100ms |
| Max extrapolation | 200ms |

### Algorithm
```
1. Receive position update, add to buffer with timestamp
2. Calculate render time = currentTime - interpolationDelay
3. Find two buffered positions that bracket render time
4. Interpolate: t = (renderTime - pos1.time) / (pos2.time - pos1.time)
5. Position = lerp(pos1, pos2, t)
6. Rotation = slerp(rot1, rot2, t)
```

### Extrapolation (when buffer empty)
```
If no recent updates (>200ms):
1. Continue in last known direction
2. Gradually slow to stop
3. Fade to idle animation
4. Show "connection lost" indicator after 2s
```

## 7.5 World Instancing

### Configuration
| Parameter | Value |
|-----------|-------|
| Max players per instance | 10 |
| Instance timeout | 60 seconds (when empty) |
| Instance creation | Automatic on overflow |

### Load Balancing
```
New player joins:
1. Find instance with most players but < max
2. Prefer instances with friends (if friend system exists)
3. Prefer instances in same region
4. Create new instance if all full or better region available
```

---

# 8. AUDIO SYSTEM DETAILS

## 8.1 Audio Architecture

```
AudioContext
    └── MasterGain (volume control)
            ├── MusicGain ──── [Music Sources]
            ├── AmbientGain ── [Ambient Sources]
            ├── SFXGain ────── [Sound Effect Sources]
            └── UIGain ─────── [UI Sound Sources]
```

## 8.2 Category Settings

| Category | Default Volume | Spatial | Notes |
|----------|----------------|---------|-------|
| Music | 0.3 | No | Background loop |
| Ambient | 0.5 | Yes | Environmental |
| SFX | 0.7 | Yes | Footsteps, impacts |
| UI | 0.5 | No | Clicks, notifications |

## 8.3 Spatial Audio Configuration

### 3D Positioning (Three.js PositionalAudio)
| Parameter | Value | Notes |
|-----------|-------|-------|
| refDistance | 5 | Full volume at this distance |
| maxDistance | 50 | Inaudible beyond |
| rolloffFactor | 1.0 | Falloff rate |
| distanceModel | 'linear' | Predictable falloff |
| coneInnerAngle | 360 | Omnidirectional |
| coneOuterAngle | 360 | Omnidirectional |

### Audio Listener
```
Attach to: Camera
Updates: Every frame
```

## 8.4 Footstep System

### Surface Detection
```
1. Raycast down from player
2. Check hit mesh's material name or userData tag
3. Play corresponding footstep sound
```

### Surface Types
| Surface | Sound Character | Volume |
|---------|-----------------|--------|
| Grass | Soft, muted | 0.6 |
| Stone | Hard, click | 0.8 |
| Wood | Hollow, thunk | 0.7 |
| Sand | Shuffle, soft | 0.5 |
| Water | Splash | 0.9 |

### Trigger Timing
```
Option 1: Animation events (precise)
Option 2: Distance traveled (0.5 units per step)
Option 3: Timer (every 0.4s while moving)
```

## 8.5 Zone-Based Ambience

### Zone Definition
| Zone | Ambient Sounds |
|------|----------------|
| Town | Distant chatter, wind, occasional bird |
| Forest | Birds, rustling leaves, insects |
| Beach | Waves, seagulls, wind |
| Mountain | Strong wind, distant echo |

### Crossfade Implementation
```
1. Calculate player distance to each zone center
2. Normalize distances (0 = in zone, 1 = far)
3. Calculate volume for each zone: 1 - (distance / fadeDistance)
4. Apply volumes to ambient sources
5. Crossfade happens naturally as player moves
```

---

# 9. ASSET PIPELINE & COMPRESSION

## 9.1 Complete Pipeline

```
[MODELING]
    │
    ▼
Blender (.blend)
    │ Export
    ▼
GLTF/GLB (uncompressed)
    │ gltf-transform dedup
    ▼
Deduplicated GLB
    │ gltf-transform prune
    ▼
Pruned GLB
    │ gltf-transform draco
    ▼
Draco-compressed GLB
    │ gltf-transform ktx2
    ▼
Final optimized GLB
    │ Upload to server
    ▼
GZIP/Brotli transfer
    │ Download to client
    ▼
Decode & render
```

## 9.2 Compression Commands

### Install Tools
```bash
npm install -g @gltf-transform/cli
```

### Individual Steps
```bash
# Remove duplicate data
gltf-transform dedup input.glb deduped.glb

# Remove unused data
gltf-transform prune deduped.glb pruned.glb

# Compress meshes (Draco)
gltf-transform draco pruned.glb draco.glb

# Compress textures (KTX2 - ETC1S for size)
gltf-transform ktx2 draco.glb final.glb --slots "baseColor,emissive"

# Or use UASTC for quality (normal maps)
gltf-transform ktx2 input.glb output.glb --codec uastc --slots "normal"
```

### All-in-One
```bash
gltf-transform optimize input.glb output.glb \
  --compress draco \
  --texture-compress ktx2
```

### Inspect Result
```bash
gltf-transform inspect final.glb
```

## 9.3 Expected Size Reductions

| Stage | Size | Reduction |
|-------|------|-----------|
| Original (Blender export) | 10.0 MB | - |
| After dedup | 9.0 MB | 10% |
| After prune | 8.5 MB | 5% |
| After Draco | 3.5 MB | 59% |
| After KTX2 | 2.5 MB | 29% |
| GZIP transfer | 1.8 MB | 28% |
| **Total reduction** | **1.8 MB** | **82%** |

## 9.4 Texture Guidelines

| Texture Type | Max Resolution | Format | Compression |
|--------------|----------------|--------|-------------|
| Character diffuse | 512×512 | RGB | ETC1S |
| Character normal | 512×512 | RGB | UASTC |
| Environment atlas | 2048×2048 | RGB | ETC1S |
| Environment normal | 1024×1024 | RGB | UASTC |
| UI elements | Power of 2 | RGBA | PNG (no compression) |

## 9.5 Model Guidelines

| Asset Type | Triangle Budget | Notes |
|------------|-----------------|-------|
| Player character | 3,000 - 5,000 | Most detailed |
| NPCs | 2,000 - 3,000 | Slightly simpler |
| Buildings | 500 - 2,000 | Based on size |
| Props (large) | 200 - 500 | Tables, vehicles |
| Props (small) | 50 - 200 | Boxes, plants |
| **Total visible** | **50,000 - 100,000** | Target budget |

---

# 10. PERFORMANCE OPTIMIZATIONS

## 10.1 Geometry Optimizations

### Mesh Merging
```
Problem: 500 individual meshes = 500 draw calls
Solution: Merge static meshes sharing same material

Result: 500 meshes → 1 draw call

When to merge:
- Same material
- Static (never moves)
- Same render order
```

### Instanced Rendering
```
Problem: 1000 trees, each a draw call
Solution: InstancedMesh renders all in 1 call

Use for:
- Trees, grass, rocks
- Repeated props (lamp posts, benches)
- Particles
```

### Level of Detail (LOD)
```
Distance-based model swapping:

0 - 20 units: High detail (100%)
20 - 50 units: Medium (50% tris)
50 - 100 units: Low (20% tris)
100+ units: Billboards or hidden
```

## 10.2 Rendering Optimizations

### Frustum Culling
```
Three.js: Automatic
Ensure: mesh.frustumCulled = true (default)
Custom: Disable for always-visible objects (sky)
```

### Draw Call Reduction Techniques
| Technique | Benefit | Implementation |
|-----------|---------|----------------|
| Mesh merging | Fewer calls | BufferGeometryUtils.mergeGeometries |
| Texture atlases | Fewer material switches | Combine textures in UV space |
| Instancing | 1 call for many | THREE.InstancedMesh |
| LOD | Simpler distant geometry | THREE.LOD |
| Frustum culling | Skip off-screen | Automatic |

### Shadow Optimization
| Technique | Benefit |
|-----------|---------|
| Limit shadow casters | Only important objects |
| Cascaded shadows | Quality near, cheap far |
| Baked shadows | No runtime cost |
| Reduce shadow map size | Mobile performance |

## 10.3 CPU Optimizations

### Avoid Per-Frame Allocations
```javascript
// BAD - creates garbage every frame
function update() {
  const direction = new THREE.Vector3(0, 0, 1);
  const rotation = new THREE.Quaternion();
}

// GOOD - reuse pre-allocated objects
const _direction = new THREE.Vector3();
const _rotation = new THREE.Quaternion();
function update() {
  _direction.set(0, 0, 1);
  _rotation.identity();
}
```

### Object Pooling
```
For frequently created/destroyed objects:
1. Pre-create pool of objects
2. On "create": grab from pool, reset, activate
3. On "destroy": deactivate, return to pool

Use for:
- Particles
- Projectiles
- Temporary effects
- Network player ghosts
```

### Throttle Expensive Operations
| Operation | Recommended Frequency |
|-----------|----------------------|
| BVH queries | Only when moving |
| Shadow updates | Every 2-3 frames OR static |
| Physics step | Fixed 60Hz |
| Network send | 20Hz |
| LOD calculations | Every 10 frames |
| Audio positioning | Every 2 frames |

## 10.4 Memory Optimizations

### Disposal Pattern
```javascript
// When removing an object:
scene.remove(mesh);
mesh.geometry.dispose();
mesh.material.dispose();
if (mesh.material.map) mesh.material.map.dispose();
// Continue for all textures...
mesh = null;
```

### Memory Budgets
| Category | Budget | Notes |
|----------|--------|-------|
| Total JS Heap | < 200 MB | Monitor with DevTools |
| GPU Textures | < 100 MB | Most memory-heavy |
| GPU Geometry | < 50 MB | After Draco decode |
| Audio | < 30 MB | OGG compressed |

---

# 11. MOBILE OPTIMIZATIONS

## 11.1 Device Detection

```javascript
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
const isLowEnd = navigator.hardwareConcurrency <= 4 || 
                 (navigator.deviceMemory && navigator.deviceMemory <= 4);
const hasWebGL2 = !!document.createElement('canvas').getContext('webgl2');
```

## 11.2 Quality Presets

| Setting | High (Desktop) | Medium (Mobile) | Low (Low-end) |
|---------|----------------|-----------------|---------------|
| Pixel Ratio | 2.0 | 1.5 | 1.0 |
| Shadow Map | 2048×2048 | 1024×1024 | OFF |
| Shadow Type | PCFSoft | PCF | - |
| Antialias | Yes | Yes | No |
| Post-Processing | Full | Outline only | None |
| Draw Distance | 500 | 300 | 150 |
| LOD Bias | 0 | 0.5 | 1.0 |
| Particle Count | 100% | 50% | 25% |

## 11.3 Touch Controls

### Virtual Joystick Specifications
| Parameter | Value |
|-----------|-------|
| Position | Bottom-left, 80px from edges |
| Outer size | 120px diameter |
| Inner size | 50px diameter |
| Dead zone | 10% of outer radius |
| Opacity (idle) | 0.4 |
| Opacity (active) | 0.8 |

### Touch Zone Layout
```
┌─────────────────────────────────┐
│                                 │
│        Camera drag area         │
│        (orbit on drag)          │
│                                 │
├────────────────┬────────────────┤
│                │                │
│   Joystick     │    Action      │
│   (left 40%)   │    (right 60%) │
│                │                │
└────────────────┴────────────────┘
```

### Gesture Mapping
| Gesture | Action |
|---------|--------|
| Drag left zone | Move character |
| Drag right zone | Orbit camera |
| Tap right zone | Jump |
| Double-tap anywhere | Interact |
| Long-press | Run toggle |

## 11.4 Mobile-Specific Code Paths

### Shader Simplifications
```
Mobile: Skip expensive operations
- Remove SSR
- Simplify fog
- Reduce toon bands (3 → 2)
- Skip normal mapping
```

### Texture Size Limits
```
Desktop max: 4096×4096
Mobile max: 2048×2048
Low-end mobile: 1024×1024
```

### Battery Considerations
```
- Use requestAnimationFrame (auto-throttles)
- Pause on visibility change
- Offer 30 FPS cap option
- Reduce effects when battery < 20%
```

---

# 12. UI/UX SPECIFICATIONS

## 12.1 Loading Screen

### Elements
| Element | Position | Behavior |
|---------|----------|----------|
| Progress bar | Center | 0-100% |
| Loading text | Below bar | Current asset name |
| Tip text | Bottom | Rotates every 5s |
| Background | Full | Blurred screenshot or gradient |

### Progress Tracking
```
Phase 1 (0-30%): Core assets (engine, player)
Phase 2 (30-70%): World geometry
Phase 3 (70-90%): Textures
Phase 4 (90-100%): Audio, final setup
```

## 12.2 HUD Design (Minimal)

### Elements
| Element | Position | Visibility |
|---------|----------|------------|
| Location name | Top-center | Fade on zone change |
| Quest indicator | Top-right | When quest active |
| Emoji button | Bottom-right | Always |
| Player count | Top-left, small | Always |
| Mobile controls | Bottom | Touch devices only |

### Design Principles
```
- Minimal by default
- Contextual appearance
- Semi-transparent
- Non-intrusive
```

## 12.3 Menu Systems

### Pause Menu
```
┌─────────────────────┐
│     ≡ PAUSED        │
├─────────────────────┤
│                     │
│    ► Resume         │
│      Settings       │
│      Customize      │
│      Quit           │
│                     │
└─────────────────────┘
```

### Settings Menu
```
┌─────────────────────────────┐
│     ⚙ SETTINGS              │
├─────────────────────────────┤
│                             │
│ Music       [═══░░░] 50%    │
│ SFX         [════░░] 70%    │
│ Quality     [ Low | Med | Hi]│
│ Fullscreen  [    Toggle    ]│
│                             │
│        [ Back ]             │
└─────────────────────────────┘
```

## 12.4 Emoji System

### Emoji Palette
```
┌──────────────────────────┐
│  👋  😊  😢  👍  ❤️      │
│  🎉  ❓  👆  🏃  😴      │
└──────────────────────────┘
```

### Display Specifications
| Parameter | Value |
|-----------|-------|
| Position | Above player head |
| Size | 0.5 world units |
| Duration | 3 seconds |
| Fade out | Last 0.5 seconds |
| Billboard | Always faces camera |
| Network sync | Broadcast to all players |

---

# 13. ENHANCEMENTS & FEATURES

## 13.1 Visual Enhancements

### Day/Night Cycle
| Parameter | Value |
|-----------|-------|
| Full cycle | 20 minutes real time |
| Dawn | 0-10% |
| Day | 10-50% |
| Dusk | 50-60% |
| Night | 60-100% |

### Effects by Time
| Time | Sun Color | Ambient | Fog | Stars |
|------|-----------|---------|-----|-------|
| Dawn | #FFB347 | #B8860B | Light | Fading |
| Day | #FFFAF0 | #87CEEB | None | None |
| Dusk | #FF6B6B | #8B4513 | Light | Appearing |
| Night | #4169E1 | #191970 | Medium | Full |

### Weather System (Optional)
| Weather | Effects |
|---------|---------|
| Clear | Default |
| Cloudy | Darker ambient, animated cloud layer |
| Rain | Particle rain, darker, puddle reflections |
| Fog | Dense distance fog, muted audio |

## 13.2 Gameplay Enhancements

### Quest System
```
Quest Types:
- Delivery: Take item A to NPC B
- Fetch: Find hidden item in area
- Talk: Speak to NPCs in sequence

Quest Data:
{
  id: "quest_001",
  type: "delivery",
  title: "Special Delivery",
  description: "Bring the package to the lighthouse keeper",
  giver: "npc_postmaster",
  target: "npc_lighthouse",
  item: "item_package",
  reward: { customization: "hat_sailor" }
}
```

### Collectibles
| Type | Count | Reward |
|------|-------|--------|
| Hidden stars | 10 | Unlock hat |
| Photo spots | 5 | Unlock filter |
| Secret areas | 3 | Unlock emote |

### Character Customization
```
Categories:
- Hair style (8 options)
- Hair color (12 colors)
- Jacket color (16 colors)
- Pants style (4 options)
- Pants color (16 colors)
- Shoes (6 options)

Storage: LocalStorage or server account
Sync: Broadcast changes to other players
```

## 13.3 Social Features

### Player Indicators
```
Off-screen arrow pointing to nearest player
Distance threshold: 50 units
Max indicators: 3
```

### Shared Activities
```
- Synchronized emote animations
- "Follow me" mode (auto-follow player)
- Group photo pose
```

### Social Presence
```
- Show player count per zone
- "Busy" indicator (in dialogue)
- Recent player list
```

## 13.4 Accessibility

### Must-Have Options
| Option | Default | Range |
|--------|---------|-------|
| Subtitles | On | On/Off |
| UI Scale | 100% | 75-150% |
| Colorblind mode | Off | Off/Deuteranopia/Protanopia/Tritanopia |
| Reduced motion | Off | On/Off |
| Camera shake | On | On/Off |

### Controls
```
- Fully remappable keyboard
- One-handed mobile option
- Invert camera options
```

---

# 14. DEBUG & MONITORING TOOLS

## 14.1 Development Stats Display

### Stats Panel Content
```
FPS: 60 (16.67ms)
Draw calls: 45
Triangles: 52,340
Textures: 24
Programs: 8
Memory: 145 MB
```

### Toggle Visualizations
```
- Wireframe mode
- Collision mesh overlay
- BVH bounds visualization
- Light helpers
- Camera frustum
- Audio source spheres
- Network latency graph
```

## 14.2 Console Commands

### Debug Commands
```
/teleport x y z     Move player to coordinates
/noclip            Toggle collision
/speed 1-10        Set movement speed
/time 0-24         Set time of day
/weather type      Set weather
/spawn npc_name    Spawn NPC
/give item_name    Add item
/quality preset    Set quality preset
/reload           Hot-reload shaders/assets
```

## 14.3 Performance Profiling

### Key Metrics to Monitor
| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Frame time | <16ms | <25ms | >33ms |
| Draw calls | <100 | <200 | >300 |
| Triangles | <100k | <200k | >500k |
| Memory | <200MB | <300MB | >500MB |
| Network latency | <100ms | <200ms | >500ms |

### Profiling Tools
```
Browser DevTools:
- Performance tab (frame profiling)
- Memory tab (heap snapshots)
- Network tab (asset loading)

Three.js specific:
- renderer.info (draw calls, memory)
- Stats.js (FPS graph)
- Spector.js (WebGL calls)
```

## 14.4 Error Handling

### Error Categories
| Category | Response |
|----------|----------|
| WebGL not supported | Show friendly message, suggest browser |
| Asset load failed | Retry 3x, then placeholder + warning |
| Network disconnect | Offline indicator, auto-reconnect |
| Low FPS | Suggest reducing quality |
| Memory warning | Unload distant assets |

### Error Reporting
```
Capture:
- Error message and stack trace
- Device/browser info
- Game state snapshot
- Recent player actions

Send to:
- Sentry (recommended)
- Custom error endpoint
- Console (development)
```

---

# 15. DEPLOYMENT & HOSTING

## 15.1 Build Configuration

### Vite Build Settings
| Setting | Value | Notes |
|---------|-------|-------|
| target | 'es2020' | Modern browsers |
| minify | 'terser' | Best compression |
| sourcemap | false (prod) | Security |
| assetsInlineLimit | 4096 | Inline small assets |

### Code Splitting Strategy
```
Chunks:
- vendor (three, gsap, socket.io) - ~200KB
- main (game code) - ~100KB
- lazy (settings, customization) - on demand
```

### Output Structure
```
dist/
├── index.html
├── assets/
│   ├── main.[hash].js
│   ├── vendor.[hash].js
│   └── [other chunks]
├── models/
│   └── *.glb
├── textures/
│   └── *.ktx2
├── audio/
│   └── *.ogg
└── draco/
    └── [decoder files]
```

## 15.2 Hosting Options

### Static Hosting (Client)
| Provider | Free Tier | Best For |
|----------|-----------|----------|
| Vercel | Unlimited deploys | Vite projects |
| Netlify | 100GB bandwidth | Easy setup |
| Cloudflare Pages | Unlimited | Global CDN |
| GitHub Pages | 1GB storage | Simple sites |

### Server Hosting (Multiplayer)
| Provider | Cost | Notes |
|----------|------|-------|
| Railway | $5/month | Easy, auto-scale |
| Render | Free tier | Sleeps when idle |
| Fly.io | Free tier | Edge computing |
| DigitalOcean | $5/month | Full control |

## 15.3 CDN & Caching

### Cache Headers
| Asset Type | Cache-Control |
|------------|---------------|
| HTML | no-cache |
| JS/CSS (hashed) | max-age=31536000, immutable |
| Models | max-age=31536000, immutable |
| Textures | max-age=31536000, immutable |
| Audio | max-age=31536000, immutable |

### Compression
```
Enable on server:
- gzip for all text (JS, CSS, HTML, JSON)
- brotli for better compression (if supported)

Pre-compress large assets:
- *.js.gz alongside *.js
- *.js.br alongside *.js
```

## 15.4 Production Monitoring

### Services
| Service | Purpose | Cost |
|---------|---------|------|
| UptimeRobot | Availability | Free |
| Sentry | Error tracking | Free tier |
| Plausible | Analytics | Privacy-friendly |
| LogRocket | Session replay | Debugging |

### Metrics to Track
```
- Load time (target: <5s on 4G)
- Time to interactive
- FPS average
- Error rate
- Player count
- Session duration
- Popular areas
```

---

# 16. QUICK REFERENCE TABLES

## Performance Budgets

| Metric | Target | Maximum |
|--------|--------|---------|
| Initial load | 5 MB | 8 MB |
| Total assets | 15 MB | 25 MB |
| Frame time | 16ms | 25ms |
| Draw calls | 50 | 150 |
| Triangles | 75k | 150k |
| JS bundle | 200 KB | 400 KB |
| Memory | 150 MB | 300 MB |

## Quality Presets Summary

| Setting | Low | Medium | High |
|---------|-----|--------|------|
| Resolution | 1x | 1.5x | 2x |
| Shadows | Off | 1024 | 2048 |
| Post-FX | None | Outline | Full |
| LOD bias | 2 | 1 | 0 |
| Particles | 25% | 50% | 100% |
| Draw dist | 150 | 300 | 500 |

## Network Message Frequency

| Message | Frequency | Size |
|---------|-----------|------|
| Position | 20/sec | 30 bytes |
| Animation | On change | 10 bytes |
| Emoji | On event | 15 bytes |
| Customize | On event | 50 bytes |

## Compression Results

| Format | Before | After | Savings |
|--------|--------|-------|---------|
| Draco mesh | 10 MB | 3 MB | 70% |
| KTX2 texture | 5 MB | 2 MB | 60% |
| GZIP transfer | 5 MB | 3.5 MB | 30% |

---

**Document Version:** 1.0  
**Last Updated:** January 2026  
**Purpose:** Complete technical reference for Messenger-style game implementation
