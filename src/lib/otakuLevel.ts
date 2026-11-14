/**
 * Otaku karma / seviye hesabının tek yeri — BadgeShowcase ve ana sayfa rütbe
 * widget'ı buradan aynı veriyi okur.
 *
 * Toplam ilerleme = türetilmiş izleme karması + etkileşim XP'si (günlük
 * giriş, oyunlar, gönderiler…). Seviye eğrisi `lib/level.ts`'tedir.
 */
import type { WatchlistItem } from '../types';
import { calculateKarma, getLevelForKarma } from '../data/badgeData';

export interface OtakuLevelStats {
  /** Türetilmiş izleme karması (taban 50 + listen). */
  karma: number;
  /** Etkileşim XP'si (xp defterinden). */
  engagementXp: number;
  /** `karma + engagementXp` — seviye eğrisi buna uygulanır. */
  totalXp: number;
  completedCount: number;
  ratedCount: number;
  totalEpisodes: number;
  levelInfo: ReturnType<typeof getLevelForKarma>;
}

export function computeOtakuLevel(
  watchlist: WatchlistItem[],
  quizPlayed: boolean,
  arcadeHighScore: number,
  engagementXp: number = 0
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

  const safeEngagement = Math.max(0, Math.floor(Number(engagementXp) || 0));
  const totalXp = karma + safeEngagement;

  return {
    karma,
    engagementXp: safeEngagement,
    totalXp,
    completedCount,
    ratedCount,
    totalEpisodes,
    levelInfo: getLevelForKarma(totalXp),
  };
}
