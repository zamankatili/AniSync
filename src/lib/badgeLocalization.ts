/**
 * Rozet ve seviye metinlerinin çok dilli karşılıkları.
 * `badgeData.ts` içindeki Türkçe metinler temel alınır; burada en/ja/fr çevirileri tutulur.
 * Eksik dilde Türkçe metne düşer.
 */
import i18n from '../i18n';
import { RANK_TIERS } from './level';

export interface LocalizedText {
  tr: string;
  en: string;
  ja: string;
  fr: string;
}

const L = (tr: string, en: string, ja: string, fr: string): LocalizedText => ({ tr, en, ja, fr });

const baseLang = (lang?: string): string => {
  const raw = lang || i18n.language || 'tr';
  return String(raw).split('-')[0].toLowerCase();
};

export const pickText = (entry: LocalizedText | undefined, fallback = ''): string => {
  if (!entry) return fallback;
  const base = baseLang();
  return (entry as any)[base] || entry.tr || fallback;
};

interface BadgeTextEntry {
  title: LocalizedText;
  description: LocalizedText;
  requirement: LocalizedText;
}

export const BADGE_TEXTS: Record<string, BadgeTextEntry> = {
  first_step: {
    title: L('İlk Adım', 'First Step', 'ファーストステップ', 'Premier Pas'),
    description: L('Anime dünyasına ilk adımını attın ve listene bir anime ekledin.', 'You took your first step into the anime world and added a show to your list.', 'アニメの世界への第一歩。リストに1作品を追加しました。', "Tu as fait ton premier pas dans le monde de l'anime et ajouté une série à ta liste."),
    requirement: L('Listeye en az 1 anime ekle', 'Add at least 1 anime to your list', 'リストにアニメを1作品以上追加', 'Ajoute au moins 1 anime à ta liste'),
  },
  titan_slayer: {
    title: L('Dev Avcısı', 'Titan Slayer', '巨人ハンター', 'Pourfendeur de Titans'),
    description: L('Duvarların ötesine geçtin! Aksiyon ve Shounen animelerinde uzmanlaştın.', 'You went beyond the walls! You mastered action and shounen anime.', '壁の向こうへ！アクションと少年アニメを極めました。', 'Tu es allé au-delà des murs ! Tu maîtrises les animes d\'action et shounen.'),
    requirement: L('En az 3 Shounen / Aksiyon animesi tamamla', 'Complete at least 3 shounen / action anime', '少年/アクションアニメを3作品以上完走', 'Termine au moins 3 animes shounen / action'),
  },
  binge_master: {
    title: L('Maraton Canavarı', 'Binge Master', '一気見マスター', 'Marathonien'),
    description: L('Gözünü kırpmadan sabahladın. Onlarca bölümü peş peşe tükettin.', 'You stayed up all night without blinking. You burned through dozens of episodes in a row.', '一睡もせずに夜を明かし、何十話も一気に見ました。', 'Tu as veillé toute la nuit sans cligner des yeux et enchaîné des dizaines d\'épisodes.'),
    requirement: L("Toplamda 50'den fazla bölüm bitir", 'Finish more than 50 episodes in total', '合計50話以上を視聴', 'Termine plus de 50 épisodes au total'),
  },
  shadow_monarch: {
    title: L('Gölge Hükümdarı', 'Shadow Monarch', '影の君主', "Monarque de l'Ombre"),
    description: L('Gölge ordun gibi anime koleksiyonun da durmaksızın genişliyor.', 'Like your shadow army, your anime collection keeps growing without pause.', '影の軍団のように、アニメコレクションも止まらず拡大中。', "Comme ton armée d'ombres, ta collection d'animes ne cesse de grandir."),
    requirement: L('Listende en az 10 anime bulundur', 'Keep at least 10 anime in your list', 'リストにアニメを10作品以上保有', 'Garde au moins 10 animes dans ta liste'),
  },
  music_maestro: {
    title: L('OST Ustası', 'OST Maestro', 'OSTマエストロ', 'Maestro des OST'),
    description: L('İlk notasından animeyi tanırsın. Müzik Quizinde hünerini kanıtladın.', 'You recognize an anime from its first note. You proved your skill in the music quiz.', '最初の一音でアニメを当てる達人。音楽クイズで実力を証明しました。', "Tu reconnais un anime dès la première note. Tu as prouvé ton talent au quiz musique."),
    requirement: L('Anime Müzik Quizinde en az 1 oyun tamamla veya şarkı bil', 'Complete at least 1 music quiz game or guess a song', '音楽クイズを1回以上クリア、または曲を当てる', 'Termine au moins 1 partie du quiz musique ou devine une chanson'),
  },
  watch_party_host: {
    title: L('Sinema Kulübü Lideri', 'Watch Party Host', 'ウォッチパーティー主催者', 'Hôte de Watch Party'),
    description: L('Birlikte İzleme (Watch Party) odalarına katılarak toplulukla sinerji yarattın.', 'You joined watch party rooms and created synergy with the community.', 'ウォッチパーティーに参加して、コミュニティとシナジーを生みました。', 'Tu as rejoint des salles watch party et créé une synergie avec la communauté.'),
    requirement: L('Watch Party odasına katıl veya bir canlı oda ziyaret et', 'Join a watch party room or visit a live room', 'ウォッチパーティーに参加、またはライブ配信を視聴', 'Rejoins une salle watch party ou visite une salle en direct'),
  },
  elite_critic: {
    title: L('Seçkin Eleştirmen', 'Elite Critic', 'エリート批評家', 'Critique Élite'),
    description: L('Sadece izlemekle kalmayıp animeleri puanlayarak zevkini konuşturdun.', 'You did more than watch — you rated anime and let your taste speak.', '視聴だけでなく評価を重ね、センスを示しました。', "Tu ne t'es pas contenté de regarder : tu as noté les animes et montré ton goût."),
    requirement: L('En az 5 farklı animeye kişisel puan ver', 'Rate at least 5 different anime', '5作品以上に個人評価を付ける', 'Note au moins 5 animes différents'),
  },
  shoujo_heart: {
    title: L('Korkusuz Romantik', 'Fearless Romantic', '恐れ知らずのロマンチスト', 'Romantique Intrépide'),
    description: L('Romantizm ve hayatın içinden duygusal hikayelere kalbini açtın.', 'You opened your heart to romance and emotional slice-of-life stories.', '恋愛や日常の心温まる物語に心を開きました。', 'Tu as ouvert ton cœur aux histoires romantiques et émouvantes du quotidien.'),
    requirement: L('Romantizm veya Dram türünde anime izle', 'Watch a romance or drama anime', 'ロマンスまたはドラマ作品を視聴', 'Regarde un anime romance ou drame'),
  },
  archivist: {
    title: L('Koleksiyon Mimarı', 'Collection Architect', 'コレクション設計士', 'Architecte de Collection'),
    description: L('3x3 grid kartı oluşturdun veya listelerini dışarı aktararak arşivledin.', 'You built a 3x3 grid card or exported your lists to archive them.', '3x3グリッドカードを作成、またはリストを書き出して保存しました。', 'Tu as créé une carte 3x3 ou exporté tes listes pour les archiver.'),
    requirement: L('3x3 Anime kartı oluştur veya liste işlemi yap', 'Create a 3x3 anime card or perform a list action', '3x3アニメカードを作成、またはリスト操作を行う', 'Crée une carte 3x3 ou effectue une action de liste'),
  },
  limitless: {
    title: L('Sonsuzluk Laneti', 'Limitless Curse', '無限の呪い', 'Malédiction Infinie'),
    description: L('Gojo Satoru gibi sınırları aştın! 1000+ Karma puanına ulaştın.', 'Like Gojo Satoru, you broke the limits! You reached 1000+ karma.', '五条悟のように限界を超え、カルマ1000以上に到達！', 'Comme Gojo Satoru, tu as dépassé les limites ! Tu as atteint 1000+ karma.'),
    requirement: L('Toplamda 1000 Karma puanını geç', 'Surpass 1000 karma in total', '合計カルマ1000以上', 'Dépasse 1000 karma au total'),
  },
  community_flame: {
    title: L('Topluluk Meşalesi', 'Community Flame', 'コミュニティの炎', 'Flamme Communautaire'),
    description: L('Forumda, günlük ankette veya sohbet odalarında varlığını hissettirdin.', 'You made your presence felt in the forum, daily poll or chat rooms.', 'フォーラム、日替わり投票、チャットで存在感を示しました。', 'Tu as marqué ta présence sur le forum, le sondage quotidien ou les salons de discussion.'),
    requirement: L('Günlük ankete katıl veya forumda gönderi paylaş', 'Vote in the daily poll or post in the forum', '日替わり投票に参加、またはフォーラムに投稿', 'Participe au sondage quotidien ou poste sur le forum'),
  },
  pirate_king: {
    title: L('Korsan Kralı', 'Pirate King', '海賊王', 'Roi des Pirates'),
    description: L('Büyük hatların sonuna ulaştın. Topluluğun en kıdemli otakularındansın!', 'You reached the end of the Grand Line. You are one of the community\'s most veteran otaku!', '偉大なる航路の果てに到達。コミュニティ最古参のオタクです！', 'Tu as atteint le bout de la Grand Line. Tu fais partie des otaku les plus vétérans de la communauté !'),
    requirement: L('En az 25 anime izle veya 2000 Karma puanına eriş', 'Watch at least 25 anime or reach 2000 karma', 'アニメを25作品以上視聴、またはカルマ2000に到達', 'Regarde au moins 25 animes ou atteins 2000 karma'),
  },
};

export const RANK_TITLES: Record<string, LocalizedText> = {
  guest: L('Misafir', 'Guest', '見習い', 'Invité'),
  regular: L('Müdavim', 'Regular', '常連', 'Habitué'),
  adept: L('Kalfa', 'Adept', '職人', 'Compagnon'),
  master: L('Usta', 'Master', '達人', 'Maître'),
  owner: L('Mekân Sahibi', 'Householder', '持ち主', 'Hôte'),
  legend: L('Efsane', 'Legend', '伝説', 'Légende'),
};

export const localizeBadgeTitle = (badgeId: string, fallback: string): string =>
  pickText(BADGE_TEXTS[badgeId]?.title, fallback);
export const localizeBadgeDescription = (badgeId: string, fallback: string): string =>
  pickText(BADGE_TEXTS[badgeId]?.description, fallback);
export const localizeBadgeRequirement = (badgeId: string, fallback: string): string =>
  pickText(BADGE_TEXTS[badgeId]?.requirement, fallback);
export const localizeLevelTitle = (level: number, fallback: string): string => {
  const tier = RANK_TIERS.slice().reverse().find((r) => level >= r.from)?.id ?? 'guest';
  return pickText(RANK_TITLES[tier], fallback);
};
