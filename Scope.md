# Accumulation Timer - Claude Code Project Scope

## Project Overview
Build a mobile-optimized web application for accumulation training (also known as cluster sets or rest-pause training) that supports both time-based (seconds) and rep-based training with automatic rest periods and configurable parameters.

## Design Inspiration
Reference: Repeat Timer Pro app
- Clean card-based layout for different training screens
- Large, readable timers (white on dark background)
- Bold action buttons at bottom (orange for secondary, green for primary actions)
- Minimal chrome, focus on the timer/progress
- Dark theme overall

## Tech Stack
- **Framework:** Next.js with React
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Icons:** lucide-react

## Setup/Configuration Screen

### Mode Selection
**Training Mode** (radio buttons or toggle)
- **Time** (default)
- **Reps**

This changes the labels and behavior throughout the app.

### Input Fields

1. **Target** (number input)
   - Label: "Target" (if Time mode: "Target Seconds", if Reps mode: "Target Reps")
   - Default: 60 (for time), 20 (for reps)
   - Min: 1
   - Plain number input, no time formatting

2. **Rest Time** (number input, always in seconds)
   - Label: "Rest Time (seconds)"
   - Default: 15 seconds
   - Min: 5 seconds
   - Plain number input

3. **Bonus** (number input)
   - Label: "Bonus Per Bail" (if Time: "Bonus Seconds", if Reps: "Bonus Reps")
   - Default: 5 (for time), 2 (for reps)
   - Min: 0
   - Help text: "Added to your total when you bail out"

### Start Button
- Large, prominent button: "Start Training"
- Transitions to training screen based on selected mode
- Stores settings and mode for the session

## Training Screen

### State Management
Track the following states:
- `mode`: 'time' | 'reps' (from setup)
- `target`: number (from setup)
- `restTime`: number (from setup, always seconds)
- `bonus`: number (from setup)
- `totalAccumulated`: number (seconds or reps accumulated)
- `currentValue`: number (current hold duration in seconds OR current set in progress)
- `isActive`: boolean (currently in active set)
- `isResting`: boolean (in rest period)
- `restCountdown`: number (rest seconds remaining)
- `attempts`: array of objects `[{ value, bonus, timestamp }]`
- `sessionStartTime`: timestamp

### Active Set View - TIME MODE

**Display Elements:**
- Current hold timer (large, 5rem+ font size)
  - Updates every 100ms for smooth display
  - Format: Just seconds (e.g., "47s" or "47.3s")

- Progress section:
  - "Accumulated: XXs / Target: XXs"
  - Progress bar (visual percentage)
  - Remaining: XXs

- Attempt counter: "Attempt #X"

**Bail Out Button:**
- Large button (min 80px height)
- Text: "Bail Out"
- Color: Red/orange
- On press (TIME mode):
  1. Stop current timer
  2. Calculate: `currentValue + bonus`
  3. Add to `totalAccumulated`
  4. Add attempt to history
  5. Transition to rest state

### Active Set View - REPS MODE

**Display Elements:**
- Large display showing progress (5rem+ font)
  - "12 / 20 reps"
  - Or "12 reps accumulated"

- Progress section:
  - "Accumulated: XX / Target: XX"
  - Progress bar (visual percentage)
  - Remaining: XX reps

- Attempt counter: "Attempt #X"

**Done With Set Button:**
- Large button (min 80px height)
- Text: "Done With Set"
- Color: Red/orange
- On press (REPS mode):
  1. Show rep input modal/screen
  2. Large number input field (numeric keyboard)
  3. Placeholder: "How many reps?"
  4. Button: "Add Reps & Rest"
  5. On submit:
     - Calculate: `enteredReps + bonus`
     - Add to `totalAccumulated`
     - Add attempt to history
     - Close input
     - Transition to rest state

**Rep Input Modal:**
- Appears over current screen (or transitions to input screen)
- Large numeric input (focus auto-set, keyboard auto-opens)
- Previous display faded in background
- Single action button: "Add Reps & Rest" (or just "Continue")
- Cancel option to go back without logging

### Rest Period View
**Display Elements:**
- Large "REST" heading
- Countdown timer (very large, 6rem+ font)
  - Format: 0:XX
  - Updates every second
  - Visual countdown indicator (circular or bar)

- Show accumulated progress:
  - "Accumulated: XX:XX / XX:XX"
  - Progress bar

- "Next hold starts in..." message

**Auto-Transition:**
- When countdown reaches 0:
  - Automatically start next hold
  - Reset `currentHold` to 0
  - Set `isHolding` to true

### Completion View
**Trigger:** When `totalAccumulated >= target`

**Display Elements:**
- "Goal Complete!" heading with celebration styling
- Total accumulated: "XXs" (time mode) or "XX reps" (reps mode)
- Total attempts: number
- Session duration: MM:SS (wall clock time for the whole session)

**Attempt History Table:**

TIME MODE:
```
Attempt | Hold Time | Bonus | Total Added
   1    |    10s    |   5s  |     15s
   2    |    12s    |   5s  |     17s
   3    |    20s    |   5s  |     25s
```

REPS MODE:
```
Attempt | Reps | Bonus | Total Added
   1    |  5   |   2   |      7
   2    |  6   |   2   |      8
   3    |  4   |   2   |      6
```

**Actions:**
- "New Session" button → Return to setup screen
- "Share Results" button (optional, copies stats to clipboard)

## Timer Implementation Details

### Hold Timer (TIME MODE ONLY)
```javascript
// Use Date.now() for precision
const startTime = Date.now();
const interval = setInterval(() => {
  const elapsed = (Date.now() - startTime) / 1000;
  setCurrentValue(elapsed);
}, 100); // Update every 100ms for smooth display
```

### Rep Mode (NO TIMER NEEDED)
- Just display current accumulated reps
- Wait for user to press "Done With Set"
- Show input for number of reps completed
- Add to total and start rest

### Rest Timer (BOTH MODES)
```javascript
// Simple countdown, same for both modes
useEffect(() => {
  if (isResting && restCountdown > 0) {
    const timer = setTimeout(() => {
      setRestCountdown(restCountdown - 1);
    }, 1000);
    return () => clearTimeout(timer);
  } else if (isResting && restCountdown === 0) {
    startNextSet();
  }
}, [isResting, restCountdown]);
```

## Mobile Optimization

### Layout
- Full-screen viewport height
- Single column layout
- Large touch targets (min 60px)
- No horizontal scrolling

### Fonts
- Timer displays: 5-8rem
- Countdown: 6-10rem
- Labels: 1.5rem
- Body text: 1rem

### Colors (Suggestion)
- **Holding:** Green background (#10b981)
- **Resting:** Orange background (#f59e0b)
- **Complete:** Blue background (#3b82f6)
- **Setup:** Neutral (gray/white)

### Prevent Sleep
Add wakeLock API to prevent screen from sleeping during training:
```javascript
let wakeLock = null;
try {
  wakeLock = await navigator.wakeLock.request('screen');
} catch (err) {
  // Fallback: not critical
}
```

## User Experience Flow

### TIME MODE EXAMPLE
```
1. Setup Screen
   ↓ [Mode: Time, Target: 60s, Rest: 15s, Bonus: 5s]
   ↓ [Press "Start Training"]
   
2. Hold #1 Starts Automatically
   → Timer: 0s, 1s, 2s... 10s
   ↓ [User presses "Bail Out"]
   → Accumulated: 15s (10s + 5s bonus)
   
3. Rest Period
   → Countdown: 15, 14, 13... 1, 0
   ↓ [Auto-start]
   
4. Hold #2 Starts
   → Timer: 0s, 1s, 2s... 12s
   ↓ [User presses "Bail Out"]
   → Accumulated: 32s (15s + 12s + 5s bonus)
   
5. Rest Period
   → Countdown: 15, 14... 0
   ↓ [Auto-start]
   
6. Continue until accumulated >= 60s
   
7. Completion Screen
   → Show summary and "New Session" option
```

### REPS MODE EXAMPLE
```
1. Setup Screen
   ↓ [Mode: Reps, Target: 20, Rest: 30s, Bonus: 2]
   ↓ [Press "Start Training"]
   
2. Set #1 Ready
   → Display: "0 / 20 reps"
   → User does push-ups
   ↓ [User presses "Done With Set"]
   → Input appears: "How many reps?"
   ↓ [User enters "5", presses "Add Reps & Rest"]
   → Accumulated: 7 reps (5 + 2 bonus)
   
3. Rest Period
   → Countdown: 30, 29, 28... 1, 0
   ↓ [Auto-start]
   
4. Set #2 Ready
   → Display: "7 / 20 reps"
   → User does more push-ups
   ↓ [User presses "Done With Set"]
   → Input: "How many reps?"
   ↓ [User enters "6", presses button]
   → Accumulated: 15 reps (7 + 6 + 2 bonus)
   
5. Rest Period
   → Countdown: 30, 29... 0
   ↓ [Auto-start]
   
6. Set #3 Ready
   → Display: "15 / 20 reps"
   ↓ [User enters "4"]
   → Accumulated: 21 reps (15 + 4 + 2 bonus)
   → TARGET REACHED!
   
7. Completion Screen
   → Show summary: "21 reps in 3 attempts"
```

## Edge Cases & Error Handling

1. **App Backgrounded/Minimized:**
   - Pause all timers (time mode)
   - Preserve state when returning
   - Use Page Visibility API

2. **Very Short Target Values:**
   - Warn if target < reasonable minimum
   - Ensure UI doesn't break with rapid transitions

3. **Accidental Bail/Done:**
   - Consider requiring 1-second hold before bail is enabled (time mode)
   - Or add "Are you sure?" for very quick bails

4. **Timer Cleanup:**
   - Clear all intervals/timeouts on component unmount
   - Use proper cleanup in useEffect

5. **Invalid Inputs:**
   - Validate all numeric inputs
   - Provide sensible min/max values
   - Show error messages for invalid entries

6. **Reps Mode Specific:**
   - User enters 0 or negative reps → Show error, don't accept
   - User closes rep input modal → Cancel without logging
   - Very large rep numbers (999+) → Still works, but check display doesn't break

7. **Mode Switching:**
   - Changing mode on setup screen resets defaults appropriately
   - Time mode: target 60s, bonus 5s
   - Reps mode: target 20 reps, bonus 2 reps

## PWA Features (Optional Enhancement)

### manifest.json
```json
{
  "name": "Accumulation Timer",
  "short_name": "Accumulation",
  "display": "standalone",
  "theme_color": "#10b981",
  "background_color": "#1f2937",
  "orientation": "portrait"
}
```

### Installable
- Add meta tags for iOS web app
- Add manifest for Android
- Service worker for offline capability (optional)

## File Structure
```
/app
  /page.tsx (main app with mode routing)
  /layout.tsx
  /globals.css
/components
  /SetupScreen.tsx (includes mode selection)
  /TimeTrainingScreen.tsx (for time mode)
  /RepsTrainingScreen.tsx (for reps mode)
  /RestScreen.tsx (shared between modes)
  /CompletionScreen.tsx (handles both modes)
  /RepInputModal.tsx (for reps mode)
/lib
  /utils.ts (formatSeconds, formatReps, etc.)
/public
  /icons (if PWA)
```

## Key Functions to Implement

```typescript
// Simple seconds display for time mode
function formatSeconds(seconds: number): string {
  return `${Math.floor(seconds)}s`;
}

// With decimal for active timer
function formatSecondsWithDecimal(seconds: number): string {
  return `${seconds.toFixed(1)}s`;
}

// Reps display
function formatReps(reps: number): string {
  return `${reps} reps`;
}

// Bail out handler - TIME MODE
function handleBailOut() {
  const totalAdded = currentValue + bonus;
  setTotalAccumulated(prev => prev + totalAdded);
  setAttempts(prev => [...prev, {
    value: currentValue,
    bonus: bonus,
    total: totalAdded,
    timestamp: Date.now()
  }]);
  setIsActive(false);
  
  if (totalAccumulated + totalAdded >= target) {
    setIsComplete(true);
  } else {
    setIsResting(true);
    setRestCountdown(restTime);
  }
}

// Done with set handler - REPS MODE
function handleDoneWithSet() {
  setShowRepInput(true);
}

// Submit reps - REPS MODE
function submitReps(repsCompleted: number) {
  const totalAdded = repsCompleted + bonus;
  setTotalAccumulated(prev => prev + totalAdded);
  setAttempts(prev => [...prev, {
    value: repsCompleted,
    bonus: bonus,
    total: totalAdded,
    timestamp: Date.now()
  }]);
  setShowRepInput(false);
  
  if (totalAccumulated + totalAdded >= target) {
    setIsComplete(true);
  } else {
    setIsResting(true);
    setRestCountdown(restTime);
  }
}
```

## Testing Checklist

### Both Modes
- [ ] Mode selection (time/reps) works on setup
- [ ] Settings validation works
- [ ] Rest countdown works
- [ ] Auto-transition from rest to next set works
- [ ] Completion triggers at correct accumulated value
- [ ] Progress bar updates correctly
- [ ] Attempt history displays correctly
- [ ] Reset returns to setup screen
- [ ] Works on iPhone Safari
- [ ] Works in portrait and landscape
- [ ] Screen doesn't sleep during training
- [ ] Timers cleanup properly
- [ ] Background/foreground handling works

### Time Mode Specific
- [ ] Hold timer counts accurately
- [ ] Bail adds correct time (hold + bonus)
- [ ] Timer displays with decimal during hold
- [ ] Completion shows in seconds

### Reps Mode Specific
- [ ] "Done With Set" button works
- [ ] Rep input modal appears correctly
- [ ] Numeric keyboard auto-opens
- [ ] Entered reps + bonus calculated correctly
- [ ] Can cancel rep input without adding
- [ ] Display shows "X / Target reps" format
- [ ] Completion shows in reps

## Success Criteria

1. User can choose between time-based or rep-based training
2. User can set custom target, rest, and bonus values
3. **Time mode:** Timer accurately tracks hold duration, bail adds hold + bonus
4. **Reps mode:** User can input reps completed, adds reps + bonus correctly
5. Automatic rest period (configured seconds) between sets
6. Auto-resume next set after rest completes
7. Clear visual feedback for each state (active/resting/complete)
8. Completion screen shows full session summary with correct units
9. Works smoothly on iPhone
10. Large, easy-to-tap buttons
11. No accidental interactions
12. Single-session use (no data persistence needed)

## Deployment
- Deploy to Vercel with `npx create-next-app` template
- Ensure mobile viewport meta tags are set
- Test on actual iPhone device
- Provide URL for immediate use