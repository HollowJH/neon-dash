import type { InputState } from '../../game/PlayerController';
import './TouchControls.css';

interface TouchControlsProps {
  onInputChange: (input: Partial<InputState>) => void;
}

export function TouchControls({ onInputChange }: TouchControlsProps) {
  // Prevent context menu on long press
  const preventContextMenu = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div className="touch-controls" onContextMenu={preventContextMenu}>
      <div className="touch-left">
        <button
          className="touch-btn touch-left-btn"
          onPointerDown={() => onInputChange({ left: true })}
          onPointerUp={() => onInputChange({ left: false })}
          onPointerLeave={() => onInputChange({ left: false })}
          onPointerCancel={() => onInputChange({ left: false })}
          aria-label="Move left"
        >
          ←
        </button>
        <button
          className="touch-btn touch-right-btn"
          onPointerDown={() => onInputChange({ right: true })}
          onPointerUp={() => onInputChange({ right: false })}
          onPointerLeave={() => onInputChange({ right: false })}
          onPointerCancel={() => onInputChange({ right: false })}
          aria-label="Move right"
        >
          →
        </button>
      </div>
      <div className="touch-right">
        <button
          className="touch-btn touch-dash-btn"
          onPointerDown={() => onInputChange({ dash: true, dashPressed: true })}
          onPointerUp={() => onInputChange({ dash: false, dashPressed: false })}
          onPointerLeave={() => onInputChange({ dash: false, dashPressed: false })}
          onPointerCancel={() => onInputChange({ dash: false, dashPressed: false })}
          aria-label="Dash"
        >
          DASH
        </button>
        <button
          className="touch-btn touch-jump-btn"
          onPointerDown={() => onInputChange({ jump: true, jumpPressed: true })}
          onPointerUp={() => onInputChange({ jump: false, jumpReleased: true })}
          onPointerLeave={() => onInputChange({ jump: false })}
          onPointerCancel={() => onInputChange({ jump: false })}
          aria-label="Jump"
        >
          JUMP
        </button>
      </div>
    </div>
  );
}
