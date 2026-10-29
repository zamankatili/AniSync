import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Upload, Loader2 } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ALL_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'Sci-Fi', 'Mystery', 'Slice of Life', 'Supernatural'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { userProfile, updateUserProfile, currentUser } = useAppStore();
  const { addToast } = useToastStore();
  
  const [name, setName] = useState(userProfile.name);
  const [handle, setHandle] = useState(userProfile.handle);
  const [avatarSeed, setAvatarSeed] = useState(userProfile.avatarSeed);
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>(userProfile.favoriteGenres || ['Action', 'Fantasy']);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleGenre = (genre: string) => {
    setFavoriteGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({ name, handle, avatarSeed, favoriteGenres });
    addToast('Profilin ve favori türlerin başarıyla güncellendi!', 'success');
    onClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!currentUser) {
      addToast('Fotoğraf yüklemek için giriş yapmalısın.', 'error');
      return;
    }
    
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `users/${currentUser.uid}/profile_${Date.now()}`);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      
      await updateProfile(currentUser, { photoURL: downloadURL });
      updateUserProfile({ avatarSeed: downloadURL });
      addToast('Profil fotoğrafı başarıyla yüklendi!', 'success');
    } catch (error: any) {
      console.error(error);
      addToast('Fotoğraf yüklenemedi. Storage izinlerini kontrol et.', 'error');
    } finally {
      setIsUploading(false);
    }
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white border-4 border-black w-full max-w-md neo-shadow-white overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b-4 border-black bg-black">
                <h2 className="font-black text-white uppercase tracking-widest text-lg">PROFİLİ DÜZENLE</h2>
                <button
                  onClick={onClose}
                  className="text-white hover:text-rose-500 transition-colors p-1"
                >
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img 
                      src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`} 
                      alt="Preview" 
                      className={`w-24 h-24 bg-white border-4 border-black object-cover ${!currentUser?.photoURL ? 'grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploading ? <Loader2 size={24} className="text-white animate-spin" /> : <Upload size={24} className="text-white" />}
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                  
                  {currentUser ? (
                    <div className="text-xs text-black/60 font-black uppercase tracking-wider text-center">FOTOĞRAFINA TIKLAYARAK YENİSİNİ YÜKLEYEBİLİRSİN.</div>
                  ) : (
                    <div className="w-full">
                      <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">AVATAR TOHUMU (RASTGELE KELİME)</label>
                      <input
                        type="text"
                        value={avatarSeed}
                        onChange={e => setAvatarSeed(e.target.value)}
                        className="w-full bg-white border-4 border-black p-3 text-black font-bold uppercase tracking-wide focus:outline-none focus:border-rose-500 transition-colors"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">GÖRÜNEN AD</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white border-4 border-black p-3 text-black font-bold uppercase tracking-wide focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">KULLANICI ADI (@)</label>
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={e => setHandle(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    className="w-full bg-white border-4 border-black p-3 text-black font-bold uppercase tracking-wide focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black text-black uppercase tracking-widest">
                      FAVORİ TÜRLERİN ({favoriteGenres.length} SEÇİLDİ)
                    </label>
                    <span className="text-[10px] font-bold text-neutral-500 uppercase">
                      Detay sayfasında 'Senin İçin Seçildi' rozetini tetikler
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ALL_GENRES.map((genre) => {
                      const isSelected = favoriteGenres.includes(genre);
                      return (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={`px-3 py-1 text-xs font-black uppercase tracking-wider border-2 transition-all ${
                            isSelected
                              ? 'bg-black text-white border-black neo-shadow-white scale-105'
                              : 'bg-white text-black border-neutral-300 hover:border-black'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{genre}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-2 bg-black hover:bg-rose-500 disabled:bg-neutral-500 text-white p-4 border-4 border-black font-black uppercase tracking-widest transition-colors neo-shadow-white hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0"
                  >
                    <Save size={20} strokeWidth={2.5} /> DEĞİŞİKLİKLERİ KAYDET
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
