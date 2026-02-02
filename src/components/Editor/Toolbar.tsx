import type { EditorMode } from '../../hooks/useEditorState';
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
