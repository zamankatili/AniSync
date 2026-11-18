import { getSoundContext } from '../gentleAudio';
import { currentSfxLevel } from '../../store/useSoundStore';
import type { AmbientAccent } from './season';

/**
 * Mevsimsel ambiyansın **tek seferlik** doğa sesleri.
 *
 * Neden döngüsel bir yatak (loop) yok?
 * - Sürekli bir ses yatağı, sayfa açık kaldıkça pil ve dikkat tüketir.
 * - Döngü noktasındaki tık sesini gizlemek için crossfade hilesi gerekir;
 *   kısa ve tek seferlik vurgular bu sorunu tamamen ortadan kaldırır.
 * - Ürün kuralı: "kısa, döngüsüz, düşük ses". Bu modül tam olarak onu uygular.
 *
 * Lisans: Seslerin hiçbiri kayıt değildir. Hepsi Web Audio osilatörleri ve
 * tarayıcıda üretilen gürültüyle sentezlenir; üçüncü taraf ses dosyası yoktur.
 *
 * Otomatik oynatma: `currentSfxLevel()` genel ses tercihi kapalıyken 0 döner,
 * ayrıca AudioContext `running` değilse hiçbir düğüm kurulmaz. Yani kullanıcı
 * etkileşimi olmadan tek bir örnek bile çalmaz.
 */

/** Vurgu tavanı — UI çanından (0.085) belirgin biçimde düşük. */
export const ACCENT_CEILING = 0.05;

/** Bir vurgunun en uzun süresi (güvenlik ağı). */
const MAX_ACCENT_SECONDS = 6;

interface BuiltVoice {
  oscillators: OscillatorNode[];
  sources: AudioBufferSourceNode[];
  /** Saniye cinsinden toplam süre. */
  duration: number;
}

interface Voice {
  master: GainNode;
  oscillators: OscillatorNode[];
  sources: AudioBufferSourceNode[];
}

const activeVoices = new Set<Voice>();

const disconnectVoice = (voice: Voice): void => {
  for (const osc of voice.oscillators) {
    try {
      osc.disconnect();
    } catch {
      // already disconnected
    }
  }
  for (const source of voice.sources) {
    try {
      source.disconnect();
    } catch {
      // already disconnected
    }
  }
  try {
    voice.master.disconnect();
  } catch {
    // already disconnected
  }
};

const stopOscillator = (osc: OscillatorNode, at: number): void => {
  try {
    osc.stop(at);
  } catch {
    // already stopped or never started
  }
};

/** Aktif vurguları kısa bir fade ile susturur (rota/sekme değişimi). */
export const stopAmbientAudio = (): void => {
  if (activeVoices.size === 0) return;
  const audio = getSoundContext();
  const now = audio ? audio.currentTime : 0;

  for (const voice of activeVoices) {
    try {
      voice.master.gain.cancelScheduledValues(now);
      voice.master.gain.setValueAtTime(voice.master.gain.value, now);
      voice.master.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    } catch {
      // node already torn down
    }
    const at = now + 0.15;
    for (const osc of voice.oscillators) stopOscillator(osc, at);
    for (const source of voice.sources) {
      try {
        source.stop(at);
      } catch {
        // already stopped
      }
    }
    disconnectVoice(voice);
  }
  activeVoices.clear();
};

/** Yumuşak, düşük frekanslı gürültü (rüzgâr için). */
const createNoiseBuffer = (audio: AudioContext, seconds: number): AudioBuffer => {
  const length = Math.max(1, Math.floor(audio.sampleRate * seconds));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    // Brown-ish noise: düşük frekanslarda daha güçlü, kulağa "hışırtı" değil
    // "esinti" gibi gelir.
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 3.2;
  }
  return buffer;
};

/** İlkbahar sabahı: kısa, yukarı kayan 3–5 cıvıltı. */
const buildBirds = (audio: AudioContext, start: number, master: GainNode): BuiltVoice => {
  const oscillators: OscillatorNode[] = [];
  const chirpCount = 3 + Math.floor(Math.random() * 3);

  for (let i = 0; i < chirpCount; i += 1) {
    const at = start + i * (0.11 + Math.random() * 0.1);
    const duration = 0.09 + Math.random() * 0.06;
    const base = 2100 + Math.random() * 1100;
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(base, at);
    osc.frequency.exponentialRampToValueAtTime(base * 1.35, at + duration * 0.45);
    osc.frequency.exponentialRampToValueAtTime(base * 0.92, at + duration);

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(0.9, at + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + duration + 0.02);
    oscillators.push(osc);
  }

  return { oscillators, sources: [], duration: chirpCount * 0.22 + 0.4 };
};

/** Yaz gecesi: 2–3 kısa cırcır serisi; her seri minik darbelerden oluşur. */
const buildCrickets = (
  audio: AudioContext,
  start: number,
  master: GainNode,
): BuiltVoice => {
  const oscillators: OscillatorNode[] = [];
  const burstCount = 2 + Math.floor(Math.random() * 2);

  for (let burst = 0; burst < burstCount; burst += 1) {
    const burstAt = start + burst * 0.85;
    const pulseCount = 4 + Math.floor(Math.random() * 3);
    const freq = 4100 + Math.random() * 400;

    for (let pulse = 0; pulse < pulseCount; pulse += 1) {
      const at = burstAt + pulse * 0.055;
      const osc = audio.createOscillator();
      const gain = audio.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.55, at + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.036);

      osc.connect(gain);
      gain.connect(master);
      osc.start(at);
      osc.stop(at + 0.05);
      oscillators.push(osc);
    }
  }

  return { oscillators, sources: [], duration: burstCount * 0.85 + 0.5 };
};

/** Sonbahar / kış gecesi: bant geçiren filtreden geçen yavaş rüzgâr kabarması. */
const buildWind = (audio: AudioContext, start: number, master: GainNode): BuiltVoice => {
  const source = audio.createBufferSource();
  const filter = audio.createBiquadFilter();
  const gain = audio.createGain();

  source.buffer = createNoiseBuffer(audio, 3.6);
  source.loop = false;

  filter.type = 'bandpass';
  filter.Q.value = 0.8;
  filter.frequency.setValueAtTime(420, start);
  filter.frequency.linearRampToValueAtTime(820, start + 1.4);
  filter.frequency.linearRampToValueAtTime(360, start + 3.3);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(0.55, start + 1.1);
  gain.gain.linearRampToValueAtTime(0.0001, start + 3.4);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  source.start(start);
  source.stop(start + 3.5);

  return { oscillators: [], sources: [source], duration: 3.6 };
};

/** Kış gündüzü: karın boğduğu iki yumuşak alçak ton. */
const buildHush = (audio: AudioContext, start: number, master: GainNode): BuiltVoice => {
  const oscillators: OscillatorNode[] = [];
  const notes = [196, 146.83];

  notes.forEach((freq, index) => {
    const at = start + index * 0.55;
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, at);
    osc.frequency.linearRampToValueAtTime(freq * 0.985, at + 2.2);

    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.linearRampToValueAtTime(0.5, at + 0.85);
    gain.gain.linearRampToValueAtTime(0.0001, at + 2.4);

    osc.connect(gain);
    gain.connect(master);
    osc.start(at);
    osc.stop(at + 2.45);
    oscillators.push(osc);
  });

  return { oscillators, sources: [], duration: 3.1 };
};

const ACCENT_BUILDERS: Record<
  AmbientAccent,
  (audio: AudioContext, start: number, master: GainNode) => BuiltVoice
> = {
  birds: buildBirds,
  crickets: buildCrickets,
  wind: buildWind,
  hush: buildHush,
};

/**
 * Tek bir doğa vurgusu çalar. Genel ses kapalıysa veya AudioContext henüz
 * kullanıcı etkileşimiyle açılmadıysa sessizce hiçbir şey yapmaz.
 */
export const playAmbientAccent = (accent: AmbientAccent): void => {
  const level = currentSfxLevel();
  if (level <= 0) return;

  const audio = getSoundContext();
  if (!audio || audio.state !== 'running') return;

  const start = audio.currentTime + 0.05;
  const master = audio.createGain();
  master.gain.setValueAtTime(ACCENT_CEILING * level, start);
  master.connect(audio.destination);

  const built = ACCENT_BUILDERS[accent](audio, start, master);
  const voice: Voice = {
    master,
    oscillators: built.oscillators,
    sources: built.sources,
  };
  activeVoices.add(voice);

  const seconds = Math.min(MAX_ACCENT_SECONDS, Math.max(0.5, built.duration));
  window.setTimeout(
    () => {
      activeVoices.delete(voice);
      disconnectVoice(voice);
    },
    seconds * 1000 + 250,
  );
};
