import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import tr from '../i18n/locales/tr';
import en from '../i18n/locales/en';
import ja from '../i18n/locales/ja';
import fr from '../i18n/locales/fr';

/**
 * Ana sayfa sekme şeridi + gönderi başlığı kilidi.
 *
 * 1) Sekmeler görsel olarak "seçili" görünüyordu ama ekran okuyucuya hiçbir şey
 *    söylemiyordu. `role="tablist"` + `role="tab"` + `aria-selected` bunu
 *    düzeltiyor; bu test geri dönüşü engeller.
 * 2) Gönderi başlığı Türkçe sabit metindi (`'Topluluk Gönderisi'`), yani
 *    EN/JA/FR arayüzünde de Türkçe görünüyordu. Artık `t('community_post')`.
 */
const home = readFileSync(resolve(process.cwd(), 'src/pages/Home.tsx'), 'utf8');

describe('Home — sekme erişilebilirliği', () => {
  it('declares a tablist container', () => {
    expect(home).toContain('role="tablist"');
  });

  it('marks every tab with role=tab and aria-selected', () => {
    expect(home.match(/role="tab"/g)?.length).toBe(5);
    expect(home.match(/aria-selected=\{/g)?.length).toBe(5);
  });

  it('keeps the feed tab selected by default', () => {
    expect(home).toContain("aria-selected={activeTab === 'feed'}");
  });
});

describe('Home — yerelleştirilmiş gönderi başlığı', () => {
  it('uses the i18n key instead of a hardcoded Turkish title', () => {
    expect(home).toContain("title: t('community_post')");
    expect(home).not.toContain('Topluluk Gönderisi');
  });

  it('has the key in all four languages', () => {
    const bundles = { tr, en, ja, fr } as const;
    for (const [lang, bundle] of Object.entries(bundles)) {
      const value = (bundle as { translation: Record<string, string> }).translation['community_post'];
      expect(value, `missing community_post in ${lang}`).toBeTruthy();
      expect(value).not.toBe('community_post');
    }
  });
});
