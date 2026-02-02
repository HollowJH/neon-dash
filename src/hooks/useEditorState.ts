import { useState, useCallback } from 'react';
import type { TileType, Level } from '../types/level';
import { createEmptyLevel } from '../types/level';

export type EditorMode = 'edit' | 'play';

export interface EditorState {
  level: Level;
  selectedTile: TileType;
  mode: EditorMode;
}

const MIN_WIDTH = 10;
const MAX_WIDTH = 50;
const MIN_HEIGHT = 8;
const MAX_HEIGHT = 30;
const DEFAULT_WIDTH = 30;
const DEFAULT_HEIGHT = 20;

export function useEditorState() {
  const [gridWidth, setGridWidth] = useState(DEFAULT_WIDTH);
  const [gridHeight, setGridHeight] = useState(DEFAULT_HEIGHT);
  const [level, setLevel] = useState<Level>(() => createEmptyLevel(DEFAULT_WIDTH, DEFAULT_HEIGHT));
  const [selectedTile, setSelectedTile] = useState<TileType>('platform');
  const [mode, setMode] = useState<EditorMode>('edit');

  const handleGridSizeChange = useCallback((width: number, height: number) => {
    // Clamp values
    const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width));
    const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, height));

    setGridWidth(newWidth);
    setGridHeight(newHeight);

    // Resize level, preserving existing tiles
    setLevel(prev => {
      const newTiles: TileType[][] = [];
      for (let y = 0; y < newHeight; y++) {
        newTiles[y] = [];
        for (let x = 0; x < newWidth; x++) {
          // Preserve existing tile if within old bounds
          if (y < prev.height && x < prev.width) {
            newTiles[y][x] = prev.tiles[y][x];
          } else {
            newTiles[y][x] = 'empty';
          }
        }
      }
      return { width: newWidth, height: newHeight, tiles: newTiles };
    });
  }, []);

  const setTile = useCallback((x: number, y: number, type: TileType) => {
    if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) return;

    setLevel(prev => {
      const newTiles = prev.tiles.map(row => [...row]);

      // Ensure only one spawn and one goal
      if (type === 'spawn' || type === 'goal') {
        for (let row = 0; row < gridHeight; row++) {
          for (let col = 0; col < gridWidth; col++) {
            if (newTiles[row][col] === type) {
              newTiles[row][col] = 'empty';
            }
          }
        }
      }

      newTiles[y][x] = type;
      return { ...prev, tiles: newTiles };
    });
  }, [gridWidth, gridHeight]);

  const clearLevel = useCallback(() => {
    setLevel(createEmptyLevel(gridWidth, gridHeight));
  }, [gridWidth, gridHeight]);

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
    gridWidth,
    gridHeight,
    onGridSizeChange: handleGridSizeChange,
  };
}
