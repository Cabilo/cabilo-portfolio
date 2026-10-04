// src/lib/video.ts

export type VideoEmbed =
  | { type: 'youtube'; src: string }
  | { type: 'vimeo'; src: string }
  | { type: 'direct'; src: string }
  | { type: 'unknown'; src: string };

export const getVideoEmbed = (url?: string): VideoEmbed | null => {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.replace(/^www\./, '');

    if (hostname === 'youtube.com' || hostname === 'm.youtube.com') {
      const videoId = parsedUrl.searchParams.get('v');
      if (videoId) {
        return {
          type: 'youtube',
          src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`,
        };
      }
    }

    if (hostname === 'youtu.be') {
      const videoId = parsedUrl.pathname.replace('/', '');
      if (videoId) {
        return {
          type: 'youtube',
          src: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&modestbranding=1&rel=0`,
        };
      }
    }

    if (hostname === 'vimeo.com') {
      const videoId = parsedUrl.pathname.split('/').filter(Boolean)[0];
      if (videoId) {
        return {
          type: 'vimeo',
          src: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1`,
        };
      }
    }

    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(parsedUrl.pathname)) {
      return { type: 'direct', src: url };
    }

    return { type: 'unknown', src: url };
  } catch {
    return { type: 'unknown', src: url };
  }
};
