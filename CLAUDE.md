# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Accumulation Timer is a mobile-optimized web application for accumulation training (cluster sets/rest-pause training). It supports both **time-based** (seconds) and **rep-based** training modes with automatic rest periods.

**Tech Stack:**
- Next.js with React
- Tailwind CSS
- TypeScript
- Vercel deployment
- lucide-react icons

## Key Architecture Concepts

### Dual-Mode Operation

The app has two fundamentally different training modes that share some components but differ in core behavior:

1. **Time Mode**: Uses a high-precision timer (100ms updates) to track hold duration. Users "bail out" when they can't hold any longer. Time accumulated = hold duration + bonus.

2. **Reps Mode**: No active timer during sets. Users perform reps, then manually input the count. Reps accumulated = entered reps + bonus.

**Shared behavior**: Both modes use identical rest period countdown (1-second intervals) and completion logic.

### State Architecture

The application uses React state management across several screens. Key state must flow between:
- SetupScreen → TrainingScreen (initial configuration)
- TrainingScreen → RestScreen (accumulated progress, attempt count)
- RestScreen → TrainingScreen (auto-transition when rest ends)
- Any screen → CompletionScreen (when target is reached)

Critical state variables:
- `mode`: 'time' | 'reps' - Determines which training screen and logic to use
- `totalAccumulated`: Running sum of all completed sets (seconds or reps)
- `attempts`: Array of attempt objects with value, bonus, total, timestamp
- `isActive`: Currently in an active set
- `isResting`: Currently in rest period
- `restCountdown`: Remaining rest seconds

### Timer Precision Requirements

**Time Mode Hold Timer:**
- Must use `Date.now()` for precision (not `setTimeout` intervals alone)
- Update display every 100ms for smooth visual feedback
- Calculate elapsed time as `(Date.now() - startTime) / 1000`

**Rest Countdown Timer (Both Modes):**
- Simple 1-second intervals using `setTimeout` or `setInterval`
- Auto-transition to next set when countdown reaches 0
- Must clean up timers in useEffect cleanup functions

### Component Structure

```
/app
  page.tsx          - Main app with mode routing logic
  layout.tsx        - Root layout with metadata
  globals.css       - Tailwind imports and custom styles

/components
  SetupScreen.tsx           - Mode selection + configuration
  TimeTrainingScreen.tsx    - Timer-based training (time mode)
  RepsTrainingScreen.tsx    - Manual rep entry (reps mode)
  RestScreen.tsx            - Shared rest countdown (both modes)
  CompletionScreen.tsx      - Results summary (both modes)
  RepInputModal.tsx         - Rep count input (reps mode only)

/lib
  utils.ts          - Formatting functions (seconds, reps, time display)
```

## Common Development Commands

### Initial Setup
```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install icons library
npm install lucide-react
```

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # Run ESLint
```

### Testing
Since this is a single-session training app with no data persistence, testing should focus on:
- Manual testing on mobile devices (especially iPhone Safari)
- Timer accuracy verification (time mode)
- State transition verification (all modes)
- Edge cases: rapid button presses, backgrounding app, very short/long values

## Critical Implementation Details

### WakeLock API
Prevent screen sleep during active training:
```javascript
let wakeLock = null;
try {
  wakeLock = await navigator.wakeLock.request('screen');
} catch (err) {
  // Not critical - continue without wakeLock
}
```

### Page Visibility API
Pause timers when app is backgrounded:
```javascript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause timers
    } else {
      // Resume or recalculate
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### Completion Detection
Check if target is reached BEFORE starting rest period:
```javascript
if (totalAccumulated + totalAdded >= target) {
  setIsComplete(true);
} else {
  setIsResting(true);
  setRestCountdown(restTime);
}
```

## Mobile Optimization Requirements

- **Viewport**: Full-screen height, no horizontal scroll
- **Touch targets**: Minimum 60px height for all buttons
- **Font sizes**:
  - Active timers: 5-8rem
  - Rest countdown: 6-10rem
  - Labels: 1.5rem
- **Visual states**: Clear color differentiation
  - Active (time mode): Green (#10b981)
  - Active (reps mode): Blue or distinct color
  - Resting: Orange (#f59e0b)
  - Complete: Blue (#3b82f6)

## Mode-Specific Behaviors

### Time Mode
- Start timer automatically when set begins
- Show live timer with decimal precision (e.g., "47.3s")
- "Bail Out" button stops timer and adds hold time + bonus
- Format display: Simple seconds (e.g., "15s", "60s")

### Reps Mode
- NO automatic timer during set
- Display accumulated/target (e.g., "12 / 20 reps")
- "Done With Set" button opens rep input modal
- Rep input modal:
  - Auto-focus numeric input
  - Auto-open keyboard on mobile
  - Large input field and button
  - Cancel option (don't log set)
- After submitting reps: add entered reps + bonus to total

## Edge Cases to Handle

1. **Very short holds/sets**: Don't allow bail/done in first second (prevents accidents)
2. **Invalid rep input**: Reject 0, negative, or non-numeric values
3. **Timer cleanup**: Clear all intervals/timeouts on unmount
4. **Mode defaults**: Time mode (target: 60s, bonus: 5s), Reps mode (target: 20, bonus: 2)
5. **Background handling**: Pause active timers, preserve state on return
6. **Rapid completion**: If user exceeds target significantly, still show correct final total

## Deployment

Deploy to Vercel:
```bash
# Vercel CLI (if installed)
vercel

# Or connect GitHub repo to Vercel dashboard
# Ensure mobile viewport meta tags are set in layout.tsx
```

Test on actual iPhone/mobile device before considering complete.

## Reference Documentation

See `Scope.md` for complete functional specification including:
- Detailed user flows for both modes
- Complete state management requirements
- UI/UX specifications
- Example training sessions
- Full testing checklist
