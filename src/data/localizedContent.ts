/**
 * Elle küratörlüğü yapılmış içeriklerin çok dilli sürümleri.
 * Ana veri dosyası `animeRecommendations.ts` Türkçe (tr) temel metinleri tutar;
 * burada en/ja/fr çevirileri id bazında eşlenir. Eksik dillerde tr'ye düşer.
 */
import i18n from '../i18n';

export interface LocalizedText {
  tr: string;
  en: string;
  ja: string;
  fr: string;
}

const baseLang = (): string => {
  const raw = i18n.language || 'tr';
  return String(raw).split('-')[0].toLowerCase();
};

/** tr dahil dört dilden geçerli olanı döner; yoksa tr'ye düşer. */
export const pickLocalized = (entry: LocalizedText | undefined, fallback = ''): string => {
  if (!entry) return fallback;
  const base = baseLang();
  return (entry as any)[base] || entry.tr || fallback;
};

const L = (tr: string, en: string, ja: string, fr: string): LocalizedText => ({ tr, en, ja, fr });

/** POPULAR_PRESETS etiketleri — mal_id ile eşlenir. */
export const POPULAR_PRESET_TAGS: Record<number, LocalizedText> = {
  16498: L('Karanlık Fantastik / Gizem', 'Dark Fantasy / Mystery', 'ダークファンタジー / ミステリー', 'Dark Fantasy / Mystère'),
  1535: L('Psikolojik Zeka Savaşı', 'Psychological Battle of Wits', '心理的な頭脳バトル', 'Bataille Psychologique & Stratégie'),
  52991: L('Büyülü Yolculuk / Fantezi', 'Magical Journey / Fantasy', '魔法の旅 / ファンタジー', 'Voyage Magique / Fantastique'),
  40748: L('Doğaüstü Aksiyon', 'Supernatural Action', '超自然アクション', 'Action Surnaturelle'),
  9253: L('Zaman Yolculuğu / Bilim Kurgu', 'Time Travel / Sci-Fi', '時間旅行 / SF', 'Voyage Temporel / Sci-Fi'),
  5114: L('Kusursuz Hikaye / Macera', 'Flawless Story / Adventure', '完璧な物語 / 冒険', 'Histoire Parfaite / Aventure'),
  38000: L('Duygusal Shounen', 'Emotional Shounen', '感動系少年アニメ', 'Shounen Émouvant'),
  37521: L('Tarihi İntikam Dramı', 'Historical Revenge Drama', '歴史・復讐ドラマ', 'Drame Historique de Vengeance'),
  42310: L('Siberpunk / Adrenalin', 'Cyberpunk / Adrenaline', 'サイバーパンク / アドレナリン', 'Cyberpunk / Adrénaline'),
  11061: L('Stratejik Dövüş / Shounen', 'Strategic Battles / Shounen', '戦略的な闘い / 少年向け', 'Combats Stratégiques / Shounen'),
};

/** `${seedMalId}:${targetMalId}` anahtarıyla küratörlü öneri açıklamaları. */
export const CURATED_REASONS: Record<string, LocalizedText> = {
  '16498:37521': L('Aynı WIT Studio kökeni, epik askeri atmosfer, karakter gelişimi ve derin politik entrikalar.', 'Same WIT Studio roots, epic military atmosphere, character growth and deep political intrigue.', '同じWIT Studio発。壮大な軍事的雰囲気、キャラクターの成長と深い政治的陰謀。', 'Même studio WIT, atmosphère militaire épique, évolution des personnages et intrigues politiques profondes.'),
  '16498:41457': L('Surların ardındaki ayrımcılık, askeri fedakarlıklar ve Hiroyuki Sawano imzalı epik müzikler.', "Prejudice behind the walls, military sacrifice, and Hiroyuki Sawano's epic score.", '城壁の裏の差別、軍の犠牲、そして澤野弘之のエピックな楽曲。', "La discrimination derrière les murs, les sacrifices militaires et la musique épique de Hiroyuki Sawano."),
  '16498:28623': L('AoT yönetmeni Tetsurou Araki imzalı, surlar içinde hayatta kalma ve zombi yaratıklar.', 'From the director of Attack on Titan — survival inside the walls and zombie-like creatures.', '『進撃の巨人』を手がけた監督作。城壁内での生存競争とゾンビのような巨体。', 'Du duo de Attack on Titan : survie entre les murs et créatures semblables à des zombies.'),
  '16498:34572': L('Yıkıma karşı insanlığı savunma ve güçlü dostluk bağları.', 'Defending humanity against total destruction and unbreakable bonds of friendship.', '圧倒的破壊を前にした人類の防衛と、強い友情の絆。', "La défense de l'humanité face à la destruction et des liens d'amitié indéfectibles."),
  '1535:1575': L('Dahi bir ana karakter, gizli kimlik, satranç benzeri stratejiler ve dünyayı değiştirme tutkusu.', 'A genius protagonist, a secret identity, chess-like strategy, and the ambition to change the world.', '天才的な主人公、秘密の力、チェスのような戦略、そして世界を変えようとする野望。', "Un protagoniste de génie, une identité secrète, des stratégies d'échecs et l'ambition de changer le monde."),
  '1535:19': L('Aynı yönetmen Masayuki Kojima, derin ahlak felsefesi ve kedi-fare gerilimi.', 'Same director, Masayuki Kojima, deep moral philosophy, and cat-and-mouse tension.', '監督は小島正幸。深い倫理哲学と、ネコとネズミの追い詰め劇。', 'Même réalisateur, Masayuki Kojima, philosophie morale profonde et tension de chat et souris.'),
  '1535:13601': L('Adalet, sistem karşıtı suç dehaları ve dedektiflik sorgulamaları.', 'Justice, anti-system criminal masterminds, and detective interrogations.', '正義、体制打倒の犯罪の天才、探偵による尋問。', 'La justice, des criminels antisystème et des interrogatoires policiers.'),
  '52991:33352': L('Savaş sonrası barış, zamanın akışı, anıların değeri ve nefes kesen görsel kalite.', 'Post-war peace, the flow of time, the value of memories, and breathtaking visuals.', '戦後の平和、時の流れ、思い出の価値、息をのむほど美しい映像。', "La paix d'après-guerre, le passage du temps, la valeur des souvenirs et des visuels à couper le souffle."),
  '52991:457': L('Sakin ve felsefi atmosfer, doğayla iç içe yolculuk ve melankolik güzellik.', 'A calm, philosophical atmosphere, journeys immersed in nature, and melancholic beauty.', '穏やかで哲学的な空気、自然の中の旅、憂いのある美しさ。', "Une atmosphère calme et philosophique, des voyages au cœur de la nature et une beauté mélancolique."),
  '52991:2904': L('Yolculuk arkadaşlığı, uzun ömürlü bir varlığın fanilerle ilişkisi ve samimi diyaloglar.', "Traveling companionship, a long-lived being's relationship with mortals, and heartfelt dialogue.", '旅の同行者、長命の存在と人間との関わり、心のこもった対話。', "Le compagnonnage de voyage, la relation d'un être immortel avec des mortels et des dialogues sincères."),
  '40748:44511': L('Aynı MAPPA stüdyosu, karanlık şeytan avı konsepti, yüksek tempolu animasyon ve kaotik dövüşler.', 'Same studio MAPPA, dark devil-hunting concept, high-octane animation and chaotic battles.', '同じMAPPA制作。ダークな悪魔狩り、疾走する作画、混沌とした闘い。', 'Même studio MAPPA, chasse aux diables sombre, animation très rapide et combats chaotiques.'),
  '40748:269': L('Gege Akutami\'nin en büyük ilham kaynağı: Şinigami güçleri, içsel canavarlar ve sokak modası ruhu.', 'The greatest inspiration of Gege Akutami: Shinigami powers, inner monsters, and street fashion.', '芥見下々の最大のルーツ。死神の力、内面の怪物、ストリートファッション。', "La plus grande source d'inspiration de Gege Akutami : les pouvoirs de Shinigami, les monstres intérieurs et le streetwear."),
  '40748:52299': L('Zindanlar, canavarlar ve saf güç yükselişi ile görsel şölen.', 'Dungeons, monsters, and a pure power ascent with spectacular visuals.', 'ダンジョン、モンスター、純粋な力の覚醒と壮麗なビジュアル。', "Des donjons, des monstres et l'ascension vers une puissance absolue avec des visuels spectaculaires."),
  '9253:31043': L('Zaman sıçramalarıyla sevdiklerini kurtarma, kaderi değiştirme ve nefes kesen gerilim.', 'Rewind fate to save loved ones through time leaps — breathtaking tension.', 'タイムリープで大切な人を救い、運命を変える息をのむスリル。', "Revenir en arrière pour sauver ses proches, bouleverser le destin — un suspense à couper le souffle."),
  '9253:31240': L('Aynı White Fox stüdyosu, çaresizlik içindeki zaman döngüleri ve psikolojik travmalar.', 'Same studio White Fox, cycles of time in desperation and psychological trauma.', 'ホワイトフォックス制作。絶望の中の時間ループと心理的トラウマ。', 'Même studio White Fox, des boucles temporelles dans le désespoir et des traumatismes psychologiques.'),
  '9253:44074': L('Re:Zero yazarı Tappei Nagatsuki imzalı, geleceği değiştirmek üzere zaman müdahalesi ve müzik.', 'From Re:Zero author Tappei Nagatsuki — time intervention to change the future, and music.', '『Re:ゼロ』長月達平氏原著。未来を変える時間介入と音楽。', "Du créateur de Re:Zero, une intervention temporelle pour changer l'avenir — et la musique."),
  '5114:11061': L('Kusursuz güç sistemi (Nen ve Simya), derin karakter gelişimi ve sürükleyici macera.', 'Flawless power system (Nen and Alchemy), deep character growth, and an epic journey.', '完璧な力の体系(念と錬金術)、深いキャラクターの成長、そして壮大な旅。', "Un système de pouvoir sans faille (Nen et Alchimie), une profonde évolution des personnages et une épopée magistrale."),
  '5114:205': L('Yolculuk macerası, ikonik karakter dinamikleri ve unutulmaz anlar.', 'A journey adventure, iconic character dynamics, and unforgettable moments.', '旅の冒険、象徴的なキャラクターの絆、忘れられない名場面。', 'Une aventure de voyage, des dynamiques de personnages iconiques et des moments inoubliables.'),
};

/** mal_id ile eşlenen küratörlü içerik sinopsileri. */
export const CURATED_SYNOPSIS: Record<number, LocalizedText> = {
  37521: L('Genç Viking savaşçısı Thorfinn, babasının katilinden intikam almak için acımasız bir savaşa sürüklenir.', 'Young Viking warrior Thorfinn is drawn into a brutal war of revenge against the man who killed his father.', '若きヴァイキングの戦士トールフィンは、父を殺した男への復讐心から、残酷な戦争へ身を投じる。', "Le jeune guerrier viking Thorfinn est entraîné dans une guerre brutale pour venger la mort de son père."),
  41457: L('Sözde kansız dron savaşlarının ardında insan yerine konulmayan 86. bölge çocuklarının mücadelesi yatar.', 'Behind the supposed bloodless drone wars lies the struggle of the 86th district children, denied their humanity.', '血なまぐさくないドローン戦の裏には、人間として扱われない第86区の子供たちの闘いがあった。', "Derrière des guerres de drones sans sang se cache la lutte des enfants du 86e district, privés de leur humanité."),
  28623: L('Zombi benzeri yaratıkların dünyayı sardığı çağda, insanlar zırhlı trenlerle seyahat eder.', 'In an age when zombie-like creatures have spread across the world, humanity travels in armored trains.', '屍人に似た生物が世界を覆う時代、人類は装甲列車で移動する。', "À une époque où des créatures semblables à des zombies envahissent le monde, l'humanité voyage dans des trains blindés."),
  34572: L('Büyünün her şey olduğu bir dünyada büyüsü olmayan Asta, Büyücü Kral olmak için çabalar.', 'In a world where magic is everything, Asta, the only mage with no magic, strives to become the Wizard King.', '魔法が全ての世界で、魔法を持たないアスタは魔法帝を目指して奮闘する。', "Dans un monde où la magie est tout, Asta, l'unique mage sans magie, aspire à devenir le Roi-Mage."),
  1575: L('Lelouch Lamperouge, mutlak itaat sağlayan Geass gücünü elde ederek Britanya İmparatorluğu\'na savaş açar.', 'Lelouch Lamperouge obtains the power of absolute obedience, Geass, and declares war on the Britannian Empire.', 'ルルーシュ・ランペルージは、絶対服従をもたらす「ギアス」の力を得て、ブリタニア帝国に戦いを挑む。', "Lelouch Lamperouge obtient le pouvoir Geass, l'obéissance absolue, et déclare la guerre à l'Empire Britannique."),
  19: L('Beyin cerrahı Tenma, ameliyat ettiği dahi bir çocuğun aslında acımasız bir seri katil olduğunu öğrenir.', 'Brain surgeon Tenma discovers that the brilliant child he saved is in fact a ruthless serial killer.', '脳外科医の天才が、自分が救った少年が実は冷酷な連続殺人犯だと知る。', "Le chirurgien Tenma découvre que l'enfant prodige qu'il a sauvé est en réalité un tueur sans pitié."),
  13601: L('İnsanların suç işleme potansiyelini ölçen Sibyl Sistemi ve adaletin sınırlarını sorgulayan müfettişler.', 'The Sibyl System measures the potential of anyone to commit crimes; investigators probe the limits of justice.', '人々の犯罪係数を測るシビュラシステムと、正義の境界を問う捜査官たち。', 'Le système Sibyl mesure le potentiel criminel des citoyens et des enquêteurs interrogent les limites de la justice.'),
  33352: L('Eski bir savaş makinesi olan Violet, insanların duygularını mektuplara dökerken "Seni seviyorum" sözünün anlamını arar.', "A former child soldier, Violet becomes an Auto Memory Doll and searches for the meaning of the words 'I love you'.", '元戦士の少女ヴァイオレットは、代筆屋となり、「愛している」という言葉の意味を探す。', 'Ancienne enfant soldat devenue Auto Memory Doll, Violet cherche le sens des mots « Je t\'aime ».'),
  457: L('Ginko, insanlarla görünmez yaşam formları olan "Mushi"ler arasındaki dengeyi korumak için diyar diyar gezer.', 'Ginko travels the land to keep the balance between people and the invisible life forms called Mushi.', 'ギンコは人と見えない生命体「蟲(ムシ)」の均衡を保つため、各地を旅する。', "Ginko parcourt le pays pour maintenir l'équilibre entre les hommes et les Mushi, des formes de vie invisibles."),
  2904: L('Gezgin tüccar Lawrence ve bilge kurt tanrıçası Holo\'nun ortak yolculuğu.', 'A traveling merchant, Lawrence, and the wise wolf goddess Holo journey together.', '旅の商人ローレンスと、賢き狼の女神ホロの共同の旅。', 'Le marchand itinérant Lawrence et la déesse-louve sage Holo voyagent ensemble.'),
  44511: L('Şeytan avcısı Denji, testere köpeği Pochita ile birleşerek Testere Adam\'a dönüşür.', 'Devil hunter Denji merges with his chainsaw devil Pochita to become Chainsaw Man.', 'デビルハンターのデンジは、チェンソーの悪魔ポチタと融合してチェンソーマンとなる。', "Le chasseur de diables Denji fusionne avec Pochita, le diable-tronçonneuse, pour devenir Chainsaw Man."),
  269: L('Ichigo Kurosaki, bir Ölüm Meleği\'nin güçlerini alarak ruhlar dünyasının koruyucusu olur.', 'Ichigo Kurosaki gains the powers of a Soul Reaper and becomes the guardian of the soul world.', '黒崎一護は死神の力を受け継ぎ、魂の世界の守護者となる。', "Ichigo Kurosaki hérite des pouvoirs d'un Shinigami et devient le gardien du monde des âmes."),
  52299: L('Dünyanın en zayıf avcısı Jinwoo, özel bir sistemle gölge ordusu komutanına dönüşür.', 'The weakest hunter in the world, Jinwoo, is chosen by a mysterious system and becomes a shadow army commander.', '世界最弱のハンター・ジンウーは、謎のシステムに選ばれ、影の軍隊の指揮官となる。', "Le plus faible des chasseurs de rang E, Jinwoo, est choisi par un système mystérieux et devient le maître d'une armée des ombres."),
  31043: L('Zamanı birkaç dakika geri sarabilen Satoru, cinayeti engellemek için çocukluğuna 18 yıl geriye döner.', 'Satoru, who can rewind time by a few minutes, travels back 18 years to stop a murder from his childhood.', '数分だけ時間を巻き戻せる悟は、少女の殺害を防ぐため、18年前の子供時代へ戻る。', 'Satoru, capable de remonter le temps de quelques minutes, retourne 18 ans en arrière pour empêcher un meurtre.'),
  31240: L('Subaru öldüğünde zamanda geri dönerek checkpoint noktasına uyanma lanetine sahiptir.', 'Subaru possesses the curse of returning to a checkpoint in time whenever he dies.', 'スバルは、死ぬと過去のチェックポイントへ時間が巻き戻る呪いを持つ。', "Subaru est maudit : chaque fois qu'il meurt, le temps revient en arrière jusqu'à un point de sauvegarde."),
  44074: L('İlk otonom yapay zeka Vivy, gelecekteki yapay zeka isyanını önlemek için 100 yıllık bir göreve başlar.', 'The first autonomous AI, Vivy, begins a 100-year mission to prevent a future AI rebellion.', '初の自律型人工知能ヴィヴィは、未来のAI反乱を防ぐため100年の使命に挑む。', "La première IA autonome, Vivy, se lance dans une mission de 100 ans pour empêcher la révolte des IA."),
  11061: L('Gon Freecss babasını bulmak için Avcı sınavına girer ve olağanüstü dostluklar kurar.', 'Gon Freecss enters the Hunter Exam to find his father and forges extraordinary friendships.', 'ゴン・フリークスは父を探すためハンター試験に挑み、かけがえのない仲間と出会う。', "Gon Freecss se présente à l'examen de chasseur pour retrouver son père et se lie d'amitié avec des compagnons extraordinaires."),
  205: L('Fuu, ayçiçeği kokan samurayı aramak için iki vahşi kılıç ustasını yanına alır.', 'Fuu sets out to find the samurai scented of sunflowers, taking two wild swordsmen as her companions.', '風は、ひまわりの香りのする侍を探し、二人の荒くれの剣士を仲間にする。', 'Fuu se lance à la recherche du samouraï parfumé au tournesol, accompagnée de deux lames sauvages.'),
};

/** AI önerileri (AIRecommendationsSection) fallback içerikleri — mal_id ile eşlenir. */
export const AI_FALLBACK_REASONS: Record<number, LocalizedText> = {
  52991: L('Kaydedilen fantastik ve derin hikayeli animelerinle %98 uyumlu. Unutulmaz atmosferi ve karakter gelişimi tam zevkine göre.', '98% match with your saved fantasy and rich-story anime. The unforgettable atmosphere and character growth are exactly your thing.', '保存したファンタジーで奥深い物語のアニメと98%マッチ。忘れられない雰囲気とキャラクターの成長は、まさにあなた向け。', "98% de correspondance avec tes animes fantastiques aux histoires profondes. L'atmosphère inoubliable et l'évolution des personnages sont exactement ton style."),
  52299: L('İzleme listenizdeki aksiyon ve seviye atlama temalı serilerden yola çıkarak AI tarafından yüksek öncelikle önerildi.', 'Highly prioritized by AI based on the action and leveling-up series in your watchlist.', 'ウォッチリストのアクションとレベルアップ系作品をもとに、AIが高い優先度で推薦。', "Recommandé en priorité par l'IA à partir des séries d'action et de montée en niveau de ta liste."),
  40748: L('Tempolu dövüş koreografileri ve büyüleyici atmosfer seven izleme profilinizle kusursuz eşleşme.', 'A perfect match with your profile that loves fast-paced fight choreography and a fascinating atmosphere.', '疾走する戦闘演出と魅惑的な雰囲気が好きなあなたのプロフィールと完璧な一致。', 'Correspondance parfaite avec ton profil, qui adore les chorégraphies de combat rapides et les atmosphères fascinantes.'),
  54492: L('Zeka küpü ana karakteri ve saray içi gizem çözme dinamikleriyle listeniz için özel seçilmiş yapım.', 'A genius protagonist and palace-intrigue mystery dynamics — specially selected for your list.', '天才的な頭脳の主人公と宮廷の謎解きの力学。あなたのリストのために厳選された一作。', "Une héroïne brillante et des intrigues de palais — spécialement sélectionnée pour ta liste."),
};

export const AI_FALLBACK_SYNOPSIS: Record<number, LocalizedText> = {
  52991: L('Büyük iblis kralı yenen kahraman kafilesinin büyücüsü Frieren, insan yaşamının kısalığını ve bağ kurmanın önemini anlıyor.', 'The mage of the hero party who defeated the demon king, Frieren learns the shortness of human life and the meaning of bonds.', '魔王を倒した勇者パーティの魔法使いフリーレン。人間の一生の短さと絆の意味を知る。', "La mage de la troupe de héros ayant vaincu le roi démon apprend la brièveté de la vie humaine et la valeur des liens."),
  52299: L('En zayıf e-rütbe avcı Sung Jinwoo, gizemli bir zindan görevinde sistem tarafından seçilerek sınırsız seviye atlama yeteneği kazanır.', 'The weakest E-Rank hunter, Sung Jinwoo, is chosen by a mysterious system and gains unlimited leveling.', '最弱のEランクハンター・ソン・ジヌが、謎のシステムに選ばれ、無限のレベルアップ能力を得る。', 'Le chasseur de rang E le plus faible, Sung Jinwoo, est choisi par un système mystérieux et gagne la possibilité de progresser sans limite.'),
  40748: L('Satoru Gojo ve Suguru Geto\'nun gençlik günleri ile unutulmaz Shibuya Olayı arkının nefes kesen mücadelesi.', "Satoru Gojo and Suguru Geto's youth, and the breathtaking battle of the Shibuya Incident arc.", '五条悟と夏油傑の青春、そして忘れ得ぬ渋谷事変編の激闘。', "La jeunesse de Satoru Gojo et de Suguru Geto, puis l'arc de Shibuya Incident, spectaculaire."),
  54492: L('Eczacı kız Maomao, imparatorluk sarayına hizmetçi olarak satılır ve tıbbi bilgileriyle gizemli zehirlenme vakalarını çözer.', 'Apothecary girl Maomao is sold to the imperial palace as a servant and solves mysterious poisonings with her medical knowledge.', '薬師の少女マオマオは宮廷の下女として売られ、医学の知識で不可解な毒殺事件を解く。', "Maomao, jeune apothicaire, est vendue comme servante au palais et résout des mystérieuses intoxications grâce à ses connaissances médicales."),
};
