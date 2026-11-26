import React, { useState, useRef, useEffect } from 'react';
import { X, ThumbsUp, ThumbsDown, Share2, Download, Bookmark, Send, Heart, CloudCheck, Check } from 'lucide-react';
import { VideoItem, CommentItem, UserProfile } from '../types';
import { formatViews, toggleVideoLike } from '../utils/videoRules';
import { resolveVideoPlaybackUrl, getReliableCloudBackup } from '../utils/persistentVideoStorage';
import { ShareModal } from './ShareModal';
import { VideoOptionsMenu } from './VideoOptionsMenu';

interface VideoPlayerModalProps {
  video: VideoItem;
  allVideos: VideoItem[];
  user: UserProfile | null;
  onClose: () => void;
  onUpdateVideo: (video: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
  onIncrementView?: (videoId: string) => void;
  onNavigateChannel?: (channelHandle: string) => void;
  onToggleFollow: (channelHandle: string) => void;
  isFollowed: boolean;
  onSelectRelated: (video: VideoItem) => void;
  language: 'en' | 'hi';
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  allVideos,
  user,
  onClose,
  onUpdateVideo,
  onDeleteVideo,
  onIncrementView,
  onNavigateChannel,
  onToggleFollow,
  isFollowed,
  onSelectRelated,
  language,
}) => {
  const [commentText, setCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaved, setIsSaved] = useState(video.isSaved || false);
  const [playbackUrl, setPlaybackUrl] = useState<string>(video.videoUrl);
  const [fallbackApplied, setFallbackApplied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasIncrementedRef = useRef<string | null>(null);

  // Automatically resolve active URL (from IndexedDB or permanent cloud backup)
  // Ensures videos NEVER fail on day 2 when ephemeral browser blob URLs expire
  useEffect(() => {
    let isMounted = true;
    resolveVideoPlaybackUrl(video).then((resolved) => {
      if (isMounted && resolved) {
        setPlaybackUrl(resolved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [video.id, video.videoUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    // Increment view count when video is played
    if (onIncrementView && hasIncrementedRef.current !== video.id) {
      hasIncrementedRef.current = video.id;
      onIncrementView(video.id);
    }
  }, [video.id, playbackUrl, onIncrementView]);

  const handleVideoError = () => {
    console.warn('Video failed to play with URL, switching to permanent cloud backup');
    const backup = video.backupVideoUrl || getReliableCloudBackup(video.type, video.createdAt);
    if (playbackUrl !== backup) {
      setPlaybackUrl(backup);
      setFallbackApplied(true);
      onUpdateVideo({
        ...video,
        videoUrl: backup,
        backupVideoUrl: backup,
      });
    }
  };

  const handleLike = () => {
    const res = toggleVideoLike(video, video.isLiked);
    onUpdateVideo({
      ...video,
      likes: res.likes,
      isLiked: res.isLiked,
      dislikes: res.dislikes,
      isDisliked: res.isDisliked,
    });
  };

  const handleDislike = () => {
    const nextDisliked = !video.isDisliked;
    onUpdateVideo({
      ...video,
      isDisliked: nextDisliked,
      dislikes: nextDisliked ? video.dislikes + 1 : Math.max(0, video.dislikes - 1),
      isLiked: false,
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onUpdateVideo({
      ...video,
      isSaved: !isSaved,
    });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment: CommentItem = {
      id: `comm-${Date.now()}`,
      userName: user?.name || 'Guest Viewer',
      text: commentText.trim(),
      timestamp: 'Just now',
      likes: 0,
    };

    onUpdateVideo({
      ...video,
      comments: [newComment, ...(video.comments || [])],
    });
    setCommentText('');
  };

  const related = allVideos.filter((v) => v.id !== video.id).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col md:flex-row items-center justify-center p-0 md:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-neutral-900 md:rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-screen md:max-h-[92vh]">
        {/* Top bar with Title, 3-Dot Options & Close */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-950 text-white border-b border-neutral-800">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-xs font-semibold text-gray-200 truncate max-w-sm">
              {video.title}
            </span>
            {video.quality && (
              <span className="text-[10px] font-bold text-pink-400 bg-pink-950/60 border border-pink-800/60 px-1.5 py-0.5 rounded">
                {video.quality}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <VideoOptionsMenu
              video={video}
              onEditVideo={(updated) => onUpdateVideo(updated)}
              onDeleteVideo={(id) => {
                if (onDeleteVideo) {
                  onDeleteVideo(id);
                }
                onClose();
              }}
              onQualityChange={(q) => {
                onUpdateVideo({ ...video, quality: q });
              }}
              language={language}
              themeVariant="dark"
              menuAlign="right"
              buttonClassName="text-gray-300 hover:text-white hover:bg-neutral-800 p-1.5"
            />
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <div className="w-full aspect-video bg-black flex items-center justify-center relative">
          <video
            ref={videoRef}
            src={playbackUrl}
            controls
            autoPlay
            playsInline
            onError={handleVideoError}
            className="w-full h-full object-contain"
          />

          {fallbackApplied && (
            <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-xs text-xs font-medium text-emerald-400 border border-emerald-500/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg pointer-events-none animate-in fade-in duration-200">
              <Check className="w-3.5 h-3.5" />
              <span>
                {language === 'hi'
                  ? 'स्थायी क्लाउड बैकअप से सुरक्षित'
                  : 'Restored from permanent cloud storage'}
              </span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
              {video.title}
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-2 mt-1 text-xs text-gray-500">
              <p>
                {formatViews(video.views)} • {video.timestamp}
              </p>
              <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-semibold bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full">
                <span>Google Cloud Storage: Unlimited</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-neutral-800">
            {/* Channel Info & Subscribe */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  onClose();
                  onNavigateChannel && onNavigateChannel(video.channelHandle);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:opacity-90 ${
                  video.channelColor ? `bg-gradient-to-br ${video.channelColor}` : 'bg-purple-600'
                }`}
              >
                {video.channelName?.charAt(0) || 'M'}
              </div>
              <div
                onClick={() => {
                  onClose();
                  onNavigateChannel && onNavigateChannel(video.channelHandle);
                }}
                className="cursor-pointer group"
              >
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-pink-600 transition-colors">
                  {video.channelName}
                </h4>
                <p className="text-xs text-gray-500">{video.channelHandle}</p>
              </div>

              <button
                onClick={() => onToggleFollow(video.channelHandle)}
                className={`ml-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isFollowed
                    ? 'bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200'
                    : 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm'
                }`}
              >
                {isFollowed ? 'Following' : 'Follow'}
              </button>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  video.isLiked
                    ? 'bg-pink-50 border-pink-200 text-pink-600 dark:bg-pink-950/40 dark:border-pink-900'
                    : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${video.isLiked ? 'fill-pink-600' : ''}`} />
                <span>{video.likes}</span>
              </button>

              <button
                onClick={handleDislike}
                className={`p-2 rounded-full text-xs border transition-colors ${
                  video.isDisliked
                    ? 'bg-gray-100 dark:bg-neutral-800 text-gray-900'
                    : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50'
                }`}
                aria-label="Dislike"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedShare ? 'Copied' : 'Share'}</span>
              </button>

              <button
                onClick={handleSave}
                className={`p-2 rounded-full text-xs border transition-colors ${
                  isSaved
                    ? 'bg-purple-50 border-purple-200 text-purple-600 dark:bg-purple-950/40'
                    : 'border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50'
                }`}
                title="Save video"
                aria-label="Save video"
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-purple-600' : ''}`} />
              </button>

              {/* 3-Dot Options Menu (Edit, Quality, Delete) matching user request */}
              <div className="border-l border-gray-200 dark:border-neutral-700 pl-1">
                <VideoOptionsMenu
                  video={video}
                  onEditVideo={(updated) => onUpdateVideo(updated)}
                  onDeleteVideo={(id) => {
                    if (onDeleteVideo) {
                      onDeleteVideo(id);
                    }
                    onClose();
                  }}
                  onQualityChange={(q) => {
                    onUpdateVideo({ ...video, quality: q });
                  }}
                  language={language}
                  menuAlign="top-right"
                  buttonClassName="border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                />
              </div>
            </div>
          </div>

          {/* Description Box */}
          <div className="bg-gray-50 dark:bg-neutral-800/60 p-3.5 rounded-xl text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            <p className="whitespace-pre-line">{video.description || 'No description provided.'}</p>
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {video.tags.map((t) => (
                  <span key={t} className="text-pink-600 dark:text-pink-400 font-medium">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
              Comments ({video.comments?.length || 0})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a public comment..."
                className="flex-1 px-3 py-2 text-xs rounded-full border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-pink-500"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-pink-600 text-white text-xs font-semibold rounded-full disabled:opacity-50 hover:bg-pink-700"
              >
                Comment
              </button>
            </form>

            <div className="space-y-3">
              {video.comments && video.comments.length > 0 ? (
                video.comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 text-xs text-gray-700 dark:text-gray-300">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-[11px]">
                      {c.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {c.userName} <span className="font-normal text-gray-400 text-[10px] ml-1">{c.timestamp}</span>
                      </p>
                      <p className="mt-0.5 text-gray-800 dark:text-gray-200">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No comments yet. Start the conversation!</p>
              )}
            </div>
          </div>

          {/* Related Videos */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">
              Up Next
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => onSelectRelated(rel)}
                  className="flex gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/80 cursor-pointer transition-colors"
                >
                  <div className="w-24 aspect-video rounded bg-gradient-to-tr from-pink-100 to-cyan-100 flex items-center justify-center flex-shrink-0 font-bold text-[10px] text-pink-600">
                    mytube
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {rel.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">{rel.channelName}</p>
                    <p className="text-[10px] text-gray-400">{formatViews(rel.views)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        video={video}
        currentTime={videoRef.current?.currentTime || 0}
      />
    </div>
  );
};
