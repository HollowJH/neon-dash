import { useRef, useEffect, useState, useCallback } from 'react';
import type { Level } from '../../types/level';
import { renderLevel } from '../../utils/rendering';
import { getPlayerDimensions } from '../../utils/physics';
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
import { soundManager } from '../../audio/SoundManager';
import { TouchControls } from './TouchControls';
import './GameCanvas.css';

interface ViewportPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

interface GameCanvasProps {
  level: Level;
  onExit: () => void;
  onComplete?: () => void;
  onNextLevel?: () => void;
  hint?: string;
  exitButtonText?: string;
  levelTitle?: string;
  viewportPadding?: ViewportPadding;
}

export function GameCanvas({ level, onExit, onComplete, onNextLevel, hint, exitButtonText = 'Exit to Menu', levelTitle, viewportPadding }: GameCanvasProps) {
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

  const tileSize = useResponsiveTileSize(level.width, level.height, viewportPadding);

  // Calculate player dimensions based on tile size
  const playerDims = getPlayerDimensions(tileSize);

  // Initialize controller and reset game state when level changes
  useEffect(() => {
    controllerRef.current = new PlayerController(level, tileSize);
    setGameState('playing');
    setDeathCount(0);
    gameParticles.clear();
    screenShake.reset();
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

      // Initialize audio on first interaction
      soundManager.init();

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
      const wasOnWall = controller.isOnWall;

      // Update
      const result = controller.update(inputRef.current, deltaTime);

      // Emit effects based on state changes
      if (!wasGrounded && controller.state.isGrounded) {
        // Landed - emit dust and shake
        const landingIntensity = Math.min(Math.abs(controller.state.velocity.y) / 500, 2);
        emitLandingDust(
          controller.state.position.x + playerDims.WIDTH / 2,
          controller.state.position.y + playerDims.HEIGHT,
          landingIntensity
        );
        screenShake.trigger(landingIntensity * 3);
        soundManager.play('land');
      }

      if (inputRef.current.jumpPressed && (wasGrounded || wasOnWall)) {
        emitJumpParticles(
          controller.state.position.x + playerDims.WIDTH / 2,
          controller.state.position.y + playerDims.HEIGHT
        );
        soundManager.play('jump');
      }

      if (controller.isDashing) {
        emitDashTrail(
          controller.state.position.x + playerDims.WIDTH / 2,
          controller.state.position.y + playerDims.HEIGHT / 2,
          controller.dashDirection
        );
      }

      // Play dash sound on dash start (check if we just started dashing)
      if (inputRef.current.dashPressed && controller.isDashing) {
        soundManager.play('dash');
      }

      // Clear one-frame inputs
      inputRef.current.jumpPressed = false;
      inputRef.current.jumpReleased = false;
      inputRef.current.dashPressed = false;

      if (result.hitHazard) {
        emitDeathExplosion(
          controller.state.position.x + playerDims.WIDTH / 2,
          controller.state.position.y + playerDims.HEIGHT / 2
        );
        screenShake.trigger(10);
        soundManager.play('death');
        setGameState('dead');
        setDeathCount(c => c + 1);
        setTimeout(() => {
          controller.respawn();
          setGameState('playing');
        }, 500);
      }

      if (result.reachedGoal) {
        soundManager.play('goal');
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
      ctx.fillRect(position.x, position.y, playerDims.WIDTH, playerDims.HEIGHT);
    }, playerGlow, controller.isDashing ? 15 : 8);

    // Player face (proportional to player size)
    const faceScale = playerDims.WIDTH / 28; // Original width was 28
    ctx.fillStyle = CORE_COLORS.background;
    ctx.fillRect(position.x + 6 * faceScale, position.y + 8 * faceScale, 6 * faceScale, 6 * faceScale);
    ctx.fillRect(position.x + 16 * faceScale, position.y + 8 * faceScale, 6 * faceScale, 6 * faceScale);
    ctx.fillRect(position.x + 8 * faceScale, position.y + 20 * faceScale, 12 * faceScale, 4 * faceScale);

    // Render particles
    gameParticles.render(ctx);

    ctx.restore(); // Remove shake transform

    // Death flash
    if (gameState === 'dead') {
      ctx.fillStyle = 'rgba(229, 62, 62, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [level, gameState, tileSize, playerDims, onComplete, findGoalPosition]);

  useGameLoop(gameLoop, true);

  const handleRestart = () => {
    controllerRef.current?.respawn();
    gameParticles.clear();
    screenShake.reset();
    setGameState('playing');
  };

  // Handle touch input from TouchControls
  const handleTouchInput = useCallback((input: Partial<InputState>) => {
    // Initialize audio on first touch
    soundManager.init();

    Object.assign(inputRef.current, input);
  }, []);

  return (
    <div className="game-layout">
      <div className="canvas-wrapper">
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
                {onNextLevel && (
                  <button onClick={onNextLevel} className="primary" aria-label="Next level">Next Level</button>
                )}
                <button onClick={onExit} aria-label="Return to menu">{exitButtonText}</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="game-info-sidebar">
        {levelTitle && (
          <div className="info-section level-title">
            <h2>{levelTitle}</h2>
          </div>
        )}

        <div className="info-section">
          <h3>Stats</h3>
          <p>Deaths: {deathCount}</p>
        </div>

        {hint && (
          <div className="info-section hint">
            <h3>Hint</h3>
            <p>{hint}</p>
          </div>
        )}

        <div className="info-section controls">
          <h3>Controls</h3>
          <ul>
            <li>WASD/Arrows: move</li>
            <li>Space: jump</li>
            <li>Shift: dash</li>
            <li>ESC: exit</li>
          </ul>
        </div>
      </div>

      <TouchControls onInputChange={handleTouchInput} />
    </div>
  );
}
