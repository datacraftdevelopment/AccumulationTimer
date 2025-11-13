# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Accumulation Timer is a mobile-optimized web application for accumulation training (cluster sets/rest-pause training). It supports both **time-based** (seconds) and **rep-based** training modes with automatic rest periods.

**Tech Stack:**
- Next.js 16+ (App Router) with React 19
- Tailwind CSS 3+
- TypeScript 5+
- Vercel deployment
- lucide-react icons
- Web Audio API for sound effects

## Key Architecture Concepts

### Dual-Mode Operation

The app has two fundamentally different training modes that share some components but differ in core behavior:

1. **Time Mode**: Uses a high-precision timer (100ms updates) to track hold duration. Users "bail out" when they can't hold any longer. **Time counted = hold duration - adjustment** (adjustment represents transition time that doesn't count toward goal). Example: 10s hold with 5s adjustment = 5s counted.

2. **Reps Mode**: No active timer during sets. Users perform reps, then manually input the count. **Reps counted = entered reps + adjustment** (adjustment is bonus reps added). Example: 10 reps with 2 adjustment = 12 counted.

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
- `attempts`: Array of attempt objects with value, adjustment, total, timestamp
- `appState`: 'setup' | 'training' | 'resting' | 'complete' - Current screen state
- `restCountdown`: Remaining rest seconds
- `config`: { mode, target, restTime, adjustment } - Training configuration

### Timer Precision Requirements

**Time Mode Hold Timer:**
- Must use `Date.now()` for precision (not `setTimeout` intervals alone)
- Update display every 100ms for smooth visual feedback
- Calculate elapsed time as `(Date.now() - startTime) / 1000`
- **Live Progress Calculation (during hold)**:
  ```typescript
  const currentCounted = Math.max(0, currentValue - bonus);
  const liveTotal = totalAccumulated + currentCounted;
  const remaining = Math.max(0, target - liveTotal);
  const progressPercent = Math.min(100, (liveTotal / target) * 100);
  ```
- **Display Synchronization**: Use `formatSecondsWithDecimal` for all live values (timer, progress, remaining) to prevent visual lag

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

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # Run ESLint
```

### Testing Strategy
Since this is a single-session training app with no data persistence, testing focuses on:
- Manual testing on mobile devices (especially iPhone Safari)
- Timer accuracy verification (time mode)
- State transition verification (all modes)
- Edge cases: rapid button presses, backgrounding app, very short/long values
- Audio functionality (may require user interaction on iOS)

## Key Features

### Audio Feedback
- **Warning Beep**: Plays at 3 seconds remaining during rest (600Hz, 150ms)
- **Completion Beep**: Plays when rest countdown reaches 0 (1000Hz, 300ms)
- Uses Web Audio API for lightweight sound generation
- Graceful fallback if audio not supported

### User Controls
- **Skip Rest**: Button on RestScreen to immediately start next set
- **Reset**: Confirmation dialog on training screens to restart session
- **Stop** (Time mode only): End session early with full time counted (no adjustment penalty)
- **About Modal**: Info button on SetupScreen with usage instructions

### Live Progress (Time Mode)
- **Real-time Updates**: Progress bar and totals update every 100ms during active holds
- **Synchronized Display**: Timer, progress bar, and remaining time all use decimal precision
- **Visual Feedback**: See exactly when you'll hit your target before bailing out
- **Calculation**: Progress includes current hold minus adjustment (`Math.max(0, currentValue - adjustment)`)

### Terminology
- **Adjustment**: Behaves differently per mode
  - **Time Mode**: Penalty/deduction representing transition time that doesn't count toward goal
    - Example: 10s hold with 5s adjustment = only 5s counts toward target
    - Applied as: `timeCounted = Math.max(0, holdTime - adjustment)`
    - Set to 0 if you want full hold time to count
  - **Reps Mode**: Bonus added to reward completing a set
    - Example: 10 reps with 2 adjustment = 12 reps count toward target
    - Applied as: `repsCounted = reps + adjustment`

### Screen Consistency
- All screens use `h-screen` for fixed viewport height (iOS app conversion)
- CompletionScreen has scrollable attempt history within fixed container
- Progress displays use larger text (2xl font) for better visibility

## Critical Implementation Details

### Audio Implementation
The app uses Web Audio API to generate lightweight beeps without audio files:

```typescript
// lib/audio.ts - playBeep function
// Creates sine wave oscillator at specified frequency and duration
// Warning beep: 600Hz, 150ms at 3 seconds remaining
// Completion beep: 1000Hz, 300ms when countdown reaches 0
// Volume: 0.3 (30% gain)

export function playBeep(frequency: number, duration: number) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.frequency.value = frequency;
  oscillator.type = "sine";
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration / 1000);
}
```

**Important**: iOS Safari may block autoplay. Audio will work after first user interaction.

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
- **Live Progress Updates**: Progress bar and accumulated time update in real-time during hold (not just after bail)
  - Calculates: `currentCounted = Math.max(0, currentValue - adjustment)`
  - Shows: `liveTotal = totalAccumulated + currentCounted`
  - All displays use decimal precision to stay synchronized with timer
- **Two Action Buttons**:
  - **"Bail Out"** (orange): Stops timer, applies adjustment penalty, continues to rest period
    - Calculation: **hold time - adjustment = time counted**
    - Adjustment represents transition time that doesn't count
  - **"Stop"** (red): Ends session immediately with full time counted (no adjustment penalty)
    - Calculation: full hold time counts toward total
    - Goes directly to completion screen
- **Dynamic Button Display**:
  - Before reaching target: Shows both "Bail Out" and "Stop" buttons
  - After reaching target: Shows only "Stop" button
- "Reset" button (with confirmation) to restart entire session
- Format display: Decimal seconds for live values (e.g., "47.3s"), simple seconds for target (e.g., "60s")

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
11. **Adjustment >= hold time (time mode)**: If adjustment is greater than or equal to hold time, 0 seconds are counted (uses Math.max to prevent negative values)
12. **Stop vs Bail Out (time mode)**:
    - Bail Out: Applies adjustment penalty, continues session (goes to rest if target not reached)
    - Stop: No adjustment penalty, always ends session immediately (goes to completion screen)
    - Stop button behavior logged with `bonus: 0` in attempts array
13. **Live progress calculations**: Progress updates use same timer precision (100ms) to stay synchronized
14. **Target reached display**: When live progress shows target reached, only Stop button is shown (hides Bail Out)

## Deployment

Deploy to Vercel (configured via vercel.json):
```bash
# Push to trigger automatic deployment
git add -A && git commit -m "your message"
git push

# Or manual deployment
vercel --prod --yes
```

The project is configured to deploy automatically from the main branch via Vercel integration.

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

## Cloud Persistence & Data Management (NEW)

The app has evolved from a single-session timer to a full **Accumulation Tracker** with cloud persistence using Airtable.

### Airtable Integration

**Database Schema** (AI_Test base: appKNnqnplJrCPua3):

**Exercises Table**:
- Stores exercise presets (Straight Handstand, Tuck, Straddle, Pike, etc.)
- Fields: name, mode, default_target, default_rest_time, default_adjustment
- Users can create, edit, and delete exercises via ExercisesScreen

**Sessions Table**:
- Records each completed training session
- Fields: exercise_name, mode, target, rest_time, adjustment, total_accumulated, session_duration, attempt_count, completed_at
- Auto-saved when user completes a session (CompletionScreen.tsx)

**Attempts Table**:
- Individual sets within each session
- Fields: session_ref, attempt_number, value, adjustment, total_counted
- Batch-created when session is saved

### Service Layer (`lib/airtable.ts`)

Uses Airtable Web API directly (no SDK required) for lightweight integration:

```typescript
// Environment variables (NEXT_PUBLIC_ prefix for client-side access)
NEXT_PUBLIC_AIRTABLE_BASE_ID=appKNnqnplJrCPua3
NEXT_PUBLIC_AIRTABLE_API_KEY=patXXXXXXXXXXXXX

// Key functions:
- getExercises() / createExercise() / updateExercise() / deleteExercise()
- getSessions() / createSession()
- getAttempts() / createAttempts()
- getExerciseStats() / getAllExerciseStats()
```

**Performance Metrics Calculated**:
- Best session per exercise
- Average accumulated (mean of all sessions)
- Average attempts and session duration
- Trend analysis (last 5 sessions vs previous 5 sessions):
  - Improving: >5% improvement
  - Declining: <-5% decline
  - Stable: within ±5%

### New Screen Architecture

**App State Flow**:
```
Setup Screen → Exercises Screen (manage presets)
             → History Screen (view stats)
             → Training Screen (timer/reps)
             → Rest Screen
             → Completion Screen (auto-save to Airtable)
             → Setup Screen (new session)
```

**Component Structure** (updated):
```
/components
  SetupScreen.tsx           - Exercise selection + quick actions
  ExercisesScreen.tsx       - CRUD for exercise presets
  HistoryScreen.tsx         - Stats overview + session history
  TimeTrainingScreen.tsx    - Timer-based training (unchanged)
  RepsTrainingScreen.tsx    - Manual rep entry (unchanged)
  RestScreen.tsx            - Shared rest countdown (unchanged)
  CompletionScreen.tsx      - Results + auto-save to Airtable
  RepInputModal.tsx         - Rep count input (unchanged)
  AboutModal.tsx            - Usage instructions (unchanged)

/lib
  utils.ts                  - Formatting functions (unchanged)
  audio.ts                  - Web Audio API (unchanged)
  airtable.ts               - NEW: Airtable service layer
```

### Key Features Added

1. **Exercise Presets**: Users can save favorite exercises with default settings
2. **Cloud Storage**: All sessions automatically saved to Airtable
3. **History & Analytics**:
   - Overview: Total sessions, weekly/monthly volume, per-exercise performance
   - Exercise Details: Full session history with timestamps
   - Trends: Visual indicators for improving/declining/stable performance
4. **No Authentication**: Single-user app (personal use only)

### Data Privacy

- No user authentication required (simpler for personal use)
- Airtable API key stored in `.env.local` (never committed to git)
- Anyone with the URL can access the app and data
- Suitable for personal training tracking

### Development Workflow

```bash
# Initial setup
npm install
# Add Airtable API key to .env.local
npm run dev

# Deployment (Vercel)
# Set environment variables in Vercel dashboard
vercel --prod --yes
```

### Critical Implementation Notes

1. **Client-Side API Calls**: All Airtable calls happen from browser (no server-side route needed)
2. **Auto-Save on Completion**: CompletionScreen saves session immediately on mount
3. **Graceful Degradation**: If save fails, user still sees results (no blocking)
4. **Exercise Selection**: SetupScreen loads exercises on mount and pre-fills first exercise
5. **Stats Calculation**: Trend analysis requires ≥6 sessions to compare recent vs previous performance

### Testing Checklist (Updated)

- [ ] Exercise CRUD operations work (create, edit, delete)
- [ ] SetupScreen loads exercises from Airtable
- [ ] Session saves to Airtable on completion
- [ ] History screen shows accurate stats
- [ ] Trend indicators calculated correctly
- [ ] All original timer functionality still works
- [ ] Works offline after initial load (PWA)
- [ ] Airtable API key not exposed in client code
- [ ] .env.local not committed to git

### Deployment Considerations

**Environment Variables**:
- Must set `NEXT_PUBLIC_AIRTABLE_BASE_ID` and `NEXT_PUBLIC_AIRTABLE_API_KEY` in Vercel
- Base ID: appKNnqnplJrCPua3 (AI_Test base)
- API key: Create at https://airtable.com/create/tokens with scopes:
  - `data.records:read`
  - `data.records:write`
  - `schema.bases:read`

**Mobile PWA**:
- Add to iOS home screen for app-like experience
- Works offline after initial load (Next.js caching)
- Screen wake lock still prevents sleep during training

See `SETUP.md` for user-facing setup instructions.
