# Accumulation Timer

A mobile-optimized web application for accumulation training (cluster sets/rest-pause training) that supports both time-based and rep-based training modes with automatic rest periods.

## Features

- **Dual Training Modes**
  - **Time Mode**: High-precision timer tracks hold duration (seconds)
  - **Reps Mode**: Manual rep entry for counted exercises

- **Automatic Rest Periods**: Configurable rest time between sets with countdown
- **Bonus System**: Add bonus seconds/reps when you bail out or complete a set
- **Progress Tracking**: Visual progress bars and real-time statistics
- **Session Summary**: Complete breakdown of attempts and totals at completion
- **Mobile-First Design**: Large touch targets, dark theme, optimized for phones
- **Screen Wake Lock**: Prevents screen from sleeping during training
- **PWA-Ready**: Works offline and can be installed on mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Setup Screen

1. **Choose Training Mode**: Time or Reps
2. **Set Target**: Your goal (seconds or reps)
3. **Configure Rest Time**: How long to rest between sets (seconds)
4. **Set Bonus**: Extra credit added when you bail/complete (seconds or reps)
5. **Start Training**: Begin your session

### Time Mode

- Timer starts automatically
- Hold as long as possible
- Press "Bail Out" when you can't continue
- Your hold time + bonus is added to your total
- Automatic rest period begins
- Repeat until you reach your target

### Reps Mode

- Perform your exercise (push-ups, pull-ups, etc.)
- Press "Done With Set" when finished
- Enter the number of reps you completed
- Your reps + bonus is added to your total
- Automatic rest period begins
- Repeat until you reach your target

### Completion

- View session summary with total accumulated, attempts, and duration
- Review attempt history table
- Start a new session

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: lucide-react
- **Deployment**: Vercel

## Project Structure

```
/app
  page.tsx          - Main app with routing logic
  layout.tsx        - Root layout with metadata
  globals.css       - Global styles and Tailwind imports

/components
  SetupScreen.tsx           - Mode selection and configuration
  TimeTrainingScreen.tsx    - Timer-based training (time mode)
  RepsTrainingScreen.tsx    - Manual rep entry (reps mode)
  RepInputModal.tsx         - Rep count input modal
  RestScreen.tsx            - Rest countdown (shared)
  CompletionScreen.tsx      - Session results (shared)

/lib
  utils.ts          - Formatting and utility functions
```

## Design Inspiration

UI design inspired by Repeat Timer Pro app:
- Dark theme with card-based layout
- Large, readable timers (white on dark)
- Bold action buttons (orange/green)
- Minimal chrome, focus on content

## License

MIT
