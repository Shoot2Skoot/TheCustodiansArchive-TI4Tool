# Game Users Architecture

## Overview

This document describes the new permission architecture for the TI4 Companion Tool. The system has been redesigned to support a more flexible approach to user permissions that works well with anonymous authentication.

## Key Concepts

### User-to-Game Relationship (Not User-to-Player)

**Old Approach:**
- Users were tied to specific player slots via `player.user_id`
- RLS policies checked if the current user owned a specific player record
- This created problems:
  - No UI flow to "claim" a player slot
  - Anonymous users get new IDs on new devices
  - Game creators couldn't manage games without claiming a player slot

**New Approach:**
- Users join **games** (tracked in `game_users` table)
- Once in a game, users can manage any aspect of that game
- Player selection is handled in the UI, not enforced by RLS
- Trust-based model for friends playing together

### The `game_users` Table

```sql
CREATE TABLE game_users (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES games(id),
  user_id UUID,
  joined_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(game_id, user_id)
);
```

**Purpose:**
- Tracks which users have joined which games
- Separate from player assignments
- Used by RLS policies to determine access

**How users get added:**
1. **Game Creator**: Automatically added when creating a game (via `useCreateGame`)
2. **Joining Players**: Use `joinGameByRoomCode(roomCode)` to join
3. **Migration**: Existing game creators were migrated to `game_users`

## RLS Policies

### New Permission Model

All game-related tables now use the same RLS pattern:

```sql
CREATE POLICY "Users can [action] in games they joined"
  ON [table_name] FOR [SELECT|INSERT|UPDATE|DELETE]
  USING (is_user_in_game_v2(game_id))
  WITH CHECK (is_user_in_game_v2(game_id));
```

### The `is_user_in_game_v2()` Helper Function

```sql
CREATE FUNCTION is_user_in_game_v2(game_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is in game_users table OR is the game creator
  RETURN EXISTS (
    SELECT 1 FROM game_users
    WHERE game_id = game_uuid
      AND user_id = auth.uid()
      AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM games
    WHERE id = game_uuid
      AND created_by = auth.uid()
  );
END;
$$;
```

**Returns true if:**
- User is in the `game_users` table for this game, OR
- User is the game creator (via `games.created_by`)

**This means:**
- Any user who has joined a game can read/write all game data
- Game creators have automatic access (even if not in `game_users`)
- No need for player-specific permissions

## Affected Tables

The following tables now use the new RLS policies:

- `strategy_selections`
- `game_state`
- `player_action_state`
- `objectives`
- `technology_unlocks`
- `speaker_history`
- `timer_tracking`

All use the pattern: "Users can [action] in games they joined"

## How to Use

### Creating a Game

Use the existing `useCreateGame` hook - it now automatically adds the creator to `game_users`:

```typescript
const { createNewGame } = useCreateGame();

const gameId = await createNewGame({
  config: { playerCount: 6, ... },
  players: [...],
  speakerPosition: 1
});
// Creator is automatically added to game_users table
```

### Joining a Game

Use the new `useJoinGame` hook:

```typescript
import { useJoinGame } from '@/features/game-setup/useJoinGame';

function JoinGameComponent() {
  const { joinGame, isJoining, error } = useJoinGame();
  const [roomCode, setRoomCode] = useState('');

  const handleJoin = async () => {
    const gameId = await joinGame(roomCode);
    if (gameId) {
      // Navigate to game page
      navigate(`/game/${gameId}`);
    }
  };

  return (
    <div>
      <input
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        placeholder="Enter room code"
      />
      <button onClick={handleJoin} disabled={isJoining}>
        Join Game
      </button>
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Direct Database Functions

You can also use the database functions directly:

```typescript
import { joinGameByRoomCode, getGameUsers, leaveGame } from '@/lib/db/gameUsers';

// Join a game
const gameId = await joinGameByRoomCode('ABC123');

// Get all users in a game
const users = await getGameUsers(gameId);

// Leave a game
await leaveGame(gameId);
```

## Player Selection (Future Implementation)

The `players` table still exists and tracks which faction/color is in which position. However:

**`player.user_id` is now OPTIONAL**
- Used only for UI convenience (remembering which player a user prefers)
- NOT used for permissions
- Users can control any player in games they've joined

**Recommended UI Flow:**
1. User joins game via room code → added to `game_users`
2. Game page shows all available players/factions
3. User picks which player they want to control
4. Optionally, set `player.user_id` to remember their choice
5. User can switch players at any time (trust-based)

**Example:**
```typescript
// After joining a game
const availablePlayers = await supabase
  .from('players')
  .select('*')
  .eq('game_id', gameId);

// User picks player 3 (The Arborec)
// Optionally update player.user_id for convenience:
await supabase
  .from('players')
  .update({ user_id: currentUserId })
  .eq('id', selectedPlayerId);

// But RLS doesn't care - user can control any player in the game
```

## Host Privileges

**Game Creator** (via `games.created_by`):
- Has automatic access via `is_user_in_game_v2()`
- Can remove other users from the game
- Maintains access even on different devices (if using Supabase auth)

**Anonymous Users:**
- Get a new `user_id` on each device/browser
- Acceptable for casual play among friends
- For persistent access, users can create a Supabase account

## Migration Impact

The migration `20251120000003_implement_game_users_architecture.sql` automatically:

1. ✅ Created `game_users` table
2. ✅ Created `is_user_in_game_v2()` helper function
3. ✅ Created `join_game_by_room_code()` function
4. ✅ Updated all RLS policies on game tables
5. ✅ Migrated existing game creators to `game_users` table

**No data loss** - all existing games and players are preserved.

## Testing the New System

### Test RLS Policies

Use the SQL scripts in `scripts/`:

```bash
# Check RLS policies
scripts/check-rls-policies.sql

# Test with specific user ID
scripts/test-rls-with-auth.sql

# Debug 403 errors
scripts/debug-why-403.sql
```

### Test Joining a Game

1. Create a game and note the room code
2. Open in different browser (or incognito) to simulate different user
3. Use `joinGame(roomCode)` to join
4. Verify you can now access strategy selections, game state, etc.

## Troubleshooting

### Still Getting 403 Errors?

Check these:

1. **Are you in game_users?**
   ```sql
   SELECT * FROM game_users WHERE game_id = 'YOUR-GAME-ID';
   ```

2. **Are you the game creator?**
   ```sql
   SELECT created_by FROM games WHERE id = 'YOUR-GAME-ID';
   ```

3. **Is the user authenticated?**
   ```sql
   SELECT auth.uid();
   ```

4. **Are the RLS policies applied?**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'strategy_selections';
   ```

### Common Issues

**"User not in game_users table"**
- Solution: Use `joinGameByRoomCode()` to join the game first

**"Anonymous user ID changed"**
- This is expected behavior - anonymous users get new IDs on new devices
- Solution: Use Supabase email auth for persistent identity across devices

**"Can't control a specific player"**
- Remember: Any user in a game can control any player
- Player selection is UI-driven, not security-enforced
- If you want to restrict which player a user can control, implement this in your UI logic

## Benefits of New Architecture

✅ **Simpler Permission Model**: Just check if user is in the game
✅ **Anonymous Auth Friendly**: Works well with device-based IDs
✅ **Flexible Player Selection**: Users can switch players via UI
✅ **Host Authority**: Game creators always have access
✅ **Trust-Based**: Perfect for friends playing together
✅ **No Player Claiming Required**: Users join games, not specific players
✅ **Cross-Device Support**: If using Supabase auth, hosts maintain access

## Future Enhancements

**Optional features you could add:**

1. **Player Locking**: Allow hosts to "lock" players to specific users
2. **Kick Users**: UI for hosts to remove users from `game_users`
3. **User List**: Show all users in a game with their roles
4. **Activity Tracking**: Track which user made which changes
5. **Invite System**: Generate invite links with embedded room codes
6. **Player Preferences**: Remember which faction a user usually plays
