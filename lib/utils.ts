/**
 * Format seconds as "XXs" (no decimal)
 */
export function formatSeconds(seconds: number): string {
  return `${Math.floor(seconds)}s`;
}

/**
 * Format seconds with one decimal place for active timer display
 */
export function formatSecondsWithDecimal(seconds: number): string {
  return `${seconds.toFixed(1)}s`;
}

/**
 * Format time in MM:SS format for session duration
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format reps count
 */
export function formatReps(reps: number): string {
  return `${reps} ${reps === 1 ? 'rep' : 'reps'}`;
}

/**
 * Format countdown timer (always in seconds)
 */
export function formatCountdown(seconds: number): string {
  return `${Math.floor(seconds)}s`;
}
