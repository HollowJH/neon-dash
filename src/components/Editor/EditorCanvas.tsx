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
  const [isDrawing, setIsDrawing] = useState(false);

  const tileSize = useResponsiveTileSize(
    level.width,
    level.height,
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

    // Right click = erase
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
  );
}
