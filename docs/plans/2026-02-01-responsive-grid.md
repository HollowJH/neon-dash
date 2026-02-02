# Responsive and Customizable Grid Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace fixed 30x20 grid with a responsive, user-configurable grid that auto-sizes tiles to fit the viewport without scrollbars.

**Requirements:**
1. User can customize grid width and height
2. Min/max constraints (e.g., 10-50 width, 8-30 height)
3. Tiles dynamically resize to fit viewport
4. No scrollbars - grid always fits
5. Preserve aspect ratio when possible

---

## Task 1: Add Grid Configuration UI

**Files:**
- Modify: `src/components/Editor/Toolbar.tsx`
- Modify: `src/components/Editor/Toolbar.css`
- Modify: `src/hooks/useEditorState.ts`

**Step 1: Add grid size inputs to Toolbar**

In `src/components/Editor/Toolbar.tsx`, add a new toolbar group after the mode toggle:

```tsx
interface ToolbarProps {
  mode: EditorMode;
  onToggleMode: () => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  canPlay: boolean;
  gridWidth: number;
  gridHeight: number;
  onGridSizeChange: (width: number, height: number) => void;
}

export function Toolbar({
  mode,
  onToggleMode,
  onClear,
  onSave,
  onLoad,
  canPlay,
  gridWidth,
  gridHeight,
  onGridSizeChange
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={`mode-toggle ${mode === 'play' ? 'playing' : ''}`}
          onClick={(e) => {
            onToggleMode();
            e.currentTarget.blur();
          }}
          disabled={mode === 'edit' && !canPlay}
          title={!canPlay ? 'Add a spawn point to play' : undefined}
          aria-label={mode === 'edit' ? 'Switch to play mode' : 'Switch to edit mode'}
        >
          {mode === 'edit' ? '▶ Play' : '✏ Edit'}
        </button>
      </div>

      {mode === 'edit' && (
        <div className="toolbar-group grid-controls">
          <label>
            <span>Width:</span>
            <input
              type="number"
              min={10}
              max={50}
              value={gridWidth}
              onChange={(e) => onGridSizeChange(Number(e.target.value), gridHeight)}
              aria-label="Grid width"
            />
          </label>
          <label>
            <span>Height:</span>
            <input
              type="number"
              min={8}
              max={30}
              value={gridHeight}
              onChange={(e) => onGridSizeChange(gridWidth, Number(e.target.value))}
              aria-label="Grid height"
            />
          </label>
        </div>
      )}

      <div className="toolbar-group">
        <button onClick={onSave} disabled={mode === 'play'} aria-label="Save level">
          💾 Save
        </button>
        <button onClick={onLoad} disabled={mode === 'play'} aria-label="Load level">
          📂 Load
        </button>
        <button onClick={onClear} disabled={mode === 'play'} className="danger" aria-label="Clear level">
          🗑 Clear
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Style the grid controls**

In `src/components/Editor/Toolbar.css`, add:

```css
.grid-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.grid-controls label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #aaa;
}

.grid-controls input[type="number"] {
  width: 60px;
  padding: 6px 8px;
  background: #1a1a2e;
  border: 1px solid #333;
  border-radius: 4px;
  color: #eee;
  font-size: 14px;
  text-align: center;
}

.grid-controls input[type="number"]:focus-visible {
  outline: 2px solid #63b3ed;
  outline-offset: 2px;
  border-color: #63b3ed;
}
```

**Step 3: Update useEditorState to support dynamic grid size**

In `src/hooks/useEditorState.ts`, add grid size state:

```typescript
import { useState, useCallback } from 'react';
import { TileType, Level, createEmptyLevel } from '../types/level';

export type EditorMode = 'edit' | 'play';

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
```

**Step 4: Update createEmptyLevel to accept dimensions**

In `src/types/level.ts`, update the function:

```typescript
export function createEmptyLevel(width: number = GRID_WIDTH, height: number = GRID_HEIGHT): Level {
  const tiles: TileType[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = 'empty';
    }
  }
  return { width, height, tiles };
}
```

**Step 5: Commit**

```bash
git add src/components/Editor/Toolbar.tsx src/components/Editor/Toolbar.css src/hooks/useEditorState.ts src/types/level.ts
git commit -m "feat: add grid size configuration UI with min/max constraints"
```

---

## Task 2: Make Tiles Responsive (Auto-Size to Fit Viewport)

**Files:**
- Modify: `src/components/Editor/EditorCanvas.tsx`
- Modify: `src/components/Game/GameCanvas.tsx`
- Create: `src/hooks/useResponsiveTileSize.ts`

**Step 1: Create responsive tile size hook**

Create `src/hooks/useResponsiveTileSize.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';

interface ViewportPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function useResponsiveTileSize(
  gridWidth: number,
  gridHeight: number,
  containerRef: React.RefObject<HTMLElement>,
  padding: ViewportPadding = { top: 100, right: 100, bottom: 100, left: 300 }
) {
  const [tileSize, setTileSize] = useState(40);

  const calculateTileSize = useCallback(() => {
    const availableWidth = window.innerWidth - padding.left - padding.right;
    const availableHeight = window.innerHeight - padding.top - padding.bottom;

    const tileSizeByWidth = Math.floor(availableWidth / gridWidth);
    const tileSizeByHeight = Math.floor(availableHeight / gridHeight);

    // Use the smaller size to ensure everything fits
    const newTileSize = Math.max(
      20, // Minimum tile size for usability
      Math.min(
        60, // Maximum tile size to prevent huge tiles on large screens
        Math.min(tileSizeByWidth, tileSizeByHeight)
      )
    );

    setTileSize(newTileSize);
  }, [gridWidth, gridHeight, padding]);

  useEffect(() => {
    calculateTileSize();

    window.addEventListener('resize', calculateTileSize);
    return () => window.removeEventListener('resize', calculateTileSize);
  }, [calculateTileSize]);

  return tileSize;
}
```

**Step 2: Update EditorCanvas to use responsive tile size**

In `src/components/Editor/EditorCanvas.tsx`:

```tsx
import { useRef, useEffect, useCallback, useState } from 'react';
import type { Level, TileType } from '../../types/level';
import { renderLevel, screenToGrid } from '../../utils/rendering';
import { useResponsiveTileSize } from '../../hooks/useResponsiveTileSize';
import './EditorCanvas.css';

interface EditorCanvasProps {
  level: Level;
  selectedTile: TileType;
  onSetTile: (x: number, y: number, type: TileType) => void;
}

export function EditorCanvas({ level, selectedTile, onSetTile }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const tileSize = useResponsiveTileSize(
    level.width,
    level.height,
    containerRef,
    { top: 100, right: 100, bottom: 100, left: 300 }
  );

  // Render level whenever it changes or tile size changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderLevel(ctx, level, true, tileSize);
  }, [level, tileSize]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToGrid(e.clientX, e.clientY, rect, tileSize);

    const tileToPlace = e.button === 2 ? 'empty' : selectedTile;
    onSetTile(x, y, tileToPlace);
  }, [selectedTile, onSetTile, tileSize]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToGrid(e.clientX, e.clientY, rect, tileSize);

    const tileToPlace = e.buttons === 2 ? 'empty' : selectedTile;
    onSetTile(x, y, tileToPlace);
  }, [isDrawing, selectedTile, onSetTile, tileSize]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="editor-canvas"
        width={level.width * tileSize}
        height={level.height * tileSize}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onContextMenu={handleContextMenu}
        role="img"
        aria-label="Level editor grid - click and drag to place tiles"
      />
    </div>
  );
}
```

**Step 3: Update rendering utilities to accept tile size**

In `src/utils/rendering.ts`, update functions to accept tile size parameter:

```typescript
import { TileType, Level } from '../types/level';

export const TILE_COLORS: Record<TileType, string> = {
  empty: '#1a1a2e',
  platform: '#4a5568',
  hazard: '#e53e3e',
  spawn: '#38a169',
  goal: '#d69e2e',
};

export function renderLevel(
  ctx: CanvasRenderingContext2D,
  level: Level,
  showGrid: boolean = true,
  tileSize: number = 40
) {
  const { width, height, tiles } = level;

  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width * tileSize, height * tileSize);

  // Draw tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileType = tiles[y][x];
      if (tileType !== 'empty') {
        ctx.fillStyle = TILE_COLORS[tileType];
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);

        // Add slight border for depth
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      }
    }
  }

  // Draw grid
  if (showGrid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tileSize, 0);
      ctx.lineTo(x * tileSize, height * tileSize);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * tileSize);
      ctx.lineTo(width * tileSize, y * tileSize);
      ctx.stroke();
    }
  }
}

export function screenToGrid(
  screenX: number,
  screenY: number,
  canvasRect: DOMRect,
  tileSize: number = 40
): { x: number; y: number } {
  const x = Math.floor((screenX - canvasRect.left) / tileSize);
  const y = Math.floor((screenY - canvasRect.top) / tileSize);
  return { x, y };
}
```

**Step 4: Update GameCanvas similarly**

In `src/components/Game/GameCanvas.tsx`, add responsive tile size (similar to EditorCanvas).

**Step 5: Remove overflow: auto from App.css**

In `src/App.css`, change `.canvas-container`:

```css
.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Remove: overflow: auto; */
}
```

**Step 6: Commit**

```bash
git add src/hooks/useResponsiveTileSize.ts src/components/Editor/EditorCanvas.tsx src/components/Game/GameCanvas.tsx src/utils/rendering.ts src/App.css
git commit -m "feat: make grid responsive with auto-sizing tiles"
```

---

## Task 3: Update App.tsx to Wire Up Grid Controls

**Files:**
- Modify: `src/App.tsx`

**Step 1: Pass grid props to Toolbar**

In `src/App.tsx`:

```tsx
<Toolbar
  mode={mode}
  onToggleMode={toggleMode}
  onClear={clearLevel}
  onSave={handleSave}
  onLoad={handleLoad}
  canPlay={canPlay}
  gridWidth={gridWidth}
  gridHeight={gridHeight}
  onGridSizeChange={onGridSizeChange}
/>
```

**Step 2: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate grid size controls into app"
```

---

## Task 4: Verify and Test

**Step 1: Manual testing**

- [ ] Change grid width/height - tiles resize to fit
- [ ] No scrollbars appear
- [ ] Min/max constraints work (10-50 width, 8-30 height)
- [ ] Existing tiles preserved when resizing
- [ ] Play mode works with different grid sizes
- [ ] Save/load works with custom grid sizes

**Step 2: Build and verify**

```bash
npm run build
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Add grid configuration UI | 15 min |
| 2 | Make tiles responsive | 25 min |
| 3 | Wire up controls | 5 min |
| 4 | Verify and test | 10 min |

**Total: ~55 minutes**

**Result:** A responsive, customizable grid that adapts to any screen size without scrollbars!
