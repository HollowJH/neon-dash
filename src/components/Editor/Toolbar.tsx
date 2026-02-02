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
