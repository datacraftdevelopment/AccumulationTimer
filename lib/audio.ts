/**
 * Play a beep sound using Web Audio API
 */
export function playBeep(frequency: number = 800, duration: number = 200) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    console.log("Audio playback failed:", error);
  }
}

/**
 * Play a warning beep (lower frequency)
 */
export function playWarningBeep() {
  playBeep(600, 150);
}

/**
 * Play a completion beep (higher frequency, longer)
 */
export function playCompletionBeep() {
  playBeep(1000, 300);
}
