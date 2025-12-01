# Combat Assistant

A comprehensive modal-based combat assistant for Twilight Imperium 4th Edition that guides players through the entire combat resolution flow.

## Features

- **Full Combat Flow Coverage**: Implements all combat phases from the official rules:
  - Phase 0: System Activation and Pre-Combat Abilities
  - Phase I: Space Cannon Offense
  - Phase II: Space Combat (with multiple rounds)
  - Phase III: Invasion (Bombardment and Ground Force Commitment)
  - Phase IV: Ground Combat (with multiple rounds)

- **Action Card Support**: Buttons for all major action cards at their correct timing windows:
  - DISABLE, SOLAR FLARE Ω (Pre-SCO)
  - SCRAMBLE FREQUENCY (Rerolls)
  - DIRECT HIT, EMERGENCY REPAIRS (Space Combat)
  - WAYLAY (AFB)
  - BUNKER, BLITZ Ω (Bombardment)
  - FIRE TEAM (Ground Combat)
  - And more...

- **Faction Ability Integration**: Includes buttons for faction-specific abilities and technologies:
  - Yssaril Commander
  - Jol-Nar E-Res Siphons & Graviton Laser System
  - Xxcha Nullification Field
  - Yin Impulse Core & Indoctrination
  - Muaat Reveal Prototype
  - Argent Hero & Raid Formation
  - L1Z1X Harrow
  - Sol Commander
  - And more...

- **State Persistence**: Combat state is saved to localStorage, allowing players to:
  - Close the modal and resume later
  - Maintain combat progress across page refreshes
  - Continue from where they left off if accidentally closed

- **Combat Logging**: Full combat log tracks all decisions and actions for reference

- **Step-by-Step Guidance**: The modal only shows relevant options for the current step, preventing errors and ensuring correct flow

## How to Use

### Starting Combat

1. During the Action Phase, click the **"Enter Combat"** button in the Game Actions panel
2. The Combat Modal will open with the current player as the Attacker
3. The first opponent (defender) is automatically selected (TODO: add player selection UI)

### Navigating Combat

- **Follow the prompts**: Each phase and step displays exactly what needs to be resolved
- **Use buttons for abilities**: Click buttons to use action cards or faction abilities at the correct timing
- **Enter hit results**: Use number inputs to record hits and casualties
- **Advance with "Continue"**: The primary button advances to the next step

### Testing the Logic

The current implementation focuses on **logic validation** through simple button interactions:

- All buttons log their actions to the combat log
- Ship and ground force counts update in real-time
- Debug info shows current state at the bottom of the modal
- Phase/Step indicators show your current position in the flow

### Example Test Flow

1. **Phase 0**: Click "No Abilities to Use" to proceed
2. **Phase I - SCO**:
   - Click "No Action Cards"
   - Enter "2" for Defender SCO Hits
   - Enter "0" for Attacker SCO Hits
   - Enter "2" for Attacker Ships Destroyed
   - Click "Continue" to proceed to Space Combat
3. **Phase II - Space Combat**:
   - Click "No Abilities to Use" for start of combat
   - (Round 1 only) Enter AFB hits for both sides
   - Click "No Retreats" to announce retreat status
   - Enter combat roll hits for both sides
   - Enter ships destroyed for both sides
   - Either continue to next round or proceed based on outcome
4. **Phase III - Invasion**:
   - Enter bombardment hits
   - Commit ground forces
   - Enter PDS defense hits
5. **Phase IV - Ground Combat**:
   - Similar to Space Combat but with ground forces
   - Continue until one side is eliminated
   - Establish control if attacker wins

### State Persistence

The combat state is automatically saved to `localStorage` under the key `combat_<gameId>`. This allows:

- Closing the modal with "Save & Exit"
- Resuming combat later
- Surviving page refreshes (as long as you're in the same game)

When combat completes, the state is automatically cleared.

## Current Limitations

- Defender selection: Currently auto-selects the first opponent. Need to add a player selection UI.
- Unit details: Uses placeholder unit counts. Need to integrate with actual game state.
- Faction detection: Action card/ability buttons show all options. Need to filter based on actual factions/tech.
- Database integration: Combat results are logged but not yet persisted to the game database.

## Next Steps (After Logic Validation)

Once you've confirmed the combat logic is correct:

1. **Improve UI**: Replace text-based inputs with visual unit displays
2. **Add dice rolling**: Integrate actual dice rolling UI with animations
3. **Faction-specific filtering**: Only show relevant abilities based on factions in combat
4. **Unit state integration**: Pull actual unit counts and status from game state
5. **Visual polish**: Add animations, better styling, faction colors, etc.
6. **Database persistence**: Save combat results and integrate with game state
7. **Player selection**: Add UI to select which opponent to fight
8. **Multiple planet support**: Handle invasion across multiple planets

## File Structure

```
src/features/combat/
├── CombatModal.tsx           # Main combat modal component
├── CombatModal.module.css    # Modal styles
├── index.ts                  # Public exports
└── README.md                 # This file
```

## Integration

The combat modal is integrated into ActionPhase:

```typescript
import { CombatModal } from '@/features/combat';

// In ActionPhase render:
{showCombatModal && currentPlayer && combatDefenderId && (
  <CombatModal
    gameId={gameId}
    attackerId={currentPlayer.id}
    defenderId={combatDefenderId}
    // ... other props
  />
)}
```
