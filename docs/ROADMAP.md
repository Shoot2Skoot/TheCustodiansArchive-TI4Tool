# Feature Roadmap

## Table of Contents
- [Development Phases Overview](#development-phases-overview)
- [Phase 0: Foundation](#phase-0-foundation)
- [Phase 1: MVP - Core Game Flow](#phase-1-mvp---core-game-flow)
- [Phase 2: Multiplayer & Real-time](#phase-2-multiplayer--real-time)
- [Phase 3: Enhanced Features](#phase-3-enhanced-features)
- [Phase 4: Advanced Tracking](#phase-4-advanced-tracking)
- [Phase 5: Polish & Optimization](#phase-5-polish--optimization)
- [Future Considerations](#future-considerations)

---

## Development Phases Overview

The project is divided into phases to ensure incremental delivery of value while maintaining quality.

```
Phase 0: Foundation (2-3 weeks)
    ↓
Phase 1: MVP - Core Game Flow (4-6 weeks)
    ↓
Phase 2: Multiplayer & Real-time (3-4 weeks)
    ↓
Phase 3: Enhanced Features (3-4 weeks)
    ↓
Phase 4: Advanced Tracking (2-3 weeks)
    ↓
Phase 5: Polish & Optimization (2-3 weeks)
    ↓
Ongoing: Maintenance & New Features
```

**Total Estimated Timeline**: 16-23 weeks (4-6 months)

---

## Phase 0: Foundation

**Goal**: Set up project infrastructure and development environment

**Duration**: 2-3 weeks

### Tasks

#### 0.1 Project Setup
- [x] Initialize Git repository
- [x] Set up Vite + React + TypeScript project
- [x] Configure ESLint and Prettier
- [x] Set up folder structure per architecture doc
- [x] Install core dependencies (React Router, etc.)

#### 0.2 Supabase Setup
- [x] Create Supabase project
- [x] Set up authentication (email/password + anonymous)
- [x] Create database schema (all tables from DATA_MODELS.md)
- [x] Configure Row Level Security policies
- [x] Set up Realtime subscriptions
- [x] Test database connections

#### 0.3 Design System Implementation
- [x] Create CSS variables / theme file
- [x] Build component library foundation:
  - [x] Button variants
  - [x] Input / Form elements
  - [x] Panel / Card components
  - [x] Modal / Dialog
  - [x] Toast notifications
- [x] Set up typography
- [x] Implement responsive utilities

#### 0.4 State Management
- [x] Set up Zustand store
- [x] Define core state interfaces
- [x] Create Supabase client wrapper
- [x] Implement basic state sync logic

#### 0.5 Asset Preparation
- [ ] Gather faction icons/images
- [ ] Gather strategy card images
- [ ] Gather galaxy map images (3-8 players)
- [ ] Optimize and organize all SVG assets

**Deliverable**: Fully configured development environment with design system and database ready

---

## Phase 1: MVP - Core Game Flow

**Goal**: Implement basic single-device game flow (Extra Computer parity)

**Duration**: 4-6 weeks

### 1.1 Game Setup Flow (Week 1-2)

#### Features
- [ ] Home page with "Create Game" button
- [ ] Player count selection (3-8)
- [ ] Galaxy map preview (changes based on player count)
- [ ] Player configuration modal:
  - [ ] Color selection (8 colors)
  - [ ] Faction selection (all base + PoK + Keleres)
  - [ ] Random faction button
  - [ ] Unique color/faction validation
- [ ] Game options configuration screen:
  - [ ] All settings from requirements
  - [ ] Save configuration
- [ ] Round 0 setup screen
- [ ] Speaker selection modal

#### Database Integration
- [ ] Create game record
- [ ] Insert players
- [ ] Initialize game_state
- [ ] Store configuration in games.config

#### UI Components
- [ ] GameSetupPage
- [ ] PlayerCountSelector
- [ ] GalaxyMapPreview
- [ ] PlayerConfigModal
- [ ] GameOptionsForm
- [ ] SpeakerSelectionModal

**Milestone 1.1**: Can set up a complete game configuration

---

### 1.2 Strategy Phase (Week 2-3)

#### Features
- [ ] Display strategy cards (1-8)
- [ ] Show trade good bonuses on unpicked cards
- [ ] Player order based on speaker + table order
- [ ] Click to select strategy card
- [ ] Validate selections (each card once, each player once)
- [ ] Calculate and display trade good bonuses
- [ ] Summary view after all selections
- [ ] Buttons: Reset Phase, End Phase

#### Database Integration
- [ ] Insert strategy_selections records
- [ ] Update strategy card availability
- [ ] Track trade good bonuses

#### UI Components
- [ ] StrategyPhase component
- [ ] StrategyCard component
- [ ] StrategySelectionSummary

**Milestone 1.2**: Can complete strategy phase

---

### 1.3 Action Phase (Week 3-4)

#### Features
- [ ] Display current player based on strategy card order
- [ ] Show player's strategy card
- [ ] Action buttons:
  - [ ] Tactical/Component Action (shows "Resolving..." message)
  - [ ] Strategy Card Primary Action
  - [ ] Pass (disabled until strategy card used)
- [ ] Strategy card action modal (shows primary/secondary actions)
- [ ] Politics card special logic (select new speaker)
- [ ] Track action state per player:
  - [ ] Strategy card used
  - [ ] Has passed
- [ ] Remove passed players from rotation
- [ ] Auto-advance when all players passed

#### Database Integration
- [ ] Update player_action_state
- [ ] Update strategy_selections (primary_action_used)
- [ ] Update game_state (speaker change for Politics)
- [ ] Log events to game_events

#### UI Components
- [ ] ActionPhase component
- [ ] CurrentPlayerDisplay
- [ ] ActionButtons
- [ ] StrategyCardActionModal
- [ ] PoliticsCardModal (speaker selection)

**Milestone 1.3**: Can complete action phase with all actions

---

### 1.4 Status Phase (Week 4)

#### Features
- [ ] Display status phase steps (7 steps)
- [ ] Optional interactive checklist (click to strike-through)
- [ ] Initiative order display
- [ ] Next Phase button

#### Database Integration
- [ ] Optional: Store status phase progress
- [ ] Update game_state phase

#### UI Components
- [ ] StatusPhase component
- [ ] StatusStepsList
- [ ] InitiativeOrderList

**Milestone 1.4**: Can complete status phase

---

### 1.5 Mecatol Rex & Agenda Phase (Week 5)

#### Features
- [ ] Mecatol Rex status screen (after first Status Phase)
- [ ] Hover/click to claim Mecatol Rex
- [ ] Persist Mecatol Rex claimed state
- [ ] Agenda Phase (if Mecatol claimed):
  - [ ] Display agenda resolution steps
  - [ ] Vote counter inputs for each player
  - [ ] Next Agenda / End Phase buttons

#### Database Integration
- [ ] Update game_state.mecatol_claimed
- [ ] Optional: Store agenda results

#### UI Components
- [ ] MecatolRexScreen
- [ ] AgendaPhase component
- [ ] VoteCounters

**Milestone 1.5**: Can claim Mecatol Rex and run agenda phase

---

### 1.6 Victory Point Tracking & End Game (Week 5-6)

#### Features
- [ ] Victory Point bar at top (if enabled)
- [ ] Display players in speaker order
- [ ] Click to increment VP
- [ ] Add decrement button
- [ ] Victory condition detection (player reaches VP limit)
- [ ] End Game button appears
- [ ] Victory screen:
  - [ ] Winner announcement
  - [ ] Final scoreboard (sorted by VP)
  - [ ] Game stats (duration, rounds, etc.)
  - [ ] New Game / Exit buttons

#### Database Integration
- [ ] Update players.victory_points
- [ ] Update games.status to 'completed'
- [ ] Set games.ended_at
- [ ] Calculate final stats

#### UI Components
- [ ] VictoryPointBar
- [ ] VictoryScreen
- [ ] FinalScoreboard

**Milestone 1.6**: Can complete full game and see victory screen

---

### 1.7 Phase Transitions & Round Loop (Week 6)

#### Features
- [ ] Automatic phase progression logic
- [ ] Round increment on loop
- [ ] Phase indicator UI (shows current round/phase)
- [ ] Smooth transitions between phases

#### Database Integration
- [ ] Update game_state for each phase transition
- [ ] Reset strategy cards each round
- [ ] Clean up per-round state

#### UI Components
- [ ] PhaseIndicator
- [ ] GamePlayLayout (orchestrates phases)

**Milestone 1.7**: Complete game loop from setup to victory

**Phase 1 Complete**: MVP with full single-device game flow matching Extra Computer functionality

---

## Phase 2: Multiplayer & Real-time

**Goal**: Enable multiple players to join and interact from different devices

**Duration**: 3-4 weeks

### 2.1 Room System (Week 7)

#### Features
- [ ] Generate unique room codes (e.g., "ALPHA7")
- [ ] Join game page with room code input
- [ ] Display active games for a user
- [ ] Join game as specific player or spectator

#### Database Integration
- [ ] Query games by room_code
- [ ] Update players.user_id when joining
- [ ] Track player join status

#### UI Components
- [ ] JoinGamePage
- [ ] RoomCodeInput
- [ ] PlayerSelectionModal (choose which player)
- [ ] ActiveGamesList

**Milestone 2.1**: Can join games via room code

---

### 2.2 Real-time Synchronization (Week 7-8)

#### Features
- [ ] Supabase Realtime subscriptions for:
  - [ ] game_state changes
  - [ ] players changes
  - [ ] strategy_selections changes
  - [ ] player_action_state changes
  - [ ] objectives changes (Phase 3)
- [ ] Optimistic updates with server reconciliation
- [ ] Conflict resolution (last write wins)
- [ ] Connection status indicator
- [ ] Auto-reconnect on network loss

#### State Management
- [ ] Integrate Realtime with Zustand store
- [ ] Sync local state with database updates
- [ ] Handle concurrent updates gracefully

#### UI Components
- [ ] ConnectionStatusIndicator
- [ ] SyncingOverlay (when syncing)

**Milestone 2.2**: Real-time sync working across devices

---

### 2.3 Player Actions from Own Devices (Week 8-9)

#### Features
- [ ] Role-based UI (host vs player vs spectator)
- [ ] Players can take actions on their turn:
  - [ ] Select strategy card (during strategy phase, when their turn)
  - [ ] Select action (during action phase, when their turn)
  - [ ] Update own VP
- [ ] Host can override any action
- [ ] Turn indicator shows whose turn it is
- [ ] Action permissions enforcement

#### Database Integration
- [ ] Check user_id matches player_id for actions
- [ ] Optional: Track who made each action

#### Security
- [ ] Validate permissions on server (RLS policies)
- [ ] Prevent unauthorized actions

**Milestone 2.3**: Players can control their own turns from separate devices

---

### 2.4 Host Controls & Settings (Week 9)

#### Features
- [ ] Host role identification (game creator)
- [ ] Host-only controls:
  - [ ] Modify game settings mid-game
  - [ ] Override player actions
  - [ ] Reset phases
  - [ ] End game
  - [ ] Kick players (optional)
- [ ] Settings modal accessible during game

#### UI Components
- [ ] HostControls component
- [ ] GameSettingsModal
- [ ] OverrideActionButtons

**Milestone 2.4**: Host has full control over game

**Phase 2 Complete**: Multiplayer functionality with real-time sync

---

## Phase 3: Enhanced Features

**Goal**: Add features that improve upon Extra Computer

**Duration**: 3-4 weeks

### 3.1 Undo System (Week 10)

#### Features
- [ ] Undo button always visible
- [ ] Undo last action (e.g., wrong strategy card selected)
- [ ] Phase rollback (reset entire phase)
- [ ] Confirmation for major undos
- [ ] Action history stack

#### Database Integration
- [ ] Use game_events table for history
- [ ] Mark events as undone
- [ ] Restore previous game_state snapshots

#### UI Components
- [ ] UndoButton
- [ ] UndoConfirmationModal
- [ ] ActionHistoryPanel (optional)

**Milestone 3.1**: Can undo actions and rollback phases

---

### 3.2 Objectives View (Week 10-11)

#### Features
- [ ] Objectives view page (navigation item)
- [ ] Display revealed public objectives (Stage I and Stage II)
- [ ] Display secret objectives (per player, only visible to them)
- [ ] Visual indicator of who scored each objective
- [ ] Host can add/remove objectives
- [ ] Players can mark objectives as scored (if setting enabled)

#### Database Integration
- [ ] Insert objectives as they're revealed
- [ ] Update objectives.scored_by_players array
- [ ] Query objectives per game

#### UI Components
- [ ] ObjectivesView
- [ ] ObjectiveCard
- [ ] AddObjectiveModal
- [ ] ObjectiveScoringIndicator

**Milestone 3.2**: Can track and view objectives

---

### 3.3 Faction Sheets Viewer (Week 11-12)

#### Features
- [ ] Faction sheets view (navigation item or modal)
- [ ] List of all factions in current game
- [ ] Click faction to view full sheet
- [ ] Display faction abilities, starting units, commodities, etc.
- [ ] Zoom/expand for detail

#### Assets
- [ ] Gather high-quality faction sheet images
- [ ] Or: Create structured data for factions and render dynamically

#### UI Components
- [ ] FactionSheetsView
- [ ] FactionList
- [ ] FactionSheetModal
- [ ] FactionSheetDisplay (image or structured)

**Milestone 3.3**: Can view faction sheets for all players

---

### 3.4 Timers & Activity Tracking (Week 12)

#### Features
- [ ] Inactivity timer (warns after X minutes of no activity)
- [ ] Per-turn timer or cumulative timer (based on settings)
- [ ] Display timer near current player
- [ ] Decision bar (optional progress timer)

#### Database Integration
- [ ] Update game_state.last_activity_at
- [ ] Track timer_tracking per player
- [ ] Calculate cumulative time

#### UI Components
- [ ] InactivityWarning
- [ ] PlayerTurnTimer
- [ ] DecisionBar

**Milestone 3.4**: Timers and activity tracking functional

**Phase 3 Complete**: Enhanced features that improve usability

---

## Phase 4: Advanced Tracking

**Goal**: Add optional advanced tracking features

**Duration**: 2-3 weeks

### 4.1 Technology Tracking (Week 13-14)

#### Features
- [ ] Tech tree view (navigation item)
- [ ] Display tech tree for each player
- [ ] Players can mark technologies as unlocked
- [ ] Visual indicator of prerequisites met/not met
- [ ] Color-coded by tech type (biotic, warfare, propulsion, cybernetic)
- [ ] Visible to all players

#### Database Integration
- [ ] Insert technology_unlocks
- [ ] Query by player
- [ ] Calculate prerequisites dynamically

#### Assets
- [ ] Tech icons or structured data

#### UI Components
- [ ] TechTreeView
- [ ] PlayerTechTreeList
- [ ] TechNode
- [ ] UnlockTechButton

**Milestone 4.1**: Can track technology unlocks

---

### 4.2 Game Event Log (Week 14)

#### Features
- [ ] Event log view (sidebar or modal)
- [ ] Display chronological log of major events:
  - [ ] Strategy card selections
  - [ ] Objective scoring
  - [ ] Speaker changes
  - [ ] Phase transitions
- [ ] Timestamped entries
- [ ] Optional export log

#### Database Integration
- [ ] Query game_events table
- [ ] Format event_data for display

#### UI Components
- [ ] GameEventLog
- [ ] EventLogEntry
- [ ] ExportLogButton

**Milestone 4.2**: Complete event log for review

---

### 4.3 Speaker History & Stats (Week 14-15)

#### Features
- [ ] Track speaker changes throughout game
- [ ] Display in victory screen (times each player was speaker)
- [ ] Optional stats view during game

#### Database Integration
- [ ] Query speaker_history
- [ ] Aggregate counts per player

#### UI Components
- [ ] SpeakerHistoryPanel
- [ ] StatsView (optional)

**Milestone 4.3**: Speaker history tracked and displayed

**Phase 4 Complete**: Advanced tracking features implemented

---

## Phase 5: Polish & Optimization

**Goal**: Refine UX, optimize performance, and add polish

**Duration**: 2-3 weeks

### 5.1 UX Improvements (Week 15-16)

#### Features
- [ ] Smooth animations for phase transitions
- [ ] Loading states for all async actions
- [ ] Error handling and user-friendly error messages
- [ ] Toast notifications for important events
- [ ] Confirmation dialogs for destructive actions
- [ ] Keyboard shortcuts for common actions
- [ ] Tutorial/onboarding (optional)

#### UI Polish
- [ ] Consistent spacing and alignment
- [ ] Responsive breakpoints tested
- [ ] Touch targets optimized for mobile
- [ ] Visual feedback for all interactions

**Milestone 5.1**: Polished user experience

---

### 5.2 Performance Optimization (Week 16)

#### Frontend
- [ ] Code splitting (lazy load routes)
- [ ] Memoize expensive components
- [ ] Optimize re-renders
- [ ] Virtual scrolling for long lists
- [ ] Image optimization
- [ ] Bundle size analysis and reduction

#### Backend
- [ ] Database query optimization
- [ ] Index performance review
- [ ] Realtime subscription efficiency
- [ ] Connection pooling

**Milestone 5.2**: App is fast and responsive

---

### 5.3 Testing & Bug Fixes (Week 16-17)

#### Testing
- [ ] Unit tests for game logic functions
- [ ] Component tests for critical UI
- [ ] E2E tests for core user flows
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Load testing (multiple concurrent games)

#### Bug Fixes
- [ ] Fix identified bugs
- [ ] Handle edge cases
- [ ] Improve error handling

**Milestone 5.3**: Stable, tested application

---

### 5.4 Accessibility & Documentation (Week 17)

#### Accessibility
- [ ] Keyboard navigation audit
- [ ] Screen reader testing
- [ ] Color contrast audit
- [ ] ARIA labels review
- [ ] Focus management improvements

#### Documentation
- [ ] User guide / help section
- [ ] In-app tooltips for complex features
- [ ] Developer documentation (if open source)

**Milestone 5.4**: Accessible and well-documented

---

### 5.5 Deployment & Launch Prep (Week 17)

#### Deployment
- [ ] Set up production Supabase project
- [ ] Configure environment variables
- [ ] Deploy to Vercel/Netlify
- [ ] Set up custom domain (optional)
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring (Sentry, analytics)

#### Launch
- [ ] Beta testing with friends/group
- [ ] Gather feedback
- [ ] Final bug fixes
- [ ] Launch! 🚀

**Milestone 5.5**: Application live in production

**Phase 5 Complete**: Polished, optimized, production-ready application

---

## Future Considerations

### Post-Launch Features

#### Enhanced Gameplay
- [ ] Action card tracking (optional, per player)
- [ ] Trade agreement tracking
- [ ] Agenda card effects automation (complex)
- [ ] Promissory note tracking
- [ ] Relic tracking

#### Social Features
- [ ] User profiles
- [ ] Game history per user
- [ ] Statistics dashboard (games played, win rate, etc.)
- [ ] Friend system
- [ ] In-game chat

#### Customization
- [ ] Custom factions (homebrew)
- [ ] Custom objectives
- [ ] House rules configuration
- [ ] Theme customization (light mode?)

#### Advanced Features
- [ ] Game replay (watch entire game from event log)
- [ ] AI assistant for rules clarification
- [ ] Integration with TTS (Tabletop Simulator)
- [ ] Mobile app (React Native or Capacitor)
- [ ] Offline mode with sync

#### Community
- [ ] Open source repository
- [ ] Community contributions (factions, themes, etc.)
- [ ] Plugin system for extensions

---

## Milestones Summary

| Phase | Milestone | Expected Completion |
|-------|-----------|---------------------|
| 0 | Foundation complete | Week 3 |
| 1.1 | Game setup working | Week 2 |
| 1.2 | Strategy phase working | Week 3 |
| 1.3 | Action phase working | Week 4 |
| 1.4 | Status phase working | Week 4 |
| 1.5 | Mecatol & Agenda working | Week 5 |
| 1.6 | Victory tracking & end game | Week 6 |
| 1.7 | **MVP Complete** | **Week 6** |
| 2.1 | Room system working | Week 7 |
| 2.2 | Real-time sync working | Week 8 |
| 2.3 | Player actions from devices | Week 9 |
| 2.4 | **Multiplayer Complete** | **Week 9** |
| 3.1 | Undo system working | Week 10 |
| 3.2 | Objectives view complete | Week 11 |
| 3.3 | Faction sheets viewer | Week 12 |
| 3.4 | **Enhanced Features Complete** | **Week 12** |
| 4.1 | Tech tracking working | Week 14 |
| 4.2 | Event log complete | Week 14 |
| 4.3 | **Advanced Tracking Complete** | **Week 15** |
| 5.1 | UX polish done | Week 16 |
| 5.2 | Performance optimized | Week 16 |
| 5.3 | Testing complete | Week 17 |
| 5.4 | Accessibility & docs done | Week 17 |
| 5.5 | **Production Launch** | **Week 17** |

---

## Risk Management

### Potential Risks

1. **Scope Creep**: Features expand beyond initial plan
   - **Mitigation**: Stick to phased approach, defer non-essential features

2. **Realtime Sync Complexity**: Concurrent updates cause conflicts
   - **Mitigation**: Implement robust conflict resolution, thorough testing

3. **Performance Issues**: App slow with 8 players and frequent updates
   - **Mitigation**: Optimize early, use database indexes, batch updates

4. **Asset Availability**: Faction images/icons not available or low quality
   - **Mitigation**: Use placeholders, create assets ourselves, or use community resources

5. **User Adoption**: Group doesn't use the app
   - **Mitigation**: Gather feedback early, iterate based on actual usage

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] Can complete full game from setup to victory
- [ ] All phases working as specified
- [ ] No critical bugs

### Phase 2 Success Criteria
- [ ] 4+ devices can join same game
- [ ] Real-time updates < 1 second latency
- [ ] No sync conflicts or data loss

### Phase 3 Success Criteria
- [ ] Undo system works reliably
- [ ] Objectives tracking is useful
- [ ] Users prefer this over Extra Computer

### Overall Success
- [ ] Group uses app for every TI4 game
- [ ] Positive feedback on UX
- [ ] Improves game experience (faster, less confusion)
- [ ] No game-breaking bugs after 5+ games

---

## Notes

- **Flexibility**: This roadmap is a guide, not a strict contract. Adjust based on feedback and learning.
- **Iterative Development**: Each phase builds on the previous, allowing for course correction.
- **User Feedback**: Gather feedback from the group after Phase 1 and Phase 2 to inform later phases.
- **Technical Debt**: Address technical debt during Phase 5, don't let it accumulate.

**Let's build something awesome!** 🚀
