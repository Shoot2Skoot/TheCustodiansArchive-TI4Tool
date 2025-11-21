# Audio System Quick Reference

## Import What You Need

```typescript
// For Action Phase
import { useActionPhaseAudio } from '@/hooks/useAudio';
import { getStrategyCardAudioType } from '@/lib/audioHelpers';
import { PhaseType } from '@/lib/audio';

// For Strategy Phase
import { useStrategyPhaseAudio } from '@/hooks/useAudio';

// For custom usage
import { useAudio, SoundCategory, EventType } from '@/hooks/useAudio';
```

## Common Patterns

### Play Phase Enter Sound
```typescript
audio.playPhaseEnter(PhaseType.ACTION);
audio.playPhaseEnter(PhaseType.STRATEGY);
audio.playPhaseEnter(PhaseType.STATUS);
audio.playPhaseEnter(PhaseType.AGENDA);
```

### Play Phase Exit Sound
```typescript
audio.playPhaseExit(PhaseType.ACTION);
```

### Play Faction Prompt (Action Phase)
```typescript
// "Choose your action, The Arborec"
audio.playChooseActionPrompt(player.factionId, false);
```

### Play Faction Prompt (Strategy Phase)
```typescript
// "The Arborec, choose your strategy"
audio.playChooseStrategyPrompt(player.factionId, true);
```

### Play Strategy Card Sound
```typescript
const cardType = getStrategyCardAudioType(strategyCardId); // 1-8 -> enum
if (cardType) {
  audio.playStrategyCard(cardType, 3); // Play random from 3 variants
}
```

### Play Event Sounds
```typescript
import { EventType } from '@/lib/audio';

audio.playEvent(EventType.COMBAT);
audio.playEvent(EventType.MECATOL_REX_TAKEN);
audio.playEvent(EventType.SPEAKER_CHANGE);
```

### Play Just Faction Name
```typescript
audio.playFactionName('arborec');
```

## Component Setup Templates

### Action Phase Template
```typescript
export function ActionPhase({ players, currentPlayer, onComplete }) {
  const factionIds = players.map(p => p.factionId);
  const audio = useActionPhaseAudio(factionIds);
  const [hasPlayedEnterSound, setHasPlayedEnterSound] = useState(false);

  // Play enter sound once
  useEffect(() => {
    if (!hasPlayedEnterSound) {
      audio.playPhaseEnter(PhaseType.ACTION);
      setHasPlayedEnterSound(true);
    }
  }, [hasPlayedEnterSound]);

  // Play prompt on turn change
  useEffect(() => {
    if (currentPlayer?.factionId) {
      audio.playChooseActionPrompt(currentPlayer.factionId, false);
    }
  }, [currentPlayer?.id]);

  const handleComplete = () => {
    audio.playPhaseExit(PhaseType.ACTION);
    setTimeout(() => onComplete(), 500);
  };

  return <div>{/* Your UI */}</div>;
}
```

### Strategy Phase Template
```typescript
export function StrategyPhase({ players, currentPlayer, onComplete }) {
  const factionIds = players.map(p => p.factionId);
  const audio = useStrategyPhaseAudio(factionIds);
  const [hasPlayedEnterSound, setHasPlayedEnterSound] = useState(false);

  // Play enter sound once
  useEffect(() => {
    if (!hasPlayedEnterSound) {
      audio.playPhaseEnter(PhaseType.STRATEGY);
      setHasPlayedEnterSound(true);
    }
  }, [hasPlayedEnterSound]);

  // Play prompt on turn change
  useEffect(() => {
    if (currentPlayer?.factionId) {
      audio.playChooseStrategyPrompt(currentPlayer.factionId, true);
    }
  }, [currentPlayer?.id]);

  const handleComplete = () => {
    audio.playPhaseExit(PhaseType.STRATEGY);
    setTimeout(() => onComplete(), 500);
  };

  return <div>{/* Your UI */}</div>;
}
```

## File Naming Quick Reference

### Factions
```
public/audio/faction/
  arborec.mp3
  barony_of_letnev.mp3
  winnu.mp3
  council_keleres.mp3
  ... etc
```

### Phase Transitions
```
public/audio/phase_enter/
  strategy.mp3
  action.mp3
  status.mp3
  agenda.mp3

public/audio/phase_exit/
  strategy.mp3
  action.mp3
  status.mp3
  agenda.mp3
```

### Prompts
```
public/audio/prompt/
  choose_strategy.mp3           # "choose your strategy"
  choose_strategy_prefix.mp3    # for prefix version
  choose_action.mp3             # "choose your action"
  choose_action_prefix.mp3      # for prefix version
```

### Strategy Cards (with variants)
```
public/audio/strategy_card/
  leadership_1.mp3
  leadership_2.mp3
  leadership_3.mp3
  diplomacy_1.mp3
  ... etc
```

### Events
```
public/audio/event/
  combat.mp3
  mecatol_rex_taken.mp3
  speaker_change.mp3
```

## Strategy Card ID Mapping

```typescript
import { getStrategyCardAudioType } from '@/lib/audioHelpers';

// Maps:
1 -> LEADERSHIP
2 -> DIPLOMACY
3 -> POLITICS
4 -> CONSTRUCTION
5 -> TRADE
6 -> WARFARE
7 -> TECHNOLOGY
8 -> IMPERIAL

// Usage:
const cardType = getStrategyCardAudioType(strategyCardId);
```

## Debugging

### Check if sound is loaded
```typescript
const isLoaded = audio.isSoundLoaded(SoundCategory.FACTION, 'arborec');
console.log('Arborec sound loaded:', isLoaded);
```

### Check queue length
```typescript
const queueLength = audio.getQueueLength();
console.log('Sounds in queue:', queueLength);
```

### Clear queue
```typescript
audio.clearQueue(); // Clears all queued sounds
```

### Stop current sound
```typescript
audio.stopCurrentSound(); // Stops currently playing sound
```

## Preloading Options

### Option 1: Preload Everything (Recommended)
```typescript
// In App.tsx or game init
import { usePreloadGameAudio } from '@/hooks/useAudio';

function GameApp() {
  const factionIds = ['arborec', 'winnu', 'letnev'];
  usePreloadGameAudio(factionIds);
  return <div>...</div>;
}
```

### Option 2: Phase-Specific (Memory Efficient)
```typescript
// Automatically loads/unloads per phase
const audio = useActionPhaseAudio(factionIds);
const audio = useStrategyPhaseAudio(factionIds);
```

### Option 3: Manual Control
```typescript
const audio = useAudio();

// Preload specific sounds
await audio.preloadSounds([
  { category: SoundCategory.FACTION, id: 'arborec' },
  { category: SoundCategory.PHASE_ENTER, id: PhaseType.ACTION },
]);
```

## Common Mistakes to Avoid

❌ **Don't**: Play sounds synchronously in rapid succession
```typescript
// BAD - sounds will overlap
audio.playFactionName('arborec');
audio.playPhaseEnter(PhaseType.ACTION);
```

✅ **Do**: Use chaining or let the queue handle it
```typescript
// GOOD - sounds queue automatically
audio.playFactionName('arborec');
audio.playPhaseEnter(PhaseType.ACTION); // Will wait for previous sound

// Or use chaining for compound messages
audio.playFactionPrompt('arborec', 'choose_strategy', true);
```

---

❌ **Don't**: Forget to normalize faction IDs
```typescript
// BAD - if factionId is "The Arborec"
audio.playFactionName(player.factionName); // Won't match file "arborec.mp3"
```

✅ **Do**: Use normalized IDs
```typescript
// GOOD - factionId should be "arborec" (lowercase, snake_case)
audio.playFactionName(player.factionId);
```

---

❌ **Don't**: Play sounds before preloading
```typescript
// BAD - sound not loaded yet
audio.playFactionName('arborec'); // Might work but slower
```

✅ **Do**: Preload first, then play
```typescript
// GOOD - preload in parent component or on mount
usePreloadGameAudio(factionIds);
// Then play anytime
audio.playFactionName('arborec');
```

## Pro Tips

💡 **Tip 1**: Add a small delay before phase transitions
```typescript
const handleComplete = () => {
  audio.playPhaseExit(PhaseType.ACTION);
  setTimeout(() => onComplete(), 500); // Let sound start
};
```

💡 **Tip 2**: Use variants to prevent audio fatigue
```typescript
// Play random variant (1, 2, or 3)
audio.playStrategyCard(StrategyCardType.LEADERSHIP, 3);
```

💡 **Tip 3**: Debounce rapid events
```typescript
const debouncedPlay = useCallback(
  debounce(() => audio.playEvent(EventType.COMBAT), 300),
  []
);
```

💡 **Tip 4**: Check queue size during rapid actions
```typescript
useEffect(() => {
  const queueLength = audio.getQueueLength();
  if (queueLength > 5) {
    console.warn('Audio queue getting long');
  }
}, [/* dependencies */]);
```

💡 **Tip 5**: Test with console.log first
```typescript
useEffect(() => {
  if (currentPlayer?.factionId) {
    console.log('Would play prompt for:', currentPlayer.factionId);
    // audio.playChooseActionPrompt(currentPlayer.factionId, false);
  }
}, [currentPlayer?.id]);
```
