# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

A **Messenger clone** - a mail delivery game on a tiny planet inspired by [Messenger by Abeto](https://messenger.abeto.co/). Players walk around a spherical world, customize their character, deliver mail to NPCs, and see other players in real-time.

**This is NOT a portfolio** - it's a pure game clone for learning/fun.

## Technology Stack

- **3D Engine**: Three.js (WebGL)
- **Physics/Collision**: three-mesh-bvh (BVH-based collision detection)
- **Animation**: GSAP
- **Build Tool**: Vite
- **State Management**: Zustand
- **Multiplayer**: Socket.io (planned)

## Commands

```bash
npm install      # Install dependencies
npm run dev      # Start dev server (port 3000)
npm run build    # Build for production
npm run deploy   # Deploy to GitHub Pages
```

## Architecture

```
src/
├── main.js              # App entry
├── World.js             # Scene orchestrator
├── Player.js            # Character controller (spherical movement)
├── Camera.js            # Third-person camera
├── InputManager.js      # Keyboard/touch input
├── environment/
│   ├── TinyPlanet.js    # Spherical gravity system
│   ├── Planet.js        # Planet environment
│   └── Street.js        # Legacy (being replaced)
├── effects/
│   ├── PostProcessing.js
│   └── particles/
├── shaders/
│   ├── toon.js          # Cel-shading
│   ├── sky.js           # Sky gradient
│   ├── water.js         # Water shader
│   └── foliage.js       # Wind animation
├── stores/
│   └── gameStore.js     # Zustand state
└── utils/
    ├── loader.js        # Asset loading
    └── collision.js     # BVH collision
```

## Visual Style (Messenger-quality)

- **Cel-shading**: 4-band soft transitions
- **Shadow color**: `#4A4063` (purple, NEVER black)
- **Outlines**: 2px, color `#1A1A2E`
- **Rim lighting**: White `#FFFFFF`, intensity 0.4
- **Sky**: `#87CEEB` (day) → `#1E3A5F` (night)
- **UI**: Dark `#1A1A2E`, accent `#FFD54F`

## Controls

- **WASD / Arrows**: Move
- **Shift**: Run
- **E**: Interact with NPCs
- **N**: Toggle day/night

## Key Features (Target)

1. **Tiny Planet**: Spherical world, walk anywhere
2. **Character Customization**: Hair, outfit, accessories
3. **Mail Delivery**: NPC quests
4. **Multiplayer**: See other players, emoji reactions
5. **Visual Quality**: Match Messenger exactly

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load | < 6 MB |
| Frame Rate | 60 FPS desktop, 30 FPS mobile |
| Load Time (4G) | < 5 seconds |

## Reference

- **Live Reference**: https://messenger.abeto.co/
- **Screenshots**: `.playwright-mcp/messenger-*.png`
- **Plan**: `.ralph/prompt.md`
