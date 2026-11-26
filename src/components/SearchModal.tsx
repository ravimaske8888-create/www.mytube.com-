import React, { useState } from 'react';
import { Search, X, Play, Sparkles } from 'lucide-react';
import { VideoItem } from '../types';
import { formatViews } from '../utils/videoRules';

interface SearchModalProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onClose: () => void;
  language: 'en' | 'hi';
}

export const SearchModal: React.FC<SearchModalProps> = ({
  videos,
  onSelectVideo,
  onClose,
  language,
}) => {
  const [query, setQuery] = useState('');

  const searchResults = query.trim()
    ? videos.filter(
        (v) =>
          v.title.toLowerCase().includes(query.toLowerCase()) ||
          v.channelName.toLowerCase().includes(query.toLowerCase()) ||
          v.description.toLowerCase().includes(query.toLowerCase()) ||
          v.tags?.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const trendingTags = ['#Shorts', '#Tutorial', '#Tech', '#Trending', '#CloudStorage', '#Music'];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center p-4 pt-12 md:pt-20">
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in slide-in-from-top-4 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === 'hi' ? 'mytube par khojein...' : 'Search on mytube...'}
            className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Trending tags */}
        {!query && (
          <div className="mt-5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Trending Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {trendingTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag.replace('#', ''))}
                  className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-pink-50 hover:text-pink-600 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {query && (
          <div className="mt-4 max-h-80 overflow-y-auto space-y-2">
            <p className="text-xs text-gray-400 px-1">
              Found {searchResults.length} videos matching "{query}"
            </p>
            {searchResults.map((video) => (
              <div
                key={video.id}
                onClick={() => {
                  onSelectVideo(video);
                  onClose();
                }}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-neutral-800/80 cursor-pointer transition-colors"
              >
                <div className="w-20 aspect-video rounded-lg bg-gradient-to-tr from-pink-100 to-cyan-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-pink-600">
                  <Play className="w-4 h-4 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                    {video.title}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {video.channelName} • {formatViews(video.views)}
                  </p>
                </div>
              </div>
            ))}
            {searchResults.length === 0 && (
              <p className="text-center py-8 text-xs text-gray-400">
                Koi video nahi mila. Doosra keyword try karein.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
