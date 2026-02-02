import { useEditorState } from './hooks/useEditorState';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { TilePalette } from './components/Editor/TilePalette';
import { Toolbar } from './components/Editor/Toolbar';
import { saveLevel, loadLevel, hasSpawnPoint } from './utils/storage';
import './App.css';

function App() {
  const {
    level,
    setLevel,
    selectedTile,
    setSelectedTile,
    mode,
    toggleMode,
    setTile,
    clearLevel,
  } = useEditorState();

  const handleSave = () => {
    if (saveLevel(level)) {
      alert('Level saved!');
    } else {
      alert('Failed to save level');
    }
  };

  const handleLoad = () => {
    const loaded = loadLevel();
    if (loaded) {
      setLevel(loaded);
      alert('Level loaded!');
    } else {
      alert('No saved level found');
    }
  };

  const canPlay = hasSpawnPoint(level);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Level Editor</h1>
        <Toolbar
          mode={mode}
          onToggleMode={toggleMode}
          onClear={clearLevel}
          onSave={handleSave}
          onLoad={handleLoad}
          canPlay={canPlay}
        />
      </header>

      <main className="app-main">
        {mode === 'edit' && (
          <aside className="sidebar">
            <TilePalette
              selectedTile={selectedTile}
              onSelectTile={setSelectedTile}
            />
          </aside>
        )}

        <div className="canvas-container">
          {mode === 'edit' ? (
            <EditorCanvas
              level={level}
              selectedTile={selectedTile}
              onSetTile={setTile}
            />
          ) : (
            <div className="play-placeholder">
              <p>Play Mode (coming next...)</p>
              <button onClick={toggleMode}>Back to Edit</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
