# Faction Comparison Feature - Roadmap

## Overview

**Goal**: Create a mobile-friendly faction comparison tool that allows players to quickly view and filter faction-specific information for all players at the table, replacing the need to physically check everyone's cards.

**Key Requirements**:
- Must be **significantly faster** than checking physical cards
- **Mobile-first** design with compact, efficient layout
- Use existing app styling (chamfered edges, dark theme, TI4 aesthetic)
- Handle **Codex versioning** (Omega components)
- Support **searching across all components** on the table (future phase)
- Real-time updates when leaders unlock or game state changes

**Scope**: Base Game + Prophecy of Kings factions (Thunder's Edge deferred)

---

## Page Location

- **Route**: `/game/:gameId/factions`
- **Status**: Separate isolated page (not integrated into main GamePage yet)
- **Navigation**: To be added later once feature is stable
- Eventually will integrate into:
  - Desktop: Header navigation
  - Mobile: Navigation menu
  - Future mobile app: Dedicated tab/page

---

## Filterable Categories

Each category can be toggled on/off to show/hide information:

1. **Faction Abilities** (1-3 per faction)
   - Passive abilities
   - Active abilities (ACTION:)

2. **Flagship** (1 per faction)
   - Name, cost, combat stats, special abilities

3. **Mech Unit** (1 per faction, Prophecy of Kings)
   - Name, cost, combat stats, special ability

4. **Starting Technologies** (0-2 per faction)
   - Technology name, type, prerequisites

5. **Commodity Value** (1-6, printed on faction sheet)

6. **Home System** (1-3 planets per faction)
   - Planet names, resources, influence values

7. **Promissory Note** (1-2 per faction)
   - Card name, effect, return condition
   - Note: Some are face-up when received (Support for the Throne, Alliance)

8. **Leaders** (3 types, unlocked at different times):
   - **Agent**: Unlocked at game start, exhaustible abilities
   - **Commander**: Faction-specific unlock, passive abilities
   - **Hero**: Unlocked after 3 objectives scored, one-time purge ability
   - Show unlock status (locked/unlocked)
   - For locked leaders: Show unlock requirements

### Default Filter State

By default, show:
- ✅ Faction Abilities
- ✅ Starting Technologies
- ✅ Commodity Value
- ✅ Unlocked Leaders
- ✅ Promissory Note

Hidden by default (user can enable):
- ❌ Flagship
- ❌ Mech
- ❌ Home System

### Default Player Filter

- Show **current player only** by default
- User can switch to "All Players" or select specific players

---

## Deferred Features (Low Priority)

These will be added in future phases:

### Special Faction Mechanics
- **Captured Units** (Vuil'Raith Cabal only)
  - Unit type and count of enemy units captured via DEVOUR ability
- **Captured Tokens** (Mahact Gene Sorcerers only)
  - Which players' command tokens they have (EDICT ability)
  - Shows which commanders they have access to via IMPERIA ability

### Thunder's Edge Content
- **Breakthrough** (unlockable faction-specific ability + tech synergy)
- Not needed for current playgroup

### Search Functionality
- Global text search across ALL faction components
- Search by: faction name, ability name/description, unit names, tech names, leader names, planet names, keywords
- Can be added after core feature is stable

---

## Codex Versioning System

**Critical**: Players choose during game setup which codexes to include. We must display the correct component versions.

### Codex Volumes

- **Codex I** (Ordinian) - 5 promissory notes, 3 faction techs, 2 basic techs updated (Ω)
  - Affected factions: Arborec, Letnev, L1Z1X, Winnu, Yin (promissory notes)
  - Faction techs: Muaat (Magmus Reactor), Creuss (Wormhole Generator), Yin (Yin Spinner)

- **Codex II** (Affinity) - Reference cards only (no component changes to track)

- **Codex III** (Vigil) - Leader and mech updates, new faction
  - Naalu: Agent (Z'eu), Commander (M'aban), Mech (Iconoclast) - all Ω
  - Xxcha: Hero (Xxekir Grom) - Ω
  - Yin: Agent (Brother Milor), Commander (Brother Omar), Hero (Dannel of the Tenth) - all Ω
  - New faction: Council Keleres (included in PoK data set)

- **Codex IV** (Liberation) - Relics and Galactic Events
  - 3 new relics, Galactic Events (not tracked in faction comparison)

- **Codex 4.5** - "Double Omega" (ΩΩ)
  - Magen Defense Grid - basic tech (not faction-specific)
  - X-89 Bacterial Weapon - basic tech (not faction-specific)

### Implementation

```typescript
interface CodexConfig {
  codex1: boolean;
  codex2: boolean;
  codex3: boolean;
  codex4: boolean;
  codex45: boolean;  // Double Omega updates
  prophecyOfKings: boolean; // Base PoK content
}
```

**Component Selection Logic**:
1. Check if Omega version exists for component
2. Check if appropriate codex is enabled in game config
3. Display Omega version if enabled, otherwise display base version
4. Omega symbol (Ω) in documentation marks updated components

---

## Data Structure

### Static Faction Data (JSON Files)

```typescript
interface FactionData {
  id: string;
  name: string;
  expansion: 'base' | 'pok';

  abilities: FactionAbility[];
  flagship: Flagship;
  mech: Mech | null; // null for base game factions if PoK not enabled
  startingTechnologies: Technology[];
  commodityValue: number;
  homeSystem: HomeSystem;

  // Promissory notes (base version and Omega versions)
  promissoryNote: {
    base: PromissoryNote;
    omega?: PromissoryNote; // Codex I update
  };

  // Leaders (base and Omega versions)
  leaders: {
    agent: {
      base: Leader;
      omega?: Leader; // Codex III updates
    };
    commander: {
      base: Leader;
      omega?: Leader;
    };
    hero: {
      base: Leader;
      omega?: Leader;
    };
  };
}

interface FactionAbility {
  name: string;
  description: string;
  type: 'passive' | 'action';
}

interface Leader {
  name: string;
  type: 'agent' | 'commander' | 'hero';
  ability: string;
  unlockCondition?: string; // For commander/hero
  heroAction?: string; // For heroes (purge action)
}

interface Flagship {
  name: string;
  cost: number;
  combat: string; // e.g., "5 (x2)"
  move: number;
  capacity: number;
  abilities: string[];
}

interface Mech {
  name: string;
  cost: number;
  combat: string;
  abilities: string[];
}

interface HomeSystem {
  planets: Planet[];
}

interface Planet {
  name: string;
  resources: number;
  influence: number;
  traits?: ('cultural' | 'industrial' | 'hazardous')[];
}

interface PromissoryNote {
  name: string;
  effect: string;
  returnCondition: string;
  placeFaceUp: boolean; // true for Support for Throne, Alliance
}

interface Technology {
  name: string;
  type: 'biotic' | 'warfare' | 'propulsion' | 'cybernetic';
  color: string; // For display
}
```

### Runtime Data (Database)

```typescript
// Player-specific state (game runtime data)
interface PlayerFactionState {
  playerId: string;
  factionId: string;

  // Leader unlock status
  commanderUnlocked: boolean;
  heroUnlocked: boolean;
}
```

### Database Schema

#### Leader Unlocks Table

```sql
CREATE TABLE leader_unlocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  leader_type TEXT NOT NULL, -- 'commander' or 'hero'
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  unlocked_round INTEGER NOT NULL,

  UNIQUE(game_id, player_id, leader_type)
);

CREATE INDEX idx_leader_unlocks_game_player
  ON leader_unlocks(game_id, player_id);
```

#### Game Config Update

```typescript
// Update src/types/game.ts
export interface GameConfig {
  playerCount: number;
  victoryPointLimit: number;
  timerEnabled: boolean;
  timerMode: 'per-turn' | 'cumulative';
  timerDurationMinutes: number;
  showObjectives: boolean;
  showTechnologies: boolean;
  showStrategyCards: boolean;

  // NEW: Codex/Expansion Configuration
  expansions: {
    prophecyOfKings: boolean;
    codex1: boolean;
    codex2: boolean;
    codex3: boolean;
    codex4: boolean;
    codex45: boolean;
  };
}
```

---

## UI/UX Design - Mobile-First

### Design Principles

1. **Compact layout** - Minimal padding while maintaining readability
2. **Scrollable cards** - Use pattern similar to ObjectivesPanel
3. **Chamfered edges** - Match existing TI4 aesthetic
4. **Dark theme** - Use existing CSS variables
5. **Touch-friendly** - Large enough tap targets (minimum 44x44px)

### Layout Structure

```
┌─────────────────────────────────────┐
│  Faction Comparison                 │
│  ┌─────────────────────────────┐   │
│  │ Filter Controls             │   │
│  │ [Current Player ▼]          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Category Toggles            │   │
│  │ ☑ Abilities  ☐ Flagship     │   │
│  │ ☐ Mechs      ☑ Leaders      │   │
│  │ ☑ Tech       ☑ Commodities  │   │
│  │ ☐ Home       ☑ Promissory   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ ◄  Faction Cards Scroller  ► │ │
│  │                               │ │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  │ │
│  │  │     │  │     │  │     │  │ │
│  │  │Letnev│ │ Sol │  │Hacan│  │ │
│  │  │     │  │     │  │     │  │ │
│  │  └─────┘  └─────┘  └─────┘  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Faction Card Design (Per Player)

```
┌─────────────────────────┐
│ 🎨 [Faction Icon]       │
│ Barony of Letnev        │
│ Player: Red (Alice)     │
├─────────────────────────┤
│ 📋 Abilities (2)        │
│ • MUNITIONS RESERVES    │
│   "At start of combat..." │
│ • ARMADA                │
│   "Fleet limit +2..."   │
├─────────────────────────┤
│ 🚀 Flagship             │
│ Arc Secundus (8💰)      │
│ "Removes PLANETARY..."  │
├─────────────────────────┤
│ 🤖 Mech: Dunlain Reaper │
│ 🔬 Tech: Antimass (x2)  │
│ 💎 Commodities: 2       │
├─────────────────────────┤
│ 👥 Leaders              │
│ ✓ Agent: Unlenn         │
│ ✓ Commander: Farran     │
│   (unlocked)            │
│ ✗ Hero: Darktalon       │
│   Unlock: Score 3 obj   │
└─────────────────────────┘
```

### Spacing Guidelines (Compact)

```css
/* Card padding */
.factionCard {
  padding: var(--space-3); /* 0.75rem = 12px */
}

/* Section spacing */
.section {
  margin-bottom: var(--space-2); /* 0.5rem = 8px */
}

/* Between items */
.item + .item {
  margin-top: var(--space-1); /* 0.25rem = 4px */
}
```

### Chamfered Corners

```css
.factionCard {
  clip-path: polygon(
    16px 0, 100% 0, 100% calc(100% - 16px),
    calc(100% - 16px) 100%, 0 100%, 0 16px
  );
}

.button {
  clip-path: polygon(
    8px 0, 100% 0, 100% calc(100% - 8px),
    calc(100% - 8px) 100%, 0 100%, 0 8px
  );
}
```

### Color Usage

- Background: `--color-bg-elevated`
- Border: `--color-border-primary`
- Hover border: `--color-border-accent`
- Active/unlocked: `--color-accent-primary`
- Text primary: `--color-text-primary`
- Text secondary: `--color-text-secondary`

### Responsive Breakpoints

```css
/* Mobile-first (default) */
.factionCard {
  width: 280px;
  padding: var(--space-3);
}

/* Small mobile */
@media (max-width: 480px) {
  .factionCard {
    width: 240px;
    padding: var(--space-2);
    font-size: var(--font-size-sm);
  }
}

/* Tablet and up */
@media (min-width: 768px) {
  .factionCard {
    width: 320px;
  }
}
```

---

## File Structure

```
src/
├── data/
│   └── factions/
│       ├── base-game/
│       │   ├── arborec.json
│       │   ├── barony-of-letnev.json
│       │   ├── clan-of-saar.json
│       │   ├── embers-of-muaat.json
│       │   ├── emirates-of-hacan.json
│       │   ├── federation-of-sol.json
│       │   ├── ghosts-of-creuss.json
│       │   ├── l1z1x-mindnet.json
│       │   ├── mentak-coalition.json
│       │   ├── naalu-collective.json
│       │   ├── nekro-virus.json
│       │   ├── sardakk-norr.json
│       │   ├── universities-of-jol-nar.json
│       │   ├── winnu.json
│       │   ├── xxcha-kingdom.json
│       │   └── yin-brotherhood.json
│       ├── prophecy-of-kings/
│       │   ├── argent-flight.json
│       │   ├── council-keleres.json
│       │   ├── empyrean.json
│       │   ├── mahact-gene-sorcerers.json
│       │   ├── naaz-rokha-alliance.json
│       │   ├── nomad.json
│       │   ├── titans-of-ul.json
│       │   └── vuilraith-cabal.json
│       ├── types.ts
│       └── index.ts
├── features/
│   └── faction-comparison/
│       ├── FactionComparisonPage.tsx
│       ├── FactionComparisonPage.module.css
│       ├── components/
│       │   ├── FactionCard.tsx
│       │   ├── FactionCard.module.css
│       │   ├── FilterPanel.tsx
│       │   ├── FilterPanel.module.css
│       │   ├── FactionCarousel.tsx
│       │   ├── FactionCarousel.module.css
│       │   ├── CategoryToggles.tsx
│       │   ├── CategoryToggles.module.css
│       │   └── sections/
│       │       ├── AbilitiesSection.tsx
│       │       ├── AbilitiesSection.module.css
│       │       ├── FlagshipSection.tsx
│       │       ├── FlagshipSection.module.css
│       │       ├── MechSection.tsx
│       │       ├── MechSection.module.css
│       │       ├── LeadersSection.tsx
│       │       ├── LeadersSection.module.css
│       │       ├── StartingTechSection.tsx
│       │       ├── StartingTechSection.module.css
│       │       ├── HomeSystemSection.tsx
│       │       ├── HomeSystemSection.module.css
│       │       ├── PromissorySection.tsx
│       │       ├── PromissorySection.module.css
│       │       ├── CommoditiesSection.tsx
│       │       └── CommoditiesSection.module.css
│       └── hooks/
│           ├── useFactionData.ts
│           └── useLeaderUnlocks.ts
└── lib/
    └── db/
        └── leaders.ts
```

---

## Implementation Phases

### Phase 1: Database Schema & Game Setup ✅

**Goal**: Set up database tables and game configuration for codex/expansion selection

**Tasks**:
1. Create `leader_unlocks` table migration
2. Update `GameConfig` interface to include `expansions` field
3. Update game setup wizard to include codex/expansion checkboxes
4. Create database functions for leader unlocks (`getLeaderUnlocks`, `unlockLeader`)
5. Add real-time subscription for leader unlocks

**Files**:
- Database migration SQL
- `src/types/game.ts` - Update GameConfig interface
- `src/features/game-setup/GameOptionsForm.tsx` - Add expansion checkboxes
- `src/lib/db/leaders.ts` - Leader unlock database functions
- `src/lib/realtime/subscriptions.ts` - Leader unlock subscriptions

---

### Phase 2: Static Faction Data ✅

**Goal**: Create comprehensive faction data files for all Base Game and Prophecy of Kings factions

**Base Game Factions** (17 total):
1. The Arborec
2. The Barony of Letnev
3. The Clan of Saar
4. The Embers of Muaat
5. The Emirates of Hacan
6. The Federation of Sol
7. The Ghosts of Creuss
8. The L1Z1X Mindnet
9. The Mentak Coalition
10. The Naalu Collective
11. The Nekro Virus
12. Sardakk N'orr
13. The Universities of Jol-Nar
14. The Winnu
15. The Xxcha Kingdom
16. The Yin Brotherhood
17. The Yssaril Tribes

**Prophecy of Kings Factions** (8 total):
1. The Argent Flight
2. The Council Keleres (Codex III)
3. The Empyrean
4. The Mahact Gene-Sorcerers
5. The Naaz-Rokha Alliance
6. The Nomad (3 agents - special case)
7. The Titans of Ul
8. The Vuil'Raith Cabal

**Codex Omega Components to Include**:
- Promissory notes (Codex I): Arborec, Letnev, L1Z1X, Winnu, Yin
- Faction techs (Codex I): Muaat, Creuss, Yin
- Leaders (Codex III): Naalu (agent, commander, mech), Xxcha (hero), Yin (agent, commander, hero)

**Tasks**:
1. Create JSON structure for faction data
2. Populate all 25 faction data files with complete information from docs
3. Include base and omega versions where applicable
4. Create TypeScript types for faction data
5. Create index file to export all factions
6. Create utility functions to select correct version based on codex config

**Files**:
- `src/data/factions/types.ts` - TypeScript interfaces
- `src/data/factions/base-game/*.json` - 17 faction files
- `src/data/factions/prophecy-of-kings/*.json` - 8 faction files
- `src/data/factions/index.ts` - Export all factions + utility functions

---

### Phase 3: Faction Comparison Page Structure ✅

**Goal**: Create main page component with routing and basic layout

**Tasks**:
1. Create `FactionComparisonPage` component
2. Add route configuration (`/game/:gameId/factions`)
3. Set up basic layout structure
4. Implement player filtering logic
5. Implement category filtering logic
6. Create filter state management

**Components**:
- `FactionComparisonPage.tsx` - Main page container
- `FactionComparisonPage.module.css` - Page styles

**Features**:
- Player selection dropdown (default: current player)
- Category toggles (default: abilities, tech, commodities, leaders, promissory)
- State management for filters
- Hook into faction data loader
- Hook into leader unlocks

---

### Phase 4: Filter Panel & Category Toggles ✅

**Goal**: Build filter controls UI

**Tasks**:
1. Create `FilterPanel` component
2. Create `CategoryToggles` component
3. Implement player selection dropdown
4. Implement category checkboxes
5. Style with chamfered corners and dark theme
6. Save filter preferences to localStorage (optional)

**Components**:
- `FilterPanel.tsx` - Container for all filters
- `FilterPanel.module.css`
- `CategoryToggles.tsx` - Checkbox grid for categories
- `CategoryToggles.module.css`

---

### Phase 5: Faction Card & Carousel ✅

**Goal**: Build horizontal scroller for faction cards

**Tasks**:
1. Create `FactionCarousel` component (similar to ObjectivesPanel)
2. Create `FactionCard` component (card container)
3. Implement horizontal scrolling with left/right arrows
4. Add auto-scroll speed control (optional)
5. Conditional rendering based on active categories
6. Mobile-responsive card sizing

**Components**:
- `FactionCarousel.tsx` - Horizontal scroller container
- `FactionCarousel.module.css`
- `FactionCard.tsx` - Individual faction card
- `FactionCard.module.css`

---

### Phase 6: Section Components ✅

**Goal**: Build individual section components for each category

**Tasks**:
1. Create `AbilitiesSection` - Display faction abilities
2. Create `FlagshipSection` - Display flagship stats
3. Create `MechSection` - Display mech stats (PoK only)
4. Create `LeadersSection` - Display agents/commanders/heroes with unlock status
5. Create `StartingTechSection` - Display starting technologies
6. Create `HomeSystemSection` - Display home planets
7. Create `PromissorySection` - Display promissory note
8. Create `CommoditiesSection` - Display commodity value
9. Handle Omega version selection based on codex config

**Components**:
- `sections/AbilitiesSection.tsx` + CSS
- `sections/FlagshipSection.tsx` + CSS
- `sections/MechSection.tsx` + CSS
- `sections/LeadersSection.tsx` + CSS
- `sections/StartingTechSection.tsx` + CSS
- `sections/HomeSystemSection.tsx` + CSS
- `sections/PromissorySection.tsx` + CSS
- `sections/CommoditiesSection.tsx` + CSS

---

### Phase 7: Real-time Integration ✅

**Goal**: Connect to database and enable real-time updates

**Tasks**:
1. Create `useLeaderUnlocks` hook
2. Implement real-time subscription to leader_unlocks table
3. Update LeadersSection to show unlock status dynamically
4. Test unlocking commanders/heroes updates UI in real-time
5. Handle edge cases (agent always unlocked, hero unlocks after 3 objectives)

**Hooks**:
- `hooks/useLeaderUnlocks.ts` - Subscribe to leader unlocks

**Integration Points**:
- Leader unlock button in status phase (separate feature)
- Automatic hero unlock when player scores 3rd objective

---

### Phase 8: Codex Version Selection ✅

**Goal**: Implement logic to display correct component versions based on game's codex config

**Tasks**:
1. Create `useCodexVersion` hook (optional, or inline)
2. Implement version selection logic for:
   - Promissory notes (Codex I)
   - Faction technologies (Codex I)
   - Leaders (Codex III)
   - Mechs (Codex III)
3. Test with different codex configurations
4. Display Omega indicator (optional visual element)

**Files**:
- `hooks/useCodexVersion.ts` (optional)
- Update section components to select correct version

---

### Phase 9: Polish & Testing ✅

**Goal**: Refine UI, fix bugs, optimize performance

**Tasks**:
1. Mobile device testing on actual phones
2. Tablet testing
3. Performance optimization (memoization, lazy loading)
4. Accessibility improvements (keyboard nav, screen readers)
5. Animation polish
6. Edge case testing:
   - Nomad (3 agents)
   - Nekro (no tech research)
   - Different codex configurations
   - Empty/minimal data
7. Code review and cleanup

---

### Phase 10: Navigation Integration (Future)

**Goal**: Add navigation links to reach faction comparison page

**Tasks**:
1. Add link in GamePage header (desktop)
2. Add link in mobile navigation menu
3. Add icon/button design
4. Update router breadcrumbs (if applicable)

**Status**: Deferred until feature is stable

---

## Future Enhancements (Post-Launch)

### Search Functionality

**"Search the Table" Feature**:
- Global text search across ALL faction components for ALL players
- Search by: faction name, ability name/description, unit names, tech names, leader names, planet names, keywords
- Highlight matched text in results
- Filter results by category

**UI**:
```
┌─────────────────────────────────┐
│ 🔍 Search: "sustain damage"    │
└─────────────────────────────────┘
        ↓
Results:
┌─────────────────────────────────┐
│ Letnev - Flagship Arc Secundus │
│ "...SUSTAIN DAMAGE..."          │
├─────────────────────────────────┤
│ Sol - Mech: Saturn Engine       │
│ "...SUSTAIN DAMAGE..."          │
└─────────────────────────────────┘
```

**Implementation**:
- `SearchBar.tsx` - Search input component
- `SearchResults.tsx` - Results display
- `hooks/useFactionSearch.ts` - Search algorithm
- Debounce search input (300ms)
- Fuzzy matching support (optional)

---

### Special Faction Mechanics

#### Vuil'Raith Cabal - Captured Units

**Tracking**:
- Database table or JSON field to track captured units
- UI section showing unit type and count
- Real-time updates when units are captured

**UI Example**:
```tsx
<div className={styles.capturedUnits}>
  <h4>Captured Units (DEVOUR)</h4>
  {Array.from(player.capturedUnits.entries()).map(([unitType, count]) => (
    <div key={unitType}>
      {count}x {unitType}
    </div>
  ))}
</div>
```

#### Mahact Gene-Sorcerers - Captured Tokens

**Tracking**:
- Database table or JSON field to track captured command tokens
- UI showing which players' tokens they have
- Display which commanders they have access to (IMPERIA ability)

**UI Example**:
```tsx
<div className={styles.capturedTokens}>
  <h4>Captured Tokens (EDICT)</h4>
  <p>Access to commanders:</p>
  {player.capturedTokens.map(playerId => {
    const capturedPlayer = players.find(p => p.id === playerId);
    return (
      <div key={playerId}>
        • {capturedPlayer.factionId} Commander
      </div>
    );
  })}
</div>
```

---

### Thunder's Edge Expansion

**Breakthroughs**:
- Unlockable faction-specific cards
- Each has unique ability + tech synergy
- Crimson Rebellion starts with breakthrough unlocked

**Data Structure**:
```typescript
interface Breakthrough {
  name: string;
  ability: string;
  synergy: [TechnologyType, TechnologyType];
}
```

**UI**:
- New section in faction card
- Show unlock status
- Display synergy icons

---

### Advanced Filtering

**Additional Filters**:
- Filter by expansion (Base Game / PoK)
- Filter by commodity value range
- Filter by tech prerequisites
- Sort by various criteria (alphabetical, commodity value, etc.)

---

### Export/Share

**Features**:
- Export faction comparison as PDF
- Share link with specific filter settings
- Print-friendly view
- Screenshot functionality

---

## Known Edge Cases & Special Handling

### The Nomad (3 Agents)

**Issue**: The Nomad has 3 agents instead of 1 (5 leaders total)

**Solution**:
```json
{
  "leaders": {
    "agents": [ // Array instead of single object
      {
        "name": "Evelyn Delouis",
        "type": "agent",
        "ability": "..."
      },
      {
        "name": "Garv and Gunn",
        "type": "agent",
        "ability": "..."
      },
      {
        "name": "Riftwalker Meian",
        "type": "agent",
        "ability": "..."
      }
    ],
    "commander": { /* ... */ },
    "hero": { /* ... */ }
  }
}
```

Display all 3 agents in LeadersSection with note.

---

### The Nekro Virus (No Tech Research)

**Issue**: Cannot research technology (PROPAGATION ability)

**Solution**:
- Still show starting tech section (they have none)
- Note in UI about PROPAGATION ability
- No special handling needed for faction comparison

---

### Council Keleres (Multiple Sub-factions)

**Issue**: Has 3 sub-factions with different starting units/abilities

**Solution**:
- Treat as single faction in comparison
- Show all 3 sub-faction options in abilities section
- Or: Create 3 separate faction entries (keleres-xxcha, keleres-argent, keleres-mentak)

**Recommendation**: Single entry with all variants shown

---

### Omega Component Priority

**Logic**:
```typescript
function getComponent(component: { base: T, omega?: T }, codexEnabled: boolean): T {
  return (codexEnabled && component.omega) ? component.omega : component.base;
}
```

Always check for Omega version first if codex is enabled.

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Load faction data on-demand
   ```typescript
   const FactionComparisonPage = lazy(() =>
     import('./features/faction-comparison/FactionComparisonPage')
   );
   ```

2. **Memoization**: Cache filtered/transformed data
   ```typescript
   const filteredFactions = useMemo(() => {
     return applyFilters(factions, activeCategories, selectedPlayer);
   }, [factions, activeCategories, selectedPlayer]);
   ```

3. **Virtual Scrolling**: For long lists (search results)
   - Use `react-window` or `react-virtual`
   - Only render visible cards

4. **Debounce Search**: Wait 300ms after typing stops
   ```typescript
   const debouncedSearch = useDebouncedValue(searchQuery, 300);
   ```

5. **Code Splitting**: Split by phase
   - Core feature
   - Search functionality
   - Special mechanics
   - Thunder's Edge

---

## Accessibility Requirements

### Keyboard Navigation

- Tab through filter controls
- Tab through faction cards
- Arrow keys to navigate carousel
- Enter/Space to toggle filters
- Escape to close modals/panels

### Screen Reader Support

- Proper ARIA labels on all interactive elements
- ARIA live regions for dynamic updates
- Semantic HTML structure
- Alt text for faction icons

### Color Contrast

- Meet WCAG AA standards (already in design system)
- Don't rely on color alone for information
- Use icons + text for unlock status

### Touch Targets

- Minimum 44x44px for mobile
- Adequate spacing between interactive elements
- Clear focus indicators

---

## Testing Strategy

### Unit Tests

- Search algorithm
- Filter logic
- Codex version selection
- Data transformation utilities
- Component rendering

### Integration Tests

- Filter + category interaction
- Player selection
- Real-time leader unlock updates
- Codex config changes

### E2E Tests

- Full user flow:
  1. Navigate to faction comparison page
  2. Select player filter
  3. Toggle categories
  4. Scroll through cards
  5. View different factions
- Mobile device testing
- Tablet testing
- Performance benchmarks

### Manual Testing Checklist

- [ ] All 25 factions display correctly
- [ ] Omega components show when codex enabled
- [ ] Base components show when codex disabled
- [ ] Leader unlock status updates in real-time
- [ ] Filters work correctly
- [ ] Mobile responsive on actual devices
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Performance is acceptable (<2s load time)
- [ ] No console errors or warnings

---

## Success Criteria

### MVP (Minimum Viable Product)

- [ ] Page accessible at `/game/:gameId/factions`
- [ ] All 25 base game + PoK factions have complete data
- [ ] Display abilities, flagship, mech, tech, commodities, home, promissory, leaders
- [ ] Filter by player (current player default)
- [ ] Toggle categories (5 shown by default)
- [ ] Horizontal scroller works on mobile
- [ ] Leader unlock status updates in real-time
- [ ] Codex Omega components display when enabled
- [ ] Mobile-friendly compact design
- [ ] Faster than checking physical cards

### Future Goals

- [ ] Search functionality
- [ ] Captured units/tokens tracking
- [ ] Thunder's Edge breakthroughs
- [ ] Navigation from main game page
- [ ] Export/share functionality
- [ ] Advanced filtering options
- [ ] Performance optimizations
- [ ] Full accessibility compliance

---

## Timeline Estimate

**Phase 1** (Database): ~2 hours
**Phase 2** (Faction Data): ~8-12 hours (25 factions × 20-30 min each)
**Phase 3** (Page Structure): ~2 hours
**Phase 4** (Filter Panel): ~3 hours
**Phase 5** (Carousel): ~3 hours
**Phase 6** (Section Components): ~6 hours
**Phase 7** (Real-time): ~2 hours
**Phase 8** (Codex Logic): ~2 hours
**Phase 9** (Polish): ~4 hours

**Total MVP**: ~32-36 hours

---

## Technical Debt & Future Refactors

### Potential Issues

1. **Large JSON files**: May want to split faction data into smaller chunks
2. **Hardcoded strings**: Consider i18n support for multi-language
3. **Component complexity**: FactionCard may become large, consider further splitting
4. **Search performance**: May need indexing or caching for large queries
5. **Image assets**: Need faction icons, may want to lazy load images

### Future Refactors

1. Move faction data to database (if it becomes dynamic)
2. Create faction data editor/admin panel
3. Implement caching layer for faction data
4. Add analytics to track which categories are most viewed
5. Consider GraphQL for more efficient data loading

---

## Dependencies

### Required Packages (Already Installed)

- `react` - UI framework
- `react-router-dom` - Routing
- `zustand` - State management
- `@supabase/supabase-js` - Real-time database

### Optional Packages (For Future)

- `fuse.js` - Fuzzy search
- `react-window` - Virtual scrolling
- `jspdf` - PDF export
- `html2canvas` - Screenshot functionality

---

## Questions & Decisions Log

### Answered Questions

**Q**: Where should this feature live?
**A**: Separate page at `/game/:gameId/factions`, isolated for now

**Q**: Which expansions to support?
**A**: Base Game + Prophecy of Kings (defer Thunder's Edge)

**Q**: Track leader unlocks in database?
**A**: Yes, real-time tracking required

**Q**: Track captured units/tokens?
**A**: Defer to future phase (low priority)

**Q**: Track breakthrough unlocks?
**A**: Defer to future phase (Thunder's Edge not needed)

**Q**: Codex configuration?
**A**: Add to game setup wizard in settings page

**Q**: Default filter state?
**A**: Show abilities, tech, commodities, leaders, promissory; filter to current player

**Q**: Real-time updates?
**A**: Yes, should update automatically when leaders unlock

### Open Questions

None currently - ready to implement!

---

## Resources

### Documentation Sources

- `/docs/ti4-game-docs/Factions/` - All faction documentation
- `/docs/ti4-game-docs/Codex_Official_Expansions_Updates.md` - Codex changes
- `/docs/ti4-game-docs/Components/` - Component documentation
- `/docs/ti4-game-docs/Official_Rules.md` - Official rules

### Design References

- `ObjectivesPanel.tsx` - Horizontal scroller pattern
- `ObjectivesPanel.module.css` - Card carousel styling
- `index.css` - CSS variables and design tokens
- Existing component patterns - Chamfered edges, dark theme

### Data References

- All faction data from wiki documentation
- Omega component markers (Ω, ΩΩ symbols)
- Leader unlock conditions from faction sheets

---

## Notes

- This roadmap is a living document and will be updated as implementation progresses
- Priorities may shift based on playtesting feedback
- Performance optimizations will be guided by real-world usage data
- Accessibility is a requirement, not optional
- Mobile-first approach is critical for success

---

**Last Updated**: 2025-11-23
**Status**: Ready for implementation
**Current Phase**: Phase 1 - Database Schema
