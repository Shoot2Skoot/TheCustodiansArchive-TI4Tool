# Design System and UI/UX Guidelines

## Table of Contents
- [Design Philosophy](#design-philosophy)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing and Layout](#spacing-and-layout)
- [Components](#components)
- [Iconography](#iconography)
- [Animations and Transitions](#animations-and-transitions)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)

---

## Design Philosophy

### Core Principles

1. **Sci-Fi Aesthetic**
   - Inspired by hard surface modeling and paneling
   - Technological and futuristic feel
   - Clean lines and geometric shapes

2. **Minimalism**
   - Functional over decorative
   - Clear information hierarchy
   - No unnecessary visual noise

3. **Sharp Edges and Bevels**
   - Angular corners, not rounded
   - Beveled edges on panels and buttons
   - Geometric precision

4. **Avoid Gradients**
   - Solid colors preferred
   - Subtle shadows for depth, not gradients
   - Clean color transitions

5. **Paneling Aesthetic**
   - Compartmentalized UI elements
   - Panel-like containers for information
   - Borders and separators to define sections

### Visual References

Think:
- **Starship control panels** - functional, compartmentalized
- **Military HUD interfaces** - clean, informative
- **Sci-fi game UIs** (e.g., EVE Online, Elite Dangerous)
- **Hard surface 3D modeling** - beveled edges, panel lines

Avoid:
- Overly colorful or "cartoony" designs
- Excessive gradients or glows
- Rounded, soft shapes
- Cluttered or busy layouts

---

## Color System

### Primary Colors

**Background Colors** (Dark theme for sci-fi aesthetic):

```css
--color-bg-primary: #0A0E14;      /* Deep space black */
--color-bg-secondary: #151A23;    /* Slightly lighter panel background */
--color-bg-tertiary: #1E2530;     /* Elevated elements */
--color-bg-elevated: #252D3A;     /* Modals, dropdowns */
```

**Border and Separator Colors**:

```css
--color-border-primary: #2A3342;  /* Main borders */
--color-border-accent: #3D4A5C;   /* Highlighted borders */
--color-border-glow: #4A7BA7;     /* Accent/active borders */
```

**Text Colors**:

```css
--color-text-primary: #E8ECEF;    /* Main text */
--color-text-secondary: #A8B2BC;  /* Secondary text, labels */
--color-text-tertiary: #6B7684;   /* Muted text, disabled */
--color-text-accent: #4A9EFF;     /* Links, highlights */
```

### Accent Colors

**Primary Accent** (Blue - technology, calmness):

```css
--color-accent-primary: #4A9EFF;
--color-accent-primary-dark: #2E7DD6;
--color-accent-primary-light: #6DB4FF;
```

**Secondary Accent** (Cyan - information, alerts):

```css
--color-accent-secondary: #3DD9D9;
--color-accent-secondary-dark: #2AAFAF;
--color-accent-secondary-light: #5FE3E3;
```

### Semantic Colors

**Success** (Green):

```css
--color-success: #4CAF50;
--color-success-dark: #388E3C;
--color-success-light: #66BB6A;
```

**Warning** (Amber):

```css
--color-warning: #FFA726;
--color-warning-dark: #F57C00;
--color-warning-light: #FFB74D;
```

**Error** (Red):

```css
--color-error: #EF5350;
--color-error-dark: #D32F2F;
--color-error-light: #F44336;
```

**Info** (Blue):

```css
--color-info: #29B6F6;
--color-info-dark: #0288D1;
--color-info-light: #4FC3F7;
```

### Player Colors

Standard TI4 player colors (from DATA_MODELS.md):

```css
--color-player-red: #D32F2F;
--color-player-blue: #1976D2;
--color-player-green: #388E3C;
--color-player-yellow: #FBC02D;
--color-player-purple: #7B1FA2;
--color-player-black: #424242;
--color-player-orange: #F57C00;
--color-player-pink: #C2185B;
```

### Shadows and Depth

No gradients, but use subtle shadows for depth:

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.5);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.5),
             0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5),
             0 4px 6px -2px rgba(0, 0, 0, 0.3);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5),
             0 10px 10px -5px rgba(0, 0, 0, 0.3);
```

### Bevels

For beveled edges (using box-shadow inset):

```css
--bevel-inset: inset 0 1px 0 0 rgba(255, 255, 255, 0.1),
               inset 0 -1px 0 0 rgba(0, 0, 0, 0.5);
```

---

## Typography

### Font Families

**Primary Font** (UI, body text):

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Monospace Font** (code, data, numbers):

```css
--font-mono: 'Roboto Mono', 'Courier New', monospace;
```

**Heading Font** (optional, if wanting more distinct headers):

```css
--font-heading: 'Rajdhani', 'Inter', sans-serif;
```

*(Rajdhani is a geometric sans-serif with a tech feel)*

### Font Sizes

```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
```

### Font Weights

```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights

```css
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Letter Spacing

```css
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
```

### Typography Usage

**Headings**:
```css
h1 { font-size: var(--text-4xl); font-weight: var(--font-bold); letter-spacing: var(--tracking-tight); }
h2 { font-size: var(--text-3xl); font-weight: var(--font-semibold); }
h3 { font-size: var(--text-2xl); font-weight: var(--font-semibold); }
h4 { font-size: var(--text-xl); font-weight: var(--font-medium); }
```

**Body**:
```css
body { font-size: var(--text-base); font-weight: var(--font-normal); line-height: var(--leading-normal); }
```

**Small Text / Labels**:
```css
.text-small { font-size: var(--text-sm); color: var(--color-text-secondary); }
```

---

## Spacing and Layout

### Spacing Scale

```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Layout Principles

1. **Grid System**: 12-column grid for responsive layouts
2. **Container Max Width**: 1440px for desktop, full-width for tablets/mobile
3. **Padding**: Consistent padding within panels (var(--space-4) to var(--space-6))
4. **Gaps**: Use gap properties for flex/grid layouts (var(--space-3) to var(--space-4))

### Breakpoints

```css
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */
--breakpoint-2xl: 1536px; /* Extra large desktop */
```

---

## Components

### Panel / Card

**Visual**: Rectangular container with beveled edges, subtle border

```css
.panel {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  box-shadow: var(--shadow-md), var(--bevel-inset);
  padding: var(--space-6);
}

.panel-elevated {
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-lg);
}
```

**Beveled Corner** (optional CSS trick):

```css
.panel-beveled {
  clip-path: polygon(
    8px 0, 100% 0, 100% calc(100% - 8px),
    calc(100% - 8px) 100%, 0 100%, 0 8px
  );
  /* Creates cut corners at top-left and bottom-right */
}
```

---

### Button

**Primary Button**:

```css
.button-primary {
  background: var(--color-accent-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-accent-primary-dark);
  padding: var(--space-3) var(--space-6);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  box-shadow: var(--shadow-sm);
  clip-path: polygon(4px 0, 100% 0, 100% calc(100% - 4px), calc(100% - 4px) 100%, 0 100%, 0 4px);
  transition: all 150ms ease;
}

.button-primary:hover {
  background: var(--color-accent-primary-light);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.button-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}
```

**Secondary Button**:

```css
.button-secondary {
  background: transparent;
  color: var(--color-accent-primary);
  border: 1px solid var(--color-accent-primary);
  /* ... rest similar to primary */
}

.button-secondary:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-accent-primary-light);
}
```

**Danger Button**:

```css
.button-danger {
  background: var(--color-error);
  border: 1px solid var(--color-error-dark);
  /* ... rest similar */
}
```

**Icon Button**:

```css
.button-icon {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-primary);
  padding: var(--space-2);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

### Input / Form Elements

**Text Input**:

```css
.input {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  color: var(--color-text-primary);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  width: 100%;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}

.input:focus {
  border-color: var(--color-accent-primary);
  outline: none;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}
```

**Select Dropdown**:

```css
.select {
  /* Similar to input, with custom dropdown arrow */
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* Custom arrow */
  background-position: right var(--space-3) center;
  background-repeat: no-repeat;
  padding-right: var(--space-10);
}
```

**Checkbox / Radio**:

```css
.checkbox {
  width: 20px;
  height: 20px;
  border: 1px solid var(--color-border-accent);
  background: var(--color-bg-primary);
  /* Custom styling for checked state */
}

.checkbox:checked {
  background: var(--color-accent-primary);
  border-color: var(--color-accent-primary-dark);
  /* Add checkmark icon */
}
```

---

### Modal / Dialog

**Overlay**:

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 20, 0.8);
  backdrop-filter: blur(4px);
  z-index: 1000;
}
```

**Modal Content**:

```css
.modal {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-accent);
  box-shadow: var(--shadow-xl);
  max-width: 600px;
  margin: auto;
  padding: var(--space-8);
  clip-path: polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px);
}

.modal-header {
  border-bottom: 1px solid var(--color-border-primary);
  padding-bottom: var(--space-4);
  margin-bottom: var(--space-6);
}
```

---

### Victory Point Bar

**Layout**: Horizontal bar at top of screen

```css
.vp-bar {
  background: var(--color-bg-secondary);
  border-bottom: 2px solid var(--color-border-accent);
  padding: var(--space-3);
  display: flex;
  gap: var(--space-6);
}

.vp-player {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.vp-indicator {
  display: flex;
  gap: var(--space-1);
}

.vp-dot {
  width: 12px;
  height: 12px;
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-primary);
  clip-path: polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px);
}

.vp-dot.filled {
  background: var(--player-color); /* Dynamic based on player color */
  border-color: var(--player-color);
}
```

---

### Strategy Card

**Visual**: Rectangular card with beveled corners, card number prominent

```css
.strategy-card {
  width: 120px;
  height: 160px;
  background: var(--color-bg-tertiary);
  border: 2px solid var(--color-border-primary);
  clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  cursor: pointer;
  transition: all 150ms ease;
  position: relative;
}

.strategy-card:hover {
  border-color: var(--color-accent-primary);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.strategy-card.selected {
  border-color: var(--color-accent-secondary);
  opacity: 0.6;
  pointer-events: none;
}

.strategy-card-number {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  color: var(--color-accent-primary);
  font-family: var(--font-mono);
}

.strategy-card-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
  margin-top: var(--space-2);
}

.strategy-card-bonus {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  background: var(--color-warning);
  color: var(--color-bg-primary);
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
}
```

---

### Phase Indicator

**Visual**: Panel showing current round and phase

```css
.phase-indicator {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-accent);
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.phase-round {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-accent-secondary);
  font-family: var(--font-mono);
}

.phase-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.phase-divider {
  width: 2px;
  height: 30px;
  background: var(--color-border-accent);
}
```

---

### Player Card

**Visual**: Compact card showing player info (color, faction, VP, etc.)

```css
.player-card {
  background: var(--color-bg-secondary);
  border-left: 4px solid var(--player-color); /* Dynamic */
  padding: var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.player-card.active {
  background: var(--color-bg-tertiary);
  border-left-width: 6px;
  box-shadow: var(--shadow-md);
}

.player-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.player-icon {
  width: 40px;
  height: 40px;
  /* Faction icon */
}

.player-name {
  font-weight: var(--font-semibold);
}

.player-vp {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--color-accent-primary);
  font-family: var(--font-mono);
}
```

---

### Toast / Notification

**Visual**: Slide-in panel for notifications

```css
.toast {
  position: fixed;
  bottom: var(--space-4);
  right: var(--space-4);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-accent);
  box-shadow: var(--shadow-lg);
  padding: var(--space-4) var(--space-6);
  max-width: 400px;
  animation: slideIn 200ms ease;
}

.toast.success { border-left: 4px solid var(--color-success); }
.toast.error { border-left: 4px solid var(--color-error); }
.toast.info { border-left: 4px solid var(--color-info); }

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

## Iconography

### Icon Style

- **Line icons** (not filled)
- **1.5px - 2px stroke width**
- **Sharp corners** (no rounded line caps)
- **Consistent sizing**: 16px, 20px, 24px
- **Monochrome** (colored via CSS)

### Icon Library Recommendation

**Heroicons** (outline variant) or **Lucide Icons**
- Modern, clean, consistent
- Easily customizable
- Large library

### Custom Icons

For game-specific icons (faction symbols, strategy cards, etc.):
- **SVG format**
- **Vectorized** for scalability
- **Consistent stroke width**
- **Optimized** (minimal path points)

---

## Animations and Transitions

### Principles

1. **Fast and Snappy**: 100-200ms for most transitions
2. **Purposeful**: Animations should communicate state changes
3. **Subtle**: Not distracting from gameplay
4. **Hardware Accelerated**: Use transform and opacity when possible

### Transition Timings

```css
--transition-fast: 100ms;
--transition-normal: 150ms;
--transition-slow: 300ms;
```

### Easing Functions

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Animations

**Hover Lift**:
```css
.button:hover {
  transform: translateY(-2px);
  transition: transform var(--transition-normal) var(--ease-out);
}
```

**Fade In**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn var(--transition-normal) var(--ease-out);
}
```

**Slide In**:
```css
@keyframes slideInRight {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
```

**Pulse** (for attention):
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
}
```

---

## Responsive Design

### Mobile (< 768px)

- **Single column layouts**
- **Full-width panels**
- **Larger touch targets** (min 44x44px)
- **Simplified navigation** (hamburger menu)
- **Condensed information** (hide non-essential details)

### Tablet (768px - 1024px)

- **Two-column layouts** where appropriate
- **Side navigation** (not hamburger)
- **Moderate information density**

### Desktop (> 1024px)

- **Multi-column layouts**
- **Full information display**
- **Persistent navigation**
- **Hover states** and tooltips

### Responsive Patterns

**Container Queries** (when supported):
```css
@container (min-width: 400px) {
  .player-card {
    flex-direction: row;
  }
}
```

**Media Queries**:
```css
@media (max-width: 768px) {
  .vp-bar {
    flex-direction: column;
  }
}
```

---

## Accessibility

### Principles

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Focus Indicators**: Clear focus states
3. **Color Contrast**: WCAG AA minimum (4.5:1 for normal text)
4. **Screen Reader Support**: Proper ARIA labels
5. **Semantic HTML**: Use appropriate HTML5 elements

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-accent-primary);
  outline-offset: 2px;
}
```

### ARIA Labels

```html
<button aria-label="Select Leadership strategy card">
  <img src="leadership.svg" alt="" />
</button>

<div role="region" aria-labelledby="vp-bar-heading">
  <h2 id="vp-bar-heading" class="sr-only">Victory Points</h2>
  <!-- VP bar content -->
</div>
```

### Screen Reader Only Text

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Skip Links

```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

```css
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--color-accent-primary);
  color: var(--color-bg-primary);
  padding: var(--space-2) var(--space-4);
  z-index: 10000;
}

.skip-link:focus {
  top: 0;
}
```

---

## Summary

This design system provides:
- **Consistent visual language** across the application
- **Sci-fi aesthetic** with minimalist principles
- **Sharp, angular design** with beveled edges
- **Accessible and responsive** components
- **Performance-conscious** animations
- **Scalable and maintainable** CSS architecture

**Implementation Approach**:
1. Define CSS variables (or styled-components theme)
2. Build component library following these guidelines
3. Test across devices and accessibility tools
4. Iterate based on user feedback

The design should feel like a **starship control panel** - functional, informative, and appropriately futuristic without being over-the-top.
