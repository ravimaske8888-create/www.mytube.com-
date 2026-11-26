import React, { useState } from 'react';
import {
  X,
  Edit3,
  Share2,
  Video,
  Film,
  Eye,
  Calendar,
  CheckCircle,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Settings,
  Sliders,
  Tv,
} from 'lucide-react';
import { VideoItem, UserProfile } from '../types';
import { formatViews, formatDuration, calculateChannelTotalViews } from '../utils/videoRules';

interface YourChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onOpenUpload: () => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onDeleteVideo?: (videoId: string) => void;
  language: 'en' | 'hi';
}

export const YourChannelModal: React.FC<YourChannelModalProps> = ({
  isOpen,
  onClose,
  user,
  videos,
  onSelectVideo,
  onOpenUpload,
  onUpdateUser,
  onDeleteVideo,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'videos' | 'shorts' | 'about'>('home');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit channel form state
  const [channelName, setChannelName] = useState(user?.name || 'mytube Creator');
  const [channelHandle, setChannelHandle] = useState(user?.handle || '@creator');
  const [channelBio, setChannelBio] = useState(
    user?.channelDescription || 'Welcome to my official mytube channel! Enjoy HD videos and daily Shorts.'
  );
  const [bannerGradient, setBannerGradient] = useState(
    user?.bannerGradient || 'from-pink-600 via-purple-600 to-indigo-700'
  );

  if (!isOpen) return null;

  // Filter videos belonging to this creator
  const userUploads = user
    ? videos.filter((v) => v.uploadedBy === user.id)
    : videos.filter((v) => v.uploadedBy && v.uploadedBy !== 'official');

  // Fallback to creator videos if user has not uploaded any yet so channel never looks empty
  const displayedVideos = userUploads.length > 0 ? userUploads : videos;

  const longVideos = displayedVideos.filter((v) => v.type === 'video');
  const shortVideos = displayedVideos.filter((v) => v.type === 'short');
  const featuredVideo = longVideos[0] || displayedVideos[0];
  const totalViews = displayedVideos.reduce((sum, v) => sum + (v.views || 0), 0);

  const handleSaveChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        name: channelName.trim(),
        handle: channelHandle.startsWith('@') ? channelHandle.trim() : `@${channelHandle.trim()}`,
        channelDescription: channelBio.trim(),
        bannerGradient,
      };
      onUpdateUser(updatedUser);
    }
    setIsEditing(false);
  };

  const handleShareChannel = () => {
    const channelUrl = `${window.location.origin}/channel/${(user?.handle || '@creator').replace('@', '')}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(channelUrl).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const gradients = [
    'from-pink-600 via-purple-600 to-indigo-700',
    'from-rose-500 via-pink-600 to-cyan-600',
    'from-indigo-600 via-cyan-600 to-teal-500',
    'from-neutral-900 via-purple-900 to-neutral-900',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0f0f10] text-gray-900 dark:text-white sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-screen sm:min-h-0 sm:max-h-[92vh]">
        {/* Sticky Header with Close */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 dark:bg-[#0f0f10]/95 backdrop-blur-sm border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-pink-600" />
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">
              Your Channel
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Close channel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Channel Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Channel Banner */}
          <div
            className={`w-full h-32 sm:h-48 bg-gradient-to-r ${bannerGradient} relative flex items-center justify-center overflow-hidden`}
          >
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[0.5px]" />
            <div className="relative z-10 flex flex-col items-center select-none opacity-85">
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-white/90 drop-shadow-md">
                {user?.name || 'mytube Creator'}
              </span>
              <span className="text-xs sm:text-sm font-medium text-white/75 tracking-widest mt-1">
                OFFICIAL CHANNEL • HD & SHORTS
              </span>
            </div>

            {/* Banner Theme Switcher on Hover */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm p-1 rounded-full">
              {gradients.map((grad) => (
                <button
                  key={grad}
                  onClick={() => setBannerGradient(grad)}
                  className={`w-4 h-4 rounded-full bg-gradient-to-r ${grad} border ${
                    bannerGradient === grad ? 'border-white scale-110' : 'border-transparent opacity-70'
                  }`}
                  title="Change banner gradient"
                />
              ))}
            </div>
          </div>

          {/* Channel Information Header */}
          <div className="px-4 sm:px-6 pt-4 pb-6 border-b border-gray-100 dark:border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              {/* Avatar + Identity */}
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white dark:border-neutral-900 shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center border-4 border-white dark:border-neutral-900 shadow-lg select-none">
                      {(user?.name || 'M').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 p-1 bg-pink-600 text-white rounded-full border-2 border-white dark:border-neutral-900 shadow-sm" title="Verified Creator">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold truncate text-gray-900 dark:text-white">
                      {user?.name || 'mytube Creator'}
                    </h1>
                  </div>

                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {user?.handle || '@creator'}
                  </p>

                  {/* Channel Stats Row: Subscribers, Videos, Total Views */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300 mt-1.5 font-medium">
                    <span>{formatViews(user?.subscribersCount || 1240).replace(' views', '')} subscribers</span>
                    <span>•</span>
                    <span>{displayedVideos.length} videos</span>
                    <span>•</span>
                    <span className="text-pink-600 dark:text-pink-400 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {formatViews(totalViews)}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 max-w-xl">
                    {user?.channelDescription || 'Welcome to my official mytube channel! Enjoy daily tech, tutorials, and short videos.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Customize Channel, Manage Videos, Share */}
              <div className="flex items-center gap-2 sm:self-center mt-2 sm:mt-0 flex-wrap">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-100 transition-colors"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Customize channel</span>
                </button>

                <button
                  onClick={onOpenUpload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-600 to-indigo-600 hover:opacity-95 text-white shadow-sm transition-all active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload</span>
                </button>

                <button
                  onClick={handleShareChannel}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 transition-colors"
                  title="Share channel link"
                  aria-label="Share channel"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Inline Customization Form */}
            {isEditing && (
              <form onSubmit={handleSaveChannel} className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/70 border border-gray-200 dark:border-neutral-700 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-pink-500" />
                  <span>Edit Channel Details</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Channel Name</label>
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:border-pink-500 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Channel Handle</label>
                    <input
                      type="text"
                      value={channelHandle}
                      onChange={(e) => setChannelHandle(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:border-pink-500 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Channel Bio</label>
                  <textarea
                    rows={2}
                    value={channelBio}
                    onChange={(e) => setChannelBio(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 rounded-lg outline-none focus:border-pink-500 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-pink-600 text-white hover:bg-pink-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* YouTube Navigation Tabs */}
          <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#0f0f10] sticky top-[53px] z-10 overflow-x-auto no-scrollbar">
            {[
              { id: 'home', label: 'Home' },
              { id: 'videos', label: 'Videos' },
              { id: 'shorts', label: 'Shorts' },
              { id: 'about', label: 'About' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-pink-600 text-pink-600 dark:border-pink-500 dark:text-pink-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {/* HOME TAB: Featured video + shelves */}
            {activeTab === 'home' && (
              <div className="space-y-6">
                {featuredVideo && (
                  <div
                    onClick={() => onSelectVideo(featuredVideo)}
                    className="cursor-pointer group flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200/70 dark:border-neutral-800 hover:shadow-md transition-all"
                  >
                    <div className="relative w-full md:w-72 aspect-video bg-neutral-950 rounded-xl overflow-hidden flex-shrink-0">
                      {featuredVideo.thumbnailUrl ? (
                        <img
                          src={featuredVideo.thumbnailUrl}
                          alt={featuredVideo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-pink-500/20 to-cyan-500/20">
                          <span className="text-xl font-bold text-pink-500">mytube</span>
                        </div>
                      )}
                      {featuredVideo.duration && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-[10px] text-white font-semibold rounded">
                          {featuredVideo.duration}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-bold tracking-wider text-pink-600 dark:text-pink-400 uppercase">
                          Featured Video
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mt-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                          {featuredVideo.title}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatViews(featuredVideo.views)} • {featuredVideo.timestamp}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {featuredVideo.description || 'Watch full HD playback with unlimited cloud storage on mytube.'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                          ▶ Play now
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Popular Shorts Shelf */}
                {shortVideos.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                        <Film className="w-4 h-4 text-pink-500" />
                        <span>Shorts</span>
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {shortVideos.map((short) => (
                        <div
                          key={short.id}
                          onClick={() => onSelectVideo(short)}
                          className="cursor-pointer group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 hover:scale-102 transition-transform duration-200"
                        >
                          <video
                            src={short.videoUrl}
                            muted
                            playsInline
                            className="w-full h-full object-cover pointer-events-none"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-2.5 flex flex-col justify-between">
                            <span className="self-end px-1.5 py-0.5 rounded bg-pink-600 text-[10px] text-white font-bold">
                              Short
                            </span>
                            <div>
                              <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                                {short.title}
                              </p>
                              <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1 font-medium">
                                <Eye className="w-3 h-3" />
                                <span>{formatViews(short.views)}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIDEOS TAB: Long Form Videos */}
            {activeTab === 'videos' && (
              <div>
                {longVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No videos uploaded yet</p>
                    <p className="text-xs text-gray-500 mt-1">Upload your first video to share with the world.</p>
                    <button
                      onClick={onOpenUpload}
                      className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-full text-xs font-bold shadow-md hover:bg-pink-700"
                    >
                      Upload Video
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {longVideos.map((video) => (
                      <div
                        key={video.id}
                        onClick={() => onSelectVideo(video)}
                        className="cursor-pointer group rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-all"
                      >
                        <div className="relative aspect-video bg-neutral-900">
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-white font-bold">
                              mytube
                            </div>
                          )}
                          {video.duration && (
                            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-[10px] text-white font-semibold rounded">
                              {video.duration}
                            </span>
                          )}
                        </div>
                        <div className="p-3">
                          <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-600 transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1 font-medium">
                            <Eye className="w-3 h-3 text-pink-500" />
                            <span>{formatViews(video.views)}</span>
                            <span>•</span>
                            <span>{video.timestamp}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SHORTS TAB */}
            {activeTab === 'shorts' && (
              <div>
                {shortVideos.length === 0 ? (
                  <div className="text-center py-12">
                    <Film className="w-12 h-12 text-gray-400 mx-auto mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">No shorts uploaded yet</p>
                    <p className="text-xs text-gray-500 mt-1">Record or upload vertical videos under 60 seconds.</p>
                    <button
                      onClick={onOpenUpload}
                      className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-full text-xs font-bold shadow-md hover:bg-pink-700"
                    >
                      Upload Short
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {shortVideos.map((short) => (
                      <div
                        key={short.id}
                        onClick={() => onSelectVideo(short)}
                        className="cursor-pointer group relative aspect-[9/16] rounded-xl overflow-hidden bg-neutral-900 hover:scale-102 transition-transform duration-200"
                      >
                        <video
                          src={short.videoUrl}
                          muted
                          playsInline
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 p-2.5 flex flex-col justify-between">
                          <span className="self-end px-1.5 py-0.5 rounded bg-pink-600 text-[10px] text-white font-bold">
                            Short
                          </span>
                          <div>
                            <p className="text-xs font-bold text-white line-clamp-2 leading-tight">
                              {short.title}
                            </p>
                            <p className="text-[10px] text-gray-300 mt-1 flex items-center gap-1 font-medium">
                              <Eye className="w-3 h-3" />
                              <span>{formatViews(short.views)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ABOUT TAB */}
            {activeTab === 'about' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                    {user?.channelDescription || 'Welcome to my official mytube channel! Enjoy daily tech, tutorials, and short videos.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Channel Statistics</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/60 dark:border-neutral-700/60">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Total Channel Views</p>
                      <p className="text-lg font-bold text-pink-600 dark:text-pink-400 mt-0.5">
                        {totalViews.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/60 dark:border-neutral-700/60">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Joined</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                        {user?.joinedDate || 'October 2026'}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200/60 dark:border-neutral-700/60">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">Cloud Storage</p>
                      <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                        Unlimited (Free)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Share2 className="w-4 h-4 text-pink-500" />
                    <span>Share Channel</span>
                  </div>
                  <button
                    onClick={handleShareChannel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied!' : 'Copy link'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
