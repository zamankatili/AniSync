export interface Prompt {
  question: string;
  hint: string;
}

export const PROMPTS: Prompt[] = [
  { question: 'Bugün kimseyi dinlemeyeceğin bir şey izlemek istesen, ne açardın?', hint: 'Kimseye hesap vermek zorunda değilsin.' },
  { question: 'Seni ilk kez "ben bu dünyaya aitim" hissettiren sahne hangisiydi?', hint: 'Tek bir kare yeter.' },
  { question: 'Rafında bir türlü başlayamadığın o şey ne?', hint: 'Beraber başlayalım, diyoruz.' },
  { question: 'Bir karakterle bir akşam çay içsen, kim olurdu?', hint: 'Sessizlik de sohbet sayılır.' },
  { question: 'Son zamanlarda seni en çok şaşırtan final hangisiydi?', hint: 'Spoiler etiketini unutma.' },
  { question: 'Kimseye söylemediğin "guilty pleasure" serin hangisi?', hint: 'Burada yargı yok.' },
  { question: 'Hangi hikâyenin içinde yaşamak isterdin?', hint: 'Bir hafta izin verseler.' },
  { question: 'Bir oyunun müziğini duyunca durup kaldığın oldu mu?', hint: 'Hangisi, hâlâ açabiliyor musun?' },
  { question: 'Bu hafta birine önereceğin tek şey ne?', hint: 'Bir seri, bir cilt, bir oyun.' },
  { question: 'Kaç yaşında başladın, heyecan hâlâ aynı mı?', hint: 'İlk serin neydi?' },
  { question: 'Hangi hikâye seni beklediğinden farklı bir insan yaptı?', hint: 'Küçük bir değişiklik de sayılır.' },
  { question: 'Yalnız izlemenin mi, kalabalıkta izlemenin mi tadı başka?', hint: 'İkisi de olur.' },
];

export function todayPrompt(date = new Date()): Prompt {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const day = Math.floor(diff / 86400000);
  return PROMPTS[day % PROMPTS.length];
}
