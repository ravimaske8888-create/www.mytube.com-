import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { VideoItem } from '../types';
import { filterVideos, formatViews } from '../utils/videoRules';
import { VideoOptionsMenu } from './VideoOptionsMenu';

interface HomeScreenProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onNavigateChannel?: (channelHandle: string) => void;
  onEditVideo?: (updated: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
  language: 'en' | 'hi';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  videos,
  onSelectVideo,
  onNavigateChannel,
  onEditVideo,
  onDeleteVideo,
  language,
}) => {
  const displayedVideos = filterVideos(videos, 'video', '');

  return (
    <div className="pb-24 pt-2 px-3 max-w-3xl mx-auto">
      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white px-1 mb-3">
        Home
      </h1>

      {/* Video Feed */}
      <div className="space-y-6 mt-1">
        {displayedVideos.map((video) => {
          const avatarInitial = video.channelName ? video.channelName.charAt(0).toUpperCase() : 'M';

          return (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="cursor-pointer group rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800/80 hover:shadow-md transition-all duration-200"
            >
              {/* Thumbnail Container matching exact pastel card with "mytube" */}
              <div className="relative w-full aspect-video bg-gradient-to-tr from-[#ffe4e6] via-[#f5f3ff] to-[#e0f2fe] flex items-center justify-center overflow-hidden">
                {video.thumbnailUrl ? (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  /* Stylized screenshot mockup banner with soft gradient & brand mark */
                  <div className="flex flex-col items-center justify-center p-6 text-center select-none group-hover:scale-105 transition-transform duration-300">
                    <span
                      className="text-3xl sm:text-4xl font-bold tracking-tight opacity-90 drop-shadow-xs select-none"
                      style={{
                        background:
                          'linear-gradient(90deg, #ba1766 0%, #9c2486 20%, #663090 40%, #4949a0 60%, #367db6 80%, #20b1bf 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
                        letterSpacing: '-0.03em',
                      }}
                    >
                      mytube
                    </span>
                    <span className="text-xs text-gray-400 mt-1 font-medium tracking-wide">
                      HD VIDEO PLAYBACK
                    </span>
                  </div>
                )}

                {/* Duration Badge */}
                {video.duration && (
                  <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 text-[11px] font-semibold bg-black/80 text-white rounded backdrop-blur-xs">
                    {video.duration}
                  </span>
                )}

                {/* Play Hover Overlay */}
                <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-pink-500/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Video Meta Row matching Screenshot 2 */}
              <div className="flex items-start gap-3 p-3 sm:p-4">
                {/* Channel Avatar */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateChannel && onNavigateChannel(video.channelHandle);
                  }}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm cursor-pointer hover:opacity-90 ${
                    video.channelColor
                      ? `bg-gradient-to-br ${video.channelColor}`
                      : 'bg-purple-600'
                  }`}
                >
                  {avatarInitial}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug group-hover:text-pink-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 mt-1 truncate">
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateChannel && onNavigateChannel(video.channelHandle);
                      }}
                      className="hover:underline hover:text-gray-900 dark:hover:text-white"
                    >
                      {video.channelName}
                    </span>{' '}
                    • {formatViews(video.views)} • {video.timestamp}
                  </p>
                </div>

                {/* 3-Dot Options Button (Edit, Delete, Quality) */}
                <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0 -mr-1">
                  <VideoOptionsMenu
                    video={video}
                    onEditVideo={onEditVideo}
                    onDeleteVideo={onDeleteVideo}
                    language={language}
                    menuAlign="right"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {displayedVideos.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No videos found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};
