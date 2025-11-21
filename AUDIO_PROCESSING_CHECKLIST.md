# Audio Processing Checklist

Use this checklist for your audio processing pipeline.

## Step 1: Create Folder Structure

```bash
mkdir -p public/audio/cornelius/{faction,phase_enter,phase_exit,prompt,strategy_card,event,time_warning,time_expired,round_begin,round_end,objectives,agenda_voting}
```

Or on Windows:
```powershell
New-Item -ItemType Directory -Path "public\audio\cornelius\faction" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\phase_enter" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\phase_exit" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\prompt" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\strategy_card" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\event" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\time_warning" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\time_expired" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\round_begin" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\round_end" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\objectives" -Force
New-Item -ItemType Directory -Path "public\audio\cornelius\agenda_voting" -Force
```

## Step 2: Process Existing Audio Files

Use [AUDIO_SCRIPT_MAPPING.md](AUDIO_SCRIPT_MAPPING.md) to map each script line to its filename.

### Faction Names (24 files) - NO variant numbers
- [ ] Lines 1-24 → `cornelius/faction/[name].mp3`
- [ ] **IMPORTANT:** No `_1` suffix for factions!

### Strategy Phase (12 files) - WITH variant numbers _1 to _6
- [ ] Lines 49-54 → `cornelius/phase_enter/strategy_1.mp3` through `strategy_6.mp3`
- [ ] Lines 61-66 → `cornelius/phase_exit/strategy_1.mp3` through `strategy_6.mp3`

### Agenda Phase (12 files) - WITH variant numbers _1 to _6
- [ ] Lines 73-78 → `cornelius/phase_enter/agenda_1.mp3` through `agenda_6.mp3`
- [ ] Lines 85-90 → `cornelius/phase_exit/agenda_1.mp3` through `agenda_6.mp3`

### Status Phase (12 files) - WITH variant numbers _1 to _6
- [ ] Lines 97-102 → `cornelius/phase_enter/status_1.mp3` through `status_6.mp3`
- [ ] Lines 109-114 → `cornelius/phase_exit/status_1.mp3` through `status_6.mp3`

### Choose Strategy Prompts (14 files) - WITH variant numbers _1 to _14
- [ ] Lines 121-148 → `cornelius/prompt/choose_strategy_1.mp3` through `choose_strategy_14.mp3`

### Time Warnings (5 files) - WITH variant numbers _1 to _5
- [ ] Lines 149-153 → `cornelius/time_warning/time_warning_1.mp3` through `time_warning_5.mp3`

### Time Expired (5 files) - WITH variant numbers _1 to _5
- [ ] Lines 159-163 → `cornelius/time_expired/time_expired_1.mp3` through `time_expired_5.mp3`

### Round Begin (4 files) - WITH variant numbers _1 to _4
- [ ] Lines 169-172 → `cornelius/round_begin/round_begin_1.mp3` through `round_begin_4.mp3`

### Round End (4 files) - WITH variant numbers _1 to _4
- [ ] Lines 177-180 → `cornelius/round_end/round_end_1.mp3` through `round_end_4.mp3`

### Combat (4 files) - WITH variant numbers _1 to _4
- [ ] Lines 185-188 → `cornelius/event/combat_1.mp3` through `combat_4.mp3`

### Objectives (4 files) - WITH variant numbers _1 to _4
- [ ] Lines 193-196 → `cornelius/objectives/score_objectives_1.mp3` through `score_objectives_4.mp3`

### Agenda Voting (4 files) - WITH variant numbers _1
- [ ] Line 201 → `cornelius/agenda_voting/prepare_vote_1.mp3`
- [ ] Line 202 → `cornelius/agenda_voting/cast_votes_1.mp3`
- [ ] Line 205 → `cornelius/agenda_voting/voting_concluded_1.mp3`
- [ ] Line 207 → `cornelius/agenda_voting/agenda_resolved_1.mp3`

## Step 3: Verify File Count

Count files in each folder to verify:

```bash
# On macOS/Linux:
find public/audio/cornelius -type f -name "*.mp3" | wc -l

# Expected: ~130 files currently
```

```powershell
# On Windows:
(Get-ChildItem -Path "public\audio\cornelius" -Recurse -Filter "*.mp3").Count
```

### Expected Counts Per Folder:
- faction: 24 files (NO variant numbers)
- phase_enter: 18 files (strategy, status, agenda: 6 each)
- phase_exit: 18 files (strategy, status, agenda: 6 each)
- prompt: 14 files (choose_strategy only, for now)
- event: 4 files (combat only, for now)
- time_warning: 5 files
- time_expired: 5 files
- round_begin: 4 files
- round_end: 4 files
- objectives: 4 files
- agenda_voting: 4 files
- strategy_card: 0 files (need to record)

**Total Current: ~104 files**
**Total After Missing: ~189 files**

## Step 4: Record Missing Audio

### Critical Missing Files (needed for gameplay):

1. **The Mentak Coalition** (1 file):
   ```
   "The Mentak Coalition" → cornelius/faction/mentak_coalition.mp3
   ```

2. **Action Phase Enter** (6 files):
   ```
   "We have entered the Action Phase" → cornelius/phase_enter/action_1.mp3
   "The Action Phase has begun" → cornelius/phase_enter/action_2.mp3
   "Commanders, we now enter the Action Phase" → cornelius/phase_enter/action_3.mp3
   "It is time for the Action Phase" → cornelius/phase_enter/action_4.mp3
   "We are now in the Action Phase" → cornelius/phase_enter/action_5.mp3
   "Stand by. The Action Phase is now in effect" → cornelius/phase_enter/action_6.mp3
   ```

3. **Action Phase Exit** (6 files):
   ```
   "The Action Phase is complete" → cornelius/phase_exit/action_1.mp3
   "This concludes the Action Phase" → cornelius/phase_exit/action_2.mp3
   "The Action Phase has ended" → cornelius/phase_exit/action_3.mp3
   "That is the end of the Action Phase" → cornelius/phase_exit/action_4.mp3
   "The Action Phase is now closed" → cornelius/phase_exit/action_5.mp3
   "All actions resolved; the Action Phase is over" → cornelius/phase_exit/action_6.mp3
   ```

4. **Choose Action Prompts** (10 files):
   ```
   "Select your action" → cornelius/prompt/choose_action_1.mp3
   "Choose your action" → cornelius/prompt/choose_action_2.mp3
   "Make your action selection" → cornelius/prompt/choose_action_3.mp3
   "What action will you take" → cornelius/prompt/choose_action_4.mp3
   "It is time to choose your action" → cornelius/prompt/choose_action_5.mp3
   "Commanders, declare your actions" → cornelius/prompt/choose_action_6.mp3
   "Your turn has arrived; select your action" → cornelius/prompt/choose_action_7.mp3
   "The galaxy awaits your decision" → cornelius/prompt/choose_action_8.mp3
   "Choose your move" → cornelius/prompt/choose_action_9.mp3
   "Action Phase: make your selection" → cornelius/prompt/choose_action_10.mp3
   ```

### Nice to Have (adds polish):

5. **Strategy Cards** (24 files - 8 cards × 3 variants):
   ```
   "Leadership" → cornelius/strategy_card/leadership_1.mp3
   "The Leadership Strategy Card" → cornelius/strategy_card/leadership_2.mp3
   "Leadership has been played" → cornelius/strategy_card/leadership_3.mp3
   (... repeat for all 8 cards)
   ```

6. **Mecatol Rex Taken** (3 files):
   ```
   "Mecatol Rex has been claimed" → cornelius/event/mecatol_rex_taken_1.mp3
   "The galactic throne has fallen" → cornelius/event/mecatol_rex_taken_2.mp3
   "Mecatol Rex is under new control" → cornelius/event/mecatol_rex_taken_3.mp3
   ```

7. **Speaker Change** (3 files):
   ```
   "The speaker has changed" → cornelius/event/speaker_change_1.mp3
   "A new speaker has been chosen" → cornelius/event/speaker_change_2.mp3
   "Leadership of the council shifts" → cornelius/event/speaker_change_3.mp3
   ```

## Step 5: Test in Application

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Navigate to test page:
   ```
   http://localhost:5173/audio-test
   ```

3. Test each category:
   - [ ] Factions play correctly
   - [ ] Phase transitions play with random variants
   - [ ] Prompts play with random variants
   - [ ] Combat sounds play
   - [ ] Time warnings play
   - [ ] Round sounds play
   - [ ] Objectives sounds play
   - [ ] Agenda voting sounds play

4. Verify queueing:
   - [ ] Click "Rapid Fire Test"
   - [ ] Sounds should play in sequence without overlap
   - [ ] Queue length should increase and decrease properly

## Step 6: Update Variant Counts (if needed)

If you recorded different numbers of variants than expected, update in [src/lib/audio.ts](src/lib/audio.ts):

```typescript
export const VARIANT_COUNTS = {
  phase_enter: {
    strategy: 6,  // ← Update these if you have more/fewer variants
    action: 6,
    status: 6,
    agenda: 6,
  },
  // ... etc
};
```

## Naming Rules Quick Reference

✅ **Correct:**
- `cornelius/faction/arborec.mp3` (NO variant number)
- `cornelius/phase_enter/strategy_1.mp3` (WITH variant number)
- `cornelius/prompt/choose_strategy_14.mp3` (variant starts at _1, not _0)

❌ **Incorrect:**
- `cornelius/faction/arborec_1.mp3` (factions don't have variants)
- `cornelius/phase_enter/strategy.mp3` (missing variant number)
- `cornelius/prompt/choose_strategy_0.mp3` (variants start at _1)
- `audio/cornelius/faction/arborec.mp3` (wrong: should be public/audio/)

## Common Issues

### Issue: "Sound not found" error
- Check file path matches exactly (case-sensitive)
- Verify file is in correct folder
- Check variant number is correct

### Issue: "Only hearing one variant"
- Check you have multiple files with correct variant numbers
- Verify `VARIANT_COUNTS` is set correctly
- Check files are named `_1`, `_2`, etc. (not `_0`)

### Issue: "Factions not playing"
- Factions should NOT have variant numbers
- Should be `arborec.mp3`, NOT `arborec_1.mp3`

## Script for Bulk Renaming (Example)

Here's a sample Node.js script structure for your audio processing repo:

```javascript
const fs = require('fs');
const path = require('path');

// Mapping from script line to target filename
const mapping = {
  'The Arborec': 'cornelius/faction/arborec.mp3',
  'We have entered the Strategy Phase': 'cornelius/phase_enter/strategy_1.mp3',
  // ... etc
};

// Process each audio file
Object.entries(mapping).forEach(([scriptLine, targetPath]) => {
  const sourcePath = findFileByScriptLine(scriptLine);
  if (sourcePath) {
    copyFile(sourcePath, path.join('public/audio', targetPath));
  }
});
```

Use the [AUDIO_SCRIPT_MAPPING.md](AUDIO_SCRIPT_MAPPING.md) document to build your complete mapping object.

## Done!

Once all files are in place and tested, your audio system is ready to integrate into the game!

See [AUDIO_INTEGRATION_EXAMPLE.md](AUDIO_INTEGRATION_EXAMPLE.md) for how to add audio to your game components.
