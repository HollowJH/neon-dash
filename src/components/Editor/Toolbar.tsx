import type { EditorMode } from '../../hooks/useEditorState';
import './Toolbar.css';

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
