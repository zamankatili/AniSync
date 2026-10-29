import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, TrendingUp, Sparkles, MessageCircle } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { getSafeImageUrl, cn, handleImageError } from '../lib/utils';
import { doc, getDoc, setDoc, updateDoc, increment, collection } from 'firebase/firestore';
import { db } from '../firebase';

interface DailyPollModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyPollModal: React.FC<DailyPollModalProps> = ({ isOpen, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [localVotes, setLocalVotes] = useState<Record<string, number>>({});
  const [isSuggestMode, setIsSuggestMode] = useState(false);
  const [suggestionQuestion, setSuggestionQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastStore();
  const { activePoll, currentUser } = useAppStore();

  useEffect(() => {
    if (!activePoll) return;

    // Her anket değiştiğinde oylama durumunu kontrol et
    const checkVote = async () => {
      if (currentUser) {
        // Check firestore for user vote
        const voteRef = doc(db, `polls/${activePoll.id}/votes/${currentUser.uid}`);
        const voteDoc = await getDoc(voteRef);
        if (voteDoc.exists()) {
          setHasVoted(true);
          setSelectedOption(voteDoc.data().optionId);
        } else {
          setHasVoted(false);
          setSelectedOption(null);
        }
      } else {
        // Fallback local storage
        const votedStr = localStorage.getItem(`anisync_daily_poll_${activePoll.id}`);
        if (votedStr) {
          const { optionId } = JSON.parse(votedStr);
          setHasVoted(true);
          setSelectedOption(optionId);
        } else {
          setHasVoted(false);
          setSelectedOption(null);
        }
      }
    };
    checkVote();
    
    // Yüklenen anketin güncel oylarını al
    setLocalVotes(activePoll.votes || {});
  }, [activePoll, currentUser]);

  const handleSelect = (id: string) => {
    if (hasVoted) return;
    setSelectedOption(id);
  };

  const confirmVote = async () => {
    if (hasVoted || !activePoll || !selectedOption) return;
    
    setHasVoted(true);
    
    // Simulate optimistic update
    setLocalVotes(prev => ({
      ...prev,
      [selectedOption]: (prev[selectedOption] || 0) + 1
    }));

    if (currentUser) {
      try {
        const voteRef = doc(db, `polls/${activePoll.id}/votes/${currentUser.uid}`);
        await setDoc(voteRef, { optionId: selectedOption, timestamp: new Date().toISOString() });
        // Veritabanındaki sayaçları güncelle - Prototype için
        const pollRef = doc(db, 'polls', activePoll.id);
        await updateDoc(pollRef, {
          [`votes.${selectedOption}`]: increment(1)
        });
      } catch (e) {
        console.error("Vote save error", e);
      }
    } else {
      localStorage.setItem(`anisync_daily_poll_${activePoll.id}`, JSON.stringify({
        date: new Date().toLocaleDateString(),
        optionId: selectedOption
      }));
    }
    
    addToast('Oy verdiğin için teşekkürler!', 'success');
  };

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionQuestion.trim()) return;
    
    if (!currentUser) {
      addToast('Öneri göndermek için giriş yapmalısın.', 'info');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const suggestRef = doc(collection(db, 'suggestedPolls'));
      await setDoc(suggestRef, {
        question: suggestionQuestion,
        userId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonim',
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      addToast('Önerin başarıyla gönderildi!', 'success');
      setIsSuggestMode(false);
      setSuggestionQuestion("");
    } catch (e) {
      addToast('Öneri gönderilirken bir hata oluştu.', 'error');
    }
    setIsSubmitting(false);
  };

  const suggestPoll = () => {
    setIsSuggestMode(true);
  };

  if (!activePoll) return null;

  // Toplam oy hesaplama
  const totalVotes = activePoll.options.reduce((acc: number, opt: any) => acc + (localVotes[opt.id] || 0), 0) + (hasVoted && Object.keys(localVotes).length === 0 ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white border-4 border-black overflow-hidden neo-shadow"
          >
            <div className="relative shrink-0 h-32 bg-rose-500 border-b-4 border-black p-6 flex flex-col justify-end overflow-hidden">
              <div className="absolute -top-4 right-0 p-4 opacity-30">
                <TrendingUp size={120} strokeWidth={2} className="text-black" />
              </div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black text-white hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-colors z-20"
              >
                <X size={24} strokeWidth={3} />
              </button>
              
              <div className="relative z-10 flex items-center gap-3 text-black">
                <Sparkles size={28} strokeWidth={2.5} />
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest">GÜNÜN ANKETİ</h2>
              </div>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto">
              {isSuggestMode ? (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-black uppercase tracking-widest">SORU ÖNER</h3>
                    <button onClick={() => setIsSuggestMode(false)} className="text-sm font-black text-black/50 hover:text-black uppercase tracking-widest transition-colors">
                      VAZGEÇ
                    </button>
                  </div>
                  <p className="text-xs font-bold text-black/70 mb-4 uppercase tracking-widest">
                    Aklında ilginç bir anime sorusu mu var? Bize gönder, topluluk oylasın!
                  </p>
                  <form onSubmit={submitSuggestion} className="flex flex-col gap-4">
                    <textarea 
                      value={suggestionQuestion}
                      onChange={(e) => setSuggestionQuestion(e.target.value)}
                      placeholder="Örn: En ikonik anime opening'i hangisi?"
                      className="w-full h-32 p-3 font-bold text-sm bg-white border-4 border-black resize-none focus:outline-none focus:border-rose-500 transition-colors uppercase tracking-wide neo-shadow"
                      maxLength={150}
                      required
                    />
                    <div className="flex justify-between items-center text-[10px] sm:text-xs font-black text-black/50 uppercase tracking-widest">
                      <span>{150 - suggestionQuestion.length} KARAKTER KALDI</span>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-black hover:bg-rose-500 text-white font-black py-3 sm:py-4 uppercase tracking-widest text-base sm:text-lg border-4 border-black transition-colors flex items-center justify-center gap-3 neo-shadow-white hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0 disabled:opacity-50"
                    >
                      {isSubmitting ? 'GÖNDERİLİYOR...' : 'ÖNERİYİ GÖNDER'}
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                    <p className="text-sm text-black/70 font-black uppercase tracking-widest">
                      TOPLULUK KARAR VERİYOR
                    </p>
                    <span className="text-sm bg-black text-white px-3 py-1 font-black uppercase tracking-widest neo-shadow-white w-fit">
                      {totalVotes} OY
                    </span>
                  </div>

                  <h3 className="text-xl md:text-2xl font-black text-black mb-6 leading-tight">
                    {activePoll.question.toUpperCase()} <span className="p-1 px-2 border-4 border-black bg-rose-500 text-white rounded-none neo-shadow-white mx-1 inline-block rotate-2">{activePoll.highlight.toUpperCase()}</span>{activePoll.questionEnd?.toUpperCase() || ''}
                  </h3>

                  <div className="space-y-3">
                    {activePoll.options.map((option: any) => {
                      const isSelected = selectedOption === option.id;
                      const dbVotes = localVotes[option.id] || 0;
                      const optionVotes = dbVotes + (isSelected && Object.keys(localVotes).length === 0 ? 1 : 0);
                      const percentage = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0;
                      
                      return (
                        <button
                          key={option.id}
                          onClick={() => handleSelect(option.id)}
                          disabled={hasVoted}
                          className={cn(
                            "w-full relative overflow-hidden border-4 transition-all flex items-center gap-3 text-left p-2 sm:p-3",
                            hasVoted 
                              ? isSelected 
                                ? 'border-black bg-rose-500 text-white neo-shadow-white' 
                                : 'border-black/20 bg-black/5 opacity-50 grayscale'
                              : isSelected
                                ? 'border-black bg-black text-white neo-shadow-white'
                                : 'border-black bg-white hover:bg-rose-500 hover:text-white neo-shadow hover:translate-y-[4px] hover:translate-x-[4px] hover:shadow-none transition-all'
                          )}
                        >
                          {hasVoted && (
                            <div 
                              className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all duration-1000 ease-out" 
                              style={{ width: `${percentage}%` }}
                            />
                          )}
                          
                          {option.image && (
                            <div className="relative z-10 w-10 h-10 shrink-0 border-2 border-current bg-white flex items-center justify-center p-1">
                               <img 
                                 src={getSafeImageUrl(option.image)} 
                                 alt={option.label} 
                                 className="w-full h-full object-cover grayscale" 
                                 referrerPolicy="no-referrer"
                                 onError={handleImageError} 
                               />
                            </div>
                          )}
                          
                          <div className="relative z-10 flex-1">
                            <div className="font-black flex flex-col sm:flex-row sm:items-center justify-between text-left uppercase tracking-wider">
                              <span className="text-sm sm:text-base leading-tight">{option.label}</span>
                              {hasVoted && <span className="sm:ml-3 font-black text-lg sm:text-xl">{percentage}%</span>}
                            </div>
                          </div>

                          {hasVoted && isSelected && (
                            <div className="relative z-10 text-white shrink-0 ml-2">
                              <CheckCircle2 size={24} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {!hasVoted && selectedOption && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 shrink-0"
                    >
                      <button 
                        onClick={confirmVote}
                        className="w-full bg-black hover:bg-rose-500 text-white font-black py-3 sm:py-4 uppercase tracking-widest text-base sm:text-lg border-4 border-black transition-colors flex items-center justify-center gap-3 neo-shadow-white hover:shadow-none translate-x-[4px] translate-y-[4px] hover:translate-x-0 hover:translate-y-0"
                      >
                        <CheckCircle2 size={24} strokeWidth={3} /> OYUMU KULLAN
                      </button>
                    </motion.div>
                  )}

                  {hasVoted && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex flex-col gap-3 shrink-0"
                    >
                      <p className="text-xs sm:text-sm font-black text-black uppercase tracking-widest text-center flex flex-col sm:flex-row items-center justify-center gap-2 bg-white py-3 border-4 border-black neo-shadow">
                        <CheckCircle2 size={20} className="text-black shrink-0" strokeWidth={3} /> SONUÇLAR KAYDEDİLDİ!
                      </p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={suggestPoll}
                          className="flex-1 bg-white hover:bg-black hover:text-white text-black font-black py-3 border-4 border-black flex items-center justify-center gap-3 transition-colors text-xs sm:text-sm uppercase tracking-widest neo-shadow hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
                        >
                          <Sparkles size={20} strokeWidth={2.5} /> SORU ÖNER
                        </button>
                        <button 
                          onClick={() => addToast('Yorum özelliği tasarım aşamasında.', 'info')}
                          className="flex-1 bg-black hover:bg-rose-500 text-white font-black py-3 border-4 border-black flex items-center justify-center gap-3 transition-colors text-xs sm:text-sm uppercase tracking-widest neo-shadow-white hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
                        >
                          <MessageCircle size={20} strokeWidth={2.5} /> YORUM YAP
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
