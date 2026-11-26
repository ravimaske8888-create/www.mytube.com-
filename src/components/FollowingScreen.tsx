import React from 'react';
import { UserPlus, Check, Play } from 'lucide-react';
import { VideoItem, ChannelItem } from '../types';
import { formatViews } from '../utils/videoRules';

interface FollowingScreenProps {
  channels: ChannelItem[];
  videos: VideoItem[];
  onToggleFollowChannel: (channelId: string) => void;
  onSelectVideo: (video: VideoItem) => void;
  language: 'en' | 'hi';
}

export const FollowingScreen: React.FC<FollowingScreenProps> = ({
  channels,
  videos,
  onToggleFollowChannel,
  onSelectVideo,
  language,
}) => {
  const followedChannels = channels.filter((c) => c.isFollowed);
  const followedHandles = new Set(followedChannels.map((c) => c.handle.toLowerCase()));
  const followedVideos = videos.filter((v) => followedHandles.has(v.channelHandle.toLowerCase()));

  return (
    <div className="pb-24 pt-2 px-4 max-w-2xl mx-auto">
      {/* Title matching Screenshot 4 */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Following
      </h1>

      {followedChannels.length === 0 ? (
        /* Empty State matching Screenshot 4 exactly */
        <div className="flex flex-col items-center justify-center text-center py-12 px-4">
          {/* User outline graphic matching Screenshot 4 */}
          <div className="w-20 h-20 mb-6 flex items-center justify-center text-gray-300 dark:text-neutral-700">
            <svg
              className="w-16 h-16 stroke-current fill-none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <p className="text-sm sm:text-base font-normal text-gray-600 dark:text-gray-300 max-w-sm leading-relaxed">
            {language === 'hi'
              ? 'Aap abhi tak kisi channel ko follow nahi karte.'
              : 'You are not following any channels yet.'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
            {language === 'hi'
              ? 'Videos dekh kar channels follow karo.'
              : 'Watch videos and follow channels.'}
          </p>

          {/* Quick recommendations so user can interact and follow */}
          <div className="w-full mt-10 text-left border-t border-gray-100 dark:border-neutral-800 pt-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              {language === 'hi' ? 'Sujhav diye gaye channels' : 'Recommended Creators'}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {channels.map((chan) => (
                <div
                  key={chan.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full ${chan.avatarColor} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}
                    >
                      {chan.avatarLetter}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {chan.name}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{chan.subscribers}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleFollowChannel(chan.id)}
                    className="ml-2 px-3 py-1 text-xs font-semibold rounded-full bg-pink-500 text-white hover:bg-pink-600 active:scale-95 transition-all flex items-center gap-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Follow</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Active followed feed */
        <div className="space-y-6">
          {/* Followed Creators Row */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Followed Channels ({followedChannels.length})
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {followedChannels.map((chan) => (
                <div
                  key={chan.id}
                  className="flex flex-col items-center gap-1 min-w-[70px] text-center"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${chan.avatarColor} text-white font-bold text-base flex items-center justify-center ring-2 ring-pink-500 shadow-xs`}
                  >
                    {chan.avatarLetter}
                  </div>
                  <span className="text-[11px] font-medium text-gray-800 dark:text-gray-200 truncate max-w-[70px]">
                    {chan.name}
                  </span>
                  <button
                    onClick={() => onToggleFollowChannel(chan.id)}
                    className="text-[10px] text-gray-400 hover:text-red-500"
                  >
                    Unfollow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Videos from followed channels */}
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Latest from your creators
            </h2>
            {followedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="flex gap-3 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 cursor-pointer hover:shadow-sm transition-all"
              >
                <div className="w-32 aspect-video rounded-lg overflow-hidden bg-gradient-to-tr from-pink-100 to-cyan-100 flex items-center justify-center flex-shrink-0 relative">
                  <span className="text-xs font-bold text-pink-600">mytube</span>
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 fill-white text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-1">{video.channelName}</p>
                  <p className="text-[10px] text-gray-400">
                    {formatViews(video.views)} • {video.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
