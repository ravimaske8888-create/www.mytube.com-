import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  MoreVertical,
  Pencil,
  Trash2,
  Sliders,
  Check,
  X,
  AlertTriangle,
  Sparkles,
  Film,
  Smartphone,
  Save,
} from 'lucide-react';
import { VideoItem, VideoType } from '../types';
import { VIDEO_QUALITIES, VideoQuality } from '../utils/videoRules';

interface VideoOptionsMenuProps {
  video: VideoItem;
  onEditVideo?: (updated: VideoItem) => void;
  onDeleteVideo?: (videoId: string) => void;
  onQualityChange?: (quality: VideoQuality) => void;
  currentQuality?: string;
  language?: 'en' | 'hi';
  buttonClassName?: string;
  iconSize?: number;
  menuAlign?: 'left' | 'right' | 'top-right' | 'bottom-right';
  themeVariant?: 'dark' | 'light' | 'auto';
  label?: string;
}

export const VideoOptionsMenu: React.FC<VideoOptionsMenuProps> = ({
  video,
  onEditVideo,
  onDeleteVideo,
  onQualityChange,
  currentQuality = video.quality || 'Auto',
  language = 'en',
  buttonClassName = '',
  iconSize = 18,
  menuAlign = 'right',
  themeVariant = 'auto',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [qualityToast, setQualityToast] = useState<string | null>(null);

  // Form states for Edit modal
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description || '');
  const [tagsString, setTagsString] = useState((video.tags || []).join(', '));
  const [videoType, setVideoType] = useState<VideoType>(video.type);
  const [activeQuality, setActiveQuality] = useState<string>(currentQuality);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Keep state synced with video prop changes
  useEffect(() => {
    setTitle(video.title);
    setDescription(video.description || '');
    setTagsString((video.tags || []).join(', '));
    setVideoType(video.type);
    if (video.quality) {
      setActiveQuality(video.quality);
    }
  }, [video]);

  const handleOpenEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setTitle(video.title);
    setDescription(video.description || '');
    setTagsString((video.tags || []).join(', '));
    setVideoType(video.type);
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsString
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const updatedVideo: VideoItem = {
      ...video,
      title: title.trim(),
      description: description.trim(),
      tags: parsedTags,
      type: videoType,
    };

    if (onEditVideo) {
      onEditVideo(updatedVideo);
    }
    setShowEditModal(false);
  };

  const handleOpenDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(false);
    if (onDeleteVideo) {
      onDeleteVideo(video.id);
    }
  };

  const handleOpenQuality = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowQualityModal(true);
  };

  const handleSelectQuality = (qId: VideoQuality, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveQuality(qId);
    if (onQualityChange) {
      onQualityChange(qId);
    }
    if (onEditVideo) {
      onEditVideo({ ...video, quality: qId });
    }
    setShowQualityModal(false);

    // Show temporary toast
    const msg = language === 'hi' ? `क्वालिटी ${qId} सेट हो गई` : `Quality set to ${qId}`;
    setQualityToast(msg);
    setTimeout(() => {
      setQualityToast(null);
    }, 2500);
  };

  const isShort = video.type === 'short';
  const typeLabelEn = isShort ? 'Short' : 'Long Video';
  const typeLabelHi = isShort ? 'शॉर्ट्स' : 'लॉन्ग वीडियो';

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* 3-Dot Trigger Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={`p-2 rounded-full transition-all flex items-center justify-center focus:outline-hidden ${
          buttonClassName ||
          (themeVariant === 'dark'
            ? 'text-white/80 hover:text-white hover:bg-white/10 active:scale-95'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 active:scale-95')
        }`}
        title={language === 'hi' ? '3-डॉट विकल्प (एडिट, डिलीट, क्वालिटी)' : '3-dot video options'}
        aria-label="3 dot video options menu"
        aria-expanded={isOpen}
      >
        <MoreVertical style={{ width: iconSize, height: iconSize }} />
        {label && <span className="ml-1 text-xs font-medium">{label}</span>}
      </button>

      {/* Floating 3-Dot Dropdown Menu */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-50 mt-1 min-w-[210px] w-56 rounded-2xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-2xl border border-gray-100 dark:border-neutral-800 py-1.5 transition-all animate-in fade-in zoom-in-95 duration-150 ${
            menuAlign === 'right'
              ? 'right-0 origin-top-right'
              : menuAlign === 'top-right'
              ? 'right-0 bottom-full mb-1 origin-bottom-right'
              : 'left-0 origin-top-left'
          }`}
        >
          {/* Header indicator */}
          <div className="px-3.5 py-2 border-b border-gray-100 dark:border-neutral-800/80 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {language === 'hi' ? `${typeLabelHi} विकल्प` : `${typeLabelEn} Options`}
            </span>
            <span className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-2 py-0.5 rounded-full">
              {activeQuality}
            </span>
          </div>

          {/* Option 1: Edit Video */}
          <button
            onClick={handleOpenEdit}
            className="w-full px-3.5 py-2.5 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-100 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Pencil className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">
                {language === 'hi' ? `${typeLabelHi} एडिट करें` : `Edit ${typeLabelEn}`}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {language === 'hi' ? 'टाइटल, विवरण और टैग्स बदलें' : 'Title, description & tags'}
              </p>
            </div>
          </button>

          {/* Option 2: Quality Selector */}
          <button
            onClick={handleOpenQuality}
            className="w-full px-3.5 py-2.5 flex items-center gap-3 text-left hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-100 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold">
                  {language === 'hi' ? 'वीडियो क्वालिटी' : 'Video Quality'}
                </p>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                  {activeQuality}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 truncate">
                {language === 'hi' ? '1080p, 720p, 480p, 360p, ऑटो' : '1080p, 720p, 480p, Auto'}
              </p>
            </div>
          </button>

          <div className="my-1 border-t border-gray-100 dark:border-neutral-800" />

          {/* Option 3: Delete Video */}
          <button
            onClick={handleOpenDelete}
            className="w-full px-3.5 py-2.5 flex items-center gap-3 text-left hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 transition-colors group"
          >
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">
                {language === 'hi' ? `${typeLabelHi} डिलीट करें` : `Delete ${typeLabelEn}`}
              </p>
              <p className="text-[10px] text-rose-400 dark:text-rose-500/80 truncate">
                {language === 'hi' ? 'स्थायी रूप से हटाएं' : 'Permanently remove'}
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Quality Toast Alert via Portal */}
      {qualityToast &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[130] bg-neutral-900/95 text-white text-xs font-medium px-4 py-2 rounded-full shadow-2xl border border-neutral-700/80 flex items-center gap-2 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>{qualityToast}</span>
          </div>,
          document.body
        )}

      {/* Modal 1: Edit Video Modal via Portal */}
      {showEditModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-neutral-800 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-pink-600 text-white shadow-sm">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {language === 'hi' ? `${typeLabelHi} एडिट करें` : `Edit ${typeLabelEn}`}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {language === 'hi'
                      ? 'शीर्षक, विवरण और जानकारी अपडेट करें'
                      : 'Update title, description and metadata'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  {language === 'hi' ? 'वीडियो प्रकार' : 'Video Format'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoType('video')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      videoType === 'video'
                        ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-xs'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Film className="w-4 h-4" />
                    <span>{language === 'hi' ? 'लॉन्ग वीडियो' : 'Long Video'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoType('short')}
                    className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                      videoType === 'short'
                        ? 'border-pink-600 bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 shadow-xs'
                        : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{language === 'hi' ? 'शॉर्ट्स वीडियो' : 'Shorts Video'}</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    {language === 'hi' ? 'टाइटल (शीर्षक) *' : 'Video Title *'}
                  </label>
                  <span className="text-[10px] text-gray-400">{title.length}/100</span>
                </div>
                <input
                  type="text"
                  value={title}
                  maxLength={100}
                  required
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={language === 'hi' ? 'वीडियो का शीर्षक दर्ज करें...' : 'Enter video title...'}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-neutral-900 transition-all font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  {language === 'hi' ? 'विवरण (डिस्क्रिप्शन)' : 'Description'}
                </label>
                <textarea
                  value={description}
                  rows={4}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    language === 'hi'
                      ? 'वीडियो के बारे में दर्शकों को बताएं...'
                      : 'Tell viewers what your video is about...'
                  }
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white dark:focus:bg-neutral-900 transition-all resize-none font-normal leading-relaxed"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                  {language === 'hi' ? 'टैग्स (कॉमा से अलग करें)' : 'Tags (comma-separated)'}
                </label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="trending, viral, tutorial, tech"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 font-medium"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'बदलाव सेव करें' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
          document.body
        )}

      {/* Modal 2: Delete Confirmation Modal via Portal */}
      {showDeleteModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in zoom-in-95 duration-150"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1.5">
                {language === 'hi'
                  ? `क्या आप इस ${typeLabelHi} को डिलीट करना चाहते हैं?`
                  : `Delete this ${typeLabelEn}?`}
              </h3>

              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {language === 'hi'
                  ? `"${video.title}" स्थायी रूप से हटा दी जाएगी। इसे दोबारा वापस नहीं लाया जा सकेगा।`
                  : `"${video.title}" will be permanently removed from your channel and storage. This cannot be undone.`}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal(false);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {language === 'hi'
                      ? 'स्थायी रूप से डिलीट करें'
                      : isShort
                      ? 'Delete Short'
                      : 'Delete Video'}
                  </span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal 3: Video Quality Selector Modal via Portal */}
      {showQualityModal &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in zoom-in-95 duration-150"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-600 text-white shadow-sm">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">
                    {language === 'hi'
                      ? `${typeLabelHi} क्वालिटी (रिज़ॉल्यूशन)`
                      : `${typeLabelEn} Quality Settings`}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {language === 'hi'
                      ? 'अपनी इंटरनेट स्पीड के अनुसार क्वालिटी चुनें'
                      : 'Choose playback resolution for optimal viewing'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQualityModal(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quality List */}
            <div className="p-4 space-y-1.5">
              {VIDEO_QUALITIES.map((q) => {
                const isSelected = activeQuality === q.id;
                return (
                  <button
                    key={q.id}
                    onClick={(e) => handleSelectQuality(q.id, e)}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between transition-all text-left ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 shadow-xs'
                        : 'hover:bg-gray-50 dark:hover:bg-neutral-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{q.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">
                            {language === 'hi' ? q.labelHi : q.label}
                          </span>
                          {q.id === '1080p' && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 px-1.5 py-0.5 rounded">
                              FHD
                            </span>
                          )}
                          {q.id === 'Auto' && (
                            <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                              Smart
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{q.desc}</p>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-neutral-700" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-3.5 bg-gray-50 dark:bg-neutral-800/40 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-gray-500">
              <span>Google Cloud CDN Adaptive Streaming</span>
              <button
                onClick={() => setShowQualityModal(false)}
                className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                {language === 'hi' ? 'पूर्ण' : 'Done'}
              </button>
            </div>
          </div>
        </div>,
          document.body
        )}
    </div>
  );
};
