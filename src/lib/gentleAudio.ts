import { currentSfxLevel, useSoundStore } from '../store/useSoundStore';

/**
 * Gentle, shared Web Audio helpers.
 *
 * Design rules (why the old sounds felt harsh):
 *  - no square waves in UI feedback (harsh harmonics),
 *  - a slow attack instead of an instant gain jump,
 *  - a much lower master ceiling (≈0.07 at 100 % user volume),
 *  - short, musical two/three-note motifs instead of beeps.
 *
 * Nothing here runs until a user gesture creates/resumes the AudioContext,
 * so it stays browser-autoplay compliant.
 */

let ctx: AudioContext | null = null;

export const getSoundContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  const AudioCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtor) return null;
  if (!ctx) ctx = new AudioCtor();
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => undefined);
  }
  return ctx;
};

interface Tone {
  freq: number;
  /** Seconds after "now". */
  at: number;
  /** Total audible length in seconds. */
  duration: number;
}

interface PlayOptions {
  type?: OscillatorType;
  /** Relative loudness of the motif (0–1). Multiplied by the master ceiling. */
  strength?: number;
}

/** Master ceiling — deliberately far below the old 0.18/0.3 values. */
const MASTER_CEILING = 0.085;

export const playToneMotif = (tones: Tone[], options: PlayOptions = {}): void => {
  const level = currentSfxLevel();
  if (level <= 0 || tones.length === 0) return;

  const audio = getSoundContext();
  if (!audio) return;

  const type: OscillatorType = options.type ?? 'sine';
  const strength = Math.min(1, Math.max(0.1, options.strength ?? 0.8));
  const start = audio.currentTime;

  const master = audio.createGain();
  master.gain.setValueAtTime(MASTER_CEILING * level * strength, start);
  master.connect(audio.destination);

  for (const tone of tones) {
    const noteStart = start + Math.max(0, tone.at);
    const noteEnd = noteStart + Math.max(0.08, tone.duration);
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(tone.freq, noteStart);

    // Soft attack + exponential tail. `exponentialRampToValueAtTime` cannot
    // reach zero, hence the tiny epsilon values.
    const attack = Math.min(0.055, tone.duration * 0.35);
    gain.gain.setValueAtTime(0.0001, noteStart);
    gain.gain.exponentialRampToValueAtTime(0.85, noteStart + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, noteEnd);

    osc.connect(gain);
    gain.connect(master);
    osc.start(noteStart);
    osc.stop(noteEnd + 0.02);
  }

  // Let the tail finish; nodes are GC'd after stop.
  window.setTimeout(() => {
    try {
      master.disconnect();
    } catch {
      // already disconnected
    }
  }, (Math.max(...tones.map((t) => t.at + t.duration)) + 0.2) * 1000);
};

/* ── Semantic presets used across the product ─────────────────────────── */

/** Neutral tap for toggles / quiet UI feedback. */
export const playUiTap = (): void => {
  playToneMotif([{ freq: 523.25, at: 0, duration: 0.09 }], { strength: 0.55 });
};

/** A choice was committed (life sim, quizzes). */
export const playChoiceMade = (): void => {
  playToneMotif(
    [
      { freq: 523.25, at: 0, duration: 0.12 },
      { freq: 659.25, at: 0.07, duration: 0.16 },
    ],
    { strength: 0.7 },
  );
};

/** Moving to the next event / page in a flow. */
export const playNextEvent = (): void => {
  playToneMotif(
    [
      { freq: 392.0, at: 0, duration: 0.14 },
      { freq: 523.25, at: 0.08, duration: 0.2 },
    ],
    { strength: 0.7 },
  );
};

/** A new life begins — warm rising triad. */
export const playBirth = (): void => {
  playToneMotif(
    [
      { freq: 261.63, at: 0, duration: 0.3 },
      { freq: 329.63, at: 0.12, duration: 0.34 },
      { freq: 392.0, at: 0.24, duration: 0.5 },
    ],
    { strength: 0.8, type: 'triangle' },
  );
};

/** Memorial — soft falling triad, never a buzzer. */
export const playMemorial = (): void => {
  playToneMotif(
    [
      { freq: 392.0, at: 0, duration: 0.36 },
      { freq: 329.63, at: 0.18, duration: 0.42 },
      { freq: 261.63, at: 0.36, duration: 0.62 },
    ],
    { strength: 0.75 },
  );
};

/** Airing reminder — two-note chime, much quieter than the old 0.15/0.18. */
export const playReminderChime = (): void => {
  playToneMotif(
    [
      { freq: 587.33, at: 0, duration: 0.32 },
      { freq: 783.99, at: 0.16, duration: 0.5 },
    ],
    { strength: 0.65 },
  );
};

/** Expose the preference store for settings UIs. */
export { useSoundStore };
