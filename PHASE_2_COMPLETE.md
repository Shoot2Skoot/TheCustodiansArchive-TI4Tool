# Phase 2 Complete: Static Faction Data ✅

## Summary

Successfully created complete faction data infrastructure with all 25 factions from Base Game and Prophecy of Kings.

---

## Files Created

### Type Definitions
- **[src/data/factions/types.ts](src/data/factions/types.ts)** - Complete TypeScript interfaces for faction data
  - `FactionData` - Main faction interface
  - `FactionAbility`, `Leader`, `Flagship`, `Mech`, `Planet`, etc.
  - Helper functions: `isNomad()`, `getAllAgents()` - Handles Nomad's 3 agents

### Faction Data Files

#### Base Game (17 factions)
Located in `src/data/factions/base-game/`:
1. ✅ arborec.json
2. ✅ barony-of-letnev.json
3. ✅ clan-of-saar.json
4. ✅ embers-of-muaat.json
5. ✅ emirates-of-hacan.json
6. ✅ federation-of-sol.json
7. ✅ ghosts-of-creuss.json
8. ✅ l1z1x-mindnet.json
9. ✅ mentak-coalition.json
10. ✅ naalu-collective.json
11. ✅ nekro-virus.json
12. ✅ sardakk-norr.json
13. ✅ universities-of-jol-nar.json
14. ✅ winnu.json
15. ✅ xxcha-kingdom.json
16. ✅ yin-brotherhood.json
17. ✅ yssaril-tribes.json

#### Prophecy of Kings (8 factions)
Located in `src/data/factions/prophecy-of-kings/`:
1. ✅ argent-flight.json
2. ✅ council-keleres.json
3. ✅ empyrean.json
4. ✅ mahact-gene-sorcerers.json
5. ✅ naaz-rokha-alliance.json
6. ✅ nomad.json (special case: 3 agents)
7. ✅ titans-of-ul.json
8. ✅ vuilraith-cabal.json

### Index & Utilities
- **[src/data/factions/index.ts](src/data/factions/index.ts)** - Central export point with helper functions

---

## Data Included for Each Faction

Each faction JSON file contains:

### Core Information
- **ID** - Unique kebab-case identifier
- **Name** - Full faction name
- **Expansion** - "base" or "pok"

### Gameplay Components
- **Abilities** (1-3) - Faction abilities with name, description, type
- **Flagship** - Name, cost, combat, move, capacity, abilities
- **Mech** - Name, cost, combat, abilities (PoK only)
- **Starting Technologies** (0-2) - Name, type, color
- **Commodity Value** - Number (1-6)
- **Home System** - Planets with resources, influence, traits

### Leader Data
- **Agent** - Always unlocked, exhaustible ability
- **Commander** - Unlock condition + passive ability
- **Hero** - Unlock condition + one-time purge ability

### Promissory Notes
- **Base version** - Effect, return condition, display rules
- **Omega version** (when applicable) - Updated Codex version

---

## Codex Omega Components Included

### Codex I (Ordinian) - Promissory Notes
- ✅ Arborec - Stymie Ω
- ✅ Barony of Letnev - War Funding Ω
- ✅ L1Z1X Mindnet - Cybernetic Enhancements Ω
- ✅ Winnu - Acquiescence Ω
- ✅ Yin Brotherhood - Greyfire Mutagen Ω

### Codex III (Vigil) - Leaders
- ✅ Naalu Collective - Agent (Z'eu) Ω, Commander (M'aban) Ω
- ✅ Xxcha Kingdom - Hero (Xxekir Grom) Ω
- ✅ Yin Brotherhood - Agent (Brother Milor) Ω, Commander (Brother Omar) Ω, Hero (Dannel of the Tenth) Ω

---

## Special Cases Handled

### The Nomad (3 Agents)
- Unique structure: `agent.base`, `agent.agent2`, `agent.agent3`
- Helper function `getAllAgents()` extracts all 3 agents
- Agents: Artuno the Betrayer, Field Marshall Mercer, The Thundarian

### Argent Flight
- Special "choose 2 of 3" starting technologies noted

### Council Keleres
- Variable home system noted

### Empyrean
- Both Dark Pact and Blood Pact promissory notes included

---

## Utility Functions Available

### Faction Retrieval
```typescript
getFactionData(factionId: string): FactionData | undefined
getBaseGameFactions(): FactionData[]
getProphecyOfKingsFactions(): FactionData[]
getAvailableFactions(pokEnabled: boolean): FactionData[]
```

### Codex Version Selection
```typescript
getPromissoryNote(faction, codex1Enabled): PromissoryNote
getLeader(leaderData, codex3Enabled): Leader
getFactionLeaders(faction, codex3Enabled): { agent, commander, hero }
```

### Special Handling
```typescript
getAllAgents(faction): Leader[] // Handles Nomad's 3 agents
isNomad(factionId): boolean
```

### Omega Detection
```typescript
hasOmegaComponents(faction): { promissoryNote, agent, commander, hero }
getFactionsWithOmegaPromissoryNotes(): string[]
getFactionsWithOmegaLeaders(): string[]
```

---

## Data Sources

All faction data accurately transcribed from:
- `/docs/ti4-game-docs/Factions/Faction_Abilities.md`
- `/docs/ti4-game-docs/Factions/Faction_Flagships.md`
- `/docs/ti4-game-docs/Factions/Faction_Home_Systems.md`
- `/docs/ti4-game-docs/Factions/Faction_Leaders.md`
- `/docs/ti4-game-docs/Factions/Faction_Mechs/`
- `/docs/ti4-game-docs/Factions/Faction_Starting_Technologies.md`
- `/docs/ti4-game-docs/Factions/Factions_by_Commodity_Count.md`
- `/docs/ti4-game-docs/Factions/Promissory_Notes.md`
- `/docs/ti4-game-docs/Codex_Official_Expansions_Updates.md`

---

## Next Steps

Phase 2 is complete! Ready to proceed with:

**Phase 3**: Faction Comparison Page Structure
- Create main page component
- Add route configuration (`/game/:gameId/factions`)
- Set up basic layout structure
- Implement player filtering logic
- Implement category filtering logic

---

**Status**: ✅ Complete
**Last Updated**: 2025-11-23
