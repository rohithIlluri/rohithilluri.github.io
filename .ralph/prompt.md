# Task: Messenger Clone - Visual Polish (Phase 2)

## COMPLETED (Previous Iterations)

✅ **Character Improvements (Player.js)**
- Added yellow messenger bag worn diagonally
- Anime-style larger eyes with white highlights
- Blue/teal shirt, dark navy pants
- Orange shoes, white visible socks
- Black messy hair with bangs

✅ **Sky Shader (sky.js)**
- Added procedural brush-stroke clouds using Simplex noise
- Fractal Brownian Motion for painterly cloud texture
- Cloud animation with drift and wispy edges
- Proper lighting based on sun position
- Clouds fade at night

✅ **Environment Details (Planet.js)**
- Added power lines between street light poles (catenary curves)
- Added bushes/shrubs near all buildings
- Proper sagging wire physics simulation

✅ **Ralph Config Fixed**
- DANGEROUSLY_SKIP_PERMISSIONS="true" for autonomous operation

✅ **Build Verified** - `npm run build` succeeds

---

## YOUR TASK: Continue Visual Polish

**You MUST write code. Do not just analyze - MAKE CHANGES.**

### Priority 1: Integrate Sky Update in World.js

The sky shader now has an `update(deltaTime)` method for cloud animation.
Find where the render loop is and call `sky.update(deltaTime)`.

Look in `src/World.js` for the animation/render loop.

### Priority 2: Improve Cel-Shading (toon.js)

Update `src/shaders/toon.js` to have softer band transitions:
- Use `smoothstep` instead of hard `step` for band transitions
- Adjust band thresholds for more Messenger-like look
- Shadow color should be purple `#4A4063`, never black

### Priority 3: Add More Environment Detail

Add to `src/environment/Planet.js`:
1. **Flower beds** near paths (clusters of 5-10 flowers)
2. **Bird bath or fountain** in central area
3. **Park benches** with more variation (some with backs, some without)

### Priority 4: Particle Enhancements

Look at particle systems (if any exist) or create:
1. **Floating leaves** - subtle autumn leaves drifting
2. **Fireflies** at night - small glowing dots
3. **Footstep dust** when player walks

---

## Files to Modify

```
src/World.js              - Call sky.update() in render loop
src/shaders/toon.js       - Softer cel-shading bands
src/environment/Planet.js - More environmental details
```

## Reference

- **Live**: https://messenger.abeto.co/
- **Screenshots**: `.playwright-mcp/messenger-*.png`

## Color Reference

```
Shadow: #4A4063 (purple, never black)
Highlight: multiply 1.15
Light: multiply 1.0
Mid: multiply 0.7
Shadow: multiply 0.45
```

---

## How to Proceed

1. **Read the target files** first
2. **Make the edits** - Write the code changes
3. **Verify build** - Run `npm run build`
4. **Test visually** - Run `npm run dev` and check browser

## Verification

After changes:
- [ ] Sky clouds animate (drift slowly)
- [ ] Cel-shading has softer transitions
- [ ] More environmental details visible
- [ ] Build succeeds with no errors

---

## IMPORTANT

- **DO write code** - Don't just describe what to do
- **DO edit files** - Use the Edit tool to make changes
- **DO verify** - Check that build passes after changes
- **Focus on visuals** - Make it LOOK like Messenger

When ALL visual improvements are complete and verified, output:
`<RALPH_TASK_COMPLETE>`
