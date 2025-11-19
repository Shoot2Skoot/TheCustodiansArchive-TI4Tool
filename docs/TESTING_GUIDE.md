# Testing Guide - Phase 0.4 State Management

This guide explains how to test all the state management features implemented in Phase 0.4.

## Prerequisites

Before testing, ensure:
1. ✅ Doppler is configured with your Supabase credentials
2. ✅ Supabase project is set up with the correct database schema
3. ✅ Row Level Security policies are configured
4. ✅ Development server is running (`npm run dev`)

## Quick Start

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to the test page:**
   - Open your browser to `http://localhost:5173` (or the URL shown in terminal)
   - Click "→ View Test Suites" link

## Test Suites

### 1. State Management Test

**Location:** `/tests` → "State Management Test Suite"

**What it tests:**
- ✅ Authentication (anonymous sign-in)
- ✅ Database service layer (games.ts, players.ts, gameState.ts)
- ✅ CRUD operations with snake_case ↔ camelCase conversion
- ✅ Zustand store integration
- ✅ Store selectors

**How to run:**
1. Click "Run Tests" button
2. Watch the test logs in real-time
3. Verify all tests pass (green checkmarks)
4. Check the "Store" panels to see live data
5. Click "Clean Up Test Data" when done

**Expected results:**
```
✓ Authenticated as: <user-id>
✓ Created game: <room-code> (ID: <game-id>)
✓ Game state created: Round 0, Phase setup
✓ Created 2 players
✓ Fetched 2 players
✓ Updated Player 1 VP to 3
✓ Game state: Round 1, Phase strategy
✓ Game status: in-progress
✓ Fetched game: <room-code>
✓ Store updated successfully
✓ Store contains game <room-code> with 2 players
✓ All tests passed! ✓
```

**What to verify:**
- All test logs show ✓ (success)
- Store panels display correct data:
  - Current Game: shows game ID, room code, status, player count
  - Game State: shows current round, phase, mecatol status
  - Players: shows array of 2 players with positions, colors, factions, VP

---

### 2. Real-time Synchronization Test

**Location:** `/tests` → "Real-time Synchronization Test"

**What it tests:**
- ✅ Real-time subscriptions via Supabase Realtime
- ✅ Automatic store updates on database changes
- ✅ Custom hooks (useGame, useGameActions)
- ✅ Connection status tracking
- ✅ Event logging

**How to run:**

**Step 1: Setup**
1. Click "Setup Test Game" button
2. Wait for game creation and subscription
3. Verify green "Connected" indicator appears
4. Check event log shows:
   ```
   ✓ Authenticated
   ✓ Game created: <room-code>
   ✓ Game state created
   ✓ 3 players created
   ✓ Subscribing to real-time updates...
   ✓ Real-time connected
   ✓ Game loaded: <room-code>
   → Game state updated: Round 0, Phase setup
   → Players updated: 3 players
   ```

**Step 2: Test VP Update**
1. Click "Update VP (Test Realtime)" button
2. Watch the event log for real-time update:
   ```
   Incrementing VP for Hacan Player...
   ✓ VP update sent (watch for real-time update)
   → Players updated: 3 players
     - Hacan Player (red): 1 VP  ← VP increased!
     - Sol Player (blue): 0 VP
     - Jol-Nar Player (green): 0 VP
   ```
3. Verify the Players panel updates immediately
4. Click again to increment further

**Step 3: Test Phase Change**
1. Click "Change Phase (Test Realtime)" button
2. Watch for real-time phase update:
   ```
   Changing phase to speaker-selection...
   ✓ Phase change sent (watch for real-time update)
   → Game state updated: Round 0, Phase speaker-selection
   ```
3. Verify the Game State panel updates immediately
4. Click multiple times to cycle through phases

**Step 4: Multi-Tab Test** (Optional but recommended)
1. Open a second browser tab to the same `/tests` page
2. In Tab 1: Click "Update VP" button
3. In Tab 2: Watch the event log and Players panel update automatically!
4. In Tab 2: Click "Change Phase" button
5. In Tab 1: Watch the Game State panel update automatically!

This demonstrates real-time sync across multiple clients! 🎉

**Step 5: Cleanup**
1. Click "Clean Up" button
2. Verify test game is deleted
3. Store should be cleared

**What to verify:**
- ✅ Connection indicator shows green "Connected"
- ✅ Event log shows all operations
- ✅ Real-time updates appear immediately after actions
- ✅ Multiple tabs stay in sync
- ✅ No errors in browser console

---

## Common Issues & Troubleshooting

### Issue: "Auth failed" error
**Solution:**
- Check your Doppler configuration
- Verify `VITE_SUPABASE_PROJECT_URL` and `VITE_SUPABASE_ANON_KEY` are set
- Run `doppler setup` if needed

### Issue: "Connection error" or Disconnected status
**Solution:**
- Check Supabase Realtime is enabled in your project
- Verify Row Level Security policies allow the operations
- Check browser console for websocket errors
- Try refreshing the page

### Issue: TypeScript errors in console
**Solution:**
- Run `npm run build` to check for type errors
- These won't affect runtime but should be fixed

### Issue: Test data not cleaning up
**Solution:**
- Manually delete test games from Supabase dashboard
- Check RLS policies allow delete operations
- Verify the game ID is being tracked correctly

### Issue: Real-time updates not appearing
**Solution:**
- Check the connection indicator is green
- Verify Supabase Realtime is enabled
- Check browser console for subscription errors
- Try opening in an incognito/private window

## Manual Testing

If you prefer manual testing:

### Test Database Operations
```typescript
import { createGame, getGameById } from '@/lib/db/games';
import { createPlayer } from '@/lib/db/players';
import { createGameState } from '@/lib/db/gameState';

// In browser console or test file:
const config = {
  playerCount: 4,
  vpLimit: 10,
  showVPMeter: true,
  // ... other config
};

const game = await createGame(config);
console.log('Created game:', game);

const state = await createGameState(game.id);
console.log('Created state:', state);

const player = await createPlayer(game.id, 1, 'red', 'hacan', 'Test');
console.log('Created player:', player);
```

### Test Store
```typescript
import { useStore } from '@/store';

// In a React component:
const game = useStore((state) => state.currentGame);
const setGame = useStore((state) => state.setCurrentGame);

setGame(myGameObject);
console.log('Game in store:', game);
```

### Test Hooks
```typescript
import { useGame } from '@/hooks/useGame';

// In a React component:
function MyComponent() {
  const { game, gameState, players, isLoading, error } = useGame(gameId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>Game: {game?.roomCode}</div>;
}
```

## Test Coverage

### ✅ Database Service Layer
- [x] Create operations (INSERT)
- [x] Read operations (SELECT)
- [x] Update operations (UPDATE)
- [x] Delete operations (soft delete)
- [x] Snake_case ↔ camelCase conversion
- [x] Error handling

### ✅ Zustand Store
- [x] Game slice
- [x] Player slice
- [x] Realtime slice
- [x] Store selectors
- [x] State updates
- [x] Clear operations

### ✅ Real-time Synchronization
- [x] Subscription creation
- [x] Game updates
- [x] Player updates
- [x] Game state updates
- [x] Strategy selection updates
- [x] Player action state updates
- [x] Connection status
- [x] Multi-client sync

### ✅ Custom Hooks
- [x] useGame - Load and subscribe
- [x] useJoinGame - Join by room code
- [x] useGameActions - Mutations

## Next Steps

After verifying all tests pass:

1. **Explore the code:**
   - Review [src/lib/db/](../src/lib/db/) for database operations
   - Review [src/store/](../src/store/) for state management
   - Review [src/hooks/](../src/hooks/) for React hooks
   - Review [src/lib/realtime/](../src/lib/realtime/) for subscriptions

2. **Build features:**
   - Use these tested utilities to build game features
   - Reference [docs/PHASE_0.4_SUMMARY.md](./PHASE_0.4_SUMMARY.md) for usage examples

3. **Add tests:**
   - Create unit tests for critical game logic
   - Add integration tests for workflows
   - Consider E2E tests for user flows

## Reporting Issues

If you encounter issues:

1. Check the browser console for errors
2. Check the Supabase dashboard for RLS policy issues
3. Verify your environment variables are correct
4. Check the [PHASE_0.4_SUMMARY.md](./PHASE_0.4_SUMMARY.md) for known issues
5. Review this guide's troubleshooting section

---

**Happy testing!** 🧪

The state management infrastructure is solid and ready to support the TI4 dashboard application. All the pieces are in place for building an awesome game experience! 🎲
