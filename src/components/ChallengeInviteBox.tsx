import React, { useState } from 'react';
import { Share2, Trophy, Swords, Check, Copy, MessageCircle, Send, Sparkles } from 'lucide-react';
import { useToastStore } from '../store/useToastStore';
import { useAppStore } from '../context/AppStore';
import { cn } from '../lib/utils';

interface ChallengeInviteBoxProps {
  title: string;
  scoreDisplay: string;
  subtitle: string;
  challengeType: 'music_daily' | 'music_arcade' | 'weekly_challenge';
  statsData?: Record<string, any>;
}

export const ChallengeInviteBox: React.FC<ChallengeInviteBoxProps> = ({
  title,
  scoreDisplay,
  subtitle,
  challengeType,
  statsData = {}
}) => {
  const { addToast } = useToastStore();
  const { addForumPost, userProfile } = useAppStore();
  const [sharedToFeed, setSharedToFeed] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const generateShareText = () => {
    let base = `⚔️ ANİSYNC DÜELLO MEYDAN OKUMASI!\n`;
    base += `🎯 ${title}\n`;
    base += `🏆 Skor / Sonuç: ${scoreDisplay}\n`;
    base += `📌 ${subtitle}\n`;
    if (statsData.streak) base += `🔥 Seri: ${statsData.streak} Gün\n`;
    if (statsData.accuracy) base += `📊 Doğruluk: %${statsData.accuracy}\n`;
    base += `\nCesaretin varsa bu skoru geç!\n🔗 ${window.location.origin}${challengeType === 'weekly_challenge' ? '/weekly-challenge' : '/music-quiz'}`;
    return base;
  };

  const handleShareToCommunityFeed = () => {
    const text = generateShareText();
    addForumPost({
      title: `⚔️ DÜELLO DAVETİ: ${title} (${scoreDisplay})`,
      content: text,
      likes: 0,
      replies: 0,
      category: 'Discussion',
      type: 'discussion'
    });
    setSharedToFeed(true);
    addToast('Meydan okuma başarıyla Topluluk Akışı\'nda (Community Pulse) paylaşıldı! 🚀', 'success');
  };

  const handleCopyClipboard = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    addToast('Düello davet metni ve bağlantısı panoya kopyalandı! 📋', 'success');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleTwitterShare = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  return (
    <div className="bg-neutral-950 border-4 border-amber-400 neo-shadow p-5 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-amber-400 text-black text-[9px] font-black px-3 py-1 uppercase tracking-widest border-b-2 border-l-2 border-black">
        ⚔️ DÜELLO & MEYDAN OKUMA
      </div>

      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-amber-400/20 border-2 border-amber-400 text-amber-400 flex items-center justify-center shrink-0 font-black">
          <Swords size={24} />
        </div>
        <div>
          <h4 className="text-base font-black text-white uppercase tracking-tight">
            Arkadaşlarına Meydan Oku!
          </h4>
          <p className="text-xs text-neutral-400 font-medium mt-0.5">
            Bu skoru toplulukta paylaşarak diğer otakuları düelloya davet et veya doğrudan bağlantıyı gönder.
          </p>
        </div>
      </div>

      {/* Share Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
        {/* Share to Community Feed */}
        <button
          onClick={handleShareToCommunityFeed}
          disabled={sharedToFeed}
          className={cn(
            "p-3 border-2 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer",
            sharedToFeed 
              ? "bg-emerald-950 text-emerald-300 border-emerald-500" 
              : "bg-amber-400 text-black border-black hover:bg-white neo-shadow-white"
          )}
        >
          {sharedToFeed ? <Check size={16} strokeWidth={3} /> : <Sparkles size={16} />}
          <span>{sharedToFeed ? "Akışta Paylaşıldı ✓" : "Topluluk Akışında Paylaş"}</span>
        </button>

        {/* Copy Clipboard Link */}
        <button
          onClick={handleCopyClipboard}
          className="p-3 bg-black hover:bg-neutral-900 text-white border-2 border-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          {copiedLink ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
          <span>{copiedLink ? "Kopyalandı!" : "Davet Metnini Kopyala"}</span>
        </button>

        {/* WhatsApp Share */}
        <button
          onClick={handleWhatsAppShare}
          className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white border-2 border-white/40 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <MessageCircle size={16} />
          <span>WhatsApp ile Gönder</span>
        </button>

        {/* X / Twitter Share */}
        <button
          onClick={handleTwitterShare}
          className="p-3 bg-neutral-900 hover:bg-neutral-800 text-white border-2 border-white/40 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Send size={16} />
          <span>X (Twitter) ile Paylaş</span>
        </button>
      </div>
    </div>
  );
};
