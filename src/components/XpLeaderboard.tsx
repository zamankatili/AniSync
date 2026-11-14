/**
 * XpLeaderboard — Toplam XP'ye göre sıralı ilk 10 kullanıcı +
 * "nasıl XP kazanılır" düzen kartı.
 *
 * Dürüstlük notu: xpTotal istemci-yazılabilir bir alandır (rules: sahibine
 * update izni var). Sıralama yalnızca kesitsel bir sosyal işarettir; hile
 * sunucuda düzeltilmeden elenmez. Firestore hatasında liste boş gösterilir.
 */

import React, { useEffect, useState } from 'react';
import { Crown, Flame, Info } from 'lucide-react';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { fetchXpLeaderboard, type LeaderboardRow } from '../lib/xpSync';
import { DAILY_XP_CAP } from '../lib/xp';

const rankStyle = (rank: number): string => {
  if (rank === 1) return 'bg-amber-400 text-black border-white';
  if (rank === 2) return 'bg-neutral-300 text-black border-white';
  if (rank === 3) return 'bg-orange-700 text-white border-white';
  return 'bg-neutral-900 text-neutral-300 border-white/30';
};

export const XpLeaderboard: React.FC = () => {
  const { t } = useAppTranslation();
  const { currentUser } = useAppStore();
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchXpLeaderboard(10).then((data) => {
      if (!cancelled) setRows(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const ruleKeys = [
    'xp_rule_daily_login',
    'xp_rule_game_finish',
    'xp_rule_quiz_finish',
    'xp_rule_forum_post',
    'xp_rule_forum_comment',
    'xp_rule_lore_read',
    'xp_rule_scene_view',
    'xp_rule_list_add',
    'xp_rule_watch_party',
  ];

  return (
    <div className="space-y-6">
      {/* Liderlik tablosu */}
      <div className="bg-black border-4 border-white neo-shadow-white">
        <div className="flex items-center justify-between gap-2 border-b-4 border-white/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-amber-400" strokeWidth={2.5} />
            <h3 className="font-black text-white text-xs tracking-widest uppercase">{t('xp_leaderboard_title')}</h3>
          </div>
          <span className="text-[9px] font-black uppercase text-neutral-500 tracking-widest">
            {t('xp_leaderboard_subtitle')}
          </span>
        </div>

        {rows === null ? (
          <div className="px-4 py-6 text-center text-xs font-black uppercase text-neutral-500 animate-pulse">
            {t('loading', { defaultValue: '...' })}
          </div>
        ) : rows.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs font-bold text-neutral-400">{t('xp_leaderboard_empty')}</p>
            {!currentUser && (
              <p className="mt-2 text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                {t('xp_leaderboard_login')}
              </p>
            )}
          </div>
        ) : (
          <ol className="divide-y divide-white/10">
            {rows.map((row, index) => {
              const rank = index + 1;
              const isYou = currentUser?.uid === row.uid;
              return (
                <li
                  key={row.uid}
                  className={`flex items-center gap-3 px-4 py-2.5 ${isYou ? 'bg-amber-400/10' : ''}`}
                >
                  <span
                    className={`w-8 h-8 shrink-0 border-2 flex items-center justify-center font-black text-sm ${rankStyle(rank)}`}
                  >
                    {rank}
                  </span>
                  {row.avatar ? (
                    <img
                      src={row.avatar}
                      alt=""
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 shrink-0 border-2 border-white/40 object-cover" decoding="async" />
                  ) : (
                    <span className="w-8 h-8 shrink-0 border-2 border-white/40 bg-neutral-800 flex items-center justify-center font-black text-white text-xs">
                      {row.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-black text-white uppercase tracking-wide">
                      {row.name}
                      {isYou && (
                        <span className="ml-2 text-[9px] text-amber-400 align-middle">{t('xp_leaderboard_you')}</span>
                      )}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs font-black text-amber-400 tabular-nums">
                    {row.xpTotal.toLocaleString()} <span className="text-[9px] text-neutral-500">XP</span>
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Nasıl XP kazanılır? */}
      <div className="bg-neutral-950 border-2 border-white/20 p-4">
        <div className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest border-b border-white/10 pb-2">
          <Flame size={13} className="text-orange-400" strokeWidth={2.5} />
          <span>{t('xp_rules_title')}</span>
        </div>
        <ul className="mt-2 space-y-1.5 text-[11px] leading-snug text-neutral-300">
          {ruleKeys.map((key) => (
            <li key={key} className="flex gap-2">
              <span className="shrink-0 text-amber-400">▸</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-2 flex items-start gap-1.5 text-[10px] font-bold text-neutral-500 leading-snug">
          <Info size={11} className="mt-0.5 shrink-0" />
          <span>{t('xp_rules_cap_note', { cap: DAILY_XP_CAP })}</span>
        </p>
      </div>
    </div>
  );
};

export default XpLeaderboard;
