import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  Users,
  Languages,
  Clock,
  Bell,
  Tag,
  Megaphone,
  History,
  Shield,
  Lock,
  Gamepad2,
  FlaskConical,
  PlaySquare,
  Download,
  Accessibility,
  Tv2,
  HelpCircle,
  FileText,
  MessageSquareWarning,
  Info,
  X,
  Check,
  Sparkles,
  ExternalLink,
  Smartphone,
  Wifi,
  Trash2,
  Radio,
  Tv,
} from 'lucide-react';
import { UserProfile, AppSettings } from '../types';
import { FounderAdminStudioModal } from './FounderAdminStudioModal';
import { isFounderOwner } from '../utils/admin';

interface SettingsScreenProps {
  user: UserProfile | null;
  isFounderUnlocked: boolean;
  onVerifyFounderPin: (pin: string) => boolean;
  onLockFounder: () => void;
  settings: AppSettings;
  uploadedCount: number;
  onOpenSignIn: () => void;
  onSignOut: () => void;
  onOpenEditChannel: () => void;
  onOpenYourChannel?: () => void;
  onOpenPrivacy: () => void;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  language: 'en' | 'hi';
  onBack?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  user,
  isFounderUnlocked,
  onLockFounder,
  settings,
  uploadedCount,
  onOpenSignIn,
  onOpenPrivacy,
  onUpdateSettings,
  language,
  onBack,
}) => {
  // Active detail modal ID
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isFounderStudioOpen, setIsFounderStudioOpen] = useState(false);

  // Local interactive preferences state
  const [doubleTapSeek, setDoubleTapSeek] = useState<'5s' | '10s' | '15s'>('10s');
  const [breakReminder, setBreakReminder] = useState(false);
  const [bedtimeReminder, setBedtimeReminder] = useState(false);
  const [mobileQuality, setMobileQuality] = useState<'auto' | 'higher' | 'saver'>('auto');
  const [wifiQuality, setWifiQuality] = useState<'auto' | 'higher' | 'saver'>('auto');
  const [feedPlayback, setFeedPlayback] = useState<'always' | 'wifi' | 'off'>('always');
  const [autoplayNext, setAutoplayNext] = useState(true);
  const [showCaptions, setShowCaptions] = useState(true);
  const [captionSize, setCaptionSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [dataSaverMode, setDataSaverMode] = useState(false);
  const [downloadQuality, setDownloadQuality] = useState<'1080p' | '720p' | '360p'>('1080p');
  const [ambientLighting, setAmbientLighting] = useState(true);
  const [stableVolume, setStableVolume] = useState(true);
  const [holdComments, setHoldComments] = useState(true);
  const [accessibilityPlayer, setAccessibilityPlayer] = useState(false);
  const [tvCodeInput, setTvCodeInput] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleItemClick = (id: string) => {
    if (id === 'switch_account') {
      onOpenSignIn();
    } else if (id === 'privacy') {
      onOpenPrivacy();
    } else {
      setActiveModal(id);
    }
  };

  return (
    <div className="w-full min-h-screen pb-28 bg-black text-white font-sans select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-neutral-800 text-white text-xs px-4 py-2.5 rounded-full shadow-2xl border border-neutral-700 animate-in fade-in zoom-in-95">
          {toastMessage}
        </div>
      )}

      {/* Top Sticky Header matching YouTube mobile video */}
      <div className="sticky top-0 z-30 bg-black/95 backdrop-blur-md px-4 py-3 flex items-center gap-6 border-b border-neutral-900/60">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-white hover:bg-neutral-800/80 active:bg-neutral-700/80 rounded-full transition-colors focus:outline-none"
          aria-label="Back"
        >
          <ArrowLeft className="w-6 h-6 stroke-[1.8]" />
        </button>
        <h1 className="text-xl font-bold text-white tracking-tight">Settings</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Founder & Lead Developer Banner — visible ONLY after verified Google Login + Master PIN */}
        {isFounderOwner(user) && isFounderUnlocked && (
          <div className="mx-4 mt-3 mb-1 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-pink-500/15 to-purple-500/20 border border-amber-400/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <p className="text-xs font-bold text-amber-300">
                  {language === 'hi' ? 'फ़ाउंडर व मुख्य डेवलपर एक्सेस' : 'Founder & Lead Developer Access'}
                </p>
                <p className="text-[11px] text-gray-300">
                  {user?.name} ({user?.email}) • Root Access
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsFounderStudioOpen(true)}
              className="text-[11px] font-black uppercase bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1 active:scale-95"
            >
              <span>{language === 'hi' ? 'स्टूडियो' : 'Studio'}</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* SECTION 1: Account */}
        <div className="pt-2">
          <h2 className="text-[15px] font-bold text-white px-4 pt-3 pb-1 tracking-normal">
            Account
          </h2>

          <div className="flex flex-col">
            {/* 1. General */}
            <button
              onClick={() => handleItemClick('general')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <SettingsIcon className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">General</span>
            </button>

            {/* 2. Switch or manage account */}
            <button
              onClick={() => handleItemClick('switch_account')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Users className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">
                Switch or manage account
              </span>
            </button>

            {/* 3. Family Center */}
            <button
              onClick={() => handleItemClick('family_center')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <svg
                className="w-5 h-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span className="text-[15px] font-normal text-white">Family Center</span>
            </button>

            {/* 4. Languages */}
            <button
              onClick={() => handleItemClick('languages')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Languages className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Languages</span>
            </button>

            {/* 5. Time management */}
            <button
              onClick={() => handleItemClick('time_management')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Clock className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Time management</span>
            </button>

            {/* 6. Notifications */}
            <button
              onClick={() => handleItemClick('notifications')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Bell className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Notifications</span>
            </button>

            {/* 7. Get mytube Premium */}
            <button
              onClick={() => handleItemClick('premium')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              {/* mytube Premium Play in Hexagon Icon matching video */}
              <svg
                className="w-5 h-5 text-white flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M12 2.5L3.5 7.4v9.2L12 21.5l8.5-4.9V7.4L12 2.5z"
                  strokeLinejoin="round"
                />
                <polygon points="10 8.5 16 12 10 15.5 10 8.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="text-[15px] font-normal text-white">
                Get mytube Premium
              </span>
            </button>

            {/* 8. Purchases and memberships */}
            <button
              onClick={() => handleItemClick('purchases')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Tag className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">
                Purchases and memberships
              </span>
            </button>

            {/* 9. Promotions */}
            <button
              onClick={() => handleItemClick('promotions')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Megaphone className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Promotions</span>
            </button>

            {/* 10. Manage all history */}
            <button
              onClick={() => handleItemClick('history')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <History className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">
                Manage all history
              </span>
            </button>

            {/* 11. Your data in mytube */}
            <button
              onClick={() => handleItemClick('your_data')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Shield className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">
                Your data in mytube
              </span>
            </button>

            {/* 12. Privacy */}
            <button
              onClick={() => handleItemClick('privacy')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Lock className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Privacy</span>
            </button>

            {/* 13. Connected apps */}
            <button
              onClick={() => handleItemClick('connected_apps')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Gamepad2 className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Connected apps</span>
            </button>

            {/* 14. Try experimental new features */}
            <button
              onClick={() => handleItemClick('experiments')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <FlaskConical className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">
                Try experimental new features
              </span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Video and audio preferences */}
        <div className="pt-5">
          <h2 className="text-[15px] font-bold text-white px-4 pt-3 pb-1 tracking-normal">
            Video and audio preferences
          </h2>

          <div className="flex flex-col">
            {/* 15. Quality */}
            <button
              onClick={() => handleItemClick('quality')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              {/* Exact HD badge icon from YouTube video */}
              <div className="w-5 h-5 flex items-center justify-center border-[1.6px] border-white rounded-[3px] text-[8.5px] font-black leading-none text-white tracking-tighter flex-shrink-0">
                HD
              </div>
              <span className="text-[15px] font-normal text-white">Quality</span>
            </button>

            {/* 16. Playback */}
            <button
              onClick={() => handleItemClick('playback')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <PlaySquare className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Playback</span>
            </button>

            {/* 17. Captions */}
            <button
              onClick={() => handleItemClick('captions')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              {/* Exact CC badge icon from YouTube video */}
              <div className="w-5 h-5 flex items-center justify-center border-[1.6px] border-white rounded-[3px] text-[8.5px] font-black leading-none text-white tracking-tighter flex-shrink-0">
                CC
              </div>
              <span className="text-[15px] font-normal text-white">Captions</span>
            </button>

            {/* 18. Data saving */}
            <button
              onClick={() => handleItemClick('data_saving')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              {/* Diverging split arrows icon matching YouTube video */}
              <svg
                className="w-5 h-5 text-white flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 3h5v5" />
                <path d="M4 20L21 3" />
                <path d="M21 16v5h-5" />
                <path d="M15 15l6 6" />
                <path d="M4 4l5 5" />
              </svg>
              <span className="text-[15px] font-normal text-white">Data saving</span>
            </button>

            {/* 19. Downloads */}
            <button
              onClick={() => handleItemClick('downloads')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Download className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Downloads</span>
            </button>

            {/* 20. Live chat */}
            <button
              onClick={() => handleItemClick('live_chat')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              {/* Live chat bubble with broadcast arches matching video */}
              <svg
                className="w-5 h-5 text-white flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="M12 8a2.5 2.5 0 0 1 2.5 2.5" />
                <path d="M12 5.5a5 5 0 0 1 5 5" />
              </svg>
              <span className="text-[15px] font-normal text-white">Live chat</span>
            </button>

            {/* 21. Accessibility */}
            <button
              onClick={() => handleItemClick('accessibility')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Accessibility className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Accessibility</span>
            </button>

            {/* 22. Watch on TV */}
            <button
              onClick={() => handleItemClick('watch_on_tv')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Tv2 className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Watch on TV</span>
            </button>
          </div>
        </div>

        {/* SECTION 3: Help and policy */}
        <div className="pt-5">
          <h2 className="text-[15px] font-bold text-white px-4 pt-3 pb-1 tracking-normal">
            Help and policy
          </h2>

          <div className="flex flex-col">
            {/* 23. Help */}
            <button
              onClick={() => handleItemClick('help')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Help</span>
            </button>

            {/* 24. mytube Terms of Service */}
            <button
              onClick={() => handleItemClick('terms')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <FileText className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">
                mytube Terms of Service
              </span>
            </button>

            {/* 25. Send feedback */}
            <button
              onClick={() => handleItemClick('feedback')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <MessageSquareWarning className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">Send feedback</span>
            </button>

            {/* 26. About */}
            <button
              onClick={() => handleItemClick('about')}
              className="w-full flex items-center gap-5 px-4 py-3.5 text-left hover:bg-neutral-900/80 active:bg-neutral-800 transition-colors"
            >
              <Info className="w-5 h-5 text-white stroke-[1.8] flex-shrink-0" />
              <span className="text-[15px] font-normal text-white">About</span>
            </button>
          </div>
        </div>
      </div>

      {/* ==================== INTERACTIVE DETAIL MODALS ==================== */}

      {/* 1. General Modal */}
      {activeModal === 'general' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">General</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-neutral-800/80 mt-2">
              {/* Dark Theme Switch */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Dark theme</p>
                  <p className="text-xs text-neutral-400">Reduce glare and improve night viewing</p>
                </div>
                <button
                  role="switch"
                  aria-checked={settings.darkTheme}
                  onClick={() => onUpdateSettings({ darkTheme: !settings.darkTheme })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                    settings.darkTheme ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      settings.darkTheme ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              {/* Upload over Wi-Fi only */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Upload over Wi-Fi only</p>
                  <p className="text-xs text-neutral-400">Save mobile cellular data</p>
                </div>
                <button
                  role="switch"
                  aria-checked={settings.uploadWifiOnly}
                  onClick={() => onUpdateSettings({ uploadWifiOnly: !settings.uploadWifiOnly })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                    settings.uploadWifiOnly ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      settings.uploadWifiOnly ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              {/* HD upload */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">HD upload</p>
                  <p className="text-xs text-neutral-400">Preserve high resolution and crisp bitrate</p>
                </div>
                <button
                  role="switch"
                  aria-checked={settings.hdUpload}
                  onClick={() => onUpdateSettings({ hdUpload: !settings.hdUpload })}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                    settings.hdUpload ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      settings.hdUpload ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              {/* Double-tap to seek */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Double-tap to seek</p>
                  <p className="text-xs text-neutral-400">Skip forward or backward</p>
                </div>
                <div className="flex gap-1.5">
                  {(['5s', '10s', '15s'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDoubleTapSeek(s)}
                      className={`px-2.5 py-1 text-xs rounded-md ${
                        doubleTapSeek === s
                          ? 'bg-white text-black font-bold'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remind me to take a break */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Remind me to take a break</p>
                  <p className="text-xs text-neutral-400">Frequency: Every 1 hr 15 min</p>
                </div>
                <button
                  role="switch"
                  aria-checked={breakReminder}
                  onClick={() => setBreakReminder(!breakReminder)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                    breakReminder ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      breakReminder ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              {/* Remind me when it's bedtime */}
              <div className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Remind me when it's bedtime</p>
                  <p className="text-xs text-neutral-400">Schedule: 11:00 PM – 7:00 AM</p>
                </div>
                <button
                  role="switch"
                  aria-checked={bedtimeReminder}
                  onClick={() => setBedtimeReminder(!bedtimeReminder)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
                    bedtimeReminder ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      bedtimeReminder ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-4 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-neutral-200 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 3. Family Center */}
      {activeModal === 'family_center' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Family Center</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-sm text-neutral-300">
              <p>Manage supervised experiences for teens and pre-teens.</p>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Parent Supervision</p>
                  <p className="text-xs text-neutral-400">Link child accounts and review activity</p>
                </div>
                <button
                  onClick={() => showToast('Supervision link generated')}
                  className="px-3 py-1 bg-white text-black rounded-full text-xs font-bold"
                >
                  Link
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2.5 rounded-full text-xs font-bold bg-neutral-800 text-white hover:bg-neutral-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 4. Languages */}
      {activeModal === 'languages' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Languages (भाषा)</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              {[
                { code: 'en' as const, label: 'English (United States)' },
                { code: 'hi' as const, label: 'हिन्दी (Hindi)' },
                { code: 'es' as const, label: 'Español (Spanish)' },
                { code: 'fr' as const, label: 'Français (French)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (lang.code === 'en' || lang.code === 'hi') {
                      onUpdateSettings({ language: lang.code });
                    }
                    showToast(`Language set to ${lang.label}`);
                    setActiveModal(null);
                  }}
                  className="w-full py-3 px-2 flex items-center justify-between text-left hover:bg-neutral-800/60 rounded-lg"
                >
                  <span className="text-sm font-medium text-white">{lang.label}</span>
                  {settings.language === lang.code && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. Time management */}
      {activeModal === 'time_management' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Time watched</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <p className="text-xs text-neutral-400">Today</p>
                  <p className="text-xl font-bold text-white mt-1">42 min</p>
                </div>
                <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                  <p className="text-xs text-neutral-400">Past 7 days</p>
                  <p className="text-xl font-bold text-white mt-1">4 hr 18 min</p>
                </div>
              </div>
              <div className="p-3 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs text-neutral-400">
                Daily average is 36 minutes based on your mytube and Shorts watch history.
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black hover:bg-neutral-200"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 6. Notifications */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Subscriptions</p>
                  <p className="text-xs text-neutral-400">Notify me about activity from channels I subscribe to</p>
                </div>
                <button
                  role="switch"
                  aria-checked={settings.subscriptionsAlert}
                  onClick={() => onUpdateSettings({ subscriptionsAlert: !settings.subscriptionsAlert })}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    settings.subscriptionsAlert ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      settings.subscriptionsAlert ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Recommended videos</p>
                  <p className="text-xs text-neutral-400">Notify me about videos I might like</p>
                </div>
                <button
                  role="switch"
                  aria-checked={settings.pushNotifications}
                  onClick={() => onUpdateSettings({ pushNotifications: !settings.pushNotifications })}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    settings.pushNotifications ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      settings.pushNotifications ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 7. Get mytube Premium */}
      {activeModal === 'premium' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold text-white">mytube Premium</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="text-sm font-semibold text-white">All mytube. No interruptions.</p>
                <ul className="text-xs text-neutral-300 mt-2 space-y-1.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" /> Ad-free & background play
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" /> Full HD 1080p downloads
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" /> mytube Music Premium included
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400" /> Unlimited Cloud Storage upload
                  </li>
                </ul>
              </div>

              <button
                onClick={() => {
                  showToast('🎉 Free trial activated! Enjoy mytube Premium');
                  setActiveModal(null);
                }}
                className="w-full py-3 rounded-full text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                Try 1 Month Free
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Purchases & memberships */}
      {activeModal === 'purchases' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Purchases and memberships</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-6 text-center text-sm text-neutral-400 space-y-2">
              <Tag className="w-8 h-8 text-neutral-500 mx-auto" />
              <p className="font-medium text-white">No active purchases</p>
              <p className="text-xs">Memberships, rentals, and Super Chats will appear here.</p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-neutral-800 text-white hover:bg-neutral-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 9. Promotions */}
      {activeModal === 'promotions' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Promotions</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-5 text-sm text-neutral-300 space-y-3">
              <p>Promote your videos and shorts to gain more subscribers and reach a global audience.</p>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="font-semibold text-white">Creator Boost Campaign</p>
                <p className="text-xs text-neutral-400 mt-1">Target audiences interested in your video tags.</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 10. Manage all history */}
      {activeModal === 'history' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">History controls</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('mytube_watch_history');
                  } catch (e) {}
                  showToast('Watch history cleared');
                }}
                className="w-full py-3 text-left hover:bg-neutral-800/60 rounded-lg px-2"
              >
                <p className="text-sm font-medium text-white">Clear watch history</p>
                <p className="text-xs text-neutral-400">Clear video history from this account</p>
              </button>

              <button
                onClick={() => {
                  showToast('Search history cleared');
                }}
                className="w-full py-3 text-left hover:bg-neutral-800/60 rounded-lg px-2"
              >
                <p className="text-sm font-medium text-white">Clear search history</p>
                <p className="text-xs text-neutral-400">Clear all searches made on this device</p>
              </button>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2.5 rounded-full text-xs font-bold bg-neutral-800 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 11. Your data in mytube */}
      {activeModal === 'your_data' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Your data in mytube</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Videos uploaded:</span>
                  <span className="font-bold text-white">{uploadedCount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Watch history:</span>
                  <span className="font-bold text-green-400">On</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Storage Cloud Tier:</span>
                  <span className="font-bold text-white">Unlimited Google Cloud</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 13. Connected apps */}
      {activeModal === 'connected_apps' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Connected apps</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">Google Cloud Storage</p>
                  <p className="text-xs text-neutral-400">Connected & Synced</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-green-950 text-green-400 border border-green-800 rounded">
                  Active
                </span>
              </div>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white text-sm">Firebase Firestore</p>
                  <p className="text-xs text-neutral-400">Cloud database online</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-green-950 text-green-400 border border-green-800 rounded">
                  Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-neutral-800 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 14. Experimental features */}
      {activeModal === 'experiments' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Experimental features</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Ambient mode</p>
                  <p className="text-xs text-neutral-400">Glow effect matches video colors</p>
                </div>
                <button
                  role="switch"
                  aria-checked={ambientLighting}
                  onClick={() => setAmbientLighting(!ambientLighting)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    ambientLighting ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      ambientLighting ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Stable volume</p>
                  <p className="text-xs text-neutral-400">Equalize quiet and loud sounds automatically</p>
                </div>
                <button
                  role="switch"
                  aria-checked={stableVolume}
                  onClick={() => setStableVolume(!stableVolume)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    stableVolume ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      stableVolume ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 15. Quality */}
      {activeModal === 'quality' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Video quality preferences</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-3 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase text-neutral-400 mb-2">Mobile networks</p>
                <div className="space-y-1">
                  {[
                    { id: 'auto' as const, label: 'Auto (recommended)', desc: 'Adjusts to give best experience' },
                    { id: 'higher' as const, label: 'Higher picture quality', desc: 'Uses more data' },
                    { id: 'saver' as const, label: 'Data saver', desc: 'Lower picture quality' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setMobileQuality(opt.id)}
                      className="w-full p-2.5 rounded-lg flex items-center justify-between hover:bg-neutral-800 text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{opt.label}</p>
                        <p className="text-xs text-neutral-400">{opt.desc}</p>
                      </div>
                      {mobileQuality === opt.id && <Check className="w-5 h-5 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 16. Playback */}
      {activeModal === 'playback' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Playback</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Autoplay next video</p>
                  <p className="text-xs text-neutral-400">Automatically play another related video</p>
                </div>
                <button
                  role="switch"
                  aria-checked={autoplayNext}
                  onClick={() => setAutoplayNext(!autoplayNext)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    autoplayNext ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      autoplayNext ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 17. Captions */}
      {activeModal === 'captions' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Captions (Subtitles)</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Show captions</p>
                  <p className="text-xs text-neutral-400">Display closed captions when available</p>
                </div>
                <button
                  role="switch"
                  aria-checked={showCaptions}
                  onClick={() => setShowCaptions(!showCaptions)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    showCaptions ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      showCaptions ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 18. Data saving */}
      {activeModal === 'data_saving' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Data saving</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Data saving mode</p>
                  <p className="text-xs text-neutral-400">Automatically adjust settings to save mobile data</p>
                </div>
                <button
                  role="switch"
                  aria-checked={dataSaverMode}
                  onClick={() => setDataSaverMode(!dataSaverMode)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    dataSaverMode ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      dataSaverMode ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 19. Downloads */}
      {activeModal === 'downloads' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Downloads</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-3 space-y-3">
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="text-xs text-neutral-400">Download quality</p>
                <div className="flex gap-2 mt-2">
                  {(['1080p', '720p', '360p'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => setDownloadQuality(q)}
                      className={`px-3 py-1 text-xs rounded-full ${
                        downloadQuality === q
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-neutral-800 text-neutral-300'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 20. Live chat */}
      {activeModal === 'live_chat' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Live chat</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Hold for review</p>
                  <p className="text-xs text-neutral-400">Hold potentially inappropriate chat messages</p>
                </div>
                <button
                  role="switch"
                  aria-checked={holdComments}
                  onClick={() => setHoldComments(!holdComments)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    holdComments ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      holdComments ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 21. Accessibility */}
      {activeModal === 'accessibility' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Accessibility</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="divide-y divide-neutral-800 my-2">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Accessibility player</p>
                  <p className="text-xs text-neutral-400">Display persistent accessibility buttons in player</p>
                </div>
                <button
                  role="switch"
                  aria-checked={accessibilityPlayer}
                  onClick={() => setAccessibilityPlayer(!accessibilityPlayer)}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${
                    accessibilityPlayer ? 'bg-blue-600' : 'bg-neutral-700'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                      accessibilityPlayer ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 22. Watch on TV */}
      {activeModal === 'watch_on_tv' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Watch on TV</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <p className="text-xs text-neutral-300">Link with TV code from YouTube TV app settings.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter TV code"
                  value={tvCodeInput}
                  onChange={(e) => setTvCodeInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    if (tvCodeInput.trim()) {
                      showToast('Connected to TV successfully!');
                      setTvCodeInput('');
                      setActiveModal(null);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
                >
                  Link
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-neutral-800 text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 23. Help */}
      {activeModal === 'help' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Help</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-3 space-y-2.5 text-sm text-neutral-300">
              <p className="font-semibold text-white">Popular articles</p>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="text-sm font-medium text-white">How to upload Shorts and videos</p>
                <p className="text-xs text-neutral-400 mt-0.5">MP4, WebM formats supported up to 4K resolution</p>
              </div>
              <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                <p className="text-sm font-medium text-white">Channel customization & views</p>
                <p className="text-xs text-neutral-400 mt-0.5">Customize banner, handle, and track real-time views</p>
              </div>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* 24. mytube Terms of Service */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">mytube Terms of Service</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-3 space-y-3 text-xs text-neutral-300 leading-relaxed">
              <p className="font-semibold text-white text-sm">Community Guidelines & Policies</p>
              <p>
                Welcome to mytube. By using this service, you agree to comply with our Terms of Service, Copyright Policies, and Creator Community Guidelines.
              </p>
              <p>
                Uploaded content must be original or appropriately licensed. Users retain rights to their video creations.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full mt-2 py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* 25. Send feedback */}
      {activeModal === 'feedback' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Send feedback</h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setFeedbackSent(false);
                }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-3 space-y-3">
              {feedbackSent ? (
                <div className="py-6 text-center text-sm text-green-400">
                  <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  Thank you! Your feedback has been sent.
                </div>
              ) : (
                <>
                  <textarea
                    rows={4}
                    placeholder="Have feedback? We'd love to hear it..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full p-3 bg-neutral-900 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={() => {
                      if (feedbackText.trim()) {
                        setFeedbackSent(true);
                        setTimeout(() => {
                          setActiveModal(null);
                          setFeedbackSent(false);
                          setFeedbackText('');
                        }, 1500);
                      }
                    }}
                    disabled={!feedbackText.trim()}
                    className="w-full py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white"
                  >
                    Send Feedback
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 26. About */}
      {activeModal === 'about' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-[#181818] rounded-t-2xl sm:rounded-2xl border border-neutral-800 p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">About</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden border border-neutral-700 shadow-lg">
                <img src="/mytube-icon.png" alt="MyTube" className="w-full h-full object-cover" />
              </div>
              <h4 className="text-base font-bold text-white">MyTube Web</h4>
              <p className="text-xs text-neutral-400">mytube Mobile Edition • v2.4.0</p>
              <p className="text-xs text-neutral-500 pt-2">
                Designed with precision to match official mytube UI guidelines and specifications.
              </p>
            </div>
            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 rounded-full text-xs font-bold bg-white text-black"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Founder & Admin Studio Modal — strictly unmounted unless BOTH Founder Google account AND Master PIN verified */}
      {isFounderOwner(user) && isFounderUnlocked && (
        <FounderAdminStudioModal
          isOpen={isFounderStudioOpen}
          onClose={() => setIsFounderStudioOpen(false)}
          language={language}
          currentUser={user}
          isFounderUnlocked={isFounderUnlocked}
          onLockFounder={onLockFounder}
        />
      )}
    </div>
  );
};
