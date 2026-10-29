export interface Badge {
  id: string;
  name: string;
  titleTr: string;
  description: string;
  requirement: string;
  icon: string;
  color: string;
  bgGradient: string;
  category: 'izleme' | 'sosyal' | 'quiz' | 'ozel';
  karmaReward: number;
}

export interface UserBadgeProgress {
  badge: Badge;
  isUnlocked: boolean;
  unlockedAt?: string;
  progressPercent: number; // 0 - 100
  currentValue: number;
  targetValue: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  minKarma: number;
  maxKarma: number;
  badge: string;
  color: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Acemi Otaku (Genin)', minKarma: 0, maxKarma: 200, badge: '🌱', color: '#10b981' },
  { level: 2, title: 'Hevesli İzleyici (Chunin)', minKarma: 200, maxKarma: 600, badge: '⚡', color: '#06b6d4' },
  { level: 3, title: 'Sezon Gazisi (Hashira)', minKarma: 600, maxKarma: 1400, badge: '⚔️', color: '#f59e0b' },
  { level: 4, title: 'Özel Derece Büyücü (Hokage)', minKarma: 1400, maxKarma: 2800, badge: '🔮', color: '#a855f7' },
  { level: 5, title: 'Kadim Efsane (Korsan Kralı)', minKarma: 2800, maxKarma: 999999, badge: '👑', color: '#ef4444' }
];

export const BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'first_step',
    titleTr: 'İlk Adım',
    description: 'Anime dünyasına ilk adımını attın ve listene bir anime ekledin.',
    requirement: 'Listeye en az 1 anime ekle',
    icon: '🌱',
    color: '#10b981',
    bgGradient: 'from-emerald-500/20 to-emerald-950/40',
    category: 'izleme',
    karmaReward: 50
  },
  {
    id: 'titan_slayer',
    name: 'titan_slayer',
    titleTr: 'Dev Avcısı',
    description: 'Duvarların ötesine geçtin! Aksiyon ve Shounen animelerinde uzmanlaştın.',
    requirement: 'En az 3 Shounen / Aksiyon animesi tamamla',
    icon: '⚔️',
    color: '#f97316',
    bgGradient: 'from-orange-500/20 to-orange-950/40',
    category: 'izleme',
    karmaReward: 120
  },
  {
    id: 'binge_master',
    name: 'binge_master',
    titleTr: 'Maraton Canavarı',
    description: 'Gözünü kırpmadan sabahladın. Onlarca bölümü peş peşe tükettin.',
    requirement: 'Toplamda 50\'den fazla bölüm bitir',
    icon: '🍿',
    color: '#eab308',
    bgGradient: 'from-amber-500/20 to-amber-950/40',
    category: 'izleme',
    karmaReward: 150
  },
  {
    id: 'shadow_monarch',
    name: 'shadow_monarch',
    titleTr: 'Gölge Hükümdarı',
    description: 'Gölge ordun gibi anime koleksiyonun da durmaksızın genişliyor.',
    requirement: 'Listende en az 10 anime bulundur',
    icon: '🔮',
    color: '#8b5cf6',
    bgGradient: 'from-violet-500/20 to-violet-950/40',
    category: 'izleme',
    karmaReward: 200
  },
  {
    id: 'music_maestro',
    name: 'music_maestro',
    titleTr: 'OST Ustası',
    description: 'İlk notasından animeyi tanırsın. Müzik Quizinde hünerini kanıtladın.',
    requirement: 'Anime Müzik Quizinde en az 1 oyun tamamla veya şarkı bil',
    icon: '🎧',
    color: '#ec4899',
    bgGradient: 'from-pink-500/20 to-pink-950/40',
    category: 'quiz',
    karmaReward: 100
  },
  {
    id: 'watch_party_host',
    name: 'watch_party_host',
    titleTr: 'Sinema Kulübü Lideri',
    description: 'Birlikte İzleme (Watch Party) odalarına katılarak toplulukla sinerji yarattın.',
    requirement: 'Watch Party odasına katıl veya bir canlı oda ziyaret et',
    icon: '🎬',
    color: '#3b82f6',
    bgGradient: 'from-blue-500/20 to-blue-950/40',
    category: 'sosyal',
    karmaReward: 120
  },
  {
    id: 'elite_critic',
    name: 'elite_critic',
    titleTr: 'Seçkin Eleştirmen',
    description: 'Sadece izlemekle kalmayıp animeleri puanlayarak zevkini konuşturdun.',
    requirement: 'En az 5 farklı animeye kişisel puan ver',
    icon: '⭐',
    color: '#fbbf24',
    bgGradient: 'from-yellow-500/20 to-yellow-950/40',
    category: 'sosyal',
    karmaReward: 140
  },
  {
    id: 'shoujo_heart',
    name: 'shoujo_heart',
    titleTr: 'Korkusuz Romantik',
    description: 'Romantizm ve hayatın içinden duygusal hikayelere kalbini açtın.',
    requirement: 'Romantizm veya Dram türünde anime izle',
    icon: '💖',
    color: '#f43f5e',
    bgGradient: 'from-rose-500/20 to-rose-950/40',
    category: 'izleme',
    karmaReward: 100
  },
  {
    id: 'archivist',
    name: 'archivist',
    titleTr: 'Koleksiyon Mimarı',
    description: '3x3 grid kartı oluşturdun veya listelerini dışarı aktararak arşivledin.',
    requirement: '3x3 Anime kartı oluştur veya liste işlemi yap',
    icon: '📐',
    color: '#06b6d4',
    bgGradient: 'from-cyan-500/20 to-cyan-950/40',
    category: 'ozel',
    karmaReward: 130
  },
  {
    id: 'limitless',
    name: 'limitless',
    titleTr: 'Sonsuzluk Laneti',
    description: 'Gojo Satoru gibi sınırları aştın! 1000+ Karma puanına ulaştın.',
    requirement: 'Toplamda 1000 Karma puanını geç',
    icon: '👁️',
    color: '#6366f1',
    bgGradient: 'from-indigo-500/20 to-indigo-950/40',
    category: 'ozel',
    karmaReward: 250
  },
  {
    id: 'community_flame',
    name: 'community_flame',
    titleTr: 'Topluluk Meşalesi',
    description: 'Forumda, günlük ankette veya sohbet odalarında varlığını hissettirdin.',
    requirement: 'Günlük ankete katıl veya forumda gönderi paylaş',
    icon: '🔥',
    color: '#ef4444',
    bgGradient: 'from-red-500/20 to-red-950/40',
    category: 'sosyal',
    karmaReward: 110
  },
  {
    id: 'pirate_king',
    name: 'pirate_king',
    titleTr: 'Korsan Kralı',
    description: 'Büyük hatların sonuna ulaştın. Topluluğun en kıdemli otakularındansın!',
    requirement: 'En az 25 anime izle veya 2000 Karma puanına eriş',
    icon: '👑',
    color: '#fb7185',
    bgGradient: 'from-rose-500/20 to-purple-950/40',
    category: 'ozel',
    karmaReward: 500
  }
];

export function calculateKarma(
  watchlistCount: number,
  completedCount: number,
  ratedCount: number,
  totalEpisodes: number,
  quizPlayed: boolean,
  quizScore: number
): number {
  let karma = 50; // base welcome bonus
  karma += watchlistCount * 15;
  karma += completedCount * 40;
  karma += ratedCount * 10;
  karma += Math.min(totalEpisodes * 2, 800);
  if (quizPlayed) karma += 80;
  karma += Math.min(quizScore, 500);
  return karma;
}

export function getLevelForKarma(karma: number): {
  currentLevel: LevelInfo;
  nextLevel: LevelInfo | null;
  progressPercent: number;
  karmaInCurrentLevel: number;
  karmaNeededForNext: number;
} {
  const current = LEVELS.slice().reverse().find(l => karma >= l.minKarma) || LEVELS[0];
  const next = LEVELS.find(l => l.level === current.level + 1) || null;

  if (!next) {
    return {
      currentLevel: current,
      nextLevel: null,
      progressPercent: 100,
      karmaInCurrentLevel: karma - current.minKarma,
      karmaNeededForNext: 0
    };
  }

  const range = next.minKarma - current.minKarma;
  const currentProgress = karma - current.minKarma;
  const progressPercent = Math.min(100, Math.max(0, Math.floor((currentProgress / range) * 100)));

  return {
    currentLevel: current,
    nextLevel: next,
    progressPercent,
    karmaInCurrentLevel: currentProgress,
    karmaNeededForNext: next.minKarma - karma
  };
}

export function evaluateBadges(
  watchlist: any[],
  quizData?: { played: boolean; highScore: number }
): UserBadgeProgress[] {
  const totalAnime = watchlist.length;
  const completed = watchlist.filter(w => w.status === 'completed');
  const rated = watchlist.filter(w => (w.userScore || 0) > 0);
  const totalEpisodes = completed.reduce((acc, w) => acc + (w.anime?.episodes || w.episodesWatched || 0), 0);
  
  // Genre counting
  const actionCount = watchlist.filter(w => 
    w.anime?.genres?.some((g: any) => g.name?.includes('Action') || g.name?.includes('Shounen') || g.name?.includes('Aksiyon'))
  ).length;

  const romanceCount = watchlist.filter(w => 
    w.anime?.genres?.some((g: any) => g.name?.includes('Romance') || g.name?.includes('Drama') || g.name?.includes('Romantizm') || g.name?.includes('Dram'))
  ).length;

  const baseKarma = calculateKarma(
    totalAnime, 
    completed.length, 
    rated.length, 
    totalEpisodes, 
    !!quizData?.played, 
    quizData?.highScore || 0
  );

  return BADGES.map((b) => {
    let currentVal = 0;
    let targetVal = 1;
    let isUnlocked = false;

    switch (b.id) {
      case 'first_step':
        currentVal = totalAnime;
        targetVal = 1;
        isUnlocked = currentVal >= targetVal;
        break;
      case 'titan_slayer':
        currentVal = actionCount;
        targetVal = 3;
        isUnlocked = currentVal >= targetVal;
        break;
      case 'binge_master':
        currentVal = totalEpisodes;
        targetVal = 50;
        isUnlocked = currentVal >= targetVal;
        break;
      case 'shadow_monarch':
        currentVal = totalAnime;
        targetVal = 10;
        isUnlocked = currentVal >= targetVal;
        break;
      case 'music_maestro':
        currentVal = quizData?.played ? 1 : 0;
        targetVal = 1;
        isUnlocked = currentVal >= targetVal;
        break;
      case 'watch_party_host':
        currentVal = 1; // Unlocked by default when joining/visiting
        targetVal = 1;
        isUnlocked = true;
        break;
      case 'elite_critic':
        currentVal = rated.length;
        targetVal = 5;
        isUnlocked = currentVal >= targetVal;
        break;
      case 'shoujo_heart':
        currentVal = romanceCount;
        targetVal = 1;
        isUnlocked = currentVal >= targetVal;
        break;
      case 'archivist':
        currentVal = 1;
        targetVal = 1;
        isUnlocked = true;
        break;
      case 'limitless':
        currentVal = baseKarma;
        targetVal = 1000;
        isUnlocked = currentVal >= targetVal;
        break;
      case 'community_flame':
        currentVal = 1;
        targetVal = 1;
        isUnlocked = true;
        break;
      case 'pirate_king':
        currentVal = totalAnime;
        targetVal = 25;
        isUnlocked = currentVal >= targetVal || baseKarma >= 2000;
        break;
      default:
        isUnlocked = false;
    }

    const progressPercent = isUnlocked 
      ? 100 
      : Math.min(100, Math.max(0, Math.floor((currentVal / targetVal) * 100)));

    return {
      badge: b,
      isUnlocked,
      progressPercent,
      currentValue: currentVal,
      targetValue: targetVal,
      unlockedAt: isUnlocked ? 'Kazanıldı' : undefined
    };
  });
}
