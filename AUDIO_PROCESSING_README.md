# Audio Processing Guide for Audio Agent

This document contains everything needed to process the TI4 voice-over recordings into the app's required format.

## Quick Summary

- **Total Files**: 157 audio files
- **Voice Name**: `cornelius`
- **Format**: MP3
- **Source**: script.md (lines 1-313)
- **Target**: `public/audio/cornelius/`

## Folder Structure to Create

```
public/audio/cornelius/
├── faction/                (25 files)
├── phase_enter/            (24 files)
├── phase_exit/             (24 files)
├── prompt/                 (24 files)
├── strategy_card/          (24 files)
├── event/                  (10 files)
├── time_warning/           (5 files)
├── time_expired/           (5 files)
├── round_begin/            (4 files)
├── round_end/              (4 files)
├── objectives/             (4 files)
└── agenda_voting/          (4 files)
```

## Critical Naming Rules

### Rule 1: Factions Have NO Variant Numbers
✅ Correct: `cornelius/faction/arborec.mp3`
❌ Wrong: `cornelius/faction/arborec_1.mp3`

**Why**: Each faction has only one voice line, so no variants are needed.

### Rule 2: Everything Else HAS Variant Numbers
✅ Correct: `cornelius/phase_enter/strategy_1.mp3`
❌ Wrong: `cornelius/phase_enter/strategy.mp3`

**Why**: Multiple variants prevent audio fatigue.

### Rule 3: Variants Start at _1 (not _0)
✅ Correct: `strategy_1.mp3`, `strategy_2.mp3`, `strategy_3.mp3`
❌ Wrong: `strategy_0.mp3`, `strategy_1.mp3`, `strategy_2.mp3`

### Rule 4: Use Lowercase with Underscores
✅ Correct: `barony_of_letnev.mp3`, `l1z1x_mindnet.mp3`
❌ Wrong: `BaronyOfLetnev.mp3`, `L1Z1X-Mindnet.mp3`

## Script Line to Filename Mapping

See **AUDIO_SCRIPT_MAPPING.md** for complete line-by-line mapping.

### Quick Reference by Category

**Factions (Lines 1-47, 209)**
- Lines map directly to lowercase snake_case faction names
- NO variant numbers
- Example: "The Arborec" → `arborec.mp3`

**Strategy Phase Enter (Lines 49-59)**
- 6 variants numbered _1 through _6
- Example: Line 49 → `strategy_1.mp3`

**Strategy Phase Exit (Lines 61-71)**
- 6 variants numbered _1 through _6
- Example: Line 61 → `strategy_1.mp3`

**Action Phase Enter (Lines 211-222)**
- 6 variants numbered _1 through _6
- Example: Line 211 → `action_1.mp3`

**Action Phase Exit (Lines 223-234)**
- 6 variants numbered _1 through _6
- Example: Line 223 → `action_1.mp3`

**Status Phase Enter (Lines 97-107)**
- 6 variants numbered _1 through _6
- Example: Line 97 → `status_1.mp3`

**Status Phase Exit (Lines 109-119)**
- 6 variants numbered _1 through _6
- Example: Line 109 → `status_1.mp3`

**Agenda Phase Enter (Lines 73-83)**
- 6 variants numbered _1 through _6
- Example: Line 73 → `agenda_1.mp3`

**Agenda Phase Exit (Lines 85-95)**
- 6 variants numbered _1 through _6
- Example: Line 85 → `agenda_1.mp3`

**Choose Strategy (Lines 121-148)**
- 14 variants numbered _1 through _14
- Target: `cornelius/prompt/choose_strategy_X.mp3`

**Choose Action (Lines 235-254)**
- 10 variants numbered _1 through _10
- Target: `cornelius/prompt/choose_action_X.mp3`

**Strategy Cards (Lines 255-302)**
- 8 cards × 3 variants each = 24 files
- Pattern: `cornelius/strategy_card/{card_name}_{variant}.mp3`
- Leadership: Lines 255-259 → `leadership_1.mp3` through `leadership_3.mp3`
- Diplomacy: Lines 261-265 → `diplomacy_1.mp3` through `diplomacy_3.mp3`
- Politics: Lines 267-271 → `politics_1.mp3` through `politics_3.mp3`
- Construction: Lines 273-277 → `construction_1.mp3` through `construction_3.mp3`
- Trade: Lines 279-283 → `trade_1.mp3` through `trade_3.mp3`
- Warfare: Lines 285-289 → `warfare_1.mp3` through `warfare_3.mp3`
- Technology: Lines 291-295 → `technology_1.mp3` through `technology_3.mp3`
- Imperial: Lines 297-301 → `imperial_1.mp3` through `imperial_3.mp3`

**Time Warnings (Lines 149-157)**
- 5 variants numbered _1 through _5
- Target: `cornelius/time_warning/time_warning_X.mp3`

**Time Expired (Lines 159-167)**
- 5 variants numbered _1 through _5
- Target: `cornelius/time_expired/time_expired_X.mp3`

**Round Begin (Lines 169-175)**
- 4 variants numbered _1 through _4
- Target: `cornelius/round_begin/round_begin_X.mp3`

**Round End (Lines 177-183)**
- 4 variants numbered _1 through _4
- Target: `cornelius/round_end/round_end_X.mp3`

**Combat (Lines 185-191)**
- 4 variants numbered _1 through _4
- Target: `cornelius/event/combat_X.mp3`

**Objectives (Lines 193-199)**
- 4 variants numbered _1 through _4
- Target: `cornelius/objectives/score_objectives_X.mp3`

**Agenda Voting (Lines 201-207)**
- 4 separate sound types (NOT variants of same sound)
- Line 201 → `cornelius/agenda_voting/prepare_vote_1.mp3`
- Line 202 → `cornelius/agenda_voting/cast_votes_1.mp3`
- Line 205 → `cornelius/agenda_voting/voting_concluded_1.mp3`
- Line 207 → `cornelius/agenda_voting/agenda_resolved_1.mp3`

**Mecatol Rex (Lines 303-307)**
- 3 variants numbered _1 through _3
- Target: `cornelius/event/mecatol_rex_taken_X.mp3`

**Speaker Change (Lines 309-313)**
- 3 variants numbered _1 through _3
- Target: `cornelius/event/speaker_change_X.mp3`

## Faction Name Normalization

Faction names need to be converted from display format to filename format:

```
Display Name → Filename
──────────────────────────────────────────────
The Arborec → arborec.mp3
The Naalu Collective → naalu_collective.mp3
The Barony of Letnev → barony_of_letnev.mp3
The Nekro Virus → nekro_virus.mp3
The Clan of Saar → clan_of_saar.mp3
Sardakk N'orr → sardakk_norr.mp3
The Embers of Muaat → embers_of_muaat.mp3
The Universities of Jol-Nar → universities_of_jolnar.mp3
The Emirates of Hacan → emirates_of_hacan.mp3
The Winnu → winnu.mp3
The Federation of Sol → federation_of_sol.mp3
The Xxcha Kingdom → xxcha_kingdom.mp3
The Ghosts of Creuss → ghosts_of_creuss.mp3
The Yin Brotherhood → yin_brotherhood.mp3
The L1Z1X Mindnet → l1z1x_mindnet.mp3
The Yssaril Tribes → yssaril_tribes.mp3
The Argent Flight → argent_flight.mp3
The Empyrean → empyrean.mp3
The Mahact Gene-Sorcerers → mahact_gene_sorcerers.mp3
The Naaz-Rokha Alliance → naaz_rokha_alliance.mp3
The Nomad → nomad.mp3
The Titans of Ul → titans_of_ul.mp3
The Vuil'Raith Cabal → vuil_raith_cabal.mp3
The Council Keleres → council_keleres.mp3
The Mentak Coalition → mentak_coalition.mp3
```

**Normalization Rules**:
1. Remove "The " prefix
2. Convert to lowercase
3. Replace spaces with underscores
4. Replace hyphens with underscores
5. Remove apostrophes

## Processing Steps

1. **Create folder structure**
   ```bash
   mkdir -p public/audio/cornelius/{faction,phase_enter,phase_exit,prompt,strategy_card,event,time_warning,time_expired,round_begin,round_end,objectives,agenda_voting}
   ```

2. **Process each category**
   - Factions: Map lines 1-47, 209 → faction/{name}.mp3
   - Phases: Map line groups → phase_enter/exit/{phase}_{variant}.mp3
   - Prompts: Map line groups → prompt/{type}_{variant}.mp3
   - Strategy Cards: Map line groups → strategy_card/{card}_{variant}.mp3
   - Events: Map line groups → event/{type}_{variant}.mp3
   - Time: Map line groups → time_warning/expired/time_{type}_{variant}.mp3
   - Rounds: Map line groups → round_begin/end/round_{type}_{variant}.mp3
   - Objectives: Map lines 193-199 → objectives/score_objectives_{variant}.mp3
   - Voting: Map specific lines → agenda_voting/{type}_1.mp3

3. **Verify file count**
   - Total should be 157 files
   - Use file list in AUDIO_FILE_LIST.txt to verify

4. **Test the output**
   - Copy processed files to app's public/audio/cornelius/
   - Navigate to http://localhost:5173/audio-test
   - Test each category plays correctly

## Quality Checks

✅ **File naming**
- All lowercase
- Underscores instead of spaces/hyphens
- Factions have NO variant numbers
- Everything else has variant numbers starting at _1

✅ **File count**
- faction/: 25 files
- phase_enter/: 24 files
- phase_exit/: 24 files
- prompt/: 24 files
- strategy_card/: 24 files
- event/: 10 files
- time_warning/: 5 files
- time_expired/: 5 files
- round_begin/: 4 files
- round_end/: 4 files
- objectives/: 4 files
- agenda_voting/: 4 files
- **TOTAL: 157 files**

✅ **Audio format**
- Format: MP3
- Encoding: Any standard MP3 encoding works
- Sample rate: 44.1kHz or 48kHz recommended
- Bitrate: 128kbps or higher recommended

## Example Processing Script (Pseudocode)

```javascript
// Example structure for processing
const scriptLines = readFile('script.md').split('\n');
const outputDir = 'public/audio/cornelius';

// Factions (lines 1-47, 209)
const factionLines = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 209];
factionLines.forEach((lineNum, index) => {
  const text = scriptLines[lineNum - 1];
  const filename = normalizeFactionName(text);
  processAudioFile(
    sourceAudio[index],
    `${outputDir}/faction/${filename}.mp3`
  );
});

// Phase enter (strategy: lines 49-59)
const strategyEnterLines = [49, 51, 53, 55, 57, 59];
strategyEnterLines.forEach((lineNum, index) => {
  processAudioFile(
    sourceAudio[...],
    `${outputDir}/phase_enter/strategy_${index + 1}.mp3`
  );
});

// ... repeat for all categories
```

## Reference Documents

- **AUDIO_SCRIPT_MAPPING.md**: Complete line-by-line mapping
- **AUDIO_FILE_LIST.txt**: All target filenames in order
- **AUDIO_COMPLETE_SUMMARY.md**: Overview of what's recorded
- **script.md**: Source script with all recorded lines

## Support

If you have questions:
1. Check AUDIO_SCRIPT_MAPPING.md for specific line mappings
2. Check AUDIO_FILE_LIST.txt for expected output files
3. Verify against the file count checklist above

## Done!

Once processing is complete, you should have 157 MP3 files organized in the folder structure ready to test in the app!
