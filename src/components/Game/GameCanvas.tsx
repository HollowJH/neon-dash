import { useRef, useEffect, useState, useCallback } from 'react';
import type { Level } from '../../types/level';
import { TILE_SIZE, GRID_WIDTH, GRID_HEIGHT } from '../../types/level';
import { renderLevel } from '../../utils/rendering';
import { PLAYER } from '../../utils/physics';
import { PlayerController } from '../../game/PlayerController';
import type { InputState } from '../../game/PlayerController';
import { useGameLoop } from '../../hooks/useGameLoop';
import './GameCanvas.css';

interface GameCanvasProps {
  level: Level;
  onExit: () => void;
}

export function GameCanvas({ level, onExit }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<PlayerController | null>(null);
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
