# Twilight Imperium 4th Edition — Combat Assistant Logic

---

## 📊 Implementation Progress Tracker

### ✅ Foundational Systems (Complete)
- [x] Individual unit tracking system (`CombatUnit` type with state management)
- [x] Dice rolling system with visual display and automatic hit calculation
- [x] Per-die reroll system
- [x] Interactive hit assignment UI with sustain damage handling
- [x] Unit state transitions (undamaged → sustained → destroyed)

### ✅ Phase 0: Activation & Initialization (Complete)
- [x] P0.1 — Select Attacking Faction
- [x] P0.2 — Select Defending Faction
- [ ] P0.3 — Activation Step (ability/card prompts) **MISSING**
- [x] P0.4 — Movement Step
- [x] P0.5 — Unit Inventory Confirmation (with capacity validation)
- [x] P0.6 — Post-Movement Actions Window

### ✅ Phase 1: Space Cannon Offense (Complete)
- [x] P1.1 — Space Cannon Offense Cancellation Window
- [x] P1.2 — Space Cannon Rolls (using BatchDiceRoller component)
- [x] P1.3 — Hit Assignment (using HitAssignment component)
- [x] P1.4 — Combat Continuation Check (using actual unit state)

### ⏳ Phase 2: Space Combat (Pending Rebuild)
- [ ] P2.1 — Start of Combat Effects
- [ ] P2.2 — Anti-Fighter Barrage
- [ ] P2.3 — Announce Retreats
- [ ] P2.4 — Combat Rolls
- [ ] P2.5 — Hit Assignment & Damage Resolution
- [ ] P2.6 — Combat Continuation Check

### ⏳ Phase 3: Invasion — Bombardment (Pending Rebuild)
- [ ] P3.1-P3.10 — All bombardment and invasion steps

### ⏳ Phase 4: Ground Combat (Pending Rebuild)
- [ ] P4.1-P4.6 — All ground combat steps

### ⏳ Post-Combat (Pending Rebuild)
- [ ] PC.1-PC.3 — All post-combat steps

**Last Updated:** 2025-12-01 (Phase 1 complete - Space Cannon Offense fully integrated with new systems)

---

## Combat Entry Trigger

When a player wishes to activate a system containing enemy units, display an **[Activate Enemy System]** button. Clicking this button initiates the activation and combat sequence.

---

## Static Reminders

> These reminders persist throughout the entirety of combat and should remain visible at all times.

| Reminder | Duration |
|----------|----------|
| The active player may make transactions at any point during their turn, once per neighbor. | Entire Combat |

---

## Phase 0: Activation & Combat Initialization

### P0.1 — Select Attacking Faction
Prompt the user to select the faction initiating the activation.

### P0.2 — Select Defending Faction
Prompt the user to select the faction defending the system.

---

### P0.3 — Activation Step
Prompt players to declare any abilities or action cards that trigger *"after you activate a system"* or *"after another player activates a system."*

**Available Options:**
| Type | Name |
|------|------|
| Commander | So Ata (Yssaril) |
| Promissory Note | E-Res Siphons (Jol-Nar) |
| Promissory Note | Nullification Field (Xxcha) |
| Promissory Note | Aetherpassage (Empyrean) |
| Action Card | Flank Speed |
| Action Card | In the Silence of Space |
| Action Card | Cloak |
| Action Card | Rally |
| Action Card | Counterstroke |

**Logic Notes:**
- Multiple selections are permitted before advancing.
- **Special Case:** If *Nullification Field* is selected, immediately end the process — the activation is cancelled.
- Display **[Proceed to Movement]** button to advance.

> ⚠️ **Timing Note:** Upon advancing to the Movement Step, the "after activation" timing window is **closed**. All abilities and cards listed above must be declared during this step or they cannot be used.

---

### P0.4 — Movement Step
The attacker moves ships into the activated system and confirms when movement is complete.

Display **[Movement Complete]** button to advance.

---

### P0.5 — Unit Inventory Confirmation

**Attacker:**
1. Define all ships present in the system.
2. Define all fighters and ground forces present in the system.
3. Validate fleet size against the attacker's **Fleet Supply** limit.
4. Validate that total fighters and ground forces do not exceed the **combined capacity** of ships in the system.

**Defender:**
1. Define all units committed to the combat (ships, fighters, ground forces, structures).

**Third-Party Space Cannon Check:**
1. Prompt: "Do any other players have Space Cannon units in or adjacent to this system?"
2. If yes, identify which player(s) and their Space Cannon–capable units.

---

### P0.6 — Post-Movement Actions Window
This is the narrow timing window *after* movement is complete but *before* the Space Cannon Offense step. Prompt players for any of the following action cards:

| Action Card |
|-------------|
| Experimental Battlestation |
| Rescue |
| Stymie |

**Logic Notes:**
- Multiple selections are permitted.
- User must manually confirm to proceed.

---

## Phase 1: Space Cannon Offense

### P1.1 — Space Cannon Offense Cancellation Window
Prompt players to declare any effects that trigger *"at the start of an invasion."*

**Available Options:**
| Type | Name |
|------|------|
| Action Card | Disable |

**Logic Notes:**
- If no Space Cannon–capable units are present in or adjacent to the system, this phase may be skipped.
- User must manually confirm to proceed.

---

### P1.2 — Space Cannon Rolls
If any player has Space Cannon–capable units that can target the attacker's fleet, resolve Space Cannon rolls in player order.

**Space Cannon–Capable Units:**
| Unit | Notes |
|------|-------|
| PDS (Planetary Defense System) | Standard Space Cannon unit |
| PDS II (Titans of Ul) | Can fire at ships in **adjacent** systems |
| Space Dock | Only with **Hil Colish** relic attached |
| Loncara Ssodu (Xxcha Flagship) | Xxcha Kingdom flagship |
| Indomitus (Xxcha Mech) | Xxcha Kingdom mech |

**Modifiers:**
| Technology | Effect |
|------------|--------|
| Plasma Scoring | +1 die to Space Cannon rolls. Only **one unit** benefits per roll. |

---

**Resolution Flow:**

For each player with Space Cannon–capable units (in player order, starting from the speaker and proceeding clockwise):

1. **Prompt:** "[Player Name], do you wish to fire your Space Cannon(s)?"
   - Display **[Fire Space Cannon]** and **[Pass]** buttons.

2. **If the player chooses to pass:**
   - Record that the player declined to fire.
   - Proceed to the next eligible player.

3. **If the player chooses to fire:**
   - Display the number of Space Cannon–capable units available.
   - Player rolls for each unit individually.

---

**Per-Unit Roll Flow:**

1. Execute dice roll via randomizer.
2. Display result.
3. Display the following buttons:

| Button | Function |
|--------|----------|
| **[Reroll / Scramble Frequency]** | Re-executes the randomizer (for reroll abilities or the Scramble Frequency action card). |
| **[Assign Hits]** | Saves the current dice roll result to the player's hit queue and prepares the next roll (if additional units remain). |

4. Repeat until all of the player's Space Cannon units have rolled and hits have been assigned.

5. When all units have rolled:
   - Display **[Continue]** button.
   - Clicking **[Continue]** advances to the Hit Assignment screen.

---

### P1.3 — Hit Assignment
After all Space Cannon rolls are resolved and hits have been queued:

1. Display the attacker's fleet (ships and fighters in the system).
2. Display the total hits queued against the attacker.
3. The attacker selects which units will absorb the hits.

**Logic Notes:**
- Ships with *Sustain Damage* may absorb a hit without being destroyed (mark as damaged).
- User must assign all hits before proceeding.
- Display **[Confirm Hit Assignment]** button to proceed.

---

### P1.4 — Combat Continuation Check
After hit assignment is confirmed, evaluate whether combat continues.

**Condition Check:**
- If **only the attacker** has ships remaining in the system → Combat ends. Attacker wins.
- If **only the defender** has ships remaining in the system → Combat ends. Defender wins.
- If **both players** still have ships remaining → Proceed to Phase 2.

> ⚠️ **Early Termination:** If combat ends at this step, skip all remaining combat phases and proceed to post-combat cleanup.

---

## Phase 2: Space Combat

> ℹ️ **Round Tracking:** Space Combat may consist of multiple rounds. Track the current round number for logic purposes (e.g., Anti-Fighter Barrage only occurs in Round 1).

---

### P2.1 — Start of Combat Effects
Prompt players to declare any abilities or action cards that trigger *"at the start of a space combat."*

**Available Options:**
| Type | Name |
|------|------|
| Faction Ability | Mentak Ambush |
| Action Card | Reveal Prototype (Muaat) |

**Logic Notes:**
- This step occurs at the start of **each combat round**.
- Multiple selections are permitted before advancing.
- User must manually confirm to proceed.

---

### P2.2 — Anti-Fighter Barrage
> ⚠️ **First Round Only:** This step only occurs during the **first round** of space combat.

Both players with Anti-Fighter Barrage (AFB) capable units may simultaneously roll against enemy fighters.

**Anti-Fighter Barrage is optional.** Display **[Fire Anti-Fighter Barrage]** and **[Pass]** buttons for each player.

**AFB-Capable Units:**
| Unit | Notes |
|------|-------|
| Destroyer | Standard AFB unit |
| Destroyer II | Upgraded AFB |
| Other units with AFB | As granted by abilities or upgrades |

**Modifiers & Abilities:**
| Card/Ability | Effect |
|--------------|--------|
| Fighter Prototype | May be used during this step. |
| Argent Raid Formation | May be used during this step. |

**Resolution Flow:**
1. Both players declare whether they will fire AFB or pass.
2. If firing, execute dice rolls via randomizer.
3. Display results with **[Reroll / Scramble Frequency]** button available for each roll.
4. After all rolls are finalized, assign hits to enemy fighters simultaneously.
5. Display **[Continue]** button to proceed.

---

### P2.3 — Announce Retreats
Players declare their intent to retreat from combat.

**Resolution Order:**
1. **Defender** declares intent to retreat first.
2. **If the defender announces retreat:** The attacker **cannot** retreat this round.
3. **Attacker** declares intent to retreat (if eligible).

**Post-Declaration Actions:**
After retreat declarations are made, prompt players for the following action cards:

| Action Card | Effect |
|-------------|--------|
| Intercept | Played in response to retreat. |
| Rout | Played in response to retreat. |
| Faint (Yssaril) | Forces a retreat declaration. |

**Logic Notes:**
- Track whether a retreat was declared this round (used in P2.6).
- User must manually confirm to proceed.

---

### P2.4 — Combat Rolls
Both players roll dice for all participating ships.

**Display:**
- Show all ships on both sides simultaneously.

**Roll Sequence:**
1. **Attacker** clicks **[Roll All Dice]** to roll for all their ships at once.
2. **Defender** clicks **[Roll All Dice]** to roll for all their ships at once.

**Post-Roll Options:**
- Display a **[Reroll / Scramble Frequency]** button next to **each individual die result**.
- Any single die may be rerolled independently.

**Modifiers & Abilities to Apply:**
| Modifier | Effect |
|----------|--------|
| Jol-Nar Modifier | Apply faction combat modifier (–1 to combat rolls). |
| Hacan Flagship (Kenaran Maw) | Apply flagship ability if present. |
| Scramble Frequency | Action card allowing a reroll. |
| Other roll-related effects | Apply as declared. |

**Logic Notes:**
- After all rerolls are finalized, tally hits for each side.
- Display **[Continue]** button to proceed to Hit Assignment.

---

### P2.5 — Hit Assignment & Damage Resolution
Both players simultaneously assign hits to their opponent's ships.

**Display:**
- Split view showing:
  - **Attacker's ships** and hits to assign against them.
  - **Defender's ships** and hits to assign against them.

**Resolution Flow:**
1. Players verbally communicate their assignments to the host.
2. Host clicks to mark ships as damaged or destroyed in **any order** (not strictly attacker-then-defender).

**Sustain Damage:**
- Ships with *Sustain Damage* may absorb one hit without being destroyed (mark as damaged).
- **Direct Hit:** If a ship uses Sustain Damage, the opposing player may play *Direct Hit* to destroy that ship instead.

**Hit Cancellation:**
| Card/Ability | Effect |
|--------------|--------|
| Shield Holding | Cancels a hit. |

**Post-Assignment Actions:**
After all hits are assigned, prompt players for the following:

| Action Card | Effect |
|-------------|--------|
| Emergency Repairs | Repairs a damaged ship (removes Sustain Damage token). |

**Logic Notes:**
- Update unit counts for both sides.
- Display **[Continue]** button to proceed to Combat Continuation Check.

---

### P2.6 — Combat Continuation Check
Evaluate whether combat continues, ends, or a retreat is resolved.

**Condition Check:**

| Condition | Result |
|-----------|--------|
| **Only one side has units remaining** | Combat ends. Proceed to Post-Combat. |
| **Retreat was announced this round** | Resolve retreat: Retreating ships move to an adjacent system. Place a command token from reinforcements in the destination system. Combat ends. Proceed to Post-Combat. |
| **Both sides have units remaining AND no retreat was declared** | Return to **P2.3 — Announce Retreats** for the next combat round. |

---

## Phase 3: Invasion — Bombardment

> **Trigger:** The attacker has ships remaining in the system and there are planets containing defender ground forces. The attacker wishes to invade.

---

### P3.1 — Bombardment Declaration
Bombardment is **optional**. The attacker may choose to bombard planets before committing ground forces.

**Prompt:** "Do you wish to Bombard?"
- Display **[Bombard]** and **[Skip Bombardment]** buttons.

> ⚠️ **Important:** Bombardment rolls are **not** affected by standard combat roll modifiers.

---

### P3.2 — Bombardment Target Selection
If the attacker chooses to bombard:

1. Select which planet(s) to target.
2. Select which Bombardment-capable units will fire at each planet.

**Bombardment-Capable Units:**
| Unit | Notes |
|------|-------|
| Dreadnought | Standard Bombardment unit |
| War Sun | Bombardment ignores **Planetary Shield** |
| Other units with Bombardment | As granted by abilities or upgrades |

**Planetary Shield:**
- Planets with a unit possessing **Planetary Shield** (e.g., PDS) cannot be bombarded unless the attacking unit ignores Planetary Shield (e.g., War Sun, certain faction abilities).

---

### P3.3 — Defender Bombardment Response
Before Bombardment rolls are made, prompt the defender for responses.

**Available Options:**
| Type | Name | Effect |
|------|------|--------|
| Action Card | Bunker | Apply **–4** to all Bombardment rolls this combat. |

---

### P3.4 — Bombardment Rolls
Execute Bombardment dice rolls for each bombarding unit.

**Roll Flow:**
1. For each Bombardment-capable unit targeting a planet:
   - Execute dice roll via randomizer.
   - Display result.
   - Display **[Reroll / Scramble Frequency]** button.
   - Display **[Assign Hits]** button to queue the result.

2. Repeat for all bombarding units.

3. When all rolls are complete:
   - Display **[Continue]** button to proceed to Hit Assignment.

---

### P3.5 — Bombardment Hit Assignment
Assign Bombardment hits to defender's ground forces on the targeted planet(s).

1. Display the defender's ground forces on each bombarded planet.
2. Display the total hits queued against each planet.
3. The defender assigns hits to their ground forces.

**Logic Notes:**
- Mechs with *Sustain Damage* may absorb one hit without being destroyed (mark as damaged).
- Infantry are destroyed by hits.
- Display **[Confirm Hit Assignment]** button to proceed.

---

### P3.6 — Invasion Continuation Check
After Bombardment is resolved:

**Condition Check:**
- If **no defender ground forces remain** on a planet → Attacker may land ground forces unopposed (skip to P4.6 — Establish Control for that planet).
- If **defender ground forces remain** → Proceed to P3.7 — Commit Ground Forces.

---

### P3.7 — Commit Ground Forces
The attacker commits ground forces (Infantry, Mechs) from space to planets containing enemy ground forces.

**Prompt:** "Select ground forces to commit to each planet."

1. Display attacker's available ground forces in space.
2. Attacker selects which units to land on which planets.
3. Confirm landing assignments.

---

### P3.8 — Defender Landing Response
After the attacker commits ground forces, prompt the defender for responses.

**Available Options:**
| Type | Name | Effect |
|------|------|--------|
| Action Card | Parley | Return committed ground forces to space (units are not destroyed). |
| Action Card | Pax | Return committed ground forces to space **and** destroy one of them. |

**Logic Notes:**
- If *Parley* or *Pax* is played, update the attacker's committed forces accordingly.
- If all committed forces are returned to space, the invasion of that planet is cancelled.
- Display **[Continue]** button to proceed.

---

### P3.9 — Space Cannon Defense
The defender's PDS units may fire against the attacker's committed ground forces.

**Prompt (Defender):** "Do you wish to use Space Cannon Defense?"
- Display **[Fire Space Cannon Defense]** and **[Pass]** buttons.

**Pre-Roll Actions:**
| Type | Name | Effect |
|------|------|--------|
| Action Card | Disable | Prevents PDS from firing this combat. |

---

**If the defender chooses to fire:**

**Roll Flow:**
1. For each PDS unit:
   - Execute dice roll via randomizer.
   - Display result.
   - Display **[Reroll / Scramble Frequency]** button.
   - Display **[Assign Hits]** button to queue the result.

2. When all rolls are complete:
   - Display **[Continue]** button to proceed to Hit Assignment.

---

**Space Cannon Defense Hit Assignment:**
1. Display the attacker's committed ground forces.
2. Display the total hits queued.
3. The attacker assigns hits to their committed ground forces.

**Special Actions:**
| Type | Name | Effect |
|------|------|--------|
| Action Card | Crash Landing | If the attacker's last ship was destroyed, place 1 ground force on the planet. |

**Logic Notes:**
- Mechs with *Sustain Damage* may absorb one hit (mark as damaged).
- Display **[Confirm Hit Assignment]** button to proceed.

---

### P3.10 — Ground Combat Trigger Check
After Space Cannon Defense is resolved:

**Condition Check:**
- If **attacker has no ground forces remaining** on the planet → Invasion fails. Proceed to next planet or end invasion phase.
- If **attacker has ground forces remaining** → Proceed to Phase 4: Ground Combat.

---

## Phase 4: Ground Combat

> ℹ️ **Round Tracking:** Ground Combat may consist of multiple rounds. Track the current round number.

---

### P4.1 — Start of Ground Combat Effects
Prompt players to declare any abilities that trigger *"at the start of a ground combat round."*

**Available Options:**
| Type | Name | Effect |
|------|------|--------|
| Faction Ability | Yin Indoctrination | Spend influence to replace an opponent's infantry with your own. |
| Faction Ability | Arborec Mech Deploy | Arborec may deploy additional ground forces. |

**Logic Notes:**
- This step occurs at the start of **each ground combat round**.
- Multiple selections are permitted before advancing.
- Display **[Continue]** button to proceed.

---

### P4.2 — Ground Combat Rolls
Both players roll dice for all participating ground forces simultaneously.

**Display:**
- Show all ground forces on both sides.

**Roll Sequence:**
1. **Attacker** clicks **[Roll All Dice]** to roll for all their ground forces at once.
2. **Defender** clicks **[Roll All Dice]** to roll for all their ground forces at once.

**Post-Roll Options:**
- Display a **[Reroll / Scramble Frequency]** button next to **each individual die result**.
- Any single die may be rerolled independently.

**Modifiers & Abilities:**
| Modifier | Effect |
|----------|--------|
| Jol-Nar Modifier | Apply faction combat modifier (–1 to combat rolls). |
| Fire Team (Action Card) | Allows reroll of ground force dice. |
| Other roll-related effects | Apply as declared. |

**Logic Notes:**
- After all rerolls are finalized, tally hits for each side.
- Display **[Continue]** button to proceed to Hit Assignment.

---

### P4.3 — Ground Combat Hit Assignment
Both players simultaneously assign hits to their opponent's ground forces.

**Display:**
- Split view showing:
  - **Attacker's ground forces** and hits to assign against them.
  - **Defender's ground forces** and hits to assign against them.

**Resolution Flow:**
1. Players verbally communicate their assignments to the host.
2. Host clicks to mark units as damaged or destroyed in **any order**.

**Sustain Damage:**
- Mechs with *Sustain Damage* may absorb one hit without being destroyed (mark as damaged).

**Sustain Damage Prevention:**
| Type | Name | Effect |
|------|------|--------|
| Faction Unit | Moll Terminus (Mentak Mech) | Opponent ground forces cannot use Sustain Damage. |

**Logic Notes:**
- Update unit counts for both sides.
- Display **[Continue]** button to proceed.

---

### P4.4 — L1Z1X Harrow Check
> **Faction-Specific:** This step only applies if L1Z1X is the attacker.

If L1Z1X has ships with **Harrow** in the system, they may use Bombardment again against remaining defender ground forces.

**Prompt (L1Z1X):** "Do you wish to use Harrow?"
- Display **[Use Harrow]** and **[Skip]** buttons.

**If Harrow is used:**
1. Execute Bombardment rolls per P3.4 flow.
2. Assign hits to defender ground forces.
3. Display **[Continue]** button to proceed.

---

### P4.5 — Ground Combat Continuation Check
Evaluate whether ground combat continues or ends.

**Condition Check:**

| Condition | Result |
|-----------|--------|
| **Only one side has ground forces remaining** | Ground combat ends. Proceed to P4.6 — Establish Control. |
| **Both sides have ground forces remaining** | Return to **P4.1 — Start of Ground Combat Effects** for the next round. |

---

### P4.6 — Establish Control
The attacker gains control of the planet.

**Control Resolution:**
1. Transfer planet card to the attacker (or mark control change).
2. The planet is **exhausted** upon gaining control.

**Post-Control Actions:**
Prompt players for the following abilities and action cards:

| Type | Name | Effect |
|------|------|--------|
| Action Card | Infiltrate | Replace defender's structures (PDS, Space Dock) with your own. |
| Faction Ability | L1Z1X Assimilate | Replace defender's PDS and Space Docks with L1Z1X units. |
| Action Card | Reparations | Exhaust one of the opponent's planets; ready one of your own planets. |

**Logic Notes:**
- Repeat Phase 3 & 4 for each planet being invaded, if applicable.
- After all planetary invasions are resolved, proceed to Post-Combat.

---

## Post-Combat

### PC.1 — Faction-Specific Triggers

**Vuil'raith Cabal:**
- If the Cabal participated in combat, they capture non-destroyed enemy units (per their faction ability).

**Mentak Coalition:**
- If Mentak won the combat, prompt for *Salvage* ability.

---

### PC.2 — Capacity Check
The winner of the combat must verify that their remaining fighters and ground forces (not on planets) do not exceed the carrying capacity of their ships in the system.

**If excess units exist:**
- The winner must remove fighters and/or ground forces until within capacity.

---

### PC.3 — Combat Complete
Combat has concluded. The active player may now proceed with the **Production** step of their tactical action (if applicable).

Display **[End Combat]** button to close the combat assistant.

---

## Summary: Combat Phase Flow

```
[Activate Enemy System]
        ↓
   Phase 0: Activation & Initialization
        ↓
   Phase 1: Space Cannon Offense
        ↓
   Phase 2: Space Combat (may loop multiple rounds)
        ↓
   Phase 3: Invasion — Bombardment
        ↓
   Phase 4: Ground Combat (may loop multiple rounds)
        ↓
   Post-Combat Cleanup
        ↓
   [Return to Tactical Action — Production Step]
```