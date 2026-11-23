import type { QuoteLang } from './animeQuotes';

export interface OtakuDayEvent {
  /** `MM-DD` biçiminde gün anahtarı. */
  date: string;
  text: Record<QuoteLang, string>;
  /** Doğrulanabilir kaynak (opsiyonel). */
  source?: { label: string; url: string };
}

/**
 * Küratörlü "otaku tarihinde bugün" notları. Yalnızca yayın/prömiyer ve
 * manga başlangıcı gibi doğrulanabilir dönüm noktaları tutulur; kişi ölüm
 * günleri bilinçli olarak kapsam dışıdır.
 */
export const OTAKU_ON_THIS_DAY: OtakuDayEvent[] = [
  {
    date: '01-01',
    text: {
      tr: '1963: Astro Boy (Tetsuwan Atom), Japon televizyonlarında yayınlanan ilk TV anime serilerinden biri olarak prömiyer yaptı.',
      en: '1963: Astro Boy (Tetsuwan Atom) premiered as one of the first TV anime series broadcast in Japan.',
      ja: '1963年：『鉄腕アトム』が、日本で放送された最初期のテレビアニメシリーズの一つとしてスタートしました。',
      fr: "1963 : Astro Boy (Tetsuwan Atom) a été l'une des premières séries animées diffusées à la télévision japonaise.",
    },
  },
  {
    date: '03-07',
    text: {
      tr: '1992: Sailor Moon anime serisi Japonya’da yayınlanmaya başladı.',
      en: '1992: The Sailor Moon anime series began airing in Japan.',
      ja: '1992年：アニメ『美少女戦士セーラームーン』の放送が日本で始まりました。',
      fr: "1992 : la série animée Sailor Moon a commencé sa diffusion au Japon.",
    },
  },
  {
    date: '07-08',
    text: {
      tr: '2012: Sword Art Online anime serisi prömiyer yaptı.',
      en: '2012: The Sword Art Online anime series premiered.',
      ja: '2012年：アニメ『ソードアート・オンライン』が放送開始。',
      fr: "2012 : la série animée Sword Art Online a été diffusée pour la première fois.",
    },
  },
  {
    date: '07-16',
    text: {
      tr: '1988: Akira filmi Japonya’da vizyona girdi.',
      en: '1988: The film Akira was released in Japan.',
      ja: '1988年：映画『AKIRA』が日本で公開されました。',
      fr: '1988 : le film Akira est sorti au Japon.',
    },
  },
  {
    date: '07-20',
    text: {
      tr: '2001: Spirited Away (Sen to Chihiro no Kamikakushi) Japonya’da vizyona girdi.',
      en: '2001: Spirited Away (Sen to Chihiro no Kamikakushi) was released in Japan.',
      ja: '2001年：『千と千尋の神隠し』が日本で公開されました。',
      fr: '2001 : Le Voyage de Chihiro (Sen to Chihiro no Kamikakushi) est sorti au Japon.',
    },
  },
  {
    date: '08-26',
    text: {
      tr: '2016: Your Name (Kimi no Na wa) Japonya’da vizyona girdi.',
      en: '2016: Your Name (Kimi no Na wa) was released in Japan.',
      ja: '2016年：『君の名は。』が日本で公開されました。',
      fr: '2016 : Your Name (Kimi no Na wa) est sorti au Japon.',
    },
  },
  {
    date: '10-04',
    text: {
      tr: '1995: Neon Genesis Evangelion TV anime serisi prömiyer yaptı.',
      en: '1995: The Neon Genesis Evangelion TV anime series premiered.',
      ja: '1995年：テレビアニメ『新世紀エヴァンゲリオン』が放送開始。',
      fr: "1995 : la série animée Neon Genesis Evangelion a été diffusée pour la première fois.",
    },
  },
  {
    date: '11-20',
    text: {
      tr: '1984: Dragon Ball manga serisi Weekly Shonen Jump’ta yayınlanmaya başladı.',
      en: '1984: The Dragon Ball manga began serialization in Weekly Shonen Jump.',
      ja: '1984年：漫画『ドラゴンボール』が週刊少年ジャンプで連載開始。',
      fr: '1984 : le manga Dragon Ball a commencé sa prépublication dans Weekly Shonen Jump.',
    },
  },
  {
    date: '02-21',
    text: {
      tr: '1986: The Legend of Zelda, Japonya’da Famicom Disk System için yayımlandı.',
      en: '1986: The Legend of Zelda was released in Japan for the Famicom Disk System.',
      ja: '1986年：『ゼルダの伝説』がファミコンディスクシステム向けに発売されました。',
      fr: '1986 : The Legend of Zelda est sorti au Japon sur Famicom Disk System.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/The_Legend_of_Zelda_(video_game)' },
  },
  {
    date: '02-27',
    text: {
      tr: '1996: Pokémon Red ve Green, Japonya’da Game Boy için yayımlandı.',
      en: '1996: Pokémon Red and Green were released in Japan for the Game Boy.',
      ja: '1996年：『ポケットモンスター 赤・緑』がゲームボーイ向けに発売されました。',
      fr: '1996 : Pokémon Rouge et Vert sont sortis au Japon sur Game Boy.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Pok%C3%A9mon_Red,_Blue,_and_Yellow' },
  },
  {
    date: '03-11',
    text: {
      tr: '2004: Monster Hunter, Japonya’da PlayStation 2 için yayımlandı.',
      en: '2004: Monster Hunter was released in Japan for the PlayStation 2.',
      ja: '2004年：『モンスターハンター』がプレイステーション2向けに発売されました。',
      fr: '2004 : Monster Hunter est sorti au Japon sur PlayStation 2.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Monster_Hunter_(video_game)' },
  },
  {
    date: '03-22',
    text: {
      tr: '1996: Resident Evil, Japonya’da PlayStation için yayımlandı.',
      en: '1996: Resident Evil was released in Japan for the PlayStation.',
      ja: '1996年：『バイオハザード』がプレイステーション向けに発売されました。',
      fr: '1996 : Resident Evil est sorti au Japon sur PlayStation.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Resident_Evil_(1996_video_game)' },
  },
  {
    date: '04-03',
    text: {
      tr: '1998: Cowboy Bebop, TV Tokyo’da prömiyer yaptı.',
      en: '1998: Cowboy Bebop premiered on TV Tokyo.',
      ja: '1998年：『カウボーイビバップ』がテレビ東京で放送開始。',
      fr: '1998 : Cowboy Bebop a été diffusé pour la première fois sur TV Tokyo.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Cowboy_Bebop' },
  },
  {
    date: '04-05',
    text: {
      tr: '2009: Fullmetal Alchemist: Brotherhood prömiyer yaptı.',
      en: '2009: Fullmetal Alchemist: Brotherhood premiered.',
      ja: '2009年：『鋼の錬金術師 FULLMETAL ALCHEMIST』が放送開始。',
      fr: '2009 : Fullmetal Alchemist: Brotherhood a été diffusé pour la première fois.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Fullmetal_Alchemist:_Brotherhood' },
  },
  {
    date: '04-06',
    text: {
      tr: '2019: Demon Slayer: Kimetsu no Yaiba prömiyer yaptı.',
      en: '2019: Demon Slayer: Kimetsu no Yaiba premiered.',
      ja: '2019年：『鬼滅の刃』が放送開始。',
      fr: '2019 : Demon Slayer: Kimetsu no Yaiba a été diffusé pour la première fois.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Demon_Slayer:_Kimetsu_no_Yaiba' },
  },
  {
    date: '04-09',
    text: {
      tr: '2022: Spy × Family prömiyer yaptı.',
      en: '2022: Spy × Family premiered.',
      ja: '2022年：『SPY×FAMILY』が放送開始。',
      fr: '2022 : Spy × Family a été diffusé pour la première fois.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Spy_%C3%97_Family' },
  },
  {
    date: '05-27',
    text: {
      tr: '1986: Dragon Quest, Japonya’da Famicom için yayımlandı.',
      en: '1986: Dragon Quest was released in Japan for the Famicom.',
      ja: '1986年：『ドラゴンクエスト』がファミコン向けに発売されました。',
      fr: '1986 : Dragon Quest est sorti au Japon sur Famicom.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Dragon_Quest_(video_game)' },
  },
  {
    date: '07-22',
    text: {
      tr: '1997: One Piece, Weekly Shōnen Jump’ta yayınlanmaya başladı.',
      en: '1997: One Piece began serialization in Weekly Shōnen Jump.',
      ja: '1997年：『ONE PIECE』が週刊少年ジャンプで連載開始。',
      fr: '1997 : One Piece a commencé sa prépublication dans Weekly Shōnen Jump.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/One_Piece' },
  },
  {
    date: '09-13',
    text: {
      tr: '1985: Super Mario Bros., Japonya’da Famicom için yayımlandı.',
      en: '1985: Super Mario Bros. was released in Japan for the Famicom.',
      ja: '1985年：『スーパーマリオブラザーズ』がファミコン向けに発売されました。',
      fr: '1985 : Super Mario Bros. est sorti au Japon sur Famicom.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Super_Mario_Bros.' },
  },
  {
    date: '09-15',
    text: {
      tr: '2016: Persona 5, Japonya’da PlayStation 3 ve PlayStation 4 için yayımlandı.',
      en: '2016: Persona 5 was released in Japan for PlayStation 3 and PlayStation 4.',
      ja: '2016年：『ペルソナ5』がプレイステーション3・4向けに発売されました。',
      fr: '2016 : Persona 5 est sorti au Japon sur PlayStation 3 et PlayStation 4.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Persona_5' },
  },
  {
    date: '09-28',
    text: {
      tr: '2020: Genshin Impact dünya genelinde yayımlandı.',
      en: '2020: Genshin Impact was released worldwide.',
      ja: '2020年：『原神』が世界同時配信されました。',
      fr: '2020 : Genshin Impact est sorti dans le monde entier.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Genshin_Impact' },
  },
  {
    date: '09-29',
    text: {
      tr: '2023: Frieren: Beyond Journey’s End prömiyer yaptı.',
      en: '2023: Frieren: Beyond Journey’s End premiered.',
      ja: '2023年：『葬送のフリーレン』が放送開始。',
      fr: '2023 : Frieren: Beyond Journey’s End a été diffusé pour la première fois.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Frieren' },
  },
  {
    date: '10-03',
    text: {
      tr: '2020: Jujutsu Kaisen prömiyer yaptı.',
      en: '2020: Jujutsu Kaisen premiered.',
      ja: '2020年：『呪術廻戦』が放送開始。',
      fr: '2020 : Jujutsu Kaisen a été diffusé pour la première fois.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Jujutsu_Kaisen' },
  },
  {
    date: '10-06',
    text: {
      tr: '2006: Code Geass: Lelouch of the Rebellion prömiyer yaptı.',
      en: '2006: Code Geass: Lelouch of the Rebellion premiered.',
      ja: '2006年：『コードギアス 反逆のルルーシュ』が放送開始。',
      fr: '2006 : Code Geass: Lelouch of the Rebellion a été diffusé pour la première fois.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Code_Geass' },
  },
  {
    date: '10-12',
    text: {
      tr: '2022: Chainsaw Man prömiyer yaptı.',
      en: '2022: Chainsaw Man premiered.',
      ja: '2022年：『チェンソーマン』が放送開始。',
      fr: '2022 : Chainsaw Man a été diffusé pour la première fois.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Chainsaw_Man' },
  },
  {
    date: '11-18',
    text: {
      tr: '1995: Ghost in the Shell filmi Japonya’da vizyona girdi.',
      en: '1995: The film Ghost in the Shell was released in Japan.',
      ja: '1995年：映画『GHOST IN THE SHELL / 攻殻機動隊』が公開されました。',
      fr: '1995 : le film Ghost in the Shell est sorti au Japon.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Ghost_in_the_Shell_(1995_film)' },
  },
  {
    date: '12-18',
    text: {
      tr: '1987: Final Fantasy, Japonya’da Famicom için yayımlandı.',
      en: '1987: Final Fantasy was released in Japan for the Famicom.',
      ja: '1987年：『ファイナルファンタジー』がファミコン向けに発売されました。',
      fr: '1987 : Final Fantasy est sorti au Japon sur Famicom.',
    },
    source: { label: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Final_Fantasy_(video_game)' },
  },
];
