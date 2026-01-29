# 3D Models Directory

Place your GLB/GLTF models here. The game automatically loads models and applies messenger.abeto.co-style toon shading.

## Directory Structure

```
assets/models/
├── characters/
│   ├── player.glb      # Main player character
│   └── npc-*.glb       # NPC characters
├── buildings/
│   ├── shop.glb        # 2-story storefront
│   ├── apartment.glb   # Multi-story residential
│   ├── tower.glb       # Tall building
│   └── cafe.glb        # Small restaurant
└── props/
    ├── streetlight.glb
    ├── tree.glb
    ├── mailbox.glb
    ├── bench.glb
    └── vending-machine.glb
```

## Model Requirements

### Characters
- **Poly count**: 3,000-5,000 triangles
- **Height**: Will be scaled to ~1.8m
- **Animations** (optional): idle, walk, run
- **Material naming**: Use descriptive names for automatic color mapping:
  - `skin`, `body`, `face`, `hand`, `arm`, `leg`
  - `hair`
  - `shirt`, `top`, `jacket`
  - `pants`, `skirt`, `bottom`
  - `shoe`, `foot`, `boot`
  - `bag`, `strap`

### Buildings
- **Poly count**: 2,000-6,000 triangles
- **Style**: Low-poly Japanese urban
- **Colors**: Cream/beige walls work best

### Props
- **Poly count**: 300-1,500 triangles
- **Style**: Low-poly, stylized

## Creating Models with Blender MCP

If you have Blender MCP server configured, you can create models using AI assistance:

1. **Install Blender MCP** (see BLENDER_MCP_SETUP.md)
2. **Start Blender** and enable the MCP addon
3. **Use Claude** to describe what you want to create
4. **Export** as GLB from Blender

Example prompt for Claude with Blender MCP:
> "Create a low-poly anime-style character with a large head, black hair, black shirt, red skirt, white socks, and yellow sneakers. The character should be about 1.8 meters tall with chibi proportions."

## Recommended Free Model Sources

1. **Kenney.nl** (CC0 License)
   - City Kit: https://kenney.nl/assets/city-kit-roads
   - Download and extract GLB files

2. **Poly.pizza** (Free)
   - https://poly.pizza
   - Search for low-poly buildings and props

3. **Mixamo** (Free with Adobe account)
   - https://mixamo.com
   - Download character with FBX format, then convert to GLB

4. **Sketchfab** (Various licenses)
   - https://sketchfab.com
   - Filter by "Downloadable" and low-poly style

## Converting Models

### FBX to GLB
```bash
npx gltf-transform optimize input.fbx output.glb
```

### Compress with Draco
```bash
npx gltf-transform optimize input.glb output.glb --compress draco
```

### Reduce poly count (if needed)
```bash
npx gltf-transform simplify input.glb output.glb --ratio 0.5
```

## Fallback Behavior

If a model file is not found, the game automatically uses procedural geometry:
- Characters: Anime-style mesh built from primitives
- Buildings: Box-based buildings with windows and details
- Props: Simple geometric shapes

This means you can gradually add models without breaking the game.
