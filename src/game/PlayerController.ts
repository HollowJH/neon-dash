import type { Level, PlayerState } from '../types/level';
import { getPlayerDimensions, getScaledPhysics, type PlayerDimensions, type ScaledPhysics } from '../utils/physics';
import { resolveCollisions } from '../utils/collision';
import { findSpawnPoint } from '../utils/storage';

// Base tile size for scaling constants
const BASE_TILE_SIZE = 40;

// Dash constants - scale with tile size
const getDashSpeed = (tileSize: number) => 12 * (tileSize / BASE_TILE_SIZE);

// Dash timing (frame-based, doesn't scale)
const DASH_DURATION = 10; // frames (at 60fps = ~167ms)
const DASH_COOLDOWN = 30; // frames (at 60fps = 500ms)

// Wall jump constants - scale with tile size
const getWallSlideSpeed = (tileSize: number) => 2 * (tileSize / BASE_TILE_SIZE);
const getWallJumpXBoost = (tileSize: number) => 8 * (tileSize / BASE_TILE_SIZE);
const getWallJumpYBoost = (tileSize: number) => -10 * (tileSize / BASE_TILE_SIZE);

// Wall timing (frame-based, doesn't scale)
const WALL_STICK_TIME = 6; // frames grace period
const WALL_JUMP_GRACE_PERIOD = 6; // frames to ignore horizontal input after wall jump

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
  private playerDims: PlayerDimensions;
  private physics: ScaledPhysics;
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
    wallJumpGraceTimer: 0, // Prevents horizontal input from canceling wall jump
  };

  constructor(level: Level, tileSize: number) {
    this.level = level;
    this.tileSize = tileSize;
    this.playerDims = getPlayerDimensions(tileSize);
    this.physics = getScaledPhysics(tileSize);
    this.state = this.createInitialState();
  }

  private createInitialState(): PlayerState {
    const spawn = findSpawnPoint(this.level);
    const spawnX = spawn ? spawn.x * this.tileSize + (this.tileSize - this.playerDims.WIDTH) / 2 : 100;
    const spawnY = spawn ? spawn.y * this.tileSize + (this.tileSize - this.playerDims.HEIGHT) : 100;

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
      wallJumpGraceTimer: 0,
    };
  }

  private checkWallCollision(): 'left' | 'right' | null {
    const { position } = this.state;
    const playerLeft = position.x;
    const playerRight = position.x + this.playerDims.WIDTH;
    const playerTop = position.y;
    const playerBottom = position.y + this.playerDims.HEIGHT;

    // Check tiles to the left and right
    const tileY1 = Math.floor(playerTop / this.tileSize);
    const tileY2 = Math.floor((playerBottom - 1) / this.tileSize);

    // Check left wall (exclude canvas boundary)
    const leftTileX = Math.floor((playerLeft - 1) / this.tileSize);
    if (leftTileX >= 0) { // Only check if not at left boundary
      for (let ty = tileY1; ty <= tileY2; ty++) {
        if (ty >= 0 && ty < this.level.height && this.level.tiles[ty][leftTileX] === 'platform') {
          return 'left';
        }
      }
    }

    // Check right wall (exclude canvas boundary)
    const rightTileX = Math.floor(playerRight / this.tileSize);
    if (rightTileX < this.level.width) { // Only check if not at right boundary
      for (let ty = tileY1; ty <= tileY2; ty++) {
        if (ty >= 0 && ty < this.level.height && this.level.tiles[ty][rightTileX] === 'platform') {
          return 'right';
        }
      }
    }

    return null;
  }

  private handleWallSlide(input: InputState, _deltaTime: number): void {
    const wallSide = this.checkWallCollision();
    const isHoldingTowardWall =
      (wallSide === 'left' && input.left) ||
      (wallSide === 'right' && input.right);
    const isInAir = !this.state.isGrounded;

    // Clear wall state immediately when grounded
    if (this.state.isGrounded) {
      this.wallState.onWall = false;
      this.wallState.wallSide = null;
      this.wallState.wallStickTime = 0;
      return;
    }

    if (wallSide && isHoldingTowardWall && isInAir && !this.dashState.isDashing) {
      this.wallState.onWall = true;
      this.wallState.wallSide = wallSide;
      this.wallState.wallStickTime = WALL_STICK_TIME;

      // Slow down fall speed (scaled)
      const wallSlideSpeed = getWallSlideSpeed(this.tileSize);
      if (this.state.velocity.y > wallSlideSpeed) {
        this.state.velocity.y = wallSlideSpeed;
      }
    } else if (this.wallState.wallStickTime > 0) {
      this.wallState.wallStickTime -= 1; // Frame-based decrement
    } else {
      this.wallState.onWall = false;
      this.wallState.wallSide = null;
    }
  }

  private handleWallJump(input: InputState): boolean {
    // Wall jump only works when in the air (not grounded)
    if (input.jumpPressed && this.wallState.onWall && this.wallState.wallSide && !this.state.isGrounded) {
      const jumpDirection = this.wallState.wallSide === 'left' ? 1 : -1;
      this.state.velocity.x = getWallJumpXBoost(this.tileSize) * jumpDirection;
      this.state.velocity.y = getWallJumpYBoost(this.tileSize);
      this.facingDirection = jumpDirection;

      // Reset wall state
      this.wallState.onWall = false;
      this.wallState.wallSide = null;
      this.wallState.wallStickTime = 0;
      this.wallState.wallJumpGraceTimer = WALL_JUMP_GRACE_PERIOD;

      return true;
    }
    return false;
  }

  private handleDash(input: InputState, _deltaTime: number): void {
    // Update cooldown (frame-based)
    if (this.dashState.dashCooldown > 0) {
      this.dashState.dashCooldown -= 1;
    }

    // Start dash
    if (input.dashPressed && this.dashState.dashCooldown <= 0 && !this.dashState.isDashing) {
      this.dashState.isDashing = true;
      this.dashState.dashTime = DASH_DURATION;
      this.dashState.dashDirection = this.facingDirection;
      this.dashState.dashCooldown = DASH_COOLDOWN;

      // Set dash velocity (scaled)
      this.state.velocity.x = getDashSpeed(this.tileSize) * this.dashState.dashDirection;
    }

    // Update dash (frame-based)
    if (this.dashState.isDashing) {
      this.dashState.dashTime -= 1;

      // Maintain dash speed (scaled, gravity still applies for curved trajectory)
      this.state.velocity.x = getDashSpeed(this.tileSize) * this.dashState.dashDirection;

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

  get playerDimensions(): PlayerDimensions {
    return this.playerDims;
  }

  update(input: InputState, deltaTime: number = 16): { hitHazard: boolean; reachedGoal: boolean } {
    const { position, velocity } = this.state;

    // Update wall jump grace timer
    if (this.wallState.wallJumpGraceTimer > 0) {
      this.wallState.wallJumpGraceTimer -= 1;
    }

    // Update facing direction
    if (input.left) this.facingDirection = -1;
    if (input.right) this.facingDirection = 1;

    // Handle dash
    this.handleDash(input, deltaTime);

    // Handle wall slide
    this.handleWallSlide(input, deltaTime);

    // Horizontal movement (skipped during dash and wall jump grace period)
    if (!this.dashState.isDashing && this.wallState.wallJumpGraceTimer <= 0) {
      let targetVelX = 0;
      if (input.left) targetVelX -= this.physics.MOVE_SPEED;
      if (input.right) targetVelX += this.physics.MOVE_SPEED;

      if (targetVelX !== 0) {
        velocity.x += (targetVelX - velocity.x) * this.physics.ACCELERATION;
      } else {
        velocity.x *= this.physics.FRICTION;
        if (Math.abs(velocity.x) < 0.1) velocity.x = 0;
      }
    }

    // Update coyote time
    if (this.state.isGrounded) {
      this.state.coyoteTimer = this.physics.COYOTE_TIME;
    } else {
      this.state.coyoteTimer = Math.max(0, this.state.coyoteTimer - 1);
    }

    // Update jump buffer
    if (input.jumpPressed) {
      this.state.jumpBufferTimer = this.physics.JUMP_BUFFER;
    } else {
      this.state.jumpBufferTimer = Math.max(0, this.state.jumpBufferTimer - 1);
    }

    // Jump logic
    const didWallJump = this.handleWallJump(input);

    if (!didWallJump) {
      const canJump = this.state.coyoteTimer > 0;
      const wantsJump = this.state.jumpBufferTimer > 0;

      if (canJump && wantsJump) {
        velocity.y = this.physics.JUMP_FORCE;
        this.state.coyoteTimer = 0;
        this.state.jumpBufferTimer = 0;
        this.jumpHeld = true;
      }

      // Variable jump height - cut velocity when releasing jump early
      if (input.jumpReleased && this.jumpHeld && velocity.y < 0) {
        velocity.y *= this.physics.VARIABLE_JUMP_MULTIPLIER;
        this.jumpHeld = false;
      }
    }

    if (this.state.isGrounded) {
      this.jumpHeld = false;
    }

    // Apply gravity
    velocity.y += this.physics.GRAVITY;
    velocity.y = Math.min(velocity.y, this.physics.MAX_FALL_SPEED);

    // Resolve collisions
    const result = resolveCollisions(
      this.level,
      position.x,
      position.y,
      velocity.x,
      velocity.y,
      this.tileSize,
      this.playerDims
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
