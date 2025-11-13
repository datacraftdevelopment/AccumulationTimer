# Accumulation Tracker - Setup Guide

## What's Changed

Your Accumulation Timer has been upgraded to a full **Accumulation Tracker** with cloud persistence using Airtable. Here's what's new:

### New Features

✅ **Exercise Presets**: Save and manage your favorite exercises (Straight Handstand, Tuck, Straddle, Pike, etc.)
✅ **Cloud Storage**: All sessions automatically saved to Airtable
✅ **Performance Metrics**: Track your progress with detailed stats
✅ **History & Analytics**: View trends, best sessions, averages, and more
✅ **Multi-Exercise Support**: Track different exercises separately

### Data You Requested

The app now tracks:
- **Time trends**: Are your holds getting longer? (Best session, averages, recent vs previous sessions)
- **Efficiency**: Less rest needed? (Session duration, attempts per session)
- **Personal records**: Best single session for each exercise
- **Weekly/monthly volume**: Total sessions in time periods

## Quick Start

### 1. Get Your Airtable API Key

1. Go to https://airtable.com/create/tokens
2. Create a new Personal Access Token with these scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
3. Add access to the **AI_Test** base (appKNnqnplJrCPua3)
4. Copy the token

### 2. Add API Key to Environment

Edit `.env.local` and replace `your_airtable_personal_access_token_here` with your actual token:

```
NEXT_PUBLIC_AIRTABLE_BASE_ID=appKNnqnplJrCPua3
NEXT_PUBLIC_AIRTABLE_API_KEY=patXXXXXXXXXXXXX
```

### 3. Run the App

```bash
npm run dev
```

Open http://localhost:3000 on your phone or computer.

### 4. Add to iPhone Home Screen

For the best mobile experience:
1. Open the app in Safari
2. Tap the Share button
3. Scroll down and tap "Add to Home Screen"
4. Name it "Training Tracker" and tap Add

Now it works like a native app!

## Airtable Database

Your data is stored in the **AI_Test** base with 3 tables:

### Exercises Table
- name (e.g., "Straight Handstand")
- mode ("time" or "reps")
- default_target, default_rest_time, default_adjustment
- 5 presets already created for you

### Sessions Table
- exercise_name (which exercise)
- All config used (mode, target, rest_time, adjustment)
- Results (total_accumulated, session_duration, attempt_count)
- completed_at (timestamp)

### Attempts Table
- Individual sets within each session
- Linked to session by session_ref
- Records: attempt_number, value, adjustment, total_counted

## Using the App

### Setup Screen
- **Select Exercise**: Choose from your saved presets
- **Exercises Button**: Manage your exercise library
- **History Button**: View stats and past sessions
- **Customize**: Adjust target, rest time, adjustment before starting

### Exercises Screen
- View all your exercises
- Create new exercises with custom settings
- Edit or delete existing exercises
- Tap an exercise to quickly load its defaults

### Training Screens
- Works exactly like before (time or reps mode)
- Session automatically saves to Airtable when complete

### History & Stats Screen

**Overview Tab**:
- Total sessions (all time, this week, this month)
- Per-exercise performance with trend indicators:
  - 🔺 **Improving**: Recent sessions 5%+ better than previous
  - 🔻 **Declining**: Recent sessions 5%+ worse
  - ➖ **Stable**: Consistent performance
- Best, average, and last session date for each exercise

**Exercise Details**:
- Tap any exercise to see detailed history
- Stats: Best session, average, avg attempts, avg duration
- Chronological list of all sessions
- Date, time, results for each session

## Performance Metrics Explained

### Time Trends
- **Best Session**: Your personal record for that exercise
- **Average Accumulated**: Mean of all session totals
- **Trend**: Compares last 5 sessions vs previous 5 sessions

### Efficiency
- **Average Attempts**: Fewer attempts = more efficient
- **Average Duration**: Total time including rest periods
- **Rest Ratio**: Can track if you're resting less over time

### Volume Tracking
- **This Week**: Sessions in last 7 days
- **This Month**: Sessions in last 30 days
- View individual sessions to see exact totals

## Deployment

Deploy to Vercel for cloud hosting:

```bash
# Add environment variables to Vercel:
# NEXT_PUBLIC_AIRTABLE_BASE_ID
# NEXT_PUBLIC_AIRTABLE_API_KEY

vercel --prod --yes
```

Then access from your phone anywhere!

## Data Privacy

Since there's no authentication:
- Anyone with the URL can access your data
- Good for personal use (just you)
- Don't share the URL if you want privacy
- Your Airtable API key is stored in environment variables (not in code)
- The `.gitignore` protects your `.env.local` from being committed to git

## Troubleshooting

### "Failed to load exercises"
- Check your Airtable API key in `.env.local`
- Verify the token has access to the AI_Test base
- Make sure you have `data.records:read` scope

### "Failed to save session"
- Check your API key has `data.records:write` scope
- Session will still show completion screen even if save fails

### Exercises not showing up
- Check the Exercises table in Airtable has records
- Run `npm run dev` to restart the dev server after changing .env

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run lint`

## Need Help?

Check the CLAUDE.md file for technical details about the architecture and implementation.

Enjoy tracking your training! 💪
