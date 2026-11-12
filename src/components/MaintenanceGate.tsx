import React, { useMemo } from 'react';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { useRemoteConfig } from '../hooks/useRemoteConfig';
import { isBootstrapAdminEmail } from '../lib/adminConfig';
import { Layout } from './Layout';

/**
 * Bakım modu bariyeri: config/app.maintenanceMode açıkken kullanıcılar için yazmayı kapatan,
 * sadece okumak için izin veren bir kap. Adminler burada geçirilir (bakım modunu kapatabilsinler).
 */
export const MaintenanceGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, userProfile } = useAppStore();
  const { config, loaded } = useRemoteConfig();
  const { t } = useAppTranslation();

  const isAdmin = useMemo(
    () => isBootstrapAdminEmail(currentUser?.email) || (userProfile as any)?.role === 'admin' || (userProfile as any)?.role === 'moderator',
    [currentUser?.email, userProfile]
  );

  if (!loaded) return <>{children}</>; // config gelmediğinde açılışı engelleme
  if (!config.maintenanceMode) return <>{children}</>;
  if (isAdmin) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6" role="alert" aria-live="polite">
      <div className="max-w-md w-full text-center space-y-6 border-4 border-white bg-neutral-950 p-8 neo-shadow-white">
        <div className="text-6xl">🔧</div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">{t('maintenance_title')}</h1>
        <p className="text-sm text-neutral-400 font-medium">
          {t('maintenance_desc')}
        </p>
        <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-mono">AniSync Maintenance Mode</div>
      </div>
    </div>
  );
};
