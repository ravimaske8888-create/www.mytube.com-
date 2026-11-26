import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Heart, MessageSquare, Share2, Volume2, VolumeX, Send, X, Play, Pause, Eye } from 'lucide-react';
import { VideoItem, CommentItem } from '../types';
import { toggleVideoLike, formatViews } from '../utils/videoRules';
import { getReliableCloudBackup } from '../utils/persistentVideoStorage';
import { ShareModal } from './ShareModal';
import { VideoOptionsMenu } from './VideoOptionsMenu';

interface ShortsScreenProps {
  shorts: VideoItem[];
  onUpdateShort: (short: VideoItem) => void;
  onDeleteShort?: (shortId: string) => void;
  language: 'en' | 'hi';
}

export const ShortsScreen: React.FC<ShortsScreenProps> = ({
  shorts,
  onUpdateShort,
  onDeleteShort,
  language,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [playingStates, setPlayingStates] = useState<Record<number, boolean>>({});
  const [showPlayIcon, setShowPlayIcon] = useState<{ index: number; isPlaying: boolean } | null>(null);
  const [heartAnim, setHeartAnim] = useState<{ x: number; y: number; id: number } | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastTapRef = useRef<number>(0);
  const isScrollingRef = useRef(false);
  const viewedShortsRef = useRef<Set<string>>(new Set());

  // Keep activeIndex in bounds after deleting a short
  useEffect(() => {
    if (shorts.length > 0 && activeIndex >= shorts.length) {
      setActiveIndex(shorts.length - 1);
    }
  }, [shorts.length, activeIndex]);

  // Increment view count when a short is viewed (YouTube view registration)
  useEffect(() => {
    const currentShort = shorts[activeIndex];
    if (currentShort && !viewedShortsRef.current.has(currentShort.id)) {
      viewedShortsRef.current.add(currentShort.id);
      const timer = setTimeout(() => {
        onUpdateShort({
          ...currentShort,
          views: (currentShort.views || 0) + 1,
        });
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [activeIndex, shorts, onUpdateShort]);

  // Auto-play the active video and pause all other videos
  useEffect(() => {
    videoRefs.current.forEach((videoEl, idx) => {
      if (!videoEl) return;
      if (idx === activeIndex) {
        videoEl.currentTime = 0;
        videoEl.play().then(() => {
          setPlayingStates((prev) => ({ ...prev, [idx]: true }));
        }).catch(() => {
          setPlayingStates((prev) => ({ ...prev, [idx]: false }));
        });
      } else {
        videoEl.pause();
        setPlayingStates((prev) => ({ ...prev, [idx]: false }));
      }
    });
  }, [activeIndex]);

  // Track active slide on scroll using IntersectionObserver or scroll position
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const height = container.clientHeight;
    if (height <= 0) return;

    const scrollTop = container.scrollTop;
    const newIndex = Math.round(scrollTop / height);

    if (newIndex !== activeIndex && newIndex >= 0 && newIndex < shorts.length) {
      setActiveIndex(newIndex);
    }
  }, [activeIndex, shorts.length]);

  // Wheel listener for smooth TikTok desktop / trackpad scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 30) return;
      if (isScrollingRef.current) return;

      isScrollingRef.current = true;
      if (e.deltaY > 0 && activeIndex < shorts.length - 1) {
        // Scroll down to next short
        const nextIdx = activeIndex + 1;
        container.scrollTo({ top: nextIdx * container.clientHeight, behavior: 'smooth' });
      } else if (e.deltaY < 0 && activeIndex > 0) {
        // Scroll up to prev short
        const prevIdx = activeIndex - 1;
        container.scrollTo({ top: prevIdx * container.clientHeight, behavior: 'smooth' });
      }

      setTimeout(() => {
        isScrollingRef.current = false;
      }, 400);
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [activeIndex, shorts.length]);

  // Keyboard navigation (ArrowUp, ArrowDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) return;

      if (e.key === 'ArrowDown' && activeIndex < shorts.length - 1) {
        e.preventDefault();
        container.scrollTo({ top: (activeIndex + 1) * container.clientHeight, behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' && activeIndex > 0) {
        e.preventDefault();
        container.scrollTo({ top: (activeIndex - 1) * container.clientHeight, behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, shorts.length]);

  // Video tap handler (single tap = play/pause, double tap = like)
  const handleVideoTap = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    const short = shorts[index];

    if (timeSinceLastTap < 280) {
      // Double tap -> Like animation
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setHeartAnim({ x, y, id: now });
      setTimeout(() => setHeartAnim(null), 800);

      if (short && !short.isLiked) {
        handleLike(index);
      }
      lastTapRef.current = 0;
      return;
    }

    lastTapRef.current = now;

    // Single tap -> Play / Pause
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) {
      video.play();
      setPlayingStates((prev) => ({ ...prev, [index]: true }));
      setShowPlayIcon({ index, isPlaying: true });
    } else {
      video.pause();
      setPlayingStates((prev) => ({ ...prev, [index]: false }));
      setShowPlayIcon({ index, isPlaying: false });
    }

    setTimeout(() => {
      setShowPlayIcon(null);
    }, 500);
  };

  const handleLike = (index: number) => {
    const short = shorts[index];
    if (!short) return;
    const result = toggleVideoLike(short, short.isLiked);
    onUpdateShort({
      ...short,
      likes: result.likes,
      isLiked: result.isLiked,
      dislikes: result.dislikes,
      isDisliked: result.isDisliked,
    });
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const activeShort = shorts[activeIndex];
    if (!newCommentText.trim() || !activeShort) return;

    const newComment: CommentItem = {
      id: `comm-${Date.now()}`,
      userName: 'You',
      text: newCommentText.trim(),
      timestamp: 'Just now',
      likes: 0,
    };

    onUpdateShort({
      ...activeShort,
      comments: [newComment, ...(activeShort.comments || [])],
    });
    setNewCommentText('');
  };

  if (!shorts || shorts.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)] bg-black text-white">
        <p>No shorts available.</p>
      </div>
    );
  }

  const currentShort = shorts[activeIndex] || shorts[0];

  return (
    <div className="relative w-full h-[calc(100vh-125px)] bg-black flex items-center justify-center overflow-hidden select-none">
      {/* TikTok Style Vertical Finger Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full max-w-md h-full overflow-y-scroll snap-y snap-mandatory no-scrollbar relative scroll-smooth touch-pan-y"
        style={{ scrollSnapType: 'y mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {shorts.map((short, index) => {
          const isActive = index === activeIndex;
          const isVideoPlaying = playingStates[index] ?? true;

          return (
            <div
              key={short.id}
              className="h-full w-full snap-start snap-always relative shrink-0 overflow-hidden flex items-center justify-center bg-black cursor-pointer"
              onClick={(e) => handleVideoTap(index, e)}
            >
              {/* Short Video Element */}
              <video
                ref={(el) => {
                  videoRefs.current[index] = el;
                }}
                src={short.videoUrl}
                loop
                playsInline
                muted={isMuted}
                autoPlay={isActive}
                preload="metadata"
                className="w-full h-full object-cover pointer-events-none"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = short.backupVideoUrl || getReliableCloudBackup('short', short.createdAt);
                  if (target.src !== fallback) {
                    target.src = fallback;
                    target.load();
                    if (isActive) target.play().catch(() => {});
                  }
                }}
              />

              {/* Watermark / Brand Logo background placeholder */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <span
                  className="text-4xl font-extrabold tracking-wider opacity-25 select-none"
                  style={{
                    background:
                      'linear-gradient(90deg, #ba1766 0%, #9c2486 20%, #663090 40%, #4949a0 60%, #367db6 80%, #20b1bf 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                  }}
                >
                  mytube
                </span>
              </div>

              {/* Animated Play / Pause Icon Feedback on Tap */}
              {showPlayIcon && showPlayIcon.index === index && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white animate-out fade-out zoom-out duration-300">
                    {showPlayIcon.isPlaying ? (
                      <Play className="w-8 h-8 fill-white ml-1" />
                    ) : (
                      <Pause className="w-8 h-8 fill-white" />
                    )}
                  </div>
                </div>
              )}

              {/* Double-tap Floating Heart Animation */}
              {heartAnim && (
                <div
                  key={heartAnim.id}
                  className="absolute pointer-events-none z-30 transform -translate-x-1/2 -translate-y-1/2 animate-bounce"
                  style={{ left: heartAnim.x, top: heartAnim.y }}
                >
                  <Heart className="w-20 h-20 fill-pink-500 text-pink-500 drop-shadow-[0_4px_12px_rgba(236,72,153,0.8)] scale-125 transition-transform" />
                </div>
              )}

              {/* Right-Side Action Bar matching Screenshot 7 (Clean, without up/down buttons) */}
              <div className="absolute right-3.5 bottom-16 z-20 flex flex-col items-center gap-5 text-white pointer-events-auto">
                {/* Like Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(index);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                  aria-label="Like short"
                >
                  <div
                    className={`p-2.5 rounded-full backdrop-blur-xs transition-colors ${
                      short.isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'
                    }`}
                  >
                    <Heart
                      className={`w-7 h-7 stroke-[2.2] ${short.isLiked ? 'fill-pink-500' : ''}`}
                    />
                  </div>
                  <span className="text-xs font-semibold mt-0.5">
                    {short.likes > 0 ? short.likes : 'Like'}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowComments(true);
                  }}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                  aria-label="Comment on short"
                >
                  <div className="p-2.5 rounded-full backdrop-blur-xs text-white">
                    <MessageSquare className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-semibold mt-0.5">
                    {short.comments?.length || 'Comment'}
                  </span>
                </button>

                {/* Views Counter (YouTube style) */}
                <div
                  className="flex flex-col items-center select-none text-white/90"
                  title={`${short.views || 0} total views`}
                >
                  <div className="p-2.5 rounded-full backdrop-blur-xs text-white">
                    <Eye className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-semibold mt-0.5">
                    {formatViews(short.views || 0).replace(' views', '')}
                  </span>
                </div>

                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                  aria-label="Share short"
                >
                  <div className="p-2.5 rounded-full backdrop-blur-xs text-white">
                    <Share2 className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <span className="text-xs font-semibold mt-0.5">
                    {copiedShare ? 'Copied!' : 'Share'}
                  </span>
                </button>

                {/* 3-Dot Options Button (Edit, Delete, Quality) for Shorts */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex flex-col items-center"
                >
                  <VideoOptionsMenu
                    video={short}
                    onEditVideo={(updated) => onUpdateShort(updated)}
                    onDeleteVideo={onDeleteShort}
                    onQualityChange={(q) => {
                      onUpdateShort({ ...short, quality: q });
                    }}
                    language={language}
                    themeVariant="dark"
                    menuAlign="top-right"
                    buttonClassName="p-2 rounded-full backdrop-blur-xs text-white hover:bg-white/20 active:scale-95"
                    iconSize={24}
                  />
                  <span className="text-[11px] font-semibold mt-0.5">
                    {language === 'hi' ? 'विकल्प' : 'More'}
                  </span>
                </div>
              </div>

              {/* Bottom Left Channel Handle & Title matching Screenshot 7 */}
              <div className="absolute left-4 bottom-16 right-20 z-20 text-white text-left pointer-events-auto">
                <p className="font-bold text-sm tracking-tight drop-shadow-md hover:underline cursor-pointer flex items-center gap-2">
                  <span>{short.channelHandle || '@creatorhub'}</span>
                  <span className="text-[11px] font-normal text-white/85">
                    • {formatViews(short.views || 0)}
                  </span>
                </p>
                <p className="text-xs sm:text-sm text-gray-100 font-normal mt-1 leading-snug line-clamp-2 drop-shadow-md">
                  {short.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Left Global Sound Toggle */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-all"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Comments Drawer Modal */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 max-w-md mx-auto z-40 bg-neutral-900 border-t border-neutral-800 rounded-t-2xl p-4 shadow-2xl flex flex-col max-h-[65vh] animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <h3 className="font-bold text-white text-sm">
              Comments ({currentShort.comments?.length || 0})
            </h3>
            <button
              onClick={() => setShowComments(false)}
              className="text-gray-400 hover:text-white p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3">
            {currentShort.comments && currentShort.comments.length > 0 ? (
              currentShort.comments.map((comm) => (
                <div key={comm.id} className="flex gap-2.5 text-xs text-gray-200">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                    {comm.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-300">
                      {comm.userName}{' '}
                      <span className="text-[10px] text-gray-500 font-normal">
                        {comm.timestamp}
                      </span>
                    </p>
                    <p className="text-gray-100 mt-0.5">{comm.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-gray-400 py-6">Be the first to comment!</p>
            )}
          </div>

          <form onSubmit={handleAddComment} className="pt-2 border-t border-neutral-800 flex gap-2">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-neutral-800 text-white text-xs px-3 py-2 rounded-full outline-none focus:ring-1 focus:ring-pink-500"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim()}
              className="px-3 py-2 bg-pink-600 disabled:opacity-50 text-white text-xs font-semibold rounded-full flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* YouTube Style Share Bottom Sheet / Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        video={currentShort}
      />
    </div>
  );
};
