import { describe, it, expect } from 'vitest';
import {
  EMPTY_XP_SNAPSHOT,
  STREAK_MILESTONES,
  DAILY_XP_CAP,
  actionCountForDay,
  applyDailyVisit,
  awardXp,
  dayXp,
  mergeSnapshots,
  sanitizeSnapshot,
  type XpSnapshot,
} from './xp';

const DAY1 = '2026-11-13';
const DAY2 = '2026-11-14';
const DAY6 = '2026-11-18'; // 5 günlük boşluk

const clone = (snapshot: XpSnapshot): XpSnapshot => JSON.parse(JSON.stringify(snapshot)) as XpSnapshot;

describe('sanitizeSnapshot', () => {
  it('boş/bozuk kayıtları güvenli hâle getirir', () => {
    expect(sanitizeSnapshot(null).totalXp).toBe(0);
    expect(sanitizeSnapshot({ entries: 'bozuk', totalXp: -5 }).totalXp).toBe(0);
  });

  it('mükerrer anahtarları tekleştirir ve negatif değerleri budar', () => {
    const damaged = {
      totalXp: 40,
      streak: -3,
      bestStreak: 2,
      lastVisitDate: DAY1,
      updatedAt: 1,
      entries: [
        { key: 'a', action: 'daily_login', xp: 10, day: DAY1, at: 1 },
        { key: 'a', action: 'daily_login', xp: 10, day: DAY1, at: 2 },
        { key: 'b', action: 'game_finish', xp: 30, day: DAY1, at: 3 },
      ],
    };
    const sanitized = sanitizeSnapshot(damaged);
    expect(sanitized.entries).toHaveLength(2);
    expect(sanitized.totalXp).toBe(40);
    expect(sanitized.streak).toBe(0);
    expect(sanitized.bestStreak).toBe(2);
  });
});

describe('applyDailyVisit', () => {
  it('sıfırdan başlar: 1 gün serisi + 10 XP', () => {
    const result = applyDailyVisit(EMPTY_XP_SNAPSHOT, DAY1, 1000);
    expect(result.streak).toBe(1);
    expect(result.loginXp).toBe(10);
    expect(result.streakBonusXp).toBe(0);
    expect(result.snapshot.totalXp).toBe(10);
  });

  it('aynı gün ikinci kez giriş: XP yok', () => {
    const first = applyDailyVisit(EMPTY_XP_SNAPSHOT, DAY1, 1000);
    const second = applyDailyVisit(first.snapshot, DAY1, 2000);
    expect(second.alreadyVisited).toBe(true);
    expect(second.loginXp).toBe(0);
    expect(second.snapshot.totalXp).toBe(first.snapshot.totalXp);
  });

  it('ertesi gün seri büyür; atlanan gün sıfırlar', () => {
    let snapshot = EMPTY_XP_SNAPSHOT;
    snapshot = applyDailyVisit(snapshot, DAY1, 1000).snapshot;
    snapshot = applyDailyVisit(snapshot, DAY2, 2000).snapshot;
    expect(snapshot.streak).toBe(2);
    snapshot = applyDailyVisit(snapshot, DAY6, 3000).snapshot;
    expect(snapshot.streak).toBe(1);
  });

  it('3. gün kilometre bonusu verir (+10)', () => {
    let snapshot = EMPTY_XP_SNAPSHOT;
    snapshot = applyDailyVisit(snapshot, '2026-11-01', 1000).snapshot;
    snapshot = applyDailyVisit(snapshot, '2026-11-02', 2000).snapshot;
    const third = applyDailyVisit(snapshot, '2026-11-03', 3000);
    expect(third.streak).toBe(3);
    expect(third.streakBonusXp).toBe(10);
  });

  it('7. gün ve 30. gün kilometre bonusları tanımlıdır', () => {
    const milestones = new Map(STREAK_MILESTONES);
    expect(milestones.get(3)).toBe(10);
    expect(milestones.get(7)).toBe(25);
    expect(milestones.get(14)).toBe(60);
    expect(milestones.get(30)).toBe(150);
  });
});

describe('awardXp', () => {
  it('kolay oyun 20, orta 30, zor 40 XP verir', () => {
    const base = clone(EMPTY_XP_SNAPSHOT);
    expect(awardXp(base, { action: 'game_finish', key: 'k1', day: DAY1, difficulty: 'easy', won: true }).awarded).toBe(20);
    expect(awardXp(base, { action: 'game_finish', key: 'k2', day: DAY1, difficulty: 'medium', won: true }).awarded).toBe(30);
    expect(awardXp(base, { action: 'game_finish', key: 'k3', day: DAY1, difficulty: 'hard', won: true }).awarded).toBe(40);
  });

  it('kayıpta 5 XP verir', () => {
    const result = awardXp(clone(EMPTY_XP_SNAPSHOT), { action: 'game_finish', key: 'k1', day: DAY1, difficulty: 'hard', won: false });
    expect(result.awarded).toBe(5);
  });

  it('aynı anahtar ikinci kez XP vermez', () => {
    const first = awardXp(clone(EMPTY_XP_SNAPSHOT), { action: 'game_finish', key: 'same', day: DAY1, difficulty: 'easy', won: true });
    const second = awardXp(first.snapshot, { action: 'game_finish', key: 'same', day: DAY1, difficulty: 'easy', won: true });
    expect(first.awarded).toBe(20);
    expect(second.awarded).toBe(0);
    expect(second.status).toBe('duplicate');
  });

  it('oyun: günde en fazla 3 hak (60 XP tavanı)', () => {
    let snapshot = clone(EMPTY_XP_SNAPSHOT);
    for (let i = 0; i < 3; i += 1) {
      snapshot = awardXp(snapshot, { action: 'game_finish', key: `g${i}`, day: DAY1, difficulty: 'easy', won: true }).snapshot;
    }
    const fourth = awardXp(snapshot, { action: 'game_finish', key: 'g4', day: DAY1, difficulty: 'hard', won: true });
    expect(fourth.status).toBe('day_count_cap');
    expect(actionCountForDay(snapshot, 'game_finish', DAY1)).toBe(3);
    expect(dayXp(snapshot, DAY1)).toBe(60);
  });

  it('gönderi ve yorum tavanları ayrıdır', () => {
    let snapshot = clone(EMPTY_XP_SNAPSHOT);
    for (let i = 0; i < 2; i += 1) {
      snapshot = awardXp(snapshot, { action: 'forum_post', key: `p${i}`, day: DAY1 }).snapshot;
    }
    expect(awardXp(snapshot, { action: 'forum_post', key: 'p3', day: DAY1 }).status).toBe('day_count_cap');
    // Yorum tavanına takılı değil
    expect(awardXp(snapshot, { action: 'forum_comment', key: 'c1', day: DAY1 }).awarded).toBe(5);
  });

  it('global günlük tavanı aşamaz', () => {
    // 30 XP lore'a (6x5) + 60 oyun + 30 gönderi + 20 yorum + 20 watch party + 25 liste = 185
    let snapshot = clone(EMPTY_XP_SNAPSHOT);
    for (const [action, prefix, count] of [['lore_read', 'l', 6], ['game_finish', 'g', 3], ['forum_post', 'p', 2], ['forum_comment', 'c', 4], ['watch_party', 'w', 1], ['list_add', 'a', 5]] as const) {
      for (let i = 0; i < count; i += 1) {
        snapshot = awardXp(snapshot, {
          action,
          key: `${prefix}${i}`,
          day: DAY1,
          difficulty: action === 'game_finish' ? 'easy' : undefined,
          won: action === 'game_finish' ? true : undefined,
        }).snapshot;
      }
    }
    const total = dayXp(snapshot, DAY1);
    expect(total).toBe(185);
    // Kalan kota: DAILY_XP_CAP - 185; zorlu oyun 40 XP istesin, 115 kesilir
    const capCheck = awardXp(snapshot, { action: 'quiz_finish', key: 'qz', day: DAY1 });
    expect(capCheck.awarded).toBeLessThanOrEqual(DAILY_XP_CAP - total);
    expect(capCheck.awarded).toBeGreaterThan(0);
  });
});

describe('mergeSnapshots', () => {
  it('misafir defterini hesaba taşır; ortak kazanımlar bir kez sayılır', () => {
    const account = applyDailyVisit(EMPTY_XP_SNAPSHOT, DAY1, 1000).snapshot; // 10 (anahtar: daily_login:2026-11-13)
    const guest = clone(applyDailyVisit(clone(EMPTY_XP_SNAPSHOT), DAY1, 1500).snapshot); // 10 (aynı anahtar)
    guest.entries.push({ key: 'unique-guest', action: 'forum_comment', xp: 5, day: DAY1, at: 9999 });
    guest.totalXp += 5;

    const merged = mergeSnapshots(account, guest);
    // id çakışan günlük giriş bir kez sayılır (overlap) + misafire özgü yorum da gelir
    expect(merged.totalXp).toBe(10 + 5);
    expect(merged.entries.filter((entry) => entry.key === 'daily_login:2026-11-13')).toHaveLength(1);
    expect(merged.entries.some((entry) => entry.key === 'unique-guest')).toBe(true);
  });

  it('giriş serisi, son girişi daha yakın olana devredilir', () => {
    const older: XpSnapshot = { ...EMPTY_XP_SNAPSHOT, streak: 5, bestStreak: 5, lastVisitDate: '2026-10-01' };
    const fresh: XpSnapshot = { ...EMPTY_XP_SNAPSHOT, streak: 2, bestStreak: 2, lastVisitDate: DAY2 };
    const merged = mergeSnapshots(older, fresh);
    expect(merged.streak).toBe(2);
    expect(merged.lastVisitDate).toBe(DAY2);
    expect(merged.bestStreak).toBe(5);
  });
});
