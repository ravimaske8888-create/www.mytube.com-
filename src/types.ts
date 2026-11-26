export type TabType = 'home' | 'shorts' | 'upload' | 'following' | 'library' | 'settings' | 'account';

export type VideoType = 'video' | 'short';

export interface CommentItem {
  id: string;
  userName: string;
  userAvatar?: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  channelName: string;
  channelHandle: string;
  channelAvatar?: string;
  channelColor?: string;
  views: number;
  timestamp: string;
  duration?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  type: VideoType;
  likes: number;
  dislikes: number;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSaved?: boolean;
  isFollowed?: boolean;
  comments: CommentItem[];
  tags?: string[];
  uploadedBy?: string;
  createdAt: number;
  cloudSyncStatus?: 'synced' | 'local' | 'syncing';
  storageSizeMb?: number;
  backupVideoUrl?: string;
  hasIndexedDbBlob?: boolean;
  quality?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarUrl?: string;
  subscribersCount: number;
  joinedDate: string;
  isGoogleUser: boolean;
  emailVerified?: boolean;
  cloudStorageTier: string;
  bannerGradient?: string;
  channelDescription?: string;
  role?: 'owner' | 'developer' | 'admin' | 'user';
  isDeveloper?: boolean;
}

export interface ChannelItem {
  id: string;
  name: string;
  handle: string;
  avatarLetter: string;
  avatarColor: string;
  subscribers: string;
  description: string;
  isFollowed: boolean;
  bannerGradient: string;
}

export interface AppSettings {
  uploadWifiOnly: boolean;
  hdUpload: boolean;
  pushNotifications: boolean;
  subscriptionsAlert: boolean;
  darkTheme: boolean;
  language: 'en' | 'hi';
}
