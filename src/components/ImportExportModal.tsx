import React, { useState } from 'react';
import { useAppStore } from '../context/AppStore';
import { useToastStore } from '../store/useToastStore';
import { 
  FileUp, Download, Check, AlertCircle, Copy, 
  Sparkles, CheckCircle2, Loader2, ArrowRight, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useAppTranslation } from '../hooks/useAppTranslation';
import { WatchlistItem, WatchStatus } from '../types';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SAMPLE_MAL_XML = `<?xml version="1.0" encoding="UTF-8" ?>
<myanimelist>
  <myinfo>
    <user_name>OtakuExplorer</user_name>
    <user_export_type>1</user_export_type>
  </myinfo>
  <anime>
    <series_animedb_id>52991</series_animedb_id>
    <series_title>Sousou no Frieren</series_title>
    <series_episodes>28</series_episodes>
    <my_watched_episodes>28</my_watched_episodes>
    <my_score>10</my_score>
    <my_status>Completed</my_status>
  </anime>
  <anime>
    <series_animedb_id>52347</series_animedb_id>
    <series_title>Solo Leveling</series_title>
    <series_episodes>12</series_episodes>
    <my_watched_episodes>8</my_watched_episodes>
    <my_score>9</my_score>
    <my_status>Watching</my_status>
  </anime>
  <anime>
    <series_animedb_id>5114</series_animedb_id>
    <series_title>Fullmetal Alchemist: Brotherhood</series_title>
    <series_episodes>64</series_episodes>
    <my_watched_episodes>64</my_watched_episodes>
    <my_score>10</my_score>
    <my_status>Completed</my_status>
  </anime>
  <anime>
    <series_animedb_id>57334</series_animedb_id>
    <series_title>Dan Da Dan</series_title>
    <series_episodes>12</series_episodes>
    <my_watched_episodes>6</my_watched_episodes>
    <my_score>9</my_score>
    <my_status>Watching</my_status>
  </anime>
  <anime>
    <series_animedb_id>9253</series_animedb_id>
    <series_title>Steins;Gate</series_title>
    <series_episodes>24</series_episodes>
    <my_watched_episodes>24</my_watched_episodes>
    <my_score>10</my_score>
    <my_status>Completed</my_status>
  </anime>
  <anime>
    <series_animedb_id>1535</series_animedb_id>
    <series_title>Death Note</series_title>
    <series_episodes>37</series_episodes>
    <my_watched_episodes>37</my_watched_episodes>
    <my_score>9</my_score>
    <my_status>Completed</my_status>
  </anime>
  <anime>
    <series_animedb_id>52701</series_animedb_id>
    <series_title>Bleach: Thousand-Year Blood War</series_title>
    <series_episodes>13</series_episodes>
    <my_watched_episodes>13</my_watched_episodes>
    <my_score>9</my_score>
    <my_status>Completed</my_status>
  </anime>
  <anime>
    <series_animedb_id>21</series_animedb_id>
    <series_title>One Piece</series_title>
    <series_episodes>0</series_episodes>
    <my_watched_episodes>1080</my_watched_episodes>
    <my_score>10</my_score>
    <my_status>Watching</my_status>
  </anime>
  <anime>
    <series_animedb_id>11061</series_animedb_id>
    <series_title>Hunter x Hunter (2011)</series_title>
    <series_episodes>148</series_episodes>
    <my_watched_episodes>148</my_watched_episodes>
    <my_score>10</my_score>
    <my_status>Completed</my_status>
  </anime>
  <anime>
    <series_animedb_id>52211</series_animedb_id>
    <series_title>Oshi no Ko</series_title>
    <series_episodes>11</series_episodes>
    <my_watched_episodes>0</my_watched_episodes>
    <my_score>0</my_score>
    <my_status>Plan to Watch</my_status>
  </anime>
</myanimelist>`;

export const ImportExportModal: React.FC<ImportExportModalProps> = ({ isOpen, onClose }) => {
  const { watchlist, importWatchlistItems } = useAppStore();
  const { addToast } = useToastStore();
  const { t } = useAppTranslation();

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [inputText, setInputText] = useState('');
  const [parsedItems, setParsedItems] = useState<WatchlistItem[] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importDone, setImportDone] = useState(false);

  if (!isOpen) return null;

  // Parser for MyAnimeList XML and JSON
  const handleParseContent = (content: string) => {
    try {
      const trimmed = content.trim();
      const items: WatchlistItem[] = [];

      if (trimmed.startsWith('<?xml') || trimmed.includes('<myanimelist>') || trimmed.includes('<anime>')) {
        // XML Parse
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(trimmed, 'text/xml');
        const animeNodes = xmlDoc.getElementsByTagName('anime');

        if (animeNodes.length === 0) {
          throw new Error(t('import_err_no_anime_tag'));
        }

        for (let i = 0; i < animeNodes.length; i++) {
          const node = animeNodes[i];
          const malId = parseInt(node.getElementsByTagName('series_animedb_id')[0]?.textContent || '0', 10);
          const title = node.getElementsByTagName('series_title')[0]?.textContent || `Anime #${malId}`;
          const totalEp = parseInt(node.getElementsByTagName('series_episodes')[0]?.textContent || '0', 10);
          const watchedEp = parseInt(node.getElementsByTagName('my_watched_episodes')[0]?.textContent || '0', 10);
          const score = parseInt(node.getElementsByTagName('my_score')[0]?.textContent || '0', 10);
          const rawStatus = node.getElementsByTagName('my_status')[0]?.textContent?.trim() || '';

          // Map status
          let status: WatchStatus = 'plan_to_watch';
          const lowerStatus = rawStatus.toLowerCase();
          if (lowerStatus === '1' || lowerStatus.includes('watching') || lowerStatus.includes('izlen')) {
            status = 'watching';
          } else if (lowerStatus === '2' || lowerStatus.includes('completed') || lowerStatus.includes('tamam')) {
            status = 'completed';
          } else if (lowerStatus === '3' || lowerStatus.includes('on-hold') || lowerStatus.includes('hold')) {
            status = 'on_hold';
          } else if (lowerStatus === '4' || lowerStatus.includes('dropped') || lowerStatus.includes('bırak')) {
            status = 'dropped';
          } else {
            status = 'plan_to_watch';
          }

          items.push({
            anime: {
              mal_id: malId || Math.floor(100000 + Math.random() * 900000),
              title: title,
              title_english: title,
              images: {
                jpg: { 
                  image_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}`, 
                  large_image_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}` 
                },
                webp: { 
                  image_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}`, 
                  large_image_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(title)}` 
                }
              },
              synopsis: `${title} - ${t('import_synopsis_source')}`,
              score: score || 8.0,
              episodes: totalEp > 0 ? totalEp : null,
              status: status === 'completed' ? 'Finished Airing' : 'Currently Airing',
              genres: [{ mal_id: 1, name: 'Anime' }],
              year: 2023
            },
            status,
            userScore: score,
            episodesWatched: watchedEp,
            addedAt: new Date().toISOString()
          });
        }
      } else if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        // JSON Parse
        const data = JSON.parse(trimmed);
        const list = Array.isArray(data) ? data : data.anime || data.watchlist || data.entries || [];

        list.forEach((item: any) => {
          const malId = item.mal_id || item.id || Math.floor(100000 + Math.random() * 900000);
          const title = item.title_english || item.title || item.name || `Anime #${malId}`;
          const status = (item.status?.toLowerCase() === 'completed' ? 'completed' : item.status?.toLowerCase() === 'watching' ? 'watching' : item.status?.toLowerCase() === 'dropped' ? 'dropped' : 'plan_to_watch') as WatchStatus;

          items.push({
            anime: {
              mal_id: malId,
              title,
              title_english: title,
              images: item.anime?.images || {
                jpg: { image_url: item.image || '', large_image_url: item.image || '' },
                webp: { image_url: item.image || '', large_image_url: item.image || '' }
              },
              synopsis: item.synopsis || '',
              score: item.score || item.userScore || 8.0,
              episodes: item.episodes || item.totalEpisodes || null,
              status: 'Airing',
              genres: [{ mal_id: 1, name: 'Anime' }],
              year: item.year || 2023
            },
            status,
            userScore: item.userScore || item.score || 0,
            episodesWatched: item.episodesWatched || item.watched_episodes || 0,
            addedAt: new Date().toISOString()
          });
        });
      } else {
        throw new Error(t('import_err_format'));
      }

      if (items.length === 0) {
        throw new Error(t('import_err_no_entries'));
      }

      setParsedItems(items);
      addToast(t('import_success_detected', { count: items.length }), 'success');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || t('import_err_parse_failed'), 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(text);
      handleParseContent(text);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_MAL_XML);
    handleParseContent(SAMPLE_MAL_XML);
  };

  const handleExecuteImport = async () => {
    if (!parsedItems || parsedItems.length === 0) return;

    setIsProcessing(true);
    try {
      const count = await importWatchlistItems(parsedItems);
      setImportDone(true);
      addToast(t('import_success_added', { count }), 'success');
    } catch (err) {
      console.error(err);
      addToast(t('import_err_generic'), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Export functions
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(watchlist, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `anisync-watchlist-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast(t('import_exported_json_toast'), 'success');
  };

  const handleCopyExport = () => {
    navigator.clipboard.writeText(JSON.stringify(watchlist, null, 2));
    addToast(t('import_copied_toast'), 'success');
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-black border-4 border-white neo-shadow-white w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 border-b-2 border-white flex items-center justify-between bg-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-rose-600 text-white font-black flex items-center justify-center border border-white">
              <FileUp size={18} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-white uppercase text-base tracking-tight">
                {t('import_title')}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border border-white text-white hover:bg-rose-600 font-black text-sm flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b-2 border-white/20">
          <button
            onClick={() => { setActiveTab('import'); setImportDone(false); }}
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors",
              activeTab === 'import' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
            )}
          >
            <FileUp size={16} />
            <span>{t('import_tab_import')}</span>
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={cn(
              "flex-1 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border-l-2 border-white/20",
              activeTab === 'export' ? "bg-white text-black" : "text-white hover:bg-neutral-900"
            )}
          >
            <Download size={16} />
            <span>{t('import_tab_export')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'import' ? (
            importDone ? (
              <div className="py-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-500 text-black border-2 border-white neo-shadow-white flex items-center justify-center mb-4">
                  <CheckCircle2 size={36} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  {t('import_done_title')}
                </h3>
                <p className="text-neutral-400 font-bold text-xs uppercase tracking-wider mt-2 max-w-sm">
                  {t('import_done_desc', { count: parsedItems?.length ?? 0 })}
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 px-6 py-3 bg-amber-400 hover:bg-white text-black font-black uppercase text-xs tracking-wider border-2 border-black neo-shadow-white transition-colors"
                >
                  {t('import_go_to_list')}
                </button>
              </div>
            ) : parsedItems ? (
              <div className="space-y-4">
                <div className="bg-neutral-900 border-2 border-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                      {t('import_summary_title')}
                    </span>
                    <span className="text-xs font-black bg-rose-600 text-white px-2 py-0.5 border border-white">
                      {t('import_anime_count', { count: parsedItems.length })}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-black p-2 border border-white/20">
                      <div className="text-base font-black text-white">
                        {parsedItems.filter(i => i.status === 'watching').length}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase">{t('watching')}</div>
                    </div>
                    <div className="bg-black p-2 border border-white/20">
                      <div className="text-base font-black text-white">
                        {parsedItems.filter(i => i.status === 'completed').length}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase">{t('completed')}</div>
                    </div>
                    <div className="bg-black p-2 border border-white/20">
                      <div className="text-base font-black text-white">
                        {parsedItems.filter(i => i.status === 'plan_to_watch').length}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase">{t('plan_to_watch')}</div>
                    </div>
                    <div className="bg-black p-2 border border-white/20">
                      <div className="text-base font-black text-white">
                        {parsedItems.filter(i => i.status === 'dropped' || i.status === 'on_hold').length}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-bold uppercase">{t('import_status_other')}</div>
                    </div>
                  </div>
                </div>

                {/* Preview List */}
                <div className="max-h-52 overflow-y-auto space-y-2 border-2 border-white/20 p-2 bg-black">
                  {parsedItems.slice(0, 10).map(item => (
                    <div key={item.anime.mal_id} className="flex items-center justify-between p-2 bg-neutral-900 border border-white/10 text-xs">
                      <div className="font-black text-white truncate max-w-[280px]">
                        {item.anime.title}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-400">
                          {item.episodesWatched} Ep {item.userScore ? `• ★ ${item.userScore}` : ''}
                        </span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 border border-white/40 bg-black text-white font-black">
                          {t(item.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {parsedItems.length > 10 && (
                    <div className="text-center text-[10px] text-neutral-400 uppercase font-black py-1">
                      {t('import_more_anime', { count: parsedItems.length - 10 })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleExecuteImport}
                    disabled={isProcessing}
                    className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase text-xs tracking-wider border-2 border-black neo-shadow-white transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} strokeWidth={3} />}
                    <span>{isProcessing ? t('import_processing') : t('import_confirm_cta')}</span>
                  </button>
                  <button
                    onClick={() => setParsedItems(null)}
                    className="py-3 px-4 bg-neutral-800 text-white font-black uppercase text-xs border border-white/40 hover:bg-neutral-700"
                  >
                    {t('back_label')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-300 font-bold uppercase tracking-wider leading-relaxed">
                  {t('import_upload_hint_pre')} <span className="text-amber-400">animelist.xml</span> {t('import_upload_hint_post')}
                </p>

                {/* File Upload Zone */}
                <div className="border-2 border-dashed border-white/40 hover:border-amber-400 p-6 text-center bg-neutral-900/50 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    accept=".xml,.json,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <FileUp size={32} className="mx-auto text-amber-400 mb-2" />
                  <p className="text-xs font-black text-white uppercase tracking-wider">
                    {t('import_upload_zone_title')}
                  </p>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase mt-1">
                    {t('import_upload_zone_sub')}
                  </p>
                </div>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black uppercase text-neutral-400 tracking-widest">{t('import_or_paste')}</span>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>

                <textarea
                  rows={4}
                  placeholder={t('import_textarea_placeholder')}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full bg-neutral-900 border-2 border-white/30 text-white font-mono text-xs p-3 focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleLoadSample}
                    type="button"
                    className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-amber-400/50 font-black text-[11px] uppercase tracking-wider transition-colors"
                  >
                    <Sparkles size={14} />
                    <span>{t('import_load_sample')}</span>
                  </button>

                  <button
                    onClick={() => handleParseContent(inputText)}
                    disabled={!inputText.trim()}
                    className="px-6 py-2.5 bg-white hover:bg-rose-600 hover:text-white text-black font-black uppercase text-xs tracking-wider border-2 border-black neo-shadow-white transition-colors disabled:opacity-40"
                  >
                    {t('import_parse_cta')}
                  </button>
                </div>
              </div>
            )
          ) : (
            /* Export Tab */
            <div className="space-y-5">
              <div className="bg-neutral-900 border-2 border-white p-5">
                <h4 className="font-black text-white uppercase text-sm tracking-tight mb-1">
                  {t('import_export_title')}
                </h4>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mb-4 leading-relaxed">
                  {t('import_export_desc', { count: watchlist.length })}
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleExportJSON}
                    className="flex-1 py-3 px-4 bg-amber-400 hover:bg-amber-300 text-black font-black uppercase text-xs tracking-wider border-2 border-black neo-shadow-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} strokeWidth={3} />
                    <span>{t('import_download_json')}</span>
                  </button>

                  <button
                    onClick={handleCopyExport}
                    className="py-3 px-4 bg-white hover:bg-neutral-200 text-black font-black uppercase text-xs tracking-wider border-2 border-black transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={16} strokeWidth={2.5} />
                    <span>{t('copy_to_clipboard')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
