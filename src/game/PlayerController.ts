import type { Level, PlayerState, TileType } from '../types/level';
import { PHYSICS, PLAYER } from '../utils/physics';
import { resolveCollisions } from '../utils/collision';
import { findSpawnPoint } from '../utils/storage';

// Dash constants
const DASH_DURATION = 150; // ms
const DASH_SPEED = 600; // pixels/sec
const DASH_COOLDOWN = 500; // ms

// Wall jump constants
const WALL_SLIDE_SPEED = 100; // pixels/sec
const WALL_JUMP_X_BOOST = 400; // pixels/sec
const WALL_JUMP_Y_BOOST = -500; // pixels/sec (negative = up)
const WALL_STICK_TIME = 100; // ms grace period

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpPressed: boolean; // Was jump pressed this frame
  jumpReleased: boolean; // Was jump released this frame
  dash: boolean;
  dashPressed: boolean;
}

interface DashState {
  isDashing: boolean;
  dashTime: number;
  dashDirection: 1 | -1;
  dashCooldown: number;
}

export class PlayerController {
  public state: PlayerState;
  private level: Level;
  private tileSize: number;
  private jumpHeld: boolean = false;
  private facingDirection: 1 | -1 = 1;

  private dashState: DashState = {
    isDashing: false,
    dashTime: 0,
    dashDirection: 1,
    dashCooldown: 0,
  };

  private wallState = {
    onWall: false,
    wallSide: null as 'left' | 'right' | null,
    wallStickTime: 0,
  };

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
    this.dashState = {
      isDashing: false,
      dashTime: 0,
      dashDirection: 1,
      dashCooldown: 0,
    };
    this.wallState = {
      onWall: false,
      wallSide: null,
      wallStickTime: 0,
    };
  }

  private getTileAt(x: number, y: number): TileType {
    if (x < 0 || x >= this.level.width || y < 0 || y >= this.level.height) {
      return 'platform'; // Treat boundaries as platforms
    }
    return this.level.tiles[y][x];
  }

  private checkWallCollision(): 'left' | 'right' | null {
    const { position } = this.state;
    const playerLeft = position.x;
    const playerRight = position.x + PLAYER.WIDTH;
    const playerTop = position.y;
    const playerBottom = position.y + PLAYER.HEIGHT;

    // Check tiles to the left and right
    const tileY1 = Math.floor(playerTop / this.tileSize);
    const tileY2 = Math.floor((playerBottom - 1) / this.tileSize);

    // Check left wall
    const leftTileX = Math.floor((playerLeft - 1) / this.tileSize);
    for (let ty = tileY1; ty <= tileY2; ty++) {
      if (this.getTileAt(leftTileX, ty) === 'platform') {
        return 'left';
      }
    }

    // Check right wall
    const rightTileX = Math.floor(playerRight / this.tileSize);
    for (let ty = tileY1; ty <= tileY2; ty++) {
      if (this.getTileAt(rightTileX, ty) === 'platform') {
        return 'right';
      }
    }

    return null;
  }

  private handleWallSlide(input: InputState, deltaTime: number): void {
    const wallSide = this.checkWallCollision();
    const isHoldingTowardWall =
      (wallSide === 'left' && input.left) ||
      (wallSide === 'right' && input.right);
    const isInAir = !this.state.isGrounded;

    if (wallSide && isHoldingTowardWall && isInAir && !this.dashState.isDashing) {
      this.wallState.onWall = true;
      this.wallState.wallSide = wallSide;
      this.wallState.wallStickTime = WALL_STICK_TIME;

      // Slow down fall speed
      if (this.state.velocity.y > WALL_SLIDE_SPEED) {
        this.state.velocity.y = WALL_SLIDE_SPEED;
      }
    } else if (this.wallState.wallStickTime > 0) {
      this.wallState.wallStickTime -= deltaTime;
    } else {
      this.wallState.onWall = false;
      this.wallState.wallSide = null;
    }
  }

  private handleWallJump(input: InputState): boolean {
    if (input.jumpPressed && this.wallState.onWall && this.wallState.wallSide) {
      const jumpDirection = this.wallState.wallSide === 'left' ? 1 : -1;
      this.state.velocity.x = WALL_JUMP_X_BOOST * jumpDirection;
      this.state.velocity.y = WALL_JUMP_Y_BOOST;
      this.facingDirection = jumpDirection;

      // Reset wall state
      this.wallState.onWall = false;
      this.wallState.wallSide = null;
      this.wallState.wallStickTime = 0;

      return true;
    }
    return false;
  }

  private handleDash(input: InputState, deltaTime: number): void {
    // Update cooldown
    if (this.dashState.dashCooldown > 0) {
      this.dashState.dashCooldown -= deltaTime;
    }

    // Start dash
    if (input.dashPressed && this.dashState.dashCooldown <= 0 && !this.dashState.isDashing) {
      this.dashState.isDashing = true;
      this.dashState.dashTime = DASH_DURATION;
      this.dashState.dashDirection = this.facingDirection;
      this.dashState.dashCooldown = DASH_COOLDOWN;

      // Set dash velocity
      this.state.velocity.x = DASH_SPEED * this.dashState.dashDirection;
    }

    // Update dash
    if (this.dashState.isDashing) {
      this.dashState.dashTime -= deltaTime;

      // Maintain dash speed (gravity still applies for curved trajectory)
      this.state.velocity.x = DASH_SPEED * this.dashState.dashDirection;

      if (this.dashState.dashTime <= 0) {
        this.dashState.isDashing = false;
      }
    }
  }

  get isDashing(): boolean {
    return this.dashState.isDashing;
  }

  get dashDirection(): 1 | -1 {
    return this.dashState.dashDirection;
  }

  get isOnWall(): boolean {
    return this.wallState.onWall;
  }

  get wallSide(): 'left' | 'right' | null {
    return this.wallState.wallSide;
  }

  update(input: InputState, deltaTime: number = 16): { hitHazard: boolean; reachedGoal: boolean } {
    const { position, velocity } = this.state;

    // Update facing direction
    if (input.left) this.facingDirection = -1;
    if (input.right) this.facingDirection = 1;

    // Handle dash
    this.handleDash(input, deltaTime);

    // Handle wall slide
    this.handleWallSlide(input, deltaTime);

    // Horizontal movement (skipped during dash)
    if (!this.dashState.isDashing) {
      let targetVelX = 0;
      if (input.left) targetVelX -= PHYSICS.MOVE_SPEED;
      if (input.right) targetVelX += PHYSICS.MOVE_SPEED;

      if (targetVelX !== 0) {
        velocity.x += (targetVelX - velocity.x) * PHYSICS.ACCELERATION;
      } else {
        velocity.x *= PHYSICS.FRICTION;
        if (Math.abs(velocity.x) < 0.1) velocity.x = 0;
      }
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
    const didWallJump = this.handleWallJump(input);

    if (!didWallJump) {
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
