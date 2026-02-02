# Level Editor + Player Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a web-based platformer level editor where users design levels with drag-and-drop tiles, then instantly play-test them with polished platformer controls.

**Architecture:** React + TypeScript app with Canvas rendering. Editor state managed via React hooks, game loop runs separately via requestAnimationFrame. Grid-based level data stored as 2D array of tile types.

**Tech Stack:** React 18, TypeScript, Vite, HTML5 Canvas, localStorage

---

## Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`

**Step 1: Initialize Vite React TypeScript project**

Run:
```bash
npm create vite@latest . -- --template react-ts
```

Expected: Project scaffolded with React + TypeScript template

**Step 2: Install dependencies**

Run:
```bash
npm install
```

Expected: node_modules created, dependencies installed

**Step 3: Verify dev server runs**

Run:
```bash
npm run dev
```

Expected: Server starts on localhost, displays Vite + React page

**Step 4: Clean up boilerplate**

Replace `src/App.tsx`:
```tsx
import './App.css';

function App() {
  return (
    <div className="app">
      <h1>Level Editor</h1>
    </div>
  );
}

export default App;
```

Replace `src/App.css`:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: #eee;
  font-family: system-ui, -apple-system, sans-serif;
}
```

**Step 5: Commit**

```bash
git init
git add .
git commit -m "chore: initialize vite react-ts project"
```

---

## Task 2: Core Types

**Files:**
- Create: `src/types/level.ts`

**Step 1: Define tile and level types**

Create `src/types/level.ts`:
```typescript
export type TileType = 'empty' | 'platform' | 'hazard' | 'spawn' | 'goal';

export interface Tile {
  type: TileType;
}

export interface Level {
  width: number;
  height: number;
  tiles: TileType[][];
}

export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Position;
  velocity: Position;
  isGrounded: boolean;
  coyoteTimer: number;
  jumpBufferTimer: number;
}

export const TILE_SIZE = 40;
export const GRID_WIDTH = 20;
export const GRID_HEIGHT = 12;

export function createEmptyLevel(): Level {
  const tiles: TileType[][] = [];
  for (let y = 0; y < GRID_HEIGHT; y++) {
    tiles[y] = [];
    for (let x = 0; x < GRID_WIDTH; x++) {
      tiles[y][x] = 'empty';
    }
  }
  return { width: GRID_WIDTH, height: GRID_HEIGHT, tiles };
}
```

**Step 2: Commit**

```bash
git add src/types/level.ts
git commit -m "feat: add core level and tile types"
```

---

## Task 3: Editor State Hook

**Files:**
- Create: `src/hooks/useEditorState.ts`

**Step 1: Create editor state management hook**

Create `src/hooks/useEditorState.ts`:
```typescript
import { useState, useCallback } from 'react';
import { TileType, Level, createEmptyLevel, GRID_WIDTH, GRID_HEIGHT } from '../types/level';

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
```

**Step 2: Commit**

```bash
git add src/hooks/useEditorState.ts
git commit -m "feat: add editor state management hook"
```

---

## Task 4: Tile Palette Component

**Files:**
- Create: `src/components/Editor/TilePalette.tsx`
- Create: `src/components/Editor/TilePalette.css`

**Step 1: Create tile palette component**

Create `src/components/Editor/TilePalette.tsx`:
```tsx
import { TileType } from '../../types/level';
import './TilePalette.css';

interface TilePaletteProps {
  selectedTile: TileType;
  onSelectTile: (tile: TileType) => void;
}

const TILE_OPTIONS: { type: TileType; label: string; color: string }[] = [
  { type: 'platform', label: 'Platform', color: '#4a5568' },
  { type: 'hazard', label: 'Hazard', color: '#e53e3e' },
  { type: 'spawn', label: 'Spawn', color: '#38a169' },
  { type: 'goal', label: 'Goal', color: '#d69e2e' },
  { type: 'empty', label: 'Erase', color: '#2d3748' },
];

export function TilePalette({ selectedTile, onSelectTile }: TilePaletteProps) {
  return (
    <div className="tile-palette">
      <h3>Tiles</h3>
      <div className="tile-options">
        {TILE_OPTIONS.map(({ type, label, color }) => (
          <button
            key={type}
            className={`tile-option ${selectedTile === type ? 'selected' : ''}`}
            onClick={() => onSelectTile(type)}
            style={{ '--tile-color': color } as React.CSSProperties}
          >
            <div className="tile-preview" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

Create `src/components/Editor/TilePalette.css`:
```css
.tile-palette {
  padding: 16px;
  background: #16213e;
  border-radius: 8px;
  min-width: 120px;
}

.tile-palette h3 {
  margin-bottom: 12px;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #888;
}

.tile-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tile-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #1a1a2e;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #eee;
  font-size: 14px;
  transition: all 0.15s;
}

.tile-option:hover {
  background: #2a2a4e;
}

.tile-option.selected {
  border-color: var(--tile-color);
  background: #2a2a4e;
}

.tile-preview {
  width: 24px;
  height: 24px;
  background: var(--tile-color);
  border-radius: 4px;
}
```

**Step 2: Commit**

```bash
git add src/components/Editor/TilePalette.tsx src/components/Editor/TilePalette.css
git commit -m "feat: add tile palette component"
```

---

## Task 5: Editor Canvas Component

**Files:**
- Create: `src/components/Editor/EditorCanvas.tsx`
- Create: `src/components/Editor/EditorCanvas.css`
- Create: `src/utils/rendering.ts`

**Step 1: Create rendering utilities**

Create `src/utils/rendering.ts`:
```typescript
import { TileType, Level, TILE_SIZE } from '../types/level';

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
  showGrid: boolean = true
) {
  const { width, height, tiles } = level;

  // Clear canvas
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, width * TILE_SIZE, height * TILE_SIZE);

  // Draw tiles
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileType = tiles[y][x];
      if (tileType !== 'empty') {
        ctx.fillStyle = TILE_COLORS[tileType];
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        // Add slight border for depth
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Draw grid
  if (showGrid) {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * TILE_SIZE, 0);
      ctx.lineTo(x * TILE_SIZE, height * TILE_SIZE);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * TILE_SIZE);
      ctx.lineTo(width * TILE_SIZE, y * TILE_SIZE);
      ctx.stroke();
    }
  }
}

export function screenToGrid(screenX: number, screenY: number, canvasRect: DOMRect): { x: number; y: number } {
  const x = Math.floor((screenX - canvasRect.left) / TILE_SIZE);
  const y = Math.floor((screenY - canvasRect.top) / TILE_SIZE);
  return { x, y };
}
```

**Step 2: Create editor canvas component**

Create `src/components/Editor/EditorCanvas.tsx`:
```tsx
import { useRef, useEffect, useCallback, useState } from 'react';
import { Level, TileType, TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../../types/level';
import { renderLevel, screenToGrid } from '../../utils/rendering';
import './EditorCanvas.css';

interface EditorCanvasProps {
  level: Level;
  selectedTile: TileType;
  onSetTile: (x: number, y: number, type: TileType) => void;
}

export function EditorCanvas({ level, selectedTile, onSetTile }: EditorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Render level whenever it changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderLevel(ctx, level, true);
  }, [level]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    canvas.setPointerCapture(e.pointerId);

    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToGrid(e.clientX, e.clientY, rect);

    // Right click = erase
    const tileToPlace = e.button === 2 ? 'empty' : selectedTile;
    onSetTile(x, y, tileToPlace);
  }, [selectedTile, onSetTile]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const { x, y } = screenToGrid(e.clientX, e.clientY, rect);

    const tileToPlace = e.buttons === 2 ? 'empty' : selectedTile;
    onSetTile(x, y, tileToPlace);
  }, [isDrawing, selectedTile, onSetTile]);

  const handlePointerUp = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="editor-canvas"
      width={GRID_WIDTH * TILE_SIZE}
      height={GRID_HEIGHT * TILE_SIZE}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onContextMenu={handleContextMenu}
    />
  );
}
```

Create `src/components/Editor/EditorCanvas.css`:
```css
.editor-canvas {
  border: 2px solid #333;
  border-radius: 4px;
  cursor: crosshair;
}
```

**Step 3: Commit**

```bash
git add src/utils/rendering.ts src/components/Editor/EditorCanvas.tsx src/components/Editor/EditorCanvas.css
git commit -m "feat: add editor canvas with tile painting"
```

---

## Task 6: Toolbar Component

**Files:**
- Create: `src/components/Editor/Toolbar.tsx`
- Create: `src/components/Editor/Toolbar.css`

**Step 1: Create toolbar component**

Create `src/components/Editor/Toolbar.tsx`:
```tsx
import { EditorMode } from '../../hooks/useEditorState';
import './Toolbar.css';

interface ToolbarProps {
  mode: EditorMode;
  onToggleMode: () => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  canPlay: boolean;
}

export function Toolbar({ mode, onToggleMode, onClear, onSave, onLoad, canPlay }: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <button
          className={`mode-toggle ${mode === 'play' ? 'playing' : ''}`}
          onClick={onToggleMode}
          disabled={mode === 'edit' && !canPlay}
          title={!canPlay ? 'Add a spawn point to play' : undefined}
        >
          {mode === 'edit' ? '▶ Play' : '✏ Edit'}
        </button>
      </div>

      <div className="toolbar-group">
        <button onClick={onSave} disabled={mode === 'play'}>
          💾 Save
        </button>
        <button onClick={onLoad} disabled={mode === 'play'}>
          📂 Load
        </button>
        <button onClick={onClear} disabled={mode === 'play'} className="danger">
          🗑 Clear
        </button>
      </div>
    </div>
  );
}
```

Create `src/components/Editor/Toolbar.css`:
```css
.toolbar {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: #16213e;
  border-radius: 8px;
}

.toolbar-group {
  display: flex;
  gap: 8px;
}

.toolbar button {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #2d3748;
  color: #eee;
  transition: all 0.15s;
}

.toolbar button:hover:not(:disabled) {
  background: #4a5568;
}

.toolbar button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar button.danger:hover:not(:disabled) {
  background: #c53030;
}

.mode-toggle {
  min-width: 100px;
  background: #38a169 !important;
}

.mode-toggle:hover:not(:disabled) {
  background: #2f855a !important;
}

.mode-toggle.playing {
  background: #d69e2e !important;
}

.mode-toggle.playing:hover {
  background: #b7791f !important;
}
```

**Step 2: Commit**

```bash
git add src/components/Editor/Toolbar.tsx src/components/Editor/Toolbar.css
git commit -m "feat: add toolbar with mode toggle and level controls"
```

---

## Task 7: Storage Utilities

**Files:**
- Create: `src/utils/storage.ts`

**Step 1: Create localStorage utilities**

Create `src/utils/storage.ts`:
```typescript
import { Level, createEmptyLevel } from '../types/level';

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
```

**Step 2: Commit**

```bash
git add src/utils/storage.ts
git commit -m "feat: add level save/load utilities"
```

---

## Task 8: Integrate Editor Components in App

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css`

**Step 1: Wire up editor components**

Replace `src/App.tsx`:
```tsx
import { useEditorState } from './hooks/useEditorState';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { TilePalette } from './components/Editor/TilePalette';
import { Toolbar } from './components/Editor/Toolbar';
import { saveLevel, loadLevel, hasSpawnPoint } from './utils/storage';
import './App.css';

function App() {
  const {
    level,
    setLevel,
    selectedTile,
    setSelectedTile,
    mode,
    toggleMode,
    setTile,
    clearLevel,
  } = useEditorState();

  const handleSave = () => {
    if (saveLevel(level)) {
      alert('Level saved!');
    } else {
      alert('Failed to save level');
    }
  };

  const handleLoad = () => {
    const loaded = loadLevel();
    if (loaded) {
      setLevel(loaded);
      alert('Level loaded!');
    } else {
      alert('No saved level found');
    }
  };

  const canPlay = hasSpawnPoint(level);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Level Editor</h1>
        <Toolbar
          mode={mode}
          onToggleMode={toggleMode}
          onClear={clearLevel}
          onSave={handleSave}
          onLoad={handleLoad}
          canPlay={canPlay}
        />
      </header>

      <main className="app-main">
        {mode === 'edit' && (
          <aside className="sidebar">
            <TilePalette
              selectedTile={selectedTile}
              onSelectTile={setSelectedTile}
            />
          </aside>
        )}

        <div className="canvas-container">
          {mode === 'edit' ? (
            <EditorCanvas
              level={level}
              selectedTile={selectedTile}
              onSetTile={setTile}
            />
          ) : (
            <div className="play-placeholder">
              <p>Play Mode (coming next...)</p>
              <button onClick={toggleMode}>Back to Edit</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
```

Replace `src/App.css`:
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: #eee;
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #0f0f1a;
  border-bottom: 1px solid #333;
}

.app-header h1 {
  font-size: 20px;
  font-weight: 600;
}

.app-main {
  flex: 1;
  display: flex;
  padding: 24px;
  gap: 24px;
  overflow: hidden;
}

.sidebar {
  flex-shrink: 0;
}

.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  background: #16213e;
  border-radius: 8px;
}

.play-placeholder button {
  padding: 10px 20px;
  font-size: 14px;
  background: #2d3748;
  color: #eee;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
```

**Step 2: Verify editor works**

Run:
```bash
npm run dev
```

Expected: Editor displays with tile palette, canvas, and toolbar. Can paint tiles.

**Step 3: Commit**

```bash
git add src/App.tsx src/App.css
git commit -m "feat: integrate editor components into app"
```

---

## Task 9: Physics Constants and Player Types

**Files:**
- Create: `src/utils/physics.ts`

**Step 1: Define physics constants**

Create `src/utils/physics.ts`:
```typescript
export const PHYSICS = {
  GRAVITY: 0.6,
  JUMP_FORCE: -11,
  MOVE_SPEED: 4,
  ACCELERATION: 0.5,
  FRICTION: 0.85,
  MAX_FALL_SPEED: 12,
  COYOTE_TIME: 8,      // frames
  JUMP_BUFFER: 8,      // frames
  VARIABLE_JUMP_MULTIPLIER: 0.5, // Cut jump height when releasing early
};

export const PLAYER = {
  WIDTH: 28,
  HEIGHT: 36,
};
```

**Step 2: Commit**

```bash
git add src/utils/physics.ts
git commit -m "feat: add physics constants"
```

---

## Task 10: Collision Detection

**Files:**
- Create: `src/utils/collision.ts`

**Step 1: Create collision utilities**

Create `src/utils/collision.ts`:
```typescript
import { Level, TILE_SIZE } from '../types/level';
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

export function getTileBounds(tileX: number, tileY: number): AABB {
  return {
    x: tileX * TILE_SIZE,
    y: tileY * TILE_SIZE,
    width: TILE_SIZE,
    height: TILE_SIZE,
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
  velY: number
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
  if (newX + PLAYER.WIDTH > level.width * TILE_SIZE) {
    newX = level.width * TILE_SIZE - PLAYER.WIDTH;
    newVelX = 0;
  }

  // Fall off bottom = death
  if (newY > level.height * TILE_SIZE) {
    hitHazard = true;
  }

  // Check tile collisions
  const playerBounds = getPlayerBounds(newX, newY);

  // Get tiles player might be overlapping
  const startTileX = Math.floor(newX / TILE_SIZE);
  const endTileX = Math.floor((newX + PLAYER.WIDTH - 1) / TILE_SIZE);
  const startTileY = Math.floor(newY / TILE_SIZE);
  const endTileY = Math.floor((newY + PLAYER.HEIGHT - 1) / TILE_SIZE);

  for (let tileY = startTileY; tileY <= endTileY; tileY++) {
    for (let tileX = startTileX; tileX <= endTileX; tileX++) {
      if (tileY < 0 || tileY >= level.height || tileX < 0 || tileX >= level.width) {
        continue;
      }

      const tileType = level.tiles[tileY][tileX];

      if (tileType === 'hazard') {
        const tileBounds = getTileBounds(tileX, tileY);
        if (aabbCollision(getPlayerBounds(newX, newY), tileBounds)) {
          hitHazard = true;
        }
      }

      if (tileType === 'goal') {
        const tileBounds = getTileBounds(tileX, tileY);
        if (aabbCollision(getPlayerBounds(newX, newY), tileBounds)) {
          reachedGoal = true;
        }
      }

      if (tileType === 'platform') {
        const tileBounds = getTileBounds(tileX, tileY);

        if (aabbCollision(getPlayerBounds(newX, newY), tileBounds)) {
          // Determine collision direction based on previous position
          const prevBounds = getPlayerBounds(x, y);

          // Moving down, hit top of tile
          if (prevBounds.y + prevBounds.height <= tileBounds.y && velY > 0) {
            newY = tileBounds.y - PLAYER.HEIGHT;
            newVelY = 0;
            isGrounded = true;
          }
          // Moving up, hit bottom of tile
          else if (prevBounds.y >= tileBounds.y + tileBounds.height && velY < 0) {
            newY = tileBounds.y + tileBounds.height;
            newVelY = 0;
          }
          // Moving right, hit left side of tile
          else if (prevBounds.x + prevBounds.width <= tileBounds.x && velX > 0) {
            newX = tileBounds.x - PLAYER.WIDTH;
            newVelX = 0;
          }
          // Moving left, hit right side of tile
          else if (prevBounds.x >= tileBounds.x + tileBounds.width && velX < 0) {
            newX = tileBounds.x + tileBounds.width;
            newVelX = 0;
          }
        }
      }
    }
  }

  // Additional ground check for small gaps
  const groundCheckY = newY + PLAYER.HEIGHT + 1;
  const groundTileY = Math.floor(groundCheckY / TILE_SIZE);
  for (let tileX = startTileX; tileX <= endTileX; tileX++) {
    if (groundTileY >= 0 && groundTileY < level.height &&
        tileX >= 0 && tileX < level.width &&
        level.tiles[groundTileY][tileX] === 'platform') {
      const tileBounds = getTileBounds(tileX, groundTileY);
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
```

**Step 2: Commit**

```bash
git add src/utils/collision.ts
git commit -m "feat: add AABB collision detection and resolution"
```

---

## Task 11: Game Loop Hook

**Files:**
- Create: `src/hooks/useGameLoop.ts`

**Step 1: Create game loop hook**

Create `src/hooks/useGameLoop.ts`:
```typescript
import { useRef, useEffect, useCallback } from 'react';

export function useGameLoop(
  callback: (deltaTime: number) => void,
  isRunning: boolean
) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.1);
      callback(deltaTime);
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [callback]);

  useEffect(() => {
    if (isRunning) {
      previousTimeRef.current = undefined;
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning, animate]);
}
```

**Step 2: Commit**

```bash
git add src/hooks/useGameLoop.ts
git commit -m "feat: add game loop hook"
```

---

## Task 12: Player Controller

**Files:**
- Create: `src/game/PlayerController.ts`

**Step 1: Create player controller class**

Create `src/game/PlayerController.ts`:
```typescript
import { Level, TILE_SIZE, PlayerState } from '../types/level';
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
  private jumpHeld: boolean = false;

  constructor(level: Level) {
    this.level = level;
    this.state = this.createInitialState();
  }

  private createInitialState(): PlayerState {
    const spawn = findSpawnPoint(this.level);
    const spawnX = spawn ? spawn.x * TILE_SIZE + (TILE_SIZE - PLAYER.WIDTH) / 2 : 100;
    const spawnY = spawn ? spawn.y * TILE_SIZE + (TILE_SIZE - PLAYER.HEIGHT) : 100;

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
      velocity.y
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
```

**Step 2: Commit**

```bash
git add src/game/PlayerController.ts
git commit -m "feat: add player controller with coyote time and jump buffering"
```

---

## Task 13: Game Canvas Component

**Files:**
- Create: `src/components/Game/GameCanvas.tsx`
- Create: `src/components/Game/GameCanvas.css`

**Step 1: Create game canvas component**

Create `src/components/Game/GameCanvas.tsx`:
```tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { Level, TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../../types/level';
import { renderLevel, TILE_COLORS } from '../../utils/rendering';
import { PLAYER } from '../../utils/physics';
import { PlayerController, InputState } from '../../game/PlayerController';
import { useGameLoop } from '../../hooks/useGameLoop';
import './GameCanvas.css';

interface GameCanvasProps {
  level: Level;
  onExit: () => void;
}

export function GameCanvas({ level, onExit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<PlayerController>();
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    jumpReleased: false,
  });

  const [gameState, setGameState] = useState<'playing' | 'dead' | 'won'>('playing');
  const [deathCount, setDeathCount] = useState(0);

  // Initialize controller
  useEffect(() => {
    controllerRef.current = new PlayerController(level);
  }, [level]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          inputRef.current.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          inputRef.current.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          inputRef.current.jump = true;
          inputRef.current.jumpPressed = true;
          break;
        case 'Escape':
          onExit();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          inputRef.current.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          inputRef.current.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
        case 'Space':
          inputRef.current.jump = false;
          inputRef.current.jumpReleased = true;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onExit]);

  // Game loop
  const gameLoop = useCallback(() => {
    const controller = controllerRef.current;
    const canvas = canvasRef.current;
    if (!controller || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (gameState === 'playing') {
      // Update
      const result = controller.update(inputRef.current);

      // Clear one-frame inputs
      inputRef.current.jumpPressed = false;
      inputRef.current.jumpReleased = false;

      if (result.hitHazard) {
        setGameState('dead');
        setDeathCount(c => c + 1);
        setTimeout(() => {
          controller.respawn();
          setGameState('playing');
        }, 500);
      }

      if (result.reachedGoal) {
        setGameState('won');
      }
    }

    // Render
    renderLevel(ctx, level, false);

    // Draw player
    const { position } = controller.state;
    ctx.fillStyle = '#63b3ed';
    ctx.fillRect(position.x, position.y, PLAYER.WIDTH, PLAYER.HEIGHT);

    // Player face
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(position.x + 6, position.y + 8, 6, 6);
    ctx.fillRect(position.x + 16, position.y + 8, 6, 6);
    ctx.fillRect(position.x + 8, position.y + 20, 12, 4);

    // Death flash
    if (gameState === 'dead') {
      ctx.fillStyle = 'rgba(229, 62, 62, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [level, gameState]);

  useGameLoop(gameLoop, true);

  const handleRestart = () => {
    controllerRef.current?.respawn();
    setGameState('playing');
  };

  return (
    <div className="game-container">
      <div className="game-hud">
        <span>Deaths: {deathCount}</span>
        <span className="controls-hint">WASD/Arrows to move, Space to jump, ESC to exit</span>
      </div>

      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={GRID_WIDTH * TILE_SIZE}
        height={GRID_HEIGHT * TILE_SIZE}
      />

      {gameState === 'won' && (
        <div className="game-overlay">
          <div className="overlay-content won">
            <h2>🎉 Level Complete!</h2>
            <p>Deaths: {deathCount}</p>
            <div className="overlay-buttons">
              <button onClick={handleRestart}>Play Again</button>
              <button onClick={onExit}>Edit Level</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

Create `src/components/Game/GameCanvas.css`:
```css
.game-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.game-hud {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 800px;
  padding: 8px 16px;
  background: #16213e;
  border-radius: 6px;
  font-size: 14px;
}

.controls-hint {
  color: #888;
}

.game-canvas {
  border: 2px solid #333;
  border-radius: 4px;
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
}

.overlay-content {
  text-align: center;
  padding: 32px 48px;
  background: #16213e;
  border-radius: 12px;
}

.overlay-content h2 {
  margin-bottom: 16px;
}

.overlay-content.won h2 {
  color: #d69e2e;
}

.overlay-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: center;
}

.overlay-buttons button {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #2d3748;
  color: #eee;
  transition: background 0.15s;
}

.overlay-buttons button:hover {
  background: #4a5568;
}

.overlay-buttons button:first-child {
  background: #38a169;
}

.overlay-buttons button:first-child:hover {
  background: #2f855a;
}
```

**Step 2: Commit**

```bash
git add src/components/Game/GameCanvas.tsx src/components/Game/GameCanvas.css
git commit -m "feat: add game canvas with player rendering and win/death states"
```

---

## Task 14: Integrate Play Mode

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add game canvas to app**

Replace `src/App.tsx`:
```tsx
import { useEditorState } from './hooks/useEditorState';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { TilePalette } from './components/Editor/TilePalette';
import { Toolbar } from './components/Editor/Toolbar';
import { GameCanvas } from './components/Game/GameCanvas';
import { saveLevel, loadLevel, hasSpawnPoint } from './utils/storage';
import './App.css';

function App() {
  const {
    level,
    setLevel,
    selectedTile,
    setSelectedTile,
    mode,
    setMode,
    toggleMode,
    setTile,
    clearLevel,
  } = useEditorState();

  const handleSave = () => {
    if (saveLevel(level)) {
      alert('Level saved!');
    } else {
      alert('Failed to save level');
    }
  };

  const handleLoad = () => {
    const loaded = loadLevel();
    if (loaded) {
      setLevel(loaded);
      alert('Level loaded!');
    } else {
      alert('No saved level found');
    }
  };

  const handleExitPlay = () => {
    setMode('edit');
  };

  const canPlay = hasSpawnPoint(level);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Level Editor</h1>
        <Toolbar
          mode={mode}
          onToggleMode={toggleMode}
          onClear={clearLevel}
          onSave={handleSave}
          onLoad={handleLoad}
          canPlay={canPlay}
        />
      </header>

      <main className="app-main">
        {mode === 'edit' && (
          <aside className="sidebar">
            <TilePalette
              selectedTile={selectedTile}
              onSelectTile={setSelectedTile}
            />
          </aside>
        )}

        <div className="canvas-container">
          {mode === 'edit' ? (
            <EditorCanvas
              level={level}
              selectedTile={selectedTile}
              onSetTile={setTile}
            />
          ) : (
            <GameCanvas
              level={level}
              onExit={handleExitPlay}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
```

**Step 2: Verify everything works**

Run:
```bash
npm run dev
```

Expected:
1. Can place tiles in editor
2. Can add spawn point and goal
3. Click Play switches to game mode
4. Can move player with WASD/arrows
5. Space jumps with variable height
6. Hitting hazard = death + respawn
7. Reaching goal = win screen
8. ESC or Edit button returns to editor

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate play mode with full game loop"
```

---

## Task 15: Final Polish and Testing

**Files:**
- Modify: various for bug fixes if needed

**Step 1: Manual testing checklist**

Test each feature:
- [ ] Place all tile types (platform, hazard, spawn, goal)
- [ ] Right-click erases tiles
- [ ] Only one spawn point allowed
- [ ] Only one goal allowed
- [ ] Clear button works
- [ ] Save and load persist across refresh
- [ ] Play mode requires spawn point
- [ ] Movement feels tight and responsive
- [ ] Coyote time works (jump after walking off platform)
- [ ] Jump buffering works (press jump slightly before landing)
- [ ] Variable jump height (tap vs hold)
- [ ] Death respawns at spawn
- [ ] Reaching goal shows win screen
- [ ] Death counter tracks correctly
- [ ] ESC exits play mode

**Step 2: Fix any issues found**

(Document and fix as needed)

**Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete level editor MVP"
```

---

## Summary

| Task | Description | Est. Time |
|------|-------------|-----------|
| 1 | Project Setup | 5 min |
| 2 | Core Types | 5 min |
| 3 | Editor State Hook | 10 min |
| 4 | Tile Palette Component | 10 min |
| 5 | Editor Canvas Component | 15 min |
| 6 | Toolbar Component | 10 min |
| 7 | Storage Utilities | 5 min |
| 8 | Integrate Editor in App | 10 min |
| 9 | Physics Constants | 5 min |
| 10 | Collision Detection | 20 min |
| 11 | Game Loop Hook | 5 min |
| 12 | Player Controller | 20 min |
| 13 | Game Canvas Component | 20 min |
| 14 | Integrate Play Mode | 10 min |
| 15 | Polish and Testing | 15 min |

**Total estimated time: ~2.5-3 hours**

---

## Post-MVP Stretch Goals

After completing MVP, consider adding:
1. Undo/redo in editor
2. Multiple tile themes
3. Moving platforms
4. Export/import level as URL
5. Collectibles and timer
