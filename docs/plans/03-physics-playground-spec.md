# Physics Playground

## Overview
An interactive physics sandbox featuring a grappling hook, verlet ropes/chains, and stackable objects. Players can swing, build, and experiment with satisfying physics simulations.

## Portfolio Value
- **Shows:** Physics understanding, emergent gameplay, interactive fun
- **Differentiates from:** Your systems work — this is playful and tactile
- **Impression:** "They understand physics AND how to make it fun"

---

## MVP Features (5-day target)

### Grappling Hook
- [ ] Click anywhere to fire grappling hook
- [ ] Hook attaches to surfaces/anchor points
- [ ] Player swings on rope with momentum
- [ ] Release to launch with preserved velocity
- [ ] Rope has slight elasticity (feels good)
- [ ] Visual: rope line drawn to attach point

### Verlet Ropes/Chains
- [ ] Rope bridges connecting platforms
- [ ] Chains hanging from ceilings
- [ ] Player can grab and pull ropes
- [ ] Ropes react to player collision (push aside)
- [ ] Satisfying springy physics

### Stackable Objects
- [ ] Boxes of different sizes
- [ ] Click and drag to move objects
- [ ] Objects stack realistically
- [ ] Boxes topple when unbalanced
- [ ] Objects react to player/rope collision

### Environment
- [ ] Static platforms and walls
- [ ] Anchor points for grappling (visible markers)
- [ ] Ground plane
- [ ] Reset button to restore initial state

### Controls
- [ ] WASD/Arrows: Move player
- [ ] Mouse click: Fire grappling hook
- [ ] Mouse hold + drag: Grab objects
- [ ] Space: Release grappling hook
- [ ] R: Reset playground

---

## Stretch Goals (Week 2)

### More Physics Objects
- [ ] Balls (rolling physics)
- [ ] Planks (can create bridges)
- [ ] Weights (heavier, affects rope tension)
- [ ] Balloons (float upward, can lift things)

### Destruction
- [ ] Breakable boxes (shatter on high impact)
- [ ] Debris particles
- [ ] Chain breaking under too much force

### Challenges Mode
- [ ] Reach the goal using grappling hook
- [ ] Stack boxes to reach platform
- [ ] Swing across gap and land safely
- [ ] Build a bridge with limited objects
- [ ] Time trials

### Visual Polish
- [ ] Rope tension visualization (color/thickness)
- [ ] Motion blur on fast-moving objects
- [ ] Impact particles
- [ ] Screen shake on heavy landings
- [ ] Trail effect when swinging fast

### Advanced Grappling
- [ ] Multiple grapple points (web-slinging)
- [ ] Reel in/out rope length
- [ ] Grapple to moving objects

---

## Technical Approach

### Stack
- **Framework:** Vanilla TypeScript + Canvas (physics needs tight control)
- **Physics:** Custom verlet integration (no library dependency)
- **Rendering:** HTML5 Canvas with requestAnimationFrame

### Architecture
```
src/
├── physics/
│   ├── VerletPoint.ts        # Point with position, old position
│   ├── VerletConstraint.ts   # Distance constraint between points
│   ├── VerletRope.ts         # Chain of points with constraints
│   ├── RigidBody.ts          # Boxes, platforms
│   └── PhysicsWorld.ts       # Manages all physics objects, step()
├── entities/
│   ├── Player.ts             # Player with grapple ability
│   ├── GrapplingHook.ts      # Hook projectile + rope
│   ├── Box.ts                # Stackable box
│   ├── Rope.ts               # Decorative rope/chain
│   └── Platform.ts           # Static collision surface
├── systems/
│   ├── CollisionSystem.ts    # AABB + point-box collision
│   ├── InputSystem.ts        # Mouse, keyboard handling
│   └── RenderSystem.ts       # Draw everything
├── utils/
│   ├── vector.ts             # Vec2 math
│   └── math.ts               # Clamp, lerp, distance
├── Game.ts                   # Main game loop
└── main.ts                   # Entry point
```

### Key Implementation Details

**Verlet Integration:**
```typescript
class VerletPoint {
  position: Vec2;
  oldPosition: Vec2;
  acceleration: Vec2;
  pinned: boolean;  // If true, doesn't move

  update(dt: number) {
    if (this.pinned) return;

    const velocity = this.position.sub(this.oldPosition);
    this.oldPosition = this.position.clone();

    // Verlet integration: new_pos = pos + velocity + acceleration * dt^2
    this.position = this.position
      .add(velocity.mul(0.99))  // Damping
      .add(this.acceleration.mul(dt * dt));

    this.acceleration = new Vec2(0, 0);
  }

  applyForce(force: Vec2) {
    this.acceleration = this.acceleration.add(force);
  }
}
```

**Distance Constraint:**
```typescript
class VerletConstraint {
  pointA: VerletPoint;
  pointB: VerletPoint;
  restLength: number;
  stiffness: number;  // 0-1, how rigid

  satisfy() {
    const delta = this.pointB.position.sub(this.pointA.position);
    const distance = delta.length();
    const difference = this.restLength - distance;
    const percent = (difference / distance) * this.stiffness;
    const offset = delta.mul(percent * 0.5);

    if (!this.pointA.pinned) this.pointA.position = this.pointA.position.sub(offset);
    if (!this.pointB.pinned) this.pointB.position = this.pointB.position.add(offset);
  }
}
```

**Rope as Chain of Points:**
```typescript
class VerletRope {
  points: VerletPoint[];
  constraints: VerletConstraint[];

  constructor(start: Vec2, end: Vec2, segments: number) {
    // Create points along line
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const pos = start.lerp(end, t);
      this.points.push(new VerletPoint(pos));
    }
    // Pin first point
    this.points[0].pinned = true;

    // Create constraints between adjacent points
    for (let i = 0; i < segments; i++) {
      this.constraints.push(new VerletConstraint(
        this.points[i],
        this.points[i + 1],
        this.points[i].position.distanceTo(this.points[i + 1].position)
      ));
    }
  }
}
```

**Grappling Hook:**
- Fire: Create a point at click location, pinned
- Create verlet rope from player to hook point
- Player becomes the "end" of the rope (constraint to player position)
- Player velocity influenced by rope tension
- Release: Unpin, remove rope, player keeps momentum

**Box Stacking:**
- Boxes are AABB rigid bodies
- Collision detection between boxes
- Simple resolution: push boxes apart along shortest axis
- Gravity applied each frame
- Friction when resting on surface

---

## Success Criteria
1. Grappling hook feels satisfying to swing on
2. Ropes look and behave like ropes (smooth, not jittery)
3. Boxes stack and topple realistically
4. Player can interact with ropes (push them)
5. Releasing grapple launches player with momentum
6. Someone playing it just wants to keep swinging around

---

## Demo Script (for portfolio showcase)
1. "This is a physics playground with verlet integration"
2. Fire grappling hook, swing across gap
3. "The rope physics are custom — no library"
4. Show rope bridges, push them with player
5. Stack some boxes, knock them over
6. "Everything interacts — watch this" — swing into box tower
7. "All the physics feeds back into each other"
