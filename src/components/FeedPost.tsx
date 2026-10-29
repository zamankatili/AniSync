import React, { useState } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { MessageSquare, Heart, Share2, MoreHorizontal, Star, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getSafeImageUrl, formatRelativeTime } from '../lib/utils';
import { ForumPost } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAppTranslation } from '../hooks/useAppTranslation';

interface FeedPostProps {
  post: ForumPost;
  index: number;
}

export const FeedPost: React.FC<FeedPostProps> = ({ post, index }) => {
  const { toggleLike, deletePost, addComment, userProfile, currentUser } = useAppStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();
  const { t, i18n } = useAppTranslation();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<boolean>(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (translatedText) {
       setTranslatedText(null); // toggle off
       return;
    }
    
    setIsTranslating(true);
    try {
       const res = await fetch('/api/translate', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ text: post.content, targetLang: i18n.language || 'tr' })
       });
       
       if (res.status === 429) {
          addToast(t('translation_limit'), "error");
          return;
       }
       
       const data = await res.json();
       if (data.translation) {
         setTranslatedText(data.translation);
       } else {
         addToast(t('translation_failed'), "error");
       }
    } catch (e) {
       addToast(t('translation_failed'), "error");
    } finally {
       setIsTranslating(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-black p-5 border-2 border-white/20 neo-shadow mb-6 hover:border-white transition-all group/post"
    >
      <div className="flex gap-4">
        <img 
          src={post.author.avatar} 
          alt={post.author.name} 
          onClick={() => {
            if (post.author.uid) navigate(`/profile/${post.author.uid}`);
          }}
          className={cn(
            "w-12 h-12 border-2 border-white bg-white shrink-0 object-cover grayscale group-hover/post:grayscale-0 transition-all",
            post.author.uid && "cursor-pointer hover:border-rose-500"
          )} 
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2 relative">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 
                onClick={() => {
                  if (post.author.uid) navigate(`/profile/${post.author.uid}`);
                }}
                className={cn(
                  "font-black uppercase text-white truncate text-lg tracking-tight",
                  post.author.uid && "cursor-pointer hover:text-rose-500 transition-colors"
                )}
              >{post.author.name}</h4>
              {post.author.isFriend && <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 font-black uppercase tracking-wider border border-rose-600">Takip Ediliyor</span>}
              <span className="text-xs text-neutral-500 font-bold uppercase tracking-wider">
                • {post.createdAt ? formatRelativeTime(post.createdAt) : 'AZ ÖNCE'}
              </span>
            </div>
            
            <button 
              onClick={() => setActiveDropdown(!activeDropdown)} 
              className="text-white hover:text-rose-500 p-1 transition-colors"
            >
              <MoreHorizontal size={20} strokeWidth={2.5}/>
            </button>
            <AnimatePresence>
              {activeDropdown && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 top-8 bg-black border-2 border-white neo-shadow-white overflow-hidden z-20 min-w-[150px]"
                >
                  {post.author.name === userProfile.name ? (
                    <button 
                      onClick={() => {
                        deletePost(post.id);
                        addToast('Gönderi silindi', 'success');
                        setActiveDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-rose-500 hover:bg-white hover:text-black hover:font-black transition-all font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      SİL
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        addToast('Gönderi şikayet edildi', 'success');
                        setActiveDropdown(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-white hover:bg-white hover:text-black hover:font-black transition-all font-bold uppercase tracking-wider"
                    >
                      ŞİKAYET ET
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {post.title !== 'Topluluk Gönderisi' && (
            <h3 className="text-xl font-black text-white mb-2 truncate uppercase tracking-tight">{post.title}</h3>
          )}
          
          <p className="text-neutral-300 text-sm font-bold uppercase leading-relaxed mb-4 whitespace-pre-wrap tracking-wide">
            {translatedText ? (
              <span className="text-cyan-400">{translatedText}</span>
            ) : (
              post.content
            )}
          </p>

          <button
            onClick={handleTranslate}
            disabled={isTranslating}
            className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest text-neutral-500 hover:text-white transition-colors mb-4 border border-neutral-700 px-2 py-1"
          >
            {isTranslating ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
            {isTranslating ? t('translating') : translatedText ? t('translated') : t('translate')}
          </button>

          {/* Attached Meme */}
          {post.type === 'meme_share' && post.memeUrl && (
            <div className="mt-2 mb-4 border-4 border-black bg-white p-2 neo-shadow-white relative group/meme">
              <img src={post.memeUrl} alt="Meme" className="w-full h-auto max-h-[500px] object-contain" referrerPolicy="no-referrer" />
              <div className="absolute top-4 left-4 bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest px-2 py-1 neo-shadow">
                ANIME MEME
              </div>
            </div>
          )}

          {/* Attached Anime Card */}
          {post.type === 'recommendation' && post.animeRef && (
            <div 
              onClick={() => navigate(`/anime/${post.animeRef!.id}`)}
              className="bg-white p-3 flex gap-4 mt-2 mb-4 border-2 border-black neo-shadow-white hover:bg-rose-600 transition-all cursor-pointer group/anime"
            >
              <img src={getSafeImageUrl(post.animeRef.image)} alt={post.animeRef.title} className="w-16 h-24 object-cover border-2 border-black transition-all" referrerPolicy="no-referrer" />
              <div className="flex flex-col justify-center flex-1 min-w-0">
                <div className="text-[10px] text-black font-black mb-1 uppercase tracking-widest border-b-2 border-black/20 pb-1">Hakkında Konuşulan Anime</div>
                <div className="font-black text-black mb-1 truncate text-lg uppercase tracking-tight leading-tight mt-1 group-hover/anime:text-white">{post.animeRef.title}</div>
                <div className="text-xs flex items-center gap-1 font-black text-black group-hover/anime:text-white"><Star size={14} strokeWidth={2.5} fill="currentColor" /> {post.animeRef.score || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Attached List */}
          {post.type === 'list_share' && post.listRef && (
            <div 
              onClick={() => navigate('/lists')}
              className="bg-white p-4 mt-2 mb-4 border-2 border-black neo-shadow-white hover:bg-neutral-100 transition-all cursor-pointer group/list"
            >
              <div className="text-sm text-black font-black mb-3 uppercase tracking-widest text-center border-b-2 border-black/20 pb-2">{post.listRef.listName}</div>
              <div className="flex items-center justify-center gap-3 flex-wrap pt-2">
                {post.listRef.animes.slice(0, 5).map(anime => ( // Sadece ilk 5 kalsın görüntü kirliliği olmasın
                  <div key={anime.id} className="relative overflow-hidden w-16 h-24 border-2 border-black bg-black">
                    <img src={getSafeImageUrl(anime.image)} alt={anime.title} className="w-full h-full object-cover transition-all hover:scale-105" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-6 text-white text-sm font-black pt-4 border-t-2 border-white/20 uppercase tracking-wider">
            <button 
              onClick={() => toggleLike(post.id)}
              className={cn("flex items-center gap-2 px-3 py-2 border-2 transition-all", post.isLikedByMe ? "border-rose-500 bg-rose-500 text-white" : "border-transparent text-neutral-400 hover:border-rose-500 hover:text-rose-500 hover:bg-black/50")}
            >
              <Heart size={18} strokeWidth={2.5} className={cn("transition-transform", post.isLikedByMe ? "fill-white" : "hover:scale-110")} /> 
              <span>{post.likes}</span>
            </button>
            <button 
              onClick={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)} 
              className={cn("flex items-center gap-2 px-3 py-2 border-2 transition-all", expandedPostId === post.id ? "border-white bg-white text-black" : "border-transparent text-neutral-400 hover:border-white hover:text-white hover:bg-black/50")}
            >
              <MessageSquare size={18} strokeWidth={2.5} className="transition-transform" /> 
              <span>{post.replies}</span>
            </button>
            <button 
              onClick={() => { navigator.clipboard.writeText(window.location.href); addToast('Bağlantı kopyalandı!', 'success'); }} 
              className="flex items-center gap-2 px-3 py-2 border-2 border-transparent text-neutral-400 hover:border-white hover:text-white transition-all ml-auto"
            >
              <Share2 size={18} strokeWidth={2.5} className="transition-transform" />
            </button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {expandedPostId === post.id && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t-2 border-white/20"
              >
                <div className="space-y-4 mb-6">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map(comment => (
                      <div key={comment.id} className="flex gap-4">
                        <img src={comment.author.avatar} alt={comment.author.name} className="w-10 h-10 border-2 border-white shrink-0 object-cover grayscale" />
                        <div className="flex-1 bg-black p-3 border-2 border-white/20">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-white text-xs uppercase tracking-widest">{comment.author.name}</span>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">• {comment.createdAt ? formatRelativeTime(comment.createdAt) : 'AZ ÖNCE'}</span>
                          </div>
                          <p className="text-neutral-300 text-xs font-bold uppercase tracking-wide leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-neutral-500 border-2 border-dashed border-white/20 p-6 font-black uppercase tracking-widest text-sm text-center bg-black">
                      HENÜZ YORUM YOK. İLK YORUMU SEN YAP!
                    </p>
                  )}
                </div>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (commentText.trim()) {
                      addComment(post.id, commentText);
                      setCommentText('');
                    }
                  }}
                  className="flex gap-4 items-center"
                >
                  <img src={currentUser?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.avatarSeed}`} alt="Me" className="w-10 h-10 border-2 border-white bg-white shrink-0 object-cover grayscale" />
                  <input 
                    type="text" 
                    placeholder="YANITINI YAZ..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 bg-black border-2 border-white/20 p-3 text-sm font-bold uppercase tracking-wider text-white placeholder-neutral-600 focus:outline-none focus:border-white transition-colors"
                  />
                  <button 
                    type="submit"
                    disabled={!commentText.trim()}
                    className="bg-white text-black border-2 border-white font-black uppercase px-6 py-3 tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-50"
                  >
                    YANITLA
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
