# Audio Integration Example

This document shows exactly how to integrate the audio system into your existing Action Phase component.

## Step 1: Import the Audio Hook

Add these imports to [ActionPhase.tsx](src/features/action-phase/ActionPhase.tsx):

```typescript
import { useActionPhaseAudio } from '@/hooks/useAudio';
import { getStrategyCardAudioType } from '@/lib/audioHelpers';
import { PhaseType } from '@/lib/audio';
```

## Step 2: Initialize the Audio Hook

Inside the `ActionPhase` component function, add:

```typescript
export function ActionPhase({
  gameId,
  players,
  roundNumber,
  strategySelections,
  speakerPlayerId,
  onComplete,
  onUndoRedoChange,
}: ActionPhaseProps) {
  // Extract faction IDs from players
  const factionIds = players.map(p => p.factionId);

  // Initialize audio hook with automatic preloading
  const audio = useActionPhaseAudio(factionIds);

  // Track if we've played the enter sound
  const [hasPlayedEnterSound, setHasPlayedEnterSound] = useState(false);

  // ... rest of your existing state ...
```

## Step 3: Play "Entering Action Phase" Sound

Add this effect near the top of your component (after the state declarations):

```typescript
// Play action phase enter sound once on mount
useEffect(() => {
  if (!hasPlayedEnterSound) {
    audio.playPhaseEnter(PhaseType.ACTION);
    setHasPlayedEnterSound(true);
  }
}, [hasPlayedEnterSound, audio]);
```

## Step 4: Play "Choose Your Action" Prompts

Add this effect to play the prompt when the current player changes:

```typescript
// Play "Choose your action" prompt when turn changes
useEffect(() => {
  if (currentPlayer && currentPlayer.factionId) {
    // Play "Choose your action, The [Faction]"
    // The 'false' parameter means faction name comes after the prompt
    audio.playChooseActionPrompt(currentPlayer.factionId, false);
  }
}, [currentPlayer?.id]); // Only trigger when current player changes
```

## Step 5: Play Strategy Card Sounds

In your `handleStrategyCardDone` function, add the audio call:

```typescript
const handleStrategyCardDone = async () => {
  setIsStrategyCardActionInProgress(false);

  if (!currentPlayer || !currentUserId) return;

  const strategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
  if (!strategyCard) return;

  // ✨ NEW: Play strategy card sound
  const cardAudioType = getStrategyCardAudioType(strategyCard.strategyCardId);
  if (cardAudioType) {
    audio.playStrategyCard(cardAudioType, 3); // Play random variant from 3 options
  }

  // ... rest of your existing code ...
```

## Step 6: Play "Exiting Action Phase" Sound

Update your `handleEndPhase` function:

```typescript
const handleEndPhase = () => {
  if (allPlayersPassed) {
    // Play exit sound before completing
    audio.playPhaseExit(PhaseType.ACTION);

    // Small delay to let the sound start playing
    setTimeout(() => {
      onComplete();
    }, 500);
  }
};
```

## Step 7: Optional - Play Combat Sound

If you add combat tracking, you can play the combat sound:

```typescript
const handleCombatStarted = () => {
  audio.playEvent('combat');
  // ... your combat logic ...
};
```

## Complete Modified Component Sections

Here are the complete sections with audio integrated:

### At the top of the component:

```typescript
export function ActionPhase({
  gameId,
  players,
  roundNumber,
  strategySelections,
  speakerPlayerId,
  onComplete,
  onUndoRedoChange,
}: ActionPhaseProps) {
  // Audio setup
  const factionIds = players.map(p => p.factionId);
  const audio = useActionPhaseAudio(factionIds);
  const [hasPlayedEnterSound, setHasPlayedEnterSound] = useState(false);

  // ... your existing state variables ...
  const [playerActionStates, setPlayerActionStates] = useState<PlayerActionState[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  // ... etc ...
```

### Audio effects section:

```typescript
// Play action phase enter sound once
useEffect(() => {
  if (!hasPlayedEnterSound) {
    audio.playPhaseEnter(PhaseType.ACTION);
    setHasPlayedEnterSound(true);
  }
}, [hasPlayedEnterSound, audio]);

// Play "Choose your action" prompt when turn changes
useEffect(() => {
  if (currentPlayer?.factionId) {
    audio.playChooseActionPrompt(currentPlayer.factionId, false);
  }
}, [currentPlayer?.id, audio]);
```

### Modified handleStrategyCardDone:

```typescript
const handleStrategyCardDone = async () => {
  setIsStrategyCardActionInProgress(false);

  if (!currentPlayer || !currentUserId) return;

  const strategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
  if (!strategyCard) return;

  // Play strategy card sound
  const cardAudioType = getStrategyCardAudioType(strategyCard.strategyCardId);
  if (cardAudioType) {
    audio.playStrategyCard(cardAudioType, 3);
  }

  // Push current state to undo history BEFORE updating
  pushHistory({
    type: 'strategyCardAction',
    strategyCardId: strategyCard.strategyCardId,
    data: getCurrentStateSnapshot(),
    userId: currentUserId,
    timestamp: Date.now(),
  });

  // ... rest of existing code ...
};
```

### Modified handleEndPhase:

```typescript
const handleEndPhase = () => {
  if (allPlayersPassed) {
    audio.playPhaseExit(PhaseType.ACTION);

    setTimeout(() => {
      onComplete();
    }, 500);
  }
};
```

## Strategy Phase Integration

For the Strategy Phase component, use `useStrategyPhaseAudio` instead:

```typescript
import { useStrategyPhaseAudio } from '@/hooks/useAudio';
import { PhaseType } from '@/lib/audio';

export function StrategyPhase({ players, /* ... */ }) {
  const factionIds = players.map(p => p.factionId);
  const audio = useStrategyPhaseAudio(factionIds);
  const [hasPlayedEnterSound, setHasPlayedEnterSound] = useState(false);

  // Play enter sound
  useEffect(() => {
    if (!hasPlayedEnterSound) {
      audio.playPhaseEnter(PhaseType.STRATEGY);
      setHasPlayedEnterSound(true);
    }
  }, [hasPlayedEnterSound, audio]);

  // Play "The [Faction], choose your strategy"
  useEffect(() => {
    if (currentPlayer?.factionId) {
      // The 'true' parameter means faction name comes first
      audio.playChooseStrategyPrompt(currentPlayer.factionId, true);
    }
  }, [currentPlayer?.id, audio]);

  const handlePhaseComplete = () => {
    audio.playPhaseExit(PhaseType.STRATEGY);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  // ... rest of component ...
}
```

## App-Level Preloading

In your main [App.tsx](src/App.tsx) or game initialization component:

```typescript
import { usePreloadGameAudio } from '@/hooks/useAudio';

function App() {
  // Get faction IDs from your game state
  const factionIds = useStore(state =>
    state.currentGame?.players.map(p => p.factionId) || []
  );

  // Preload all audio when game starts
  usePreloadGameAudio(factionIds);

  return (
    <div>
      {/* Your app content */}
    </div>
  );
}
```

## Testing the Audio System

1. **Create test audio files**: Start with one or two test files to verify the system works
   - Create: `public/audio/faction/arborec.mp3` (say "The Arborec")
   - Create: `public/audio/phase_enter/action.mp3` (say "Entering action phase")
   - Create: `public/audio/prompt/choose_action_prefix.mp3` (say "Choose your action")

2. **Test the integration**:
   - Start an action phase
   - You should hear "Entering action phase"
   - When a player's turn starts, you should hear "Choose your action, The Arborec"

3. **Verify queueing**: Quickly trigger multiple sounds and verify they queue properly without overlapping

4. **Check console**: Look for preload success messages and any errors

## Common Issues and Solutions

### Issue: Sounds not playing

**Solution**: Open browser console and check for:
- 404 errors (file not found - check path and filename)
- Autoplay policy errors (user must interact with page first)
- Preload errors (sound may not be loaded yet)

### Issue: Sounds overlap

**Solution**: The queue system should prevent this. If it still happens:
```typescript
// Clear queue before playing critical sound
audio.clearQueue();
audio.playPhaseEnter(PhaseType.ACTION);
```

### Issue: Too many sounds playing

**Solution**: Add debouncing to rapid events:
```typescript
const debouncedPlayPrompt = useCallback(
  debounce((factionId: string) => {
    audio.playChooseActionPrompt(factionId, false);
  }, 300),
  [audio]
);
```

### Issue: Memory usage too high

**Solution**: Use phase-specific hooks which automatically unload on unmount:
```typescript
// Instead of usePreloadGameAudio (preloads everything)
// Use phase-specific hooks (only loads what's needed)
const audio = useActionPhaseAudio(factionIds); // Auto-unloads on unmount
```

## Next Steps

1. Create the `/public/audio` folder structure
2. Add your MP3 files following the naming conventions
3. Add the audio hook imports to ActionPhase.tsx
4. Test with a few sample sounds first
5. Gradually add more sounds as you record them
6. Adjust timing and behavior as needed

The system is designed to gracefully handle missing audio files - it will log warnings but won't crash if a sound file doesn't exist yet.
