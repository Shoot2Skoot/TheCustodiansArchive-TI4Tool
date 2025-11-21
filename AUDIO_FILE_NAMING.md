# Audio File Naming Conventions

## Folder Structure

```
public/audio/
├── cornelius/                          ← Voice name folder
│   ├── faction/                        ← Faction names (no variants)
│   │   ├── arborec.mp3
│   │   ├── naalu_collective.mp3
│   │   ├── barony_of_letnev.mp3
│   │   ├── nekro_virus.mp3
│   │   ├── clan_of_saar.mp3
│   │   ├── sardakk_norr.mp3
│   │   ├── embers_of_muaat.mp3
│   │   ├── universities_of_jolnar.mp3
│   │   ├── emirates_of_hacan.mp3
│   │   ├── winnu.mp3
│   │   ├── federation_of_sol.mp3
│   │   ├── xxcha_kingdom.mp3
│   │   ├── ghosts_of_creuss.mp3
│   │   ├── yin_brotherhood.mp3
│   │   ├── l1z1x_mindnet.mp3
│   │   ├── yssaril_tribes.mp3
│   │   ├── mentak_coalition.mp3          ← MISSING - NEED TO RECORD
│   │   ├── argent_flight.mp3
│   │   ├── empyrean.mp3
│   │   ├── mahact_gene_sorcerers.mp3
│   │   ├── naaz_rokha_alliance.mp3
│   │   ├── nomad.mp3
│   │   ├── titans_of_ul.mp3
│   │   ├── vuil_raith_cabal.mp3
│   │   └── council_keleres.mp3
│   │
│   ├── phase_enter/                    ← Phase enter sounds (6 variants each)
│   │   ├── strategy_1.mp3
│   │   ├── strategy_2.mp3
│   │   ├── strategy_3.mp3
│   │   ├── strategy_4.mp3
│   │   ├── strategy_5.mp3
│   │   ├── strategy_6.mp3
│   │   ├── action_1.mp3                 ← MISSING - NEED TO RECORD
│   │   ├── action_2.mp3                 ← MISSING
│   │   ├── action_3.mp3                 ← MISSING
│   │   ├── action_4.mp3                 ← MISSING
│   │   ├── action_5.mp3                 ← MISSING
│   │   ├── action_6.mp3                 ← MISSING
│   │   ├── status_1.mp3
│   │   ├── status_2.mp3
│   │   ├── status_3.mp3
│   │   ├── status_4.mp3
│   │   ├── status_5.mp3
│   │   ├── status_6.mp3
│   │   ├── agenda_1.mp3
│   │   ├── agenda_2.mp3
│   │   ├── agenda_3.mp3
│   │   ├── agenda_4.mp3
│   │   ├── agenda_5.mp3
│   │   └── agenda_6.mp3
│   │
│   ├── phase_exit/                     ← Phase exit sounds (6 variants each)
│   │   ├── strategy_1.mp3
│   │   ├── strategy_2.mp3
│   │   ├── strategy_3.mp3
│   │   ├── strategy_4.mp3
│   │   ├── strategy_5.mp3
│   │   ├── strategy_6.mp3
│   │   ├── action_1.mp3                 ← MISSING - NEED TO RECORD
│   │   ├── action_2.mp3                 ← MISSING
│   │   ├── action_3.mp3                 ← MISSING
│   │   ├── action_4.mp3                 ← MISSING
│   │   ├── action_5.mp3                 ← MISSING
│   │   ├── action_6.mp3                 ← MISSING
│   │   ├── status_1.mp3
│   │   ├── status_2.mp3
│   │   ├── status_3.mp3
│   │   ├── status_4.mp3
│   │   ├── status_5.mp3
│   │   ├── status_6.mp3
│   │   ├── agenda_1.mp3
│   │   ├── agenda_2.mp3
│   │   ├── agenda_3.mp3
│   │   ├── agenda_4.mp3
│   │   ├── agenda_5.mp3
│   │   └── agenda_6.mp3
│   │
│   ├── prompt/                         ← Player prompts (multiple variants)
│   │   ├── choose_strategy_1.mp3
│   │   ├── choose_strategy_2.mp3
│   │   ├── choose_strategy_3.mp3
│   │   ├── choose_strategy_4.mp3
│   │   ├── choose_strategy_5.mp3
│   │   ├── choose_strategy_6.mp3
│   │   ├── choose_strategy_7.mp3
│   │   ├── choose_strategy_8.mp3
│   │   ├── choose_strategy_9.mp3
│   │   ├── choose_strategy_10.mp3
│   │   ├── choose_strategy_11.mp3
│   │   ├── choose_strategy_12.mp3
│   │   ├── choose_strategy_13.mp3
│   │   ├── choose_strategy_14.mp3
│   │   ├── choose_action_1.mp3          ← MISSING - NEED TO RECORD (all 10)
│   │   ├── choose_action_2.mp3          ← MISSING
│   │   ├── choose_action_3.mp3          ← MISSING
│   │   ├── choose_action_4.mp3          ← MISSING
│   │   ├── choose_action_5.mp3          ← MISSING
│   │   ├── choose_action_6.mp3          ← MISSING
│   │   ├── choose_action_7.mp3          ← MISSING
│   │   ├── choose_action_8.mp3          ← MISSING
│   │   ├── choose_action_9.mp3          ← MISSING
│   │   └── choose_action_10.mp3         ← MISSING
│   │
│   ├── strategy_card/                  ← Strategy cards (3 variants each)
│   │   ├── leadership_1.mp3             ← MISSING - NEED TO RECORD (all 24)
│   │   ├── leadership_2.mp3             ← MISSING
│   │   ├── leadership_3.mp3             ← MISSING
│   │   ├── diplomacy_1.mp3              ← MISSING
│   │   ├── diplomacy_2.mp3              ← MISSING
│   │   ├── diplomacy_3.mp3              ← MISSING
│   │   ├── politics_1.mp3               ← MISSING
│   │   ├── politics_2.mp3               ← MISSING
│   │   ├── politics_3.mp3               ← MISSING
│   │   ├── construction_1.mp3           ← MISSING
│   │   ├── construction_2.mp3           ← MISSING
│   │   ├── construction_3.mp3           ← MISSING
│   │   ├── trade_1.mp3                  ← MISSING
│   │   ├── trade_2.mp3                  ← MISSING
│   │   ├── trade_3.mp3                  ← MISSING
│   │   ├── warfare_1.mp3                ← MISSING
│   │   ├── warfare_2.mp3                ← MISSING
│   │   ├── warfare_3.mp3                ← MISSING
│   │   ├── technology_1.mp3             ← MISSING
│   │   ├── technology_2.mp3             ← MISSING
│   │   ├── technology_3.mp3             ← MISSING
│   │   ├── imperial_1.mp3               ← MISSING
│   │   ├── imperial_2.mp3               ← MISSING
│   │   └── imperial_3.mp3               ← MISSING
│   │
│   ├── event/                          ← Game events
│   │   ├── combat_1.mp3
│   │   ├── combat_2.mp3
│   │   ├── combat_3.mp3
│   │   ├── combat_4.mp3
│   │   ├── mecatol_rex_taken_1.mp3      ← MISSING - NEED TO RECORD (all 3)
│   │   ├── mecatol_rex_taken_2.mp3      ← MISSING
│   │   ├── mecatol_rex_taken_3.mp3      ← MISSING
│   │   ├── speaker_change_1.mp3         ← MISSING - NEED TO RECORD (all 3)
│   │   ├── speaker_change_2.mp3         ← MISSING
│   │   └── speaker_change_3.mp3         ← MISSING
│   │
│   ├── time_warning/                   ← Time warnings (5 variants)
│   │   ├── time_warning_1.mp3
│   │   ├── time_warning_2.mp3
│   │   ├── time_warning_3.mp3
│   │   ├── time_warning_4.mp3
│   │   └── time_warning_5.mp3
│   │
│   ├── time_expired/                   ← Time expired (5 variants)
│   │   ├── time_expired_1.mp3
│   │   ├── time_expired_2.mp3
│   │   ├── time_expired_3.mp3
│   │   ├── time_expired_4.mp3
│   │   └── time_expired_5.mp3
│   │
│   ├── round_begin/                    ← Round begins (4 variants)
│   │   ├── round_begin_1.mp3
│   │   ├── round_begin_2.mp3
│   │   ├── round_begin_3.mp3
│   │   └── round_begin_4.mp3
│   │
│   ├── round_end/                      ← Round ends (4 variants)
│   │   ├── round_end_1.mp3
│   │   ├── round_end_2.mp3
│   │   ├── round_end_3.mp3
│   │   └── round_end_4.mp3
│   │
│   ├── objectives/                     ← Objectives (4 variants)
│   │   ├── score_objectives_1.mp3
│   │   ├── score_objectives_2.mp3
│   │   ├── score_objectives_3.mp3
│   │   └── score_objectives_4.mp3
│   │
│   └── agenda_voting/                  ← Agenda voting (1 variant each for now)
│       ├── prepare_vote_1.mp3
│       ├── cast_votes_1.mp3
│       ├── voting_concluded_1.mp3
│       └── agenda_resolved_1.mp3
│
└── [another_voice]/                    ← Future: additional voice folders
    └── ... (same structure)
```

## Naming Rules

### General Format

```
{voice_name}/{category}/{sound_id}_{variant_number}.mp3
```

### Voice Names
- Use lowercase with underscores
- Examples: `cornelius`, `female_commander`, `robotic_voice`

### Category Folders
- `faction` - Faction names (NO variant numbers)
- `phase_enter` - Phase entry sounds
- `phase_exit` - Phase exit sounds
- `prompt` - Player prompts
- `strategy_card` - Strategy card played sounds
- `event` - Special game events
- `time_warning` - Time running out warnings
- `time_expired` - Time's up sounds
- `round_begin` - Round starting sounds
- `round_end` - Round ending sounds
- `objectives` - Score objectives prompts
- `agenda_voting` - Voting prompts

### Sound IDs

**Factions** (lowercase, underscores, no "the"):
- `arborec`
- `naalu_collective`
- `barony_of_letnev`
- `nekro_virus`
- `clan_of_saar`
- `sardakk_norr`
- `embers_of_muaat`
- `universities_of_jolnar`
- `emirates_of_hacan`
- `winnu`
- `federation_of_sol`
- `xxcha_kingdom`
- `ghosts_of_creuss`
- `yin_brotherhood`
- `l1z1x_mindnet`
- `yssaril_tribes`
- `mentak_coalition`
- `argent_flight`
- `empyrean`
- `mahact_gene_sorcerers`
- `naaz_rokha_alliance`
- `nomad`
- `titans_of_ul`
- `vuil_raith_cabal`
- `council_keleres`

**Phases**:
- `strategy`
- `action`
- `status`
- `agenda`

**Prompts**:
- `choose_strategy` (14 variants)
- `choose_action` (10 variants)

**Strategy Cards**:
- `leadership` (3 variants)
- `diplomacy` (3 variants)
- `politics` (3 variants)
- `construction` (3 variants)
- `trade` (3 variants)
- `warfare` (3 variants)
- `technology` (3 variants)
- `imperial` (3 variants)

**Events**:
- `combat` (4 variants)
- `mecatol_rex_taken` (3 variants)
- `speaker_change` (3 variants)

**Time**:
- `time_warning` (5 variants)
- `time_expired` (5 variants)

**Rounds**:
- `round_begin` (4 variants)
- `round_end` (4 variants)

**Objectives**:
- `score_objectives` (4 variants)

**Agenda Voting**:
- `prepare_vote` (1 variant)
- `cast_votes` (1 variant)
- `voting_concluded` (1 variant)
- `agenda_resolved` (1 variant)

### Variant Numbers
- Start at `_1` (not `_0`)
- Sequential: `_1`, `_2`, `_3`, etc.
- Faction names have NO variant numbers (only one version each)

## Complete File List for Your Audio Processing

### Files You Already Have (from script.md)

**Factions** (24 files) - NO variant numbers:
```
cornelius/faction/arborec.mp3
cornelius/faction/naalu_collective.mp3
cornelius/faction/barony_of_letnev.mp3
cornelius/faction/nekro_virus.mp3
cornelius/faction/clan_of_saar.mp3
cornelius/faction/sardakk_norr.mp3
cornelius/faction/embers_of_muaat.mp3
cornelius/faction/universities_of_jolnar.mp3
cornelius/faction/emirates_of_hacan.mp3
cornelius/faction/winnu.mp3
cornelius/faction/federation_of_sol.mp3
cornelius/faction/xxcha_kingdom.mp3
cornelius/faction/ghosts_of_creuss.mp3
cornelius/faction/yin_brotherhood.mp3
cornelius/faction/l1z1x_mindnet.mp3
cornelius/faction/yssaril_tribes.mp3
cornelius/faction/argent_flight.mp3
cornelius/faction/empyrean.mp3
cornelius/faction/mahact_gene_sorcerers.mp3
cornelius/faction/naaz_rokha_alliance.mp3
cornelius/faction/nomad.mp3
cornelius/faction/titans_of_ul.mp3
cornelius/faction/vuil_raith_cabal.mp3
cornelius/faction/council_keleres.mp3
```

**Phase Transitions** (48 files):
```
cornelius/phase_enter/strategy_1.mp3 through strategy_6.mp3
cornelius/phase_enter/status_1.mp3 through status_6.mp3
cornelius/phase_enter/agenda_1.mp3 through agenda_6.mp3
cornelius/phase_exit/strategy_1.mp3 through strategy_6.mp3
cornelius/phase_exit/status_1.mp3 through status_6.mp3
cornelius/phase_exit/agenda_1.mp3 through agenda_6.mp3
```

**Prompts** (14 files):
```
cornelius/prompt/choose_strategy_1.mp3 through choose_strategy_14.mp3
```

**Events** (4 files):
```
cornelius/event/combat_1.mp3 through combat_4.mp3
```

**Time** (10 files):
```
cornelius/time_warning/time_warning_1.mp3 through time_warning_5.mp3
cornelius/time_expired/time_expired_1.mp3 through time_expired_5.mp3
```

**Rounds** (8 files):
```
cornelius/round_begin/round_begin_1.mp3 through round_begin_4.mp3
cornelius/round_end/round_end_1.mp3 through round_end_4.mp3
```

**Objectives** (4 files):
```
cornelius/objectives/score_objectives_1.mp3 through score_objectives_4.mp3
```

**Agenda Voting** (4 files):
```
cornelius/agenda_voting/prepare_vote_1.mp3
cornelius/agenda_voting/cast_votes_1.mp3
cornelius/agenda_voting/voting_concluded_1.mp3
cornelius/agenda_voting/agenda_resolved_1.mp3
```

### Files You Need to Record

**Total Missing: ~85 files**

1. **Mentak Coalition faction** (1 file):
   ```
   cornelius/faction/mentak_coalition.mp3
   ```

2. **Action Phase Enter** (6 files):
   ```
   cornelius/phase_enter/action_1.mp3 through action_6.mp3
   ```

3. **Action Phase Exit** (6 files):
   ```
   cornelius/phase_exit/action_1.mp3 through action_6.mp3
   ```

4. **Choose Action Prompts** (10 files):
   ```
   cornelius/prompt/choose_action_1.mp3 through choose_action_10.mp3
   ```

5. **Strategy Cards** (24 files - 8 cards × 3 variants):
   ```
   cornelius/strategy_card/leadership_1.mp3 through leadership_3.mp3
   cornelius/strategy_card/diplomacy_1.mp3 through diplomacy_3.mp3
   cornelius/strategy_card/politics_1.mp3 through politics_3.mp3
   cornelius/strategy_card/construction_1.mp3 through construction_3.mp3
   cornelius/strategy_card/trade_1.mp3 through trade_3.mp3
   cornelius/strategy_card/warfare_1.mp3 through warfare_3.mp3
   cornelius/strategy_card/technology_1.mp3 through technology_3.mp3
   cornelius/strategy_card/imperial_1.mp3 through imperial_3.mp3
   ```

6. **Mecatol Rex** (3 files):
   ```
   cornelius/event/mecatol_rex_taken_1.mp3 through mecatol_rex_taken_3.mp3
   ```

7. **Speaker Change** (3 files):
   ```
   cornelius/event/speaker_change_1.mp3 through speaker_change_3.mp3
   ```

## Mapping Script Lines to Files

See [AUDIO_SCRIPT_MAPPING.md](AUDIO_SCRIPT_MAPPING.md) for the complete mapping of each script line to its target filename.
