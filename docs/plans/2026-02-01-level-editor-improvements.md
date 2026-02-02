# Level Editor Improvements Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix critical bugs (player sinking, focus issue) and add support for larger maps.

**Issues to Address:**
1. Player sinks through platforms (collision bug)
2. Space key triggers Play/Edit button instead of jump (focus issue)
3. Map is too small (enhancement)

---

## Task 1: Debug and Fix Collision System

**Files:**
- Debug: `src/utils/collision.ts`
- Debug: `src/game/PlayerController.ts`

**Step 1: Investigate the collision bug**

The player sinking through platforms suggests:
- Collision resolution isn't applying the corrected position properly
- Velocity isn't being zeroed when landing
- Ground detection logic is failing

Read both files and identify the issue.

**Step 2: Fix collision resolution**

Likely fixes needed:
- Ensure `newY` position snaps player to platform top correctly
- Verify `isGrounded` is set when player is on platform
- Check that velocity.y is zeroed on ground contact

**Step 3: Test the fix**

Run dev server, create a simple level with platforms, verify:
- Player stands on platforms without sinking
- Player can walk across platforms
- Jumping and landing works correctly

**Step 4: Commit**

```bash
git add src/utils/collision.ts src/game/PlayerController.ts
git commit -m "fix: resolve player sinking through platforms collision bug"
```

---

## Task 2: Fix Focus Issue on Play Button

**Files:**
- Modify: `src/components/Game/GameCanvas.tsx`
- Modify: `src/components/Editor/Toolbar.tsx`

**Step 1: Auto-focus game canvas on mount**

In `GameCanvas.tsx`, add useEffect to focus the canvas when entering play mode:

```tsx
useEffect(() => {
  const canvas = canvasRef.current;
  if (canvas) {
    canvas.focus();
  }
}, []);
```

And make canvas focusable:
```tsx
<canvas
  ref={canvasRef}
  className="game-canvas"
  tabIndex={0}  // Make focusable
  ...
/>
```

**Step 2: Prevent button from staying focused**

In `Toolbar.tsx`, blur the button after click:

```tsx
<button
  className={`mode-toggle ${mode === 'play' ? 'playing' : ''}`}
  onClick={(e) => {
    onToggleMode();
    e.currentTarget.blur(); // Remove focus after click
  }}
  disabled={mode === 'edit' && !canPlay}
  title={!canPlay ? 'Add a spawn point to play' : undefined}
>
```

**Step 3: Test the fix**

- Click Play button
- Immediately press Space
- Verify: player jumps instead of toggling back to edit mode

**Step 4: Commit**

```bash
git add src/components/Game/GameCanvas.tsx src/components/Editor/Toolbar.tsx
git commit -m "fix: auto-focus game canvas and prevent button re-trigger on space"
```

---

## Task 3: Support Larger Maps

**Files:**
- Modify: `src/types/level.ts`
- Modify: `src/App.css`

**Step 1: Increase grid size constants**

In `src/types/level.ts`, change:
```typescript
export const GRID_WIDTH = 30;  // Was 20
export const GRID_HEIGHT = 20; // Was 12
```

This gives a 30x20 grid (1200x800 pixels at 40px tiles).

**Step 2: Make canvas container scrollable if needed**

In `src/App.css`, update `.canvas-container`:
```css
.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto; /* Add scroll if canvas is too large */
}
```

**Step 3: Verify layout**

Run dev server and verify:
- Editor canvas displays full 30x20 grid
- Scrollbars appear if window is too small
- Painting and playing still work correctly

**Step 4: Commit**

```bash
git add src/types/level.ts src/App.css
git commit -m "feat: increase map size to 30x20 grid with scrollable container"
```

---

## Task 4: Verify All Improvements

**Step 1: Manual testing checklist**

Test each fix:
- [ ] Player stands on platforms without sinking
- [ ] Can complete a level by jumping across platforms
- [ ] Clicking Play then pressing Space jumps (doesn't toggle back)
- [ ] Larger 30x20 grid is usable
- [ ] Save/load still works with larger maps
- [ ] No regressions in existing features

**Step 2: Test edge cases**

- [ ] Player at bottom of platform (not sinking)
- [ ] Player hitting platform from below (bonks head, doesn't get stuck)
- [ ] Rapid space presses (jump buffering still works)

**Step 3: Document any remaining issues**

If issues found, note them for next iteration.

---

## Summary

| Task | Description | Priority |
|------|-------------|----------|
| 1 | Fix collision system (player sinking) | Critical |
| 2 | Fix focus issue (space triggers button) | High |
| 3 | Increase map size to 30x20 | Enhancement |
| 4 | Verify all improvements | Testing |

**Estimated time: 30-45 minutes**
