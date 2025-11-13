# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AccumulationTracker is a **native iOS app** built with SwiftUI for accumulation training (cluster sets/rest-pause training). This is a **port of the web-based Next.js application** located in `../web/`. The iOS version will provide a native mobile experience with deeper system integration.

**Original Web App:** See `../web/CLAUDE.md`, `../web/README.md`, and `../web/Scope.md` for complete feature specifications, user flows, and architecture details. The iOS app should maintain feature parity with the web version.

**Tech Stack:**
- SwiftUI (iOS 17+)
- Swift 5.9+
- Xcode 15+
- Swift Testing framework (modern testing API)

## Repository Structure

This is a **monorepo** with two parallel implementations:
```
/AccumulationTracker/               (parent directory)
├── web/                           (Next.js web app - REFERENCE IMPLEMENTATION)
│   ├── CLAUDE.md                  (Web app architecture and features)
│   ├── README.md                  (Web app documentation)
│   ├── Scope.md                   (Complete feature specification)
│   └── components/                (React components - reference for iOS screens)
└── AccumulationTracker/           (iOS native app - THIS DIRECTORY)
    ├── CLAUDE.md                  (This file)
    ├── AccumulationTracker/       (iOS app source)
    ├── AccumulationTrackerTests/  (Unit tests)
    └── AccumulationTrackerUITests/ (UI tests)
```

## Key Architecture Concepts (from Web App)

### Dual-Mode Operation

The app must support two fundamentally different training modes:

1. **Time Mode**: High-precision timer tracks hold duration with **subtraction model**
   - User holds position as long as possible
   - Timer updates every 100ms for smooth display
   - **Time counted = hold duration - adjustment** (adjustment is penalty/transition time)
   - Example: 10s hold with 5s adjustment = 5s counted toward goal
   - Features:
     - Live progress updates during hold (100ms refresh)
     - Two action buttons: "Bail Out" (applies penalty, continues) and "Stop" (no penalty, ends session)
     - Progress bar updates in real-time showing current hold contribution
     - Dynamic button display: both buttons before target, only "Stop" after target reached

2. **Reps Mode**: Manual rep entry with **addition model**
   - No timer during sets - user performs exercise
   - **Reps counted = entered reps + adjustment** (adjustment is bonus)
   - Example: 10 reps with 2 adjustment = 12 counted toward goal
   - Modal/sheet for rep input after each set

**Shared Behavior:**
- Identical rest period countdown (1-second intervals)
- Audio cues: warning beep at 3s remaining, completion beep at 0s
- Automatic transition to next set when rest completes
- Completion screen when target is reached

### Critical State Management

Key state variables that must be preserved across screens:

```swift
// Core Configuration
@State var mode: TrainingMode // .time or .reps
@State var target: Double     // Seconds or reps
@State var restTime: Int      // Seconds
@State var adjustment: Double // Penalty (time) or bonus (reps)

// Session State
@State var appState: AppState // .setup, .training, .resting, .complete
@State var totalAccumulated: Double // Running sum
@State var attempts: [Attempt]      // History array
@State var sessionStartTime: Date

// Active State
@State var currentValue: Double // Current timer or rep count
@State var restCountdown: Int   // Remaining rest seconds
```

### Timer Precision Requirements (Time Mode)

**Hold Timer:**
```swift
// Use Date() for precision, not Timer publishers alone
let startTime = Date()
Timer.publish(every: 0.1, on: .main, in: .common)
    .autoconnect()
    .sink { _ in
        let elapsed = Date().timeIntervalSince(startTime)
        currentValue = elapsed

        // Live progress calculation during hold
        let currentCounted = max(0, currentValue - adjustment)
        let liveTotal = totalAccumulated + currentCounted
        let remaining = max(0, target - liveTotal)
        let progressPercent = min(100, (liveTotal / target) * 100)
    }
```

**Rest Countdown:**
```swift
// Simple 1-second intervals
Timer.publish(every: 1.0, on: .main, in: .common)
    .autoconnect()
    .sink { _ in
        if restCountdown > 0 {
            restCountdown -= 1
        } else {
            startNextSet()
        }
    }
```

## Screen Structure (Map from Web Components)

### Web Component → iOS View Mapping

```
Web Components (React)          →  iOS Views (SwiftUI)
─────────────────────────────────────────────────────────
SetupScreen.tsx                 →  SetupView.swift
  - Mode selection (toggle)        - Picker for mode
  - Configuration inputs           - TextField/Stepper inputs
  - About modal                    - Sheet/NavigationLink

TimeTrainingScreen.tsx          →  TimeTrainingView.swift
  - Large timer display            - Large Text with timer
  - Live progress bar              - ProgressView with live updates
  - Reset button                   - Alert confirmation
  - "Bail Out" button             - Primary action button
  - "Stop" button                  - Secondary action button

RepsTrainingScreen.tsx          →  RepsTrainingView.swift
  - Progress display               - Text showing accumulated/target
  - "Done With Set" button        - Action button → sheet
  - Reset button                   - Alert confirmation

RepInputModal.tsx               →  RepInputSheet.swift
  - Numeric input field            - TextField with .numberPad keyboard
  - Submit button                  - Dismiss and process

RestScreen.tsx                  →  RestView.swift
  - Large countdown timer          - Large Text with countdown
  - Skip Rest button              - Navigation/dismiss action
  - Progress summary              - Text showing status
  - Audio cues (3s, 0s)           - AVAudioPlayer or System sounds

CompletionScreen.tsx            →  CompletionView.swift
  - Session summary                - VStack with statistics
  - Scrollable attempts history    - ScrollView with List
  - "New Session" button          - Navigation reset

AboutModal.tsx                  →  AboutSheet.swift
  - Usage instructions             - Text content
  - Terminology explanations       - Formatted markdown-style
```

### Screen Layout Requirements

All screens should use:
- **Safe Area**: `.ignoresSafeArea()` carefully managed
- **Full Screen Height**: Geometry reader or `.frame(maxHeight: .infinity)`
- **Large Touch Targets**: Minimum 60pt height for buttons
- **Font Sizes:**
  - Active timer: `.system(size: 80)` (time mode)
  - Rest countdown: `.system(size: 120)`
  - Progress text: `.title` or `.title2` (enlarged for visibility)
  - Labels: `.body` to `.title3`

## Development Commands

### Building & Running
```bash
# Open in Xcode
open AccumulationTracker.xcodeproj

# Build from command line
xcodebuild -scheme AccumulationTracker -configuration Debug build

# Run tests
xcodebuild test -scheme AccumulationTracker -destination 'platform=iOS Simulator,name=iPhone 15'

# Clean build folder
xcodebuild clean -scheme AccumulationTracker
```

### Running in Xcode
- **Build:** Cmd+B
- **Run:** Cmd+R
- **Test:** Cmd+U
- **Clean:** Cmd+Shift+K

### Simulator Selection
Target iOS 17+ on:
- iPhone 15 (primary test device)
- iPhone 15 Pro Max (large screen)
- iPhone SE (small screen)

## Key iOS-Specific Features

### System Integration

1. **AVAudioSession Configuration**
```swift
// Configure audio for background training and mixing
try? AVAudioSession.sharedInstance().setCategory(.ambient, mode: .default)
try? AVAudioSession.sharedInstance().setActive(true)
```

2. **Keep Screen Awake**
```swift
// During active training
UIApplication.shared.isIdleTimerDisabled = true
// Reset when done
UIApplication.shared.isIdleTimerDisabled = false
```

3. **Scene Phase Handling**
```swift
@Environment(\.scenePhase) var scenePhase

.onChange(of: scenePhase) { oldPhase, newPhase in
    switch newPhase {
    case .background:
        pauseTimers()
    case .active:
        resumeOrRecalculate()
    case .inactive:
        break
    }
}
```

4. **Haptic Feedback**
```swift
// On bail/done button press
UIImpactFeedbackGenerator(style: .medium).impactOccurred()

// On rest countdown complete
UINotificationFeedbackGenerator().notificationOccurred(.success)

// On warning beep
UINotificationFeedbackGenerator().notificationOccurred(.warning)
```

### Audio Implementation

Use **System Sounds** or **AVAudioPlayer** for beeps:

```swift
// System sounds (simple)
import AudioToolbox
AudioServicesPlaySystemSound(1054) // Warning beep
AudioServicesPlaySystemSound(1057) // Completion beep

// Or AVAudioPlayer for custom tones (like web app's Web Audio API)
```

### Color Scheme (from Web)

```swift
extension Color {
    static let setupBackground = Color(hex: "#1f2937")    // Gray
    static let timeActive = Color(hex: "#10b981")         // Green
    static let repsActive = Color(hex: "#3b82f6")         // Blue
    static let resting = Color(hex: "#f59e0b")            // Orange
    static let complete = Color(hex: "#2563eb")           // Blue
}
```

## Critical Implementation Details

### Bail Out vs Stop (Time Mode)

**Bail Out Button:**
- Applies adjustment penalty: `counted = max(0, holdTime - adjustment)`
- Continues session (goes to rest if target not reached)
- Orange color
- Shown before AND after reaching target (until user stops)

**Stop Button:**
- No adjustment penalty: full hold time counts
- Always ends session immediately (goes to completion)
- Red color
- Before target: shown alongside "Bail Out"
- After target reached: ONLY button shown (hides "Bail Out")

```swift
func handleBailOut() {
    let counted = max(0, currentValue - adjustment)
    let newTotal = totalAccumulated + counted

    attempts.append(Attempt(
        value: currentValue,
        adjustment: adjustment,
        total: counted,
        timestamp: Date()
    ))

    totalAccumulated = newTotal

    if newTotal >= target {
        appState = .complete
    } else {
        appState = .resting
        restCountdown = restTime
    }
}

func handleStop() {
    // Full time counts (bonus = 0 in attempt log)
    let newTotal = totalAccumulated + currentValue

    attempts.append(Attempt(
        value: currentValue,
        adjustment: 0,  // No penalty!
        total: currentValue,
        timestamp: Date()
    ))

    totalAccumulated = newTotal
    appState = .complete  // Always go to completion
}
```

### Live Progress Updates (Time Mode)

Progress bar and text must update **during active hold** (not just after bail):

```swift
// Inside Timer publisher (every 0.1s)
let currentCounted = max(0, currentValue - adjustment)
let liveTotal = totalAccumulated + currentCounted
let remaining = max(0, target - liveTotal)
let progressPercent = min(1.0, liveTotal / target)

// Update UI
ProgressView(value: progressPercent)
Text("\(formatDecimal(liveTotal)) / \(formatSimple(target))s")
Text("Remaining: \(formatDecimal(remaining))s")

// Button logic
let hasReachedTarget = liveTotal >= target
if hasReachedTarget {
    // Show only Stop button
} else {
    // Show both Bail Out and Stop
}
```

### Completion Detection

Check target BEFORE starting rest:

```swift
func completeSet() {
    let newTotal = totalAccumulated + countedValue
    totalAccumulated = newTotal

    if newTotal >= target {
        appState = .complete  // Skip rest
    } else {
        appState = .resting   // Rest before next set
        restCountdown = restTime
    }
}
```

### Adjustment Terminology

**Time Mode:**
- Label: "Adjustment (seconds)" or "Transition Time"
- Explanation: "Time deducted from each hold (transition penalty)"
- Applied as: **subtraction** (hold - adjustment = counted)
- Can be 0 (full hold time counts)
- If adjustment >= hold time, 0 seconds counted (use `max(0, ...)`)

**Reps Mode:**
- Label: "Adjustment (reps)" or "Bonus Reps"
- Explanation: "Extra reps added per set (reward for completing)"
- Applied as: **addition** (reps + adjustment = counted)
- Can be 0 (no bonus)

## Testing Strategy

### Unit Tests (Swift Testing Framework)

Test core business logic:
```swift
import Testing
@testable import AccumulationTracker

struct TimerCalculationTests {
    @Test func bailOutCalculation() {
        let holdTime = 10.0
        let adjustment = 5.0
        let counted = max(0, holdTime - adjustment)
        #expect(counted == 5.0)
    }

    @Test func adjustmentGreaterThanHold() {
        let holdTime = 3.0
        let adjustment = 5.0
        let counted = max(0, holdTime - adjustment)
        #expect(counted == 0.0)
    }

    @Test func repAddition() {
        let reps = 10.0
        let adjustment = 2.0
        let counted = reps + adjustment
        #expect(counted == 12.0)
    }
}
```

### UI Tests

Focus on state transitions:
- Mode selection → training screen navigation
- Bail/Done → Rest screen transition
- Rest countdown → Auto-resume
- Target reached → Completion screen

### Manual Testing Checklist

- [ ] Time mode: Timer accuracy and live progress
- [ ] Time mode: Bail Out applies penalty correctly
- [ ] Time mode: Stop ends session immediately with no penalty
- [ ] Time mode: Dynamic button display (both vs only Stop)
- [ ] Reps mode: Rep input sheet and calculation
- [ ] Rest countdown: 1-second intervals, audio at 3s and 0s
- [ ] Background/foreground: Timer pauses and resumes
- [ ] Screen stays awake during training
- [ ] Haptic feedback on key actions
- [ ] Dark mode appearance
- [ ] Landscape orientation (optional)
- [ ] Various screen sizes (SE, 15, 15 Pro Max)

## Edge Cases (from Web Scope.md)

1. **Very short holds/sets:** Prevent accidental bail in first second
2. **Invalid rep input:** Reject 0, negative, or non-numeric
3. **Timer cleanup:** Cancel all timers in `.onDisappear()`
4. **Background handling:** Preserve state, pause timers
5. **Adjustment >= hold time:** Use `max(0, hold - adjustment)` to prevent negative
6. **Rapid completion:** If exceeding target significantly, show correct final total
7. **Reset confirmation:** Always use `.alert()` before resetting
8. **Skip rest safety:** Allow skipping rest without confirmation
9. **Audio playback:** Handle failures gracefully (don't crash if audio unavailable)
10. **Adjustment can be 0:** Both fields accept 0 values
11. **Stop vs Bail Out:** Stop logs with `adjustment: 0`, Bail Out uses configured value
12. **Live progress calculations:** Must stay synchronized with timer display
13. **Target reached display:** Hide Bail Out, show only Stop when target reached during hold

## Differences from Web Version

### iOS-Specific Enhancements

1. **Native UI Components:**
   - SwiftUI Picker instead of HTML radio buttons
   - Native TextFields with `.numberPad` keyboard
   - SwiftUI Sheets for modals
   - NavigationStack for flow

2. **System Integration:**
   - iOS-style alerts for confirmations
   - Haptic feedback on interactions
   - System sounds or custom audio
   - Scene phase handling for backgrounding
   - Native screen wake lock

3. **Performance:**
   - More efficient timer handling
   - Better battery life optimization
   - Native rendering (no browser overhead)

4. **Testing:**
   - XCTest UI tests instead of browser testing
   - Swift Testing for unit tests
   - Xcode Instruments for profiling

### Things to Maintain Parity With

- All core features from web app (see `../web/CLAUDE.md`)
- Dual-mode operation with exact same logic
- Adjustment calculation (subtraction for time, addition for reps)
- Live progress updates in time mode
- Two-button system (Bail Out + Stop) in time mode
- Audio cues at 3s and 0s during rest
- Skip Rest button
- Reset confirmation
- About/help content
- Attempt history table
- Visual color scheme (green/blue/orange/gray)

## Reference Documentation

### Primary Sources (Web Implementation)
- `../web/CLAUDE.md` - Complete web app architecture, features, and edge cases
- `../web/Scope.md` - Full functional specification and user flows
- `../web/README.md` - Web app overview and usage

### iOS Resources
- Apple SwiftUI Documentation
- Human Interface Guidelines (iOS)
- AVFoundation for audio
- Combine for timer publishers

## App Store Preparation (Future)

When ready to ship:
- [ ] App icons (all sizes)
- [ ] Launch screen
- [ ] Privacy policy (if collecting data - currently single session, no persistence)
- [ ] App Store screenshots
- [ ] Description referencing web version
- [ ] Version numbering strategy
