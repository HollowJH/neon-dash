import { useState } from 'react';
import { useEditorState } from './hooks/useEditorState';
import { EditorCanvas } from './components/Editor/EditorCanvas';
import { TilePalette } from './components/Editor/TilePalette';
import { Toolbar } from './components/Editor/Toolbar';
import { GameCanvas } from './components/Game/GameCanvas';
import { LevelSelect } from './components/LevelSelect/LevelSelect';
import type { DemoLevel } from './data/demoLevels';
import type { Level } from './types/level';
import { DEMO_LEVELS } from './data/demoLevels';
import { saveLevel, loadLevel, hasSpawnPoint } from './utils/storage';
import './App.css';

type AppScreen = 'menu' | 'editor' | 'playing';

function App() {
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [currentDemoLevel, setCurrentDemoLevel] = useState<DemoLevel | null>(null);
  const [completedLevels, setCompletedLevels] = useState<Set<string>>(new Set());
  const [playingLevel, setPlayingLevel] = useState<Level | null>(null); // Separate state for playing

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

  const handleSelectLevel = (demoLevel: DemoLevel) => {
    setCurrentDemoLevel(demoLevel);
    setPlayingLevel(demoLevel.data); // Use separate playing level
    setScreen('playing');
    setMode('play');
  };

  const handleOpenEditor = () => {
    setCurrentDemoLevel(null);
    setPlayingLevel(null);
    setScreen('editor');
    setMode('edit');
  };

  const handleBackToMenu = () => {
    setScreen('menu');
    setMode('edit');
  };

  const handleLevelComplete = () => {
    if (currentDemoLevel) {
      setCompletedLevels(prev => new Set(prev).add(currentDemoLevel.id));
    }
  };

  const handleNextLevel = () => {
    if (!currentDemoLevel) return;

    const currentIndex = DEMO_LEVELS.findIndex(l => l.id === currentDemoLevel.id);
    const nextLevel = DEMO_LEVELS[currentIndex + 1];

    if (nextLevel) {
      handleSelectLevel(nextLevel);
    }
  };

  const getNextLevel = (): DemoLevel | null => {
    if (!currentDemoLevel) return null;
    const currentIndex = DEMO_LEVELS.findIndex(l => l.id === currentDemoLevel.id);
    return DEMO_LEVELS[currentIndex + 1] || null;
  };

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
      onGridSizeChange(loaded.width, loaded.height);
      alert('Level loaded!');
    } else {
      alert('No saved level found');
    }
  };

  const handleExitPlay = () => {
    if (currentDemoLevel) {
      setScreen('menu');
    } else {
      setScreen('editor');
    }
    setMode('edit');
  };

  const canPlay = hasSpawnPoint(level);

  return (
    <>
      {screen === 'menu' && (
        <LevelSelect
          onSelectLevel={handleSelectLevel}
          onOpenEditor={handleOpenEditor}
          completedLevels={completedLevels}
        />
      )}

      {screen === 'editor' && (
        <div className="app">
          <header className="app-header">
            <div className="header-left">
              <button
                className="back-button"
                onClick={handleBackToMenu}
                aria-label="Back to menu"
              >
                ← Menu
              </button>
              <h1>Level Editor</h1>
            </div>
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
            {mode === 'edit' ? (
              <>
                <aside className="sidebar">
                  <TilePalette
                    selectedTile={selectedTile}
                    onSelectTile={setSelectedTile}
                  />
                </aside>

                <div className="canvas-container">
                  <EditorCanvas
                    level={level}
                    selectedTile={selectedTile}
                    onSetTile={setTile}
                  />
                </div>
              </>
            ) : (
              <div className="editor-play-container">
                <GameCanvas
                  level={level}
                  onExit={toggleMode}
                  hint="Press ESC or click Edit to return to editor"
                  exitButtonText="Exit to Editor"
                  viewportPadding={{ top: 120, right: 280, bottom: 60, left: 60 }}
                />
              </div>
            )}
          </main>
        </div>
      )}

      {screen === 'playing' && (
        <div className="app game-mode">
          <GameCanvas
            level={playingLevel || level}
            onExit={handleExitPlay}
            onComplete={handleLevelComplete}
            onNextLevel={getNextLevel() ? handleNextLevel : undefined}
            hint={currentDemoLevel?.hint}
            levelTitle={currentDemoLevel?.name}
          />
        </div>
      )}
    </>
  );
}

export default App;
