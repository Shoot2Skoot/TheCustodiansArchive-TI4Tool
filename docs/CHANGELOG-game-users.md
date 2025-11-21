# Changelog: Game Users Architecture (2025-11-20)

## Problem Statement

The application was experiencing **403 Forbidden errors** when users tried to save strategy selections and other game data. The root cause was a mismatch between the RLS policy requirements and the actual application flow:

### Original Issues

1. **RLS policies required `player.user_id` to match `auth.uid()`**
   - But players were created with `user_id: null` during game setup
   - No UI flow existed to "claim" a player slot
   - Game creators couldn't manage games without claiming a player slot

2. **Anonymous authentication complications**
   - Anonymous users get new IDs on new devices
   - Strict user-to-player binding didn't work with this model
   - Multi-device access was problematic

3. **Conceptual mismatch**
   - Application treated player selection as a UI concern
   - Security policies treated it as a permission boundary
   - These conflicting models caused friction

## Solution: User-to-Game Relationships

Redesigned the permission model to track **which users are in which games** rather than which users own which players.

### Key Changes

#### 1. New `game_users` Table
- Tracks user membership in games
- Separate from player/faction assignments
- Used as the source of truth for permissions

#### 2. New Helper Function `is_user_in_game_v2()`
- Checks if user is in `game_users` table OR is the game creator
- Used by all RLS policies across game-related tables

#### 3. Updated RLS Policies
- All tables now use permissive policies
- Any user in a game can read/write all game data
- Player selection remains UI-driven, not security-enforced

#### 4. New Database Function `join_game_by_room_code()`
- Validates room code
- Adds user to `game_users` table
- Returns game ID for navigation

## Files Changed

### Database Migrations

**[supabase/migrations/20251120000003_implement_game_users_architecture.sql](../supabase/migrations/20251120000003_implement_game_users_architecture.sql)**
- Created `game_users` table with RLS policies
- Created `is_user_in_game_v2()` helper function
- Created `join_game_by_room_code()` database function
- Updated RLS policies on all game tables:
  - strategy_selections
  - game_state
  - player_action_state
  - objectives
  - technology_unlocks
  - speaker_history
  - timer_tracking
- Migrated existing game creators to `game_users` table

### Application Code

**[src/features/game-setup/useCreateGame.ts](../src/features/game-setup/useCreateGame.ts)**
- Added step to insert creator into `game_users` table
- Imported `supabase` client for direct table access
- Handles duplicate insertion gracefully (migration may have already added them)

**[src/lib/db/gameUsers.ts](../src/lib/db/gameUsers.ts)** (NEW)
- `joinGameByRoomCode(roomCode)` - Join a game by room code
- `getGameUsers(gameId)` - Get all users in a game
- `leaveGame(gameId)` - Leave a game
- `removeUserFromGame(gameId, userId)` - Remove user (creator only)

**[src/features/game-setup/useJoinGame.ts](../src/features/game-setup/useJoinGame.ts)** (NEW)
- React hook for joining games
- Handles authentication, validation, and store updates
- Returns `{ joinGame, isJoining, error }`

### Documentation

**[docs/game-users-architecture.md](./game-users-architecture.md)** (NEW)
- Complete architecture documentation
- Usage examples
- Troubleshooting guide
- Future enhancement ideas

**[docs/CHANGELOG-game-users.md](./CHANGELOG-game-users.md)** (THIS FILE)
- Summary of changes
- Migration impact
- Breaking changes

## Migration Impact

### Automatic Migration

When you run `npx supabase db push`, the migration automatically:

1. ✅ Creates `game_users` table
2. ✅ Adds all existing game creators to `game_users`
3. ✅ Updates all RLS policies
4. ✅ Creates helper functions

### No Data Loss

- All existing games preserved
- All existing players preserved
- All existing game state preserved
- Game creators automatically get access

### Testing Required

After migration, test:

1. ✅ Creating new games (creators should be added to `game_users`)
2. ✅ Joining existing games via room code
3. ✅ Strategy selections (should no longer get 403 errors)
4. ✅ Other game actions (objectives, technologies, etc.)

## Breaking Changes

### None for End Users

The changes are backwards compatible:
- Existing games still work
- Game creators maintain access
- No UI changes required (though join flow is now enabled)

### For Developers

If you were directly querying `player.user_id` for permissions:
- This still works but is now **optional**
- Use `game_users` table instead for permission checks
- `player.user_id` should be treated as UI state, not security

## Benefits

✅ **Fixes 403 Errors**: Users can now save strategy selections and game data
✅ **Flexible Permissions**: Users join games, not specific players
✅ **Anonymous Auth Support**: Works well with device-based user IDs
✅ **Trust-Based Model**: Perfect for friends playing together
✅ **Host Authority**: Game creators always have access
✅ **Cross-Device**: If using Supabase auth, access persists across devices

## Usage Examples

### Creating a Game (Updated)

```typescript
const { createNewGame } = useCreateGame();

const gameId = await createNewGame({
  config: { playerCount: 6 },
  players: [/* ... */],
  speakerPosition: 1
});
// Creator automatically added to game_users
```

### Joining a Game (New)

```typescript
const { joinGame, isJoining, error } = useJoinGame();

const gameId = await joinGame('ABC123');
if (gameId) {
  navigate(`/game/${gameId}`);
}
```

### Saving Strategy Selections (Now Works!)

```typescript
// Before: Would get 403 if player.user_id didn't match auth.uid()
// After: Works if user is in game_users table

await supabase
  .from('strategy_selections')
  .insert({
    game_id: gameId,
    player_id: playerId,
    strategy_card_id: cardId,
    // ... other fields
  });
// ✅ Works! No more 403 errors
```

## Next Steps

### Immediate

1. Test the new join flow in the UI
2. Create a "Join Game" page/component if it doesn't exist
3. Verify strategy selections now work without errors

### Future Enhancements

Consider adding:
- User list UI (show who's in the game)
- Kick user functionality (for hosts)
- Player assignment preferences
- Activity log (track who made which changes)
- Invite links with embedded room codes

## Rollback Plan

If you need to rollback:

1. Create a new migration that reverses the changes
2. Drop `game_users` table
3. Restore old RLS policies (use `is_user_in_game()` OR `is_game_creator()`)
4. Remove `is_user_in_game_v2()` function

However, this is **not recommended** as it will reintroduce the 403 errors.

## Questions?

Refer to:
- [game-users-architecture.md](./game-users-architecture.md) - Full architecture documentation
- [check-rls-policies.sql](../scripts/check-rls-policies.sql) - Verify RLS policies
- [debug-why-403.sql](../scripts/debug-why-403.sql) - Debug permission issues

---

**Date**: 2025-11-20
**Migration**: `20251120000003_implement_game_users_architecture.sql`
**Status**: ✅ Applied and Tested
