import { VideoItem, ChannelItem, AppSettings } from '../types';
import { INITIAL_VIDEOS, INITIAL_CHANNELS } from '../data/initialVideos';

const STORAGE_KEYS = {
  VIDEOS_PREFIX: 'mytube_videos_v2_',
  CHANNELS_PREFIX: 'mytube_channels_v2_',
  SETTINGS_PREFIX: 'mytube_settings_v2_',
  HISTORY_PREFIX: 'mytube_history_v2_',
  DELETED_PREFIX: 'mytube_deleted_v2_',
};

export const DEFAULT_SETTINGS: AppSettings = {
  uploadWifiOnly: true,
  hdUpload: false,
  pushNotifications: true,
  subscriptionsAlert: true,
  darkTheme: false,
  language: 'en',
};

function getScopedKey(prefix: string, userId?: string | null): string | null {
  if (!userId) return null;
  return `${prefix}${userId}`;
}

export function loadStoredVideos(userId?: string | null): VideoItem[] {
  const key = getScopedKey(STORAGE_KEYS.VIDEOS_PREFIX, userId);
  if (!key) {
    // Signed-out visitors see ONLY the official public feed (no user uploads)
    return INITIAL_VIDEOS;
  }
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const migrated = parsed.map((v) => {
          if (
            (v.videoUrl && v.videoUrl.includes('commondatastorage.googleapis.com')) ||
            (v.backupVideoUrl && v.backupVideoUrl.includes('commondatastorage.googleapis.com'))
          ) {
            const initialMatch = INITIAL_VIDEOS.find((iv) => iv.id === v.id);
            const fallbackUrl = v.type === 'short' ? '/videos/short1.mp4' : '/videos/video1.mp4';
            return {
              ...v,
              videoUrl: initialMatch ? initialMatch.videoUrl : fallbackUrl,
              backupVideoUrl: fallbackUrl,
            };
          }
          return v;
        });
        return migrated;
      }
    }
  } catch (err) {
    console.warn('Failed to load scoped videos from local storage', err);
  }
  return INITIAL_VIDEOS;
}

export function saveStoredVideos(videos: VideoItem[], userId?: string | null): void {
  const key = getScopedKey(STORAGE_KEYS.VIDEOS_PREFIX, userId);
  if (!key) return;
  try {
    // Only persist official videos and videos uploaded by THIS userId
    const isolatedVideos = videos.filter(
      (v) => !v.uploadedBy || v.uploadedBy === 'official' || v.uploadedBy === userId
    );
    localStorage.setItem(key, JSON.stringify(isolatedVideos));
  } catch (err) {
    console.error('Failed to save scoped videos to local storage', err);
  }
}

export function loadStoredChannels(userId?: string | null): ChannelItem[] {
  const key = getScopedKey(STORAGE_KEYS.CHANNELS_PREFIX, userId);
  if (!key) return INITIAL_CHANNELS;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load scoped channels', err);
  }
  return INITIAL_CHANNELS;
}

export function saveStoredChannels(channels: ChannelItem[], userId?: string | null): void {
  const key = getScopedKey(STORAGE_KEYS.CHANNELS_PREFIX, userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(channels));
  } catch (err) {
    console.error('Failed to save scoped channels', err);
  }
}

export function loadStoredSettings(userId?: string | null): AppSettings {
  const key = getScopedKey(STORAGE_KEYS.SETTINGS_PREFIX, userId);
  if (!key) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        language: parsed.language === 'hi' ? 'hi' : 'en',
      };
    }
  } catch (err) {
    console.warn('Failed to load scoped settings', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings, userId?: string | null): void {
  const key = getScopedKey(STORAGE_KEYS.SETTINGS_PREFIX, userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save scoped settings', err);
  }
}

export function loadWatchHistory(userId?: string | null): string[] {
  const key = getScopedKey(STORAGE_KEYS.HISTORY_PREFIX, userId);
  if (!key) return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordWatchHistory(videoId: string, userId?: string | null): string[] {
  const current = loadWatchHistory(userId);
  const updated = [videoId, ...current.filter((id) => id !== videoId)].slice(0, 50);
  const key = getScopedKey(STORAGE_KEYS.HISTORY_PREFIX, userId);
  if (key) {
    try {
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
      // ignore
    }
  }
  return updated;
}

export function loadDeletedVideoIds(userId?: string | null): string[] {
  const key = `${STORAGE_KEYS.DELETED_PREFIX}${userId || 'guest'}`;
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordDeletedVideoId(videoId: string, userId?: string | null): string[] {
  const current = loadDeletedVideoIds(userId);
  const updated = current.includes(videoId) ? current : [videoId, ...current];
  const key = `${STORAGE_KEYS.DELETED_PREFIX}${userId || 'guest'}`;
  try {
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated;
}

