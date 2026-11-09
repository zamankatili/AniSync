/**
 * Günün Sorusu — v2'nin düşük nabızda sohbet soruları, 4 dilde.
 * Günün tarihi deterministik seçer; herkes aynı soruyu aynı gün görür.
 */
export type PromptLang = 'tr' | 'en' | 'ja' | 'fr';

export interface DailyPrompt {
  question: Record<PromptLang, string>;
  hint: Record<PromptLang, string>;
}

export const DAILY_PROMPTS: DailyPrompt[] = [
  {
    question: {
      tr: 'Bugün kimseyi dinlemeyeceğin bir şey izlemek istesen, ne açardın?',
      en: "If you could watch something and no one judged you, what would you pick?",
      ja: '今日は誰にもジャッジされず観たいものを選ぶとしたら？',
      fr: "Si tu pouvais regarder quelque chose sans que personne ne te juge, tu choisirais quoi ?",
    },
    hint: {
      tr: 'Kimseye hesap vermek zorunda değilsin.',
      en: "No one's watching over your shoulder.",
      ja: '誰にも気を使う必要はないよ。',
      fr: "Personne n'est au-dessus de ton épaule.",
    },
  },
  {
    question: {
      tr: 'Seni ilk kez "ben bu dünyaya aitim" hissettiren sahne hangisiydi?',
      en: "Which scene made you feel 'I belong in this world' for the first time?",
      ja: '初めて“この世界に属している”と感じたシーンは？',
      fr: "Quelle scène t'a fait te sentir à ta place dans ce monde pour la première fois ?",
    },
    hint: {
      tr: 'Tek bir kare yeter.',
      en: 'A single frame is enough.',
      ja: '1コマで十分。',
      fr: 'Une seule image suffit.',
    },
  },
  {
    question: {
      tr: 'Rafında bir türlü başlayamadığın o şey ne?',
      en: "That thing on your backlog you never manage to start?",
      ja: '積んでいるままで全然手をつけられない作品は？',
      fr: "Ce titre dans ta liste que tu n'arrives jamais à commencer ?",
    },
    hint: {
      tr: 'Beraber başlayalım, diyoruz.',
      en: "Best started together, we say.",
      ja: '一緒に始めよう、というわけ。',
      fr: "On dit que c'est plus facile à deux.",
    },
  },
  {
    question: {
      tr: 'Bir karakterle bir akşam çay içsen, kim olurdu?',
      en: 'If you had to have tea with a character for an evening, who would it be?',
      ja: '一晩お茶を飲むなら誰と？',
      fr: 'Si tu devais prendre le thé avec un personnage pour une soirée, ce serait qui ?',
    },
    hint: {
      tr: 'Sessizlik de sohbet sayılır.',
      en: 'Silence also counts as conversation.',
      ja: '沈黙も会話に入ります。',
      fr: "Le silence aussi, c'est une conversation.",
    },
  },
  {
    question: {
      tr: 'Son zamanlarda seni en çok şaşırtan final hangisiydi?',
      en: 'Which ending surprised you the most lately?',
      ja: '最近一番驚いた結末は？',
      fr: "Quelle fin t'a le plus surpris ces derniers temps ?",
    },
    hint: {
      tr: 'Spoiler etiketini unutma.',
      en: "Don't forget the spoiler tag.",
      ja: 'ネタバレタグ、忘れずに。',
      fr: "N'oublie pas le tag spoiler.",
    },
  },
  {
    question: {
      tr: 'Kimseye söylemediğin "guilty pleasure" serin hangisi?',
      en: 'Your unspoken guilty pleasure series?',
      ja: '誰にも言ってない“guilty pleasure”は？',
      fr: "Ton coupable plaisir de série que tu n'avoues jamais ?",
    },
    hint: {
      tr: 'Burada yargı yok.',
      en: 'No judgment here.',
      ja: 'ここでは誰も裁きません。',
      fr: 'Ici, personne ne juge.',
    },
  },
  {
    question: {
      tr: 'Hangi hikâyenin içinde yaşamak isterdin?',
      en: 'Which story would you want to live inside?',
      ja: 'どの物語の世界に住みたい？',
      fr: 'Dans quelle histoire aimerais-tu vivre ?',
    },
    hint: {
      tr: 'Bir hafta izin verseler.',
      en: 'If they gave you a week off.',
      ja: '1週間の休暇がもらえたらね。',
      fr: 'Si on te donnait une semaine.',
    },
  },
  {
    question: {
      tr: "Bir oyunun müziğini duyunca durup kaldığın oldu mu?",
      en: 'Did some game music ever stop you in your tracks?',
      ja: 'ゲームの音楽を聞いて、思わず手が止まったことある？',
      fr: "La musique d'un jeu t'a déjà cloué sur place ?",
    },
    hint: {
      tr: 'Hangisi, hâlâ açabiliyor musun?',
      en: 'Which one — can you still open it?',
      ja: 'どれ？ 今でも開ける？',
      fr: "Lequel — tu arrives encore à l'ouvrir ?",
    },
  },
  {
    question: {
      tr: 'Bu hafta birine önereceğin tek şey ne?',
      en: 'The one thing you would recommend to someone this week?',
      ja: '今週誰かに勧めるなら、たった一つ？',
      fr: 'La seule chose que tu conseillerais à quelqu\'un cette semaine ?',
    },
    hint: {
      tr: 'Bir seri, bir cilt, bir oyun.',
      en: 'A series, a volume, a game.',
      ja: 'シリーズでも、一巻でも、一ゲームでも。',
      fr: 'Une série, un tome, un jeu.',
    },
  },
  {
    question: {
      tr: 'Kaç yaşında başladın, heyecan hâlâ aynı mı?',
      en: 'How old were you when you started — is the excitement still the same?',
      ja: '何歳から始めた？ 高揚は今も同じ？',
      fr: "À quel âge as-tu commencé — l'excitation est-elle toujours la même ?",
    },
    hint: {
      tr: 'İlk serin neydi?',
      en: 'What was your first series?',
      ja: '最初の作品は？',
      fr: 'Ta première série, c\'était quoi ?',
    },
  },
  {
    question: {
      tr: 'Hangi hikâye seni beklediğinden farklı bir insan yaptı?',
      en: 'Which story made you a different person than you expected?',
      ja: '予想外にあなた自身を変えた物語は？',
      fr: "Quelle histoire a fait de toi quelqu'un de différent ?",
    },
    hint: {
      tr: 'Küçük bir değişiklik de sayılır.',
      en: 'Even a small shift counts.',
      ja: '小さな変化でもカウントします。',
      fr: 'Même un petit changement compte.',
    },
  },
  {
    question: {
      tr: 'Yalnız izlemenin mi, kalabalıkta izlemenin mi tadı başka?',
      en: 'Which hits differently — watching alone or in a crowd?',
      ja: '一人で見るのと、人と見るのとでは、どちらが刺さる？',
      fr: "Regarder seul ou à plusieurs, lequel est le plus savoureux ?",
    },
    hint: {
      tr: 'İkisi de olur.',
      en: 'Both are legit.',
      ja: 'どちらもアリです。',
      fr: 'Les deux sont valables.',
    },
  },
];

const BASE_LANG: PromptLang[] = ['tr', 'en', 'ja', 'fr'];

export const promptIndexFor = (date: Date = new Date()): number => {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return ((day % DAILY_PROMPTS.length) + DAILY_PROMPTS.length) % DAILY_PROMPTS.length;
};

export function getDailyPrompt(lang: string, date: Date = new Date()) {
  const base = (lang || 'tr').split('-')[0].toLowerCase();
  const key = (BASE_LANG.includes(base as PromptLang) ? base : 'tr') as PromptLang;
  const index = promptIndexFor(date);
  const prompt = DAILY_PROMPTS[index];
  return { question: prompt.question[key], hint: prompt.hint[key], index };
}
