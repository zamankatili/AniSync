import type { Media } from '../types';
import { GAMES } from '../../data/games';

const norm = (s: string) => s.toLocaleLowerCase('tr-TR');

export function searchGames(query: string, limit = 18): Media[] {
  const q = norm(query.trim());
  if (!q) return GAMES.slice(0, limit);
  const scored = GAMES.map((g) => {
    const title = norm(g.title);
    const hay = `${title} ${norm(g.subtitle ?? '')} ${norm((g.genres ?? []).join(' '))}`;
    let score = 0;
    if (title === q) score += 100;
    if (title.startsWith(q)) score += 50;
    if (title.includes(q)) score += 30;
    if (hay.includes(q)) score += 10;
    return { g, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.g);
}

export const allGames = (): Media[] => GAMES;

export const gameById = (id: string): Media | undefined => GAMES.find((g) => g.id === id);

export const gameGenres = (): string[] => {
  const set = new Set<string>();
  GAMES.forEach((g) => g.genres.forEach((genre) => set.add(genre)));
  return Array.from(set);
};
