# Alt+Click Component Information - Complete Implementation Guide

This document explains exactly how the alt+right-click component inspection feature is implemented in this project, including all the pitfalls encountered and how they were resolved.

## What This Feature Does

The `vite-plugin-react-click-to-component` plugin enables you to:
- **Alt+Click** (or **Alt+Right-Click**) on any React component in your browser
- Automatically opens the component's source file in your editor (Cursor/VS Code)
- Jumps directly to the exact line where the component is defined
- Works seamlessly during development

## Working Configuration

### 1. Package Installation

**Exact Version That Works:**
```json
{
  "devDependencies": {
    "vite-plugin-react-click-to-component": "^4.2.0"
  }
}
```

Install command:
```bash
npm install --save-dev vite-plugin-react-click-to-component@4.2.0
```

### 2. Vite Configuration

**File: `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactClickToComponent } from 'vite-plugin-react-click-to-component';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    reactClickToComponent({
      // Try using the -g flag explicitly for better line navigation
      editor: 'cursor -g',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/store': path.resolve(__dirname, './src/store'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/assets': path.resolve(__dirname, './src/assets'),
    },
  },
  server: {
    port: 3000,
  },
});
```

### 3. TypeScript Configuration

**File: `tsconfig.json`**

No special configuration needed for the plugin, but ensure you have:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    // Standard React/TS settings...
  }
}
```

## Critical Implementation Details

### Import Statement - MUST BE EXACT

❌ **WRONG - These imports DO NOT work:**
```typescript
import clickToComponent from 'vite-plugin-react-click-to-component';
import { ClickToComponent } from 'vite-plugin-react-click-to-component';
```

✅ **CORRECT - This is the ONLY import that works:**
```typescript
import { reactClickToComponent } from 'vite-plugin-react-click-to-component';
```

### Plugin Usage in Vite Config

❌ **WRONG:**
```typescript
plugins: [
  react(),
  clickToComponent(),        // Wrong function name
  ClickToComponent(),        // Wrong import
  reactClickToComponent,     // Missing parentheses
]
```

✅ **CORRECT:**
```typescript
plugins: [
  react(),
  reactClickToComponent({
    editor: 'cursor -g',     // For Cursor users
    // OR
    // editor: 'code -g',    // For VS Code users
  }),
]
```

### Editor Configuration

**For Cursor:**
```typescript
reactClickToComponent({
  editor: 'cursor -g',  // The -g flag enables go-to-line navigation
})
```

**For VS Code:**
```typescript
reactClickToComponent({
  editor: 'code -g',
})
```

**Default (auto-detect):**
```typescript
reactClickToComponent()  // Will try to auto-detect your editor
```

## Evolution & Troubleshooting History

This project went through several iterations before getting it working. Here's what happened:

### Attempt 1: Wrong Import Name
```typescript
import clickToComponent from 'vite-plugin-react-click-to-component';
```
**Result:** Module not found / Import error

### Attempt 2: Wrong Named Import
```typescript
import { ClickToComponent } from 'vite-plugin-react-click-to-component';
```
**Result:** Named export not found

### Attempt 3: Correct Import, No Config
```typescript
import { reactClickToComponent } from 'vite-plugin-react-click-to-component';
// ...
plugins: [react(), reactClickToComponent()]
```
**Result:** Works but doesn't navigate to correct line number

### Attempt 4: Added Editor Config ✅
```typescript
reactClickToComponent({
  editor: 'cursor',
})
```
**Result:** Opens file but not at the exact line

### Final Solution: Added -g Flag ✅
```typescript
reactClickToComponent({
  editor: 'cursor -g',  // The -g flag was the missing piece!
})
```
**Result:** Perfect! Opens file at exact line number

## How to Use

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **In your browser:**
   - Hold down the **Alt** key (or **Option** on Mac)
   - Click (left-click or right-click) on any React component
   - Your editor will open to the exact file and line

3. **Visual feedback:**
   - When you hold Alt, you should see component boundaries highlighted
   - The cursor may change to indicate clickable components

## Requirements

- ✅ Vite-based React project
- ✅ Development mode (`npm run dev`)
- ✅ Cursor or VS Code installed
- ✅ Source maps enabled (default in Vite dev mode)

## Compatibility

**Works with:**
- React 18+, React 19+ ✅
- Vite 5+, Vite 7+ ✅
- TypeScript ✅
- Path aliases (like `@/components`) ✅
- Nested components ✅
- Third-party component libraries ✅

**Does NOT work with:**
- Production builds (only development mode)
- Server-side rendered components (SSR)
- Components without source maps

## Common Issues & Solutions

### Issue: "Nothing happens when I alt+click"

**Solutions:**
1. Make sure you're running in **development mode** (`npm run dev`)
2. Check browser console for errors
3. Verify the plugin is actually loaded in `vite.config.ts`
4. Try hard-refreshing the browser (Ctrl+Shift+R / Cmd+Shift+R)

### Issue: "File opens but not at the right line"

**Solution:**
Add the `-g` flag to your editor configuration:
```typescript
reactClickToComponent({
  editor: 'cursor -g',  // The -g flag is crucial!
})
```

### Issue: "Import error / module not found"

**Solution:**
Double-check your import statement matches EXACTLY:
```typescript
import { reactClickToComponent } from 'vite-plugin-react-click-to-component';
```

### Issue: "Works locally but not in production"

**Solution:**
This feature is **development-only**. The plugin automatically disables itself in production builds. This is intentional and expected behavior.

## Performance Impact

**Development:** Minimal impact, adds small metadata to components
**Production:** Zero impact, completely stripped from production builds

## Additional Configuration Options

```typescript
reactClickToComponent({
  // Editor command (required for line navigation)
  editor: 'cursor -g',

  // Custom port (optional, auto-detected by default)
  // port: 3000,

  // Enable/disable the plugin (optional, defaults to true in dev)
  // enabled: true,
})
```

## Verification Checklist

After setup, verify:

- [ ] Plugin is installed in `package.json` devDependencies
- [ ] Import statement is `{ reactClickToComponent }` (exact match)
- [ ] Plugin is added to Vite config's plugins array
- [ ] Editor config includes `-g` flag
- [ ] Dev server is running
- [ ] Browser shows your app without console errors
- [ ] Alt+click opens files in your editor
- [ ] Files open at the correct line number

## Project Context

**Tested Environment:**
- Package: `vite-plugin-react-click-to-component@4.2.0`
- Vite: `7.2.2`
- React: `19.2.0`
- TypeScript: `5.9.3`
- Editor: Cursor
- OS: Windows

**Git Commits Reference:**
- Initial implementation: `77282f2`
- Import syntax fix: `be942de`
- Cursor editor config: `cf7f176`
- Line navigation fix: `770116a` (added `-g` flag)

## Summary

The key to getting this working was:

1. **Exact import name:** `{ reactClickToComponent }` - nothing else works
2. **Editor flag:** Must include `-g` for line navigation
3. **Development only:** Feature is dev-mode only (which is good)
4. **Case sensitivity:** Import and function names are case-sensitive

Once these are correct, the feature works flawlessly and dramatically improves development workflow!
