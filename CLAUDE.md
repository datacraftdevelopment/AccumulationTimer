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

1. **Time Mode**: Uses a high-precision timer (100ms updates) to track hold duration. Users "bail out" when they can't hold any longer. Time accumulated = hold duration + adjustment.

2. **Reps Mode**: No active timer during sets. Users perform reps, then manually input the count. Reps accumulated = entered reps + adjustment.

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
- `attempts`: Array of attempt objects with value, bonus (adjustment), total, timestamp
- `appState`: 'setup' | 'training' | 'resting' | 'complete' - Current screen state
- `restCountdown`: Remaining rest seconds
- `config`: { mode, target, restTime, bonus (adjustment) } - Training configuration

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
  SetupScreen.tsx           - Mode selection + configuration with About button
  TimeTrainingScreen.tsx    - Timer-based training with Reset button (time mode)
  RepsTrainingScreen.tsx    - Manual rep entry with Reset button (reps mode)
  RestScreen.tsx            - Shared rest countdown with Skip Rest and audio cues (both modes)
  CompletionScreen.tsx      - Results summary with scrollable history (both modes)
  RepInputModal.tsx         - Rep count input (reps mode only)
  AboutModal.tsx            - Usage instructions and tips modal

/lib
  utils.ts          - Formatting functions (seconds, reps, time display)
  audio.ts          - Web Audio API functions (warning and completion beeps)
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

## Key Features

### Audio Feedback
- **Warning Beep**: Plays at 3 seconds remaining during rest (600Hz, 150ms)
- **Completion Beep**: Plays when rest countdown reaches 0 (1000Hz, 300ms)
- Uses Web Audio API for lightweight sound generation
- Graceful fallback if audio not supported

### User Controls
- **Skip Rest**: Button on RestScreen to immediately start next set
- **Reset**: Confirmation dialog on training screens to restart session
- **About Modal**: Info button on SetupScreen with usage instructions

### Terminology
- **Adjustment (not "bonus")**: Time/reps added per set to compensate for transition time
  - Example: 3-4 seconds to account for getting in/out of position during bailouts
  - User configurable - can be 0 if no adjustment needed
  - Applied as: `totalAdded = setValue + adjustment`

### Screen Consistency
- All screens use `h-screen` for fixed viewport height (iOS app conversion)
- CompletionScreen has scrollable attempt history within fixed container
- Progress displays use larger text (2xl font) for better visibility

## Critical Implementation Details

### Audio Implementation
```typescript
// lib/audio.ts
export function playBeep(frequency: number, duration: number) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}
```

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

- **Viewport**: Full-screen height (`h-screen`), no horizontal scroll
- **Touch targets**: Minimum 60px height for all buttons
- **Font sizes**:
  - Active timers: 8xl (5rem)
  - Rest countdown: 9xl (8rem)
  - Progress text: 2xl (1.5rem) - enlarged for better visibility
  - Labels: base to xl (1-1.25rem)
  - About modal: Responsive with scrollable content
- **Visual states**: Clear color differentiation
  - Setup screen: Gray (#1f2937)
  - Active (time mode): Green (#10b981)
  - Active (reps mode): Blue (#3b82f6)
  - Resting: Orange (#f59e0b)
  - Complete: Blue (#2563eb)
- **Screen consistency**: All screens use `h-screen` for iOS app conversion
- **Scrolling**: Only CompletionScreen attempt history scrolls (within fixed container)

## Mode-Specific Behaviors

### Time Mode
- Start timer automatically when set begins
- Show live timer with decimal precision (e.g., "47.3s")
- "Bail Out" button stops timer and adds hold time + adjustment
- "Reset" button (with confirmation) to restart entire session
- Format display: Simple seconds (e.g., "15s", "60s")
- Larger progress section shows accumulated/target/remaining (2xl font)

### Reps Mode
- NO automatic timer during set
- Display accumulated/target (e.g., "12 / 20 reps")
- "Done With Set" button opens rep input modal
- "Reset" button (with confirmation) to restart entire session
- Rep input modal:
  - Auto-focus numeric input
  - Auto-open keyboard on mobile
  - Large input field and button
  - Cancel option (don't log set)
- After submitting reps: add entered reps + adjustment to total
- Larger progress section shows accumulated/target/remaining (2xl font)

### Rest Screen (Both Modes)
- Countdown display with large numbers (9xl font)
- Audio cues: warning beep at 3s, completion beep at 0s
- "Skip Rest" button to immediately start next set
- Progress summary shows current progress toward target
- Auto-transitions to next set when countdown reaches 0

## Edge Cases to Handle

1. **Very short holds/sets**: Don't allow bail/done in first second (prevents accidents)
2. **Invalid rep input**: Reject 0, negative, or non-numeric values
3. **Timer cleanup**: Clear all intervals/timeouts on unmount
4. **Mode defaults**: Time mode (target: 60s, adjustment: 5s), Reps mode (target: 20, adjustment: 2)
5. **Background handling**: Pause active timers, preserve state on return
6. **Rapid completion**: If user exceeds target significantly, still show correct final total
7. **Reset confirmation**: Always confirm before resetting to prevent accidental data loss
8. **Skip rest safety**: Allow skipping rest at any time without confirmation
9. **Audio playback**: Handle browsers that block autoplay (iOS requires user interaction first)
10. **Adjustment can be 0**: Rest time and adjustment fields accept 0 values

## Deployment

Deploy to Vercel:
```bash
# Production deployment
git add -A && git commit -m "your message"
git push
vercel --prod --yes
```

**Current Deployment:**
- GitHub: https://github.com/datacraftdevelopment/AccumulationTimer
- Production: https://accumulation-timer-9efdmtf8v-joe-5771s-projects.vercel.app

**Testing Checklist:**
- Test on actual iPhone/mobile device
- Verify audio cues work (may require user interaction first on iOS)
- Test WakeLock prevents screen sleep during training
- Verify all screens are fixed height (h-screen) without scrolling issues
- Test About modal provides clear usage instructions
- Confirm Reset confirmation prevents accidental data loss
- Test Skip Rest button transitions immediately

## Reference Documentation

See `Scope.md` for complete functional specification including:
- Detailed user flows for both modes
- Complete state management requirements
- UI/UX specifications
- Example training sessions
- Full testing checklist
