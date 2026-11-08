// Anime/Manga evren LOR (lore) veri tipleri
// Her seri/evren için ayrı dosyada saklanır (karışmaması için).

export interface LoreFaction {
  name: string;
  description: string;
  alignment: 'good' | 'neutral' | 'evil';
}

export interface LoreLocation {
  name: string;
  description: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
}

export interface LoreCharacter {
  name: string;
  role: string;
  powerLevel: number; // 0-100
}

export interface WorldLore {
  worldId: string;
  summary: string; // Evren özeti
  history: string; // Tarihçe
  powerSystem: {
    name: string;
    description: string;
    ranks: string[]; // Güç seviyeleri/ranklar
  };
  factions: LoreFaction[];
  locations: LoreLocation[];
  notableCharacters: LoreCharacter[];
  keyEvents: string[]; // Önemli olaylar
  themes: string[]; // Temalar
  sourceSeries: string[]; // Kaynak seriler
}