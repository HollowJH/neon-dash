# Explorable Weather World

## Overview
An interactive environment where players walk through a space that dynamically shifts between cozy pastoral sunshine and moody atmospheric storms. Demonstrates artistic vision, atmosphere creation, and environmental design.

## Portfolio Value
- **Shows:** Artistic range, atmosphere creation, environmental storytelling, visual polish
- **Differentiates from:** Your technical systems — this is purely experiential/artistic
- **Impression:** "They understand mood, not just mechanics"

---

## MVP Features (5-day target)

### Environment
- [ ] Explorable 2D side-view or top-down world (your choice)
- [ ] Background layers with parallax scrolling
- [ ] Ground/terrain with simple vegetation (grass, trees, flowers)
- [ ] Ambient elements (birds, butterflies in sun; leaves blowing in wind)

### Character
- [ ] Simple character sprite with walk animation
- [ ] Smooth movement with subtle acceleration
- [ ] Character responds to weather (slower in rain? coat appears?)

### Weather System
- [ ] **Sunny/Clear:**
  - Bright, warm color palette
  - Sun rays / god rays (subtle)
  - Butterflies, birds
  - Gentle ambient particles (pollen, floating seeds)

- [ ] **Rainy/Stormy:**
  - Darker, desaturated palette
  - Rain particles (proper falling angle, splash on ground)
  - Puddles with ripple effects
  - Occasional lightning flash + screen shake
  - Fog/mist layer

### Transitions
- [ ] Smooth interpolation between weather states (not instant)
- [ ] Color palette shifts gradually
- [ ] Particle systems fade in/out
- [ ] Clouds roll in before rain

### Controls
- [ ] Weather control UI (slider or buttons to change weather)
- [ ] Time-of-day slider (sunrise → noon → sunset → night)
- [ ] Or: Weather changes automatically over time as you explore

---

## Stretch Goals (Week 2)

### More Weather Types
- [ ] Snow (gentle falling, accumulation on ground)
- [ ] Fog (thick atmospheric, reduced visibility)
- [ ] Wind (affects trees, grass, particles)
- [ ] Thunderstorm (heavier rain, more lightning, darker)

### Seasons
- [ ] Spring (flowers blooming, light rain)
- [ ] Summer (bright sun, heat shimmer)
- [ ] Autumn (falling leaves, warm colors)
- [ ] Winter (snow, bare trees, muted colors)

### Audio
- [ ] Ambient soundscape per weather type
- [ ] Smooth audio crossfade during transitions
- [ ] Rain on surfaces, thunder rumbles, bird chirps

### Interactive Elements
- [ ] Campfire that flickers, provides warmth glow
- [ ] Shelter areas where rain doesn't reach
- [ ] Day/night cycle with lanterns that light up
- [ ] NPCs that react to weather (seek shelter, open umbrellas)

### Visual Polish
- [ ] Screen-space reflections in puddles
- [ ] Dynamic shadows based on sun/moon position
- [ ] Fireflies at dusk/night
- [ ] Stars appearing at night

---

## Technical Approach

### Stack
- **Framework:** React + TypeScript or vanilla Canvas
- **Rendering:** HTML5 Canvas with layered rendering
- **Particles:** Custom particle system or library like tsparticles
- **Tweening:** For smooth transitions (could use simple lerp)

### Architecture
```
src/
├── components/
│   ├── World/
│   │   ├── WorldCanvas.tsx      # Main game canvas
│   │   ├── ParallaxLayer.tsx    # Background layers
│   │   └── Terrain.tsx          # Ground, vegetation
│   ├── Weather/
│   │   ├── WeatherController.ts # Manages current weather state
│   │   ├── RainSystem.ts        # Rain particles
│   │   ├── SunSystem.ts         # Sun rays, warm particles
│   │   └── TransitionManager.ts # Smooth state transitions
│   ├── Character/
│   │   ├── Player.ts            # Movement, animation
│   │   └── Sprite.ts            # Sprite rendering
│   └── UI/
│       └── WeatherControls.tsx  # Slider/buttons for weather
├── systems/
│   ├── ParticleSystem.ts        # Generic particle emitter
│   ├── ColorPalette.ts          # Weather-based color schemes
│   └── TimeOfDay.ts             # Sun position, lighting
├── utils/
│   ├── lerp.ts                  # Interpolation helpers
│   └── random.ts                # Seeded random for particles
└── App.tsx
```

### Key Implementation Details

**Weather State Machine:**
```typescript
type WeatherState = 'sunny' | 'cloudy' | 'rainy' | 'stormy';

interface WeatherConfig {
  skyColor: string;
  ambientLight: number;
  rainIntensity: number;      // 0-1
  cloudCover: number;         // 0-1
  windStrength: number;       // affects particles
  particleTypes: string[];    // which ambient particles active
}
```

**Smooth Transitions:**
```typescript
// Lerp between weather configs over 3-5 seconds
function transitionWeather(from: WeatherConfig, to: WeatherConfig, progress: number) {
  return {
    skyColor: lerpColor(from.skyColor, to.skyColor, progress),
    ambientLight: lerp(from.ambientLight, to.ambientLight, progress),
    rainIntensity: lerp(from.rainIntensity, to.rainIntensity, progress),
    // ...etc
  };
}
```

**Parallax Layers:**
- 4-5 layers at different scroll speeds
- Far background (sky, distant mountains) — slowest
- Mid background (hills, far trees) — medium
- Near background (bushes, rocks) — faster
- Foreground (grass, flowers) — fastest or same as player
- Weather particles render between layers for depth

**Rain System:**
- Particles spawn at top of screen + random offset
- Fall at angle based on wind
- Splash particle on ground contact
- Puddles are static sprites with animated ripple overlay

---

## Success Criteria
1. Walking through the world feels peaceful and immersive
2. Weather transitions are smooth, not jarring
3. Each weather state has distinct visual identity
4. Parallax creates sense of depth
5. Someone watching says "ooh" during a transition

---

## Demo Script (for portfolio showcase)
1. "This is an explorable weather world — watch how the atmosphere shifts"
2. Walk through sunny environment, point out ambient details
3. Trigger weather change to rain
4. "Notice how the colors shift, rain has depth, puddles form"
5. Show lightning flash
6. "The mood completely changes — same space, different feeling"
7. Transition back to sun, show the smooth interpolation
