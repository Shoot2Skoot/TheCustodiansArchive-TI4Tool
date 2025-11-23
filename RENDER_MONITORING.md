# Render Monitoring Guide

## Debug Logs Added

I've added minimal debug logs to track render frequency in key components:

### Console Output

**🟢 GamePage render**
- Shows every time the main GamePage component re-renders
- Should be infrequent (only when phase/round changes or significant state updates)

**🔵 ActionPhase render**
- Shows every time the ActionPhase component re-renders
- Should only render when GamePage renders or when action phase state changes

**🟡 ObjectivesPanel render - objectives: [count]**
- Shows every time the ObjectivesPanel re-renders
- Includes count of objectives loaded
- Should only render when ActionPhase renders or objectives data changes

**📍 Phase/Round changed: [phase] [round]**
- Logged from GamePage useEffect
- Only fires when phase or round actually changes (not on every render)
- Helps distinguish "render because parent changed" vs "render because my data changed"

---

## What to Look For

### ✅ HEALTHY Behavior (After Fixes)

**On Initial Load:**
```
🟢 GamePage render
📍 Phase/Round changed: setup undefined
🟢 GamePage render
🟢 GamePage render
📍 Phase/Round changed: action 1
🟢 GamePage render
🔵 ActionPhase render
🟡 ObjectivesPanel render - objectives: 0
🟡 ObjectivesPanel render - objectives: 5
```
Initial renders are normal - React may render 2-3 times as data loads.

**During Normal Use (No Actions):**
```
[mostly quiet - maybe 1-2 renders per second from auto-scroll]
```

**When Taking an Action:**
```
🔵 ActionPhase render
🟡 ObjectivesPanel render - objectives: 5
[Action completes, maybe 1-2 more renders]
```

**When Database Updates (from other players):**
```
🟢 GamePage render
🔵 ActionPhase render
🟡 ObjectivesPanel render - objectives: 5
[Should see 🔄 Game state changed, updating store in subscriptions]
```

### 🚨 PROBLEM Behavior (Infinite Loop)

**Rapid Fire Renders:**
```
🟢 GamePage render
🔵 ActionPhase render
🟡 ObjectivesPanel render - objectives: 5
🟢 GamePage render
🔵 ActionPhase render
🟡 ObjectivesPanel render - objectives: 5
🟢 GamePage render
🔵 ActionPhase render
🟡 ObjectivesPanel render - objectives: 5
🟢 GamePage render
🔵 ActionPhase render
[repeats hundreds/thousands of times per second]
```

If you see this pattern, the infinite loop is still happening.

---

## Performance Benchmarks

### Before Fixes
- **Renders per second:** 500-1000+
- **Console logs:** Thousands in seconds
- **Browser:** Becomes unresponsive, eventually crashes
- **CPU:** Near 100%

### After Fixes (Expected)
- **Renders per second:** 2-5 (mostly from auto-scroll)
- **Console logs:** 10-20 on initial load, then quiet
- **Browser:** Responsive and smooth
- **CPU:** Normal levels (~5-15%)

---

## Testing Checklist

### Test 1: Initial Load
1. Open DevTools Console (F12)
2. Refresh the page
3. **Expected:** See 5-10 renders during load, then mostly quiet
4. **Problem:** Seeing hundreds of renders

### Test 2: Idle Behavior
1. Let page sit idle for 10 seconds
2. Count renders in console
3. **Expected:** 0-2 renders (maybe from auto-scroll)
4. **Problem:** Constant renders every second

### Test 3: Database Heartbeat
1. Watch for subscription logs (`🔄 Game state changed`)
2. Check if GamePage renders after each one
3. **Expected:** Should NOT render if data identical
4. **Problem:** Renders on every heartbeat

### Test 4: User Interaction
1. Take a tactical action
2. Toggle an objective
3. Open Mecatol Rex modal
4. **Expected:** 2-5 renders per action, then stops
5. **Problem:** Renders keep coming after action completes

### Test 5: Undo/Redo
1. Take an action
2. Press Ctrl+Z (undo)
3. Press Ctrl+Y (redo)
4. **Expected:** 3-5 renders per undo/redo
5. **Problem:** Undo/redo triggers infinite renders

---

## Troubleshooting

### If you still see infinite renders:

1. **Check which component is looping:**
   - If only 🟢 GamePage → Problem in GamePage selectors
   - If 🟢 + 🔵 ActionPhase → Problem in ActionPhase memoization
   - If all three → Problem in subscriptions or props

2. **Look for subscription logs:**
   - Open subscriptions.ts and check if `🔄 Game state changed` appears
   - If it appears too often → Database heartbeat issue
   - If it appears on every render → Equality check not working

3. **Check the actual data:**
   ```javascript
   // In console, check if data is actually changing:
   let renderCount = 0;
   console.log = (function(oldLog) {
     return function(msg) {
       if (msg.includes('GamePage render')) {
         renderCount++;
         oldLog(`Render #${renderCount}`, msg);
       } else {
         oldLog(msg);
       }
     };
   })(console.log);
   ```

4. **Profile in React DevTools:**
   - Open React DevTools → Profiler
   - Start recording
   - Wait 5 seconds
   - Stop recording
   - Look at flamegraph - should be mostly empty
   - If dense with renders → Still have the issue

---

## Disabling Logs

If logs are too noisy after confirming the fix works, you can comment them out:

```typescript
// console.log('🟢 GamePage render');
```

Or add a toggle:
```typescript
const DEBUG_RENDERS = false;
if (DEBUG_RENDERS) console.log('🟢 GamePage render');
```

---

## Additional Monitoring

### Browser Performance Tools

1. **Chrome DevTools Performance Tab:**
   - Record for 5 seconds
   - Look at "Main" thread
   - Should see minimal React rendering activity

2. **React DevTools Profiler:**
   - Best way to see what's causing re-renders
   - Shows component tree with render times
   - Can identify which props changed

3. **Zustand DevTools:**
   - If enabled, shows store updates
   - Can see exactly when state changes
   - Helps correlate renders to state updates

---

*Last Updated: After implementing memoization and equality check fixes*
