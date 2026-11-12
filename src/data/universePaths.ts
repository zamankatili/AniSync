/**
 * Evrene özgü ilerleme yolları ve imza ikilemleri.
 *
 * Amaç: Anime Yaşam Simülasyonu'nda her evrenin kendi "rütbe merdiveni" ve
 * kendi ahlaki/macera sorusu olsun. İçerik kurgudur (simülasyon), kanon bir
 * iddia değildir; kanon karakterler yalnızca `eventEngine` içindeki
 * karşılaşmalarda "hava durumu" gibi görünür.
 *
 * Bu dosya saf veridir — `eventEngine` tarafından içe aktarılır. Döngüsel
 * bağımlılık olmaması için `LifeStats` tipini burada yeniden tanımlıyoruz.
 */

export type Lang4 = 'tr' | 'en' | 'ja' | 'fr';
export type Localized = Record<Lang4, string>;

export type PathStatKey = 'power' | 'intelligence' | 'luck' | 'socialClass' | 'health';
export type PathStats = Partial<Record<PathStatKey, number>>;
export type PathRisk = 'low' | 'medium' | 'high' | 'extreme';

export interface UniverseRank {
  /** 0–1 aralığında bu rütbeye geçiş eşiği. */
  threshold: number;
  name: Localized;
  note: Localized;
}

export interface UniverseDilemmaChoice {
  id: string;
  label: Localized;
  description: Localized;
  statChanges: PathStats;
  consequences: Localized[];
  risk: PathRisk;
}

export interface UniverseDilemma {
  id: string;
  age: number;
  title: Localized;
  description: Localized;
  choices: UniverseDilemmaChoice[];
}

export interface UniversePath {
  worldId: string;
  arcName: Localized;
  arcNote: Localized;
  ranks: UniverseRank[];
  /** Her evrenin tek imza sorusu; mevcut evren olaylarını tamamlar. */
  dilemma: UniverseDilemma;
}

const L = (tr: string, en: string, ja: string, fr: string): Localized => ({ tr, en, ja, fr });

export const UNIVERSE_PATHS: Record<string, UniversePath> = {
  shonen_battle: {
    worldId: 'shonen_battle',
    arcName: L('Ninja Yolu', 'The Ninja Path', '忍の道', 'La voie du ninja'),
    arcNote: L(
      'Akademiden başlayıp savaş alanında rütbe kazanırsın. Güç kadar takım ruhu da önemlidir.',
      'You start at the academy and earn rank on the battlefield. Teamwork matters as much as power.',
      'アカデミーから始まり、戦場で階級を上げていく。力と同じくらいチームワークが重要だ。',
      'Tu commences à l\'académie et gagnes tes galons sur le champ de bataille. L\'esprit d\'équipe compte autant que la force.',
    ),
    ranks: [
      { threshold: 0, name: L('Akademi Öğrencisi', 'Academy Student', '忍者学校の生徒', 'Élève de l\'académie'), note: L('Temel eğitim', 'Basic training', '基礎訓練', 'Formation de base') },
      { threshold: 0.22, name: L('Genin', 'Genin', '下忍', 'Genin'), note: L('İlk takım, ilk görev', 'First team, first mission', '最初のチーム、最初の任務', 'Première équipe, première mission') },
      { threshold: 0.46, name: L('Chunin', 'Chunin', '中忍', 'Chunin'), note: L('Takım lideri', 'Squad leader', '分隊の隊長', 'Chef d\'escouade') },
      { threshold: 0.68, name: L('Jonin', 'Jonin', '上忍', 'Jonin'), note: L('Elit ninja', 'Elite ninja', '精鋭忍者', 'Ninja d\'élite') },
      { threshold: 0.86, name: L('Kage / Yonko', 'Kage / Yonko', '影 / 四皇', 'Kage / Yonko'), note: L('Efsanevi lider', 'Legendary leader', '伝説の指導者', 'Leader légendaire') },
    ],
    dilemma: {
      id: 'shonen_dilemma_academy',
      age: 11,
      title: L('Akademi Sınavı', 'Academy Exam', 'アカデミー試験', 'Examen de l\'académie'),
      description: L(
        '11 yaşındasın. Akademi bitirme sınavında üç yol var: klon tekniği, takım görevi ya da pusu. Hangi yönü seçeceksin?',
        'You are 11. The academy graduation exam offers three paths: a clone technique, a team mission, or an ambush. Which will you choose?',
        '11歳。アカデミー卒業試験には三つの道がある：分身の術、チーム任務、あるいは待ち伏せ。どれを選ぶ？',
        'Tu as 11 ans. L\'examen de fin d\'académie propose trois voies : un clone, une mission d\'équipe ou une embuscade. Que choisis-tu ?',
      ),
      choices: [
        {
          id: 'ninjutsu',
          label: L('Klon Tekniğine Yüklen', 'Master the Clone Technique', '分身の術を極める', 'Maîtriser le clone'),
          description: L('Zekâ ve çakra kontrolü ağırlıklı yol.', 'A path focused on intelligence and chakra control.', '知力とチャクラ制御に重点を置く道。', 'Une voie axée sur l\'intelligence et le contrôle du chakra.'),
          statChanges: { intelligence: 8, power: 3, health: -2 },
          consequences: [L('Teknik ustalığı', 'Technique mastery', '術の熟練', 'Maîtrise technique')],
          risk: 'medium',
        },
        {
          id: 'teamwork',
          label: L('Takım Görevini Seç', 'Choose the Team Mission', 'チーム任務を選ぶ', 'Choisir la mission d\'équipe'),
          description: L('Dostluk ve sosyal bağ kazandırır.', 'Builds friendship and social ties.', '友情と社会的な絆を築く。', 'Renforce l\'amitié et les liens sociaux.'),
          statChanges: { socialClass: 8, luck: 4, power: 2 },
          consequences: [L('Güvenilir yoldaşlar', 'Trusted allies', '信頼できる仲間', 'Alliés fiables')],
          risk: 'low',
        },
        {
          id: 'ambush',
          label: L('Pusuyu Göze Al', 'Risk the Ambush', '待ち伏せに賭ける', 'Tenter l\'embuscade'),
          description: L('Yüksek risk, yüksek güç.', 'High risk, high power.', '高いリスク、高い力。', 'Risque élevé, puissance élevée.'),
          statChanges: { power: 10, luck: -5, health: -6 },
          consequences: [L('Savaş içgüdüsü', 'Battle instinct', '戦闘本能', 'Instinct de combat')],
          risk: 'high',
        },
      ],
    },
  },

  slice_of_life: {
    worldId: 'slice_of_life',
    arcName: L('Yavaş Yaşam Yolu', 'The Slow Living Path', 'スローライフの道', 'La voie de la vie douce'),
    arcNote: L(
      'Büyük savaşlar yok; küçük anlar birikir. Rütbe yerine mahallenin hafızasında yükselirsin.',
      'No grand wars — small moments accumulate. You rise in the neighbourhood\'s memory instead of a rank chart.',
      '大きな戦争はない。小さな瞬間が積み重なる。階級ではなく、街の記憶の中で上がっていく。',
      'Pas de grandes guerres — les petits moments s\'accumulent. Tu t\'élèves dans la mémoire du quartier, pas dans un tableau de rangs.',
    ),
    ranks: [
      { threshold: 0, name: L('Yeni Gelen', 'Newcomer', '新入り', 'Nouveau venu'), note: L('İlk merhaba', 'First hello', '最初の挨拶', 'Premier bonjour') },
      { threshold: 0.22, name: L('Kulüp Üyesi', 'Club Member', '部員', 'Membre du club'), note: L('Bir yer buldun', 'You found a place', '居場所を見つけた', 'Tu as trouvé ta place') },
      { threshold: 0.46, name: L('Vazgeçilmez Dost', 'Irreplaceable Friend', 'かけがえのない友', 'Ami irremplaçable'), note: L('Güvenilen kişi', 'Trusted person', '信頼される人', 'Personne de confiance') },
      { threshold: 0.68, name: L('Mahallenin Kalbi', 'Heart of the Neighbourhood', '街の中心', 'Cœur du quartier'), note: L('Herkes seni tanır', 'Everyone knows you', 'みんながあなたを知っている', 'Tout le monde te connaît') },
      { threshold: 0.86, name: L('Efsane Komşu', 'Legendary Neighbour', '伝説の隣人', 'Voisin légendaire'), note: L('Nesiller hatırlar', 'Generations remember', '世代が覚えている', 'Les générations s\'en souviennent') },
    ],
    dilemma: {
      id: 'sol_dilemma_club',
      age: 11,
      title: L('Kulüp Seçimi', 'Club Choice', '部活選び', 'Choix du club'),
      description: L(
        '11 yaşındasın. Okulda üç kulüp kapısı açık: kamp kulübü, müzik kulübü ve sessiz okuma köşesi. Hangisi senin yerin?',
        'You are 11. Three club doors are open at school: camping, music, and the quiet reading corner. Which is your place?',
        '11歳。学校には三つの部活の扉がある：キャンプ部、音楽部、静かな読書コーナー。あなたの居場所はどれ？',
        'Tu as 11 ans. Trois portes de clubs sont ouvertes : camping, musique et le coin lecture tranquille. Lequel est ta place ?',
      ),
      choices: [
        {
          id: 'camp',
          label: L('Kamp Kulübü', 'Camping Club', 'キャンプ部', 'Club de camping'),
          description: L('Doğa, sabır ve küçük maceralar.', 'Nature, patience and small adventures.', '自然、忍耐、小さな冒険。', 'La nature, la patience et de petites aventures.'),
          statChanges: { health: 8, luck: 4, power: 2 },
          consequences: [L('Açık hava dostları', 'Outdoor friends', 'アウトドアの友達', 'Amis de plein air')],
          risk: 'low',
        },
        {
          id: 'music',
          label: L('Müzik Kulübü', 'Music Club', '音楽部', 'Club de musique'),
          description: L('Sahne, ritim ve ortak bir ses.', 'Stage, rhythm and a shared sound.', 'ステージ、リズム、共有する音。', 'La scène, le rythme et un son partagé.'),
          statChanges: { socialClass: 8, intelligence: 3, luck: 2 },
          consequences: [L('İlk konser', 'First concert', '初ライブ', 'Premier concert')],
          risk: 'low',
        },
        {
          id: 'reading',
          label: L('Sessiz Okuma Köşesi', 'Quiet Reading Corner', '静かな読書コーナー', 'Coin lecture tranquille'),
          description: L('Kitaplar ve kendi iç sesin.', 'Books and your own inner voice.', '本と自分の内なる声。', 'Les livres et ta voix intérieure.'),
          statChanges: { intelligence: 9, socialClass: -2, health: 2 },
          consequences: [L('Geniş hayal gücü', 'Vivid imagination', '豊かな想像力', 'Imagination débordante')],
          risk: 'low',
        },
      ],
    },
  },

  dark_fantasy: {
    worldId: 'dark_fantasy',
    arcName: L('Hayatta Kalma Yolu', 'The Survival Path', '生存の道', 'La voie de la survie'),
    arcNote: L(
      'Her zafer bir kayıpla ödenir. Duvarın ötesine bakan ilk kişi olmak cesaret ister.',
      'Every victory is paid for with loss. Being the first to look beyond the wall takes courage.',
      '勝利には必ず喪失が伴う。壁の外を最初に見る者には勇気が要る。',
      'Chaque victoire se paie par une perte. Être le premier à regarder au-delà du mur demande du courage.',
    ),
    ranks: [
      { threshold: 0, name: L('Hayatta Kalan', 'Survivor', '生存者', 'Survivant'), note: L('Nefes alıyorsun', 'You are breathing', '息をしている', 'Tu respires') },
      { threshold: 0.22, name: L('İzci', 'Scout', '斥候', 'Éclaireur'), note: L('Duvarın ötesini gördün', 'You saw beyond the wall', '壁の外を見た', 'Tu as vu au-delà du mur') },
      { threshold: 0.46, name: L('Kadro Lideri', 'Squad Leader', '分隊長', 'Chef d\'escouade'), note: L('Başkalarını taşıyorsun', 'You carry others', '他者を支える', 'Tu portes les autres') },
      { threshold: 0.68, name: L('Efsane Savaşçı', 'Legendary Warrior', '伝説の戦士', 'Guerrier légendaire'), note: L('Adın korkuyla anılır', 'Your name is spoken with fear', 'その名は恐怖と共に語られる', 'Ton nom inspire la peur') },
      { threshold: 0.86, name: L('Karanlığın Taşıyıcısı', 'Bearer of the Dark', '闇の担い手', 'Porteur des ténèbres'), note: L('Hikâye seninle biter', 'The story ends with you', '物語はあなたと共に終わる', 'L\'histoire se termine avec toi') },
    ],
    dilemma: {
      id: 'df_dilemma_first_scout',
      age: 11,
      title: L('İlk Sefer', 'The First Expedition', '最初の遠征', 'La première expédition'),
      description: L(
        '11 yaşındasın. Duvarın ötesine ilk kez gidecek bir gruba katılabilirsin. Grupta bir çocuk, bir hekim ve bir izci var. Ne yaparsın?',
        'You are 11. You can join a group heading beyond the wall for the first time. The group has a child, a healer and a scout. What do you do?',
        '11歳。初めて壁の外へ向かう隊に加われる。隊には子ども、治療師、斥候がいる。どうする？',
        'Tu as 11 ans. Tu peux rejoindre un groupe qui part au-delà du mur pour la première fois. Il y a un enfant, un guérisseur et un éclaireur. Que fais-tu ?',
      ),
      choices: [
        {
          id: 'scout',
          label: L('İzcinin Yanında Git', 'Follow the Scout', '斥候と共に行く', 'Suivre l\'éclaireur'),
          description: L('Tehlikeyi ilk gören olursun.', 'You become the first to see danger.', '危険を最初に見る者になる。', 'Tu es le premier à voir le danger.'),
          statChanges: { power: 6, intelligence: 6, health: -5 },
          consequences: [L('Hayatta kalma bilgisi', 'Survival knowledge', '生存の知識', 'Savoir de survie')],
          risk: 'high',
        },
        {
          id: 'healer',
          label: L('Hekimi Koru', 'Protect the Healer', '治療師を守る', 'Protéger le guérisseur'),
          description: L('Kayıpları azaltırsın.', 'You reduce the losses.', '損失を減らす。', 'Tu réduis les pertes.'),
          statChanges: { socialClass: 9, health: 4, power: -2 },
          consequences: [L('Kurtarılan hayatlar', 'Lives saved', '救われた命', 'Vies sauvées')],
          risk: 'medium',
        },
        {
          id: 'stay',
          label: L('Geride Kal ve Hazırlan', 'Stay Back and Prepare', '残って準備する', 'Rester et se préparer'),
          description: L('Bu sefer değil, bir sonraki sefer.', 'Not this time — the next one.', '今回は見送り、次に備える。', 'Pas cette fois — la prochaine.'),
          statChanges: { intelligence: 5, luck: 5, power: -3 },
          consequences: [L('Sabır', 'Patience', '忍耐', 'Patience')],
          risk: 'low',
        },
      ],
    },
  },

  isekai: {
    worldId: 'isekai',
    arcName: L('Çağrılanın Yolu', 'The Summoned Path', '召喚されし者の道', 'La voie de l\'invoqué'),
    arcNote: L(
      'Sıfırdan başlarsın; lonca kartın rütbeni, tercihlerin ise efsanenin yönünü belirler.',
      'You start from zero; your guild card sets your rank, your choices shape the legend.',
      'ゼロから始まる。ギルドカードが階級を、選択が伝説の方向を決める。',
      'Tu pars de zéro ; ta carte de guilde fixe ton rang, tes choix dessinent la légende.',
    ),
    ranks: [
      { threshold: 0, name: L('Çağrılan', 'Summoned', '召喚者', 'Invoqué'), note: L('Yabancı bir dünyadasın', 'You are in a strange world', '見知らぬ世界にいる', 'Tu es dans un monde étrange') },
      { threshold: 0.22, name: L('Bronz Maceracı', 'Bronze Adventurer', '銅の冒険者', 'Aventurier de bronze'), note: L('İlk sözleşme', 'First contract', '最初の契約', 'Premier contrat') },
      { threshold: 0.46, name: L('Gümüş Maceracı', 'Silver Adventurer', '銀の冒険者', 'Aventurier d\'argent'), note: L('Güvenilen isim', 'A trusted name', '信頼される名', 'Un nom de confiance') },
      { threshold: 0.68, name: L('Altın Maceracı', 'Gold Adventurer', '金の冒険者', 'Aventurier d\'or'), note: L('Parti lideri', 'Party leader', 'パーティーリーダー', 'Chef de groupe') },
      { threshold: 0.86, name: L('Kahraman', 'Hero', '勇者', 'Héros'), note: L('Dünyanın adı seninle anılır', 'The world is named with you', '世界があなたの名で語られる', 'Le monde porte ton nom') },
    ],
    dilemma: {
      id: 'isekai_dilemma_guild',
      age: 11,
      title: L('Lonca Kartı', 'The Guild Card', 'ギルドカード', 'La carte de guilde'),
      description: L(
        '11 yaşındasın ve loncaya kaydoldun. İlk yetenek seçimini yapmalısın: kılıç, büyü ya da destek. Lonca kayıt memuru sana bakıyor.',
        'You are 11 and have registered at the guild. You must choose your first skill: sword, magic or support. The guild clerk is watching you.',
        '11歳でギルドに登録した。最初のスキルを選ばなければならない：剣、魔法、支援。受付があなたを見ている。',
        'Tu as 11 ans et tu t\'es inscrit à la guilde. Tu dois choisir ta première compétence : épée, magie ou soutien. Le greffier t\'observe.',
      ),
      choices: [
        {
          id: 'sword',
          label: L('Kılıç Yolu', 'Way of the Sword', '剣の道', 'La voie de l\'épée'),
          description: L('Ön safta savaşırsın.', 'You fight on the front line.', '前線で戦う。', 'Tu combats en première ligne.'),
          statChanges: { power: 10, health: -3, luck: 2 },
          consequences: [L('Ön saf', 'Front line', '前線', 'Première ligne')],
          risk: 'medium',
        },
        {
          id: 'magic',
          label: L('Büyü Yolu', 'Way of Magic', '魔法の道', 'La voie de la magie'),
          description: L('Zekâ ve kontrol senin silahın.', 'Intelligence and control are your weapons.', '知力と制御が武器。', 'L\'intelligence et le contrôle sont tes armes.'),
          statChanges: { intelligence: 10, power: 2, health: -2 },
          consequences: [L('Büyü bilgisi', 'Arcane knowledge', '魔法の知識', 'Savoir arcanique')],
          risk: 'medium',
        },
        {
          id: 'support',
          label: L('Destek Yolu', 'Way of Support', '支援の道', 'La voie du soutien'),
          description: L('Partiyi ayakta tutarsın.', 'You keep the party standing.', 'パーティーを支える。', 'Tu maintiens le groupe debout.'),
          statChanges: { socialClass: 8, intelligence: 4, luck: 4 },
          consequences: [L('Güvenilen destek', 'Trusted support', '信頼の支援', 'Soutien de confiance')],
          risk: 'low',
        },
      ],
    },
  },

  cyberpunk: {
    worldId: 'cyberpunk',
    arcName: L('Sokak Efsanesi', 'Street Legend', 'ストリートの伝説', 'Légende de la rue'),
    arcNote: L(
      'Şirket kuleleri arasında kendi adını yazdırırsın. Her yükseltme bir parçanı senden alır.',
      'You carve your name between corporate towers. Every upgrade takes a piece of you.',
      '企業の塔の間で自分の名を刻む。強化のたびに自分自身を削っていく。',
      'Tu inscris ton nom entre les tours des corporations. Chaque amélioration te retire une part de toi.',
    ),
    ranks: [
      { threshold: 0, name: L('Sokak Çocuğu', 'Street Kid', 'ストリートキッズ', 'Gamin des rues'), note: L('Hayatta kalmayı öğrendin', 'You learned to survive', '生き残り方を学んだ', 'Tu as appris à survivre') },
      { threshold: 0.22, name: L('Runner', 'Runner', 'ランナー', 'Runner'), note: L('İlk iş, ilk iz', 'First job, first trace', '最初の仕事、最初の痕跡', 'Premier job, première trace') },
      { threshold: 0.46, name: L('Edgerunner', 'Edgerunner', 'エッジランナー', 'Edgerunner'), note: L('Riskli işlerin adamı', 'The one for risky jobs', '危険な仕事の担い手', 'Celui des missions risquées') },
      { threshold: 0.68, name: L('Night City Efsanesi', 'Night City Legend', 'ナイトシティの伝説', 'Légende de Night City'), note: L('Fixer\'lar seni arar', 'Fixers call you', 'フィクサーが連絡してくる', 'Les fixers t\'appellent') },
      { threshold: 0.86, name: L('Sistemin Dışında', 'Beyond the System', 'システムの外へ', 'Au-delà du système'), note: L('Şirketler adını not aldı', 'The corps took note', '企業が名を記録した', 'Les corporations ont noté ton nom') },
    ],
    dilemma: {
      id: 'cyber_dilemma_first_gig',
      age: 11,
      title: L('İlk Sokak İşi', 'The First Street Gig', '最初のストリート仕事', 'Le premier contrat de rue'),
      description: L(
        '11 yaşındasın. Bir fixer sana küçük bir iş teklif ediyor: veri çalmak, birini korumak ya da bir terminali tamir etmek. Hangi rolü alırsın?',
        'You are 11. A fixer offers a small job: steal data, protect someone, or repair a terminal. Which role do you take?',
        '11歳。フィクサーが小さな仕事を持ちかける：データ盗難、護衛、端末の修理。どの役割を選ぶ？',
        'Tu as 11 ans. Un fixer te propose un petit boulot : voler des données, protéger quelqu\'un ou réparer un terminal. Quel rôle prends-tu ?',
      ),
      choices: [
        {
          id: 'netrunner',
          label: L('Netrunner Ol', 'Become a Netrunner', 'ネットランナーになる', 'Devenir netrunner'),
          description: L('Kod ve sinir arasında yaşarsın.', 'You live between code and nerves.', 'コードと神経の間で生きる。', 'Tu vis entre le code et les nerfs.'),
          statChanges: { intelligence: 10, health: -4, luck: 2 },
          consequences: [L('İz bırakmayan kod', 'Untraceable code', '痕跡を残さないコード', 'Code sans trace')],
          risk: 'high',
        },
        {
          id: 'solo',
          label: L('Solo Ol', 'Become a Solo', 'ソロになる', 'Devenir solo'),
          description: L('Kas ve refleks senin ekipmanın.', 'Muscle and reflex are your gear.', '筋肉と反射が装備。', 'Le muscle et le réflexe sont ton équipement.'),
          statChanges: { power: 10, socialClass: 3, health: -3 },
          consequences: [L('Sokak saygısı', 'Street respect', 'ストリートの敬意', 'Respect de la rue')],
          risk: 'medium',
        },
        {
          id: 'techie',
          label: L('Teknisyen Ol', 'Become a Techie', 'テッキーになる', 'Devenir technicien'),
          description: L('Her şeyi tamir edersin.', 'You can fix anything.', '何でも修理できる。', 'Tu peux tout réparer.'),
          statChanges: { intelligence: 6, socialClass: 6, luck: 3 },
          consequences: [L('Vazgeçilmez el', 'Indispensable hand', '不可欠な腕', 'Main indispensable')],
          risk: 'low',
        },
      ],
    },
  },

  seinen_psych: {
    worldId: 'seinen_psych',
    arcName: L('Satranç Tahtası', 'The Chessboard', 'チェス盤', 'L\'échiquier'),
    arcNote: L(
      'Güç değil, hamle kazanır. Her dava bir sonraki hamlenin habericisidir.',
      'Moves win, not muscle. Every case foreshadows the next move.',
      '勝つのは力ではなく一手。すべての事件が次の一手を予告する。',
      'Ce sont les coups qui gagnent, pas les muscles. Chaque affaire annonce le coup suivant.',
    ),
    ranks: [
      { threshold: 0, name: L('Gözlemci', 'Observer', '観察者', 'Observateur'), note: L('Detayları topluyorsun', 'You collect details', '細部を集めている', 'Tu collectes les détails') },
      { threshold: 0.22, name: L('Araştırmacı', 'Investigator', '調査員', 'Enquêteur'), note: L('İlk dava', 'First case', '最初の事件', 'Première affaire') },
      { threshold: 0.46, name: L('Stratejist', 'Strategist', '戦略家', 'Stratège'), note: L('Üç hamle önde', 'Three moves ahead', '三手先を読む', 'Trois coups d\'avance') },
      { threshold: 0.68, name: L('Usta Zihin', 'Master Mind', '達人の頭脳', 'Esprit maître'), note: L('Rakibin seni tanıyor', 'Your rival knows you', '敵があなたを知っている', 'Ton rival te connaît') },
      { threshold: 0.86, name: L('Satranç Ustası', 'Chess Master', 'チェスの達人', 'Maître des échecs'), note: L('Oyun senin kurallarınla', 'The game is on your terms', 'ゲームはあなたのルールで', 'Le jeu suit tes règles') },
    ],
    dilemma: {
      id: 'seinen_dilemma_first_case',
      age: 11,
      title: L('İlk Dava', 'The First Case', '最初の事件', 'La première affaire'),
      description: L(
        '11 yaşındasın. Öğretmenin kaybolan bir eşyanın yerini soruyor. Üç yol var: kanıt topla, arkadaşlarına sor, ya da köşede izle.',
        'You are 11. Your teacher asks where a missing item went. Three paths: gather evidence, ask classmates, or watch from the corner.',
        '11歳。先生がなくなった物の行方を尋ねている。証拠を集める、同級生に聞く、隅で見守る。',
        'Tu as 11 ans. Ton professeur demande où est passé un objet perdu. Trois voies : chercher des preuves, interroger les camarades ou observer depuis le coin.',
      ),
      choices: [
        {
          id: 'evidence',
          label: L('Kanıt Topla', 'Gather Evidence', '証拠を集める', 'Rassembler des preuves'),
          description: L('Soğukkanlı ve yalnız yol.', 'A calm, solitary path.', '冷静で孤独な道。', 'Une voie calme et solitaire.'),
          statChanges: { intelligence: 10, socialClass: -3, luck: 2 },
          consequences: [L('Keskin gözlem', 'Sharp observation', '鋭い観察', 'Observation aiguisée')],
          risk: 'low',
        },
        {
          id: 'ask',
          label: L('Arkadaşlarına Sor', 'Ask Your Classmates', '同級生に聞く', 'Interroger les camarades'),
          description: L('Sosyal ağını kullanırsın.', 'You use your social network.', '人脈を使う。', 'Tu utilises ton réseau.'),
          statChanges: { socialClass: 9, intelligence: 4, luck: 3 },
          consequences: [L('Güvenilen dinleyici', 'Trusted listener', '信頼される聞き手', 'Auditeur de confiance')],
          risk: 'low',
        },
        {
          id: 'watch',
          label: L('Köşeden İzle', 'Watch From the Corner', '隅で見守る', 'Observer depuis le coin'),
          description: L('Kimin ne yaptığını görürsün.', 'You see who does what.', '誰が何をするか見える。', 'Tu vois qui fait quoi.'),
          statChanges: { intelligence: 6, luck: 6, socialClass: -2 },
          consequences: [L('Gizli bilgi', 'Hidden knowledge', '隠された知識', 'Savoir caché')],
          risk: 'medium',
        },
      ],
    },
  },

  romance_drama: {
    worldId: 'romance_drama',
    arcName: L('Kalp Çizgisi', 'The Heart Line', '心の線', 'La ligne du cœur'),
    arcNote: L(
      'Duygular biriktikçe mesafe kısalır. Her itiraf bir eşik, her sessizlik bir bedeldir.',
      'Distance shrinks as feelings accumulate. Every confession is a threshold; every silence has a price.',
      '感情が積み重なるほど距離が縮まる。告白は境界、沈黙は代償。',
      'La distance se réduit à mesure que les sentiments s\'accumulent. Chaque aveu est un seuil, chaque silence un prix.',
    ),
    ranks: [
      { threshold: 0, name: L('Yabancı', 'Stranger', '他人', 'Inconnu'), note: L('İlk bakış', 'First glance', '最初の視線', 'Premier regard') },
      { threshold: 0.22, name: L('Tanıdık', 'Acquaintance', '知り合い', 'Connaissance'), note: L('Adını öğrendin', 'You learned the name', '名前を知った', 'Tu as appris le nom') },
      { threshold: 0.46, name: L('Sırdaş', 'Confidant', '相談相手', 'Confident'), note: L('Sırlar paylaşıldı', 'Secrets shared', '秘密を分かち合った', 'Des secrets partagés') },
      { threshold: 0.68, name: L('Aşık', 'Beloved', '愛する人', 'Aimé'), note: L('Kalpler yaklaştı', 'Hearts drew close', '心が近づいた', 'Les cœurs se sont rapprochés') },
      { threshold: 0.86, name: L('Ruh Eşi', 'Soulmate', '魂の伴侶', 'Âme sœur'), note: L('Bir ömür yetmez', 'A lifetime is not enough', '一生では足りない', 'Une vie ne suffit pas') },
    ],
    dilemma: {
      id: 'romance_dilemma_festival',
      age: 11,
      title: L('Festival Mektubu', 'The Festival Letter', '祭りの手紙', 'La lettre du festival'),
      description: L(
        '11 yaşındasın. Festivalde bir arkadaşın sana bir mektup verdi. Açmak, beklemek ya da geri vermek arasında seçim yapmalısın.',
        'You are 11. At the festival a friend hands you a letter. You must choose: open it, wait, or give it back.',
        '11歳。祭りである友達が手紙をくれた。開ける、待つ、返す、どれを選ぶ？',
        'Tu as 11 ans. Au festival, un ami te remet une lettre. Tu dois choisir : l\'ouvrir, attendre ou la rendre.',
      ),
      choices: [
        {
          id: 'open',
          label: L('Hemen Aç', 'Open It Now', 'すぐ開ける', 'L\'ouvrir tout de suite'),
          description: L('Dürüst ama cesur bir hamle.', 'An honest but brave move.', '正直で勇気ある一手。', 'Un geste honnête mais courageux.'),
          statChanges: { socialClass: 8, luck: 5, health: 2 },
          consequences: [L('Açık bir kalp', 'An open heart', '開かれた心', 'Un cœur ouvert')],
          risk: 'medium',
        },
        {
          id: 'wait',
          label: L('Doğru Anı Bekle', 'Wait for the Right Moment', '良い時を待つ', 'Attendre le bon moment'),
          description: L('Sabır, ama kaçırma riski.', 'Patience, with a risk of missing out.', '忍耐、だが逃す危険も。', 'De la patience, mais un risque de rater.'),
          statChanges: { intelligence: 5, luck: 4, socialClass: 2 },
          consequences: [L('Düşünülmüş cevap', 'A considered answer', '考え抜いた答え', 'Une réponse réfléchie')],
          risk: 'low',
        },
        {
          id: 'return',
          label: L('Nazikçe Geri Ver', 'Gently Give It Back', 'そっと返す', 'La rendre doucement'),
          description: L('Sınırlarını korursun.', 'You protect your boundaries.', '自分の境界を守る。', 'Tu protèges tes limites.'),
          statChanges: { health: 6, socialClass: -4, intelligence: 3 },
          consequences: [L('Net bir sınır', 'A clear boundary', '明確な境界', 'Une limite claire')],
          risk: 'low',
        },
      ],
    },
  },

  sports: {
    worldId: 'sports',
    arcName: L('Saha Yolu', 'The Court Path', 'コートの道', 'La voie du terrain'),
    arcNote: L(
      'Yedekten başlar, her antrenmanda bir adım yükselirsin. Takım seni ne kadar taşırsa o kadar yükselirsin.',
      'You start on the bench and climb one step per practice. You rise as far as the team carries you.',
      'ベンチから始まり、練習ごとに一歩上がる。チームが支える分だけ高く昇る。',
      'Tu commences sur le banc et montes d\'un cran à chaque entraînement. Tu t\'élèves autant que l\'équipe te porte.',
    ),
    ranks: [
      { threshold: 0, name: L('Yedek', 'Benchwarmer', '補欠', 'Remplaçant'), note: L('İzleyerek öğreniyorsun', 'Learning by watching', '見て学んでいる', 'Tu apprends en regardant') },
      { threshold: 0.22, name: L('İlk 5', 'Starter', 'スタメン', 'Titulaire'), note: L('Sahadasın', 'You are on the court', 'コートに立つ', 'Tu es sur le terrain') },
      { threshold: 0.46, name: L('Takım Yıldızı', 'Team Star', 'チームの星', 'Star de l\'équipe'), note: L('Top senin elinde', 'The ball is yours', 'ボールはあなたのもの', 'Le ballon est à toi') },
      { threshold: 0.68, name: L('Bölge Yıldızı', 'Regional Star', '地区の星', 'Star régionale'), note: L('Rakipler seni çalışıyor', 'Rivals study you', 'ライバルが研究している', 'Les rivaux t\'étudient') },
      { threshold: 0.86, name: L('Ulusal Efsane', 'National Legend', '全国の伝説', 'Légende nationale'), note: L('Adın salonlarda', 'Your name fills arenas', 'その名が体育館に響く', 'Ton nom remplit les salles') },
    ],
    dilemma: {
      id: 'sports_dilemma_first_match',
      age: 11,
      title: L('İlk Maç', 'The First Match', '最初の試合', 'Le premier match'),
      description: L(
        '11 yaşındasın. Bölge turnuvasında son dakikalar. Top senin önünde: kendin mi atacaksın, pas mı vereceksin, yoksa kenarda mı kalacaksın?',
        'You are 11. Final minutes of the regional tournament. The ball is in front of you: shoot yourself, pass, or stay on the bench?',
        '11歳。地区大会の終盤。ボールが目の前にある：自分で打つ、パスする、それともベンチに残る？',
        'Tu as 11 ans. Les dernières minutes du tournoi régional. Le ballon est devant toi : tirer, passer ou rester sur le banc ?',
      ),
      choices: [
        {
          id: 'shoot',
          label: L('Kendin At', 'Take the Shot', '自分で打つ', 'Tirer toi-même'),
          description: L('Sorumluluğu üstlenirsin.', 'You take responsibility.', '責任を負う。', 'Tu assumes la responsabilité.'),
          statChanges: { power: 9, socialClass: 4, luck: -3 },
          consequences: [L('Kahraman ya da günah keçisi', 'Hero or scapegoat', '英雄か生贄か', 'Héros ou bouc émissaire')],
          risk: 'high',
        },
        {
          id: 'pass',
          label: L('En İyi Pozisyona Pas Ver', 'Pass to the Best Option', '最善の位置へパス', 'Passer au mieux placé'),
          description: L('Takım oyunu kazanır.', 'Team play wins.', 'チームプレーが勝つ。', 'Le jeu collectif gagne.'),
          statChanges: { socialClass: 9, intelligence: 4, power: 2 },
          consequences: [L('Takım güveni', 'Team trust', 'チームの信頼', 'Confiance de l\'équipe')],
          risk: 'low',
        },
        {
          id: 'bench',
          label: L('Kenarda Kal', 'Stay on the Bench', 'ベンチに残る', 'Rester sur le banc'),
          description: L('Bir sonraki maçı bekle.', 'Wait for the next match.', '次の試合を待つ。', 'Attendre le prochain match.'),
          statChanges: { intelligence: 4, health: 5, socialClass: -2 },
          consequences: [L('Uzun vadeli hazırlık', 'Long-term preparation', '長期的な準備', 'Préparation à long terme')],
          risk: 'low',
        },
      ],
    },
  },
};

export const getUniversePath = (worldId: string): UniversePath | undefined => UNIVERSE_PATHS[worldId];

/** Yaş + statlardan 0–1 arası ilerleme puanı. */
export const computePathProgress = (
  age: number,
  deathAge: number,
  stats: { power: number; intelligence: number; socialClass: number },
): number => {
  const ageRatio = Math.min(1, Math.max(0, age / Math.max(1, deathAge)));
  const statRatio = Math.min(1, Math.max(0, (stats.power + stats.intelligence + stats.socialClass) / 300));
  return Math.min(1, ageRatio * 0.65 + statRatio * 0.35);
};

export const getRankIndexForProgress = (path: UniversePath, progress: number): number => {
  let index = 0;
  for (let i = 0; i < path.ranks.length; i++) {
    if (progress >= path.ranks[i].threshold) index = i;
  }
  return index;
};

export interface RankSnapshot {
  path: UniversePath;
  index: number;
  current: UniverseRank;
  next: UniverseRank | null;
  /** Bir sonraki rütbeye ne kadar kaldı (0–100). Son rütbede 100. */
  nextPercent: number;
  progressPercent: number;
}

export const getRankSnapshot = (worldId: string, progress: number): RankSnapshot | null => {
  const path = getUniversePath(worldId);
  if (!path) return null;
  const clamped = Math.min(1, Math.max(0, progress));
  const index = getRankIndexForProgress(path, clamped);
  const next = path.ranks[index + 1] ?? null;
  const currentThreshold = path.ranks[index].threshold;
  const nextThreshold = next?.threshold ?? 1;
  const span = Math.max(0.0001, nextThreshold - currentThreshold);
  const nextPercent = next ? Math.min(100, Math.max(0, Math.round(((clamped - currentThreshold) / span) * 100))) : 100;
  return {
    path,
    index,
    current: path.ranks[index],
    next,
    nextPercent,
    progressPercent: Math.round(clamped * 100),
  };
};
