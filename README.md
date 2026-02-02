# Wildcard

A platformer with a level editor. Built from scratch in React + Canvas, no game engine.

![gameplay demo](docs/media/gameplay.gif)

## what it is

A side-scrolling platformer where you can play through 5 levels or build your own. The movement has dash and wall jump mechanics, and there's a full level editor with save/load.

I wrote the physics engine myself - gravity, collision detection, the works. Wanted to understand how platformers actually feel good to play, so I implemented coyote time, jump buffering, and variable jump height (the stuff that makes Mario controls feel tight).

## try it

```bash
npm install
npm run dev
```

## controls

- **move**: WASD or arrow keys
- **jump**: space (hold longer = jump higher)
- **dash**: shift (covers ~3 tiles horizontally)
- **wall jump**: press into wall + space

on mobile: touch controls appear automatically

## the interesting bits

**physics that scale** - the game calculates tile size based on your screen, then scales all physics proportionally. gravity, jump force, player size - everything adjusts so the game feels identical on a phone or a 4k monitor.

**"neon glow, solid core"** - the glowy effects look cool but the actual gameplay colors pass WCAG AA contrast. you can turn off the glow and still see everything clearly.

**coyote time + jump buffering** - you get 8 frames of grace after walking off a ledge (can still jump), and 8 frames of input memory before landing. makes the controls feel forgiving without being floaty.

## architecture

```
src/
├── game/           # PlayerController, ParticleSystem, ScreenShake
├── components/     # React UI (Editor, Game canvas, Menus)
├── hooks/          # useResponsiveTileSize, useEditorState, useGameLoop
└── utils/          # collision.ts, physics.ts, rendering.ts
```

the game loop runs at 60fps in a requestAnimationFrame, separate from React's render cycle. input state lives in refs to avoid re-renders during gameplay.

## tech

- react 18 + typescript
- html5 canvas (no pixi, no phaser)
- vite
- zero runtime dependencies beyond react

## why i built this

portfolio project for game dev program applications. wanted something that shows i understand the fundamentals - not just "i can use unity" but "i know why coyote time exists and can implement it myself."
