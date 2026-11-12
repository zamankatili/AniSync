import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tr from './tr';
import en from './en';
import ja from './ja';
import fr from './fr';
import { adminTranslations } from '../../i18nAdmin';
import { animeLifeSimTranslations } from '../../i18nAnimeLifeSim';

/**
 * i18n parity gate.
 *
 * `src/i18n.ts` merges three sources per language at runtime:
 *   1. `locales/{lang}.ts`  (main UI strings)
 *   2. `animeLifeSimTranslations[lang]` (Life Sim page)
 *   3. `adminTranslations[lang]` (admin panel + reporting)
 *
 * A missing key falls back to the raw key string in the UI (or English), so
 * parity has to be tested on the merged bundle — not per file.
 */
const langs = ['tr', 'en', 'ja', 'fr'] as const;

const merged: Record<(typeof langs)[number], Record<string, string>> = {
  tr: { ...tr.translation, ...(animeLifeSimTranslations.tr as Record<string, string>), ...adminTranslations.tr },
  en: { ...en.translation, ...(animeLifeSimTranslations.en as Record<string, string>), ...adminTranslations.en },
  ja: { ...ja.translation, ...(animeLifeSimTranslations.ja as Record<string, string>), ...adminTranslations.ja },
  fr: { ...fr.translation, ...(animeLifeSimTranslations.fr as Record<string, string>), ...adminTranslations.fr },
};

const srcRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const collectSourceFiles = (): string[] => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        if (name === 'locales') continue;
        walk(full);
      } else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) {
        files.push(full);
      }
    }
  };
  walk(srcRoot);
  return files;
};

describe('i18n parity', () => {
  const baseKeys = Object.keys(merged.en).sort();

  for (const lang of langs) {
    if (lang === 'en') continue;
    it(`${lang} has every English key`, () => {
      const keys = new Set(Object.keys(merged[lang]));
      const missing = baseKeys.filter((key) => !keys.has(key));
      expect(missing).toEqual([]);
    });
  }

  it('every locale string is non-empty', () => {
    for (const lang of langs) {
      const empties = Object.entries(merged[lang])
        .filter(([, value]) => typeof value !== 'string' || value.trim().length === 0)
        .map(([key]) => key);
      expect(empties, `${lang} has empty strings`).toEqual([]);
    }
  });

  it('has a translation for every literal t() key used in src', () => {
    const files = collectSourceFiles();

    const missing = new Map<string, Set<string>>();
    for (const file of files) {
      const text = readFileSync(file, 'utf8');
      for (const match of text.matchAll(/\bt\(\s*['"]([A-Za-z0-9_]+)['"]/g)) {
        const key = match[1];
        if (!(key in merged.en)) {
          if (!missing.has(key)) missing.set(key, new Set());
          missing.get(key)!.add(file.slice(srcRoot.length + 1));
        }
      }
    }

    const report = [...missing.entries()].map(([key, where]) => `${key} (${[...where].join(', ')})`);
    expect(report).toEqual([]);
  });

  it('does not hardcode Turkish UI text in non-admin components', () => {
    const turkish = /[çğıöşüÇĞİÖŞÜ]/;
    const allow = /AN[İI]SYNC|SH[İI]NJUKU|KÖŞE/i;
    const violations: string[] = [];

    for (const file of collectSourceFiles()) {
      const rel = file.slice(srcRoot.length + 1).replace(/\\/g, '/');
      if (rel.startsWith('pages/admin/')) continue;

      const raw = readFileSync(file, 'utf8');
      const text = raw
        .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
        .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(Math.max(0, m.length - p1.length)));

      const candidates: Array<{ value: string; index: number }> = [];
      for (const m of text.matchAll(/(?:placeholder|aria-label|title|alt)=(["'])([^"'\n]*)\1/g)) {
        if (m[2]) candidates.push({ value: m[2], index: m.index ?? 0 });
      }
      // t('key', 'Turkish fallback') — a fallback is still a hardcoded user-facing string.
      for (const m of text.matchAll(/\bt\(\s*['"][A-Za-z0-9_]+['"]\s*,\s*(['"])([^"'\n]*)\1/g)) {
        if (m[2]) candidates.push({ value: m[2], index: m.index ?? 0 });
      }
      if (file.endsWith('.tsx')) {
        for (const m of text.matchAll(/>([^<>{}]+)</g)) {
          candidates.push({ value: m[1].replace(/\s+/g, ' '), index: m.index ?? 0 });
        }
      }

      for (const candidate of candidates) {
        const value = candidate.value.trim();
        if (value.length < 3) continue;
        if (!turkish.test(value) || allow.test(value)) continue;
        const line = text.slice(0, candidate.index).split('\n').length;
        violations.push(`${rel}:${line} ${value.slice(0, 70)}`);
      }
    }

    expect(violations).toEqual([]);
  });
});
