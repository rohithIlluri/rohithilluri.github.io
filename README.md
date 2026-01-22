# Messenger Clone

A **mail delivery game on a tiny planet** inspired by [messenger.abeto.co](https://messenger.abeto.co/). Walk around a spherical world, deliver mail to NPCs, and enjoy the cozy cel-shaded aesthetic.

## Features

- **Tiny Planet**: Spherical world with gravity that always points toward the center
- **Cel-Shaded Graphics**: 4-band toon shading with soft blue-gray shadows (never pure black)
- **Procedural Characters**: Anime-styled characters with walking animations
- **NPCs with Patrol Routes**: 6 unique NPCs that walk around and react to the player
- **Day/Night Cycle**: Toggle between day and night with smooth lighting transitions
- **Particle Effects**: Leaves during the day, fireflies at night
- **Lo-Fi Audio**: Procedurally generated ambient music and sound effects

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| Shift | Run |
| E | Interact |
| N | Toggle Day/Night |

## Technology Stack

- **3D Engine**: Three.js (WebGL)
- **Physics/Collision**: three-mesh-bvh (BVH-based collision detection)
- **Animation**: GSAP
- **Build Tool**: Vite
- **State Management**: Zustand

## Architecture

```
src/
├── main.js              # App entry point
├── World.js             # Scene orchestrator
├── Player.js            # Character controller (spherical movement)
├── Camera.js            # Third-person camera
├── InputManager.js      # Keyboard/touch input
├── audio/
│   └── AudioManager.js  # Sound effects and music
├── constants/
│   └── colors.js        # Messenger-style color palette
├── effects/
│   ├── PostProcessing.js
│   └── particles/       # Leaf and firefly effects
├── entities/
│   ├── NPC.js           # NPC character logic
│   ├── NPCData.js       # NPC configuration
│   └── NPCManager.js    # NPC spawning/management
├── environment/
│   ├── TinyPlanet.js    # Spherical gravity system
│   └── Planet.js        # Planet environment
├── optimization/
│   └── LODManager.js    # Level of detail management
├── shaders/
│   ├── toon.js          # Cel-shading materials
│   └── sky.js           # Sky gradient shader
└── stores/
    └── gameStore.js     # Zustand state
```

## Visual Style

The visual style closely matches [messenger.abeto.co](https://messenger.abeto.co/):

- **Cel-shading**: 4-band discrete color transitions (no smooth gradients)
- **Shadows**: Blue-gray (#5A6B7A), never pure black
- **Outlines**: 2px, color #1A1A2E
- **Rim lighting**: White, intensity 0.3-0.4
- **Sky**: Turquoise day (#5BBFBA) to deep blue night (#1B2838)

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load | < 6 MB |
| Frame Rate | 60 FPS desktop, 30 FPS mobile |
| Load Time (4G) | < 5 seconds |

## Reference

- **Live Reference**: https://messenger.abeto.co/
- **Project Plan**: `.ralph/prompt.md`

## License

MIT
