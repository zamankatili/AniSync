import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, Chrome, Mail, Lock } from 'lucide-react';
import { useAppStore } from '../context/AppStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword, currentUser } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || "Google girişi başarısız oldu.");
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    
    try {
      if (isResetMode) {
        await resetPassword(email);
        setMessage("ŞİFRE SIFIRLAMA BAĞLANTISI GÖNDERİLDİ! E-POSTANI KONTROL ET.");
        // reset to login mode after a short delay or stay so user can read message
        setTimeout(() => setIsResetMode(false), 3000);
      } else if (isLogin) {
        await loginWithEmail(email, password);
        onClose();
      } else {
        if (password.length < 6) {
          setError("ŞİFRE EN AZ 6 KARAKTER OLMALIDIR.");
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password);
        onClose();
      }
    } catch (err: any) {
      if (isResetMode) setError("ŞİFRE SIFIRLAMA BAŞARISIZ. E-POSTA ADRESİNİ KONTROL ET.");
      else setError(isLogin ? "GİRİŞ BAŞARISIZ, BİLGİLERİ KONTROL ET." : "KAYIT BAŞARISIZ. BELKİ ŞİFRENİZ GÜÇSÜZDÜR.");
    } finally {
      setLoading(false);
    }
  };

  // Reset state when changing modes
  const handleModeChange = (mode: boolean) => {
    setIsLogin(mode);
    setIsResetMode(false);
    setError(null);
    setMessage(null);
  };

  const handleResetModeToggle = () => {
    setIsResetMode(!isResetMode);
    setError(null);
    setMessage(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border-4 border-black w-full max-w-md neo-shadow overflow-hidden relative my-8"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-black hover:text-rose-500 transition-colors p-1 z-10"
              >
                <X size={24} strokeWidth={3} />
              </button>

              <div className="p-8 flex flex-col items-center">
                <div className="w-20 h-20 border-4 border-black bg-black flex items-center justify-center mb-6 neo-shadow-white shrink-0">
                  <LogIn size={40} strokeWidth={2.5} className="text-white" />
                </div>
                
                <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tighter text-center">
                  {currentUser ? "ZATEN GİRİŞ YAPTIN!" : "ANISYNC'E KATIL"}
                </h2>

                {currentUser ? (
                  <div className="w-full mt-6">
                    <button 
                      onClick={onClose}
                      className="w-full bg-black text-white hover:bg-rose-500 hover:text-white font-black py-4 border-4 border-black transition-colors uppercase tracking-widest neo-shadow-white hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0"
                    >
                      KAPAT
                    </button>
                  </div>
                ) : (
                  <div className="w-full">
                     <p className="text-black/70 font-bold text-sm mb-6 uppercase tracking-wider leading-relaxed text-center">
                       Hesabına giriş yap veya yeni bir tane oluştur.
                     </p>

                     {/* Tabs */}
                     <div className="flex w-full mb-6 border-4 border-black bg-black p-1 neo-shadow-white">
                        <button 
                          onClick={() => handleModeChange(true)}
                          className={`flex-1 py-2 font-black uppercase tracking-widest text-sm transition-colors ${isLogin ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                        >
                          GİRİŞ YAP
                        </button>
                        <button 
                          onClick={() => handleModeChange(false)}
                          className={`flex-1 py-2 font-black uppercase tracking-widest text-sm transition-colors ${!isLogin ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`}
                        >
                          KAYIT OL
                        </button>
                     </div>

                     {error && (
                        <div className="bg-rose-500 text-white font-black uppercase tracking-widest text-sm p-3 mb-6 border-4 border-black neo-shadow-white text-center">
                          {error}
                        </div>
                     )}
                     
                     {message && (
                        <div className="bg-black text-white font-black uppercase tracking-widest text-sm p-3 mb-6 border-4 border-black neo-shadow-white text-center">
                          {message}
                        </div>
                     )}

                     <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
                        <div>
                          <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">E-POSTA</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                               <Mail size={18} strokeWidth={3} />
                            </div>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full bg-white border-4 border-black pl-10 pr-3 py-3 text-black font-bold uppercase tracking-wide focus:outline-none focus:border-rose-500 transition-colors placeholder:text-black/30"
                              placeholder="MAIL@ORNEK.COM"
                            />
                          </div>
                        </div>

                        {!isResetMode && (
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="block text-xs font-black text-black uppercase tracking-widest">ŞİFRE</label>
                              {isLogin && (
                                <button type="button" onClick={handleResetModeToggle} className="text-xs font-black text-black/50 hover:text-black uppercase tracking-widest transition-colors">
                                  ŞİFREMİ UNUTTUM?
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-black">
                                 <Lock size={18} strokeWidth={3} />
                              </div>
                              <input
                                type="password"
                                required
                                minLength={6}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-white border-4 border-black pl-10 pr-3 py-3 text-black font-bold uppercase tracking-wide focus:outline-none focus:border-rose-500 transition-colors placeholder:text-black/30"
                                placeholder="********"
                              />
                            </div>
                            {!isLogin && password.length > 0 && (
                              <div className="mt-2 flex gap-1 h-2">
                                <div className={`flex-1 ${password.length >= 6 ? 'bg-amber-400' : 'bg-black/10'}`}></div>
                                <div className={`flex-1 ${password.length >= 8 && /[A-Z]/.test(password) ? 'bg-emerald-400' : 'bg-black/10'}`}></div>
                                <div className={`flex-1 ${password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'bg-emerald-600' : 'bg-black/10'}`}></div>
                              </div>
                            )}
                            {!isLogin && (
                              <p className="text-[10px] text-black/50 mt-1 font-bold uppercase tracking-widest">
                                ŞİFREN EN AZ 6 KARAKTER OLMALI, BÜYÜK HARF VE RAKAM TAVSİYE EDİLİR.
                              </p>
                            )}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full flex items-center justify-center gap-4 bg-black text-white font-black py-4 px-4 border-4 border-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all neo-shadow-white hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0 disabled:opacity-50"
                        >
                          {loading ? 'BEKLENİYOR...' : (isResetMode ? 'ŞİFRE SIFIRLA' : (isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'))}
                        </button>
                     </form>
                     
                     {isResetMode && (
                        <button type="button" onClick={handleResetModeToggle} className="w-full text-center text-xs font-black text-black hover:text-rose-500 uppercase tracking-widest transition-colors mb-6">
                            GİRİŞ YAP EKRANINA DÖN
                        </button>
                     )}

                     <div className="relative flex items-center py-2 mb-6">
                        <div className="flex-grow border-t-4 border-black"></div>
                        <span className="flex-shrink-0 mx-4 text-black font-black uppercase tracking-widest text-sm">VEYA</span>
                        <div className="flex-grow border-t-4 border-black"></div>
                     </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="w-full flex items-center justify-center gap-4 bg-white text-black font-black py-4 px-4 border-4 border-black uppercase tracking-widest hover:bg-black hover:text-white transition-all neo-shadow hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0"
                    >
                      <Chrome size={24} strokeWidth={2.5} />
                      GOOGLE İLE {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
