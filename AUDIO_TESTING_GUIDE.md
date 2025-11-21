# Audio System Testing Guide

## Quick Start: Add Test Page to Your App

### Option 1: Add as a Route (Recommended)

If you're using React Router, add the test page as a route:

```typescript
// In your router configuration
import { AudioTestPage } from '@/features/audio-test';

// Add to your routes:
<Route path="/audio-test" element={<AudioTestPage />} />
```

Then navigate to `/audio-test` in your browser.

### Option 2: Temporary Component Swap

Temporarily replace your main component to test:

```typescript
// In App.tsx
import { AudioTestPage } from '@/features/audio-test';

function App() {
  // Temporarily return test page
  return <AudioTestPage />;

  // Or use a conditional:
  const isTestMode = window.location.pathname === '/test-audio';
  if (isTestMode) return <AudioTestPage />;

  // ... rest of your app
}
```

### Option 3: Add Debug Button

Add a debug button to your existing UI:

```typescript
import { useState } from 'react';
import { AudioTestPage } from '@/features/audio-test';

function YourComponent() {
  const [showAudioTest, setShowAudioTest] = useState(false);

  if (showAudioTest) {
    return (
      <div>
        <button onClick={() => setShowAudioTest(false)}>Back</button>
        <AudioTestPage />
      </div>
    );
  }

  return (
    <div>
      {/* Your normal UI */}
      <button onClick={() => setShowAudioTest(true)}>Test Audio</button>
    </div>
  );
}
```

## Setting Up Test Audio Files

Before testing, create a few sample audio files to verify the system works.

### Minimum Test Setup

Create these folders and files:

```
public/
└── audio/
    ├── faction/
    │   └── arborec.mp3              # Say "The Arborec"
    ├── phase_enter/
    │   └── action.mp3                # Say "Entering action phase"
    ├── phase_exit/
    │   └── action.mp3                # Say "Exiting action phase"
    ├── prompt/
    │   ├── choose_strategy.mp3       # Say "choose your strategy"
    │   └── choose_action_prefix.mp3  # Say "choose your action"
    ├── strategy_card/
    │   ├── leadership_1.mp3          # Say "Leadership"
    │   ├── leadership_2.mp3          # Say "Leadership card" (variant)
    │   └── leadership_3.mp3          # Say "Leadership strategy" (variant)
    └── event/
        └── combat.mp3                # Say "Combat!"
```

### Creating Quick Test Audio

**Option 1: Text-to-Speech (Quick & Easy)**

Use an online TTS tool:
1. Go to https://ttsmp3.com/ or similar
2. Enter text like "The Arborec"
3. Download as MP3
4. Save to appropriate folder

**Option 2: Record Yourself**

Use your computer's audio recorder:
- Windows: Voice Recorder app
- Mac: QuickTime Player
- Browser: https://online-voice-recorder.com/

**Option 3: Placeholder Beeps**

Just want to test the queue system? Use any short MP3 file or beep sound as a placeholder.

## Testing Checklist

Use this checklist to verify everything works:

### ✅ Basic Functionality
- [ ] Preload test sounds (should see count increase)
- [ ] Play a faction name (should hear sound)
- [ ] Check "Queue Length" updates when sounds play
- [ ] Check "Playing" status toggles to "Yes" when sound plays
- [ ] Check "Last Played" updates with each sound

### ✅ Queue System
- [ ] Click "Rapid Fire Test" button
- [ ] All 5 sounds should play in sequence
- [ ] Queue length should increase then decrease
- [ ] No sounds should overlap
- [ ] "Clear Queue" button stops pending sounds

### ✅ Sound Categories
- [ ] Play faction names (use dropdown or grid buttons)
- [ ] Play phase enter sounds (all 4 phases)
- [ ] Play phase exit sounds (all 4 phases)
- [ ] Play strategy card sounds (test variants)
- [ ] Play event sounds

### ✅ Chained Sounds
- [ ] Click "The [Faction], choose your strategy"
- [ ] Should hear faction name, then prompt, in sequence
- [ ] Click "Choose your action, The [Faction]"
- [ ] Should hear prompt, then faction name, in sequence

### ✅ Error Handling
- [ ] Try playing sound that doesn't exist
- [ ] Should see error in console but app shouldn't crash
- [ ] Activity log should show the attempt

### ✅ Preloading
- [ ] "Loaded Sounds" count starts at 0
- [ ] Click "Preload Test Sounds"
- [ ] Count should increase
- [ ] Green list should show loaded sounds
- [ ] Playing preloaded sound should be instant

## What Each Test Does

### Faction Names
Tests basic sound playback for each faction. Use this to verify:
- File paths are correct
- Audio files are loading
- Playback works

### Phase Sounds
Tests phase transition sounds. Two types:
- **Enter**: Played when entering a phase
- **Exit**: Played when leaving a phase

### Strategy Cards
Tests random variant selection. Each card has 3 variants:
- Click same card multiple times
- Should hear different variants randomly
- Adds variety to prevent audio fatigue

### Events
Tests special event sounds:
- Combat
- Mecatol Rex captured
- Speaker changed

### Chained Sounds
Tests playing multiple sounds in sequence:
- **Faction First**: "The Arborec, choose your strategy"
- **Prompt First**: "Choose your action, The Arborec"

This is crucial for your game - it's how you'll announce player turns.

### Rapid Fire Test
Tests the queue system:
- Fires 5 sounds in 250ms (very fast)
- Queue should handle them gracefully
- Sounds should play in order
- No overlap or chaos

## Interpreting the Activity Log

The log shows everything happening in the system:

```
[10:30:45] Playing faction: arborec
[10:30:46] Playing phase enter: action
[10:30:48] Testing rapid fire (queue system)...
[10:30:50] Queue cleared
```

Look for:
- ✅ Each action logged correctly
- ✅ Timestamps show sequential playback
- ❌ Error messages (file not found, playback failed)

## Troubleshooting

### "No sound plays"

1. **Check browser console** (F12) for errors:
   - `404 Not Found` → File doesn't exist at that path
   - `Failed to load` → Check file path and spelling
   - `Autoplay policy` → Click on the page first (browser requirement)

2. **Check file location**:
   - Files must be in `/public/audio/` directory
   - Check folder structure matches documentation
   - Check file names match exactly (case-sensitive)

3. **Check file format**:
   - Must be `.mp3` format
   - Try playing file directly in browser: `http://localhost:5173/audio/faction/arborec.mp3`

### "Queue Length never decreases"

- This means sounds aren't finishing/playing
- Check browser console for playback errors
- Verify audio file is valid (not corrupted)

### "Sounds overlap"

- This shouldn't happen with the queue system
- If it does, check console for errors
- Try clearing queue and testing again

### "Preloading fails"

- Check console for 404 errors
- Verify all file paths are correct
- Some files may be missing - that's okay for testing

### "Activity log shows errors"

- Read the error message carefully
- Usually indicates missing file or incorrect path
- You don't need all sounds to test the system

## Testing Workflow

Recommended order for testing:

1. **Start with one sound**:
   - Create just `public/audio/faction/arborec.mp3`
   - Test playing it
   - Verify it works before adding more

2. **Test preloading**:
   - Click "Preload Test Sounds"
   - Verify count increases
   - Play the preloaded sound (should be instant)

3. **Test queue system**:
   - Click same button multiple times quickly
   - Sounds should queue, not overlap
   - Queue length should show pending sounds

4. **Add more sounds gradually**:
   - Add phase sounds
   - Test phase transitions
   - Add strategy cards with variants
   - Test random variant selection

5. **Test chained sounds**:
   - Create faction + prompt sounds
   - Test chaining
   - Verify proper sequence

## Browser Compatibility Notes

- **Chrome/Edge**: Full support, works great
- **Firefox**: Full support
- **Safari**: May require user interaction before first sound plays
- **Mobile browsers**: Some may require tap to enable audio

## Performance Monitoring

While testing, monitor:
- **Queue length**: Should rarely exceed 3-4 sounds
- **Memory usage**: Check browser dev tools
- **Console warnings**: Indicates issues to fix

## After Testing

Once you've verified the system works:

1. ✅ Remove or comment out the test route
2. ✅ Start recording your real voice-over files
3. ✅ Integrate audio into your game components
4. ✅ Use the integration examples in AUDIO_INTEGRATION_EXAMPLE.md

You can always bring back the test page later if you need to debug issues!

## Quick Test Script

Copy/paste this checklist while testing:

```
□ Create /public/audio/ folder structure
□ Add test audio file: arborec.mp3
□ Open test page in browser
□ Click "Preload Test Sounds"
□ Verify loaded count increases
□ Click "Play Selected" faction button
□ Hear sound play
□ Check queue length updates
□ Click "Rapid Fire Test"
□ Verify sounds play sequentially
□ Try "Clear Queue" button
□ Check console for errors
□ System is working! ✓
```

## Need Help?

If you run into issues:
1. Check browser console (F12)
2. Verify file paths match exactly
3. Try with a simple test file first
4. Check the troubleshooting section above
