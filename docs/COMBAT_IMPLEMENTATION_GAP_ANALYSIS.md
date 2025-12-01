# Combat System Implementation Gap Analysis

## Executive Summary

**Critical Finding:** The current implementation is fundamentally misaligned with requirements. What exists is essentially a **guided checklist** that still requires manual dice rolling and tracking, while the requirements specify a **fully automated combat system** with dice rolling, individual unit tracking, and interactive hit assignment.

---

## Phase-by-Phase Comparison

### ✅ PHASE 0: Activation & Combat Initialization

#### P0.1 — Select Attacking Faction
- **Status:** ✅ **IMPLEMENTED CORRECTLY**
- **Location:** `CombatModalV2.tsx` lines ~205-240
- **Notes:** Player selection working as expected

#### P0.2 — Select Defending Faction
- **Status:** ✅ **IMPLEMENTED CORRECTLY**
- **Location:** `CombatModalV2.tsx` lines ~242-277
- **Notes:** Player selection working as expected

#### P0.3 — Activation Step
- **Status:** ⚠️ **MISSING/INCOMPLETE**
- **Required:** Prompt for abilities/cards that trigger "after you activate a system"
  - Commander: So Ata (Yssaril)
  - Promissory Notes: E-Res Siphons, Nullification Field, Aetherpassage
  - Action Cards: Flank Speed, In the Silence of Space, Cloak, Rally, Counterstroke
- **Special Logic:** Nullification Field cancels activation entirely
- **Current Implementation:** Not found in codebase
- **Gap:** Complete step missing

#### P0.4 — Movement Step
- **Status:** ✅ **IMPLEMENTED CORRECTLY**
- **Location:** `CombatModalV2.tsx` lines ~279-296
- **Notes:** Simple confirmation button, as required

#### P0.5 — Unit Inventory Confirmation
- **Status:** ✅ **IMPLEMENTED CORRECTLY**
- **Location:** `CombatModalV2.tsx` lines ~378-1207
- **Implementation Details:**
  - ✅ Attacker unit selection with counters
  - ✅ Defender unit selection with counters
  - ✅ Third-party Space Cannon player selection
  - ✅ Capacity validation with faction-specific rules
  - ✅ Fleet pool allocation check
  - ✅ Styled capacity warnings and modals
- **Notes:** This is the most complete section of the implementation

#### P0.6 — Post-Movement Actions Window
- **Status:** ✅ **IMPLEMENTED CORRECTLY**
- **Location:** `CombatModalV2.tsx` lines ~1213-1246
- **Required:** Prompt for Experimental Battlestation, Rescue, Stymie
- **Notes:** Basic implementation present

---

### ❌ PHASE 1: Space Cannon Offense

#### P1.1 — Space Cannon Offense Cancellation Window
- **Status:** ✅ **IMPLEMENTED CORRECTLY**
- **Location:** `CombatModalV2.tsx` lines ~1456-1508
- **Required:** Prompt for DISABLE and SOLAR FLARE Ω cards
- **Notes:** Both cards implemented with correct skip logic

#### P1.2 — Space Cannon Rolls
- **Status:** ❌ **CRITICALLY WRONG - COMPLETE MISMATCH**
- **Location:** `CombatModalV2.tsx` lines ~1512-1579
- **Required:**
  ```
  FOR EACH UNIT WITH SPACE CANNON:
  1. Execute dice roll via randomizer
  2. Display result
  3. Show [Reroll / Scramble Frequency] button
  4. Show [Assign Hits] button
  5. Queue the hit result
  6. Move to next unit
  7. When all units rolled, show [Continue]
  ```
- **Current Implementation:**
  ```tsx
  <input
    type="number"
    min="0"
    defaultValue="0"
    onChange={(e) => {
      const hits = parseInt(e.target.value) || 0;
      setDefenderHits(hits);
  ```
- **Gap:**
  - ❌ No dice rolling system
  - ❌ No per-unit roll tracking
  - ❌ No randomizer
  - ❌ No reroll buttons
  - ❌ Just manual number entry

#### P1.3 — Hit Assignment
- **Status:** ❌ **NOT IMPLEMENTED**
- **Required:**
  - Display attacker's fleet (ships and fighters)
  - Display total hits queued
  - Attacker **clicks** units to assign hits
  - Ships with Sustain Damage can absorb hit (mark as damaged)
  - All hits must be assigned before proceeding
- **Current Implementation:** Missing entirely
- **Gap:** No UI for selecting which ships take hits

#### P1.4 — Combat Continuation Check
- **Status:** ⚠️ **PARTIALLY IMPLEMENTED**
- **Location:** `CombatModalV2.tsx` lines ~1581-1603
- **Required Logic:**
  - If only attacker has ships → Combat ends, attacker wins
  - If only defender has ships → Combat ends, defender wins
  - If both have ships → Proceed to Phase 2
- **Gap:** Logic exists but depends on incorrect data (manual counts vs tracked units)

---

### ❌ PHASE 2: Space Combat

#### P2.1 — Start of Combat Effects
- **Status:** ⚠️ **SIMPLIFIED**
- **Location:** `CombatModalV2.tsx` lines ~1752-1798
- **Required:** Mentak Ambush, Reveal Prototype (Muaat)
- **Notes:** Basic structure exists but may be incomplete

#### P2.2 — Anti-Fighter Barrage
- **Status:** ❌ **CRITICALLY WRONG - SAME DICE ROLLING ISSUE**
- **Location:** `CombatModalV2.tsx` lines ~1800-1890
- **Required:**
  - Optional for both players (Fire AFB / Pass buttons)
  - Execute dice rolls via randomizer for each AFB-capable unit
  - Display results with [Reroll / Scramble Frequency] per die
  - Assign hits to enemy fighters
- **Current Implementation:**
  ```tsx
  <input type="number" min="0" defaultValue="0"
    onChange={(e) => setDefenderAFBHits(...)} />
  ```
- **Gap:**
  - ❌ No actual dice rolling
  - ❌ No AFB unit counting/tracking
  - ❌ No per-die rerolls
  - ❌ Just manual input again

#### P2.3 — Announce Retreats
- **Status:** ⚠️ **PARTIALLY IMPLEMENTED**
- **Location:** `CombatModalV2.tsx` lines ~1892-1980
- **Required:**
  - Defender declares first
  - If defender retreats, attacker cannot retreat this round
  - Prompt for Intercept, Rout, Faint action cards
- **Gap:** Action card prompts may be missing

#### P2.4 — Combat Rolls
- **Status:** ❌ **CRITICALLY WRONG - FUNDAMENTAL MISMATCH**
- **Location:** `CombatModalV2.tsx` lines ~1982-2102
- **Required:**
  ```
  Display all ships simultaneously
  Attacker clicks [Roll All Dice] → rolls for ALL ships at once
  Defender clicks [Roll All Dice] → rolls for ALL ships at once
  Display [Reroll / Scramble Frequency] button next to EACH die
  Any single die may be rerolled independently
  Tally hits automatically
  [Continue] to proceed
  ```
- **Current Implementation:**
  ```tsx
  <input type="number" onChange={(e) => setAttackerCombatHits(...)} />
  <input type="number" onChange={(e) => setDefenderCombatHits(...)} />
  ```
- **Gap:**
  - ❌ **NO DICE ROLLING AT ALL**
  - ❌ No unit-by-unit roll tracking
  - ❌ No automatic hit calculation
  - ❌ No per-die rerolls
  - ❌ No visual dice display
  - ❌ User must manually roll physical dice and enter results

#### P2.5 — Hit Assignment & Damage Resolution
- **Status:** ❌ **NOT IMPLEMENTED**
- **Location:** `CombatModalV2.tsx` lines ~2104-2193
- **Required:**
  - Split view showing both sides' ships
  - Click to assign hits to specific ships
  - Sustain Damage handling (mark as damaged)
  - Direct Hit card prompt when Sustain is used
  - Shield Holding card prompt for hit cancellation
  - Emergency Repairs card prompt after assignment
- **Current Implementation:** Just state updates, no interactive UI
- **Gap:**
  - ❌ No click-to-assign UI
  - ❌ No sustain damage tracking
  - ❌ No Direct Hit prompt
  - ❌ No visual feedback for damaged ships

#### P2.6 — Combat Continuation Check
- **Status:** ⚠️ **LOGIC EXISTS BUT DEPENDS ON WRONG DATA**
- **Location:** `CombatModalV2.tsx` lines ~2195-2228
- **Required:**
  - If only one side has units → Combat ends
  - If retreat declared → Resolve retreat, combat ends
  - If both have units and no retreat → **LOOP BACK TO P2.3** for next round
- **Gap:** Loop logic exists but operates on incorrect aggregate counts instead of tracked units

---

### ❌ PHASE 3: Invasion — Bombardment

#### P3.1 — Bombardment Declaration
- **Status:** ⚠️ **BASIC IMPLEMENTATION**
- **Location:** `CombatModalV2.tsx` lines ~2262-2287
- **Notes:** Bombardment choice buttons exist

#### P3.2 — Bombardment Target Selection
- **Status:** ❌ **NOT IMPLEMENTED**
- **Required:**
  - Select which planet(s) to target
  - Select which Bombardment-capable units fire at each planet
  - Check for Planetary Shield
- **Gap:** No planet selection UI, no unit assignment to planets

#### P3.3 — Defender Bombardment Response
- **Status:** ⚠️ **PARTIALLY IMPLEMENTED**
- **Location:** `CombatModalV2.tsx` lines ~2289-2322
- **Required:** Bunker card prompt (–4 to all Bombardment rolls)
- **Gap:** Implementation unclear

#### P3.4 — Bombardment Rolls
- **Status:** ❌ **SAME DICE ROLLING ISSUE**
- **Location:** `CombatModalV2.tsx` lines ~2324-2403
- **Required:**
  - For each bombarding unit:
    - Execute dice roll via randomizer
    - Display result
    - [Reroll / Scramble Frequency] button
    - [Assign Hits] button
  - [Continue] when all rolls complete
- **Current Implementation:** Manual number input again
- **Gap:** No actual dice rolling system

#### P3.5 — Bombardment Hit Assignment
- **Status:** ❌ **NOT IMPLEMENTED**
- **Required:**
  - Display defender's ground forces on each planet
  - Display total hits per planet
  - Defender assigns hits to ground forces
  - Mechs with Sustain can absorb hits
- **Gap:** No interactive assignment UI

#### P3.6 — Invasion Continuation Check
- **Status:** ⚠️ **LOGIC MAY EXIST**
- **Location:** Unknown
- **Required:** Skip to P4.6 if no defender ground forces remain

#### P3.7 — Commit Ground Forces
- **Status:** ❌ **NOT IMPLEMENTED**
- **Required:**
  - Display attacker's available ground forces in space
  - Attacker selects which units to land on which planets
  - Confirm landing assignments
- **Gap:** No UI for assigning ground forces to specific planets

#### P3.8 — Defender Landing Response
- **Status:** ❌ **NOT IMPLEMENTED**
- **Required:** Parley and Pax action card prompts
- **Gap:** Missing entirely

#### P3.9 — Space Cannon Defense
- **Status:** ❌ **SAME DICE ROLLING ISSUE**
- **Required:** Same per-unit dice rolling as P1.2
- **Gap:** Same as all other combat rolls - no actual dice system

#### P3.10 — Ground Combat Trigger Check
- **Status:** ⚠️ **LOGIC MAY EXIST**
- **Required:** Check if attacker has ground forces remaining

---

### ❌ PHASE 4: Ground Combat

#### P4.1 — Start of Ground Combat Effects
- **Status:** ⚠️ **BASIC IMPLEMENTATION**
- **Location:** `CombatModalV2.tsx` lines ~2735-2780
- **Required:** Yin Indoctrination, Arborec Mech Deploy
- **Gap:** May be missing specific faction abilities

#### P4.2 — Ground Combat Rolls
- **Status:** ❌ **SAME DICE ROLLING ISSUE**
- **Location:** `CombatModalV2.tsx` lines ~2782-2902
- **Required:** Same as P2.4 - actual dice rolling with [Roll All Dice]
- **Gap:** No dice rolling system

#### P4.3 — Ground Combat Hit Assignment
- **Status:** ❌ **NOT IMPLEMENTED**
- **Location:** `CombatModalV2.tsx` lines ~2904-2983
- **Required:** Same interactive hit assignment as P2.5
- **Gap:** No click-to-assign UI

#### P4.4 — L1Z1X Harrow Check
- **Status:** ⚠️ **MAY BE IMPLEMENTED**
- **Location:** `CombatModalV2.tsx` lines ~2985-3035
- **Required:** L1Z1X can use Bombardment again after ground combat round
- **Gap:** Depends on broken Bombardment implementation

#### P4.5 — Ground Combat Continuation Check
- **Status:** ⚠️ **LOGIC EXISTS BUT WRONG DATA**
- **Location:** `CombatModalV2.tsx` lines ~3037-3061
- **Required:** Loop back to P4.1 if both sides have ground forces
- **Gap:** Loop logic exists but operates on wrong data

#### P4.6 — Establish Control
- **Status:** ⚠️ **BASIC IMPLEMENTATION**
- **Location:** `CombatModalV2.tsx` lines ~3063-3129
- **Required:**
  - Transfer planet control
  - Planet is exhausted
  - Infiltrate, L1Z1X Assimilate, Reparations prompts
- **Gap:** Some action card prompts may be missing

---

### ⚠️ POST-COMBAT

#### PC.1 — Faction-Specific Triggers
- **Status:** ⚠️ **PARTIALLY IMPLEMENTED**
- **Location:** `CombatModalV2.tsx` lines ~3131-3177
- **Required:** Vuil'raith capture, Mentak Salvage
- **Gap:** May be incomplete

#### PC.2 — Capacity Check
- **Status:** ✅ **IMPLEMENTED**
- **Location:** `CombatModalV2.tsx` lines ~3179-3211
- **Notes:** Post-combat capacity validation exists

#### PC.3 — Combat Complete
- **Status:** ✅ **IMPLEMENTED**
- **Location:** End of combat flow

---

## Critical Missing Systems

### 1. 🎲 **Dice Rolling System**
**Requirement:** Actual dice randomizer that rolls 1-10 and displays results
**Current State:** ❌ **COMPLETELY MISSING**
**Impact:** **CRITICAL** - Users must manually roll physical dice and enter numbers

**Required Components:**
```typescript
// Dice roller function
function rollDie(): number {
  return Math.floor(Math.random() * 10) + 1; // 1-10
}

// Roll result tracking
type DieRoll = {
  unitId: string;
  rollNumber: number;
  result: number;
  wasRerolled: boolean;
  timestamp: number;
};

// UI Components needed:
- [Roll All Dice] button
- Visual die display (showing results)
- [Reroll] button per individual die
- Automatic hit calculation
```

### 2. 🚢 **Individual Unit Tracking**
**Requirement:** Each ship/ground force is tracked individually with state
**Current State:** ❌ **COMPLETELY MISSING**
**Impact:** **CRITICAL** - Cannot properly assign hits, track sustain damage, or remove casualties

**Required Data Structure:**
```typescript
type CombatUnit = {
  id: string; // unique instance ID
  type: UnitType; // war_sun, dreadnought, etc.
  owner: 'attacker' | 'defender';
  state: 'undamaged' | 'sustained' | 'destroyed';
  combatValue: number;
  combatRolls: number;
  hasSustainDamage: boolean;
  hasAFB: boolean;
  // ... all other stats from combatConfig
};

// Example: If attacker has 3 dreadnoughts:
const attackerUnits: CombatUnit[] = [
  { id: 'dread-1', type: 'dreadnought', owner: 'attacker', state: 'undamaged', ... },
  { id: 'dread-2', type: 'dreadnought', owner: 'attacker', state: 'undamaged', ... },
  { id: 'dread-3', type: 'dreadnought', owner: 'attacker', state: 'sustained', ... }, // took hit
];
```

**Current State:**
```typescript
// We only have aggregate counts:
const [attackerUnits, setAttackerUnits] = useState<UnitCounts>({
  dreadnought: 3, // just a number!
  // ...
});
```

### 3. 🎯 **Hit Assignment UI**
**Requirement:** Interactive UI where players click on specific ships to assign hits
**Current State:** ❌ **COMPLETELY MISSING**
**Impact:** **CRITICAL** - Core combat mechanic not implemented

**Required UI:**
```
┌─────────────────────────────────────┐
│ Assign 3 hits to defender's fleet  │
├─────────────────────────────────────┤
│ [Dreadnought]    ← clickable       │
│ [Dreadnought]    ← clickable       │
│ [Carrier]        ← clickable       │
│ [Fighter]        ← clickable       │
│ [Fighter]        ← clickable       │
│ [Fighter]        ← clickable       │
│                                     │
│ Hits assigned: 3/3                  │
│ [Confirm Hit Assignment]            │
└─────────────────────────────────────┘
```

**Logic:**
- Click on unit → if has Sustain Damage, mark as sustained
- Click on sustained unit → destroy it
- Click on unit without Sustain → destroy it
- Must assign all hits before proceeding

### 4. 💥 **Sustain Damage Tracking**
**Requirement:** Visual indication of damaged ships, proper state management
**Current State:** ❌ **COMPLETELY MISSING**
**Impact:** **CRITICAL** - Cannot properly resolve combat

**Required:**
- Visual indicator (damaged ship icon, orange border, "DAMAGED" label)
- State tracking per unit
- Direct Hit card prompt when sustain is used
- Damaged ships count toward fleet but can't sustain again

### 5. 🔄 **Reroll System**
**Requirement:** Per-die reroll buttons for abilities and Scramble Frequency
**Current State:** ❌ **COMPLETELY MISSING**
**Impact:** **HIGH** - Many abilities and action cards depend on rerolls

**Required:**
```
Die 1: [7] [Reroll]  ← hit!
Die 2: [4] [Reroll]  ← miss
Die 3: [9] [Reroll]  ← hit!
```

### 6. 🔁 **Combat Round Looping**
**Requirement:** Space Combat and Ground Combat loop until one side eliminated or retreat
**Current State:** ⚠️ **PARTIALLY IMPLEMENTED**
**Impact:** **HIGH** - Combat can't continue multiple rounds properly

**Required:**
- Track round number
- AFB only in Round 1
- Loop back to P2.3 (Announce Retreats) for each space combat round
- Loop back to P4.1 for each ground combat round
- Exit conditions properly handled

### 7. 🌍 **Planet & Unit Assignment UI**
**Requirement:** Select which planets to bombard, which ground forces go where
**Current State:** ❌ **COMPLETELY MISSING**
**Impact:** **HIGH** - Can't properly handle multi-planet invasions

**Required:**
```
Bombardment Target Selection:
┌────────────────────────────────┐
│ Planet: Mecatol Rex            │
│ Units firing:                  │
│ [x] Dreadnought 1              │
│ [x] Dreadnought 2              │
│ [ ] Dreadnought 3              │
└────────────────────────────────┘

Commit Ground Forces:
┌────────────────────────────────┐
│ Planet: Mecatol Rex            │
│ Infantry: [2] ← slider/counter │
│ Mechs: [1]                     │
└────────────────────────────────┘
```

---

## Summary Statistics

### Implementation Completeness by Phase:

| Phase | Status | Completeness |
|-------|--------|--------------|
| P0.1-P0.2 | ✅ Complete | 100% |
| P0.3 | ❌ Missing | 0% |
| P0.4 | ✅ Complete | 100% |
| P0.5 | ✅ Complete | 100% |
| P0.6 | ✅ Complete | 100% |
| P1.1 | ✅ Complete | 100% |
| P1.2 | ❌ Wrong | 10% |
| P1.3 | ❌ Missing | 0% |
| P1.4 | ⚠️ Partial | 50% |
| P2.1 | ⚠️ Partial | 70% |
| P2.2 | ❌ Wrong | 10% |
| P2.3 | ⚠️ Partial | 60% |
| P2.4 | ❌ Wrong | 10% |
| P2.5 | ❌ Missing | 0% |
| P2.6 | ⚠️ Partial | 50% |
| P3.1 | ⚠️ Partial | 70% |
| P3.2 | ❌ Missing | 0% |
| P3.3 | ⚠️ Partial | 50% |
| P3.4 | ❌ Wrong | 10% |
| P3.5 | ❌ Missing | 0% |
| P3.6-P3.10 | ⚠️ Partial | 40% |
| P4.1 | ⚠️ Partial | 60% |
| P4.2 | ❌ Wrong | 10% |
| P4.3 | ❌ Missing | 0% |
| P4.4-P4.6 | ⚠️ Partial | 50% |
| PC.1-PC.3 | ⚠️ Partial | 70% |

**Overall Implementation:** ~40% complete (mostly structure, lacking core mechanics)

---

## Critical Blockers to Requirements

### 🚨 **Blocker #1: No Dice Rolling**
**All combat phases depend on this and it doesn't exist**
- Affects: P1.2, P2.2, P2.4, P3.4, P3.9, P4.2
- Solution: Implement dice roller with visual display and reroll system

### 🚨 **Blocker #2: No Individual Unit Tracking**
**Cannot properly assign hits or track damage without this**
- Affects: All hit assignment steps (P1.3, P2.5, P3.5, P3.9, P4.3)
- Solution: Refactor from aggregate counts to individual unit instances

### 🚨 **Blocker #3: No Hit Assignment UI**
**Core combat interaction is missing**
- Affects: P1.3, P2.5, P3.5, P3.9, P4.3
- Solution: Build interactive click-to-assign interface

### 🚨 **Blocker #4: No Sustain Damage System**
**Fundamental combat mechanic not implemented**
- Affects: All combat phases
- Solution: Add sustained state tracking and visual indicators

---

## Recommended Implementation Path

### Phase 1: Core Systems (Foundation)
1. **Build Dice Rolling System**
   - Randomizer function
   - Visual die display components
   - Per-die reroll buttons
   - Automatic hit calculation

2. **Refactor to Individual Units**
   - Create `CombatUnit` type
   - Convert unit counts to unit arrays
   - Add unique IDs to each unit instance
   - Implement state transitions (undamaged → sustained → destroyed)

3. **Build Hit Assignment UI**
   - Clickable unit cards/buttons
   - Sustain damage handling
   - Visual feedback for damaged/destroyed units
   - Hit counter and confirmation

### Phase 2: Combat Mechanics
1. **Implement Space Cannon properly** (P1.2)
2. **Implement Anti-Fighter Barrage properly** (P2.2)
3. **Implement Space Combat Rolls** (P2.4)
4. **Implement Bombardment Rolls** (P3.4)
5. **Implement Ground Combat Rolls** (P4.2)

### Phase 3: Advanced Features
1. **Planet selection UI**
2. **Ground force assignment UI**
3. **All action card prompts**
4. **Faction-specific abilities**
5. **Direct Hit and other response prompts**

---

## Conclusion

The current implementation is a **Phase 0 prototype** that provides:
- ✅ Player selection
- ✅ Unit inventory entry
- ✅ Capacity validation
- ✅ Basic phase structure

But it is **fundamentally missing** the core combat system:
- ❌ Dice rolling
- ❌ Individual unit tracking
- ❌ Hit assignment
- ❌ Sustain damage
- ❌ Interactive combat resolution

**Estimated Work Required:** This is not a small gap to close. Implementing the full requirements would require:
- ~40-60 hours of development
- Complete refactor of combat state management
- New UI components for dice, units, and hit assignment
- Extensive testing for all combat scenarios

**Recommendation:** Start with Phase 1 (Core Systems) and get dice rolling + unit tracking working before attempting to fix individual combat phases.
