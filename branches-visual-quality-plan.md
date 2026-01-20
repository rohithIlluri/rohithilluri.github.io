# BRANCHES PORTFOLIO: VISUAL QUALITY DETAILS PLAN
## Messenger-Inspired Visual Design Specifications

**Inspiration:** [Messenger by Abeto](https://messenger.abeto.co/)
**Related Projects:** [Summer Afternoon](https://summer-afternoon.vlucendo.com/)
**Studio Reference:** [Abeto - Crafted Interactive Experiences](https://abeto.co/)

---

# TABLE OF CONTENTS

1. [Art Direction & Visual Philosophy](#1-art-direction--visual-philosophy)
2. [Color System & Palettes](#2-color-system--palettes)
3. [Cel-Shading & Shader Specifications](#3-cel-shading--shader-specifications)
4. [Lighting System Design](#4-lighting-system-design)
5. [Post-Processing Effects Pipeline](#5-post-processing-effects-pipeline)
6. [Animation & Motion Design](#6-animation--motion-design)
7. [Particle Systems & VFX](#7-particle-systems--vfx)
8. [Typography & Iconography](#8-typography--iconography)
9. [UI/UX Visual Components](#9-uiux-visual-components)
10. [Environmental Visual Details](#10-environmental-visual-details)
11. [Character Visual Specifications](#11-character-visual-specifications)
12. [Visual Quality Presets](#12-visual-quality-presets)
13. [Implementation Priorities](#13-implementation-priorities)

---

# 1. ART DIRECTION & VISUAL PHILOSOPHY

## 1.1 Core Visual Pillars

| Pillar | Description | Implementation |
|--------|-------------|----------------|
| **Calm & Strange** | Dreamlike atmosphere between familiar and surreal | Soft colors, gentle movements, unexpected details |
| **Hand-Crafted Feel** | Not photorealistic, feels painted/illustrated | Cel-shading, limited color bands, visible brush strokes |
| **Intimate Scale** | Small world that feels alive and personal | High detail in close spaces, curved horizon, cozy zones |
| **Lo-Fi Aesthetic** | Nostalgic, warm, imperfect beauty | Grain effects, warm tones, analog-inspired UI |

## 1.2 Visual Reference Games

| Game | Borrowed Elements |
|------|-------------------|
| **Messenger (Abeto)** | Tiny planet, cel-shading, calm multiplayer |
| **Sable** | Line-art outlines, desert palette, exploration mood |
| **Wheel World** | Spherical world, stylized shading |
| **Journey** | Color storytelling, minimal UI, emotional atmosphere |
| **A Short Hike** | Cozy pixel-meets-3D, warm interactions |

## 1.3 Visual Mood Keywords

```
Primary:    Peaceful · Nostalgic · Dreamlike · Intimate
Secondary:  Curious · Playful · Warm · Gentle
Avoid:      Harsh · Aggressive · Clinical · Chaotic
```

---

# 2. COLOR SYSTEM & PALETTES

## 2.1 Master Color Palette

### Primary Environment Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Sky Dawn** | `#FFB6C1` | 255, 182, 193 | Dawn sky, warm highlights |
| **Sky Day** | `#87CEEB` | 135, 206, 235 | Daytime sky base |
| **Sky Dusk** | `#FF6B6B` | 255, 107, 107 | Sunset accents |
| **Sky Night** | `#1E3A5F` | 30, 58, 95 | Night sky deep |
| **Grass Light** | `#7CB342` | 124, 179, 66 | Sunlit foliage |
| **Grass Shadow** | `#558B2F` | 85, 139, 47 | Shaded foliage |
| **Water Shallow** | `#4FC3F7` | 79, 195, 247 | Coastal waters |
| **Water Deep** | `#0288D1` | 2, 136, 209 | Ocean depths |

### Architecture Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Building Warm** | `#FFCC80` | 255, 204, 128 | Sunlit walls |
| **Building Stone** | `#BCAAA4` | 188, 170, 164 | Stone surfaces |
| **Building Cool** | `#90A4AE` | 144, 164, 174 | Shaded walls |
| **Wood Light** | `#D7CCC8` | 215, 204, 200 | Light wood |
| **Wood Dark** | `#8D6E63` | 141, 110, 99 | Dark wood accents |
| **Roof Terracotta** | `#E57373` | 229, 115, 115 | Clay roofs |

### Accent & UI Colors
| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| **Highlight Gold** | `#FFD54F` | 255, 213, 79 | Interactive highlights |
| **Accent Coral** | `#FF8A65` | 255, 138, 101 | Warm accents |
| **UI Background** | `#1A1A2E` | 26, 26, 46 | Dark UI panels |
| **UI Text** | `#FFFAF0` | 255, 250, 240 | Primary text |
| **UI Secondary** | `#B0BEC5` | 176, 190, 197 | Secondary text |

## 2.2 Shadow Color System

### Shadow Undertones (Not Pure Black!)
| Base Color Type | Shadow Tint | Hex |
|-----------------|-------------|-----|
| Warm surfaces | Purple-blue undertone | `#4A4063` |
| Cool surfaces | Deep blue undertone | `#2D3A4D` |
| Foliage | Dark green-blue | `#1E3D32` |
| Skin tones | Warm purple | `#5D4157` |

### Shadow Intensity Bands
```
Band 1 (Lit):        100% base color
Band 2 (Half-lit):   75% base + 25% shadow
Band 3 (Shadow):     50% base + 50% shadow
Band 4 (Deep):       25% base + 75% shadow
```

## 2.3 Time-of-Day Color Shifts

### Dawn (0-15% cycle)
| Element | Color Shift |
|---------|-------------|
| Sky gradient | `#1E3A5F` → `#FFB6C1` → `#87CEEB` |
| Sun color | `#FFB347` (warm orange) |
| Ambient fill | `#B8860B` (golden brown) |
| Fog tint | `#FFE4E1` (misty rose) |
| Shadow color | `#6B5B7B` (purple-gray) |

### Day (15-50% cycle)
| Element | Color |
|---------|-------|
| Sky zenith | `#1E90FF` |
| Sky horizon | `#87CEEB` |
| Sun color | `#FFFAF0` (warm white) |
| Ambient fill | `#87CEEB` (sky blue) |
| Shadow color | `#4A5568` (cool gray) |

### Dusk (50-65% cycle)
| Element | Color Shift |
|---------|-------------|
| Sky gradient | `#87CEEB` → `#FF6B6B` → `#4A0E4E` |
| Sun color | `#FF4500` (orange-red) |
| Ambient fill | `#8B4513` (saddle brown) |
| Shadow color | `#3D2645` (deep purple) |

### Night (65-100% cycle)
| Element | Color |
|---------|-------|
| Sky | `#0D1B2A` → `#1B263B` |
| Moon color | `#E8E8FF` (pale blue-white) |
| Ambient fill | `#191970` (midnight blue) |
| Shadow color | `#0A0A14` (near-black blue) |
| Star twinkle | `#FFFACD` (lemon chiffon) |

---

# 3. CEL-SHADING & SHADER SPECIFICATIONS

## 3.1 Toon Shader Core Algorithm

### Band Calculation Method
```glsl
// VERTEX SHADER OUTPUTS
varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vWorldPosition;

// FRAGMENT SHADER - BAND CALCULATION
float NdotL = dot(normalize(vNormal), lightDirection);

// 4-Band Cel Shading with soft transitions
float band1 = smoothstep(0.85, 0.95, NdotL);  // Highlight
float band2 = smoothstep(0.45, 0.55, NdotL);  // Light
float band3 = smoothstep(0.15, 0.25, NdotL);  // Mid
float band4 = smoothstep(-0.1, 0.05, NdotL);  // Shadow edge

vec3 finalColor = mix(deepShadowColor, shadowColor, band4);
finalColor = mix(finalColor, midtoneColor, band3);
finalColor = mix(finalColor, baseColor, band2);
finalColor = mix(finalColor, highlightColor, band1);
```

### Band Threshold Configuration
| Band | Threshold (Hard) | Threshold (Soft) | Color Multiplier |
|------|------------------|------------------|------------------|
| Highlight | `NdotL > 0.9` | `smoothstep(0.85, 0.95)` | `1.15` |
| Light | `0.5 < NdotL ≤ 0.9` | `smoothstep(0.45, 0.55)` | `1.0` |
| Mid-tone | `0.2 < NdotL ≤ 0.5` | `smoothstep(0.15, 0.25)` | `0.7` |
| Shadow | `0.0 < NdotL ≤ 0.2` | `smoothstep(-0.1, 0.05)` | `0.45` |
| Deep Shadow | `NdotL ≤ 0.0` | N/A | `0.25` |

## 3.2 Rim Lighting Specifications

### Fresnel Rim Effect
```glsl
// Rim lighting calculation
vec3 viewDir = normalize(cameraPosition - vWorldPosition);
float fresnel = 1.0 - max(0.0, dot(viewDir, vNormal));

// Stylized rim with hard edge
float rim = smoothstep(0.55, 0.7, fresnel);

// Only show rim in lit areas (optional)
rim *= smoothstep(0.0, 0.2, NdotL);

// Apply rim color
vec3 rimContribution = rimColor * rim * rimIntensity;
finalColor += rimContribution;
```

### Rim Parameters by Object Type
| Object Type | Rim Color | Intensity | Edge Start | Edge End |
|-------------|-----------|-----------|------------|----------|
| Characters | `#FFFFFF` | `0.5` | `0.55` | `0.7` |
| Buildings | `#FFE4B5` | `0.3` | `0.6` | `0.75` |
| Foliage | `#90EE90` | `0.4` | `0.5` | `0.65` |
| Props | `#FFFAF0` | `0.25` | `0.6` | `0.8` |

## 3.3 Outline Rendering System

### Method A: Inverted Hull (Per-Object)
```
Pass 1: Normal scene render
Pass 2: For each outlined object:
  - Vertex: position += normal * outlineWidth
  - Front-face culling ON (show back faces only)
  - Depth write: slightly offset backward
  - Color: solid outline color
```

| Parameter | Character | Environment | Props |
|-----------|-----------|-------------|-------|
| Width | `0.025` | `0.015` | `0.02` |
| Color | `#1A1A2E` | `#2D2D44` | `#1A1A2E` |
| Depth Offset | `0.00001` | `0.00002` | `0.00001` |

### Method B: Post-Process Edge Detection
```
Input buffers: Color, Depth, Normal

Edge detection kernel (Sobel):
  Depth edges:   threshold 0.001
  Normal edges:  threshold 0.5
  Color edges:   threshold 0.3 (optional)

Output: Combined edge mask
Composite: Overlay edges on final image
```

| Parameter | Value | Notes |
|-----------|-------|-------|
| Line Width | `1.5px` at 1080p | Scale with resolution |
| Line Color | `#1A1A2E` | Slight blue undertone |
| Depth Threshold | `0.0008` | Sensitivity to depth changes |
| Normal Threshold | `0.45` | Sensitivity to surface angles |

### Hybrid Approach (Recommended)
```
Characters/NPCs:     Inverted hull (consistent silhouette)
Environment:         Post-process (catches all edges)
UI/Interaction:      Neither (clean look)
```

## 3.4 Special Material Shaders

### Water Shader
```glsl
// Animated wave displacement
float wave = sin(worldPos.x * 2.0 + time * 0.8) *
             cos(worldPos.z * 1.5 + time * 0.6) * 0.1;

// Fresnel transparency
float waterFresnel = pow(1.0 - dot(viewDir, normal), 2.0);
float alpha = mix(0.4, 0.95, waterFresnel);

// Depth-based color gradient
vec3 waterColor = mix(shallowColor, deepColor, depth);

// Foam at edges (depth-based)
float foam = smoothstep(0.0, 0.3, 1.0 - depth);
waterColor = mix(waterColor, foamColor, foam * 0.7);
```

| Parameter | Value |
|-----------|-------|
| Wave Speed | `0.8` units/sec |
| Wave Scale | `2.0` X, `1.5` Z |
| Wave Height | `0.1` units |
| Shallow Color | `#4FC3F7` |
| Deep Color | `#0288D1` |
| Foam Color | `#FFFFFF` |
| Min Alpha | `0.4` |
| Max Alpha | `0.95` |

### Foliage/Vegetation Shader
```glsl
// Wind sway using world position
float wind = sin(worldPos.x * 0.5 + time * 2.0) *
             sin(worldPos.z * 0.3 + time * 1.5);

// Apply only to upper vertices (using vertex color or UV)
float swayMask = vertexPosition.y / maxHeight;
vec3 offset = vec3(wind * swayMask * windStrength, 0.0, wind * swayMask * 0.5);

// Subsurface scattering approximation
float sss = max(0.0, dot(-lightDir, viewDir)) * thickness;
vec3 sssColor = baseColor * sssIntensity * sss;
```

| Parameter | Value |
|-----------|-------|
| Wind Strength | `0.15` |
| Wind Speed X | `2.0` |
| Wind Speed Z | `1.5` |
| SSS Color | `#90EE90` |
| SSS Intensity | `0.3` |

### Stylized Sky Shader
```glsl
// Gradient based on view direction
float skyGradient = normalize(viewDir).y * 0.5 + 0.5;
vec3 skyColor = mix(horizonColor, zenithColor, pow(skyGradient, 1.5));

// Sun disc
float sunDist = distance(viewDir, sunDirection);
float sun = smoothstep(0.05, 0.03, sunDist);
float sunGlow = smoothstep(0.2, 0.05, sunDist) * 0.5;

// Cloud layer (optional)
vec2 cloudUV = worldPos.xz * 0.001 + time * 0.01;
float clouds = texture2D(noiseTexture, cloudUV).r;
clouds = smoothstep(0.4, 0.6, clouds) * cloudOpacity;

skyColor = mix(skyColor, sunColor, sun + sunGlow);
skyColor = mix(skyColor, cloudColor, clouds);
```

---

# 4. LIGHTING SYSTEM DESIGN

## 4.1 Three-Point Lighting Setup

### Primary Light (Sun/Moon)
| Property | Day Value | Night Value |
|----------|-----------|-------------|
| Type | DirectionalLight | DirectionalLight |
| Color | `#FFFAF0` | `#4169E1` |
| Intensity | `1.2` | `0.3` |
| Position | `(50, 100, 50)` | `(-30, 80, -40)` |
| Cast Shadows | `true` | `true` (moon shadows) |

### Fill Light (Sky/Ambient)
| Property | Value |
|----------|-------|
| Type | HemisphereLight |
| Sky Color | Matches sky gradient |
| Ground Color | `#8B7355` (earth tone) |
| Intensity | `0.6` |

### Ambient Base
| Property | Value |
|----------|-------|
| Type | AmbientLight |
| Color | `#6B7B8C` |
| Intensity | `0.35` |

## 4.2 Shadow Configuration

### Shadow Map Settings
| Setting | High Quality | Medium | Low/Mobile |
|---------|--------------|--------|------------|
| Map Size | `2048×2048` | `1024×1024` | `512×512` |
| Type | PCFSoftShadowMap | PCFShadowMap | BasicShadowMap |
| Bias | `-0.0001` | `-0.0002` | `-0.0003` |
| Normal Bias | `0.02` | `0.03` | `0.04` |
| Radius | `3` | `2` | `1` |

### Shadow Camera Frustum
```javascript
shadow.camera.left = -60;
shadow.camera.right = 60;
shadow.camera.top = 60;
shadow.camera.bottom = -60;
shadow.camera.near = 0.5;
shadow.camera.far = 200;
```

### Shadow Color (Not Black!)
```glsl
// In shadow areas, use tinted shadow color
vec3 shadowColor = vec3(0.29, 0.25, 0.39); // #4A4063 purple undertone
float shadowMix = shadow * 0.7; // Don't go full black
vec3 finalShadow = mix(vec3(1.0), shadowColor, shadowMix);
```

## 4.3 Zone-Specific Lighting

### Town Zone
| Light | Color | Intensity | Purpose |
|-------|-------|-----------|---------|
| Main sun | `#FFFAF0` | `1.2` | Primary |
| Window glow | `#FFE4B5` | `0.5` | Warmth from buildings |
| Street lamp | `#FFF8DC` | `0.3` | Night accent |

### Forest Zone
| Light | Color | Intensity | Purpose |
|-------|-------|-----------|---------|
| Filtered sun | `#F0FFF0` | `0.9` | Through canopy |
| Ambient green | `#228B22` | `0.3` | Foliage bounce |
| Firefly | `#FFFF00` | `0.1` | Night accent |

### Beach Zone
| Light | Color | Intensity | Purpose |
|-------|-------|-----------|---------|
| Bright sun | `#FFFFF0` | `1.4` | Open sky |
| Water reflect | `#87CEEB` | `0.4` | Ocean bounce |
| Lighthouse | `#FFFFFF` | `0.6` | Night beacon |

### Mountain/Temple Zone
| Light | Color | Intensity | Purpose |
|-------|-------|-----------|---------|
| High sun | `#F5F5DC` | `1.1` | Altitude clarity |
| Snow reflect | `#F0FFFF` | `0.3` | Snow bounce |
| Torch | `#FF6347` | `0.4` | Temple warmth |

---

# 5. POST-PROCESSING EFFECTS PIPELINE

## 5.1 Effect Stack Order

```
Render Scene
    ↓
1. Outline Detection (if post-process method)
    ↓
2. Ambient Occlusion (SSAO - subtle)
    ↓
3. Bloom (subtle, warm)
    ↓
4. Color Grading / LUT
    ↓
5. Film Grain (subtle)
    ↓
6. Vignette (subtle)
    ↓
7. Anti-aliasing (FXAA)
    ↓
Final Output
```

## 5.2 Effect Specifications

### Outline Post-Process (if used)
| Parameter | Value |
|-----------|-------|
| Algorithm | Sobel edge detection |
| Depth Weight | `0.6` |
| Normal Weight | `0.4` |
| Line Width | `1.0` - `2.0` px |
| Line Color | `#1A1A2E` |
| Threshold | `0.15` |

### Ambient Occlusion (SSAO)
| Parameter | Value | Notes |
|-----------|-------|-------|
| Algorithm | SAO or HBAO | Not SSAO (too noisy) |
| Radius | `0.5` | World units |
| Intensity | `0.3` | Subtle, not harsh |
| Bias | `0.025` | Prevent self-occlusion |
| Color | `#4A4063` | Purple-tinted, not black |
| Blur Passes | `2` | Smooth result |

### Bloom
| Parameter | Value | Notes |
|-----------|-------|-------|
| Threshold | `0.85` | Only bright areas |
| Intensity | `0.15` | Subtle glow |
| Radius | `0.4` | Spread |
| Color Tint | `#FFF5E1` | Warm white |
| Levels | `5` | Quality |

### Color Grading
| Adjustment | Value | Purpose |
|------------|-------|---------|
| Saturation | `1.05` | Slightly vivid |
| Contrast | `1.02` | Subtle punch |
| Shadows Lift | `+0.02` | Not crushed |
| Highlights | `0.98` | Not blown |
| Color Temp | `+200K` | Warm shift |
| Tint | `+5 magenta` | Subtle warmth |

### Film Grain
| Parameter | Value | Notes |
|-----------|-------|-------|
| Intensity | `0.03` | Barely visible |
| Size | `1.5` | Grain size |
| Animated | `true` | Changes per frame |
| Luminance Only | `true` | No color noise |

### Vignette
| Parameter | Value |
|-----------|-------|
| Intensity | `0.15` |
| Smoothness | `0.4` |
| Roundness | `0.85` |
| Color | `#1A1A2E` |

### Anti-Aliasing
| Preset | Method | Notes |
|--------|--------|-------|
| High | TAA | Best quality, slight blur |
| Medium | FXAA | Good balance |
| Low | None | Performance priority |

## 5.3 Quality Preset Post-Processing

| Effect | High | Medium | Low |
|--------|------|--------|-----|
| Outlines | Post-process | Inverted hull only | Inverted hull only |
| SSAO | On (full) | On (half res) | Off |
| Bloom | On | On (reduced) | Off |
| Color Grading | On | On | On |
| Film Grain | On | Off | Off |
| Vignette | On | On | Off |
| AA | TAA | FXAA | None |

---

# 6. ANIMATION & MOTION DESIGN

## 6.1 Animation Timing Principles

### Easing Functions
| Motion Type | Easing | CSS/GSAP Equivalent |
|-------------|--------|---------------------|
| UI appear | `easeOutQuart` | `power4.out` |
| UI disappear | `easeInQuart` | `power4.in` |
| Camera movement | `easeInOutQuad` | `power2.inOut` |
| Character settle | `easeOutBack` | `back.out(1.2)` |
| Bounce | `easeOutElastic` | `elastic.out(1, 0.5)` |
| Smooth follow | `linear` with lerp | `none` + custom |

### Duration Guidelines
| Animation Type | Duration | Notes |
|----------------|----------|-------|
| Micro-interaction | `100-200ms` | Button hover, toggle |
| UI transition | `250-400ms` | Panel slide, fade |
| Camera cut | `500-800ms` | Scene transition |
| Character action | `200-600ms` | Jump, emote |
| Environmental | `1000-3000ms` | Day/night, weather |

## 6.2 Character Animation Specifications

### Idle Animation
| Property | Value |
|----------|-------|
| Duration | `3.0s` loop |
| Breathing frequency | `0.3 Hz` |
| Subtle sway | `±2°` rotation |
| Blink interval | `3-5s` random |
| Head look | Occasional, `15°` max |

### Walk Animation
| Property | Value |
|----------|-------|
| Cycle duration | `0.8s` |
| Footfall timing | `0.0s`, `0.4s` |
| Bounce height | `0.05` units |
| Arm swing | `±30°` |
| Hip rotation | `±5°` |

### Run Animation
| Property | Value |
|----------|-------|
| Cycle duration | `0.5s` |
| Footfall timing | `0.0s`, `0.25s` |
| Bounce height | `0.1` units |
| Forward lean | `10°` |
| Arm pump | `±45°` |

### Jump Animation
| Phase | Duration | Description |
|-------|----------|-------------|
| Anticipation | `0.1s` | Crouch down |
| Launch | `0.1s` | Extend upward |
| Air (up) | Variable | Arms up, legs tucked |
| Air (down) | Variable | Prepare for landing |
| Land | `0.15s` | Absorb impact |
| Recovery | `0.1s` | Return to idle/walk |

### Transition Blend Times
| From → To | Blend Time |
|-----------|------------|
| Idle → Walk | `0.2s` |
| Walk → Run | `0.15s` |
| Run → Walk | `0.2s` |
| Walk → Idle | `0.25s` |
| Any → Jump | `0.1s` |
| Jump → Any | `0.2s` |

## 6.3 Camera Animation

### Follow Camera
```javascript
// Smooth follow with variable speeds
const positionLerp = 5.0; // Fast enough to keep up
const rotationLerp = 8.0; // Slightly faster for responsiveness
const zoomLerp = 10.0;    // Quick zoom response

// Per-frame update
camera.position.lerp(targetPosition, positionLerp * deltaTime);
camera.quaternion.slerp(targetQuaternion, rotationLerp * deltaTime);
```

### Camera Collision Response
| Situation | Response Speed |
|-----------|----------------|
| Pulling in (obstacle) | `15.0` lerp |
| Pushing out (clear) | `3.0` lerp |
| Snapping (teleport) | Instant if >5 units |

### Camera Shake (Subtle)
| Event | Intensity | Duration | Falloff |
|-------|-----------|----------|---------|
| Land (small) | `0.02` | `0.1s` | `easeOut` |
| Land (high) | `0.05` | `0.2s` | `easeOut` |
| Impact | `0.03` | `0.15s` | `easeOut` |

## 6.4 Environmental Animation

### Wind Effects
| Element | Animation |
|---------|-----------|
| Grass | Vertex sway, `sin(pos.x + time)` |
| Trees | Branch sway + leaf flutter |
| Cloth | Vertex noise displacement |
| Particles | Directional drift |

### Water Animation
| Effect | Method |
|--------|--------|
| Waves | Vertex displacement, dual sine waves |
| Ripples | Texture animation, `0.5s` loop |
| Foam | UV scroll + noise mask |
| Reflection | Distorted environment sample |

### Ambient Life
| Element | Behavior |
|---------|----------|
| Birds | Flock algorithm, occasional fly-by |
| Fish | School movement near water |
| Butterflies | Random paths, attracted to flowers |
| Fireflies | Night only, glow + bob |

---

# 7. PARTICLE SYSTEMS & VFX

## 7.1 Particle System Architecture

### Pooled Particle Manager
```javascript
// Pre-allocate particles to avoid garbage collection
const MAX_PARTICLES = 1000;
const particlePool = new Float32Array(MAX_PARTICLES * 7);
// [x, y, z, vx, vy, vz, life] per particle

// GPU instancing for rendering
const instancedMesh = new THREE.InstancedMesh(
  particleGeometry,
  particleMaterial,
  MAX_PARTICLES
);
```

## 7.2 Particle Effect Specifications

### Footstep Dust
| Parameter | Value |
|-----------|-------|
| Trigger | On footfall, ground type check |
| Count | `3-5` per step |
| Color | Match ground (grass green, sand tan, etc.) |
| Size | `0.05` → `0.15` units |
| Lifetime | `0.5s` |
| Velocity | Up `0.5`, outward `0.3` |
| Gravity | `-2.0` |
| Fade | Alpha `1.0` → `0.0` |

### Water Splash
| Parameter | Value |
|-----------|-------|
| Trigger | Enter/exit water |
| Count | `10-20` |
| Color | `#4FC3F7` (water) + `#FFFFFF` (foam) |
| Size | `0.08` → `0.02` |
| Lifetime | `0.8s` |
| Velocity | Up `3.0`, radial `1.5` |
| Gravity | `-8.0` |

### Leaf Fall (Ambient)
| Parameter | Value |
|-----------|-------|
| Spawn area | Forest zone, continuous |
| Count | `20-50` active |
| Color | `#7CB342`, `#FFA726`, `#8D6E63` |
| Size | `0.1` |
| Lifetime | `5-8s` |
| Velocity | Down `0.3`, wind-affected |
| Rotation | Tumble on all axes |
| Gravity | `-0.5` (slow drift) |

### Fireflies (Night)
| Parameter | Value |
|-----------|-------|
| Spawn area | Near foliage, night only |
| Count | `30-50` active |
| Color | `#FFFF00` |
| Size | `0.03` (point light glow) |
| Lifetime | `3-6s` per blink cycle |
| Movement | Random walk, `0.2` speed |
| Glow | Pulse `sin(time * 3)` |

### Emoji Display (Multiplayer)
| Parameter | Value |
|-----------|-------|
| Position | Above player head, `+2.0` Y |
| Size | `0.5` world units |
| Lifetime | `3.0s` |
| Animation | Scale in `0.2s`, hold, fade `0.5s` |
| Billboard | Always face camera |
| Bounce | Subtle bob `sin(time * 2) * 0.05` |

## 7.3 Weather Particle Systems

### Rain
| Parameter | Light | Heavy |
|-----------|-------|-------|
| Count | `500` | `2000` |
| Color | `#A4C2F4` | `#7B9DC9` |
| Size | `0.02 × 0.3` (stretched) | `0.03 × 0.5` |
| Speed | `15` down | `25` down |
| Splash on hit | Yes | Yes + ripples |
| Audio | Soft patter | Loud rain |

### Snow (if applicable)
| Parameter | Value |
|-----------|-------|
| Count | `1000` |
| Color | `#FFFFFF` |
| Size | `0.03-0.08` (varied) |
| Speed | `1.0` down, `0.5` drift |
| Rotation | Slow tumble |
| Accumulation | Vertex color blend on surfaces |

## 7.4 VFX Performance Budget

| Quality | Max Particles | Max Emitters | Update Rate |
|---------|---------------|--------------|-------------|
| High | `2000` | `50` | Every frame |
| Medium | `1000` | `30` | Every frame |
| Low | `300` | `15` | Every 2 frames |

---

# 8. TYPOGRAPHY & ICONOGRAPHY

## 8.1 Font Stack

### Primary Font (UI Text)
| Property | Value |
|----------|-------|
| Family | `"Inter", "SF Pro", system-ui, sans-serif` |
| Weights | `400` (body), `500` (medium), `600` (semi-bold) |
| Fallback | System sans-serif |

### Display Font (Headers/Logo)
| Property | Value |
|----------|-------|
| Family | `"Plus Jakarta Sans", "Poppins", sans-serif` |
| Weights | `600`, `700` |
| Use | Zone names, titles, major headings |

### Monospace (Debug/Code)
| Property | Value |
|----------|-------|
| Family | `"JetBrains Mono", "Fira Code", monospace` |
| Weight | `400` |
| Use | Debug info, coordinates, stats |

## 8.2 Type Scale

### Mobile (< 768px)
| Level | Size | Line Height | Weight | Use |
|-------|------|-------------|--------|-----|
| H1 | `24px` | `1.2` | `700` | Zone titles |
| H2 | `20px` | `1.25` | `600` | Section heads |
| H3 | `16px` | `1.3` | `600` | Labels |
| Body | `14px` | `1.5` | `400` | Descriptions |
| Caption | `12px` | `1.4` | `400` | Secondary info |

### Desktop (≥ 768px)
| Level | Size | Line Height | Weight | Use |
|-------|------|-------------|--------|-----|
| H1 | `32px` | `1.15` | `700` | Zone titles |
| H2 | `24px` | `1.2` | `600` | Section heads |
| H3 | `18px` | `1.3` | `600` | Labels |
| Body | `16px` | `1.6` | `400` | Descriptions |
| Caption | `14px` | `1.4` | `400` | Secondary info |

## 8.3 Text Rendering in 3D

### World-Space Text (Zone Labels)
| Property | Value |
|----------|-------|
| Render method | SDF (Signed Distance Field) |
| Font texture | Pre-generated atlas |
| Outline | `2px` dark, `#1A1A2E` |
| Shadow | Soft drop, offset `(2, 2)` |
| Billboard | Always face camera |
| Scale | Constant screen size OR distance fade |

### Player Name Tags
| Property | Value |
|----------|-------|
| Max length | `16` characters |
| Font size | `14px` screen space |
| Background | Semi-transparent `#1A1A2E80` |
| Padding | `4px 8px` |
| Position | Above head, offset `+2.2` units |
| Visibility | Fade at `>30` units |

## 8.4 Icon System

### Icon Style Guidelines
| Property | Specification |
|----------|---------------|
| Style | Outlined, `2px` stroke |
| Corners | Rounded, `2px` radius |
| Grid | `24×24` base |
| Sizes | `16`, `24`, `32`, `48` px |
| Color | Monochrome, inherit text color |

### Core Icon Set
| Icon | Use | Notes |
|------|-----|-------|
| Joystick | Movement control | Mobile |
| Hand/Pointer | Interaction prompt | Universal |
| Speech bubble | Dialogue | NPC talk |
| Envelope | Quest item | Delivery |
| Star | Collectible | Hidden item |
| Gear | Settings | Menu |
| Volume | Audio control | Settings |
| Fullscreen | Display toggle | Settings |
| Users | Player count | HUD |

### Emoji Set (Multiplayer Communication)
```
Row 1: 👋 😊 😢 👍 ❤️
Row 2: 🎉 ❓ 👆 🏃 😴
```

---

# 9. UI/UX VISUAL COMPONENTS

## 9.1 Panel & Card Design

### Base Panel Style
```css
.panel {
  background: linear-gradient(
    135deg,
    rgba(26, 26, 46, 0.95) 0%,
    rgba(45, 45, 68, 0.90) 100%
  );
  border: 1px solid rgba(255, 250, 240, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### Panel Variants
| Variant | Background | Border | Use Case |
|---------|------------|--------|----------|
| Default | `#1A1A2E` 95% | `#FFFAF0` 10% | Menus, dialogs |
| Tooltip | `#2D2D44` 90% | `#FFFAF0` 15% | Hover info |
| Toast | `#1A1A2E` 85% | `#FFD54F` 30% | Notifications |
| Danger | `#1A1A2E` 95% | `#FF6B6B` 40% | Warnings |

## 9.2 Button Styles

### Primary Button
```css
.button-primary {
  background: linear-gradient(135deg, #FFD54F 0%, #FFCA28 100%);
  color: #1A1A2E;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 213, 79, 0.3);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(255, 213, 79, 0.4);
}

.button-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(255, 213, 79, 0.3);
}
```

### Secondary Button
```css
.button-secondary {
  background: transparent;
  color: #FFFAF0;
  border: 2px solid rgba(255, 250, 240, 0.3);
  border-radius: 8px;
  padding: 10px 22px;
  font-weight: 500;
  transition: all 0.15s ease;
}

.button-secondary:hover {
  border-color: rgba(255, 250, 240, 0.6);
  background: rgba(255, 250, 240, 0.05);
}
```

### Icon Button
```css
.button-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(26, 26, 46, 0.8);
  border: 1px solid rgba(255, 250, 240, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.button-icon:hover {
  background: rgba(45, 45, 68, 0.9);
  transform: scale(1.05);
}
```

## 9.3 Input & Slider Styles

### Slider Control
```css
.slider {
  -webkit-appearance: none;
  height: 6px;
  background: rgba(255, 250, 240, 0.2);
  border-radius: 3px;
}

.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  background: #FFD54F;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

.slider-track-fill {
  background: linear-gradient(90deg, #FFD54F, #FFCA28);
}
```

### Toggle Switch
```css
.toggle {
  width: 48px;
  height: 26px;
  background: rgba(255, 250, 240, 0.2);
  border-radius: 13px;
  position: relative;
  transition: background 0.2s ease;
}

.toggle.active {
  background: #FFD54F;
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  background: #FFFAF0;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle.active .toggle-thumb {
  transform: translateX(22px);
}
```

## 9.4 Loading & Progress

### Loading Spinner
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 250, 240, 0.2);
  border-top-color: #FFD54F;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Progress Bar
```css
.progress-bar {
  height: 8px;
  background: rgba(255, 250, 240, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FFD54F, #FF8A65);
  border-radius: 4px;
  transition: width 0.3s ease;
}
```

### Loading Screen
| Element | Position | Style |
|---------|----------|-------|
| Background | Full screen | Gradient `#1A1A2E` → `#2D2D44` |
| Logo | Center top | Animated gentle bob |
| Progress bar | Center | `60%` width, `8px` height |
| Loading text | Below bar | Fade animation, shows current asset |
| Tip text | Bottom | Rotates every `5s` |

## 9.5 HUD Elements

### Minimal HUD Layout
```
┌────────────────────────────────────────────────┐
│ [👥 3]                        [Zone Name]     │
│                                                │
│                                                │
│                 (game view)                    │
│                                                │
│                                                │
│                                         [😊]   │
│ [🕹️ Joystick]              [🅰️ Jump] [🅱️ Run]│
└────────────────────────────────────────────────┘
```

### Zone Name Display
| Property | Value |
|----------|-------|
| Font | Display, `24px` |
| Position | Top center |
| Animation | Fade in `0.5s`, hold `2s`, fade out `0.5s` |
| Background | `#1A1A2E` 60%, pill shape |
| Trigger | On zone boundary cross |

### Player Count Badge
| Property | Value |
|----------|-------|
| Position | Top left, `16px` margin |
| Size | `32px` height |
| Background | `#1A1A2E` 80% |
| Icon | Users icon |
| Text | Player count number |

## 9.6 Mobile Touch Controls

### Virtual Joystick
```css
.joystick-outer {
  width: 120px;
  height: 120px;
  background: rgba(255, 250, 240, 0.15);
  border: 2px solid rgba(255, 250, 240, 0.3);
  border-radius: 50%;
  position: fixed;
  bottom: 80px;
  left: 40px;
}

.joystick-inner {
  width: 50px;
  height: 50px;
  background: rgba(255, 250, 240, 0.4);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: background 0.1s ease;
}

.joystick-inner.active {
  background: rgba(255, 213, 79, 0.8);
}
```

### Action Buttons (Mobile)
```css
.action-button {
  width: 60px;
  height: 60px;
  background: rgba(255, 250, 240, 0.2);
  border: 2px solid rgba(255, 250, 240, 0.4);
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
  color: #FFFAF0;
}

.action-button.jump {
  position: fixed;
  bottom: 100px;
  right: 40px;
}

.action-button.interact {
  position: fixed;
  bottom: 180px;
  right: 40px;
}
```

---

# 10. ENVIRONMENTAL VISUAL DETAILS

## 10.1 World Curvature & Horizon

### Spherical World Parameters
| Parameter | Value |
|-----------|-------|
| Planet radius | `50` units |
| Visible curvature | Subtle but noticeable |
| Draw distance | `500` units (wraps around) |
| Fog start | `100` units |
| Fog end | `400` units |
| Fog color | Matches sky horizon |

### Horizon Effect
```glsl
// Subtle curve effect on far objects
float dist = length(worldPosition.xz - cameraPosition.xz);
float curve = dist * dist * 0.0001;
worldPosition.y -= curve;
```

## 10.2 Zone Visual Identities

### Town Zone
| Element | Visual Treatment |
|---------|------------------|
| Buildings | Warm pastels, terracotta roofs |
| Roads | Cobblestone texture, slight wear |
| Props | Wooden crates, flower pots, benches |
| Lighting | Warm window glow (evening) |
| Ambient | Distant chatter audio |

### Forest Zone
| Element | Visual Treatment |
|---------|------------------|
| Trees | Mix of green shades, varied heights |
| Ground | Grass with fallen leaves |
| Path | Dirt with root exposure |
| Props | Mushrooms, stumps, rocks |
| Lighting | Dappled through canopy |
| Ambient | Bird calls, rustling |

### Beach Zone
| Element | Visual Treatment |
|---------|------------------|
| Sand | Gradient tan to wet dark |
| Water | Animated waves, foam edge |
| Props | Shells, driftwood, rocks |
| Lighthouse | Beacon light sweep (night) |
| Lighting | Bright, high contrast |
| Ambient | Waves, seagulls |

### Mountain/Temple Zone
| Element | Visual Treatment |
|---------|------------------|
| Rocks | Gray with moss patches |
| Path | Stone steps, ancient look |
| Temple | Red accents, paper lanterns |
| Props | Torii gates, stone statues |
| Lighting | Dramatic shadows |
| Ambient | Wind, distant bells |

## 10.3 Prop Detail Levels

### LOD Configuration
| Distance | Detail Level | Description |
|----------|--------------|-------------|
| `0-15` | High | Full geometry, all textures |
| `15-40` | Medium | Reduced poly, combined textures |
| `40-80` | Low | Billboard/impostor |
| `80+` | Hidden | Culled |

### Texture Atlas Strategy
```
Environment atlas (2048×2048):
├── Buildings (512×512 region)
├── Props (512×512 region)
├── Foliage (512×512 region)
└── Ground (512×512 region)

Benefit: Single draw call for most environment
```

## 10.4 Detail Props & Scatter

### Auto-Scatter System
| Prop Type | Density | Placement |
|-----------|---------|-----------|
| Grass tufts | `2/m²` | Random on grass |
| Small rocks | `0.5/m²` | Random on paths |
| Flowers | `1/m²` | Clustered near buildings |
| Fallen leaves | `3/m²` | Forest floor |
| Shells | `1/m²` | Beach near water |

### Interactive Props
| Prop | Interaction | Visual Feedback |
|------|-------------|-----------------|
| Flowers | Walk through | Gentle sway |
| Tall grass | Walk through | Part and sway |
| Water | Enter | Splash particles |
| Butterflies | Approach | Fly away |

---

# 11. CHARACTER VISUAL SPECIFICATIONS

## 11.1 Player Character Design

### Proportions
| Measurement | Value | Notes |
|-------------|-------|-------|
| Height | `1.6` units | Relatable scale |
| Head ratio | `1:5` | Slightly stylized |
| Body type | Chibi-ish | Cute, approachable |
| Arms | Simplified | 2-3 joints |
| Legs | Simplified | 2 joints |

### Poly Budget
| Component | Triangles |
|-----------|-----------|
| Head | `800` |
| Body | `1500` |
| Arms | `400` |
| Legs | `600` |
| Accessories | `500` |
| **Total** | `~3800` |

## 11.2 Customization Options

### Color Customization
| Part | Options |
|------|---------|
| Hair | `12` colors (natural + fantasy) |
| Skin | `8` tones |
| Jacket | `16` colors |
| Pants | `16` colors |
| Shoes | `8` colors |

### Style Options
| Category | Variants |
|----------|----------|
| Hair style | `8` (short, long, etc.) |
| Jacket style | `4` (hoodie, coat, vest, t-shirt) |
| Pants style | `4` (jeans, shorts, skirt, overalls) |
| Accessory | `6` (hat, glasses, bag, etc.) |

### Unlockable Items
| Item | Unlock Method |
|------|---------------|
| Sailor hat | Complete 5 deliveries |
| Star glasses | Find all collectibles |
| Messenger bag | First delivery |
| Crown | Secret achievement |

## 11.3 NPC Visual Variety

### NPC Types
| Type | Visual Difference |
|------|-------------------|
| Townspeople | Casual clothes, varied |
| Shopkeepers | Aprons, themed |
| Quest givers | Distinct accessory (hat, badge) |
| Animals | Simplified, expressive |

### NPC Animation
| State | Animation |
|-------|-----------|
| Idle | Unique per character |
| Talking | Head nod, hand gesture |
| Working | Context-specific loop |
| React | Turn toward player |

## 11.4 Multiplayer Differentiation

### Other Player Rendering
| Aspect | Specification |
|--------|---------------|
| Same fidelity | Yes, same as local |
| Name tag | Above head, `14px` |
| Outline | Slightly thicker for visibility |
| Emoji | Billboard above head |

### Network Player Smoothing
```javascript
// Interpolate other players smoothly
const lerpFactor = 10.0; // Fast enough for responsiveness
otherPlayer.position.lerp(targetPosition, lerpFactor * deltaTime);
otherPlayer.quaternion.slerp(targetRotation, lerpFactor * deltaTime);
```

---

# 12. VISUAL QUALITY PRESETS

## 12.1 Preset Definitions

### Ultra/High (Desktop, Good GPU)
| Setting | Value |
|---------|-------|
| Resolution Scale | `2.0` (up to 4K) |
| Shadow Map | `2048×2048` |
| Shadow Type | PCFSoftShadowMap |
| SSAO | On (full resolution) |
| Bloom | On |
| Outlines | Post-process |
| Anti-aliasing | TAA |
| Draw Distance | `500` |
| LOD Bias | `0` |
| Particles | `100%` |
| Texture Quality | Full |

### Medium (Laptop, Integrated GPU)
| Setting | Value |
|---------|-------|
| Resolution Scale | `1.5` |
| Shadow Map | `1024×1024` |
| Shadow Type | PCFShadowMap |
| SSAO | On (half resolution) |
| Bloom | On (reduced) |
| Outlines | Inverted hull |
| Anti-aliasing | FXAA |
| Draw Distance | `300` |
| LOD Bias | `0.5` |
| Particles | `50%` |
| Texture Quality | Full |

### Low (Mobile, Old Hardware)
| Setting | Value |
|---------|-------|
| Resolution Scale | `1.0` |
| Shadow Map | `512×512` |
| Shadow Type | BasicShadowMap |
| SSAO | Off |
| Bloom | Off |
| Outlines | Inverted hull (thin) |
| Anti-aliasing | None |
| Draw Distance | `150` |
| LOD Bias | `1.0` |
| Particles | `25%` |
| Texture Quality | Reduced |

### Potato (Very Old/Weak Hardware)
| Setting | Value |
|---------|-------|
| Resolution Scale | `0.75` |
| Shadow Map | Off |
| SSAO | Off |
| Bloom | Off |
| Outlines | Off |
| Anti-aliasing | None |
| Draw Distance | `100` |
| LOD Bias | `2.0` |
| Particles | `10%` |
| Texture Quality | Low |

## 12.2 Auto-Detection Logic

```javascript
function detectQualityPreset() {
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;

  // Check for known high-end GPUs
  const highEndGPU = /RTX|Radeon RX [5-7]/i.test(renderer);
  const integratedGPU = /Intel|Integrated/i.test(renderer);

  if (isMobile) {
    return memory >= 6 ? 'medium' : 'low';
  }

  if (highEndGPU && cores >= 8) return 'ultra';
  if (!integratedGPU && cores >= 6) return 'high';
  if (cores >= 4) return 'medium';
  return 'low';
}
```

## 12.3 Dynamic Quality Adjustment

### FPS-Based Scaling
```javascript
const targetFPS = 60;
const fpsHistory = [];

function checkPerformance(currentFPS) {
  fpsHistory.push(currentFPS);
  if (fpsHistory.length > 60) fpsHistory.shift();

  const avgFPS = fpsHistory.reduce((a, b) => a + b) / fpsHistory.length;

  if (avgFPS < 30 && currentPreset !== 'potato') {
    decreaseQuality();
  } else if (avgFPS > 55 && currentPreset !== 'ultra') {
    // Only increase if stable for 5 seconds
    if (stableCounter++ > 300) {
      increaseQuality();
      stableCounter = 0;
    }
  } else {
    stableCounter = 0;
  }
}
```

---

# 13. IMPLEMENTATION PRIORITIES

## 13.1 Phase 1: Core Visuals (Foundation)

### Priority 1 - Must Have
- [ ] Basic cel-shading material
- [ ] 4-band lighting system
- [ ] Shadow rendering (configurable quality)
- [ ] Sky gradient shader
- [ ] Basic character rendering

### Priority 2 - Should Have
- [ ] Outline rendering (inverted hull)
- [ ] Rim lighting
- [ ] Basic water shader
- [ ] Fog system

## 13.2 Phase 2: Polish & Effects

### Priority 1 - Must Have
- [ ] Post-process outline (for environment)
- [ ] SSAO (optional, quality setting)
- [ ] Bloom (subtle)
- [ ] Color grading

### Priority 2 - Should Have
- [ ] Film grain (optional)
- [ ] Vignette
- [ ] Weather effects (rain/fog)

## 13.3 Phase 3: Detail & Atmosphere

### Priority 1 - Must Have
- [ ] Particle systems (footsteps, splash)
- [ ] Wind animation (foliage)
- [ ] Day/night cycle
- [ ] Zone-specific lighting

### Priority 2 - Should Have
- [ ] Ambient particles (fireflies, leaves)
- [ ] Enhanced water (foam, reflections)
- [ ] Character customization visuals
- [ ] Emoji display system

## 13.4 Phase 4: Optimization

### Priority 1 - Must Have
- [ ] Quality presets implementation
- [ ] LOD system
- [ ] Texture atlasing
- [ ] Draw call batching

### Priority 2 - Should Have
- [ ] Dynamic quality adjustment
- [ ] Memory management
- [ ] Mobile-specific optimizations

---

# QUICK REFERENCE

## Color Cheat Sheet
```
Sky:        #87CEEB (day), #FFB6C1 (dawn), #1E3A5F (night)
Grass:      #7CB342 (lit), #558B2F (shadow)
Water:      #4FC3F7 (shallow), #0288D1 (deep)
Buildings:  #FFCC80 (warm), #90A4AE (cool)
UI Dark:    #1A1A2E
UI Light:   #FFFAF0
Accent:     #FFD54F
Shadow:     #4A4063 (never pure black!)
```

## Shader Params Cheat Sheet
```
Cel bands:     4 bands, thresholds: 0.9, 0.5, 0.2, 0.0
Rim lighting:  color #FFFFFF, intensity 0.4, edge 0.55-0.7
Outline:       width 0.02, color #1A1A2E
```

## Animation Timing Cheat Sheet
```
UI hover:      150ms
UI transition: 300ms
Camera move:   500-800ms
Walk cycle:    800ms
Run cycle:     500ms
Jump total:    600ms
```

---

**Document Version:** 1.0
**Last Updated:** January 2026
**Purpose:** Complete visual specifications for Messenger-inspired portfolio

**Sources:**
- [Messenger by Abeto](https://messenger.abeto.co/)
- [Summer Afternoon by Vicente Lucendo](https://summer-afternoon.vlucendo.com/)
- [Abeto Studio](https://abeto.co/)
- [Custom Toon Shader Tutorial](https://www.maya-ndljk.com/blog/threejs-basic-toon-shader)
- [Three.js MeshToonMaterial](https://sbcode.net/threejs/meshtoonmaterial/)
- [Tildes Discussion](https://tildes.net/~games/1qf1/messenger_a_cute_little_3d_browser_game)
