# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An interactive 3D NYC street portfolio experience built with Three.js and Vite. Walk through stylized NYC streets where portfolio sections are interactive storefronts/buildings. Inspired by the [Messenger by Abeto](https://messenger.abeto.co/) 3D experience.

## Technology Stack

- **3D Engine**: Three.js (WebGL)
- **Physics/Collision**: three-mesh-bvh (BVH-based collision detection)
- **Animation**: GSAP
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: CSS with custom properties

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start dev server (runs on port 3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

## Architecture

### Project Structure

```
/
├── index.html              # Entry point
├── src/
│   ├── main.js             # App entry, scene setup
│   ├── World.js            # Main 3D scene orchestrator
│   ├── Player.js           # Character controller
│   ├── Camera.js           # Third-person camera
│   ├── InputManager.js     # Keyboard/touch input
│   ├── environment/
│   │   └── Street.js       # NYC street environment
│   ├── effects/
│   │   └── PostProcessing.js
│   ├── shaders/
│   │   ├── toon.js         # Cel-shading materials
│   │   └── sky.js          # Sky gradient shader
│   ├── stores/
│   │   └── gameStore.js    # Zustand state store
│   └── utils/
│       ├── loader.js       # Asset loading utilities
│       └── collision.js    # BVH collision helpers
├── styles/
│   └── main.css            # UI styles
├── public/
│   └── favicon.svg
├── assets/                  # 3D models, textures, audio (to be added)
├── vite.config.js
└── package.json
```

### Core Components

**World.js** - Main scene orchestrator
- Manages Three.js scene, renderer, and lighting
- Coordinates all world components
- Handles day/night transitions

**Player.js** - Character controller
- WASD/arrow key movement
- Collision detection with buildings/props
- Interaction with buildings (proximity detection)

**Camera.js** - Third-person camera
- Follows player with smooth interpolation
- Collision avoidance (doesn't clip through walls)

**Street.js** - Environment
- Creates NYC street geometry (streets, sidewalks, curbs)
- Places buildings at cardinal directions:
  - North: Projects Tower
  - East: Skills Brownstone
  - West: Music Record Shop
  - South: Contact Coffee Shop
- Adds street props (lights, hydrants, benches)

**gameStore.js** - Global state (Zustand)
- Player position
- Current building interaction
- Day/night mode
- Building content data

### Visual Style Reference

From `branches-visual-quality-plan.md`:
- **Cel-shading**: 4-band lighting (highlight, light, mid, shadow)
- **Shadow color**: `#4A4063` (purple undertone, never pure black)
- **Sky gradient**: `#87CEEB` (day) → `#1E3A5F` (night)
- **Rim lighting**: White `#FFFFFF`, intensity 0.4
- **Outlines**: 2px, color `#1A1A2E`
- **UI dark**: `#1A1A2E`, accent `#FFD54F`

### Controls

- **WASD / Arrow Keys**: Move
- **Shift**: Run
- **E**: Interact with buildings
- **N**: Toggle day/night
- **ESC**: Close modals

## Key Implementation Details

### Adding New Buildings

1. Add building data to `gameStore.js` buildings array
2. Create building geometry in `Street.js`
3. Add building to collision meshes

### Asset Loading

Use utilities in `src/utils/loader.js`:
```javascript
import { loadModel, loadTexture, loadAssets } from './utils/loader.js';

// Load single model
const model = await loadModel('/assets/models/building.glb');

// Load multiple assets with progress
const assets = await loadAssets([
  { url: '/assets/models/building.glb', type: 'model' },
  { url: '/assets/textures/brick.png', type: 'texture' },
], onProgress);
```

### Collision Detection

Uses three-mesh-bvh for efficient collision:
```javascript
import { buildBVH, sphereCollision } from './utils/collision.js';

// Build BVH for mesh
await buildBVH(mesh);

// Check collision
const hit = await sphereCollision(mesh, position, radius);
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load | < 3 MB |
| Frame Rate | 60 FPS desktop |
| Load Time (4G) | < 5 seconds |

## Reference Documents

- `/NYC-STREET-THEME-COMPLETE-PLAN.md` - Primary design spec
- `/messenger-game-complete-plan.md` - Technical reference
- `/branches-visual-quality-plan.md` - Visual quality details
- `/compression-quality-plan.md` - Asset optimization
- `/physics-reality-metrics-master-plan.md` - Physics implementation

## Deployment

Deploys to GitHub Pages via `gh-pages`:
```bash
npm run deploy
```

The `vite.config.js` sets the base URL to `/rohithilluri.github.io/`.
