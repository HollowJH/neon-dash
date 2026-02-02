# Web Interface Guidelines Compliance Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix all Web Interface Guidelines violations and implement recommended accessibility/UX improvements.

**Issues to Address:**
1. 7 buttons lack aria-labels (Critical - Accessibility)
2. 2 canvas elements lack aria-labels (Critical - Accessibility)
3. CSS uses `transition: all` instead of explicit properties (Performance)
4. Missing touch-action optimization (UX)
5. No prefers-reduced-motion support (Accessibility)
6. No focus-visible styling (Accessibility)
7. Straight quotes instead of curly quotes (Typography)

---

## Task 1: Add Aria Labels to Buttons

**Files:**
- Modify: `src/components/Editor/Toolbar.tsx`
- Modify: `src/components/Game/GameCanvas.tsx`

**Step 1: Add aria-labels to Toolbar buttons**

In `src/components/Editor/Toolbar.tsx`, update all buttons:

```tsx
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

{/* ... */}

<button onClick={onSave} disabled={mode === 'play'} aria-label="Save level">
  💾 Save
</button>
<button onClick={onLoad} disabled={mode === 'play'} aria-label="Load level">
  📂 Load
</button>
<button onClick={onClear} disabled={mode === 'play'} className="danger" aria-label="Clear level">
  🗑 Clear
</button>
```

**Step 2: Add aria-labels to GameCanvas buttons**

In `src/components/Game/GameCanvas.tsx`, update the win overlay buttons:

```tsx
<div className="overlay-buttons">
  <button onClick={handleRestart} aria-label="Restart level">
    Play Again
  </button>
  <button onClick={onExit} aria-label="Return to level editor">
    Edit Level
  </button>
</div>
```

**Step 3: Commit**

```bash
git add src/components/Editor/Toolbar.tsx src/components/Game/GameCanvas.tsx
git commit -m "fix(a11y): add aria-labels to all interactive buttons"
```

---

## Task 2: Add Aria Labels and Roles to Canvas Elements

**Files:**
- Modify: `src/components/Editor/EditorCanvas.tsx`
- Modify: `src/components/Game/GameCanvas.tsx`

**Step 1: Add aria-label to EditorCanvas**

In `src/components/Editor/EditorCanvas.tsx`:

```tsx
<canvas
  ref={canvasRef}
  className="editor-canvas"
  width={GRID_WIDTH * TILE_SIZE}
  height={GRID_HEIGHT * TILE_SIZE}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerLeave={handlePointerUp}
  onContextMenu={handleContextMenu}
  role="img"
  aria-label="Level editor grid - click and drag to place tiles"
/>
```

**Step 2: Add aria-label to GameCanvas**

In `src/components/Game/GameCanvas.tsx`:

```tsx
<canvas
  ref={canvasRef}
  className="game-canvas"
  tabIndex={0}
  width={GRID_WIDTH * TILE_SIZE}
  height={GRID_HEIGHT * TILE_SIZE}
  role="application"
  aria-label="Game playfield - use WASD or arrow keys to move, space to jump"
/>
```

**Step 3: Commit**

```bash
git add src/components/Editor/EditorCanvas.tsx src/components/Game/GameCanvas.tsx
git commit -m "fix(a11y): add aria-labels and roles to canvas elements"
```

---

## Task 3: Fix CSS Transitions (Use Explicit Properties)

**Files:**
- Modify: `src/components/Editor/TilePalette.css`
- Modify: `src/components/Editor/Toolbar.css`

**Step 1: Update TilePalette.css**

In `src/components/Editor/TilePalette.css`, replace line 33:

```css
.tile-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #1a1a2e;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #eee;
  font-size: 14px;
  transition: background-color 0.15s, border-color 0.15s; /* Was: all 0.15s */
}
```

**Step 2: Update Toolbar.css**

In `src/components/Editor/Toolbar.css`, replace line 23:

```css
.toolbar button {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #2d3748;
  color: #eee;
  transition: background-color 0.15s; /* Was: all 0.15s */
}
```

**Step 3: Commit**

```bash
git add src/components/Editor/TilePalette.css src/components/Editor/Toolbar.css
git commit -m "perf: use explicit transition properties instead of 'all'"
```

---

## Task 4: Add Touch Optimization

**Files:**
- Modify: `src/components/Editor/TilePalette.css`
- Modify: `src/components/Editor/Toolbar.css`
- Modify: `src/components/Game/GameCanvas.css`

**Step 1: Add touch-action to tile buttons**

In `src/components/Editor/TilePalette.css`, add to `.tile-option`:

```css
.tile-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #1a1a2e;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #eee;
  font-size: 14px;
  transition: background-color 0.15s, border-color 0.15s;
  touch-action: manipulation; /* Add this */
}
```

**Step 2: Add touch-action to toolbar buttons**

In `src/components/Editor/Toolbar.css`, add to `.toolbar button`:

```css
.toolbar button {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #2d3748;
  color: #eee;
  transition: background-color 0.15s;
  touch-action: manipulation; /* Add this */
}
```

**Step 3: Add touch-action to game overlay buttons**

In `src/components/Game/GameCanvas.css`, add to `.overlay-buttons button`:

```css
.overlay-buttons button {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: #2d3748;
  color: #eee;
  transition: background 0.15s;
  touch-action: manipulation; /* Add this */
}
```

**Step 4: Commit**

```bash
git add src/components/Editor/TilePalette.css src/components/Editor/Toolbar.css src/components/Game/GameCanvas.css
git commit -m "feat(ux): add touch-action optimization for mobile devices"
```

---

## Task 5: Add Reduced Motion Support

**Files:**
- Modify: `src/components/Editor/TilePalette.css`
- Modify: `src/components/Editor/Toolbar.css`
- Modify: `src/components/Game/GameCanvas.css`

**Step 1: Add prefers-reduced-motion to TilePalette.css**

At the end of `src/components/Editor/TilePalette.css`, add:

```css
@media (prefers-reduced-motion: reduce) {
  .tile-option {
    transition: none;
  }
}
```

**Step 2: Add prefers-reduced-motion to Toolbar.css**

At the end of `src/components/Editor/Toolbar.css`, add:

```css
@media (prefers-reduced-motion: reduce) {
  .toolbar button {
    transition: none;
  }
}
```

**Step 3: Add prefers-reduced-motion to GameCanvas.css**

At the end of `src/components/Game/GameCanvas.css`, add:

```css
@media (prefers-reduced-motion: reduce) {
  .overlay-buttons button {
    transition: none;
  }
}
```

**Step 4: Commit**

```bash
git add src/components/Editor/TilePalette.css src/components/Editor/Toolbar.css src/components/Game/GameCanvas.css
git commit -m "feat(a11y): honor prefers-reduced-motion user preference"
```

---

## Task 6: Add Focus-Visible Styling

**Files:**
- Modify: `src/App.css`
- Modify: `src/components/Editor/TilePalette.css`
- Modify: `src/components/Editor/Toolbar.css`
- Modify: `src/components/Game/GameCanvas.css`
- Modify: `src/components/Editor/EditorCanvas.css`

**Step 1: Add global focus-visible reset to App.css**

At the top of `src/App.css`, add:

```css
/* Focus-visible for better keyboard navigation */
*:focus {
  outline: none;
}

*:focus-visible {
  outline: 2px solid #63b3ed;
  outline-offset: 2px;
}
```

**Step 2: Add focus-visible to tile buttons**

In `src/components/Editor/TilePalette.css`, add:

```css
.tile-option:focus-visible {
  outline: 2px solid #63b3ed;
  outline-offset: 2px;
}
```

**Step 3: Add focus-visible to toolbar buttons**

In `src/components/Editor/Toolbar.css`, add:

```css
.toolbar button:focus-visible {
  outline: 2px solid #63b3ed;
  outline-offset: 2px;
}
```

**Step 4: Add focus-visible to game buttons**

In `src/components/Game/GameCanvas.css`, add:

```css
.overlay-buttons button:focus-visible {
  outline: 2px solid #63b3ed;
  outline-offset: 2px;
}
```

**Step 5: Add focus-visible to canvases**

In `src/components/Editor/EditorCanvas.css`, add:

```css
.editor-canvas:focus-visible {
  outline: 2px solid #63b3ed;
  outline-offset: 2px;
}
```

In `src/components/Game/GameCanvas.css`, add:

```css
.game-canvas:focus-visible {
  outline: 2px solid #63b3ed;
  outline-offset: 2px;
}
```

**Step 6: Commit**

```bash
git add src/App.css src/components/Editor/TilePalette.css src/components/Editor/Toolbar.css src/components/Game/GameCanvas.css src/components/Editor/EditorCanvas.css
git commit -m "feat(a11y): add visible focus indicators for keyboard navigation"
```

---

## Task 7: Fix Typography (Curly Quotes and Ellipsis)

**Files:**
- Modify: `src/components/Game/GameCanvas.tsx`
- Modify: `src/App.tsx`

**Step 1: Replace straight quotes with curly quotes**

In `src/components/Game/GameCanvas.tsx`, update line 160:

```tsx
<span className="controls-hint">WASD/Arrows to move, Space to jump, ESC to exit</span>
```

No quotes to fix here.

In `src/App.tsx`, update alert messages (lines 24, 26, 34, 36):

```tsx
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
```

**Note:** Alert messages already use straight quotes which is acceptable for system messages. The guideline mainly applies to user-facing content in the UI. If there were any ellipsis (...), we'd replace them with (…).

**Step 2: Skip commit if no changes needed**

Since the typography is acceptable (alert messages use standard quotes), we can skip this task or note it as verified.

---

## Task 8: Verify All Improvements

**Step 1: Manual testing checklist**

Test accessibility improvements:
- [ ] Tab through all buttons - visible focus ring appears
- [ ] Screen reader announces all buttons with meaningful labels
- [ ] Canvas elements have descriptive labels
- [ ] Touch interactions feel responsive on mobile
- [ ] Animations respect prefers-reduced-motion setting

Test performance:
- [ ] Button hover transitions are smooth
- [ ] No unnecessary style recalculations

**Step 2: Run build to verify no errors**

```bash
npm run build
```

Expected: Build succeeds with no warnings

**Step 3: Test in browser**

1. Open dev tools accessibility tab
2. Run Lighthouse accessibility audit
3. Verify improved score

---

## Summary

| Task | Description | Priority |
|------|-------------|----------|
| 1 | Add aria-labels to buttons | Critical |
| 2 | Add aria-labels to canvas elements | Critical |
| 3 | Fix CSS transitions | High |
| 4 | Add touch-action optimization | Medium |
| 5 | Add reduced motion support | High |
| 6 | Add focus-visible styling | High |
| 7 | Fix typography | Low |
| 8 | Verify improvements | Testing |

**Estimated time: 30-40 minutes**

**Expected Results:**
- Improved Lighthouse accessibility score (90+)
- Better screen reader support
- Smoother mobile interactions
- Respectful of user motion preferences
- Clear keyboard navigation
