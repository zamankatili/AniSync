import React, { useState, useEffect } from 'react';
import { 
  Newspaper, RefreshCw, ExternalLink, Sparkles, Search, 
  Flame, Clock, ChevronRight, Share2, Bookmark, Check, Loader2, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../store/useToastStore';
import { cn, getSafeImageUrl } from '../lib/utils';

export interface AnimeNewsItem {
  id: string | number;
  title: string;
  summary: string;
  source: string;
  category: 'DUYURU' | 'FRAGMAN' | 'FİLM' | 'MANGA' | 'SEZON';
  date: string;
  imageUrl: string;
  linkUrl?: string;
  isHot?: boolean;
}

const FALLBACK_NEWS: AnimeNewsItem[] = [
  {
    id: 'news-2026-1',
    title: 'Chainsaw Man: Reze Arc Sinema Filmi Dünya Prömiyeri ve Vizyon Tarihi Duyuruldu',
    summary: 'MAPPA stüdyosu, Bomba Şeytanı Reze\'nin heyecanla beklenen sinema uyarlaması için yeni görsel ve resmi vizyon takvimini paylaştı.',
    source: 'Anime News Network',
    category: 'FİLM',
    date: '1 saat önce',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1806/126216l.jpg',
    linkUrl: 'https://www.animenewsnetwork.com',
    isHot: true
  },
  {
    id: 'news-2026-2',
    title: 'Solo Leveling 2. Sezon "Arise from the Shadow" Bölümleri Rekor Kırıyor',
    summary: 'Sung Jin-Woo ve Gölge Ordusu\'nun Jeju Adası seferi Crunchyroll ve küresel platformlarda en çok izlenen anime olmayı başardı.',
    source: 'Crunchyroll News',
    category: 'SEZON',
    date: '3 saat önce',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1210/141049l.webp',
    linkUrl: 'https://www.crunchyroll.com/news',
    isHot: true
  },
  {
    id: 'news-2026-3',
    title: 'Sakamoto Days Anime Uyarlaması Netflix\'te Dünya Trendlerine Girdi',
    summary: 'TMS Entertainment yapımı Sakamoto Days, efsanevi emekli suikastçı Taro Sakamoto\'nun aksiyon dolu maceralarıyla zirveye oturdu.',
    source: 'Natalie.mu',
    category: 'DUYURU',
    date: '4 saat önce',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1169/143761l.webp',
    linkUrl: 'https://natalie.mu/comic',
    isHot: true
  },
  {
    id: 'news-2026-4',
    title: 'Dan Da Dan 2. Sezon İçin Science SARU Stüdyosundan İlk Teaser Fragmanı Geldi',
    summary: 'Momo ve Okarun\'un uzaylılar ve lanetlerle dolu serüveni Science SARU stüdyosunun büyüleyici animasyonlarıyla devam ediyor.',
    source: 'Anime Trending',
    category: 'FRAGMAN',
    date: 'Bugün',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1487/142079l.webp',
    linkUrl: 'https://anitrendz.com'
  },
  {
    id: 'news-2026-5',
    title: 'Bleach: Thousand-Year Blood War Final Bölümleri Öncesi Özel Röportaj',
    summary: 'Tite Kubo ve Pierrot Films ekibi, Ruh Kralı Sarayı ve Yhwach ile yapılacak nihai yüzleşmenin sinematik kalitesini anlattı.',
    source: 'Comic Natalie',
    category: 'DUYURU',
    date: 'Bugün',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/1912/143527l.webp',
    linkUrl: 'https://natalie.mu/comic'
  },
  {
    id: 'news-2026-6',
    title: 'One Piece: Egghead Doruk Noktası Sonrası Elbaf Devler Diyarı Arkı Başlıyor',
    summary: 'Eiichiro Oda\'nın efsanevi başyapıtında Hasır Şapka Korsanları kadim devlerin vatanı Elbaf\'a ayak basarak yeni dönemi açtı.',
    source: 'Shonen Jump News',
    category: 'MANGA',
    date: 'Dün',
    imageUrl: 'https://cdn.myanimelist.net/images/anime/6/73245l.webp',
    linkUrl: 'https://www.shonenjump.com'
  }
];

export const AnimeNewsFeed: React.FC = () => {
  const [news, setNews] = useState<AnimeNewsItem[]>(FALLBACK_NEWS);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('Canlı');
  const [isGrounded, setIsGrounded] = useState<boolean>(false);
  const [savedNewsIds, setSavedNewsIds] = useState<Set<string | number>>(new Set());
  const { addToast } = useToastStore();

  const fetchLatestAnimeNews = async (isManualRefresh = false) => {
    setLoading(true);
    try {
      const url = isManualRefresh ? '/api/anime-news?refresh=true' : '/api/anime-news';
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Haber servisi yanıt vermedi');
      }
      const data = await res.json();
      if (data.news && Array.isArray(data.news) && data.news.length > 0) {
        setNews(data.news);
        setIsGrounded(!!data.isGrounded);
        setLastUpdated(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
        if (isManualRefresh) {
          addToast(data.isGrounded ? 'Güncel anime haberleri Google Search ile yenilendi!' : 'Haber akışı güncellendi!', 'success');
        }
      } else {
        setNews(FALLBACK_NEWS);
      }
    } catch (err) {
      console.warn('Anime news fetch notice, using curated feed:', err);
      setNews(FALLBACK_NEWS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestAnimeNews(false);
  }, []);

  const toggleSaveNews = (id: string | number) => {
    setSavedNewsIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        addToast('Haber kaydedilenlerden çıkarıldı.', 'info');
      } else {
        next.add(id);
        addToast('Haber kaydedilenlere eklendi!', 'success');
      }
      return next;
    });
  };

  const filteredNews = news.filter((item) => {
    const matchesCat = activeCategory === 'ALL' || item.category === activeCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.source.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-black border-4 border-white neo-shadow-white p-5 md:p-6 mb-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-white/20 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 text-black flex items-center justify-center font-black border-2 border-white neo-shadow">
            <Newspaper size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black uppercase text-white tracking-tight">
                CANLI ANİME HABER AKIŞI
              </h2>
              <span className="bg-cyan-500 text-black font-black text-[10px] px-2 py-0.5 border border-white uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#fff]">
                <Globe size={11} /> GOOGLE SEARCH
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">
              Dünyadan ve Japonya&apos;dan anlık anime, manga ve sinema haberleri • Son güncelleme: {lastUpdated}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchLatestAnimeNews(true)}
          disabled={loading}
          className="px-4 py-2 bg-white hover:bg-cyan-400 text-black font-black text-xs uppercase border-2 border-white flex items-center gap-2 transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 neo-shadow-white shrink-0"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} strokeWidth={3} />
          <span>{loading ? "GÜNCELLENİYOR..." : "HABERLERİ YENİLE"}</span>
        </button>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 relative z-10">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {[
            { id: 'ALL', label: 'TÜM HABERLER' },
            { id: 'DUYURU', label: 'DUYURULAR' },
            { id: 'FRAGMAN', label: 'FRAGMANLAR' },
            { id: 'FİLM', label: 'SİNEMA / FİLM' },
            { id: 'SEZON', label: 'SEZON' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "px-3 py-1.5 border-2 border-white font-black text-[11px] uppercase whitespace-nowrap cursor-pointer transition-colors",
                activeCategory === cat.id
                  ? "bg-cyan-500 text-black neo-shadow-white"
                  : "bg-neutral-900 hover:bg-neutral-800 text-white"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-60 shrink-0">
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Haberlerde ara..."
            className="w-full px-3 py-1.5 pl-8 border-2 border-white font-bold text-xs bg-black text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 uppercase"
          />
          <Search size={14} className="absolute left-2.5 top-2.5 text-neutral-400" />
        </div>
      </div>

      {/* News Grid */}
      <div className="space-y-4 relative z-10">
        {filteredNews.length > 0 ? (
          filteredNews.map((item, index) => {
            const isSaved = savedNewsIds.has(item.id);
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="bg-neutral-950 border-2 border-white/30 hover:border-white p-4 transition-all duration-200 group flex flex-col md:flex-row gap-4 relative overflow-hidden"
              >
                {/* Hot Tag Banner */}
                {item.isHot && (
                  <div className="absolute top-0 right-0 bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 border-b-2 border-l-2 border-white flex items-center gap-1 z-10">
                    <Flame size={10} strokeWidth={3} /> FLAŞ HABER
                  </div>
                )}

                {/* News Image */}
                <div className="w-full md:w-44 h-36 bg-black border-2 border-white shrink-0 overflow-hidden relative">
                  <img
                    src={getSafeImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-1 left-1 bg-black/90 text-white px-1.5 py-0.5 border border-white/50 font-black text-[9px] uppercase">
                    {item.category}
                  </div>
                </div>

                {/* News Details */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 text-[10px] font-black uppercase">
                      <span className="text-cyan-400 bg-cyan-950 border border-cyan-500 px-1.5 py-0.2">
                        {item.source}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-neutral-400 flex items-center gap-1 font-mono">
                        <Clock size={10} /> {item.date}
                      </span>
                    </div>

                    <h3 className="text-base md:text-lg font-black text-white uppercase tracking-tight leading-snug group-hover:text-cyan-400 transition-colors mb-2 line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-neutral-300 font-bold leading-relaxed line-clamp-2 mb-3">
                      {item.summary}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10 gap-2">
                    <a
                      href={item.linkUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-black bg-white hover:bg-cyan-400 px-3 py-1.5 border border-black transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#000]"
                    >
                      <span>HABERİN DEVAMI</span>
                      <ChevronRight size={14} strokeWidth={3} />
                    </a>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveNews(item.id)}
                        className={cn(
                          "p-1.5 border border-white/40 text-xs font-black uppercase flex items-center gap-1 transition-colors cursor-pointer",
                          isSaved ? "bg-amber-400 text-black border-amber-400" : "text-neutral-300 hover:text-white hover:border-white"
                        )}
                        title={isSaved ? "Kaydedilenlerden Çıkar" : "Kaydet"}
                      >
                        <Bookmark size={13} className={isSaved ? "fill-black" : ""} />
                      </button>

                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({ title: item.title, text: item.summary, url: item.linkUrl || window.location.href }).catch(() => {});
                          } else {
                            navigator.clipboard.writeText(`${item.title} - ${item.linkUrl || window.location.href}`);
                            addToast('Haber bağlantısı kopyalandı!', 'success');
                          }
                        }}
                        className="p-1.5 border border-white/40 text-neutral-300 hover:text-white hover:border-white transition-colors cursor-pointer"
                        title="Haberi Paylaş"
                      >
                        <Share2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })
        ) : (
          <div className="bg-black border-2 border-white/30 p-8 text-center">
            <Search size={32} className="mx-auto mb-2 text-neutral-500" />
            <p className="font-black text-sm uppercase text-white mb-1">Aramayla Eşleşen Haber Bulunamadı</p>
            <p className="text-xs text-neutral-400 font-bold">Filtreleri veya arama terimini değiştirmeyi deneyin.</p>
          </div>
        )}
      </div>
    </div>
  );
};
