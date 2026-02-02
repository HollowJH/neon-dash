import { useState, useCallback } from 'react';
import type { TileType, Level } from '../types/level';
import { createEmptyLevel, GRID_WIDTH, GRID_HEIGHT } from '../types/level';

export type EditorMode = 'edit' | 'play';

export interface EditorState {
  level: Level;
  selectedTile: TileType;
  mode: EditorMode;
}

export function useEditorState() {
  const [level, setLevel] = useState<Level>(createEmptyLevel);
  const [selectedTile, setSelectedTile] = useState<TileType>('platform');
  const [mode, setMode] = useState<EditorMode>('edit');

  const setTile = useCallback((x: number, y: number, type: TileType) => {
    if (x < 0 || x >= GRID_WIDTH || y < 0 || y >= GRID_HEIGHT) return;

    setLevel(prev => {
      const newTiles = prev.tiles.map(row => [...row]);

      // Ensure only one spawn and one goal
      if (type === 'spawn' || type === 'goal') {
        for (let row = 0; row < GRID_HEIGHT; row++) {
          for (let col = 0; col < GRID_WIDTH; col++) {
            if (newTiles[row][col] === type) {
              newTiles[row][col] = 'empty';
            }
          }
        }
      }

      newTiles[y][x] = type;
      return { ...prev, tiles: newTiles };
    });
  }, []);

  const clearLevel = useCallback(() => {
    setLevel(createEmptyLevel());
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'edit' ? 'play' : 'edit');
  }, []);

  return {
    level,
    setLevel,
    selectedTile,
    setSelectedTile,
    mode,
    setMode,
    toggleMode,
    setTile,
    clearLevel,
  };
}
