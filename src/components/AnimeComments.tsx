import React, { useState, useEffect } from 'react';
import { useAppStore } from '../context/AppStore';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { Loader2, MessageSquare, Send, Trash2 } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';
import { formatRelativeTime } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimeComment {
  id: string;
  animeId: number;
  userId: string;
  userName: string;
  userAvatarSeed: string;
  content: string;
  createdAt: any;
}

export const AnimeComments = ({ animeId }: { animeId: number }) => {
  const { t } = useAppTranslation();
  const { currentUser, userProfile } = useAppStore();
  const { addToast } = useToastStore();
  const [comments, setComments] = useState<AnimeComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!animeId) return;

    setLoading(true);
    const q = query(
      collection(db, 'animeComments'),
      where('animeId', '==', animeId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnimeComment[];
      setComments(fetchedComments);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching comments: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [animeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !userProfile) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'animeComments'), {
        animeId,
        userId: currentUser.uid,
        userName: userProfile.handle || userProfile.name || 'Anonim',
        userAvatarSeed: userProfile.avatarSeed,
        content: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment('');
      addToast('Yorum eklendi!', 'success');
    } catch (err) {
      console.error(err);
      addToast('Yorum eklenirken hata oluştu.', 'error');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('Bu yorumu silmek istediğine emin misin?')) {
      try {
        await deleteDoc(doc(db, 'animeComments', commentId));
        addToast('Yorum silindi.', 'success');
      } catch (err) {
        console.error(err);
        addToast('Yorum silinirken hata oluştu.', 'error');
      }
    }
  };

  return (
    <div className="mt-12">
      <h3 className="text-2xl font-black text-black mb-6 uppercase tracking-tighter border-b-4 border-black pb-2 inline-flex items-center gap-2">
        <MessageSquare size={24} strokeWidth={3} /> YORUMLAR ({comments.length})
      </h3>

      {currentUser ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4 bg-white p-4 border-4 border-black neo-shadow">
          <img src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile?.avatarSeed}`} alt="Me" className="w-12 h-12 border-2 border-black bg-neutral-200 shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Bu anime hakkında ne düşünüyorsun?"
              className="w-full bg-neutral-100 border-4 border-black px-4 py-3 text-black font-bold uppercase placeholder-neutral-500 focus:outline-none focus:border-rose-500 transition-colors min-h-[80px] resize-none"
              maxLength={500}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-neutral-500">{newComment.length}/500</span>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="bg-black text-white px-6 py-2 font-black uppercase tracking-widest flex items-center gap-2 border-2 border-black hover:bg-rose-600 transition-colors neo-shadow-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} strokeWidth={3} />}
                GÖNDER
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-black text-white border-4 border-white neo-shadow-white text-center font-black uppercase tracking-widest">
          Yorum yapmak için giriş yapmalısın.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 size={32} className="animate-spin text-black" />
        </div>
      ) : comments.length === 0 ? (
        <div className="p-8 text-center bg-white border-4 border-black neo-shadow">
           <MessageSquare size={48} strokeWidth={1} className="mx-auto text-neutral-400 mb-4" />
           <p className="font-black text-black uppercase tracking-widest">HENÜZ YORUM YOK. İLK YAZAN SEN OL!</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 p-4 border-4 border-black bg-white neo-shadow group"
              >
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userAvatarSeed}`} 
                  alt={comment.userName} 
                  className="w-12 h-12 border-2 border-black bg-neutral-200 shrink-0" 
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-black text-black uppercase tracking-wider">{comment.userName}</span>
                      <span className="ml-2 text-[10px] font-bold text-neutral-500 uppercase">
                        {comment.createdAt ? formatRelativeTime(comment.createdAt.toDate()) : 'ŞİMDİ'}
                      </span>
                    </div>
                    {currentUser?.uid === comment.userId && (
                      <button 
                        onClick={() => handleDelete(comment.id)}
                        className="text-neutral-400 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Yorumu Sil"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                  <p className="text-black font-bold uppercase tracking-wide text-sm whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
