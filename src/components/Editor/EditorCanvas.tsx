import { useRef, useEffect, useCallback, useState } from 'react';
import type { Level, TileType } from '../../types/level';
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../../types/level';
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
      role="img"
      aria-label="Level editor grid - click and drag to place tiles"
    />
  );
}
