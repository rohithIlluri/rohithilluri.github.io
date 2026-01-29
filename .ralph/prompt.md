# Ralph Loop Master Task - Messenger Clone Completion

Read CLAUDE.md for full architecture. This is a Messenger clone game (Three.js, Zustand, Vite).

## Master Task List - Complete ALL in order:

### 1. Character Customization UI (15% -> 100%)
- Create src/ui/CustomizationScreen.js with color pickers for hair, skin, clothes
- Show during gameState='customization' before gameplay starts
- Add style selectors with live 3D preview on the player mesh
- Apply changes via store.setPlayerAppearance()
- Add C key binding to reopen customization during gameplay
- Wire into UIManager.js and InputManager.js
- Match existing UI style: dark #1A1A2E background, accent #FFD54F

### 2. Audio System (0% -> 100%)
- Enable src/audio/AudioManager.js with user-gesture resume pattern (click/tap to unlock)
- Add procedural ambient music for day and night (use Web Audio API oscillators or simple tone sequences)
- Add footstep sounds synced to walk/run animation state
- Add interaction SFX (mail pickup ding, delivery chime, dialogue pop, coin jingle)
- Add M key mute toggle via InputManager
- Respect quality presets (disable audio processing on low preset)

### 3. Test Infrastructure (0% -> 50%+ coverage)
- Install vitest as dev dependency
- Create vitest.config.js
- Write tests for gameStore.js actions (inventory add/remove, quest accept/complete, dialogue start/end)
- Write tests for DialogueManager (start conversation, handle choice, execute effects)
- Write tests for QuestManager (accept quest, update progress, complete quest, check prerequisites)
- Write tests for MailSystem (pickup mail, deliver mail, calculate rewards)
- Write tests for InventoryManager (add/remove items, coin management, capacity)
- Add "test" script to package.json
- Target 50%+ coverage on src/stores/ and src/systems/

### 4. Mobile Touch Controls
- Add virtual joystick for movement (custom canvas-based overlay)
- Add tap-to-interact button replacing E key
- Add touch-friendly UI scaling (larger buttons, proper spacing)
- Detect touch device and auto-show touch controls
- Test in Chrome mobile emulator, maintain 30 FPS on low preset

### 5. Quest & Dialogue Expansion
- Add 4+ new quests to src/data/quests.js:
  - Timed delivery (deliver within countdown)
  - Multi-stop route (deliver to 3 NPCs in sequence)
  - Collection quest (find 3 special items)
  - Social quest (talk to 3 specific NPCs)
- Enrich NPC dialogue trees in src/data/dialogues.js with more branching paths
- Ensure every NPC can give at least one quest via dialogue
- Wire new quests through DialogueManager effects

### 6. Polish & Full Integration
- Ensure all UI components respond to store changes reactively
- Add smooth CSS transitions between game states
- Fix any bugs discovered during previous tasks
- Verify full gameplay loop end-to-end:
  customize character -> walk planet -> collect mail from mailbox -> deliver to NPC -> complete quest -> earn reward
- Run npm run build to verify production build succeeds with zero errors
- Update CLAUDE.md completion percentages to reflect new state

## Working Method
1. Run npm run dev to test changes in browser at localhost:3000
2. Check browser console for errors after each change
3. Use existing patterns: Zustand store actions, event emitters, toon materials, factory functions
4. Preserve visual style: cel-shading, #5A6B7A shadow color, #1A1A2E outlines, #FFD54F accent
5. Commit working checkpoints with descriptive conventional commit messages
6. After EACH major task, verify it works before moving to the next
7. If a task is already done from a previous iteration, skip to the next incomplete task

## Constraints
- Maintain 60 FPS desktop, 30 FPS mobile
- Keep initial load under 6 MB
- ES6 modules, class-based controllers
- Match existing code style throughout

## Completion Signal
When ALL 6 tasks are complete, verified, and the build passes:
<promise>ALL TASKS COMPLETE</promise>
