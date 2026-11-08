import React, { useEffect, useMemo, useState } from 'react';
import { useAppTranslation } from '../../hooks/useAppTranslation';
import { useAppStore } from '../../context/AppStore';
import { useToastStore } from '../../store/useToastStore';
import { useRemoteConfig } from '../../hooks/useRemoteConfig';
import { DEFAULT_REMOTE_CONFIG, type RemoteConfig } from '../../lib/adminConfig';
import { collection, doc, getDocs, orderBy, query, limit, updateDoc, deleteDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { cn } from '../../lib/utils';
import { Shield, Users, Flag, Settings, RefreshCw, Check } from 'lucide-react';

type Tab = 'flags' | 'users' | 'reports';

interface FirestoreUserDoc extends Record<string, unknown> {
  id: string;
  name?: string;
  handle?: string;
  photoURL?: string | null;
  role?: string;
  banUntil?: number;
  banReason?: string;
}

interface ReportRow {
  id: string;
  targetPath?: string;
  targetLabel?: string;
  reason?: string;
  note?: string;
  status?: string;
  createdAt?: any;
}

export const AdminPage: React.FC = () => {
  const { t, currentLang } = useAppTranslation();
  const [tab, setTab] = useState<Tab>('flags');
  const { config, loaded } = useRemoteConfig();
  const [draft, setDraft] = useState<RemoteConfig>(config);
  const [busy, setBusy] = useState(false);
  const [users, setUsers] = useState<FirestoreUserDoc[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToastStore();
  const { currentUser } = useAppStore();

  useEffect(() => { setDraft(config); }, [config, loaded]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('joinedAt', 'desc'), limit(50)));
      const rows: FirestoreUserDoc[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setUsers(rows);
    } catch {
      // joinedAt yoksa ts sıralaması yoksa hata verme; boş liste göster
      try {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } catch {
        addToast(t('admin_users_load_failed', { defaultValue: 'Kullanıcılar yüklenemedi' }), 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(50)));
      setReports(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    } catch {
      addToast(t('admin_reports_load_failed', { defaultValue: 'Şikayetler yüklenemedi' }), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'users') loadUsers();
    if (tab === 'reports') loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const saveConfig = async () => {
    setBusy(true);
    try {
      await setDoc(doc(db, 'config', 'app'), draft, { merge: true });
      addToast(t('admin_config_saved', { defaultValue: 'Ayarlar kaydedildi' }), 'success');
    } catch (err) {
      console.warn('Admin save failed:', err);
      addToast(t('admin_config_failed', { defaultValue: 'Kaydedilemedi' }), 'error');
    } finally { setBusy(false); }
  };

  const toggleBan = async (u: FirestoreUserDoc) => {
    const target = { ...u };
    const banning = !target.banUntil || target.banUntil < Date.now();
    try {
      await updateDoc(doc(db, 'users', u.id), {
        banUntil: banning ? Date.now() + 1000 * 60 * 60 * 24 * 7 : 0, // 7 gün
        banReason: banning ? 'Admin action' : '',
        role: target.role ?? 'user',
      });
      addToast(banning ? t('admin_user_banned', { defaultValue: 'Kullanıcı banlandı (7 gün)' }) : t('admin_user_unbanned', { defaultValue: 'Ban kaldırıldı' }), 'success');
      loadUsers();
    } catch (err) {
      console.warn('Ban failed:', err);
      addToast(t('admin_action_failed', { defaultValue: 'İşlem başarısız' }), 'error');
    }
  };

  const resolveReport = async (row: ReportRow) => {
    setBusy(true);
    try {
      await deleteDoc(doc(db, 'reports', row.id));
      addToast(t('admin_report_resolved', { defaultValue: 'Şikayet çözüldü' }), 'success');
      setReports(prev => prev.filter(x => x.id !== row.id));
    } catch { addToast(t('admin_action_failed', { defaultValue: 'Silinemedi' }), 'error'); } finally { setBusy(false); }
  };

  const deleteTarget = async (row: ReportRow) => {
    if (!row.targetPath) return;
    setBusy(true);
    try {
      await deleteDoc(doc(db, row.targetPath));
      await deleteDoc(doc(db, 'reports', row.id));
      addToast(t('admin_content_deleted', { defaultValue: 'İçerik silindi' }), 'success');
      setReports(prev => prev.filter(x => x.id !== row.id));
    } catch (err) {
      console.warn('Delete failed:', err);
      addToast(t('admin_delete_failed', { defaultValue: 'İçerik silinemedi' }), 'error');
    } finally { setBusy(false); }
  };

  const flagKeys = Object.keys(draft.featureFlags ?? DEFAULT_REMOTE_CONFIG.featureFlags);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      <div className="flex flex-wrap items-center gap-3 justify-between border-b-4 border-white/20 pb-4">
        <div>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight flex items-center gap-3">
            <Shield className="text-amber-400" size={28} />
            {t('admin_panel_title', 'Admin Panel')}
          </h1>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">{t('admin_panel_desc', 'Ayarlar, kullanıcılar ve şikayetler')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          { id: 'flags', icon: Settings, label: t('admin_tab_flags', 'Ayarlar') },
          { id: 'users', icon: Users, label: t('admin_tab_users', 'Kullanıcılar') },
          { id: 'reports', icon: Flag, label: t('admin_tab_reports', 'Şikayetler') },
        ] as const).map((tabItem) => {
          const Icon = tabItem.icon;
          const active = tab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={cn(
                'px-4 py-2 border-2 font-black uppercase text-xs flex items-center gap-2 transition-colors cursor-pointer',
                active ? 'bg-white text-black border-white' : 'bg-black text-neutral-400 border-white/20 hover:border-white hover:text-white'
              )}
            >
              <Icon size={14} />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {tab === 'flags' && (
        <section className="bg-neutral-900 border-2 border-white/20 p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black uppercase text-white">{t('admin_section_config', 'Genel Ayarlar')}</h2>
            <button onClick={saveConfig} disabled={busy} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs border-2 border-white flex items-center gap-2 cursor-pointer disabled:opacity-50">
              {busy ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {t('admin_save', 'Kaydet')}
            </button>
          </div>
          <label className="flex items-center gap-3 border-2 border-white/20 p-4 cursor-pointer hover:border-amber-400">
            <input type="checkbox" className="w-5 h-5" checked={!!draft.maintenanceMode} onChange={(e) => setDraft(d => ({ ...d, maintenanceMode: e.target.checked }))} />
            <span className="text-sm font-black uppercase text-white">{t('admin_maintenance_mode', 'Bakım modu')}</span>
            <span className="text-[10px] text-neutral-500 ml-auto">{t('admin_maintenance_hint', 'Açıkken salt-okuma, yazma kapalı')}</span>
          </label>
          <div className="border-2 border-white/20 p-4 space-y-2">
            <h3 className="text-xs font-black uppercase text-white">{t('admin_announcement_title', 'Duyuru Banner')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase">TR
                <textarea rows={2} value={draft.announcement?.tr || ''} onChange={(e) => setDraft(d => ({ ...d, announcement: { ...(d.announcement || { tr: '', en: '', type: 'info' }), tr: e.target.value } }))} className="w-full mt-1 bg-black border-2 border-white/20 text-white text-xs p-2" />
              </label>
              <label className="text-[10px] font-black text-neutral-400 uppercase">EN
                <textarea rows={2} value={draft.announcement?.en || ''} onChange={(e) => setDraft(d => ({ ...d, announcement: { ...(d.announcement || { tr: '', en: '', type: 'info' }), en: e.target.value } }))} className="w-full mt-1 bg-black border-2 border-white/20 text-white text-xs p-2" />
              </label>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select value={draft.announcement?.type || 'info'} onChange={(e) => setDraft(d => ({ ...d, announcement: { ...(d.announcement || { tr: '', en: '', type: 'info' }), type: e.target.value as any } }))} className="bg-black text-white border-2 border-white/20 px-2 py-1 text-xs font-black uppercase">
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="critical">Critical</option>
              </select>
              <label className="text-[10px] font-black text-neutral-400 uppercase flex items-center gap-2">Starts
                <input type="datetime-local" value={draft.announcement?.startsAt?.slice(0,16) || ''} onChange={(e) => setDraft(d => ({ ...d, announcement: { ...(d.announcement || { tr: '', en: '', type: 'info' }), startsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined } }))} className="bg-black text-white border-2 border-white/20 px-2 py-1 text-xs" />
              </label>
              <label className="text-[10px] font-black text-neutral-400 uppercase flex items-center gap-2">Ends
                <input type="datetime-local" value={draft.announcement?.endsAt?.slice(0,16) || ''} onChange={(e) => setDraft(d => ({ ...d, announcement: { ...(d.announcement || { tr: '', en: '', type: 'info' }), endsAt: e.target.value ? new Date(e.target.value).toISOString() : undefined } }))} className="bg-black text-white border-2 border-white/20 px-2 py-1 text-xs" />
              </label>
              {(draft.announcement?.tr || draft.announcement?.en) && (
                <button onClick={() => setDraft(d => ({ ...d, announcement: null }))} className="px-3 py-1 bg-rose-700 hover:bg-rose-600 text-white text-xs font-black uppercase border border-white/30 cursor-pointer">{t('admin_announcement_clear', 'Kaldır')}</button>
              )}
            </div>
          </div>
          <div className="space-y-2">
            {flagKeys.map((key) => {
              const raw = (draft.featureFlags as any)[key];
              const pct = featureFlagValue(raw);
              return (
                <label key={key} className="flex items-center justify-between gap-3 border-2 border-white/10 p-3">
                  <span className="text-xs font-black uppercase text-neutral-300">{key}</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={pct}
                      onChange={(e) => setDraft(d => ({ ...d, featureFlags: { ...d.featureFlags, [key]: Number(e.target.value) } }))}
                      className="accent-amber-400"
                    />
                    <span className="text-[10px] font-mono text-white w-10 text-right">{pct}%</span>
                  </div>
                </label>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'users' && (
        <section className="bg-neutral-900 border-2 border-white/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase text-white">{t('admin_section_users', 'Kullanıcılar')}</h2>
            <button onClick={loadUsers} className="p-2 text-neutral-400 hover:text-white" title={t('refresh')}><RefreshCw size={16} /></button>
          </div>
          {loading && <p className="text-xs text-neutral-500 font-bold uppercase">{t('loading')}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-neutral-500 font-black uppercase border-b-2 border-white/20">
                  <th className="py-2 pr-4">{t('admin_col_name', 'Ad')}</th>
                  <th className="py-2 pr-4">{t('admin_col_handle', 'Handle')}</th>
                  <th className="py-2 pr-4">UID</th>
                  <th className="py-2 pr-4">{t('admin_col_role', 'Rol')}</th>
                  <th className="py-2 pr-4">{t('admin_col_ban', 'Ban')}</th>
                  <th className="py-2 pr-4 text-right" />
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-white/10">
                    <td className="py-2 pr-4 text-white font-bold truncate max-w-[140px]">{u.name ?? '—'}</td>
                    <td className="py-2 pr-4 text-neutral-400 truncate max-w-[140px]">@{u.handle ?? '—'}</td>
                    <td className="py-2 pr-4 font-mono text-[10px] text-neutral-500">{u.id.slice(0, 10)}…</td>
                    <td className="py-2 pr-4 text-neutral-300">{u.role ?? 'user'}</td>
                    <td className="py-2 pr-4 text-neutral-400">{u.banUntil && u.banUntil > Date.now() ? '✓' : '—'}</td>
                    <td className="py-2 pr-4 text-right">
                      <button onClick={() => toggleBan(u)} className="px-3 py-1 bg-rose-600/80 hover:bg-rose-500 text-white font-black uppercase text-[10px] border border-white/30 cursor-pointer">
                        {u.banUntil && u.banUntil > Date.now() ? t('admin_unban', 'Ban Kaldır') : t('admin_ban_7d', '7g Ban')}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && !loading && <tr><td colSpan={6} className="py-6 text-neutral-600 font-bold uppercase text-center">{t('admin_no_users', 'Kayıt yok')}</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'reports' && (
        <section className="bg-neutral-900 border-2 border-white/20 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black uppercase text-white">{t('admin_section_reports', 'Şikayetler')}</h2>
            <button onClick={loadReports} className="p-2 text-neutral-400 hover:text-white" title={t('refresh')}><RefreshCw size={16} /></button>
          </div>
          {loading && <p className="text-xs text-neutral-500 font-bold uppercase">{t('loading')}</p>}
          <div className="space-y-2">
            {reports.map(r => (
              <div key={r.id} className="border-2 border-white/10 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black uppercase text-neutral-500">{r.reason ?? 'other'}</div>
                  <div className="text-xs text-white font-mono break-all">{r.targetLabel ?? r.targetPath ?? r.id}</div>
                  {r.note && <div className="text-[10px] text-neutral-400 mt-1">{r.note}</div>}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {r.targetPath && (
                    <button onClick={() => deleteTarget(r)} disabled={busy} className="px-3 py-2 bg-rose-700 hover:bg-rose-600 text-white font-black uppercase text-[10px] border border-white/30 cursor-pointer disabled:opacity-50">
                      {t('admin_delete_target', 'İçeriği Sil')}
                    </button>
                  )}
                  <button onClick={() => resolveReport(r)} disabled={busy} className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black uppercase text-[10px] border border-white/30 cursor-pointer disabled:opacity-50">
                    {t('admin_dismiss', 'Arşivle')}
                  </button>
                </div>
              </div>
            ))}
            {reports.length === 0 && !loading && <p className="text-xs text-neutral-600 font-bold uppercase text-center py-6">{t('admin_no_reports', 'Şikayet yok')}</p>}
          </div>
        </section>
      )}
    </div>
  );
};

const featureFlagValue = (value: number | boolean | undefined): number => {
  if (typeof value === 'boolean') return value ? 100 : 0;
  if (typeof value === 'number' && !Number.isNaN(value)) return Math.max(0, Math.min(100, value));
  return 0;
};
