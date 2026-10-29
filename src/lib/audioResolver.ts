/**
 * Dynamic iTunes Audio Preview Resolver for AniSync Music Quiz
 * Fetches real, live 30-second AAC audio previews directly from Apple Music CDN.
 */

const audioCache = new Map<string, string>();

export const resolveRealSongAudioUrl = async (
  songTitle: string, 
  artist: string, 
  animeTitle: string, 
  fallbackUrl?: string
): Promise<string> => {
  const cacheKey = `${songTitle}-${artist}`.toLowerCase();
  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey)!;
  }

  const searchTerms = [
    `${songTitle} ${artist}`,
    `${songTitle} ${animeTitle}`,
    `${animeTitle} Theme`,
    songTitle
  ];

  for (const term of searchTerms) {
    // 1. Try server proxy endpoint
    try {
      const res = await fetch(`/api/music-preview?term=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.previewUrl) {
          audioCache.set(cacheKey, data.previewUrl);
          return data.previewUrl;
        }
      }
    } catch {
      // Continue
    }

    // 2. Try direct client fetch to iTunes API
    try {
      const directRes = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=1`);
      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData.results && directData.results.length > 0 && directData.results[0].previewUrl) {
          const url = directData.results[0].previewUrl;
          audioCache.set(cacheKey, url);
          return url;
        }
      }
    } catch {
      // Continue
    }
  }

  return fallbackUrl || '';
};
