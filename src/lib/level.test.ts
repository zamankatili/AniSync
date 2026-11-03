import { describe, expect, it } from 'vitest';
import { MAX_LEVEL, XP, atmosById, levelFromXp, levelProgress, rankFor, statusLabel, xpToReach } from './level';

describe('seviye eğrisi', () => {
  it("README'deki formülle aynı toplamı verir", () => {
    expect(xpToReach(2)).toBe(50);
    expect(xpToReach(3)).toBe(150);
    expect(xpToReach(4)).toBe(300);
    expect(xpToReach(7)).toBe(1050);
  });

  it('eşiklerde seviye atlar', () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(49)).toBe(1);
    expect(levelFromXp(50)).toBe(2);
    expect(levelFromXp(149)).toBe(2);
    expect(levelFromXp(150)).toBe(3);
    expect(levelFromXp(1050)).toBe(7);
  });

  it('seviye ilerlemesi yüzde ve kalan XP üretir', () => {
    const p = levelProgress(75);
    expect(p.level).toBe(2);
    expect(p.floor).toBe(50);
    expect(p.ceil).toBe(150);
    expect(p.into).toBe(25);
    expect(p.percent).toBe(25);
    expect(p.remaining).toBe(75);
  });

  it("seviye 30'da tavanlar", () => {
    expect(levelFromXp(999_999)).toBe(MAX_LEVEL);
    expect(levelProgress(999_999).percent).toBe(100);
  });
});

describe('rütbeler ve atmosferler', () => {
  it('rütbeler seviyeye göre ilerler', () => {
    expect(rankFor(1).name).toBe('Misafir');
    expect(rankFor(4).name).toBe('Müdavim');
    expect(rankFor(4).nextAt).toBe(5);
    expect(rankFor(16).name).toBe('Efsane');
    expect(rankFor(16).nextAt).toBeNull();
  });

  it("atmosferler README'deki seviyelerde açılır", () => {
    expect(atmosById('cay').unlockLevel).toBe(2);
    expect(atmosById('sinema').unlockLevel).toBe(4);
    expect(atmosById('kutuphane').unlockLevel).toBe(7);
    expect(atmosById('olmayan-bir-id' as never).id).toBe('klasik');
  });
});

describe('etiketler', () => {
  it('durum etiketi türe göre değişir', () => {
    expect(statusLabel('active', 'anime')).toBe('İzliyorum');
    expect(statusLabel('active', 'manga')).toBe('Okuyorum');
    expect(statusLabel('active', 'game')).toBe('Oynuyorum');
    expect(statusLabel('done', 'game')).toBe('Bitirdim');
    expect(statusLabel('planned', 'novel')).toBe('Sırada');
  });

  it('XP tablosu README ile birebir', () => {
    expect(XP).toMatchObject({ visit: 10, addShelf: 15, progress: 4, complete: 40, post: 20 });
  });
});
