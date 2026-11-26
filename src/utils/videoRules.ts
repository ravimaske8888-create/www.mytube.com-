import { VideoItem } from '../types';

/**
 * Formats view counts cleanly into human readable numbers (e.g. 1,234 views, 54.2K views, 1.2M views)
 */
export function formatViews(views: number): string {
  if (views < 0) return '0 views';
  if (views < 1000) return `${views} views`;
  if (views < 10000) return `${views.toLocaleString()} views`;
  if (views < 1_000_000) return `${(views / 1000).toFixed(1).replace(/\.0$/, '')}K views`;
  return `${(views / 1_000_000).toFixed(1).replace(/\.0$/, '')}M views`;
}

/**
 * Formats duration in seconds to standard MM:SS or HH:MM:SS
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0 || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins < 60) {
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Filter videos based on tab, category tag, and search query
 */
export function filterVideos(
  videos: VideoItem[],
  typeFilter: 'all' | 'video' | 'short',
  searchQuery: string = '',
  selectedCategory: string = 'All'
): VideoItem[] {
  let filtered = [...videos];

  if (typeFilter !== 'all') {
    filtered = filtered.filter((v) => v.type === typeFilter);
  }

  if (selectedCategory && selectedCategory !== 'All') {
    filtered = filtered.filter((v) =>
      v.tags?.some((t) => t.toLowerCase() === selectedCategory.toLowerCase()) ||
      v.title.toLowerCase().includes(selectedCategory.toLowerCase())
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(
      (v) =>
        v.title.toLowerCase().includes(q) ||
        v.channelName.toLowerCase().includes(q) ||
        v.channelHandle.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  return filtered;
}

/**
 * Calculates total storage used in Megabytes and counts user uploads
 */
export function calculateStorageStats(videos: VideoItem[], userId?: string): {
  count: number;
  totalMb: number;
  storageDisplay: string;
} {
  const userVideos = userId ? videos.filter((v) => v.uploadedBy === userId) : videos.filter((v) => v.uploadedBy);
  const count = userVideos.length;
  const totalMb = userVideos.reduce((acc, v) => acc + (v.storageSizeMb || 12.5), 0);

  let storageDisplay = `${count} videos uploaded`;
  if (totalMb > 1024) {
    storageDisplay += ` (${(totalMb / 1024).toFixed(1)} GB in Cloud)`;
  } else if (count > 0) {
    storageDisplay += ` (${totalMb.toFixed(0)} MB in Cloud)`;
  }

  return { count, totalMb, storageDisplay };
}

/**
 * Handles liking logic: toggling like status and updating count
 */
export function toggleVideoLike(
  video: VideoItem,
  currentStatus?: boolean
): { likes: number; isLiked: boolean; dislikes: number; isDisliked: boolean } {
  const wasLiked = currentStatus ?? video.isLiked ?? false;
  const nextLiked = !wasLiked;
  let newLikes = video.likes;
  let newDislikes = video.dislikes;

  if (nextLiked) {
    newLikes += 1;
    if (video.isDisliked) {
      newDislikes = Math.max(0, newDislikes - 1);
    }
  } else {
    newLikes = Math.max(0, newLikes - 1);
  }

  return {
    likes: newLikes,
    isLiked: nextLiked,
    dislikes: newDislikes,
    isDisliked: false,
  };
}

/**
 * Increments the view count for a video or short and guarantees non-negative integer
 */
export function incrementVideoViews(video: VideoItem): VideoItem {
  return {
    ...video,
    views: Math.max(0, (video.views || 0) + 1),
  };
}

/**
 * Calculates total views across all videos and shorts uploaded by a user/channel
 */
export function calculateChannelTotalViews(videos: VideoItem[], userId?: string): number {
  const userVideos = userId
    ? videos.filter((v) => v.uploadedBy === userId)
    : videos.filter((v) => v.uploadedBy);

  return userVideos.reduce((sum, v) => sum + (v.views || 0), 0);
}

export const VIDEO_QUALITIES = [
  { id: 'Auto', label: 'Auto (Recommended)', labelHi: 'ऑटो (सिफारिश की गई)', desc: 'Best for current network', icon: '🌟' },
  { id: '1080p', label: '1080p Full HD', labelHi: '1080p फुल एचडी', desc: 'Crisp & high bitrate', icon: '💎' },
  { id: '720p', label: '720p HD', labelHi: '720p एचडी', desc: 'Standard HD quality', icon: '📺' },
  { id: '480p', label: '480p SD', labelHi: '480p सामान्य', desc: 'Standard resolution', icon: '📱' },
  { id: '360p', label: '360p Data Saver', labelHi: '360p डेटा सेवर', desc: 'Saves mobile data', icon: '⚡' },
] as const;

export type VideoQuality = typeof VIDEO_QUALITIES[number]['id'];

/**
 * Edit a video's title, description, tags, or type
 */
export function editVideoItem(
  videos: VideoItem[],
  videoId: string,
  edits: Partial<Pick<VideoItem, 'title' | 'description' | 'tags' | 'type' | 'quality'>>
): VideoItem[] {
  return videos.map((v) => {
    if (v.id !== videoId) return v;
    return {
      ...v,
      ...edits,
      title: edits.title !== undefined ? edits.title.trim() || v.title : v.title,
      description: edits.description !== undefined ? edits.description : v.description,
      tags: edits.tags !== undefined ? edits.tags : v.tags,
      type: edits.type !== undefined ? edits.type : v.type,
      quality: edits.quality !== undefined ? edits.quality : v.quality,
    };
  });
}

/**
 * Deletes a video by its ID
 */
export function deleteVideoItem(videos: VideoItem[], videoId: string): VideoItem[] {
  return videos.filter((v) => v.id !== videoId);
}

/**
 * Updates video quality and returns updated VideoItem
 */
export function updateVideoQuality(video: VideoItem, quality: string): VideoItem {
  return {
    ...video,
    quality,
  };
}
