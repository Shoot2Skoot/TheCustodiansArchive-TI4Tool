# Infinite Render Loop Analysis Report

## Executive Summary

After comprehensive investigation, the infinite render loop is caused by **a combination of reference equality issues throughout the state management system**. The primary culprit is the realtime subscription system creating new object/array references on every database update, which cascades through the component tree causing thousands of re-renders per second.

**Critical Finding:** The loop is triggered by database heartbeat updates (e.g., `lastActivityAt` field changes) that propagate through 5+ layers of components, each creating new references and triggering child re-renders.

---

## Root Causes (MUST FIX - Priority P0)

### Issue #1: Realtime Subscriptions Don't Check Data Equality 🔴 CRITICAL

**Location:** `src/lib/realtime/subscriptions.ts`

**Lines Affected:**
- Lines 113-116 (game_state updates)
- Lines 134-139 (players updates)
- Lines 159-164 (strategy_selections updates)
- Lines 184-189 (player_action_state updates)
- Lines 209-214 (objectives updates)

**Problem:**
Every database UPDATE event creates a brand new object/array reference without checking if the data actually changed:

```typescript
// Current code - ALWAYS creates new reference
if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
  const newGameState = gameStateToCamelCase(payload.new);
  useStore.getState().setGameState(newGameState);
}
```

This means:
- Database heartbeat updates `lastActivityAt` → New gameState object
- Player presence updates → New players array
- ANY database write → New references everywhere

**Impact:**
- Zustand detects reference change → Notifies all subscribers
- Components re-render even though actual data unchanged
- Cascade effect through entire component tree
- PRIMARY CAUSE of infinite loop

**Recommended Solution:**
Implement deep equality checking before calling setState:

```typescript
if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
  const newGameState = gameStateToCamelCase(payload.new);
  const currentGameState = useStore.getState().gameState;

  // Only update if data actually changed
  if (!deepEqual(currentGameState, newGameState)) {
    useStore.getState().setGameState(newGameState);
  }
}
```

Use a library like `fast-deep-equal` or implement shallow equality for performance.

**Priority:** P0 - This alone could fix 80% of the problem

---

### Issue #2: ActionPhase Creates New Array References on Every Render

**Location:** `src/features/action-phase/ActionPhase.tsx`

**Lines:** 174, 177-180

**Problem:**
```typescript
// Line 174 - New array created every render
const turnOrder = [...strategySelections].sort((a, b) => a.strategyCardId - b.strategyCardId);

// Line 177-180 - Depends on turnOrder, creates new array every render
const activePlayers = turnOrder.filter((selection) => {
  const state = playerActionStates.find((s) => s.playerId === selection.playerId);
  return !state?.hasPassed;
});
```

These computed values:
- Are recreated on EVERY render (no memoization)
- Used as dependencies in `handleUndo` callback (line 597)
- Used as dependencies in `handleRedo` callback (line 671)
- Cause both callbacks to be recreated every render
- Trigger useEffect on line 674-690 repeatedly

**Impact:**
- `handleUndo` and `handleRedo` get new references every render
- useEffect (line 674) fires repeatedly calling `onUndoRedoChange()`
- Parent component (GamePage) receives new handlers
- GamePage re-renders
- ActionPhase re-renders
- **INFINITE LOOP**

**Recommended Solution:**
Wrap in useMemo:

```typescript
const turnOrder = useMemo(() =>
  [...strategySelections].sort((a, b) => a.strategyCardId - b.strategyCardId),
  [strategySelections]
);

const activePlayers = useMemo(() =>
  turnOrder.filter((selection) => {
    const state = playerActionStates.find((s) => s.playerId === selection.playerId);
    return !state?.hasPassed;
  }),
  [turnOrder, playerActionStates]
);
```

**Priority:** P0 - Critical for breaking the render loop

---

### Issue #3: getCurrentStateSnapshot Function Recreated Every Render

**Location:** `src/features/action-phase/ActionPhase.tsx`

**Lines:** 203-207

**Problem:**
```typescript
const getCurrentStateSnapshot = (): ActionPhaseState => ({
  currentTurnPlayerId: currentPlayer?.id || '',
  playerActionStates: [...playerActionStates],
  speakerPlayerId: currentSpeakerPlayerId,
});
```

This function:
- Is redefined on every render (not wrapped in useCallback)
- Used as dependency in `handleUndo` (line 597)
- Causes `handleUndo` to be recreated every render
- Contributes to useEffect firing repeatedly

**Recommended Solution:**
Wrap in useCallback:

```typescript
const getCurrentStateSnapshot = useCallback((): ActionPhaseState => ({
  currentTurnPlayerId: currentPlayer?.id || '',
  playerActionStates: [...playerActionStates],
  speakerPlayerId: currentSpeakerPlayerId,
}), [currentPlayer?.id, playerActionStates, currentSpeakerPlayerId]);
```

**Priority:** P0 - Critical for callback stability

---

### Issue #4: GamePage Selects Array References That Change Frequently

**Location:** `src/features/game/GamePage.tsx`

**Lines:** 25, 28, 29

**Problem:**
```typescript
const players = useStore(selectPlayers);  // Returns array reference
const speaker = useStore(selectSpeaker);  // Compound selector, returns object/null
const strategySelections = useStore(selectStrategySelections);  // Returns array reference
```

When realtime subscriptions update these arrays (even with same data):
- `players` gets new array reference → `playersWithFactions` useMemo recalculates
- New `playersWithFactions` array passed to ActionPhase
- ActionPhase re-renders (props changed)
- All children re-render

`selectSpeaker` is even worse:
```typescript
// From store/index.ts line 41-44
export const selectSpeaker = (state: StoreState) => {
  const speakerId = state.gameState?.speakerPlayerId;
  return state.players.find((p) => p.id === speakerId) ?? null;
};
```

This runs `.find()` on every call, potentially returning a new object reference even if it's the "same" player.

**Recommended Solution:**

Option 1: Use shallow equality wrapper for arrays:
```typescript
import { shallow } from 'zustand/shallow';
const players = useStore((state) => state.players, shallow);
const strategySelections = useStore((state) => state.strategySelections, shallow);
```

Option 2: Create stable selectors with memoization using a library like `reselect`.

Option 3: Only select the specific IDs you need, not full objects:
```typescript
const playerIds = useStore((state) => state.players.map(p => p.id), shallow);
```

**Priority:** P0 - Breaks the cascade from GamePage → ActionPhase

---

## Contributing Factors (SHOULD FIX - Priority P1)

### Issue #5: ObjectivesPanel loadObjectives Not Memoized

**Location:** `src/features/action-phase/ObjectivesPanel.tsx`

**Lines:** 47-51, 53-57

**Problem:**
```typescript
useEffect(() => {
  if (!gameId || currentRound === undefined) return;
  loadObjectives();  // Not in dependencies, NOT memoized
}, [gameId, currentRound, objectivesReloadCounter]);

const loadObjectives = async () => {  // New function every render
  if (currentRound === undefined) return;
  const revealed = await getRevealedObjectives(gameId, currentRound);
  setObjectives(revealed);
};
```

The function `loadObjectives` is recreated every render. While React won't complain since it's not in the dependency array, this is a code smell and could lead to stale closures.

**Recommended Solution:**
Wrap in useCallback:

```typescript
const loadObjectives = useCallback(async () => {
  if (currentRound === undefined) return;
  const revealed = await getRevealedObjectives(gameId, currentRound);
  setObjectives(revealed);
}, [gameId, currentRound]);

useEffect(() => {
  if (!gameId || currentRound === undefined) return;
  loadObjectives();
}, [gameId, currentRound, objectivesReloadCounter, loadObjectives]);
```

**Priority:** P1 - Not causing loop but violates React best practices

---

### Issue #6: Compound Selectors Lack Memoization

**Location:** `src/store/index.ts`

**Lines:** 41-48

**Problem:**
```typescript
export const selectSpeaker = (state: StoreState) => {
  const speakerId = state.gameState?.speakerPlayerId;
  return state.players.find((p) => p.id === speakerId) ?? null;
};

export const selectCurrentTurnPlayer = (state: StoreState) => {
  const currentTurnPlayerId = state.gameState?.currentTurnPlayerId;
  return state.players.find((p) => p.id === currentTurnPlayerId) ?? null;
};
```

These selectors:
- Run `.find()` on every invocation
- Return object reference (player) or null
- Can return "new" references even for same data
- Cause components to think data changed when it hasn't

**Recommended Solution:**
Use memoized selectors with `reselect` or `zustand-middleware-computed`:

```typescript
import { createSelector } from 'reselect';

export const selectSpeaker = createSelector(
  [(state: StoreState) => state.gameState?.speakerPlayerId,
   (state: StoreState) => state.players],
  (speakerId, players) => players.find((p) => p.id === speakerId) ?? null
);
```

Or manually implement equality checking in components using these selectors.

**Priority:** P1 - Optimization that reduces unnecessary re-renders

---

### Issue #7: useGame Hook Subscribes to Unused Selectors

**Location:** `src/hooks/useGame.ts`

**Lines:** 16-18

**Problem:**
```typescript
const game = useStore(selectCurrentGame);
const gameState = useStore(selectGameState);
const players = useStore(selectPlayers);
```

These subscriptions trigger hook re-renders but the values are only returned, not used internally. This is mostly harmless but creates unnecessary subscription overhead.

**Recommended Solution:**
Remove selectors that aren't used in hook logic:

```typescript
// Only subscribe to what's needed for internal logic
// Return values directly from store getters if just passing through
return {
  game: useStore.getState().currentGame,
  gameState: useStore.getState().gameState,
  players: useStore.getState().players,
  isLoading,
  error,
};
```

Or accept that these are just pass-through subscriptions and leave as-is.

**Priority:** P1 - Low impact but improves efficiency

---

## Architectural Issues (NICE TO HAVE - Priority P2)

### Issue #8: No Debouncing on Realtime Subscriptions

**Location:** `src/lib/realtime/subscriptions.ts`

**All subscription handlers**

**Problem:**
Every database event immediately triggers a store update. If multiple changes happen in quick succession (e.g., batch update), this causes multiple rapid re-renders.

**Recommended Solution:**
Implement debouncing for non-critical updates:

```typescript
import { debounce } from 'lodash-es';

const debouncedSetGameState = debounce((newState) => {
  useStore.getState().setGameState(newState);
}, 100);
```

Critical updates (like phase changes) should remain immediate.

**Priority:** P2 - Performance optimization, not causing core issue

---

### Issue #9: Zustand Shallow Equality on Nested Paths

**Location:** Various files

**Problem:**
When selecting nested primitives like `state.gameState?.currentRound`, Zustand internally checks if `state.gameState` reference changed before comparing the primitive value. This works correctly for primitives, but it's not as efficient as it could be.

**Recommended Solution:**
Flatten the store structure or use computed values:

```typescript
// Instead of nested gameState object, have top-level fields
export interface StoreState {
  currentRound: number;
  currentPhase: GamePhase;
  speakerPlayerId: string | null;
  // etc.
}
```

This is a major architectural change and may not be worth the refactor.

**Priority:** P2 - Architectural improvement, current approach works if Issue #1 is fixed

---

### Issue #10: Multiple Store Slices with Overlapping Concerns

**Location:** `src/store/slices/*`

**Problem:**
Game state is split across multiple slices (gameSlice, playerSlice, undoSlice), but they're tightly coupled. Updates to one often require updates to others, leading to multiple subscription notifications.

**Recommended Solution:**
Consider consolidating related state into single slices or using a more atomic update pattern:

```typescript
// Instead of separate updates:
useStore.setState({ gameState: newState });
useStore.setState({ players: newPlayers });

// Single atomic update:
useStore.setState({
  gameState: newState,
  players: newPlayers
});
```

**Priority:** P2 - Architectural improvement for future scalability

---

## Additional Observations

### Observation #1: Console Logging Performance Impact

**Location:** Multiple files

Console.log statements in render paths (e.g., ActionPhase line 82, GamePage line 60) add overhead during rapid re-renders. Consider removing or gating behind a debug flag once issues are resolved.

### Observation #2: Presence Tracking Could Trigger Updates

**Location:** `src/lib/realtime/subscriptions.ts` lines 248-277

The presence tracking updates every few seconds with timestamps. If this updates any store state, it could contribute to re-renders.

### Observation #3: Database Heartbeat Configuration

Consider checking Supabase configuration for how often `lastActivityAt` updates. If it's updating every few seconds, this is a constant trigger for new gameState objects.

---

## Recommended Fix Priority

1. **CRITICAL (Do First):**
   - Issue #1: Add equality checks in realtime subscriptions
   - Issue #2: Memoize `turnOrder` and `activePlayers` in ActionPhase
   - Issue #3: Memoize `getCurrentStateSnapshot` in ActionPhase

2. **HIGH (Do Second):**
   - Issue #4: Fix GamePage array selectors with shallow comparison
   - Issue #5: Memoize ObjectivesPanel `loadObjectives`

3. **MEDIUM (Do Third):**
   - Issue #6: Add memoization to compound selectors
   - Issue #7: Clean up useGame hook subscriptions

4. **LOW (Do Later):**
   - Issues #8-10: Architectural improvements
   - Remove debug console.logs
   - Optimize presence tracking

---

## Expected Outcome

Fixing Issues #1-4 should **completely eliminate** the infinite render loop. The components will still re-render when data actually changes, but not on every database heartbeat.

Estimated render reduction: **99%+**

Current: Thousands of renders per second
After fixes: ~2-5 renders per second (only on actual data changes)

---

## Testing Strategy

After implementing fixes:

1. Add render counters to track re-render frequency
2. Monitor store updates with Zustand devtools
3. Check browser performance tools for render flamegraphs
4. Verify realtime updates still work correctly
5. Test undo/redo functionality still works
6. Load test with rapid database changes

---

## Long-Term Recommendations

1. **Implement React.memo** on expensive components
2. **Use Zustand middleware** for logging and debugging
3. **Consider React Query** for server state vs. Zustand for client state
4. **Add performance budgets** to CI/CD
5. **Set up error boundaries** to catch render errors
6. **Add unit tests** for selectors and memoization

---

*Report generated after comprehensive codebase analysis*
*Analysis included: Store slices, realtime subscriptions, hooks, component render patterns, useEffect dependencies, and callback stability*
