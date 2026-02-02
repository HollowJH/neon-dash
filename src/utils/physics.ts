// Base tile size that physics values are tuned for
const BASE_TILE_SIZE = 40;

// Physics ratios - these are relative to tile size
// Original values were tuned for 40px tiles
export const PHYSICS_RATIO = {
  GRAVITY: 0.6 / BASE_TILE_SIZE,           // 0.015 per pixel of tile
  JUMP_FORCE: -11 / BASE_TILE_SIZE,        // -0.275 per pixel of tile
  MOVE_SPEED: 4 / BASE_TILE_SIZE,          // 0.1 per pixel of tile
  MAX_FALL_SPEED: 12 / BASE_TILE_SIZE,     // 0.3 per pixel of tile
};

// Non-scaling physics values (frame-based or ratios)
export const PHYSICS_CONSTANTS = {
  ACCELERATION: 0.5,
  FRICTION: 0.85,
  COYOTE_TIME: 8,      // frames
  JUMP_BUFFER: 8,      // frames
  VARIABLE_JUMP_MULTIPLIER: 0.5, // Cut jump height when releasing early
};

// Get scaled physics values based on tile size
export interface ScaledPhysics {
  GRAVITY: number;
  JUMP_FORCE: number;
  MOVE_SPEED: number;
  ACCELERATION: number;
  FRICTION: number;
  MAX_FALL_SPEED: number;
  COYOTE_TIME: number;
  JUMP_BUFFER: number;
  VARIABLE_JUMP_MULTIPLIER: number;
}

export function getScaledPhysics(tileSize: number): ScaledPhysics {
  return {
    GRAVITY: PHYSICS_RATIO.GRAVITY * tileSize,
    JUMP_FORCE: PHYSICS_RATIO.JUMP_FORCE * tileSize,
    MOVE_SPEED: PHYSICS_RATIO.MOVE_SPEED * tileSize,
    MAX_FALL_SPEED: PHYSICS_RATIO.MAX_FALL_SPEED * tileSize,
    ACCELERATION: PHYSICS_CONSTANTS.ACCELERATION,
    FRICTION: PHYSICS_CONSTANTS.FRICTION,
    COYOTE_TIME: PHYSICS_CONSTANTS.COYOTE_TIME,
    JUMP_BUFFER: PHYSICS_CONSTANTS.JUMP_BUFFER,
    VARIABLE_JUMP_MULTIPLIER: PHYSICS_CONSTANTS.VARIABLE_JUMP_MULTIPLIER,
  };
}

// Legacy export for backwards compatibility (uses base tile size)
export const PHYSICS = getScaledPhysics(BASE_TILE_SIZE);

// Player dimensions are now proportional to tile size
// Use getPlayerDimensions(tileSize) to get actual pixel dimensions
export const PLAYER_RATIO = {
  WIDTH: 0.7,   // 70% of tile size
  HEIGHT: 0.9,  // 90% of tile size
};

export interface PlayerDimensions {
  WIDTH: number;
  HEIGHT: number;
}

export function getPlayerDimensions(tileSize: number): PlayerDimensions {
  return {
    WIDTH: tileSize * PLAYER_RATIO.WIDTH,
    HEIGHT: tileSize * PLAYER_RATIO.HEIGHT,
  };
}
