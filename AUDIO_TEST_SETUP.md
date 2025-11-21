# Audio Test Page Setup

## Quick Setup (2 minutes)

### Step 1: Add the route to App.tsx

Open [src/App.tsx](src/App.tsx) and add the audio test page:

```typescript
// At the top with other imports
import { AudioTestPage } from '@/features/audio-test';

// Inside the nested Routes (around line 37), add:
<Route path="/audio-test" element={<AudioTestPage />} />
```

Your routes section should look like:

```typescript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/setup" element={<GameSetupWizard />} />
  <Route path="/components" element={<ComponentsPage />} />
  <Route path="/tests" element={<TestsPage />} />
  <Route path="/audio-test" element={<AudioTestPage />} />  {/* ← ADD THIS */}
</Routes>
```

### Step 2: Create a test audio file

Create the folder structure and add ONE test file to start:

```
public/
└── audio/
    └── faction/
        └── arborec.mp3
```

**Quick way to create a test file:**
1. Go to https://ttsmp3.com/
2. Type "The Arborec"
3. Click "Read" then download the MP3
4. Save as `arborec.mp3` in `public/audio/faction/`

Or just use any short MP3 file as a placeholder!

### Step 3: Test it

1. Start your dev server: `npm run dev`
2. Navigate to: `http://localhost:5173/audio-test`
3. Click "Play Selected" under "Faction Names"
4. You should hear the sound!

## What You'll See

The test page has sections for:
- **Status**: Queue length, currently playing, loaded sounds
- **Preloading**: Load sounds into memory
- **Faction Names**: Test faction voice-overs
- **Phase Sounds**: Test phase transition sounds
- **Strategy Cards**: Test card sounds with variants
- **Events**: Test combat, Mecatol Rex, speaker change
- **Chained Sounds**: Test compound messages
- **Queue Tests**: Test rapid-fire sounds to verify queueing
- **Activity Log**: See everything that's happening

## Full File Structure (Add as you go)

You don't need all these files right away. Start with just one faction and build up:

```
public/
└── audio/
    ├── faction/
    │   ├── arborec.mp3                    ← Start here
    │   ├── barony_of_letnev.mp3
    │   ├── winnu.mp3
    │   └── ... (add more as you record them)
    │
    ├── phase_enter/
    │   ├── strategy.mp3
    │   ├── action.mp3
    │   ├── status.mp3
    │   └── agenda.mp3
    │
    ├── phase_exit/
    │   ├── strategy.mp3
    │   ├── action.mp3
    │   ├── status.mp3
    │   └── agenda.mp3
    │
    ├── prompt/
    │   ├── choose_strategy.mp3
    │   ├── choose_strategy_prefix.mp3
    │   ├── choose_action.mp3
    │   └── choose_action_prefix.mp3
    │
    ├── strategy_card/
    │   ├── leadership_1.mp3
    │   ├── leadership_2.mp3
    │   ├── leadership_3.mp3
    │   └── ... (3 variants for each card)
    │
    └── event/
        ├── combat.mp3
        ├── mecatol_rex_taken.mp3
        └── speaker_change.mp3
```

## Testing Workflow

1. **Add test file** → Test playback → ✓
2. **Test preloading** → See loaded count increase → ✓
3. **Test queue** → Rapid fire sounds → ✓
4. **Add more files** → Test each one → ✓

## Troubleshooting

**Sound doesn't play?**
- Check browser console (F12) for errors
- Verify file is at `public/audio/faction/arborec.mp3`
- Try accessing directly: `http://localhost:5173/audio/faction/arborec.mp3`

**Can't see the page?**
- Did you add the route to App.tsx?
- Did you import AudioTestPage?
- Try refreshing the browser

**File not found (404)?**
- Double-check folder structure in `public/audio/`
- File names are case-sensitive
- Must be `.mp3` extension

## After Testing

Once you've verified the system works:

1. Keep the test page for future debugging
2. Start recording your real voice-overs
3. Use the integration guide to add audio to your game components

See [AUDIO_INTEGRATION_EXAMPLE.md](AUDIO_INTEGRATION_EXAMPLE.md) for how to add audio to Action Phase!
