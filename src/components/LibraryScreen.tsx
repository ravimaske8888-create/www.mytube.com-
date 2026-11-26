import React, { useState } from 'react';
import { Upload, Play, Clock, ThumbsUp, CloudCheck, Tv } from 'lucide-react';
import { VideoItem, TabType } from '../types';
import { formatViews } from '../utils/videoRules';
import { VideoOptionsMenu } from './VideoOptionsMenu';

interface LibraryScreenProps {
  userVideos: VideoItem[];
  historyVideos: VideoItem[];
  likedVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenYourChannel?: () => void;
  onEditVideo?: (updated: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
  language: 'en' | 'hi';
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  userVideos,
  historyVideos,
  likedVideos,
  onSelectVideo,
  onNavigateTab,
  onOpenYourChannel,
  onEditVideo,
  onDeleteVideo,
  language,
}) => {
  const [filter, setFilter] = useState<'all' | 'video' | 'short'>('all');

  const filteredUserVideos = userVideos.filter((v) => {
    if (filter === 'all') return true;
    return v.type === filter;
  });

  const hasAnyUploads = userVideos.length > 0;

  return (
    <div className="pb-24 pt-2 px-4 max-w-2xl mx-auto">
      {/* Title with Your Channel button matching YouTube */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Library
        </h1>
        {onOpenYourChannel && (
          <button
            onClick={onOpenYourChannel}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/40 border border-pink-200 dark:border-pink-900/50 transition-colors"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'आपका चैनल' : 'Your channel'}</span>
          </button>
        )}
      </div>

      {/* Filter Buttons matching Screenshot 5 */}
      <div className="flex items-center gap-2 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>

        <button
          onClick={() => setFilter('video')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === 'video'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50'
          }`}
        >
          Videos
        </button>

        <button
          onClick={() => setFilter('short')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
            filter === 'short'
              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
              : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50'
          }`}
        >
          Shorts
        </button>
      </div>

      {!hasAnyUploads ? (
        /* Empty State matching Screenshot 5 */
        <div className="flex flex-col items-center justify-center text-center py-16 px-4">
          {/* Outline Video Play Icon matching Screenshot 5 */}
          <div className="w-20 h-20 mb-6 flex items-center justify-center text-rose-200 dark:text-neutral-700">
            <svg
              className="w-16 h-16 stroke-current fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="4" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>

          <p className="text-sm sm:text-base font-normal text-gray-700 dark:text-gray-300 max-w-sm">
            {language === 'hi'
              ? 'Abhi tak koi upload nahi hai.'
              : 'No uploads yet.'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            {language === 'hi'
              ? 'Upload tab se apna pehla video daalein!'
              : 'Upload your first video from the Upload tab!'}
          </p>

          <button
            onClick={() => onNavigateTab('upload')}
            className="mt-6 inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-md shadow-pink-500/20 hover:opacity-95"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'अपलोड टैब पर जाएं' : 'Go to Upload Tab'}</span>
          </button>
        </div>
      ) : (
        /* User Uploads Feed */
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Your Cloud Uploads ({filteredUserVideos.length})
              </h2>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                Google Cloud Storage: Unlimited
              </span>
            </div>

            <div className="grid gap-3">
              {filteredUserVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => onSelectVideo(video)}
                  className="flex gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 cursor-pointer hover:shadow-sm transition-all"
                >
                  <div className="w-32 aspect-video rounded-lg overflow-hidden bg-gradient-to-tr from-pink-100 via-purple-50 to-cyan-100 flex items-center justify-center flex-shrink-0 relative">
                    <span className="text-xs font-bold text-pink-600">mytube</span>
                    {video.duration && (
                      <span className="absolute bottom-1 right-1 text-[9px] bg-black/80 text-white px-1 rounded">
                        {video.duration}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {video.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {video.type === 'short' ? 'Short' : 'Long Video'} • {formatViews(video.views)}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-medium text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full">
                      Google Cloud Synced ({video.storageSizeMb || 25} MB)
                    </span>
                  </div>

                  {/* 3-Dot Options for uploaded video */}
                  <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0 self-start">
                    <VideoOptionsMenu
                      video={video}
                      onEditVideo={onEditVideo}
                      onDeleteVideo={onDeleteVideo}
                      language={language}
                      menuAlign="right"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History and Liked Sections */}
      {historyVideos.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            <Clock className="w-3.5 h-3.5" />
            <span>Watch History</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {historyVideos.slice(0, 4).map((v) => (
              <div
                key={v.id}
                onClick={() => onSelectVideo(v)}
                className="cursor-pointer group"
              >
                <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-tr from-purple-100 to-pink-100 flex items-center justify-center">
                  <Play className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
                  {v.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
