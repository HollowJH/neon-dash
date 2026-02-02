import { useRef, useEffect, useState, useCallback } from 'react';
import type { Level } from '../../types/level';
import { renderLevel } from '../../utils/rendering';
import { PLAYER } from '../../utils/physics';
import { PlayerController } from '../../game/PlayerController';
import type { InputState } from '../../game/PlayerController';
import { useGameLoop } from '../../hooks/useGameLoop';
import { useResponsiveTileSize } from '../../hooks/useResponsiveTileSize';
import { gameParticles } from '../../game/ParticleSystem';
import { screenShake } from '../../game/ScreenShake';
import {
  emitLandingDust,
  emitJumpParticles,
  emitDashTrail,
  emitDeathExplosion,
  emitGoalSparkle
} from '../../game/particles';
import { CORE_COLORS, GLOW_COLORS, drawWithGlow } from '../../utils/colors';
import './GameCanvas.css';

interface GameCanvasProps {
  level: Level;
  onExit: () => void;
  onComplete?: () => void;
  hint?: string;
}

export function GameCanvas({ level, onExit, onComplete, hint }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<PlayerController | null>(null);
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    jumpReleased: false,
    dash: false,
    dashPressed: false,
  });

  const [gameState, setGameState] = useState<'playing' | 'dead' | 'won'>('playing');
  const [deathCount, setDeathCount] = useState(0);

  const tileSize = useResponsiveTileSize(
    level.width,
    level.height,
    { top: 100, right: 100, bottom: 100, left: 300 }
  );

  // Initialize controller
  useEffect(() => {
    controllerRef.current = new PlayerController(level, tileSize);
  }, [level, tileSize]);

  // Auto-focus canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.focus();
    }
  }, []);

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
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.dash = true;
          inputRef.current.dashPressed = true;
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
        case 'ShiftLeft':
        case 'ShiftRight':
          inputRef.current.dash = false;
          inputRef.current.dashPressed = false;
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

  // Helper to find goal position
  const findGoalPosition = useCallback((level: Level, tileSize: number): { x: number; y: number } | null => {
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.width; x++) {
        if (level.tiles[y][x] === 'goal') {
          return { x: x * tileSize, y: y * tileSize };
        }
      }
    }
    return null;
  }, []);

  // Game loop
  const gameLoop = useCallback((time: number) => {
    const controller = controllerRef.current;
    const canvas = canvasRef.current;
    if (!controller || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const deltaTime = 16; // Fixed timestep for physics

    if (gameState === 'playing') {
      // Track previous state for effect triggers
      const wasGrounded = controller.state.isGrounded;

      // Update
      const result = controller.update(inputRef.current, deltaTime);

      // Emit effects based on state changes
      if (!wasGrounded && controller.state.isGrounded) {
        // Landed - emit dust and shake
        const landingIntensity = Math.min(Math.abs(controller.state.velocity.y) / 500, 2);
        emitLandingDust(
          controller.state.position.x + PLAYER.WIDTH / 2,
          controller.state.position.y + PLAYER.HEIGHT,
          landingIntensity
        );
        screenShake.trigger(landingIntensity * 3);
      }

      if (inputRef.current.jumpPressed && (controller.state.isGrounded || controller.isOnWall)) {
        emitJumpParticles(
          controller.state.position.x + PLAYER.WIDTH / 2,
          controller.state.position.y + PLAYER.HEIGHT
        );
      }

      if (controller.isDashing) {
        emitDashTrail(
          controller.state.position.x + PLAYER.WIDTH / 2,
          controller.state.position.y + PLAYER.HEIGHT / 2,
          controller.dashDirection
        );
      }

      // Clear one-frame inputs
      inputRef.current.jumpPressed = false;
      inputRef.current.jumpReleased = false;
      inputRef.current.dashPressed = false;

      if (result.hitHazard) {
        emitDeathExplosion(
          controller.state.position.x + PLAYER.WIDTH / 2,
          controller.state.position.y + PLAYER.HEIGHT / 2
        );
        screenShake.trigger(10);
        setGameState('dead');
        setDeathCount(c => c + 1);
        setTimeout(() => {
          controller.respawn();
          setGameState('playing');
        }, 500);
      }

      if (result.reachedGoal) {
        setGameState('won');
        onComplete?.();
      }
    }

    // Update particles and screen shake
    gameParticles.update(deltaTime);
    screenShake.update();

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply screen shake
    ctx.save();
    screenShake.apply(ctx);

    renderLevel(ctx, level, false, tileSize, time);

    // Emit goal sparkles
    const goalPos = findGoalPosition(level, tileSize);
    if (goalPos) {
      emitGoalSparkle(goalPos.x, goalPos.y, tileSize);
    }

    // Draw player with glow
    const { position } = controller.state;
    const playerColor = controller.isDashing ? CORE_COLORS.playerDashing : CORE_COLORS.player;
    const playerGlow = controller.isDashing ? GLOW_COLORS.playerDashing : GLOW_COLORS.player;

    drawWithGlow(ctx, () => {
      ctx.fillStyle = playerColor;
      ctx.fillRect(position.x, position.y, PLAYER.WIDTH, PLAYER.HEIGHT);
    }, playerGlow, controller.isDashing ? 15 : 8);

    // Player face
    ctx.fillStyle = CORE_COLORS.background;
    ctx.fillRect(position.x + 6, position.y + 8, 6, 6);
    ctx.fillRect(position.x + 16, position.y + 8, 6, 6);
    ctx.fillRect(position.x + 8, position.y + 20, 12, 4);

    // Render particles
    gameParticles.render(ctx);

    ctx.restore(); // Remove shake transform

    // Death flash
    if (gameState === 'dead') {
      ctx.fillStyle = 'rgba(229, 62, 62, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [level, gameState, tileSize, onComplete, findGoalPosition]);

  useGameLoop(gameLoop, true);

  const handleRestart = () => {
    controllerRef.current?.respawn();
    gameParticles.clear();
    screenShake.reset();
    setGameState('playing');
  };

  return (
    <div className="game-container">
      <div className="game-hud">
        <div className="hud-stats">
          <span>Deaths: {deathCount}</span>
        </div>
        {hint && (
          <div className="level-hint">
            <span>{hint}</span>
          </div>
        )}
        <div className="controls-hint">
          WASD/Arrows: move | Space: jump | Shift: dash | ESC: exit
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="game-canvas"
        tabIndex={0}
        width={level.width * tileSize}
        height={level.height * tileSize}
        role="application"
        aria-label="Game playfield - use WASD or arrow keys to move, space to jump"
      />

      {gameState === 'won' && (
        <div className="game-overlay">
          <div className="overlay-content won">
            <h2>🎉 Level Complete!</h2>
            <p>Deaths: {deathCount}</p>
            <div className="overlay-buttons">
              <button onClick={handleRestart} aria-label="Restart level">Play Again</button>
              <button onClick={onExit} aria-label="Return to menu">Exit to Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
