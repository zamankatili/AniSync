import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Download, Flame, Heart, LogOut, Pencil, RotateCcw, Upload, Lamp, Sparkles } from 'lucide-react';
import { useShelfEntries, useStore } from '../store/useStore';
import { ATMOSPHERES, rankFor, levelProgress } from '../lib/level';
import { genreLabel } from '../lib/genres';
import { TeaMeter } from '../components/TeaMeter';
import { Avatar } from '../components/Avatar';
import { Section } from '../components/Section';
import { EmptyState } from '../components/EmptyState';

export function Ben() {
  const profile = useStore((s) => s.profile)!;
  const xp = useStore((s) => s.xp);
  const streak = useStore((s) => s.streak);
  const atmos = useStore((s) => s.atmos);
  const posts = useStore((s) => s.posts);
  const joined = useStore((s) => s.joined);
  const settings = useStore((s) => s.settings);
  const updateProfile = useStore((s) => s.updateProfile);
  const updateSettings = useStore((s) => s.updateSettings);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const resetAll = useStore((s) => s.resetAll);

  const entries = useShelfEntries();
  const progress = levelProgress(xp);
  const rank = rankFor(progress.level);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [bio, setBio] = useState(profile.bio);
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mine = useMemo(() => posts.filter((p) => p.author.name === profile.name), [posts, profile.name]);
  const done = entries.filter((e) => e.status === 'done');
  const favorites = entries.filter((e) => e.favorite);
  const currentAtmos = ATMOSPHERES.find((a) => a.id === atmos);

  const badges = [
    { id: 'first', name: 'İlk çay', emoji: '🫖', desc: 'Rafına ilk eseri ekledin', earned: entries.length >= 1 },
    { id: 'collector', name: 'Koleksiyoner', emoji: '📚', desc: 'Rafta 10 eser var', earned: entries.length >= 10 },
    { id: 'critic', name: 'Eleştirmen', emoji: '✍️', desc: 'Bir inceleme yazdın', earned: mine.some((p) => p.kind === 'inceleme') },
    { id: 'regular', name: 'Müdavim', emoji: '🔥', desc: '3 gün üst üste geldin', earned: streak >= 3 },
    { id: 'social', name: 'Masada', emoji: '🪑', desc: 'Bir köşeye katıldın', earned: joined.length >= 1 },
    { id: 'finisher', name: 'Kapanış', emoji: '🏁', desc: 'İlk eserini bitirdin', earned: done.length >= 1 },
  ];

  const saveProfile = () => {
    updateProfile({ name: name.trim() || profile.name, bio: bio.trim() });
    setEditing(false);
  };

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anisync-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">ben</p>
          <h1 className="h1 mt-1.5">Masadaki yerin</h1>
        </div>
        <Link to="/atmosfer" className="btn btn-ghost btn-sm shrink-0">
          <Lamp size={13} /> {currentAtmos?.name}
        </Link>
      </header>

      {/* profil kartı */}
      <div className="card overflow-hidden">
        <div
          className="h-16 w-full"
          style={{ background: `radial-gradient(600px 120px at 20% 0%, ${profile.color}44, transparent 70%)` }}
        />
        <div className="-mt-8 px-4 pb-4">
          <div className="flex items-end justify-between gap-3">
            <div className="rounded-full p-1" style={{ background: 'var(--surface)' }}>
              <Avatar emoji={profile.emoji} color={profile.color} size={64} />
            </div>
            <button onClick={() => setEditing((v) => !v)} className="btn btn-ghost btn-sm">
              <Pencil size={12} /> {editing ? 'Kapat' : 'Düzenle'}
            </button>
          </div>

          {editing ? (
            <div className="mt-3 space-y-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" maxLength={24} placeholder="Adın" />
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} className="textarea !min-h-[64px]" maxLength={180} placeholder="Kısa bir not: ne izlersin, ne okursun?" />
              <button onClick={saveProfile} className="btn btn-primary btn-sm">
                <Check size={13} /> Kaydet
              </button>
            </div>
          ) : (
            <>
              <h2 className="display mt-2 text-[1.6rem] leading-tight">{profile.name}</h2>
              <p className="text-[11.5px] text-[var(--ink-3)]">
                @{profile.handle} · {new Date(profile.joinedAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}’ten beri
              </p>
              <p className="mt-2 max-w-md text-[12.5px] leading-relaxed text-[var(--ink-2)]">
                {profile.bio || 'Henüz bir not bırakmadın. Kısa bir cümle yeter.'}
              </p>
            </>
          )}

          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.genres.slice(0, 5).map((g) => (
              <span key={g} className="chip">{genreLabel(g)}</span>
            ))}
            <span className="chip chip-accent">
              <Flame size={10} /> {streak} gün
            </span>
          </div>
        </div>
      </div>

      {/* seviye */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <TeaMeter percent={progress.percent} size={74} />
          <div className="min-w-0 flex-1">
            <p className="eyebrow">seviye {progress.level} · {xp} XP</p>
            <p className="display text-[1.6rem] leading-tight">{rank.name}</p>
            <p className="mt-0.5 text-[11.5px] text-[var(--ink-3)]">{rank.line}</p>
          </div>
        </div>
        <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-[var(--surface-3)]">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${progress.percent}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10.5px] text-[var(--ink-3)]">
          <span>{progress.into} / {progress.span} XP</span>
          <span>sıradaki seviyeye {progress.remaining} XP</span>
        </div>
      </div>

      {/* istatistikler */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { label: 'rafta', value: entries.length },
          { label: 'biten', value: done.length },
          { label: 'gönderi', value: mine.length },
          { label: 'köşe', value: joined.length },
        ].map((s) => (
          <div key={s.label} className="card p-3">
            <p className="display text-[1.7rem] leading-none text-[var(--accent)] tabular">{s.value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--ink-3)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* rozetler */}
      <Section title="Rozetler" subtitle="Mekânda bıraktığın izler">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {badges.map((b) => (
            <div
              key={b.id}
              className="card flex items-start gap-2.5 p-3"
              style={{ opacity: b.earned ? 1 : 0.5 }}
            >
              <span className="text-[22px] leading-none" style={{ filter: b.earned ? undefined : 'grayscale(1)' }}>{b.emoji}</span>
              <div className="min-w-0">
                <p className="text-[11.5px] font-bold leading-tight">{b.name}</p>
                <p className="mt-0.5 text-[10px] leading-snug text-[var(--ink-3)]">{b.desc}</p>
                {b.earned && <span className="mt-1 inline-flex items-center gap-0.5 text-[9px] font-bold text-[var(--good)]"><Check size={9} /> kazanıldı</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* favoriler */}
      <Section title="Favoriler" subtitle={favorites.length ? 'Rafının en sevdiklerin' : 'Kalp bıraktıkların burada görünür'}>
        {favorites.length ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {favorites.slice(0, 10).map((e) => (
              <div key={e.media.id} className="poster">
                {e.media.cover && <img src={e.media.cover} alt="" loading="lazy" referrerPolicy="no-referrer" />}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState compact icon={<Heart size={20} />} title="Henüz favori yok" description="Rafındaki bir esere kalp bırak." />
        )}
      </Section>

      {/* ayarlar */}
      <Section title="Ayarlar" subtitle="Cihazında saklanan tercihler">
        <div className="card divide-y divide-[var(--line)]">
          <SettingRow
            label="Hareketleri azalt"
            hint="Animasyonları ve geçişleri sadeleştirir."
            value={!settings.motion}
            onChange={(v) => updateSettings({ motion: !v })}
          />
          <SettingRow
            label="Spoiler’ları gizle"
            hint="Spoiler etiketli gönderiler bulanık açılır."
            value={settings.hideSpoilers}
            onChange={(v) => updateSettings({ hideSpoilers: v })}
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={download} className="btn btn-ghost btn-sm">
            <Download size={13} /> Yedek al
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn btn-ghost btn-sm">
            <Upload size={13} /> Yedeği yükle
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              importData(await file.text());
              e.target.value = '';
            }}
          />
          {confirmReset ? (
            <span className="flex gap-2">
              <button
                onClick={() => {
                  resetAll();
                  setConfirmReset(false);
                }}
                className="btn btn-sm"
                style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
              >
                Eminim, sıfırla
              </button>
              <button onClick={() => setConfirmReset(false)} className="btn btn-ghost btn-sm">Vazgeç</button>
            </span>
          ) : (
            <button onClick={() => setConfirmReset(true)} className="btn btn-ghost btn-sm">
              <RotateCcw size={13} /> Sıfırla
            </button>
          )}
        </div>

        <p className="mt-3 flex items-start gap-2 text-[10.5px] leading-relaxed text-[var(--ink-3)]">
          <LogOut size={12} className="mt-0.5 shrink-0" />
          Hesap yok, çıkış yok. Verilerin bu tarayıcıda; başka cihaza taşımak için yedek al.
        </p>
      </Section>

      <div className="pb-4 text-center">
        <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-3)]">
          <Sparkles size={11} /> anisync · mekân seninle büyür
        </p>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3.5">
      <div>
        <p className="text-[12.5px] font-semibold">{label}</p>
        <p className="mt-0.5 text-[10.5px] text-[var(--ink-3)]">{hint}</p>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
        style={{ background: value ? 'var(--accent)' : 'var(--surface-3)' }}
      >
        <span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform"
          style={{ left: 2, transform: `translateX(${value ? 20 : 0}px)` }}
        />
      </button>
    </div>
  );
}
