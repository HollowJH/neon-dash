import { useEditorState } from './hooks/useEditorState';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { TilePalette } from './components/Editor/TilePalette';
import { Toolbar } from './components/Editor/Toolbar';
import { GameCanvas } from './components/Game/GameCanvas';
import { saveLevel, loadLevel, hasSpawnPoint } from './utils/storage';
import './App.css';

function App() {
  const {
    level,
    setLevel,
    selectedTile,
    setSelectedTile,
    mode,
    setMode,
    toggleMode,
    setTile,
    clearLevel,
    gridWidth,
    gridHeight,
    onGridSizeChange,
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
      // Update grid size state to match loaded level
      onGridSizeChange(loaded.width, loaded.height);
      alert('Level loaded!');
    } else {
      alert('No saved level found');
    }
  };

  const handleExitPlay = () => {
    setMode('edit');
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
          gridWidth={gridWidth}
          gridHeight={gridHeight}
          onGridSizeChange={onGridSizeChange}
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
            <GameCanvas
              level={level}
              onExit={handleExitPlay}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
