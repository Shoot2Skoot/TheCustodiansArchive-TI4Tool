# Game Flow and Phases Documentation

## Table of Contents
- [Game Lifecycle Overview](#game-lifecycle-overview)
- [Setup Flow](#setup-flow)
- [Round Structure](#round-structure)
- [Phase Details](#phase-details)
  - [Strategy Phase](#strategy-phase)
  - [Action Phase](#action-phase)
  - [Status Phase](#status-phase)
  - [Agenda Phase](#agenda-phase)
- [Special Mechanics](#special-mechanics)
- [End Game](#end-game)
- [State Transitions](#state-transitions)

---

## Game Lifecycle Overview

```
Game Creation
    ↓
Game Setup
    ↓
Round 0 (Setup Phase)
    ↓
Speaker Selection
    ↓
┌─────────────────────────┐
│  Round Loop (1 to N)    │
│  ┌──────────────────┐   │
│  │ Strategy Phase   │   │
│  └────────┬─────────┘   │
│           ↓             │
│  ┌──────────────────┐   │
│  │  Action Phase    │   │
│  └────────┬─────────┘   │
│           ↓             │
│  ┌──────────────────┐   │
│  │  Status Phase    │   │
│  └────────┬─────────┘   │
│           ↓             │
│  ┌──────────────────┐   │
│  │ Agenda Phase*    │   │
│  │ (*if Mecatol     │   │
│  │   claimed)       │   │
│  └────────┬─────────┘   │
│           ↓             │
│  [Check Victory]        │
│           ↓             │
│  [Next Round or End]    │
└─────────────────────────┘
    ↓
Victory/End Game
```

---

## Setup Flow

### 1. Game Creation

**User Actions**:
- Click "Create Game" or "New Game"
- System generates unique room code
- Navigates to setup screen

**State Created**:
```typescript
{
  gameId: string;
  roomCode: string;
  status: 'setup';
  createdAt: timestamp;
  createdBy: userId;
}
```

---

### 2. Player Count Selection

**User Actions**:
- Select number of players (3-8) via slider or buttons
- UI updates to show appropriate number of player slots
- Galaxy map preview changes to match player count

**State Changes**:
```typescript
{
  playerCount: 3 | 4 | 5 | 6 | 7 | 8;
}
```

**UI Elements**:
- Player count selector
- Galaxy map preview (SVG image corresponding to player count)
- Player setup slots arranged around map

---

### 3. Player Configuration

**For Each Player Slot**:

**User Actions**:
1. Click "Set Player" button on a slot
2. Modal opens with:
   - **Color Selection**: 8 TI4 colors (red, blue, green, yellow, purple, black, orange, pink)
   - **Faction Selection**: Categorized list
     - Base Game factions
     - Prophecy of Kings factions
     - Council Keleres (Codex)
     - Random option
   - **Confirm** and **Cancel** buttons

3. Select color (required)
4. Select faction (required)
5. Click Confirm to save or Cancel to close without saving

**Validation Rules**:
- Each color can only be selected once
- Each faction can only be selected once
- If color already taken, disable that color option
- If faction already taken, remove from list
- All player slots must be configured before proceeding

**State Per Player**:
```typescript
{
  id: string;
  position: number;        // 1-8, determines table order
  color: PlayerColor;
  factionId: string;
  userId?: string;         // If player has joined, otherwise null
  displayName?: string;    // Player/faction name
}
```

---

### 4. Game Options Configuration

**User Actions**:
- Configure game settings on options screen

**Settings**:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| Victory Point Meter | Toggle | ON | Show VP bar at top |
| Victory Points Limit | Number | 10 | Points needed to win |
| Fullscreen | Toggle | OFF | Enable fullscreen mode |
| Inactivity Timer | Number (minutes) | 15 | Warning if no activity |
| Player Timer Mode | Toggle | Per-turn reset | Cumulative vs. per-turn |
| Decision Bar | Toggle + Number | OFF / 90s | Optional progress timer |
| Detailed Agenda Mode | Toggle | ON | Step-by-step vs. simple counter |

**State Changes**:
```typescript
{
  config: {
    showVPMeter: boolean;
    vpLimit: number;
    fullscreen: boolean;
    inactivityTimerMinutes: number;
    timerMode: 'per-turn' | 'cumulative';
    decisionBarEnabled: boolean;
    decisionBarSeconds: number;
    detailedAgendaMode: boolean;
  }
}
```

**User Actions After Configuration**:
- Click "Next" to proceed to Round 0

---

### 5. Round 0 - Setup Phase

**UI Display**:
- "Round 0"
- "Setup Phase" or similar label
- Message: "Build the galaxy"
- Button: "Start First Round"

**Purpose**:
- Players physically set up the game board
- Place starting units
- Distribute starting resources
- No digital tracking during this phase

**User Actions**:
- Click "Start First Round" when physical setup complete

**State Changes**:
```typescript
{
  currentRound: 1;
  currentPhase: 'speaker-selection';
}
```

---

### 6. Speaker Selection

**UI Display**:
- Modal/overlay: "Select the Speaker"
- List of all factions in the game
- "Random" button

**User Actions**:
- Click on a faction to select as speaker
- OR click "Random" to randomly select

**Behavior**:
- Selecting a faction immediately closes the modal
- No confirm button needed
- Can re-open via speaker button in bottom-left corner

**State Changes**:
```typescript
{
  speakerId: string;  // Player ID of speaker
  speakerHistory: [{ round: 1, playerId: string }];
}
```

**After Selection**:
- Proceed to Round 1 Strategy Phase

---

## Round Structure

Each round consists of the following phases (in order):

1. **Strategy Phase**: Select strategy cards
2. **Action Phase**: Take turns performing actions
3. **Status Phase**: End-of-round maintenance
4. **Agenda Phase**: Vote on agendas (only if Mecatol Rex claimed)

After all phases, check victory condition and either start next round or end game.

---

## Phase Details

### Strategy Phase

**Purpose**: Players select strategy cards in speaker order

**Turn Order**: Speaker first, then clockwise around table

**UI Layout**:
```
┌───────────────────────────────────────────┐
│  Victory Point Bar (if enabled)           │
├───────────────────────────────────────────┤
│  Round X - Strategy Phase                 │
├───────────────────────────────────────────┤
│  Current Player: [Faction Name]           │
├───────────────────────────────────────────┤
│  Strategy Cards:                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │  1   │ │  2   │ │  3   │ │  4   │    │
│  │ Lead.│ │ Dipl.│ │ Pol. │ │ Cons.│    │
│  │      │ │ +1TG │ │      │ │      │    │
│  └──────┘ └──────┘ └──────┘ └──────┘    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │  5   │ │  6   │ │  7   │ │  8   │    │
│  │Trade │ │ War. │ │ Tech.│ │ Imp. │    │
│  └──────┘ └──────┘ └──────┘ └──────┘    │
└───────────────────────────────────────────┘
```

**Strategy Cards**:

| # | Name | Primary Ability | Secondary Ability |
|---|------|-----------------|-------------------|
| 1 | Leadership | Gain 3 command tokens | Gain 1 command token (cost: 1 influence) |
| 2 | Diplomacy | Prevent attacks in a system | Spend 1 token to ready 2 planets |
| 3 | Politics | Draw 2 action cards, choose new speaker | Spend 1 token to draw 2 action cards |
| 4 | Construction | Build structures in 2 systems | Spend 1 token to place 1 PDS or space dock |
| 5 | Trade | Gain 3 trade goods, replenish commodities | Spend 1 token to replenish commodities |
| 6 | Warfare | Remove command token, place it elsewhere | Spend 1 token to use production |
| 7 | Technology | Research 1 technology | Spend 1 token and 6 resources to research |
| 8 | Imperial | Gain 1 VP or score public objective, draw secret | Spend 1 token to draw secret objective |

**User Actions**:
1. Current player clicks on an available strategy card
2. Card is assigned to that player
3. If card had trade good bonus (unpicked in previous rounds), player receives those trade goods
4. Turn advances to next player in speaker order
5. Repeat until all players have selected a card

**Trade Good Bonus Logic**:
- Cards not selected in previous round(s) gain +1 trade good per round
- Bonus accumulates (e.g., if unpicked 2 rounds, +2 trade goods)
- When card is selected, player receives bonus trade goods
- Bonus resets to 0 for that card

**State Tracking**:
```typescript
// Per round
strategySelections: [
  {
    roundNumber: number;
    playerId: string;
    strategyCardId: number;  // 1-8
    tradeGoodBonus: number;  // 0-N
    selectionOrder: number;  // 1-playerCount
  }
]

// Strategy card state
strategyCards: [
  {
    id: number;             // 1-8
    name: string;
    available: boolean;
    tradeGoodBonus: number;
  }
]
```

**After All Selections**:

**UI Display**:
- Summary of who selected which card
- Buttons:
  - "Reset Phase": Clear all selections, start over
  - "Play End Phase Card Effect": (Future feature for certain action cards)
  - "End Phase": Proceed to Action Phase

**State Changes**:
```typescript
{
  currentPhase: 'action';
}
```

---

### Action Phase

**Purpose**: Players take turns performing actions until all pass

**Turn Order**: By strategy card number (lowest to highest)

**UI Layout**:
```
┌───────────────────────────────────────────┐
│  Victory Point Bar (if enabled)           │
├───────────────────────────────────────────┤
│  Round X - Action Phase                   │
├───────────────────────────────────────────┤
│  Current Player: [Faction Name]           │
│  Strategy Card: [Card Name] (#)           │
├───────────────────────────────────────────┤
│  Actions:                                  │
│  ┌─────────────────────────────────────┐  │
│  │  Tactical / Component Action        │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │  [Strategy Card Name]               │  │
│  │  (Primary Action)                   │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │  Pass                               │  │
│  │  (Disabled until strategy used)     │  │
│  └─────────────────────────────────────┘  │
├───────────────────────────────────────────┤
│  Player Status:                            │
│  ✓ [Faction 1] - Strategy Used, Passed   │
│  → [Faction 2] - Current Turn             │
│    [Faction 3] - Active                   │
└───────────────────────────────────────────┘
```

**Available Actions**:

1. **Tactical / Component Action**
   - Player takes a tactical action (activating a system, moving ships, etc.)
   - OR component action (using faction ability, action card, etc.)
   - **UI Behavior**: Show "Resolving actions..." loader/message
   - **Logic**: No backend tracking of specific action details (tracked physically)
   - **State**: Mark that player took a tactical/component action this turn

2. **Strategy Card Primary Action**
   - Player uses their strategy card's primary ability
   - **UI Behavior**: Show modal with primary action details and secondary action available to others
   - **Logic**: Specific logic based on card:
     - **Politics (3)**: Must select new speaker (not current speaker)
     - **Other cards**: Show action details, no automatic effects
   - **State**: Mark strategy card as used for this round
   - **Unlock**: Pass button becomes enabled

3. **Pass**
   - Player passes for the round
   - **Requirement**: Can only pass AFTER using strategy card primary action
   - **Effect**: Player removed from turn rotation for remainder of Action Phase
   - **State**: Mark player as passed

**Turn Progression**:
- After action, click "Next Player" (or automatic after selection)
- Turn advances to player with next lowest strategy card number
- Skip players who have passed
- When all players have passed, phase ends

**Strategy Card Action Display**:

When player selects strategy card action, show modal:

```
┌─────────────────────────────────────────┐
│  [Strategy Card Name]                   │
├─────────────────────────────────────────┤
│  Primary Action (Current Player):       │
│  [Detailed description of primary]      │
│                                         │
│  Secondary Action (Other Players):      │
│  [Detailed description of secondary]    │
│                                         │
│  [Close]                                │
└─────────────────────────────────────────┘
```

**Politics Card Special Logic**:

When Politics primary action is played:

```
┌─────────────────────────────────────────┐
│  Politics - Choose New Speaker          │
├─────────────────────────────────────────┤
│  Select a player to become the new      │
│  speaker (cannot select current speaker)│
│                                         │
│  [ ] [Faction 1]                        │
│  [X] [Current Speaker] (disabled)       │
│  [ ] [Faction 3]                        │
│  ...                                    │
│                                         │
│  [Confirm]                              │
└─────────────────────────────────────────┘
```

**State Tracking**:
```typescript
// Per player per round
playerActionState: [
  {
    playerId: string;
    roundNumber: number;
    strategyCardUsed: boolean;
    tacticalActionsCount: number;  // Optional tracking
    hasPassed: boolean;
  }
]
```

**Phase End Condition**:
- All players have passed
- Automatically proceed to Status Phase

**State Changes**:
```typescript
{
  currentPhase: 'status';
}
```

---

### Status Phase

**Purpose**: End-of-round maintenance, objective scoring, preparation for next round

**UI Layout**:
```
┌───────────────────────────────────────────┐
│  Round X - Status Phase                   │
├───────────────────────────────────────────┤
│  Initiative Order:                         │
│  1. [Speaker Faction]                     │
│  2. [Next Player Clockwise]               │
│  ...                                      │
├───────────────────────────────────────────┤
│  Status Phase Steps:                       │
│  [ ] 1. Score objectives                  │
│  [ ] 2. Flip next public objective        │
│  [ ] 3. Draw one action card              │
│  [ ] 4. Return command tokens             │
│  [ ] 5. Gain two command tokens           │
│  [ ] 6. Ready all cards                   │
│  [ ] 7. Repair units & return strategies  │
│                                           │
│  [Next Phase]                             │
└───────────────────────────────────────────┘
```

**Initiative Order**:
- Display shows the order in which players perform status phase steps
- **Options for Order**:
  1. Speaker first, then clockwise (table order)
  2. Strategy card order (as in Action Phase)
- **Decision Needed**: Determine which order is correct per TI4 rules

**Status Phase Steps**:

1. **Score Objectives**
   - Players score one public and/or one secret objective
   - **UI**: Players can click their VP counter to increment
   - **Future**: Integrate with objectives view for tracking

2. **Flip Next Public Objective**
   - Reveal next public objective card
   - **UI**: Show new objective in objectives view
   - **Stage I vs Stage II**: Track which stage objectives are from

3. **Draw One Action Card**
   - Each player draws one action card
   - **UI**: Simple acknowledgment, no tracking of specific cards

4. **Return Command Tokens**
   - Return command tokens from board to reinforcements
   - **UI**: No digital tracking

5. **Gain Two Command Tokens**
   - Players gain 2 command tokens to allocate
   - **UI**: No digital tracking

6. **Ready All Cards**
   - Exhaust (ready) all exhausted cards
   - **UI**: If tracking technologies, mark all as readied

7. **Repair Units and Return Strategies**
   - Repair damaged units, return strategy cards
   - **UI**: Mark all strategy cards as available for next round

**Interactive Checklist** (Optional Enhancement):
- Allow clicking on each step to mark as complete (strike-through)
- Visual progress through status phase
- Helps players not forget steps
- Resets for next round

**State Tracking**:
```typescript
// Optional per-player checklist tracking
statusPhaseProgress: [
  {
    playerId: string;
    roundNumber: number;
    stepsCompleted: boolean[];  // [step1, step2, ..., step7]
  }
]
```

**Next Phase Button**:
- Click to proceed
- If Mecatol Rex has been claimed → Agenda Phase
- If Mecatol Rex not claimed → Next Round (Strategy Phase)

---

### Mecatol Rex Custodians Check

**Timing**: After first Status Phase of the game

**UI Display**:
```
┌─────────────────────────────────────────┐
│  Mecatol Rex Status                     │
├─────────────────────────────────────────┤
│  [Image: Mecatol Rex system]            │
│  [Icon: 6 Influence]                    │
│                                         │
│  The Custodians are still guarding      │
│  Mecatol Rex                            │
│                                         │
│  [Hover/Click to claim]                 │
└─────────────────────────────────────────┘
```

**User Actions**:
- **Hover/Click on Mecatol Rex image**: Changes text to "The Custodians left Mecatol Rex"
- **Click to confirm**: Sets Mecatol Rex as claimed

**State Changes**:
```typescript
{
  mecatolClaimed: true;
  mecatolClaimedRound: number;
}
```

**Effect**:
- Once claimed, Agenda Phase will occur at end of future rounds
- State persists for remainder of game
- Cannot be unclaimed

---

### Agenda Phase

**Condition**: Only occurs if Mecatol Rex has been claimed

**Timing**: After Status Phase

**UI Layout**:
```
┌───────────────────────────────────────────┐
│  Round X - Agenda Phase                   │
├───────────────────────────────────────────┤
│  Agenda Resolution Steps:                  │
│  1. Reveal and read the agenda            │
│  2. Apply when agenda is revealed/        │
│     sealed effects                        │
│  3. Apply after agenda is revealed        │
│     effects                               │
│  4. Open discussion                       │
│  5. Voting                                │
│  6. Result and resolve                    │
├───────────────────────────────────────────┤
│  Vote Counters:                            │
│  [Faction 1]: [▼ 5 ▲]                     │
│  [Faction 2]: [▼ 8 ▲]                     │
│  [Faction 3]: [▼ 3 ▲]                     │
│  ...                                      │
│                                           │
│  [Next Agenda] [End Phase]                │
└───────────────────────────────────────────┘
```

**Agenda Resolution Steps**:

1. **Reveal and Read Agenda**
   - Draw and reveal agenda card
   - Read agenda text
   - **UI**: Display agenda card details (future feature)

2. **Apply When Revealed/Sealed Effects**
   - Some action cards or abilities trigger here
   - **UI**: Reminder text only

3. **Apply After Revealed Effects**
   - Other timing-specific effects
   - **UI**: Reminder text only

4. **Open Discussion**
   - Players discuss and negotiate
   - **UI**: No digital tracking

5. **Voting**
   - Players cast votes based on influence/planets
   - **UI**: Vote counter inputs for each player
   - **Logic**: No automatic vote counting, manual entry

6. **Result and Resolve**
   - Determine outcome, apply effects
   - **UI**: No automatic resolution

**Vote Counters**:
- Increment/decrement controls for each player
- No validation or vote total calculation
- Players manually enter their votes
- No enforcement of voting rules (just a tracker)

**Multiple Agendas**:
- "Next Agenda" button to reveal and vote on second agenda
- Standard TI4 has two agendas per Agenda Phase
- After second agenda, "End Phase" proceeds to next round

**State Tracking**:
```typescript
// Optional: Track agenda outcomes
agendaResults: [
  {
    roundNumber: number;
    agendaNumber: 1 | 2;
    votes: [
      { playerId: string, voteCount: number }
    ];
  }
]
```

**Phase End**:
- Click "End Phase"
- Proceed to next round (Round increment, back to Strategy Phase)

---

## Special Mechanics

### Victory Point Tracking

**UI**: Victory Point Bar at top of screen (if enabled in options)

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│  VP Bar                                                │
│  Speaker → [Faction 1: ●●●○○○○○○○] 3/10               │
│             [Faction 2: ●●○○○○○○○○] 2/10               │
│             [Faction 3: ●●●●○○○○○○] 4/10               │
│             ...                                        │
└────────────────────────────────────────────────────────┘
```

**Functionality**:
- Click to increment by 1
- **Improvement**: Add decrement button or -/+ controls
- **Improvement**: Input field for direct entry

**Victory Detection**:
- When any player reaches VP limit (set in options)
- "End Game" button appears
- Host can click to end game and show victory screen

---

### Speaker Changes

**Initial Speaker**: Selected before Round 1

**Speaker Changes**:
- **Politics Card**: When Politics primary action is played, new speaker selected
- **Timing**: Takes effect immediately (visible indicator updates)
- **Next Round**: New speaker goes first in Strategy Phase

**UI Indicator**:
- Speaker icon/badge next to current speaker's name
- Bottom-left corner button to view/change speaker (admin only)

**State**:
```typescript
{
  speakerId: string;
  speakerHistory: [
    { round: number, playerId: string, changedVia: 'initial' | 'politics' }
  ];
}
```

---

### Undo System

**Scope**: Ability to undo any action

**Undo Types**:

1. **Immediate Undo**: Undo last action (e.g., wrong strategy card clicked)
2. **Phase Rollback**: Reset entire phase
3. **Round Rollback**: Reset to beginning of current round

**UI**:
- "Undo" button always visible (bottom toolbar or corner)
- Shows what will be undone ("Undo: Strategy Card Selection")
- Confirmation for major rollbacks

**Implementation**:
- Maintain action history stack
- Store snapshots of game state at phase boundaries
- Replay actions or restore snapshots

---

### Timers

#### Inactivity Timer

**Purpose**: Warn players if no activity for set duration

**Behavior**:
- After X minutes of no actions, show warning
- "No activity detected. Is the game still in progress?"
- Does not auto-end game or kick players

**State**:
```typescript
{
  lastActivityTimestamp: number;
  inactivityWarningShown: boolean;
}
```

#### Player Turn Timer

**Mode 1: Per-Turn Reset**
- Timer starts when it's a player's turn
- Resets at start of next turn
- Tracks only current turn duration

**Mode 2: Cumulative**
- Tracks total time per player across entire game
- Displayed at end game screen

**UI**: Small timer display near current player indicator

---

### Decision Bar (Optional)

**Purpose**: Progress bar to prevent analysis paralysis

**Behavior**:
- Set duration (e.g., 90 seconds)
- Progress bar depletes over time
- Options:
  - **Repeat**: Auto-restarts after reaching 0
  - **Manual Reset**: Click to reset

**UI**: Horizontal progress bar near action buttons

**No Enforcement**: Visual nudge only, does not force actions

---

## End Game

### Victory Condition

**Trigger**: Any player reaches VP limit (from options)

**UI**: "End Game" button appears when condition met

**Host Action**: Click "End Game" to proceed to victory screen

---

### Victory Screen

**UI Layout**:
```
┌─────────────────────────────────────────┐
│  Swear your allegiance to the new       │
│  galactic emperor                       │
│                                         │
│  [Faction Image/Name]                   │
├─────────────────────────────────────────┤
│  Final Scoreboard:                       │
│  ┌───────────────────────────────────┐  │
│  │ Rank | Faction | VP | Time | Spkr │  │
│  │  1   │ [Name]  │ 10 │ 2h45m│  3   │  │
│  │  2   │ [Name]  │  9 │ 3h12m│  2   │  │
│  │  3   │ [Name]  │  7 │ 2h30m│  1   │  │
│  │ ...                              │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  Game Duration: 4h 32m                  │
│  Total Rounds: 8                        │
│                                         │
│  [New Game] [Exit]                      │
└─────────────────────────────────────────┘
```

**Displayed Stats**:
- Winner announcement
- Final scoreboard (sorted by VP):
  - Rank
  - Faction name/color
  - Victory Points
  - Total turn time (if cumulative timer enabled)
  - Number of times speaker
  - Final influence count (TBD: clarify what this stat represents)
- Total game duration (wall clock time)
- Total rounds played

**Navigation**:
- "New Game": Return to game creation/setup
- "Exit": Return to main menu
- No way to return to game (game is over)

---

## State Transitions

### State Machine

```
States:
- setup
- round-0
- speaker-selection
- strategy-phase
- action-phase
- status-phase
- mecatol-check (one-time)
- agenda-phase (conditional)
- end-game

Transitions:
setup → round-0
round-0 → speaker-selection
speaker-selection → strategy-phase

strategy-phase → action-phase
action-phase → status-phase
status-phase → mecatol-check (if round 1 and not yet checked)
status-phase → agenda-phase (if mecatol claimed)
status-phase → strategy-phase (next round, if no agenda phase)

agenda-phase → [check victory]
[check victory] → strategy-phase (next round) OR end-game

end-game → (terminal state)
```

### Round Increment Logic

```typescript
function advancePhase(currentPhase: GamePhase, gameState: GameState) {
  switch (currentPhase) {
    case 'strategy-phase':
      return 'action-phase';

    case 'action-phase':
      return 'status-phase';

    case 'status-phase':
      // Check if Mecatol claimed
      if (gameState.mecatolClaimed) {
        return 'agenda-phase';
      } else {
        // Increment round, go to strategy phase
        incrementRound();
        return 'strategy-phase';
      }

    case 'agenda-phase':
      // Check victory
      if (anyPlayerAtVPLimit(gameState)) {
        return 'victory-pending'; // Host can trigger end game
      } else {
        incrementRound();
        return 'strategy-phase';
      }

    default:
      throw new Error('Invalid phase transition');
  }
}
```

---

## Game State Snapshot Example

```typescript
{
  // Meta
  gameId: "abc123",
  roomCode: "ALPHA7",
  status: "in-progress",

  // Config
  config: {
    playerCount: 6,
    vpLimit: 10,
    showVPMeter: true,
    // ... other options
  },

  // Current State
  currentRound: 3,
  currentPhase: "action-phase",
  currentTurnPlayerId: "player-2",

  // Players
  players: [
    {
      id: "player-1",
      position: 1,
      color: "red",
      factionId: "arborec",
      victoryPoints: 4,
      isSpeaker: false,
      strategyCard: 2, // Diplomacy
      strategyCardUsed: true,
      hasPassed: false,
    },
    // ... more players
  ],

  // Speaker
  speakerId: "player-3",

  // Mecatol
  mecatolClaimed: true,
  mecatolClaimedRound: 2,

  // Strategy Cards
  strategyCards: [
    { id: 1, name: "Leadership", available: false, assignedTo: "player-5", tradeGoodBonus: 0 },
    { id: 2, name: "Diplomacy", available: false, assignedTo: "player-1", tradeGoodBonus: 1 },
    // ... more cards
  ],

  // Round History (for undo)
  history: [
    { round: 1, phase: "strategy-phase", timestamp: "..." },
    // ... more history
  ],
}
```

---

## Summary

This document provides a comprehensive view of the game flow through all phases, state transitions, and special mechanics. It serves as a reference for implementing the game logic and UI components.

**Key Takeaways**:
1. Game progresses through well-defined phases
2. State transitions are deterministic and based on rules
3. UI provides clear visual feedback at each step
4. System tracks game state but doesn't enforce all TI4 rules (players still play physically)
5. Improvements over Extra Computer integrated throughout (undo, better VP tracking, etc.)
