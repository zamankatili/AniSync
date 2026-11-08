import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../context/AppStore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { isBootstrapAdminEmail } from '../lib/adminConfig';
import { PageLoadingSkeleton } from './PageLoadingSkeleton';

/**
 * Sadece adminlere açık route guard'ı.
 * Yetkisiz erişim = 404 (Navigate / → sessiz yönlendirmeyle karışmaz; "Bu sayfa yok" hissi).
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, authLoading, userProfile } = useAppStore();
  const { t } = useAppTranslation();
  const location = useLocation();

  if (authLoading) return <PageLoadingSkeleton />;

  const email = currentUser?.email;
  const role = (userProfile as any)?.role as string | undefined;
  const allowed = isBootstrapAdminEmail(email) || role === 'admin' || role === 'moderator';

  if (!allowed) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
