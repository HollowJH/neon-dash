# Technical Documentation

## Architecture Overview

The project is structured as a React application with canvas-based game rendering.

```
src/
├── components/         # React components
│   ├── Editor/        # Level editor UI
│   ├── Game/          # Game canvas and HUD
│   └── LevelSelect/   # Level selection menu
├── game/              # Game engine
│   ├── PlayerController.ts   # Physics and input
│   ├── ParticleSystem.ts     # Particle effects
│   └── ScreenShake.ts        # Camera shake
├── hooks/             # Custom React hooks
├── utils/             # Rendering and collision
├── data/              # Demo level definitions
└── types/             # TypeScript types
```

## Physics System

### Core Mechanics

The platformer uses fixed-timestep physics with the following features:

**Coyote Time** (8 frames): Players can still jump for a brief period after leaving a platform. This makes jumps feel more forgiving.

**Jump Buffering** (8 frames): Jump inputs are remembered briefly, so pressing jump slightly before landing still triggers a jump.

**Variable Jump Height**: Releasing the jump button early reduces upward velocity, giving players fine control over jump height.

### Dash Mechanic

- Duration: 150ms
- Speed: 600 px/s (vs. normal 300 px/s)
- Cooldown: 500ms
- Gravity applies during dash (creates arc trajectory)
- No hazard immunity (skill-based)

### Wall Jump

- Slide speed: 100 px/s (reduced from gravity)
- Jump boost: 400 px/s horizontal, 500 px/s vertical
- Stick time: 100ms grace period

## Particle System

The particle system uses object pooling-like management for performance:

```typescript
class Particle {
  update(deltaTime): boolean  // Returns false when dead
  render(ctx): void
}

class ParticleEmitter {
  emit(config): void        // Single particle
  emitBurst(...): void      // Multiple particles
  update(deltaTime): void
  render(ctx): void
}
```

### Effect Types

| Effect | Trigger | Particles |
|--------|---------|-----------|
| Landing Dust | On ground landing | 3-5 gray puffs |
| Jump Particles | On jump | 4 blue sparks |
| Dash Trail | During dash | Continuous cyan/magenta |
| Death Explosion | On hazard hit | 15 red burst |
| Goal Sparkles | Near goal tile | Continuous gold |

## Accessibility

### Color Contrast

All game elements meet WCAG AA contrast ratios against the dark background:

| Element | Color | Contrast Ratio |
|---------|-------|----------------|
| Platform | #4a5568 | 4.9:1 |
| Hazard | #c53030 | 4.2:1 |
| Spawn | #2f855a | 4.6:1 |
| Goal | #b7791f | 5.2:1 |
| Player | #4299e1 | 5.8:1 |

### "Neon Glow, Solid Core" Approach

Glow effects are purely decorative. The solid core colors carry all gameplay information, ensuring players with visual sensitivities or color blindness can still play effectively.

### Reduced Motion

All animations and transitions respect the `prefers-reduced-motion` media query (implemented in CSS).

## Level Design Philosophy

The 5 demo levels follow a tutorial progression:

1. **First Steps**: Basic movement only
2. **Hazard Zone**: Introduces hazards
3. **Speed Burst**: Requires dash (with hint)
4. **Vertical Climb**: Requires wall jumps (with hint)
5. **Neon Gauntlet**: Combines all mechanics

Each level introduces ONE concept before requiring it, respecting the player's learning curve.
