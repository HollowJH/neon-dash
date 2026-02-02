import { DEMO_LEVELS, DemoLevel } from '../../data/demoLevels';
import './LevelSelect.css';

interface LevelSelectProps {
  onSelectLevel: (level: DemoLevel) => void;
  onOpenEditor: () => void;
  completedLevels: Set<string>;
}

export function LevelSelect({ onSelectLevel, onOpenEditor, completedLevels }: LevelSelectProps) {
  return (
    <div className="level-select">
      <div className="level-select-content">
        <h1 className="level-select-title">Neon Dash</h1>
        <p className="level-select-subtitle">Select a level or create your own</p>

        <div className="level-grid">
          {DEMO_LEVELS.map((level, index) => (
            <button
              key={level.id}
              className={`level-card ${completedLevels.has(level.id) ? 'completed' : ''}`}
              onClick={() => onSelectLevel(level)}
              aria-label={`Play ${level.name}${completedLevels.has(level.id) ? ' (completed)' : ''}`}
            >
              <span className="level-number">{index + 1}</span>
              <span className="level-name">{level.name}</span>
              {completedLevels.has(level.id) && (
                <span className="level-check" aria-hidden="true">✓</span>
              )}
            </button>
          ))}

          <button
            className="level-card editor-card"
            onClick={onOpenEditor}
            aria-label="Open level editor"
          >
            <span className="level-number">+</span>
            <span className="level-name">Create Level</span>
          </button>
        </div>

        <div className="controls-reference">
          <h2>Controls</h2>
          <div className="controls-grid">
            <div className="control-item">
              <kbd>WASD</kbd> / <kbd>Arrows</kbd>
              <span>Move</span>
            </div>
            <div className="control-item">
              <kbd>Space</kbd>
              <span>Jump / Wall Jump</span>
            </div>
            <div className="control-item">
              <kbd>Shift</kbd>
              <span>Dash</span>
            </div>
            <div className="control-item">
              <kbd>ESC</kbd>
              <span>Exit to Menu</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
