/**
 * Web Audio API Synth Fallback Engine for AniSync Music Quiz
 * Guarantees audio playback even if remote audio files fail, offline, or get blocked by browser CORS.
 *
 * Deliberately uses a soft sine/triangle timbre and a low ceiling: the previous
 * square-wave + 0.18 master gain combination sounded like an alarm rather than
 * a melody.
 */

import { getSoundContext } from './gentleAudio';
import { currentSfxLevel } from '../store/useSoundStore';

let activeOscillators: OscillatorNode[] = [];
let synthTimeout: ReturnType<typeof setTimeout> | null = null;

// Anime-style upbeat melody pentatonic frequencies (C4, D4, E4, G4, A4, C5, D5, E5, G5)
const ANIME_PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

/** Master ceiling for the quiz fallback, before the user volume multiplier. */
const SYNTH_CEILING = 0.07;

export const stopSynthMelody = (): void => {
  if (synthTimeout) {
    clearTimeout(synthTimeout);
    synthTimeout = null;
  }
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
      osc.disconnect();
    } catch {
      // Ignore already stopped
    }
  });
  activeOscillators = [];
};

export const playSynthAnimeMelody = (durationSeconds: number = 5): Promise<void> => {
  stopSynthMelody();
  const level = currentSfxLevel();
  if (level <= 0) return Promise.resolve();

  const ctx = getSoundContext();
  if (!ctx) return Promise.resolve();

  return new Promise((resolve) => {
    const startTime = ctx.currentTime;
    const noteDuration = 0.3;
    const totalNotes = Math.max(1, Math.floor(durationSeconds / noteDuration));

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(SYNTH_CEILING * level, startTime);
    masterGain.connect(ctx.destination);

    for (let i = 0; i < totalNotes; i++) {
      const noteTime = startTime + i * noteDuration;
      const freq = ANIME_PENTATONIC_FREQS[(i * 3 + Math.floor(i / 2)) % ANIME_PENTATONIC_FREQS.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sine only — no square/triangle edge in the quiz fallback.
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Soft attack, long tail
      gain.gain.setValueAtTime(0.0001, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.55, noteTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + noteDuration - 0.02);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + noteDuration);

      activeOscillators.push(osc);
    }

    synthTimeout = setTimeout(() => {
      stopSynthMelody();
      resolve();
    }, durationSeconds * 1000);
  });
};
