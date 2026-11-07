/**
 * Web Audio API Synth Fallback Engine for AniSync Music Quiz
 * Guarantees audio playback even if remote audio files fail, offline, or get blocked by browser CORS.
 */

let audioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let synthTimeout: NodeJS.Timeout | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Anime-style upbeat melody pentatonic frequencies (C4, D4, E4, G4, A4, C5, D5, E5, G5)
const ANIME_PENTATONIC_FREQS = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99];

export const stopSynthMelody = () => {
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
  const ctx = getAudioContext();

  return new Promise((resolve) => {
    const startTime = ctx.currentTime;
    const noteDuration = 0.22;
    const totalNotes = Math.floor(durationSeconds / noteDuration);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, startTime);
    masterGain.connect(ctx.destination);

    for (let i = 0; i < totalNotes; i++) {
      const noteTime = startTime + i * noteDuration;
      const freq = ANIME_PENTATONIC_FREQS[(i * 3 + Math.floor(i / 2)) % ANIME_PENTATONIC_FREQS.length];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      // Envelope
      gain.gain.setValueAtTime(0.01, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.3, noteTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + noteDuration - 0.02);

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
