import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useAppStore } from '../context/AppStore';
import { isBootstrapAdminEmail } from '../lib/adminConfig';
import { db } from '../firebase';
import { PageLoadingSkeleton } from './PageLoadingSkeleton';

/**
 * Sadece admin/moderatörlere açık route guard.
 *
 * Yetki kaynağı: `users/{uid}.role` (Firestore — kurallar da bu alanı okur) veya
 * bootstrap e-posta (VITE_ADMIN_EMAILS). `userProfile` localStorage'dan geldiği
 * için rol orada güvenilir DEĞİLDİR; bu yüzden rol doğrudan Firestore'dan okunur.
 */
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, authLoading } = useAppStore();
  const location = useLocation();

  const [role, setRole] = useState<'admin' | 'moderator' | 'user' | null>(null);
  const [roleLoading, setRoleLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!currentUser) {
      setRole(null);
      setRoleLoading(false);
      return;
    }
    // Bootstrap e-posta: ekstra okuma gerekmez.
    if (isBootstrapAdminEmail(currentUser.email)) {
      setRole('admin');
      setRoleLoading(false);
      return;
    }

    let alive = true;
    setRoleLoading(true);
    getDoc(doc(db, 'users', currentUser.uid))
      .then((snap) => {
        if (!alive) return;
        const raw = snap.exists() ? (snap.data() as { role?: string }).role : undefined;
        setRole(raw === 'admin' || raw === 'moderator' ? raw : 'user');
      })
      .catch(() => {
        if (alive) setRole('user');
      })
      .finally(() => {
        if (alive) setRoleLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentUser]);

  if (authLoading || roleLoading) return <PageLoadingSkeleton />;

  const allowed = isBootstrapAdminEmail(currentUser?.email) || role === 'admin' || role === 'moderator';

  if (!allowed) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};
