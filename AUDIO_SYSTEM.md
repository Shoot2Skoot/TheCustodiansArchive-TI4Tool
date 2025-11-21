# Audio System Documentation

## Overview

The audio system provides voice-over sound effects for game events, phase transitions, and player prompts. It features:

- **Sound Preloading**: Load sounds into memory for instant playback
- **Queue System**: Prevents audio spam by queueing sounds when game moves quickly
- **Sound Chaining**: Combine multiple sounds (e.g., "The Arborec, choose your strategy")
- **Automatic Management**: Smart cleanup and memory management

## Folder Structure

All audio files must be organized in the `/public/audio` directory:

```
public/
└── audio/
    ├── faction/
    │   ├── arborec.mp3
    │   ├── barony_of_letnev.mp3
    │   ├── clan_of_saar.mp3
    │   ├── embers_of_muaat.mp3
    │   ├── emirates_of_hacan.mp3
    │   ├── federation_of_sol.mp3
    │   ├── ghosts_of_creuss.mp3
    │   ├── l1z1x_mindnet.mp3
    │   ├── mentak_coalition.mp3
    │   ├── naalu_collective.mp3
    │   ├── nekro_virus.mp3
    │   ├── sardakk_norr.mp3
    │   ├── universities_of_jolnar.mp3
    │   ├── winnu.mp3
    │   ├── xxcha_kingdom.mp3
    │   ├── yin_brotherhood.mp3
    │   ├── yssaril_tribes.mp3
    │   ├── argent_flight.mp3
    │   ├── empyrean.mp3
    │   ├── mahact_gene_sorcerers.mp3
    │   ├── naaz_rokha_alliance.mp3
    │   ├── nomad.mp3
    │   ├── titans_of_ul.mp3
    │   ├── vuil_raith_cabal.mp3
    │   └── council_keleres.mp3
    │
    ├── phase_enter/
    │   ├── strategy.mp3
    │   ├── action.mp3
    │   ├── status.mp3
    │   └── agenda.mp3
    │
    ├── phase_exit/
    │   ├── strategy.mp3
    │   ├── action.mp3
    │   ├── status.mp3
    │   └── agenda.mp3
    │
    ├── prompt/
    │   ├── choose_strategy.mp3           # "choose your strategy"
    │   ├── choose_strategy_prefix.mp3    # for "The Arborec, choose your strategy"
    │   ├── choose_action.mp3             # "choose your action"
    │   └── choose_action_prefix.mp3      # for "Choose your action, The Arborec"
    │
    ├── strategy_card/
    │   ├── leadership_1.mp3
    │   ├── leadership_2.mp3
    │   ├── leadership_3.mp3
    │   ├── diplomacy_1.mp3
    │   ├── diplomacy_2.mp3
    │   ├── diplomacy_3.mp3
    │   ├── politics_1.mp3
    │   ├── politics_2.mp3
    │   ├── politics_3.mp3
    │   ├── construction_1.mp3
    │   ├── construction_2.mp3
    │   ├── construction_3.mp3
    │   ├── trade_1.mp3
    │   ├── trade_2.mp3
    │   ├── trade_3.mp3
    │   ├── warfare_1.mp3
    │   ├── warfare_2.mp3
    │   ├── warfare_3.mp3
    │   ├── technology_1.mp3
    │   ├── technology_2.mp3
    │   ├── technology_3.mp3
    │   ├── imperial_1.mp3
    │   ├── imperial_2.mp3
    │   └── imperial_3.mp3
    │
    └── event/
        ├── combat.mp3
        ├── mecatol_rex_taken.mp3
        └── speaker_change.mp3
```

## File Naming Conventions

- **Factions**: Use snake_case matching faction IDs (e.g., `arborec.mp3`, `council_keleres.mp3`)
- **Phases**: Use lowercase phase names (e.g., `strategy.mp3`, `action.mp3`)
- **Strategy Cards**: Use card name + `_` + variant number (e.g., `leadership_1.mp3`)
- **Events**: Use snake_case (e.g., `mecatol_rex_taken.mp3`)
- **Format**: All files should be `.mp3` format

## Usage Examples

### 1. Basic Setup - Preload All Game Audio

In your main app component or game initialization:

```typescript
import { usePreloadGameAudio } from '@/hooks/useAudio';

function GameApp() {
  const factionIds = ['arborec', 'barony_of_letnev', 'winnu']; // Current game factions

  // Preload all audio for the game
  usePreloadGameAudio(factionIds);

  return <div>{/* Your game UI */}</div>;
}
```

### 2. Strategy Phase - Play Faction Prompts

```typescript
import { useStrategyPhaseAudio } from '@/hooks/useAudio';

function StrategyPhase({ players, currentPlayerId }) {
  const audio = useStrategyPhaseAudio(players.map(p => p.factionId));

  useEffect(() => {
    // Play "entering strategy phase" sound
    audio.playPhaseEnter('strategy');
  }, []);

  useEffect(() => {
    const currentPlayer = players.find(p => p.id === currentPlayerId);

    if (currentPlayer) {
      // Play "The Arborec, choose your strategy"
      audio.playChooseStrategyPrompt(currentPlayer.factionId, true);
    }
  }, [currentPlayerId]);

  const handlePhaseComplete = () => {
    // Play "exiting strategy phase" sound
    audio.playPhaseExit('strategy');
    onComplete();
  };

  return (
    <div>
      {/* Your strategy phase UI */}
    </div>
  );
}
```

### 3. Action Phase - Play Action Prompts

```typescript
import { useActionPhaseAudio } from '@/hooks/useAudio';

function ActionPhase({ players, currentPlayerId }) {
  const audio = useActionPhaseAudio(players.map(p => p.factionId));

  useEffect(() => {
    // Play "entering action phase" sound
    audio.playPhaseEnter('action');
  }, []);

  useEffect(() => {
    const currentPlayer = players.find(p => p.id === currentPlayerId);

    if (currentPlayer) {
      // Play "Choose your action, The Arborec"
      audio.playChooseActionPrompt(currentPlayer.factionId, false);
    }
  }, [currentPlayerId]);

  const handleStrategyCardPlayed = (cardType: StrategyCardType) => {
    // Play a random variant of the strategy card sound
    audio.playStrategyCard(cardType, 3); // 3 variants
  };

  return (
    <div>
      <button onClick={() => handleStrategyCardPlayed('leadership')}>
        Use Leadership Card
      </button>
    </div>
  );
}
```

### 4. Custom Sound Sequences

For complex sound sequences, use the lower-level API:

```typescript
import { useAudio, SoundCategory } from '@/hooks/useAudio';

function CustomComponent() {
  const audio = useAudio();

  const playComplexSequence = async () => {
    // Play multiple sounds in sequence
    await audio.playChainedSounds([
      { category: SoundCategory.EVENT, id: 'combat' },
      { category: SoundCategory.FACTION, id: 'arborec' },
      { category: SoundCategory.PROMPT, id: 'choose_action' },
    ]);
  };

  return (
    <button onClick={playComplexSequence}>
      Play Complex Sequence
    </button>
  );
}
```

### 5. Manual Preloading for Specific Components

```typescript
import { useAudio, SoundCategory, PhaseType } from '@/hooks/useAudio';

function StatusPhase() {
  const audio = useAudio({
    autoPreload: true,
    preloadSounds: [
      { category: SoundCategory.PHASE_ENTER, id: PhaseType.STATUS },
      { category: SoundCategory.PHASE_EXIT, id: PhaseType.STATUS },
    ],
    unloadOnUnmount: true, // Clean up when component unmounts
  });

  return <div>{/* Status phase UI */}</div>;
}
```

### 6. Playing Event Sounds

```typescript
import { playEvent, EventType } from '@/lib/audio';

function CombatTracker() {
  const handleCombat = () => {
    // Play combat sound
    playEvent(EventType.COMBAT);
  };

  const handleMecatolCapture = () => {
    // Play Mecatol Rex capture sound
    playEvent(EventType.MECATOL_REX_TAKEN);
  };

  const handleSpeakerChange = () => {
    // Play speaker change sound
    playEvent(EventType.SPEAKER_CHANGE);
  };

  return (
    <div>
      <button onClick={handleCombat}>Combat!</button>
      <button onClick={handleMecatolCapture}>Mecatol Rex Taken!</button>
      <button onClick={handleSpeakerChange}>Speaker Changed!</button>
    </div>
  );
}
```

## Advanced Features

### Queue Management

The audio service automatically queues sounds to prevent overlapping:

```typescript
import { audioService } from '@/lib/audio';

// Check queue length
const queueLength = audioService.getQueueLength();

// Clear queue if needed (e.g., phase transition)
audioService.clearQueue();

// Stop currently playing sound
audioService.stopCurrentSound();
```

### Configuration

Configure the audio service in your app initialization:

```typescript
import { audioService } from '@/lib/audio';

// Set custom audio base path (default is '/audio')
audioService.setBasePath('/assets/sounds');
```

### Preloading Strategies

**Option 1: Preload everything at app start** (Recommended for most games)
```typescript
usePreloadGameAudio(factionIds);
```

**Option 2: Preload per phase** (Memory efficient for long games)
```typescript
// In Strategy Phase
const audio = useStrategyPhaseAudio(factionIds);

// In Action Phase
const audio = useActionPhaseAudio(factionIds);
```

**Option 3: Manual preloading** (Maximum control)
```typescript
const audio = useAudio();

// Preload specific sounds
await audio.preloadSounds([
  { category: SoundCategory.FACTION, id: 'arborec' },
  { category: SoundCategory.STRATEGY_CARD, id: 'leadership', variant: 1 },
]);
```

## API Reference

### Enums

- `SoundCategory`: FACTION, PHASE_ENTER, PHASE_EXIT, PROMPT, STRATEGY_CARD, EVENT
- `PhaseType`: STRATEGY, ACTION, STATUS, AGENDA
- `StrategyCardType`: LEADERSHIP, DIPLOMACY, POLITICS, CONSTRUCTION, TRADE, WARFARE, TECHNOLOGY, IMPERIAL
- `EventType`: COMBAT, MECATOL_REX_TAKEN, SPEAKER_CHANGE

### Main Functions

- `playFactionName(factionId)`: Play a faction name
- `playPhaseEnter(phase)`: Play phase enter sound
- `playPhaseExit(phase)`: Play phase exit sound
- `playStrategyCard(cardType, variantCount)`: Play strategy card sound (random variant)
- `playEvent(eventType)`: Play event sound
- `playFactionPrompt(factionId, promptId, factionFirst)`: Play faction + prompt sequence

### Hooks

- `useAudio(options)`: General-purpose audio hook
- `useStrategyPhaseAudio(factionIds)`: Pre-configured for strategy phase
- `useActionPhaseAudio(factionIds)`: Pre-configured for action phase
- `useStatusPhaseAudio()`: Pre-configured for status phase
- `useAgendaPhaseAudio()`: Pre-configured for agenda phase
- `usePreloadGameAudio(factionIds)`: Preload all game audio

## Performance Tips

1. **Preload Early**: Preload sounds at game start or phase start, not right before playing
2. **Use Variants**: Multiple variants prevent repetitive audio fatigue
3. **Queue Size**: Default max queue size is 10. Sounds beyond this are dropped
4. **Memory Management**: Use `unloadOnUnmount: true` for phase-specific sounds
5. **Min Gap**: 100ms gap between sounds prevents audio overlap

## Troubleshooting

### Sound not playing?

1. Check file exists at correct path
2. Verify file naming matches convention
3. Check browser console for errors
4. Ensure sound is preloaded before playing

### Sounds overlapping?

- The queue system should prevent this automatically
- If issues persist, manually call `audioService.clearQueue()`

### Too many sounds?

- Reduce `maxQueueSize` in audio service configuration
- Call `clearQueue()` during phase transitions

### Memory issues?

- Use phase-specific hooks with `unloadOnUnmount: true`
- Manually unload sounds when no longer needed
- Avoid preloading all sounds if you have many factions

## Example: Full Action Phase Integration

Here's a complete example showing how to integrate audio into the Action Phase:

```typescript
import { useActionPhaseAudio } from '@/hooks/useAudio';
import { StrategyCardType } from '@/lib/audio';

export function ActionPhase({ players, currentPlayerId, onComplete }) {
  const factionIds = players.map(p => p.factionId);
  const audio = useActionPhaseAudio(factionIds);
  const [hasPlayedEnterSound, setHasPlayedEnterSound] = useState(false);

  // Play enter sound once
  useEffect(() => {
    if (!hasPlayedEnterSound) {
      audio.playPhaseEnter('action');
      setHasPlayedEnterSound(true);
    }
  }, []);

  // Play prompt when turn changes
  useEffect(() => {
    if (currentPlayerId) {
      const player = players.find(p => p.id === currentPlayerId);
      if (player) {
        audio.playChooseActionPrompt(player.factionId, false);
      }
    }
  }, [currentPlayerId]);

  const handleStrategyCardUsed = (cardId: number) => {
    const cardType = getStrategyCardType(cardId); // Your helper function
    audio.playStrategyCard(cardType, 3);
  };

  const handlePhaseComplete = () => {
    audio.playPhaseExit('action');
    // Wait for sound to finish before transitioning
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div>
      {/* Your action phase UI */}
    </div>
  );
}
```

## Faction ID Reference

Make sure your faction IDs match these exactly:

**Base Game:**
- `arborec`
- `barony_of_letnev`
- `clan_of_saar`
- `embers_of_muaat`
- `emirates_of_hacan`
- `federation_of_sol`
- `ghosts_of_creuss`
- `l1z1x_mindnet`
- `mentak_coalition`
- `naalu_collective`
- `nekro_virus`
- `sardakk_norr`
- `universities_of_jolnar`
- `winnu`
- `xxcha_kingdom`
- `yin_brotherhood`
- `yssaril_tribes`

**Prophecy of Kings:**
- `argent_flight`
- `empyrean`
- `mahact_gene_sorcerers`
- `naaz_rokha_alliance`
- `nomad`
- `titans_of_ul`
- `vuil_raith_cabal`

**Codex:**
- `council_keleres`
