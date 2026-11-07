import { create } from 'zustand';

export interface RadioStation {
  id: string;
  name: string;
  genre: string;
  streamUrl: string;
  description: string;
  badge: string;
  color: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'listen_moe_jpop',
    name: 'LISTEN.moe Anime & J-Pop',
    genre: 'Anime OST & J-Pop',
    streamUrl: 'https://listen.moe/stream',
    description: 'Resmi LISTEN.moe canlı anime ve J-Pop radyo yayını.',
    badge: 'ANIME J-POP',
    color: '#e11d48'
  },
  {
    id: 'nightwave_plaza',
    name: 'Nightwave Plaza Lofi / Vaporwave',
    genre: 'Lofi & Synthwave',
    streamUrl: 'https://radio.plaza.one/mp3',
    description: 'Aesthetic retro anime sokakları ve gece sürüşü ritimleri.',
    badge: 'AESTHETIC LOFI',
    color: '#06b6d4'
  },
  {
    id: 'groove_salad',
    name: 'Anime Ambient & Chill Lounge',
    genre: 'Downtempo Chill',
    streamUrl: 'https://ice5.somafm.com/groovesalad-128-mp3',
    description: 'Ders çalışırken, okurken veya dinlenirken sakinleştirici anime chill ritimleri.',
    badge: 'CHILL BEATS',
    color: '#10b981'
  },
  {
    id: 'listen_moe_kpop',
    name: 'Asian Beat & Idol Pop',
    genre: 'Asian Pop & Energetic',
    streamUrl: 'https://listen.moe/kpop/stream',
    description: 'Yüksek tempolu ritimler ve enerjik animasyon müzikleri.',
    badge: 'HIGH ENERGY',
    color: '#f59e0b'
  }
];

interface RadioState {
  isPlaying: boolean;
  isBuffering: boolean;
  volume: number;
  isMuted: boolean;
  currentStationIndex: number;
  isPlayerOpen: boolean;
  isMiniMode: boolean;
  togglePlay: () => void;
  setStation: (index: number) => void;
  nextStation: () => void;
  prevStation: () => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  setPlayerOpen: (open: boolean) => void;
  toggleMiniMode: () => void;
  setIsBuffering: (buffering: boolean) => void;
}

export const useRadioStore = create<RadioState>((set, get) => {
  const savedStation = typeof window !== 'undefined' ? Number(localStorage.getItem('anisync_radio_station') || '0') : 0;
  const savedVolume = typeof window !== 'undefined' ? Number(localStorage.getItem('anisync_radio_volume') || '0.7') : 0.7;

  return {
    isPlaying: false,
    isBuffering: false,
    volume: savedVolume,
    isMuted: false,
    currentStationIndex: savedStation < RADIO_STATIONS.length ? savedStation : 0,
    isPlayerOpen: false,
    isMiniMode: true,

    togglePlay: () => {
      set((state) => ({ isPlaying: !state.isPlaying }));
    },

    setStation: (index: number) => {
      set({ currentStationIndex: index, isPlaying: true });
      if (typeof window !== 'undefined') {
        localStorage.setItem('anisync_radio_station', String(index));
      }
    },

    nextStation: () => {
      const next = (get().currentStationIndex + 1) % RADIO_STATIONS.length;
      get().setStation(next);
    },

    prevStation: () => {
      const prev = (get().currentStationIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
      get().setStation(prev);
    },

    setVolume: (val: number) => {
      set({ volume: val, isMuted: val === 0 });
      if (typeof window !== 'undefined') {
        localStorage.setItem('anisync_radio_volume', String(val));
      }
    },

    toggleMute: () => {
      set((state) => ({ isMuted: !state.isMuted }));
    },

    setPlayerOpen: (open: boolean) => set({ isPlayerOpen: open }),
    toggleMiniMode: () => set((state) => ({ isMiniMode: !state.isMiniMode })),
    setIsBuffering: (buffering: boolean) => set({ isBuffering: buffering })
  };
});
