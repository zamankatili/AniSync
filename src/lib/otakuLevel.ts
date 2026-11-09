/**
 * Otaku karma / seviye hesabının tek yeri — BadgeShowcase ve ana sayfa rütbe
 * widget'ı buradan aynı veriyi okur.
 */
import type { WatchlistItem } from '../types';
import { calculateKarma, getLevelForKarma } from '../data/badgeData';

export interface OtakuLevelStats {
  karma: number;
  completedCount: number;
  ratedCount: number;
  totalEpisodes: number;
  levelInfo: ReturnType<typeof getLevelForKarma>;
}

export function computeOtakuLevel(
  watchlist: WatchlistItem[],
  quizPlayed: boolean,
  arcadeHighScore: number
): OtakuLevelStats {
  const completedCount = watchlist.filter((w) => w.status === 'completed').length;
  const ratedCount = watchlist.filter((w) => (w.userScore || 0) > 0).length;
  const totalEpisodes = watchlist
    .filter((w) => w.status === 'completed')
    .reduce((acc, w) => acc + (w.anime?.episodes || w.episodesWatched || 0), 0);

  const karma = calculateKarma(
    watchlist.length,
    completedCount,
    ratedCount,
    totalEpisodes,
    quizPlayed,
    arcadeHighScore
  );

  return { karma, completedCount, ratedCount, totalEpisodes, levelInfo: getLevelForKarma(karma) };
}
