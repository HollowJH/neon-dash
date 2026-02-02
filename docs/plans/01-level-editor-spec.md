# Level Editor + Player

## Overview
A web-based platformer level editor that lets users design levels with drag-and-drop tools, then instantly play-test them. Demonstrates production/tooling mindset and full game development pipeline.

## Portfolio Value
- **Shows:** Production skills, tool development, UX thinking, game feel
- **Differentiates from:** Your maze game (top-down) — this is side-scrolling platformer
- **Impression:** "They can build tools, not just games"

---

## MVP Features (5-day target)

### Editor Mode
- [ ] Grid-based canvas for level layout
- [ ] Drag-and-drop tile palette:
  - Solid platforms (ground, floating)
  - Hazards (spikes, pits)
  - Player spawn point
  - Goal/exit point
- [ ] Click to place, right-click to erase
- [ ] Clear level button
- [ ] Save level to local storage
- [ ] Load level from local storage

### Play Mode
- [ ] One-click switch between Edit and Play
- [ ] Platformer character with tight controls:
  - Horizontal movement (acceleration/deceleration)
  - Jump with variable height (hold longer = higher)
  - Coyote time (brief jump grace period after leaving platform)
  - Jump buffering (queue jump input slightly before landing)
- [ ] Collision detection with placed tiles
- [ ] Death on hazard contact → respawn at spawn point
- [ ] Win condition on reaching goal

### UI/UX
- [ ] Clear visual distinction between Edit and Play modes
- [ ] Tile palette always visible in Edit mode
- [ ] Current tile selection highlighted
- [ ] Play/Edit toggle button prominent

---

## Stretch Goals (Week 2)

### Editor Enhancements
- [ ] Multiple tilesets/themes (grass, cave, industrial)
- [ ] Moving platforms (set waypoints)
- [ ] Enemy placement (basic patrol AI)
- [ ] Undo/redo functionality
- [ ] Grid snap toggle
- [ ] Zoom in/out

### Gameplay Enhancements
- [ ] Collectibles (coins, stars)
- [ ] Timer / speed-run mode
- [ ] Death counter
- [ ] Ghost replay of best run

### Sharing
- [ ] Export level as JSON/URL
- [ ] Import level from JSON/URL
- [ ] Gallery of pre-made example levels

---

## Technical Approach

### Stack
- **Framework:** React + TypeScript (leverage your fullstack experience)
- **Rendering:** HTML5 Canvas for game view
- **State:** React state or Zustand for editor state, separate game loop for play mode
- **Storage:** localStorage for save/load

### Architecture
```
src/
├── components/
│   ├── Editor/
│   │   ├── Canvas.tsx        # Main editor canvas
│   │   ├── TilePalette.tsx   # Tile selection sidebar
│   │   └── Toolbar.tsx       # Save/load/clear/play buttons
│   ├── Player/
│   │   ├── GameCanvas.tsx    # Play mode canvas
│   │   └── PlayerController.ts # Movement physics
│   └── UI/
│       └── ModeToggle.tsx    # Edit/Play switch
├── hooks/
│   ├── useEditorState.ts     # Level data, selected tile, etc.
│   └── useGameLoop.ts        # requestAnimationFrame game loop
├── types/
│   └── level.ts              # Level, Tile, Player types
├── utils/
│   ├── collision.ts          # AABB collision detection
│   ├── storage.ts            # localStorage helpers
│   └── physics.ts            # Gravity, movement constants
└── App.tsx
```

### Key Implementation Details

**Editor Grid:**
- Fixed grid size (e.g., 20x12 tiles)
- Each cell stores tile type (empty, platform, hazard, spawn, goal)
- Mouse position → grid coordinates conversion

**Platformer Physics:**
```typescript
// Constants to tune
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const COYOTE_TIME = 6; // frames
const JUMP_BUFFER = 6; // frames
```

**Collision:**
- AABB (Axis-Aligned Bounding Box) for all tiles
- Check each solid tile against player bounds
- Resolve collisions by pushing player out of overlap

---

## Success Criteria
1. Can place tiles and they stay where placed
2. Can switch to play mode and character spawns correctly
3. Character movement feels responsive and satisfying
4. Can complete a simple level (spawn → platforms → goal)
5. Saved levels persist across browser refresh

---

## Demo Script (for portfolio showcase)
1. "This is a platformer level editor I built"
2. Quickly place some platforms, add spikes, set spawn and goal
3. Click Play, navigate the level
4. Die to hazard, respawn, complete level
5. "Levels save to your browser, and the controls have coyote time and jump buffering for that polished game feel"
