import React from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { PageLoadingSkeleton } from './PageLoadingSkeleton';
import { ShieldAlert, LogIn, Sparkles } from 'lucide-react';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, authLoading, loginWithGoogle } = useAppStore();
  const { addToast } = useToastStore();
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  if (authLoading) {
    return <PageLoadingSkeleton />;
  }

  if (!currentUser) {
    const handleLogin = async () => {
      setIsLoggingIn(true);
      try {
        await loginWithGoogle();
        addToast('Başarıyla giriş yapıldı!', 'success');
      } catch (err) {
        addToast('Giriş yapılırken bir hata oluştu.', 'error');
      } finally {
        setIsLoggingIn(false);
      }
    };

    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-black border-4 border-white neo-shadow-white text-center space-y-6">
        <div className="w-16 h-16 bg-rose-600 border-2 border-white mx-auto flex items-center justify-center text-white neo-shadow">
          <ShieldAlert size={32} strokeWidth={2.5} />
        </div>

        <div>
          <span className="bg-amber-400 text-black font-black text-[10px] px-2 py-0.5 uppercase border border-black inline-block mb-2">
            ÖZEL SAYFA KORUMASI
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white">
            GİRİŞ YAPMANIZ GEREKİYOR
          </h2>
          <p className="text-xs text-neutral-400 font-bold uppercase mt-2 leading-relaxed">
            Bu özel sayfaya (İzleme Listesi, Watch Party veya Profil) erişebilmek için lütfen Google hesabınızla giriş yapın.
          </p>
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full py-3.5 bg-white hover:bg-rose-600 text-black hover:text-white font-black text-xs uppercase tracking-wider border-2 border-white transition-all neo-shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <LogIn size={16} strokeWidth={2.5} />
          <span>{isLoggingIn ? 'GİRİŞ YAPILIYOR...' : 'GOOGLE İLE GİRİŞ YAP'}</span>
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
