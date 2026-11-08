import { WorldLore } from './types';

export const seinenLore: WorldLore = {
  worldId: 'seinen_psych',
  summary: 'Zeka, psikoloji ve derin temaların ön planda olduğu olgun bir dünya. Suç, adalet, insan doğası ve varoluş sorgulaması. Karanlık ve düşündürücü hikayeler.',
  history: 'Seinen türü, olgun izleyiciye hitap eder. Death Note (adalet ve güç), Monster (seri katil ve ahlak), Psycho-Pass (suç ve toplum), Tokyo Ghoul (kimlik ve canavar), Vinland Saga (şiddet ve barış), Berserk (karanlık fantezi) türün temel taşlarıdır.',
  powerSystem: {
    name: 'Zeka / Manipülasyon / Fiziksel',
    description: 'Güç sistemi yoktur (Death Note hariç: Shinigami gözü ve Defter). Çatışma zeka, strateji, psikolojik savaş ve manipülasyonla çözülür. Fiziksel güç ikincildir.',
    ranks: ['Sıradan', 'Zeki', 'Dahi', 'Stratejist', 'Mastermind']
  },
  factions: [
    { name: 'L (Dedektif)', description: 'Death Note\'taki gizemli dedektif. Tatlı düşkünü.', alignment: 'good' },
    { name: 'Kira (Light Yagami)', description: 'Death Note\'u kullanan adalet savaşçısı/seri katil.', alignment: 'evil' },
    { name: 'Johan Liebert', description: 'Monster\'daki seri katil. Karizmatik ve korkunç.', alignment: 'evil' },
    { name: 'Ken Kaneki', description: 'Tokyo Ghoul\'da yarı ghoul. Kimlik krizi.', alignment: 'neutral' },
    { name: 'Thorfinn', description: 'Vinland Saga\'da Viking savaşçısı → pasifist.', alignment: 'good' }
  ],
  locations: [
    { name: 'Tokyo (Death Note)', description: 'Light ve L\'in kedi-fare oyunu.', dangerLevel: 'medium' },
    { name: 'Düsseldorf (Monster)', description: 'Johan\'ın izini süren Tenma\'nın yolu.', dangerLevel: 'high' },
    { name: 'Tokyo (Tokyo Ghoul)', description: 'Ghoul\'ların yaşadığı şehir. Anteiku kafe.', dangerLevel: 'high' },
    { name: 'İskandinavya (Vinland Saga)', description: 'Viking savaşları ve Thorfinn\'in yolculuğu.', dangerLevel: 'high' }
  ],
  notableCharacters: [
    { name: 'Light Yagami', role: 'Kira, Death Note kullanıcısı', powerLevel: 70 },
    { name: 'L', role: 'Dünyanın en büyük dedektifi', powerLevel: 65 },
    { name: 'Johan Liebert', role: 'Seri katil, "canavar"', powerLevel: 60 },
    { name: 'Ken Kaneki', role: 'Yarı ghoul, kimlik krizi', powerLevel: 85 },
    { name: 'Thorfinn', role: 'Viking savaşçısı → pasifist', powerLevel: 75 },
    { name: 'Guts', role: 'Berserker (dark fantasy overlap)', powerLevel: 95 }
  ],
  keyEvents: [
    'Death Note\'un bulunması',
    'L vs Kira',
    'Johan\'ın kaçışı',
    'Tokyo Ghoul\'da Aogiri ağacı olayı',
    'Vinland Saga\'da Thorfinn\'in dönüşümü'
  ],
  themes: ['Adalet', 'Güç', 'İnsan Doğası', 'Ahlak', 'Kimlik', 'Şiddet', 'Barış', 'Varoluş'],
  sourceSeries: ['Death Note', 'Monster', 'Psycho-Pass', 'Tokyo Ghoul', 'Vinland Saga', 'Berserk', 'Parasyte']
};