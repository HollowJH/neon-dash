import type { Level } from '../types/level';
import { PLAYER } from './physics';

export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function getPlayerBounds(x: number, y: number): AABB {
  return {
    x,
    y,
    width: PLAYER.WIDTH,
    height: PLAYER.HEIGHT,
  };
}

export function getTileBounds(tileX: number, tileY: number, tileSize: number): AABB {
  return {
    x: tileX * tileSize,
    y: tileY * tileSize,
    width: tileSize,
    height: tileSize,
  };
}

export function aabbCollision(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export interface CollisionResult {
  collided: boolean;
  isGrounded: boolean;
  hitHazard: boolean;
  reachedGoal: boolean;
  newX: number;
  newY: number;
  newVelX: number;
  newVelY: number;
}

export function resolveCollisions(
  level: Level,
  x: number,
  y: number,
  velX: number,
  velY: number,
  tileSize: number
): CollisionResult {
  let newX = x + velX;
  let newY = y + velY;
  let newVelX = velX;
  let newVelY = velY;
  let isGrounded = false;
  let hitHazard = false;
  let reachedGoal = false;

  // Check collision with level boundaries
  if (newX < 0) {
    newX = 0;
    newVelX = 0;
  }
  if (newX + PLAYER.WIDTH > level.width * tileSize) {
    newX = level.width * tileSize - PLAYER.WIDTH;
    newVelX = 0;
  }

  // Fall off bottom = death
  if (newY > level.height * tileSize) {
    hitHazard = true;
  }

  // Check tile collisions
  // Get tiles player might be overlapping
  const startTileX = Math.floor(newX / tileSize);
  const endTileX = Math.floor((newX + PLAYER.WIDTH - 0.01) / tileSize);
  const startTileY = Math.floor(newY / tileSize);
  const endTileY = Math.floor((newY + PLAYER.HEIGHT - 0.01) / tileSize);

  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      if (tileY < 0 || tileY >= level.height || tileX < 0 || tileX >= level.width) {
        continue;
      }

      const tileType = level.tiles[tileY][tileX];

      if (tileType === 'hazard') {
        const tileBounds = getTileBounds(tileX, tileY, tileSize);
        if (aabbCollision(getPlayerBounds(newX, newY), tileBounds)) {
          hitHazard = true;
        }
      }

      if (tileType === 'goal') {
        const tileBounds = getTileBounds(tileX, tileY, tileSize);
        if (aabbCollision(getPlayerBounds(newX, newY), tileBounds)) {
          reachedGoal = true;
        }
      }

      if (tileType === 'platform') {
        const tileBounds = getTileBounds(tileX, tileY, tileSize);

        if (aabbCollision(getPlayerBounds(newX, newY), tileBounds)) {
          // Determine collision direction based on previous position
          const prevBounds = getPlayerBounds(x, y);
          const tolerance = 4;

          // Moving down, hit top of tile
          if (prevBounds.y + prevBounds.height <= tileBounds.y + tolerance && velY > 0) {
            newY = tileBounds.y - PLAYER.HEIGHT;
            newVelY = 0;
            isGrounded = true;
          }
          // Moving up, hit bottom of tile
          else if (prevBounds.y >= tileBounds.y + tileBounds.height - tolerance && velY < 0) {
            newY = tileBounds.y + tileBounds.height;
            newVelY = 0;
          }
          // Moving right, hit left side of tile
          else if (prevBounds.x + prevBounds.width <= tileBounds.x + tolerance && velX > 0) {
            newX = tileBounds.x - PLAYER.WIDTH;
            newVelX = 0;
          }
          // Moving left, hit right side of tile
          else if (prevBounds.x >= tileBounds.x + tileBounds.width - tolerance && velX < 0) {
            newX = tileBounds.x + tileBounds.width;
            newVelX = 0;
          }
        }
      }
    }
  }

  // Additional ground check for small gaps
  const groundCheckY = newY + PLAYER.HEIGHT + 1;
  const groundTileY = Math.floor(groundCheckY / tileSize);
  for (let tileX = startTileX; tileX <= endTileX; tileX++) {
    if (groundTileY >= 0 && groundTileY < level.height &&
        tileX >= 0 && tileX < level.width &&
        level.tiles[groundTileY][tileX] === 'platform') {
      const tileBounds = getTileBounds(tileX, groundTileY, tileSize);
      if (newX + PLAYER.WIDTH > tileBounds.x && newX < tileBounds.x + tileBounds.width) {
        if (Math.abs(newY + PLAYER.HEIGHT - tileBounds.y) < 2) {
          isGrounded = true;
        }
      }
    }
  }

  return {
    collided: isGrounded || hitHazard || reachedGoal,
    isGrounded,
    hitHazard,
    reachedGoal,
    newX,
    newY,
    newVelX,
    newVelY,
  };
}
