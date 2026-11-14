import { describe, it, expect } from 'vitest';
import { ICONIC_SCENES, SCENE_CATEGORY_LABEL, seriesAccent, type SceneCategory } from './iconicScenes';
import type { Lang4 } from './universePaths';

const LANGS: Lang4[] = ['tr', 'en', 'ja', 'fr'];
const expectLocalized = (value: Record<Lang4, string>, label: string) => {
  for (const lang of LANGS) {
    expect(value[lang], `${label} [${lang}]`).toBeTypeOf('string');
    expect(value[lang].trim().length, `${label} [${lang}] boş olmamalı`).toBeGreaterThan(0);
  }
};

const CATEGORIES: SceneCategory[] = ['duygusal', 'atmosfer', 'aksiyon'];

describe('iconicScenes', () => {
  it('en az 12 kayıt ve 10+ farklı seri içerir', () => {
    expect(ICONIC_SCENES.length).toBeGreaterThanOrEqual(12);
    const series = new Set(ICONIC_SCENES.map((scene) => scene.series));
    expect(series.size).toBeGreaterThanOrEqual(10);
  });

  it('kimlikleri benzersizdir', () => {
    const ids = ICONIC_SCENES.map((scene) => scene.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('her kayıt dört dilde eksiksiz (arc, title, why)', () => {
    for (const scene of ICONIC_SCENES) {
      expectLocalized(scene.arc, `${scene.id} arc`);
      expectLocalized(scene.title, `${scene.id} title`);
      expectLocalized(scene.why, `${scene.id} why`);
    }
  });

  it('alıntılar varsa dört dilde doldurulmuştur', () => {
    for (const scene of ICONIC_SCENES) {
      if (scene.quote) expectLocalized(scene.quote, `${scene.id} quote`);
    }
  });

  it('kategori geçerli ve her kategori dağıtımı açıklamaları tamam', () => {
    for (const scene of ICONIC_SCENES) {
      expect(CATEGORIES, `${scene.id} kategori`).toContain(scene.category);
    }
    for (const cat of CATEGORIES) {
      expectLocalized(SCENE_CATEGORY_LABEL[cat], `kategori ${cat}`);
    }
  });

  it('videoId varsa biçim uygun ve kanal etiketi yazıya dökülmüş', () => {
    for (const scene of ICONIC_SCENES) {
      if (!scene.videoId) continue;
      expect(scene.videoId).toMatch(/^[A-Za-z0-9_-]{10,12}$/);
      expect(scene.channelLabel, `${scene.id} channelLabel`).toBeTruthy();
    }
  });

  it('spoiler kademesi izinli kümeden', () => {
    for (const scene of ICONIC_SCENES) {
      expect(['none', 'hafif', 'agir']).toContain(scene.spoiler);
    }
  });

  it('seriesAccent her seri için geçerli sınıf döndürür', () => {
    for (const scene of ICONIC_SCENES) {
      expect(seriesAccent(scene.series)).toMatch(/^bg-/);
    }
  });
});
