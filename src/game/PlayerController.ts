import type { Level, PlayerState } from '../types/level';
import { PHYSICS, PLAYER } from '../utils/physics';
import { resolveCollisions } from '../utils/collision';
import { findSpawnPoint } from '../utils/storage';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean; // Was jump pressed this frame
  jumpReleased: boolean; // Was jump released this frame
}

export class PlayerController {
  public state: PlayerState;
  private level: Level;
  private tileSize: number;
  private jumpHeld: boolean = false;

  constructor(level: Level, tileSize: number) {
    this.level = level;
    this.tileSize = tileSize;
    this.state = this.createInitialState();
  }

  private createInitialState(): PlayerState {
    const spawn = findSpawnPoint(this.level);
    const spawnX = spawn ? spawn.x * this.tileSize + (this.tileSize - PLAYER.WIDTH) / 2 : 100;
    const spawnY = spawn ? spawn.y * this.tileSize + (this.tileSize - PLAYER.HEIGHT) : 100;

    return {
      position: { x: spawnX, y: spawnY },
      velocity: { x: 0, y: 0 },
      isGrounded: false,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
    };
  }

  respawn(): void {
    this.state = this.createInitialState();
    this.jumpHeld = false;
  }

  update(input: InputState): { hitHazard: boolean; reachedGoal: boolean } {
    const { position, velocity } = this.state;

    // Horizontal movement with acceleration
    let targetVelX = 0;
    if (input.left) targetVelX -= PHYSICS.MOVE_SPEED;
    if (input.right) targetVelX += PHYSICS.MOVE_SPEED;

    if (targetVelX !== 0) {
      velocity.x += (targetVelX - velocity.x) * PHYSICS.ACCELERATION;
    } else {
      velocity.x *= PHYSICS.FRICTION;
      if (Math.abs(velocity.x) < 0.1) velocity.x = 0;
    }

    // Update coyote time
    if (this.state.isGrounded) {
      this.state.coyoteTimer = PHYSICS.COYOTE_TIME;
    } else {
      this.state.coyoteTimer = Math.max(0, this.state.coyoteTimer - 1);
    }

    // Update jump buffer
    if (input.jumpPressed) {
      this.state.jumpBufferTimer = PHYSICS.JUMP_BUFFER;
    } else {
      this.state.jumpBufferTimer = Math.max(0, this.state.jumpBufferTimer - 1);
    }

    // Jump logic
    const canJump = this.state.coyoteTimer > 0;
    const wantsJump = this.state.jumpBufferTimer > 0;

    if (canJump && wantsJump) {
      velocity.y = PHYSICS.JUMP_FORCE;
      this.state.coyoteTimer = 0;
      this.state.jumpBufferTimer = 0;
      this.jumpHeld = true;
    }

    // Variable jump height - cut velocity when releasing jump early
    if (input.jumpReleased && this.jumpHeld && velocity.y < 0) {
      velocity.y *= PHYSICS.VARIABLE_JUMP_MULTIPLIER;
      this.jumpHeld = false;
    }

    if (this.state.isGrounded) {
      this.jumpHeld = false;
    }

    // Apply gravity
    velocity.y += PHYSICS.GRAVITY;
    velocity.y = Math.min(velocity.y, PHYSICS.MAX_FALL_SPEED);

    // Resolve collisions
    const result = resolveCollisions(
      this.level,
      position.x,
      position.y,
      velocity.x,
      velocity.y,
      this.tileSize
    );

    // Update state from collision result
    position.x = result.newX;
    position.y = result.newY;
    velocity.x = result.newVelX;
    velocity.y = result.newVelY;
    this.state.isGrounded = result.isGrounded;

    return {
      hitHazard: result.hitHazard,
      reachedGoal: result.reachedGoal,
    };
  }
}
