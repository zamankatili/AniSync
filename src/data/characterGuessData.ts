/**
 * KİM BU KARAKTER? — İpucu modu verisi.
 *
 * Ses klipleri yalnızca resmi kanallardan geldiği için (bkz. voiceDuelData.ts)
 * ses modu tek seriyle sınırlı. Bu mod ise **metin tabanlı** bir tanıma
 * oyunudur: ses yok, telif riski yok, yalnızca dört dilli ipuçları ve şıklar.
 *
 * Tüm bilgiler kanon kaynaklara dayanır; yanlış/atıf riski taşıyan alıntı
 * kullanılmaz. `note` alanı cevap sonrası kısa açıklamadır.
 */

import type { Lang4 } from './universePaths';

export type CharacterDifficulty = 'kolay' | 'orta' | 'zor';

export interface CharacterHintItem {
  id: string;
  name: string;
  series: string;
  difficulty: CharacterDifficulty;
  options: [string, string, string, string];
  hint: Record<Lang4, string>;
  note: Record<Lang4, string>;
}

const H = (tr: string, en: string, ja: string, fr: string): Record<Lang4, string> => ({ tr, en, ja, fr });

export const CHARACTER_HINTS: CharacterHintItem[] = [
  {
    id: 'naruto',
    name: 'Naruto Uzumaki',
    series: 'Naruto',
    difficulty: 'kolay',
    options: ['Naruto Uzumaki', 'Sasuke Uchiha', 'Kakashi Hatake', 'Boruto Uzumaki'],
    hint: H(
      'Turuncu kıyafetli, ramen seven ve içinde dokuz kuyruklu tilkiyi taşıyan bir ninja.',
      'A ninja in orange who loves ramen and carries the Nine-Tailed Fox inside him.',
      'オレンジの服を着てラーメンが好きな忍者。体内に九尾の狐を宿している。',
      'Un ninja en orange qui adore les ramen et porte le renard à neuf queues en lui.',
    ),
    note: H(
      'Köyü tarafından dışlanan Naruto, Hokage olma hayaliyle büyür; Kyuubi onun en büyük yükü ve gücüdür.',
      'Shunned by his village, Naruto grows up dreaming of becoming Hokage; the Nine-Tails is both his burden and his power.',
      '村から疎まれながら火影を目指す。九尾は最大の重荷であり力でもある。',
      'Rejeté par son village, Naruto rêve de devenir Hokage ; le démon à neuf queues est à la fois son fardeau et sa force.',
    ),
  },
  {
    id: 'sasuke',
    name: 'Sasuke Uchiha',
    series: 'Naruto',
    difficulty: 'kolay',
    options: ['Sasuke Uchiha', 'Itachi Uchiha', 'Naruto Uzumaki', 'Shikamaru Nara'],
    hint: H(
      'Uchiha klanının son üyelerinden; Sharingan’lı, intikam ateşiyle yanan ciddi bir ninja.',
      'One of the last Uchiha; a serious ninja with the Sharingan and a burning desire for revenge.',
      'うちは一族の生き残り。写輪眼を持ち、復讐の炎を燃やす真面目な忍者。',
      'L\'un des derniers Uchiha ; un ninja sérieux au Sharingan, animé par une soif de vengeance.',
    ),
    note: H(
      'Ailesini öldüren ağabeyi Itachi’nin peşinden gider; sonradan gerçeğin çok daha karmaşık olduğunu öğrenir.',
      'He hunts his brother Itachi, who killed their clan — then learns the truth is far more complicated.',
      '一族を殺した兄イタチを追うが、後に真実がはるかに複雑だと知る。',
      'Il poursuit son frère Itachi, meurtrier du clan — avant de découvrir une vérité bien plus complexe.',
    ),
  },
  {
    id: 'kakashi',
    name: 'Kakashi Hatake',
    series: 'Naruto',
    difficulty: 'orta',
    options: ['Kakashi Hatake', 'Might Guy', 'Yamato', 'Jiraiya'],
    hint: H(
      'Gümüş saçlı, yüzünün yarısı maskeli; Sharingan’ı bir gözünde taşıyan “Kopya Ninja”.',
      'Silver-haired with half his face masked; the “Copy Ninja” who carries a Sharingan in one eye.',
      '銀髪で顔の半分をマスクで隠し、片目に写輪眼を持つ「コピー忍者」。',
      'Cheveux argentés, moitié du visage masquée ; le « ninja copieur » qui porte un Sharingan à un œil.',
    ),
    note: H(
      'Obito’nun hediye ettiği Sharingan’ı kullanır; anma taşına uğradığı için randevulara sık geç kalır.',
      'He uses the Sharingan Obito gave him; he is often late because he visits the memorial stone.',
      'オビトから託された写輪眼を使う。慰霊碑に寄るため待ち合わせによく遅れる。',
      'Il utilise le Sharingan offert par Obito ; il est souvent en retard car il passe au monument aux morts.',
    ),
  },
  {
    id: 'sakura',
    name: 'Sakura Haruno',
    series: 'Naruto',
    difficulty: 'orta',
    options: ['Sakura Haruno', 'Hinata Hyuga', 'Ino Yamanaka', 'Tsunade'],
    hint: H(
      'Pembe saçlı, Tsunade’nin öğrencisi olan tıbbi ninja; yumruklarıyla yeri parçalar.',
      'A pink-haired medical ninja trained by Tsunade; her punches crack the ground.',
      'ピンクの髪を持つ綱手の弟子。医療忍者で、拳で地面を砕く。',
      'Une kunoichi médicale aux cheveux roses, formée par Tsunade ; ses poings fissurent le sol.',
    ),
    note: H(
      'Başta yalnızca Sasuke’ye odaklıyken zamanla kendi gücünü kuran bir savaşçıya dönüşür.',
      'She starts focused on Sasuke and grows into a warrior who builds her own strength.',
      '最初はサスケ中心だったが、次第に自分の強さを築く戦士へ成長する。',
      'D\'abord centrée sur Sasuke, elle devient une combattante qui forge sa propre force.',
    ),
  },
  {
    id: 'hinata',
    name: 'Hinata Hyuga',
    series: 'Naruto',
    difficulty: 'zor',
    options: ['Hinata Hyuga', 'Hanabi Hyuga', 'Sakura Haruno', 'Tenten'],
    hint: H(
      'Byakugan’lı Hyuga klanından, utangaç ama cesur; Naruto’ya karşı derin duygular besler.',
      'From the Byakugan-wielding Hyuga clan: shy but brave, with deep feelings for Naruto.',
      '白眼を持つ日向一族の出身。内気だが勇敢で、ナルトに深い想いを抱く。',
      'Issue du clan Hyuga au Byakugan : timide mais courageuse, avec des sentiments profonds pour Naruto.',
    ),
    note: H(
      'Kendi iradesiyle savaşmayı seçen Hinata, Pain saldırısında Naruto’yu korumak için öne atılır.',
      'Hinata chooses to fight on her own terms and steps forward to protect Naruto during Pain\'s attack.',
      '自分の意志で戦うことを選び、ペイン襲撃時にナルトを守るため前に出る。',
      'Hinata choisit de se battre selon ses propres termes et protège Naruto lors de l\'attaque de Pain.',
    ),
  },
  {
    id: 'luffy',
    name: 'Monkey D. Luffy',
    series: 'One Piece',
    difficulty: 'kolay',
    options: ['Monkey D. Luffy', 'Roronoa Zoro', 'Sanji', 'Portgas D. Ace'],
    hint: H(
      'Hasır şapkalı, lastik gibi uzayan bedenli kaptan; Korsanlar Kralı olmak istiyor.',
      'A straw-hatted captain with a rubber body who wants to become the Pirate King.',
      '麦わら帽子をかぶり、ゴムのように伸びる体を持つ船長。海賊王を目指す。',
      'Un capitaine au chapeau de paille et au corps élastique qui veut devenir le Roi des Pirates.',
    ),
    note: H(
      'Şapkayı Shanks’tan almıştır; bu, büyük bir korsan olma sözünün simgesidir.',
      'He received the hat from Shanks; it symbolizes his promise to become a great pirate.',
      '帽子はシャンクスから託された、大海賊になるという約束の証。',
      'Il a reçu le chapeau de Shanks ; c\'est le symbole de sa promesse de devenir un grand pirate.',
    ),
  },
  {
    id: 'zoro',
    name: 'Roronoa Zoro',
    series: 'One Piece',
    difficulty: 'kolay',
    options: ['Roronoa Zoro', 'Sanji', 'Brook', 'Trafalgar Law'],
    hint: H(
      'Yeşil saçlı, üç kılıç kullanan ve yön bulmakta efsanevi derecede kötü olan kılıç ustası.',
      'A green-haired swordsman who wields three swords and is legendarily bad with directions.',
      '緑の髪で三刀流を使う剣士。方向音痴としても有名。',
      'Un épéiste aux cheveux verts qui manie trois sabres et se perd légendairement.',
    ),
    note: H(
      'Üç kılıç stilini çocukluk arkadaşı Kuina’ya verdiği sözü tutmak için geliştirir; Wado Ichimonji onun hatırasıdır.',
      'He developed the three-sword style to keep his promise to his childhood friend Kuina; Wado Ichimonji is her keepsake.',
      '三刀流は幼なじみのクイナとの約束を果たすため。和道一文字は彼女の形見。',
      'Il a développé le style à trois sabres pour tenir sa promesse à Kuina ; Wado Ichimonji est son souvenir.',
    ),
  },
  {
    id: 'nami',
    name: 'Nami',
    series: 'One Piece',
    difficulty: 'orta',
    options: ['Nami', 'Nico Robin', 'Boa Hancock', 'Vivi'],
    hint: H(
      'Turuncu saçlı, harita çizen ve hava durumunu okuyan gezgin; para konusunda acımasız.',
      'An orange-haired navigator who draws maps and reads the weather; ruthless about money.',
      'オレンジの髪を持つ航海士。地図を描き天候を読む。お金には厳しい。',
      'Une navigatrice aux cheveux orange qui dessine des cartes et lit le temps ; impitoyable avec l\'argent.',
    ),
    note: H(
      'Arlong’un köyünü esir aldığı geçmişten sonra Luffy’nin ekibine katılır; tangerine ağaçları memleketini hatırlatır.',
      'After Arlong held her village hostage, she joins Luffy; tangerine trees remind her of home.',
      'アーロンに村を人質にされた過去を経てルフィの仲間になる。みかんの木は故郷の象徴。',
      'Après qu\'Arlong a pris son village en otage, elle rejoint Luffy ; les mandariniers lui rappellent sa maison.',
    ),
  },
  {
    id: 'sanji',
    name: 'Sanji',
    series: 'One Piece',
    difficulty: 'orta',
    options: ['Sanji', 'Zeff', 'Usopp', 'Franky'],
    hint: H(
      'Takımın aşçısı; yemek yaparken elleri korumak için yalnızca tekme kullanır.',
      'The crew\'s cook; he fights only with kicks to protect his hands for cooking.',
      '船の料理人。手を守るため、戦闘では蹴りしか使わない。',
      'Le cuisinier de l\'équipage ; il ne se bat qu\'avec des coups de pied pour protéger ses mains.',
    ),
    note: H(
      'Baratie’de Zeff tarafından büyütülür; açlığın ne demek olduğunu bildiği için kimseyi aç bırakmaz.',
      'Raised by Zeff at the Baratie; knowing hunger, he never lets anyone go unfed.',
      'バラティエでゼフに育てられた。飢えを知るからこそ、誰も飢えさせない。',
      'Élevé par Zeff au Baratie ; connaissant la faim, il ne laisse jamais personne sans nourriture.',
    ),
  },
  {
    id: 'chopper',
    name: 'Tony Tony Chopper',
    series: 'One Piece',
    difficulty: 'orta',
    options: ['Tony Tony Chopper', 'Brook', 'Franky', 'Jinbe'],
    hint: H(
      'Konuşan ren geyiği; doktor, şapka sever ve Rumble Ball ile form değiştirir.',
      'A talking reindeer; a doctor who loves hats and changes form with the Rumble Ball.',
      '話すトナカイの医師。帽子が好きで、ランブルボールで姿を変える。',
      'Un renne qui parle ; médecin, il adore les chapeaux et change de forme avec la Rumble Ball.',
    ),
    note: H(
      'İnsanlar tarafından dışlanmış bir ren geyiğiydi; Dr. Hiriluk ve Kureha onu hayata bağladı.',
      'He was a reindeer rejected by humans; Dr. Hiriluk and Kureha gave him a reason to live.',
      '人間に拒絶されたトナカイだった。ヒルルクとクレハが生きる意味を与えた。',
      'C\'était un renne rejeté par les humains ; les docteurs Hiriluk et Kureha lui ont donné une raison de vivre.',
    ),
  },
  {
    id: 'eren',
    name: 'Eren Yeager',
    series: 'Attack on Titan',
    difficulty: 'kolay',
    options: ['Eren Yeager', 'Armin Arlert', 'Reiner Braun', 'Levi Ackerman'],
    hint: H(
      'Duvarların ötesine geçmek isteyen, Saldırı Titanı’nın gücünü taşıyan yeşil gözlü genç.',
      'A green-eyed youth who wants to see beyond the walls and carries the power of the Attack Titan.',
      '壁の外を望み、進撃の巨人の力を宿す緑目の青年。',
      'Un jeune aux yeux verts qui veut voir au-delà des murs et porte le pouvoir du Titan Assaillant.',
    ),
    note: H(
      'Özgürlük arzusu zamanla herkesi korumak için ağır bir bedel ödemeye dönüşür.',
      'His desire for freedom turns into paying a heavy price to protect everyone.',
      '自由への願いは、やがて皆を守るための重い代償へと変わる。',
      'Son désir de liberté se transforme en un lourd prix à payer pour protéger tous les autres.',
    ),
  },
  {
    id: 'mikasa',
    name: 'Mikasa Ackerman',
    series: 'Attack on Titan',
    difficulty: 'kolay',
    options: ['Mikasa Ackerman', 'Annie Leonhart', 'Historia Reiss', 'Sasha Blouse'],
    hint: H(
      'Kırmızı atkılı, Ackerman soyundan gelen ve insanüstü savaş yeteneğine sahip asker.',
      'A soldier with a red scarf and Ackerman blood, possessing superhuman combat skill.',
      '赤いマフラーを巻き、アッカーマン一族の血を引く超人的な戦闘能力の兵士。',
      'Une soldate au foulard rouge, de sang Ackerman, dotée de capacités de combat surhumaines.',
    ),
    note: H(
      'Atkıyı Eren’den almıştır; onu koruma içgüdüsü hayatının merkezindedir.',
      'She received the scarf from Eren; protecting him is at the center of her life.',
      'マフラーはエレンから貰ったもの。彼を守ることが人生の中心にある。',
      'Elle a reçu le foulard d\'Eren ; le protéger est au centre de sa vie.',
    ),
  },
  {
    id: 'levi',
    name: 'Levi Ackerman',
    series: 'Attack on Titan',
    difficulty: 'orta',
    options: ['Levi Ackerman', 'Erwin Smith', 'Hange Zoe', 'Jean Kirstein'],
    hint: H(
      'Kısa boylu, temizlik takıntılı ve “İnsanlığın En Güçlü Askeri” olarak anılan komutan.',
      'A short, cleanliness-obsessed captain known as “Humanity\'s Strongest Soldier”.',
      '背が低く潔癖症で、「人類最強の兵士」と呼ばれる兵長。',
      'Un capitaine petit, obsédé par la propreté, surnommé « le soldat le plus fort de l\'humanité ».',
    ),
    note: H(
      'Yeraltından çıkıp Survey Corps’a katılır; gücü Ackerman uyanışı ve acımasız deneyimden gelir.',
      'He rises from the underground into the Survey Corps; his strength comes from the Ackerman awakening and brutal experience.',
      '地下街から調査兵団に入る。強さはアッカーマンの覚醒と過酷な経験から。',
      'Il sort des bas-fonds pour rejoindre le Bataillon d\'exploration ; sa force vient de l\'éveil Ackerman et d\'une expérience brutale.',
    ),
  },
  {
    id: 'armin',
    name: 'Armin Arlert',
    series: 'Attack on Titan',
    difficulty: 'orta',
    options: ['Armin Arlert', 'Connie Springer', 'Jean Kirstein', 'Erwin Smith'],
    hint: H(
      'Sarı saçlı, fiziksel olarak zayıf ama savaş planlarını zekâsıyla çizen stratejist.',
      'A blond strategist, physically weak but brilliant at drawing up battle plans.',
      '金髪で体力は弱いが、知略で作戦を描く戦略家。',
      'Un stratège blond, physiquement faible mais brillant pour concevoir des plans de bataille.',
    ),
    note: H(
      'Denizi hayal eden çocuk, zamanla insanlığın en kritik kararlarını veren bir komutana dönüşür.',
      'The boy who dreamed of the sea becomes a commander making humanity\'s most critical decisions.',
      '海を夢見た少年は、やがて人類の最重要な決断を下す指揮官になる。',
      'Le garçon qui rêvait de la mer devient un commandant prenant les décisions les plus critiques de l\'humanité.',
    ),
  },
  {
    id: 'gojo',
    name: 'Satoru Gojo',
    series: 'Jujutsu Kaisen',
    difficulty: 'kolay',
    options: ['Satoru Gojo', 'Suguru Geto', 'Kento Nanami', 'Megumi Fushiguro'],
    hint: H(
      'Beyaz saçlı, gözlerini bandajla kapatan ve “en güçlü büyücü” sayılan öğretmen.',
      'A white-haired teacher who covers his eyes with a blindfold and is called the strongest sorcerer.',
      '白髪で目を包帯で隠し、「最強の呪術師」と呼ばれる教師。',
      'Un professeur aux cheveux blancs qui cache ses yeux sous un bandeau et qu\'on appelle le plus fort des sorciers.',
    ),
    note: H(
      'Altı Göz ve Sınırsız teknikleriyle doğar; bandaj, bakışının yarattığı yükü azaltır.',
      'He is born with the Six Eyes and Limitless; the blindfold eases the strain of his gaze.',
      '六眼と無下限呪術を生まれ持つ。目隠しは視線の負担を減らすため。',
      'Il naît avec les Six Eyes et l\'Infini ; le bandeau réduit la charge de son regard.',
    ),
  },
  {
    id: 'yuji',
    name: 'Yuji Itadori',
    series: 'Jujutsu Kaisen',
    difficulty: 'orta',
    options: ['Yuji Itadori', 'Megumi Fushiguro', 'Kento Nanami', 'Choso'],
    hint: H(
      'Pembe saçlı, inanılmaz fiziksel güce sahip ve Ryomen Sukuna’nın kabı olan öğrenci.',
      'A pink-haired student with incredible physical strength who becomes Ryomen Sukuna\'s vessel.',
      'ピンクの髪で驚異的な身体能力を持ち、両面宿儺の器となった生徒。',
      'Un élève aux cheveux roses à la force physique incroyable, devenu le réceptacle de Ryomen Sukuna.',
    ),
    note: H(
      'Dedesi öldükten sonra “insanlara doğru ölümü vermek” sözünü taşır; bu söz onun ahlaki pusulasıdır.',
      'After his grandfather dies, he carries the wish to give people a proper death; it becomes his moral compass.',
      '祖父の死後、「人に正しい死を与える」という言葉を胸に抱く。それが倫理の指針となる。',
      'Après la mort de son grand-père, il porte le vœu d\'offrir aux gens une mort digne ; c\'est sa boussole morale.',
    ),
  },
  {
    id: 'megumi',
    name: 'Megumi Fushiguro',
    series: 'Jujutsu Kaisen',
    difficulty: 'orta',
    options: ['Megumi Fushiguro', 'Yuji Itadori', 'Toji Fushiguro', 'Kento Nanami'],
    hint: H(
      'On Gölge Tekniği ile shikigami çağıran, ciddi ve ketum büyücü.',
      'A serious, reserved sorcerer who summons shikigami with the Ten Shadows Technique.',
      '十種影法術で式神を召喚する、真面目で寡黙な呪術師。',
      'Un sorcier sérieux et réservé qui invoque des shikigami avec la Technique des Dix Ombres.',
    ),
    note: H(
      'Babası Toji tarafından ihmal edilmiş; kız kardeşi Tsumiki’yi korumak için büyücü olmuştur.',
      'Neglected by his father Toji, he became a sorcerer to protect his step-sister Tsumiki.',
      '父・甚爾に顧みられず、義姉・津美紀を守るために呪術師になった。',
      'Négligé par son père Toji, il est devenu sorcier pour protéger sa demi-sœur Tsumiki.',
    ),
  },
  {
    id: 'nobara',
    name: 'Nobara Kugisaki',
    series: 'Jujutsu Kaisen',
    difficulty: 'orta',
    options: ['Nobara Kugisaki', 'Maki Zenin', 'Mai Zenin', 'Kasumi Miwa'],
    hint: H(
      'Turuncu saçlı, çekiç ve çivilerle lanetli ruhlara saldıran özgüvenli büyücü.',
      'A confident sorcerer with orange hair who fights cursed spirits with a hammer and nails.',
      'オレンジの髪で、金槌と釘で呪霊を攻撃する自信家の呪術師。',
      'Une sorcière sûre d\'elle aux cheveux orange qui combat les esprits maudits avec un marteau et des clous.',
    ),
    note: H(
      'Köyünden çıkıp Tokyo’ya gelir; kendini asla ikinci plana atmaz ve bunu açıkça söyler.',
      'She leaves her village for Tokyo; she refuses to be a side character and says so plainly.',
      '故郷を出て東京へ。自分を脇役にしないと公言する。',
      'Elle quitte son village pour Tokyo ; elle refuse d\'être un personnage secondaire et le dit clairement.',
    ),
  },
  {
    id: 'tanjiro',
    name: 'Tanjiro Kamado',
    series: 'Demon Slayer',
    difficulty: 'kolay',
    options: ['Tanjiro Kamado', 'Zenitsu Agatsuma', 'Inosuke Hashibira', 'Giyu Tomioka'],
    hint: H(
      'Hanafuda küpeli, ailesini kaybetmiş ve şeytana dönüşen kız kardeşini koruyan nazik kılıç ustası.',
      'A kind swordsman with hanafuda earrings who lost his family and protects his demon-turned sister.',
      '花札の耳飾りをつけ、家族を失い、鬼になった妹を守る優しい剣士。',
      'Un épéiste gentil aux boucles d\'oreilles hanafuda, qui a perdu sa famille et protège sa sœur devenue démon.',
    ),
    note: H(
      'Koku duyusu olağanüstüdür; Su Nefesi’nden Güneş Nefesi’ne uzanan yolda Nezuko’yu insan yapmayı amaçlar.',
      'His sense of smell is extraordinary; on the path from Water to Sun Breathing he aims to make Nezuko human again.',
      '嗅覚が並外れている。水の呼吸から日の呼吸へ至る道で、禰豆子を人間に戻すことを目指す。',
      'Son odorat est extraordinaire ; sur la voie de la Respiration de l\'Eau au Soleil, il veut rendre Nezuko humaine.',
    ),
  },
  {
    id: 'nezuko',
    name: 'Nezuko Kamado',
    series: 'Demon Slayer',
    difficulty: 'kolay',
    options: ['Nezuko Kamado', 'Shinobu Kocho', 'Mitsuri Kanroji', 'Kanao Tsuyuri'],
    hint: H(
      'Ağzında bambu, sırtında tahta sandık; şeytan olmasına rağmen insanları koruyan kız.',
      'Bamboo in her mouth, a wooden box on her back; a demon who still protects humans.',
      '口に竹、背に木箱。鬼でありながら人間を守る少女。',
      'Un bambou dans la bouche, une caisse en bois sur le dos ; un démon qui protège encore les humains.',
    ),
    note: H(
      'Muzan’ın kanıyla şeytana dönüşür ama aile bağı sayesinde insan kanına saldırmaz; uyuyarak enerji toplar.',
      'Turned by Muzan\'s blood, she resists human blood thanks to family bonds; she sleeps to recover energy.',
      '無惨の血で鬼になるが、家族の絆で人を襲わない。眠って力を蓄える。',
      'Transformée par le sang de Muzan, elle résiste au sang humain grâce aux liens familiaux ; elle dort pour récupérer.',
    ),
  },
  {
    id: 'zenitsu',
    name: 'Zenitsu Agatsuma',
    series: 'Demon Slayer',
    difficulty: 'orta',
    options: ['Zenitsu Agatsuma', 'Inosuke Hashibira', 'Tanjiro Kamado', 'Kaigaku'],
    hint: H(
      'Sürekli korkan, ama uykuya daldığında Gök Gürültüsü Nefesi’yle inanılmaz hızlanan sarışın avcı.',
      'A blond slayer who is always scared but becomes incredibly fast with Thunder Breathing when he falls asleep.',
      'いつも怖がっているが、眠ると雷の呼吸で驚異的に速くなる金髪の剣士。',
      'Un pourfendeur blond toujours effrayé qui devient incroyablement rapide avec la Respiration de la Foudre quand il dort.',
    ),
    note: H(
      'Korkaklığı gerçektir; yine de arkadaşlarını yalnız bırakmamak için savaşır.',
      'His cowardice is real; even so, he fights so as not to abandon his friends.',
      '臆病さは本物だが、それでも仲間を見捨てないために戦う。',
      'Sa lâcheté est réelle ; il se bat pourtant pour ne pas abandonner ses amis.',
    ),
  },
  {
    id: 'inosuke',
    name: 'Inosuke Hashibira',
    series: 'Demon Slayer',
    difficulty: 'orta',
    options: ['Inosuke Hashibira', 'Zenitsu Agatsuma', 'Sanemi Shinazugawa', 'Tengen Uzui'],
    hint: H(
      'Domuz kafası maskesi takan, çift testere kılıçla dövüşen vahşi ve rekabetçi avcı.',
      'A wild, competitive slayer who wears a boar-head mask and fights with dual serrated swords.',
      '猪の頭の仮面をかぶり、二本のギザギザ刀で戦う野生児の剣士。',
      'Un pourfendeur sauvage et compétitif qui porte un masque de sanglier et se bat avec deux sabres dentelés.',
    ),
    note: H(
      'Dağda tek başına büyümüştür; Hayvan Nefesi’ni kendi bedenini gözlemleyerek geliştirir.',
      'He grew up alone in the mountains; he developed Beast Breathing by observing his own body.',
      '山で一人育った。獣の呼吸を自分の体を観察して編み出した。',
      'Il a grandi seul dans les montagnes ; il a développé la Respiration de la Bête en observant son propre corps.',
    ),
  },
  {
    id: 'light',
    name: 'Light Yagami',
    series: 'Death Note',
    difficulty: 'kolay',
    options: ['Light Yagami', 'L', 'Near', 'Mello'],
    hint: H(
      'Bir defterle insanları öldürebilen, kendini “Kira” ilan eden dahi lise öğrencisi.',
      'A genius high-schooler who can kill with a notebook and declares himself “Kira”.',
      'ノートで人を殺せる能力を得て、自らを「キラ」と名乗る天才高校生。',
      'Un lycéen génie qui peut tuer avec un carnet et se proclame « Kira ».',
    ),
    note: H(
      'Adalet arzusuyla başlar, gücün sarhoşluğuyla kendi tanrılığını ilan etmeye kadar gider.',
      'He starts with a desire for justice and drifts into declaring his own godhood.',
      '正義への願いから始まり、力の陶酔で自らを神と宣言するまでに至る。',
      'Il commence par un désir de justice et finit par se proclamer dieu.',
    ),
  },
  {
    id: 'l',
    name: 'L Lawliet',
    series: 'Death Note',
    difficulty: 'orta',
    options: ['L Lawliet', 'Near', 'Light Yagami', 'Matsuda'],
    hint: H(
      'Beyaz tişörtlü, çömelerek oturan, sürekli tatlı yiyen dünyanın en iyi dedektifi.',
      'The world\'s greatest detective: white shirt, squatting posture, constantly eating sweets.',
      '白いシャツでしゃがみ、甘い物を食べ続ける世界一の探偵。',
      'Le meilleur détective du monde : chemise blanche, posture accroupie, toujours en train de manger des sucreries.',
    ),
    note: H(
      'Kira’yı yakalamak için kendini riske atar; Light ile satranç gibi bir zihin savaşı yürütür.',
      'He risks himself to catch Kira, waging a chess-like mind battle with Light.',
      'キラを捕まえるため自ら危険を冒し、月とチェスのような頭脳戦を繰り広げる。',
      'Il se risque pour attraper Kira, menant un duel mental digne des échecs avec Light.',
    ),
  },
  {
    id: 'edward',
    name: 'Edward Elric',
    series: 'Fullmetal Alchemist',
    difficulty: 'orta',
    options: ['Edward Elric', 'Alphonse Elric', 'Roy Mustang', 'Scar'],
    hint: H(
      'Kardeşiyle annesini geri getirmeye çalışırken bacağını ve kolunu kaybeden “Çelik Simyacı”.',
      'The “Fullmetal Alchemist” who lost a leg and an arm trying to bring his mother back with his brother.',
      '母を蘇らせようとして脚と腕を失った「鋼の錬金術師」。',
      'L\'« Alchimiste d\'acier » qui a perdu une jambe et un bras en tentant de ramener sa mère avec son frère.',
    ),
    note: H(
      'Eşdeğer Takas ilkesini öğrenir; automail protezlerle yaşar ve kardeşinin bedenini geri almak ister.',
      'He learns the law of Equivalent Exchange; he lives with automail and wants to restore his brother\'s body.',
      '等価交換の原則を学ぶ。義肢で生き、弟の体を取り戻そうとする。',
      'Il apprend la loi de l\'échange équivalent ; il vit avec des prothèses et veut rendre son corps à son frère.',
    ),
  },
  {
    id: 'alphonse',
    name: 'Alphonse Elric',
    series: 'Fullmetal Alchemist',
    difficulty: 'zor',
    options: ['Alphonse Elric', 'Edward Elric', 'Winry Rockbell', 'Maes Hughes'],
    hint: H(
      'Ruhu bir zırh içine mühürlenmiş, nazik ve sabırlı simyacı kardeş.',
      'A gentle, patient alchemist brother whose soul is sealed inside a suit of armour.',
      '魂を鎧に封じられた、優しく忍耐強い錬金術師の弟。',
      'Un frère alchimiste doux et patient dont l\'âme est scellée dans une armure.',
    ),
    note: H(
      'İnsan transmutasyonu bedelini en ağır şekilde öder; buna rağmen şiddete başvurmamayı seçer.',
      'He pays the heaviest price for human transmutation, yet still chooses not to resort to violence.',
      '人体錬成の代償を最も重く払うが、それでも暴力を選ばない。',
      'Il paie le prix le plus lourd pour la transmutation humaine, mais choisit encore de ne pas recourir à la violence.',
    ),
  },
  {
    id: 'midoriya',
    name: 'Izuku Midoriya',
    series: 'My Hero Academia',
    difficulty: 'kolay',
    options: ['Izuku Midoriya', 'Katsuki Bakugo', 'Shoto Todoroki', 'All Might'],
    hint: H(
      'Yeşil saçlı, not tutmayı seven ve All Might’tan One For All gücünü devralan öğrenci.',
      'A green-haired student who loves taking notes and inherited One For All from All Might.',
      '緑の髪でノートを取るのが好きな、オールマイトからワン・フォー・オールを受け継いだ生徒。',
      'Un élève aux cheveux verts qui adore prendre des notes et a hérité du One For All d\'All Might.',
    ),
    note: H(
      'Doğuştan gücü yoktu; gücü miras aldıktan sonra bedenini paramparça ederek kullanmayı öğrenir.',
      'He was born powerless; after inheriting power he learns to use it without destroying his body.',
      '生まれつき力がなかった。力を継いだ後、体を壊さず使うことを学ぶ。',
      'Il est né sans pouvoir ; après avoir hérité du pouvoir, il apprend à l\'utiliser sans détruire son corps.',
    ),
  },
  {
    id: 'bakugo',
    name: 'Katsuki Bakugo',
    series: 'My Hero Academia',
    difficulty: 'orta',
    options: ['Katsuki Bakugo', 'Izuku Midoriya', 'Eijiro Kirishima', 'Shoto Todoroki'],
    hint: H(
      'Patlayıcı teriyle patlamalar üreten, öfkeli ve rekabetçi patlamalar kahramanı adayı.',
      'An explosive, hot-tempered hero candidate who creates blasts from his nitroglycerin-like sweat.',
      '爆発する汗で爆風を生み出す、短気で負けず嫌いなヒーロー候補。',
      'Un apprenti héros explosif et colérique qui crée des déflagrations avec sa sueur nitroglycérinée.',
    ),
    note: H(
      'Midoriya’ya “Deku” der; sertliğinin altında güçlü bir sorumluluk duygusu vardır.',
      'He calls Midoriya “Deku”; beneath the harshness lies a strong sense of responsibility.',
      '緑谷を「デク」と呼ぶ。厳しさの裏に強い責任感がある。',
      'Il appelle Midoriya « Deku » ; sous sa dureté se cache un fort sens des responsabilités.',
    ),
  },
  {
    id: 'todoroki',
    name: 'Shoto Todoroki',
    series: 'My Hero Academia',
    difficulty: 'orta',
    options: ['Shoto Todoroki', 'Katsuki Bakugo', 'Dabi', 'Endeavor'],
    hint: H(
      'Yarısı buz, yarısı ateş gücüne sahip; sol gözünde yanık izi olan sessiz öğrenci.',
      'A quiet student with half-cold, half-hot power and a burn scar over his left eye.',
      '半分が氷、半分が炎の力を持ち、左目に火傷跡がある静かな生徒。',
      'Un élève silencieux au pouvoir mi-glace mi-feu, avec une cicatrice de brûlure sur l\'œil gauche.',
    ),
    note: H(
      'Babası Endeavor’ın dayattığı mirası reddeder; sonra kendi gücünü kabul ederek bütünleşir.',
      'He rejects the legacy forced on him by his father Endeavor, then integrates his power on his own terms.',
      '父・エンデヴァーが押し付けた力を拒み、後に自分自身の力として受け入れる。',
      'Il rejette l\'héritage imposé par son père Endeavor, puis accepte son pouvoir selon ses propres termes.',
    ),
  },
  {
    id: 'goku',
    name: 'Son Goku',
    series: 'Dragon Ball',
    difficulty: 'kolay',
    options: ['Son Goku', 'Vegeta', 'Gohan', 'Piccolo'],
    hint: H(
      'Maymun kuyruklu, yemek düşkünü ve Kamehameha ile enerji dalgası atan Saiyan savaşçısı.',
      'A food-loving Saiyan with a monkey tail who fires energy waves with the Kamehameha.',
      '猿の尻尾を持ち、かめはめ波でエネルギー波を放つ食いしん坊のサイヤ人戦士。',
      'Un Saiyan gourmand à queue de singe qui lance des vagues d\'énergie avec le Kamehameha.',
    ),
    note: H(
      'Dünyayı korumak için savaşır ama asıl motivasyonu daha güçlü rakiplerle dövüşmektir.',
      'He fights to protect Earth, but his real motivation is facing stronger opponents.',
      '地球を守るために戦うが、本当の動機はより強い相手と戦うこと。',
      'Il se bat pour protéger la Terre, mais sa vraie motivation est d\'affronter des adversaires plus forts.',
    ),
  },
  {
    id: 'saitama',
    name: 'Saitama',
    series: 'One Punch Man',
    difficulty: 'kolay',
    options: ['Saitama', 'Genos', 'Mumen Rider', 'Garou'],
    hint: H(
      'Kel, sıradan görünümlü ama tek yumrukta her rakibi yenen kahraman.',
      'A bald, ordinary-looking hero who defeats every opponent with a single punch.',
      '禿げた普通の見た目だが、一撃でどんな敵も倒すヒーロー。',
      'Un héros chauve à l\'apparence ordinaire qui terrasse chaque adversaire d\'un seul coup de poing.',
    ),
    note: H(
      'Gücünü 100 şınav, 100 mekik, 100 squat ve 10 km koşudan oluşan günlük rutine borçludur; saç dökülmesi yan etkisidir.',
      'His power comes from a daily routine of 100 push-ups, sit-ups, squats and a 10 km run; hair loss is the side effect.',
      '強さは毎日100回の腕立て・腹筋・スクワットと10km走の賜物。脱毛は副作用。',
      'Sa force vient d\'une routine quotidienne de 100 pompes, abdos, squats et 10 km ; la calvitie est l\'effet secondaire.',
    ),
  },
  {
    id: 'anya',
    name: 'Anya Forger',
    series: 'Spy x Family',
    difficulty: 'kolay',
    options: ['Anya Forger', 'Yor Forger', 'Becky Blackbell', 'Damian Desmond'],
    hint: H(
      'Fıstık seven, telepati yeteneği olan ve gizlice bir casusun kızı rolü yapan küçük kız.',
      'A little girl who loves peanuts, can read minds and secretly plays the spy\'s daughter.',
      'ピーナッツが好きでテレパシー能力を持つ、スパイの娘を演じる小さな女の子。',
      'Une petite fille qui adore les cacahuètes, lit dans les pensées et joue secrètement la fille d\'un espion.',
    ),
    note: H(
      'Ailesinin gerçek mesleklerini bilir; “waku waku” der ve barışı korumak için yardım eder.',
      'She knows her family\'s real jobs; she says “waku waku” and helps keep the peace.',
      '家族の本当の仕事を知っている。「わくわく」と言い、平和のために協力する。',
      'Elle connaît les vrais métiers de sa famille ; elle dit « waku waku » et aide à préserver la paix.',
    ),
  },
  {
    id: 'lelouch',
    name: 'Lelouch vi Britannia',
    series: 'Code Geass',
    difficulty: 'orta',
    options: ['Lelouch vi Britannia', 'Suzaku Kururugi', 'Schneizel el Britannia', 'CC'],
    hint: H(
      'Britannia’ya karşı “Zero” maskesiyle savaşan, Geass gücüyle insanları yönlendiren sürgün prens.',
      'An exiled prince who fights Britannia as “Zero”, using the power of Geass to command people.',
      'ブリタニアに「ゼロ」として戦い、ギアスで人を操る亡命皇子。',
      'Un prince exilé qui combat Britannia sous le masque de « Zero », utilisant le Geass pour commander.',
    ),
    note: H(
      'Dünyayı daha iyi bir yer yapmak için kendini günah keçisi yapmayı seçer; planları yıllar öncesine dayanır.',
      'He chooses to make himself the scapegoat to create a better world; his plans span years.',
      'より良い世界のために自らを贖罪の羊に。計画は数年先まで及ぶ。',
      'Il choisit de devenir le bouc émissaire pour créer un monde meilleur ; ses plans s\'étendent sur des années.',
    ),
  },
  {
    id: 'spike',
    name: 'Spike Spiegel',
    series: 'Cowboy Bebop',
    difficulty: 'zor',
    options: ['Spike Spiegel', 'Jet Black', 'Vicious', 'Faye Valentine'],
    hint: H(
      'Sigara içen, dövüş sanatları ustası ve geçmişinden kaçan ödül avcısı.',
      'A chain-smoking martial arts expert and bounty hunter running from his past.',
      'タバコを吸い、格闘技を極めた、過去から逃げる賞金稼ぎ。',
      'Un chasseur de primes fumeur, expert en arts martiaux, qui fuit son passé.',
    ),
    note: H(
      '“Bang.” repliğiyle anılır; geçmişiyle yüzleşmek için Bebop’taki hayatını geride bırakır.',
      'He is remembered for “Bang.”; he leaves his life on the Bebop to face his past.',
      '「Bang.」の台詞で知られる。過去と向き合うためビバップの生活を去る。',
      'On se souvient de son « Bang. » ; il quitte sa vie sur le Bebop pour affronter son passé.',
    ),
  },
  {
    id: 'frieren',
    name: 'Frieren',
    series: 'Frieren: Beyond Journey\'s End',
    difficulty: 'orta',
    options: ['Frieren', 'Fern', 'Flame', 'Serie'],
    hint: H(
      'Bin yıldan fazla yaşayan, büyü toplamayı seven ve insan ömrünün kısalığını yeni anlayan elf büyücü.',
      'An elf mage over a thousand years old who loves collecting spells and has just understood how short human lives are.',
      '千年以上生き、魔法収集が好きで、人の一生の短さを今になって知るエルフの魔法使い。',
      'Une magicienne elfe de plus de mille ans qui adore collectionner des sorts et vient de comprendre la brièveté des vies humaines.',
    ),
    note: H(
      'Kahraman Himmel’in ölümünden sonra yolculuğa çıkar; insanlarla bağ kurmayı öğrenir.',
      'After the hero Himmel dies, she sets out on a journey and learns to connect with humans.',
      '勇者ヒンメルの死後、旅に出て人との絆を学ぶ。',
      'Après la mort du héros Himmel, elle part en voyage et apprend à créer des liens avec les humains.',
    ),
  },
  {
    id: 'violet',
    name: 'Violet Evergarden',
    series: 'Violet Evergarden',
    difficulty: 'orta',
    options: ['Violet Evergarden', 'Iris Cannary', 'Luculia Marlborough', 'Cattleya Baudelaire'],
    hint: H(
      'Mekanik elleri olan, duyguları anlamayı öğrenen ve başkalarının mektuplarını yazan eski asker.',
      'A former soldier with mechanical hands who learns to understand emotions by writing other people\'s letters.',
      '機械の手を持ち、感情を学びながら他人の手紙を書く元兵士。',
      'Une ancienne soldate aux mains mécaniques qui apprend les émotions en écrivant les lettres des autres.',
    ),
    note: H(
      '“Sevgi” kelimesinin anlamını arar; Auto Memory Doll olarak insanların duygularına tercüman olur.',
      'She searches for the meaning of “love” and becomes an Auto Memory Doll who translates people\'s feelings.',
      '「愛」の意味を探し、自動手記人形として人の想いを言葉にする。',
      'Elle cherche le sens de « l\'amour » et devient une poupée à mémoire automatique qui traduit les sentiments.',
    ),
  },
  {
    id: 'usagi',
    name: 'Usagi Tsukino',
    series: 'Sailor Moon',
    difficulty: 'orta',
    options: ['Usagi Tsukino', 'Ami Mizuno', 'Rei Hino', 'Makoto Kino'],
    hint: H(
      'Tembel ama cesur bir okul kızı; Ay’ın koruyucusu olarak dönüşür ve “Ay adına seni cezalandıracağım!” der.',
      'A lazy but brave schoolgirl who transforms into the guardian of the Moon and says “In the name of the Moon, I\'ll punish you!”',
      '怠け者だが勇敢な女子生徒。月の守護者に変身し、「月に代わっておしおきよ！」と言う。',
      'Une écolière paresseuse mais courageuse qui se transforme en gardienne de la Lune et dit « Au nom de la Lune, je te punis ! »',
    ),
    note: H(
      'Sıradan bir kızken Sailor Moon olur; arkadaşlık ve sevgi onun en büyük gücüdür.',
      'She goes from an ordinary girl to Sailor Moon; friendship and love are her greatest powers.',
      '普通の少女からセーラームーンになる。友情と愛が最大の力。',
      'D\'une fille ordinaire, elle devient Sailor Moon ; l\'amitié et l\'amour sont ses plus grandes forces.',
    ),
  },
];

export const getCharacterRound = (count = 10): CharacterHintItem[] => {
  return [...CHARACTER_HINTS]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, CHARACTER_HINTS.length))
    .map((item) => ({ ...item, options: shuffleOptions(item.options) }));
};

const shuffleOptions = (options: readonly string[]): [string, string, string, string] => {
  const result = [...options];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result as [string, string, string, string];
};
