# Requirements Document

## Table of Contents
- [Functional Requirements](#functional-requirements)
  - [Authentication & User Management](#authentication--user-management)
  - [Game Setup](#game-setup)
  - [Game Phases](#game-phases)
  - [Player Actions](#player-actions)
  - [Game State Tracking](#game-state-tracking)
  - [Multi-Device Support](#multi-device-support)
  - [Additional Views](#additional-views)
- [Non-Functional Requirements](#non-functional-requirements)
- [Improvements Over Extra Computer](#improvements-over-extra-computer)
- [Future Features](#future-features)

---

## Functional Requirements

### Authentication & User Management

#### REQ-AUTH-001: Flexible Authentication
- **Priority**: High
- **Description**: System must support both authenticated users (via Supabase Auth) and guest/anonymous users
- **Acceptance Criteria**:
  - Users can create accounts and log in
  - Users can join games as guests without authentication
  - Guest users persist within a session but don't carry data across sessions
  - Authenticated users can track game history across sessions

#### REQ-AUTH-002: Room/Lobby System
- **Priority**: High
- **Description**: Games are created with unique room codes that players use to join
- **Acceptance Criteria**:
  - Host can create a new game and receive a unique room code
  - Players can join using a room code
  - Room codes are easy to share (short, alphanumeric)
  - Players can see all games they are members of
  - Only players in a game can access that game's data

### Game Setup

#### REQ-SETUP-001: Player Count Selection
- **Priority**: High
- **Description**: Host can select number of players (3-8)
- **Acceptance Criteria**:
  - Slider or selector for 3-8 players
  - UI updates to show correct number of player slots
  - Galaxy map preview updates based on player count

#### REQ-SETUP-002: Galaxy Map Preview
- **Priority**: Medium
- **Description**: Visual representation of the hex map based on player count
- **Acceptance Criteria**:
  - Different vector images for each player count (3-8)
  - Player position indicators around the map
  - Clear visual indication of player order

#### REQ-SETUP-003: Player Configuration
- **Priority**: High
- **Description**: Set up each player with color and faction
- **Acceptance Criteria**:
  - Modal/dialog to configure each player
  - Select from 8 standard TI4 colors
  - Select from all available factions:
    - Base game factions
    - Prophecy of Kings factions
    - Council Keleres (Codex)
  - Random faction selection option
  - Cancel option to close dialog without saving
  - All players must be configured before proceeding

#### REQ-SETUP-004: Unique Color and Faction Selection
- **Priority**: High
- **Description**: No two players can have the same color or faction
- **Acceptance Criteria**:
  - Once a color is selected, it's removed from available options for other players
  - Once a faction is selected, it's removed from available options for other players
  - UI clearly indicates which options are unavailable

#### REQ-SETUP-005: Player Order Definition
- **Priority**: High
- **Description**: Player setup defines initial table order
- **Acceptance Criteria**:
  - Position of player setup slots determines table order
  - Order is used for clockwise turn progression
  - Order is clearly visible throughout the game

#### REQ-SETUP-006: Game Options Configuration
- **Priority**: High
- **Description**: Configure game settings before starting
- **Acceptance Criteria**:
  - **Victory Point Meter**: Toggle for top bar display (default: ON)
  - **Victory Points Limit**: Number input (default: 10)
  - **Fullscreen**: Toggle or button for fullscreen mode
  - **Inactivity Timer**: Minutes input (default: 15) - shows warning when no activity
  - **Player Timer Mode**: Toggle between per-turn reset vs. cumulative time
  - **Decision Bar**: Optional progress bar with timer (default: 90 seconds, can repeat or manual reset)
  - **Agenda Voting Mode**: Toggle between detailed steps vs. simple vote counter (default: detailed)
  - Options can be changed during the game (design decision needed)

#### REQ-SETUP-007: Setup Phase (Round 0)
- **Priority**: High
- **Description**: Intermediate phase before first round begins
- **Acceptance Criteria**:
  - Display "Round 0" with setup phase label
  - Prompt to build galaxy
  - "Start First Round" button to proceed
  - No game logic during this phase (physical setup time)

### Game Phases

#### REQ-PHASE-001: Speaker Selection
- **Priority**: High
- **Description**: Initial speaker selection before first round
- **Acceptance Criteria**:
  - Modal appears before Round 1 Strategy Phase
  - Can select any faction or random
  - Speaker indicator appears in UI
  - Can change speaker via button in bottom-left corner
  - Speaker indicator persists until changed via Politics card

#### REQ-PHASE-002: Strategy Phase
- **Priority**: High
- **Description**: Players select strategy cards in speaker order
- **Acceptance Criteria**:
  - Display all 8 strategy cards:
    1. Leadership
    2. Diplomacy
    3. Politics
    4. Construction
    5. Trade
    6. Warfare
    7. Technology
    8. Imperial
  - Players select in order starting with speaker, then clockwise
  - Left-click to select strategy card
  - Cards become unavailable once selected
  - Unpicked cards from previous round gain +1 trade good (stacking)
  - Trade good bonus displayed on card
  - After all players select, show summary of selections
  - Options: "Reset Phase", "Play End Phase Card Effect", "End Phase"

#### REQ-PHASE-003: Action Phase
- **Priority**: High
- **Description**: Players take actions in strategy card number order
- **Acceptance Criteria**:
  - Display current player based on lowest strategy card number
  - Show player's strategy card
  - Action options for current player:
    - "Tactical/Component Action" button
    - "{Strategy Card Name}" button (e.g., "Leadership")
    - "Pass" button (disabled until strategy card action taken)
  - Tactical/Component shows "Resolving actions" loader (no backend logic)
  - Strategy card action triggers card-specific effects
  - Track which players have:
    - Taken tactical/component actions
    - Used their strategy card primary action
    - Passed
  - Players who pass are removed from turn rotation
  - Phase ends when all players have passed
  - Automatic progression to Status Phase

#### REQ-PHASE-004: Action Phase - Politics Card Special Logic
- **Priority**: High
- **Description**: Politics card forces speaker change
- **Acceptance Criteria**:
  - When Politics primary action is played, must select new speaker
  - New speaker must be different from current speaker
  - Speaker indicator updates immediately
  - New speaker order applies to next round

#### REQ-PHASE-005: Status Phase
- **Priority**: High
- **Description**: End-of-round maintenance and scoring
- **Acceptance Criteria**:
  - Display initiative order (speaker first, then table order OR strategy card order)
  - Show status phase steps:
    1. Score one public and/or one secret objective
    2. Flip next public objective
    3. Draw one action card
    4. Return command tokens
    5. Gain two command tokens
    6. Ready all cards
    7. Repair units and return strategies
  - Optional: Allow clicking steps to mark as complete (strike-through)
  - "Next Phase" button to continue
  - Track completion state per player (optional feature)

#### REQ-PHASE-006: Mecatol Rex Custodians
- **Priority**: High
- **Description**: Track when Mecatol Rex is claimed
- **Acceptance Criteria**:
  - After first Status Phase, show Mecatol Rex status screen
  - Default: "The Custodians are still guarding Mecatol Rex"
  - Display Mecatol Rex system image with 6 influence icon
  - Hover/click to change status to "The Custodians left Mecatol Rex"
  - Once claimed, state persists for entire game
  - Mecatol Rex status gates Agenda Phase

#### REQ-PHASE-007: Agenda Phase
- **Priority**: High
- **Description**: Voting on galactic agendas (only after Mecatol Rex claimed)
- **Acceptance Criteria**:
  - Only appears if Mecatol Rex has been claimed
  - Display agenda resolution steps:
    1. Reveal and read the agenda
    2. Apply when an agenda is removed/sealed effects
    3. Apply after an agenda is revealed effects
    4. Open discussion
    5. Voting
    6. Result and resolve
  - Vote counters for each player (increment/decrement controls)
  - No voting logic enforced, just tracking numbers
  - No vote order tracking
  - "Next" button to proceed to next round

#### REQ-PHASE-008: Round Progression
- **Priority**: High
- **Description**: Cycle through rounds with appropriate phases
- **Acceptance Criteria**:
  - Each round increments round number
  - Round sequence:
    - Strategy Phase
    - Action Phase
    - Status Phase
    - Agenda Phase (if Mecatol Rex claimed)
  - Unpicked strategy cards accumulate trade goods (+1 per round unpicked)
  - Continue until victory condition met

### Player Actions

#### REQ-ACTION-001: Strategy Card Actions Display
- **Priority**: Medium
- **Description**: Show primary and secondary actions when strategy card is played
- **Acceptance Criteria**:
  - Modal/popup displays when strategy card action is selected
  - Shows primary action text
  - Shows secondary action text (for all other players)
  - Provides quick reference without needing physical cards
  - Can dismiss modal after reviewing

#### REQ-ACTION-002: Action Undo/Revert
- **Priority**: High
- **Description**: Ability to undo any action taken
- **Acceptance Criteria**:
  - Undo button available for recent actions
  - Can undo: strategy card selection, player actions, phase progression
  - Clear indication of what will be undone
  - Confirmation for major undo operations (e.g., reverting entire phase)

#### REQ-ACTION-003: Player Self-Service Actions
- **Priority**: High
- **Description**: Players can take actions on their own devices when it's their turn
- **Acceptance Criteria**:
  - When it's a player's turn, they see available action buttons on their device
  - Player can select their own action
  - Action updates reflect in real-time for all players
  - Host can override or take actions on behalf of players
  - Clear visual indicator of whose turn it is

### Game State Tracking

#### REQ-STATE-001: Victory Points
- **Priority**: High
- **Description**: Track victory points for all players
- **Acceptance Criteria**:
  - Victory point bar at top of screen
  - Shows player order (speaker first, then clockwise)
  - Click to increment by 1
  - Wraps from max VP limit back to 0
  - Allow decrement functionality (improvement over Extra Computer)
  - Clear visual indicator of current VP for each player

#### REQ-STATE-002: Victory Condition and End Game
- **Priority**: High
- **Description**: Trigger end game when victory points reached
- **Acceptance Criteria**:
  - "End Game" button appears when any player reaches VP limit
  - End game screen shows:
    - Winner announcement: "Swear your allegiance to the new galactic emperor"
    - Scoreboard sorted by VP
    - Total turn timer per player
    - Number of times each player was speaker
    - Final influence count (or other relevant stat)
    - Total game duration
    - Total number of rounds
  - No navigation from end screen (would require page reload)

#### REQ-STATE-003: Strategy Card Action Tracking
- **Priority**: High
- **Description**: Track which players have used their strategy card
- **Acceptance Criteria**:
  - Visual indicator showing strategy card action status
  - Persists through the round
  - Resets at start of next Strategy Phase
  - Visible to all players

#### REQ-STATE-004: Pass Status Tracking
- **Priority**: High
- **Description**: Track which players have passed
- **Acceptance Criteria**:
  - Visual indicator showing pass status
  - Passed players removed from turn rotation
  - Cannot un-pass once passed
  - Resets at start of next round

#### REQ-STATE-005: Trade Good Bonuses
- **Priority**: Medium
- **Description**: Track and display trade good bonuses on unpicked strategy cards
- **Acceptance Criteria**:
  - Unpicked cards from previous round gain +1 trade good
  - Bonus accumulates across rounds
  - Displayed clearly on strategy card
  - Resets when card is picked
  - Picked player receives trade goods (visual confirmation)

### Multi-Device Support

#### REQ-MULTI-001: Real-time Synchronization
- **Priority**: High
- **Description**: All connected devices see updates in real-time
- **Acceptance Criteria**:
  - Uses Supabase Realtime for live updates
  - Updates propagate within 1 second
  - Handles network interruptions gracefully
  - Shows connection status indicator

#### REQ-MULTI-002: Device Role Selection
- **Priority**: High
- **Description**: Players select their role when joining
- **Acceptance Criteria**:
  - Can join as specific player
  - Can join as observer/spectator
  - Can join as host/admin
  - Role determines available actions
  - Can change role during game (with permission)

#### REQ-MULTI-003: Host Controls
- **Priority**: High
- **Description**: Host has administrative privileges
- **Acceptance Criteria**:
  - Can override any player action
  - Can modify game settings during play
  - Can kick players
  - Can pause/resume game
  - Can reset phases or undo actions
  - Multiple hosts possible (design decision)

#### REQ-MULTI-004: Responsive Views
- **Priority**: High
- **Description**: Optimized layouts for different devices
- **Acceptance Criteria**:
  - Desktop: Full dashboard view with all information
  - Tablet: Condensed view with navigation
  - Mobile: Single-column layout with essential actions
  - All views functionally complete
  - Smooth transitions between device orientations

### Additional Views

#### REQ-VIEW-001: Objectives View
- **Priority**: High
- **Description**: Display all public and secret objectives
- **Acceptance Criteria**:
  - Show all revealed public objectives (Stage I and Stage II)
  - Show individual player's secret objectives (only to that player)
  - Visual indication of who has scored each objective
  - Host can add/remove objectives
  - Players can mark objectives as completed (if permission enabled)
  - Clear distinction between Stage I and Stage II objectives

#### REQ-VIEW-002: Faction Sheets
- **Priority**: High
- **Description**: Quick access to faction reference sheets
- **Acceptance Criteria**:
  - Can view faction sheet for any player in the game
  - Shows faction abilities, starting units, commodities, etc.
  - Uses high-quality images or rendered data
  - Can zoom/expand for detail
  - Accessible from main game view

#### REQ-VIEW-003: Technology Tracking
- **Priority**: Medium
- **Description**: Track unlocked technologies per player
- **Acceptance Criteria**:
  - Display tech tree for each player
  - Players can mark technologies as unlocked
  - Visual indicator of prerequisites met/not met
  - Visible to all players (public information)
  - Color-coded by tech type (bio, warfare, propulsion, cybernetic)

#### REQ-VIEW-004: Game Log/History
- **Priority**: Low
- **Description**: Record of major game events
- **Acceptance Criteria**:
  - Log major actions (strategy card selections, objective scoring, etc.)
  - Timestamped entries
  - Can scroll through history
  - Export/save log capability
  - Useful for dispute resolution

---

## Non-Functional Requirements

### NFR-001: Performance
- **Priority**: High
- **Description**: Application must be responsive and fast
- **Acceptance Criteria**:
  - Page load time < 3 seconds
  - Action response time < 500ms
  - Realtime updates < 1 second latency
  - Smooth animations at 60fps
  - Minimal bundle size

### NFR-002: Reliability
- **Priority**: High
- **Description**: System must be stable and handle errors gracefully
- **Acceptance Criteria**:
  - 99%+ uptime
  - Graceful degradation if Supabase connection lost
  - Auto-reconnect on network restoration
  - Error messages are clear and actionable
  - No data loss during normal operations

### NFR-003: Usability
- **Priority**: High
- **Description**: Interface must be intuitive and accessible
- **Acceptance Criteria**:
  - New users can set up a game without instructions
  - All actions are reversible or have confirmation
  - Clear visual feedback for all interactions
  - Consistent design language throughout
  - Accessible via keyboard navigation
  - Meets WCAG 2.1 AA standards (aspirational)

### NFR-004: Scalability
- **Priority**: Medium
- **Description**: Support multiple concurrent games
- **Acceptance Criteria**:
  - Handle 100+ concurrent games
  - Support 8 players per game
  - Database queries optimized with indexes
  - Efficient Realtime subscription management

### NFR-005: Security
- **Priority**: High
- **Description**: Protect user data and prevent unauthorized access
- **Acceptance Criteria**:
  - Row-level security in Supabase
  - Players can only access games they're in
  - Prevent SQL injection and XSS
  - Secure authentication flow
  - HTTPS only in production

### NFR-006: Maintainability
- **Priority**: Medium
- **Description**: Codebase should be easy to maintain and extend
- **Acceptance Criteria**:
  - Clear component structure
  - Comprehensive comments for complex logic
  - TypeScript for type safety
  - Consistent code style (ESLint + Prettier)
  - Unit tests for critical logic
  - Component library for reusability

---

## Improvements Over Extra Computer

### IMP-001: Undo Functionality
- **Issue**: No way to undo actions in Extra Computer
- **Solution**: Comprehensive undo system for all actions

### IMP-002: Decrement Victory Points
- **Issue**: Can only increment VP, must wrap around to decrement
- **Solution**: Add decrement button or +/- controls

### IMP-003: Cancel Dialogs
- **Issue**: No cancel option in player setup dialog
- **Solution**: Add cancel/close button to all modals

### IMP-004: Strategy Card Information
- **Issue**: Players need to reference physical cards for action details
- **Solution**: Show primary/secondary actions in popup when card played

### IMP-005: Objective Tracking
- **Issue**: No objective tracking in Extra Computer
- **Solution**: Dedicated objectives view with scoring indicators

### IMP-006: Multi-Device Support
- **Issue**: Single person must manage all updates
- **Solution**: Players can update from their own devices

### IMP-007: Status Phase Checklist
- **Issue**: Easy to forget status phase steps
- **Solution**: Interactive checklist with strike-through option

### IMP-008: Faction Reference Access
- **Issue**: Must reference physical faction sheets
- **Solution**: Built-in faction sheet viewer

---

## Future Features

### FUT-001: Technology Tracking
- **Priority**: Medium
- **Phase**: 2
- **Description**: Visual tech tree with unlock tracking

### FUT-002: Detailed Player Stats
- **Priority**: Low
- **Phase**: 3
- **Description**: Track additional stats (actions taken, trade goods, etc.)

### FUT-003: Action Card Tracking
- **Priority**: Low
- **Phase**: 3
- **Description**: Optional tracking of action cards played

### FUT-004: Custom Factions/Variants
- **Priority**: Low
- **Phase**: 4
- **Description**: Support for homebrew factions

### FUT-005: Game Replay
- **Priority**: Low
- **Phase**: 4
- **Description**: Replay entire game from history log

### FUT-006: Mobile App
- **Priority**: Low
- **Phase**: 5
- **Description**: Native mobile app for better mobile experience

### FUT-007: Voice Commands
- **Priority**: Low
- **Phase**: 5
- **Description**: Voice-controlled actions for hands-free play

### FUT-008: AI Assistant
- **Priority**: Low
- **Phase**: 6
- **Description**: Rules clarification and strategy suggestions
