# Architecture Document

## Table of Contents
- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Data Flow](#data-flow)
- [Security Architecture](#security-architecture)
- [Deployment Architecture](#deployment-architecture)
- [Key Technical Decisions](#key-technical-decisions)

---

## System Overview

The Custodians Archive is a real-time multiplayer web application built on a client-server architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Devices                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Desktop    │  │    Tablet    │  │    Mobile    │  │
│  │  (Host View) │  │ (Player View)│  │ (Player View)│  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    HTTPS/WebSocket
                             │
          ┌──────────────────┴──────────────────┐
          │         Supabase Platform            │
          │  ┌────────────────────────────────┐  │
          │  │      PostgreSQL Database       │  │
          │  │  (Game State, Players, etc.)   │  │
          │  └────────────────────────────────┘  │
          │  ┌────────────────────────────────┐  │
          │  │      Realtime Engine           │  │
          │  │   (WebSocket Subscriptions)    │  │
          │  └────────────────────────────────┘  │
          │  ┌────────────────────────────────┐  │
          │  │      Authentication            │  │
          │  │  (Auth + Anonymous Sessions)   │  │
          │  └────────────────────────────────┘  │
          └─────────────────────────────────────┘
```

### Core Principles

1. **Real-time First**: All state changes propagate immediately to all connected clients
2. **Offline Resilience**: Graceful degradation when network unavailable
3. **Mobile Responsive**: Single codebase works across all device sizes
4. **Progressive Enhancement**: Core functionality works, enhanced features add polish
5. **Type Safety**: TypeScript throughout for reliability

---

## Technology Stack

### Frontend

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **React 18+** | UI Framework | Industry standard, excellent ecosystem, hooks for state management |
| **Vite** | Build Tool | Fast dev server, optimized production builds, modern ESM support |
| **TypeScript** | Type Safety | Catch errors at compile time, better IDE support, self-documenting code |
| **CSS Modules** or **Styled Components** | Styling | Decision needed - CSS Modules for simplicity, Styled Components for dynamic theming |
| **React Router** | Routing | Client-side routing for different views (game setup, game play, objectives, etc.) |
| **Zustand** or **Context API** | State Management | Decision needed - Zustand for simplicity, Context for React-native approach |
| **Supabase JS Client** | Backend Integration | Official client for Supabase with Realtime support |
| **React Hook Form** | Form Handling | Performant form validation for game setup |
| **Framer Motion** (optional) | Animations | Smooth transitions, enhances sci-fi aesthetic |

### Backend (Supabase)

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **PostgreSQL** | Database | Powerful relational DB with JSON support, perfect for game state |
| **Supabase Realtime** | Live Updates | Built-in WebSocket support for real-time game state sync |
| **Supabase Auth** | Authentication | Handles both authenticated users and anonymous sessions |
| **Row Level Security** | Authorization | Database-level security, players only access their games |
| **PostgREST** | Auto API | Auto-generated REST API from database schema |

### Development Tools

| Tool | Purpose |
|------|---------|
| **ESLint** | Code linting |
| **Prettier** | Code formatting |
| **Vitest** | Unit testing (Vite-native) |
| **React Testing Library** | Component testing |
| **Playwright** (optional) | E2E testing |

---

## Frontend Architecture

### Directory Structure

```
src/
├── assets/              # Static assets (SVG factions, symbols, etc.)
│   ├── factions/
│   ├── strategy-cards/
│   ├── galaxy-maps/
│   └── icons/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── game/           # Game-specific components
│   └── layout/         # Layout components (Header, Sidebar, etc.)
├── features/           # Feature-based modules
│   ├── auth/          # Authentication logic
│   ├── game-setup/    # Game creation and setup
│   ├── game-play/     # Core gameplay views
│   ├── objectives/    # Objectives tracking
│   ├── tech-tree/     # Technology tracking
│   └── factions/      # Faction sheets
├── hooks/              # Custom React hooks
│   ├── useGameState.ts
│   ├── useRealtimeSync.ts
│   └── usePlayerActions.ts
├── lib/                # Third-party integrations
│   ├── supabase.ts    # Supabase client setup
│   └── constants.ts   # Game constants (factions, cards, etc.)
├── store/              # Global state management
│   └── gameStore.ts   # Zustand store or Context providers
├── types/              # TypeScript type definitions
│   ├── game.types.ts
│   ├── player.types.ts
│   └── database.types.ts (auto-generated from Supabase)
├── utils/              # Utility functions
│   ├── gameLogic.ts   # Pure game logic functions
│   └── formatters.ts  # Display formatters
├── App.tsx
└── main.tsx
```

### Component Architecture

**Atomic Design Pattern**:
- **Atoms**: Basic UI elements (Button, Input, Icon)
- **Molecules**: Simple component groups (PlayerCard, StrategyCardButton)
- **Organisms**: Complex components (PlayerSetupModal, ActionPhasePanel)
- **Templates**: Page layouts (GameLayout, SetupLayout)
- **Pages**: Full views (GameSetupPage, GamePlayPage)

**Key Components**:

```typescript
// Example: GamePlayPage composition
<GamePlayPage>
  <GameHeader>
    <VictoryPointBar />
    <RoundPhaseIndicator />
  </GameHeader>

  <GameContent>
    {currentPhase === 'strategy' && <StrategyPhase />}
    {currentPhase === 'action' && <ActionPhase />}
    {currentPhase === 'status' && <StatusPhase />}
    {currentPhase === 'agenda' && <AgendaPhase />}
  </GameContent>

  <GameFooter>
    <SpeakerIndicator />
    <UndoButton />
    <SettingsButton />
  </GameFooter>
</GamePlayPage>
```

### State Management

**Decision: Zustand (Recommended)**

Rationale:
- Simpler than Redux, less boilerplate
- Better performance than Context API for frequent updates
- Easy integration with Supabase Realtime
- Supports computed values and middleware
- Small bundle size (~1KB)

**Store Structure**:

```typescript
interface GameStore {
  // Game metadata
  gameId: string | null;
  roomCode: string | null;

  // Game configuration
  config: GameConfig;

  // Game state
  currentRound: number;
  currentPhase: GamePhase;
  players: Player[];
  speakerId: string;
  strategyCards: StrategyCard[];
  objectives: Objective[];
  mecatolClaimed: boolean;

  // UI state
  currentView: ViewType;
  isLoading: boolean;

  // Actions
  setGameConfig: (config: GameConfig) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  selectStrategyCard: (playerId: string, cardId: string) => void;
  // ... more actions

  // Realtime sync
  syncFromDatabase: (updates: Partial<GameState>) => void;
}
```

### Routing

```typescript
// React Router structure
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/create" element={<CreateGamePage />} />
  <Route path="/join" element={<JoinGamePage />} />

  <Route path="/game/:roomCode" element={<GameLayout />}>
    <Route index element={<GamePlayView />} />
    <Route path="objectives" element={<ObjectivesView />} />
    <Route path="tech" element={<TechTreeView />} />
    <Route path="factions" element={<FactionsView />} />
    <Route path="settings" element={<SettingsView />} />
  </Route>
</Routes>
```

---

## Backend Architecture

### Database Schema (Overview)

See [DATA_MODELS.md](DATA_MODELS.md) for complete schema.

**Core Tables**:
- `games` - Game instances
- `players` - Player records tied to games
- `game_state` - Current game state (round, phase, etc.)
- `strategy_selections` - Strategy card picks per round
- `objectives` - Objective tracking
- `technology_unlocks` - Tech tree progression
- `game_events` - Event log

**Relationships**:
```
games 1:N players
games 1:1 game_state
games 1:N strategy_selections
games 1:N objectives
players 1:N technology_unlocks
games 1:N game_events
```

### Supabase Realtime

**Subscription Strategy**:

Each client subscribes to channels based on the game they're in:

```typescript
// Subscribe to game state changes
const gameChannel = supabase
  .channel(`game:${roomCode}`)
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'game_state',
      filter: `game_id=eq.${gameId}`
    },
    (payload) => {
      // Update local state
      gameStore.syncFromDatabase(payload.new);
    }
  )
  .subscribe();

// Subscribe to player changes
const playersChannel = supabase
  .channel(`players:${roomCode}`)
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'players',
      filter: `game_id=eq.${gameId}`
    },
    (payload) => {
      // Update player list
      gameStore.updatePlayer(payload.new.id, payload.new);
    }
  )
  .subscribe();
```

### Authentication Strategy

**Authenticated Users**:
- Sign up with email/password (or social auth if desired)
- User record in `auth.users`
- Can track game history across sessions
- Can have profiles, settings, etc.

**Anonymous Users**:
- Use Supabase anonymous sign-in
- Temporary session tied to browser
- Can play but data not persisted beyond session
- Prompted to create account to save data

**Implementation**:
```typescript
// Anonymous sign-in
const { data, error } = await supabase.auth.signInAnonymously();

// Regular sign-in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Check auth state
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    // User authenticated (could be anonymous or real)
    authStore.setSession(session);
  }
});
```

### Row Level Security (RLS)

**Security Policies**:

```sql
-- Players can only access games they're part of
CREATE POLICY "Players can view their own games"
  ON games FOR SELECT
  USING (
    id IN (
      SELECT game_id FROM players
      WHERE user_id = auth.uid()
    )
  );

-- Players can update game state if they're in the game
CREATE POLICY "Players can update game state"
  ON game_state FOR UPDATE
  USING (
    game_id IN (
      SELECT game_id FROM players
      WHERE user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

---

## Data Flow

### Game Setup Flow

```
User Creates Game
      ↓
Frontend → Supabase (Insert into 'games' table)
      ↓
Receive game_id and room_code
      ↓
Frontend updates local state
      ↓
User configures players
      ↓
Frontend → Supabase (Insert into 'players' table)
      ↓
Subscribe to game channel
      ↓
Start game
      ↓
Frontend → Supabase (Insert into 'game_state' table)
```

### Real-time Action Flow

```
Player Takes Action (e.g., selects strategy card)
      ↓
Frontend validates action locally (optimistic update)
      ↓
Frontend → Supabase (Update 'strategy_selections' table)
      ↓
Supabase broadcasts change via Realtime
      ↓
All connected clients receive update
      ↓
Frontend syncs local state with broadcast
      ↓
UI re-renders with new state
```

### Conflict Resolution

For concurrent actions:
1. **Optimistic Updates**: Apply locally immediately
2. **Server Truth**: Server state is source of truth
3. **Conflict Detection**: Detect conflicts via version/timestamp
4. **Resolution**: Last write wins (for most actions) or specific game rules

Example:
```typescript
// Optimistic update
gameStore.selectStrategyCard(playerId, cardId);

// Send to server
const { error } = await supabase
  .from('strategy_selections')
  .insert({ game_id, player_id, card_id, round });

if (error) {
  // Rollback optimistic update
  gameStore.revertLastAction();
  showError('Action failed, please try again');
}
```

---

## Security Architecture

### Authentication Security

- Use Supabase Auth with secure token management
- HTTP-only cookies for session storage (if possible)
- Refresh token rotation
- Anonymous sessions isolated per browser

### Authorization

- Row Level Security enforces data access
- Frontend validates permissions before showing UI
- Backend (RLS policies) is final authority
- No client can access data from games they're not in

### Input Validation

- Frontend: React Hook Form with validation schemas
- Backend: PostgreSQL constraints and triggers
- Sanitize all user inputs
- Validate game logic server-side for critical actions

### XSS Protection

- React's built-in XSS protection (escaping)
- Sanitize any user-generated content (player names, etc.)
- Content Security Policy headers

### HTTPS

- All production traffic over HTTPS
- Supabase provides SSL/TLS by default
- WebSocket connections over WSS

---

## Deployment Architecture

### Frontend Hosting

**Recommended: Vercel or Netlify**

- Zero-config deployment for Vite apps
- CDN distribution globally
- Automatic HTTPS
- Preview deployments for PRs
- Environment variable management

### Backend (Supabase)

**Supabase Cloud** (Free tier for development, paid for production)

- Managed PostgreSQL with automatic backups
- Built-in Realtime, Auth, Storage
- Global CDN for static assets
- Logging and monitoring

### CI/CD Pipeline

```
Git Push to main
      ↓
GitHub Actions
      ↓
Run Tests (lint, unit, e2e)
      ↓
Build Production Bundle
      ↓
Deploy to Vercel/Netlify
      ↓
Run Smoke Tests
      ↓
Notify Team
```

### Environment Management

**Environments**:
- **Local**: Development on localhost
- **Preview**: Per-PR deployments for testing
- **Production**: Live application

**Environment Variables**:
```
VITE_SUPABASE_URL=<supabase-project-url>
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
```

---

## Key Technical Decisions

### Decision Log

#### 1. State Management: Zustand vs Context API

**Decision**: Zustand

**Rationale**:
- Simpler API than Context API for complex state
- Better performance for frequent updates (game state changes constantly)
- Easier to integrate with Supabase Realtime
- Less boilerplate than Redux
- Small bundle size

**Trade-offs**:
- Slightly less React-idiomatic than Context
- Team needs to learn new library

---

#### 2. Styling: CSS Modules vs Styled Components vs Tailwind

**Decision**: TBD (Recommend CSS Modules + CSS Variables for theming)

**Options**:

**CSS Modules**:
- Pros: Simple, scoped styles, no runtime overhead, good for static design
- Cons: Less dynamic, requires separate theme management

**Styled Components**:
- Pros: Dynamic styling, theme provider built-in, component-scoped
- Cons: Runtime overhead, larger bundle

**Tailwind CSS**:
- Pros: Rapid development, utility-first, small production bundle
- Cons: Verbose JSX, less custom for unique sci-fi aesthetic

**Recommendation**: CSS Modules with CSS Variables
- Define design system variables (colors, spacing, etc.)
- Use modules for component-specific styles
- Best performance and control for custom aesthetic

---

#### 3. Real-time Library: Supabase Realtime vs Socket.io

**Decision**: Supabase Realtime

**Rationale**:
- Already using Supabase for database and auth
- Built-in integration with PostgreSQL changes
- No additional server infrastructure needed
- Automatic scaling
- Row-level security applies to Realtime

**Trade-offs**:
- Locked into Supabase ecosystem
- Less control over WebSocket behavior

---

#### 4. TypeScript Strictness

**Decision**: Strict mode enabled

**Rationale**:
- Catch errors early
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring

**Configuration**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

#### 5. Testing Strategy

**Decision**: Unit tests for logic, E2E for critical flows

**Rationale**:
- Vitest for fast unit tests (game logic, utilities)
- React Testing Library for component tests
- Playwright for E2E (optional, for critical paths like game setup and phase transitions)
- Focus on testing game logic correctness, not UI details

**What to Test**:
- Game logic functions (pure functions)
- Critical user flows (setup game, select strategy cards)
- State management (Zustand store actions)
- NOT: Styling, animations, trivial components

---

#### 6. Mobile Strategy: Responsive Web vs Native App

**Decision**: Responsive web first, native app later (Phase 5+)

**Rationale**:
- Single codebase, faster development
- Works across all devices immediately
- No app store approval needed
- Can always wrap in Capacitor/React Native later
- Most users comfortable with web on mobile

---

## Performance Optimization Strategy

### Frontend Optimizations

1. **Code Splitting**: Lazy load routes and heavy components
2. **Image Optimization**: Use SVG for icons, WebP for raster images
3. **Memoization**: React.memo for expensive components
4. **Virtualization**: Virtual scrolling for long lists (objectives, tech tree)
5. **Bundle Analysis**: Regular bundle size audits

### Database Optimizations

1. **Indexes**: Index frequently queried columns (game_id, player_id, etc.)
2. **Denormalization**: Store computed values where appropriate (e.g., current phase in game_state)
3. **Connection Pooling**: Supabase handles this automatically
4. **Query Optimization**: Use Supabase's query profiler

### Network Optimizations

1. **Realtime Batching**: Batch rapid updates to prevent flooding
2. **Optimistic Updates**: Show changes immediately, sync in background
3. **Compression**: Enable gzip/brotli compression
4. **CDN**: Use CDN for static assets

---

## Monitoring and Observability

### Metrics to Track

1. **Performance**:
   - Page load time
   - Time to interactive
   - Realtime latency
   - API response time

2. **Errors**:
   - JavaScript errors (Sentry or similar)
   - Failed API calls
   - WebSocket disconnections

3. **Usage**:
   - Active games
   - Concurrent players
   - Feature usage (which views are popular)

### Tools

- **Supabase Dashboard**: Database queries, Realtime connections
- **Vercel Analytics**: Web vitals, page views
- **Sentry** (optional): Error tracking and performance monitoring
- **Custom Logging**: Game events for analysis

---

## Future Architectural Considerations

### Scalability

If the app grows significantly:
- Consider dedicated game servers for complex game logic
- Implement caching layer (Redis) for frequently accessed data
- Horizontal scaling of Supabase with read replicas
- Consider GraphQL for more flexible data fetching

### Offline Support

Future enhancement:
- Service workers for offline functionality
- Local state persistence (IndexedDB)
- Sync queue for offline actions
- Conflict resolution UI

### Plugin System

For custom factions/variants:
- Design plugin API for extending game logic
- Allow community-created content
- Sandboxed execution for security
