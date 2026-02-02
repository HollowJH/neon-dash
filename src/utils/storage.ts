import type { Level } from '../types/level';

const STORAGE_KEY = 'level-editor-save';

export function saveLevel(level: Level): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(level));
    return true;
  } catch (e) {
    console.error('Failed to save level:', e);
    return false;
  }
}

export function loadLevel(): Level | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);

    // Basic validation
    if (
      typeof parsed.width === 'number' &&
      typeof parsed.height === 'number' &&
      Array.isArray(parsed.tiles)
    ) {
      return parsed as Level;
    }

    return null;
  } catch (e) {
    console.error('Failed to load level:', e);
    return null;
  }
}

export function hasSpawnPoint(level: Level): boolean {
  for (const row of level.tiles) {
    for (const tile of row) {
      if (tile === 'spawn') return true;
    }
  }
  return false;
}

export function findSpawnPoint(level: Level): { x: number; y: number } | null {
  for (let y = 0; y < level.height; y++) {
    for (let x = 0; x < level.width; x++) {
      if (level.tiles[y][x] === 'spawn') {
        return { x, y };
      }
    }
  }
  return null;
}
