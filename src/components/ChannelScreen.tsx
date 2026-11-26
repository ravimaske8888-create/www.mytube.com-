import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Check,
  Play,
  Film,
  Sparkles,
  Info,
  Calendar,
  Eye,
  Video,
  ListVideo,
  Edit3,
  CheckCircle2,
  Upload,
} from 'lucide-react';
import { VideoItem, UserProfile, ChannelItem } from '../types';
import { formatViews } from '../utils/videoRules';

interface ChannelScreenProps {
  channelHandle: string;
  currentUser: UserProfile | null;
  allVideos: VideoItem[];
  channels: ChannelItem[];
  onSelectVideo: (video: VideoItem) => void;
  onBack: () => void;
  onOpenEditChannel: () => void;
  onNavigateTab: (tab: any) => void;
  onToggleFollowChannel: (channelId: string) => void;
  language: 'en' | 'hi';
}

export const ChannelScreen: React.FC<ChannelScreenProps> = ({
  channelHandle,
  currentUser,
  allVideos,
  channels,
  onSelectVideo,
  onBack,
  onOpenEditChannel,
  onNavigateTab,
  onToggleFollowChannel,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'shorts' | 'playlists' | 'about'>('home');
  const [copiedShare, setCopiedShare] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [videoSort, setVideoSort] = useState<'latest' | 'popular'>('latest');

  // Check if viewing user's own channel
  const isOwner =
    currentUser &&
    (channelHandle.toLowerCase() === currentUser.handle.toLowerCase() ||
      channelHandle.toLowerCase() === '@user' ||
      channelHandle.toLowerCase() === '@me' ||
      channelHandle === '');

  // Find channel metadata from channels list or current user
  const matchingChannel = channels.find(
    (c) => c.handle.toLowerCase() === channelHandle.toLowerCase()
  );

  const channelName = isOwner
    ? currentUser?.name || 'My Channel'
    : matchingChannel?.name || channelHandle.replace('@', '');

  const displayHandle = isOwner
    ? currentUser?.handle || '@mychannel'
    : matchingChannel?.handle || channelHandle;

  const channelBio = isOwner
    ? currentUser?.channelDescription ||
      'Creator and filmmaker sharing long-form tutorials, high-definition tech reviews, and daily trending shorts on mytube.'
    : matchingChannel?.description ||
      'Welcome to the official channel! Subscribe for daily tutorials, insightful tips, and HD videos.';

  // Filter channel videos and shorts
  const channelVideos = allVideos.filter((v) => {
    if (isOwner) {
      return (
        v.uploadedBy === currentUser?.id ||
        v.channelHandle.toLowerCase() === (currentUser?.handle || '@mychannel').toLowerCase()
      );
    }
    return (
      v.channelHandle.toLowerCase() === channelHandle.toLowerCase() ||
      v.channelName.toLowerCase() === channelName.toLowerCase()
    );
  });

  const longVideos = channelVideos.filter((v) => v.type === 'video');
  const shortsVideos = channelVideos.filter((v) => v.type === 'short');

  // Calculate live total views for the channel
  const totalViews = channelVideos.reduce((acc, v) => acc + (v.views || 0), 0);
  const subscribersDisplay = isOwner
    ? `${currentUser?.subscribersCount || 124} subscribers`
    : matchingChannel?.subscribers || '120K subscribers';

  const isSubscribed = matchingChannel?.isFollowed || false;

  // Sorting
  const sortedLongVideos = [...longVideos].sort((a, b) => {
    if (videoSort === 'popular') return (b.views || 0) - (a.views || 0);
    return b.createdAt - a.createdAt;
  });

  const featuredVideo = channelVideos[0];

  const handleShare = () => {
    const channelUrl = `${window.location.origin}?channel=${encodeURIComponent(displayHandle)}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(channelUrl).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      });
    } else {
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const bannerGradient =
    matchingChannel?.bannerGradient ||
    'from-pink-600 via-purple-600 to-cyan-600';

  return (
    <div className="pb-28 pt-1 px-0 sm:px-2 max-w-4xl mx-auto min-h-screen text-gray-900 dark:text-white">
      {/* Top Bar with Back and Share */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 dark:border-neutral-800">
        <button
          onClick={onBack}
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-200" />
          <span className="text-xs font-semibold sm:inline hidden text-gray-600 dark:text-gray-300">
            Back
          </span>
        </button>

        <h2 className="text-sm font-bold truncate max-w-xs">{channelName}</h2>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Share Channel"
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Channel Banner */}
      <div
        className={`relative w-full h-28 sm:h-44 md:h-52 bg-gradient-to-r ${bannerGradient} rounded-b-2xl sm:rounded-2xl overflow-hidden shadow-sm flex items-center justify-center p-4`}
      >
        <div className="absolute inset-0 bg-black/15 backdrop-blur-[0.5px]" />
        <div className="relative text-center text-white drop-shadow-md select-none">
          <span
            className="text-2xl sm:text-4xl font-extrabold tracking-tight"
            style={{ fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' }}
          >
            {channelName}
          </span>
          <p className="text-xs sm:text-sm text-white/90 font-medium mt-1">
            mytube creator channel • Unlimited Cloud Storage
          </p>
        </div>
      </div>

      {/* Channel Header Profile Section */}
      <div className="px-4 pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {isOwner && currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={channelName}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-pink-500 shadow-md"
                />
              ) : (
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-md ${
                    matchingChannel?.avatarColor || 'bg-gradient-to-br from-pink-500 to-indigo-600'
                  }`}
                >
                  {matchingChannel?.avatarLetter || channelName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 p-1 bg-blue-500 text-white rounded-full ring-2 ring-white dark:ring-neutral-900">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* Names & Stats */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {channelName}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                {displayHandle} • {subscribersDisplay} • {channelVideos.length} videos
              </p>

              {/* Bio snippet */}
              <div
                onClick={() => setShowAboutModal(true)}
                className="mt-1.5 text-xs text-gray-600 dark:text-gray-300 line-clamp-1 hover:text-pink-600 dark:hover:text-pink-400 cursor-pointer flex items-center gap-1"
              >
                <span>{channelBio}</span>
                <span className="font-semibold text-gray-400">...more</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1 sm:pt-0">
            {isOwner ? (
              <>
                <button
                  onClick={onOpenEditChannel}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-900 dark:text-white transition-all shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Customize channel</span>
                </button>
                <button
                  onClick={() => onNavigateTab('upload')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white hover:opacity-95 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Video</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => matchingChannel && onToggleFollowChannel(matchingChannel.id)}
                className={`px-5 py-2 text-xs font-bold rounded-full transition-all shadow-sm ${
                  isSubscribed
                    ? 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                    : 'bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>
        </div>

        {/* Channel Tabs */}
        <div className="flex items-center gap-4 sm:gap-6 border-b border-gray-100 dark:border-neutral-800 mt-5 overflow-x-auto no-scrollbar">
          {(['home', 'videos', 'shorts', 'playlists', 'about'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2.5 text-xs sm:text-sm font-semibold capitalize whitespace-nowrap relative transition-colors ${
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-3 sm:px-4 pt-4">
        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Featured spotlight video */}
            {featuredVideo ? (
              <div
                onClick={() => onSelectVideo(featuredVideo)}
                className="cursor-pointer group bg-gray-50 dark:bg-neutral-900/60 rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-neutral-800/80 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative w-full md:w-80 aspect-video rounded-xl overflow-hidden bg-gradient-to-tr from-pink-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-pink-600">mytube</span>
                    {featuredVideo.duration && (
                      <span className="absolute bottom-2 right-2 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                        {featuredVideo.duration}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">
                      Featured Video
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-pink-600 transition-colors">
                      {featuredVideo.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatViews(featuredVideo.views)} • {featuredVideo.timestamp}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                      {featuredVideo.description}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Latest Videos Shelf */}
            {longVideos.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Latest Videos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {longVideos.slice(0, 6).map((vid) => (
                    <div
                      key={vid.id}
                      onClick={() => onSelectVideo(vid)}
                      className="cursor-pointer group rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-all"
                    >
                      <div className="relative aspect-video bg-gradient-to-tr from-pink-100 via-purple-50 to-cyan-100 flex items-center justify-center">
                        <span className="text-base font-bold text-pink-600">mytube</span>
                        {vid.duration && (
                          <span className="absolute bottom-1.5 right-1.5 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                            {vid.duration}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <h4 className="text-xs sm:text-sm font-semibold line-clamp-2 group-hover:text-pink-600 transition-colors">
                          {vid.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {formatViews(vid.views)} • {vid.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shorts Shelf */}
            {shortsVideos.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Film className="w-4 h-4 text-pink-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Shorts
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {shortsVideos.map((short) => (
                    <div
                      key={short.id}
                      onClick={() => {
                        onSelectVideo(short);
                      }}
                      className="cursor-pointer group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-sm"
                    >
                      <video
                        src={short.videoUrl}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                        <p className="text-xs font-semibold text-white line-clamp-2 drop-shadow-sm">
                          {short.title}
                        </p>
                        <p className="text-[10px] font-bold text-gray-300 mt-1 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>{formatViews(short.views)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {channelVideos.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No content uploaded on this channel yet.</p>
                {isOwner && (
                  <button
                    onClick={() => onNavigateTab('upload')}
                    className="mt-3 px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-full hover:bg-pink-700"
                  >
                    Upload Video
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {longVideos.length} Videos
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setVideoSort('latest')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    videoSort === 'latest'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Latest
                </button>
                <button
                  onClick={() => setVideoSort('popular')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    videoSort === 'popular'
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  Popular
                </button>
              </div>
            </div>

            {sortedLongVideos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {sortedLongVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => onSelectVideo(vid)}
                    className="cursor-pointer group rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-all"
                  >
                    <div className="relative aspect-video bg-gradient-to-tr from-pink-100 via-purple-50 to-cyan-100 flex items-center justify-center">
                      <span className="text-base font-bold text-pink-600">mytube</span>
                      {vid.duration && (
                        <span className="absolute bottom-1.5 right-1.5 text-[10px] font-bold bg-black/80 text-white px-1.5 py-0.5 rounded">
                          {vid.duration}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs sm:text-sm font-semibold line-clamp-2 group-hover:text-pink-600 transition-colors">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {formatViews(vid.views)} • {vid.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No long videos uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* SHORTS TAB */}
        {activeTab === 'shorts' && (
          <div>
            <div className="mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {shortsVideos.length} Shorts
              </span>
            </div>

            {shortsVideos.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                {shortsVideos.map((short) => (
                  <div
                    key={short.id}
                    onClick={() => onSelectVideo(short)}
                    className="cursor-pointer group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-sm"
                  >
                    <video
                      src={short.videoUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                      <p className="text-xs font-semibold text-white line-clamp-2 drop-shadow-sm">
                        {short.title}
                      </p>
                      <p className="text-[10px] font-bold text-gray-300 mt-1 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatViews(short.views)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No shorts uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* PLAYLISTS TAB */}
        {activeTab === 'playlists' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
                  <ListVideo className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Channel Uploads</h4>
                  <p className="text-xs text-gray-500">{channelVideos.length} items</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Shorts Showcase</h4>
                  <p className="text-xs text-gray-500">{shortsVideos.length} items</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-800 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line leading-relaxed">
                {channelBio}
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Channel Stats
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pink-500" />
                  <span>Joined {isOwner ? currentUser?.joinedDate || 'Oct 2026' : 'March 2026'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-500" />
                  <span>{formatViews(totalViews)} total channel views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-500" />
                  <span>{channelVideos.length} total uploads</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Google Cloud Tier: Unlimited</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <span className="text-xs text-gray-500">{displayHandle}</span>
              <button
                onClick={handleShare}
                className="text-xs font-bold text-pink-600 dark:text-pink-400 hover:underline"
              >
                Share Channel Link
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              About {channelName}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {channelBio}
            </p>
            <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-neutral-800 pt-3">
              <p>Handle: {displayHandle}</p>
              <p>Total Views: {formatViews(totalViews)}</p>
              <p>Subscribers: {subscribersDisplay}</p>
            </div>
            <button
              onClick={() => setShowAboutModal(false)}
              className="mt-5 w-full py-2.5 rounded-full text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-black"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
