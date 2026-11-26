import React, { useState } from 'react';
import {
  ArrowLeft,
  Tv,
  Users,
  Cloud,
  History,
  ThumbsUp,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Plus,
  CheckCircle2,
  Lock,
  KeyRound,
} from 'lucide-react';
import { UserProfile, VideoItem, TabType } from '../types';
import { signInWithGoogle, logOutFromGoogle } from '../firebase';
import { AiAutomationModal } from './AiAutomationModal';
import { FounderAdminStudioModal } from './FounderAdminStudioModal';
import { isFounderOwner } from '../utils/admin';

interface AccountScreenProps {
  user: UserProfile | null;
  isFounderUnlocked: boolean;
  onVerifyFounderPin: (pin: string) => boolean;
  onLockFounder: () => void;
  language: 'en' | 'hi';
  videos: VideoItem[];
  historyVideos: VideoItem[];
  likedVideos: VideoItem[];
  uploadedCount: number;
  onBack: () => void;
  onNavigateTab: (tab: TabType) => void;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onOpenYourChannel?: () => void;
  onOpenEditChannel?: () => void;
  onSelectVideo: (video: VideoItem) => void;
}

export const AccountScreen: React.FC<AccountScreenProps> = ({
  user,
  isFounderUnlocked,
  onVerifyFounderPin,
  onLockFounder,
  language,
  videos,
  historyVideos,
  likedVideos,
  uploadedCount,
  onBack,
  onNavigateTab,
  onLogin,
  onLogout,
  onOpenYourChannel,
  onOpenEditChannel,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [masterPinInput, setMasterPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isFounderStudioOpen, setIsFounderStudioOpen] = useState(false);
  const [appVersion, setAppVersion] = useState('v2.4.0');

  // Strictly only this user's own uploads
  const myUploads = user ? videos.filter((v) => v.uploadedBy === user.id) : [];

  const handleRealGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const userProfile = await signInWithGoogle();
      onLogin(userProfile);
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        setErrorMsg(
          language === 'hi'
            ? 'Google साइन-इन पॉपअप बंद हो गया। कृपया दोबारा कोशिश करें।'
            : 'Google Sign-In popup was closed. Please try again.'
        );
      } else if (firebaseErr.code === 'auth/popup-blocked') {
        setErrorMsg(
          language === 'hi'
            ? 'ब्राउज़र ने पॉपअप ब्लॉक कर दिया है। कृपया पॉपअप की अनुमति दें।'
            : 'Popups are blocked by your browser. Please allow popups and try again.'
        );
      } else {
        setErrorMsg(firebaseErr.message || 'Could not complete Google Sign-In. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMasterPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const success = onVerifyFounderPin(masterPinInput);
    if (success) {
      setMasterPinInput('');
      setPinError('');
    } else {
      setPinError(
        language === 'hi'
          ? 'गलत Master PIN। कृपया सही 4-अंकों का Master PIN दर्ज करें।'
          : 'Incorrect Master PIN. Access remains locked.'
      );
    }
  };

  const handleSignOut = async () => {
    await logOutFromGoogle();
    onLogout();
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between py-3 mb-4 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-200 transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            {user
              ? language === 'hi'
                ? 'आपका खाता'
                : 'Your Account'
              : language === 'hi'
              ? 'साइन इन'
              : 'Sign In'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('settings')}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 transition-colors"
          >
            {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
          </button>
        </div>
      </div>

      {/* When Logged In */}
      {user ? (
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-gray-200 dark:border-neutral-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-32 bg-gradient-to-l from-pink-500/10 via-purple-500/5 to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-pink-500 shadow-lg shadow-pink-500/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {user.name}
                  </h2>
                  {isFounderOwner(user) && isFounderUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-700/60 shadow-xs">
                      <span>👑</span>
                      <span>{language === 'hi' ? 'फ़ाउंडर व मुख्य डेवलपर' : 'Founder & Lead Developer'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3" />
                      Google Account
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
                  {user.handle} • {user.email}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {user.subscribersCount} {language === 'hi' ? 'सब्सक्राइबर्स' : 'subscribers'} • {language === 'hi' ? 'जुड़े' : 'Joined'} {user.joinedDate}
                </p>

                {/* Action Pills */}
                <div className="flex items-center gap-2 mt-4 flex-wrap">
                  <button
                    onClick={onOpenYourChannel}
                    className="px-4 py-1.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'चैनल देखें' : 'View channel'}</span>
                  </button>
                  <button
                    onClick={onOpenEditChannel}
                    className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors"
                  >
                    {language === 'hi' ? 'प्रोफ़ाइल बदलें' : 'Edit profile'}
                  </button>
                  <button
                    onClick={() => handleRealGoogleSignIn()}
                    className="px-4 py-1.5 rounded-full bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-purple-500" />
                    <span>{language === 'hi' ? 'खाता बदलें' : 'Switch account'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 Security Gate: ONLY shown to verified Founder Google Account when Master PIN is still locked */}
          {isFounderOwner(user) && !isFounderUnlocked && (
            <form
              onSubmit={handleVerifyMasterPin}
              className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/70 dark:border-amber-700/50 rounded-3xl p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'Founder Master PIN वेरिफिकेशन' : 'Founder Master PIN Verification'}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {language === 'hi'
                      ? 'Admin Dashboard और Founder फीचर्स अनलॉक करने के लिए सही Master PIN दर्ज करें।'
                      : 'Enter your Master PIN to unlock Founder & Admin Dashboard access.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={8}
                  value={masterPinInput}
                  onChange={(e) => {
                    setMasterPinInput(e.target.value);
                    setPinError('');
                  }}
                  placeholder="Enter Master PIN"
                  required
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shrink-0"
                >
                  {language === 'hi' ? 'अनलॉक करें' : 'Verify Master PIN'}
                </button>
              </div>
              {pinError && <p className="text-xs font-semibold text-red-600 dark:text-red-400">{pinError}</p>}
            </form>
          )}

          {/* Developer / Founder Full Access Card — Unlocked ONLY after verified Google Auth + Master PIN */}
          {isFounderOwner(user) && isFounderUnlocked && (
            <div className="bg-gradient-to-r from-amber-500/15 via-pink-500/10 to-purple-500/15 border-2 border-amber-400/60 dark:border-amber-500/50 rounded-3xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-start sm:items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/30">
                    👑
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                        {language === 'hi' ? 'डेवलपर व फ़ाउंडर अधिकार (Full Access)' : 'Developer & Founder Master Access'}
                      </h3>
                      <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-black">
                        SUPER ADMIN
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 dark:text-amber-300 font-medium mt-0.5">
                      {language === 'hi'
                        ? 'आपका mytube ऐप पर 100% पूरा अधिकार है (Full Root & Super Admin Access)'
                        : 'You are verified with both Founder Google Account & Master PIN.'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLockFounder}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-neutral-800 text-xs font-bold text-gray-800 dark:text-gray-200 border border-amber-300 dark:border-amber-700 hover:bg-white transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Access</span>
                </button>
              </div>

              {/* Developer Privileges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-3.5 border-t border-amber-300/40 dark:border-amber-700/40 text-xs">
                <div className="bg-white/80 dark:bg-neutral-900/80 p-3 rounded-2xl border border-amber-200/50 dark:border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {language === 'hi' ? 'वीडियो व शॉर्ट्स' : 'Media Master Control'}
                  </span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    {language === 'hi' ? 'सारे वीडियो एडिट / डिलीट / क्वालिटी' : 'Edit, Delete & Quality of ANY video'}
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-neutral-900/80 p-3 rounded-2xl border border-amber-200/50 dark:border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {language === 'hi' ? 'डेटाबेस' : 'Firestore Database'}
                  </span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 truncate" title="ai-studio-mytube-0b483aa9-0089-46e6-baad-d58ad78f6467">
                    ai-studio-mytube (Active)
                  </p>
                </div>
                <div className="bg-white/80 dark:bg-neutral-900/80 p-3 rounded-2xl border border-amber-200/50 dark:border-neutral-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {language === 'hi' ? 'क्लाउड कोटा' : 'Cloud CDN Quota'}
                  </span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">
                    Unlimited Developer Storage
                  </p>
                </div>
              </div>

              {/* Founder Studio & Automation Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3.5">
                {/* 1. User Management & App Updates Studio */}
                <button
                  type="button"
                  onClick={() => setIsFounderStudioOpen(true)}
                  className="py-3 px-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 hover:from-pink-700 hover:to-amber-700 text-white text-xs font-bold flex items-center justify-between transition-all group shadow-md active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <span className="text-lg">👥</span>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        {language === 'hi'
                          ? 'यूज़र मैनेजमेंट व ऐप अपडेट'
                          : 'User Management & App Updates'}
                      </p>
                      <p className="text-[10px] text-white/80 font-normal mt-0.5">
                        {language === 'hi'
                          ? 'यूज़र्स बैन/वेरीफाई करें व ऐप डिप्लॉय करें'
                          : 'Manage users, badges & push live updates'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-white/20 text-white px-2 py-1 rounded-full group-hover:scale-105 transition-transform shrink-0">
                    STUDIO
                  </span>
                </button>

                {/* 2. Million Users AI Auto-Handling Architecture */}
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="py-3 px-4 rounded-2xl bg-white/90 dark:bg-neutral-800/90 hover:bg-white dark:hover:bg-neutral-800 border border-amber-400/50 text-gray-900 dark:text-white text-xs font-bold flex items-center justify-between transition-all group shadow-xs active:scale-[0.99]"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <span className="text-lg">🤖</span>
                    <div>
                      <p className="text-xs font-bold leading-tight">
                        {language === 'hi'
                          ? 'AI ऑटो-हैंडलिंग सिस्टम'
                          : 'AI Auto-Handling System'}
                      </p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-300 font-normal mt-0.5">
                        {language === 'hi'
                          ? 'लाखों यूज़र्स AI कैसे संभालता है'
                          : 'How Cloud & AI handle scale 100%'}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-amber-500 text-black px-2 py-1 rounded-full group-hover:scale-105 transition-transform shrink-0">
                    100% AUTO
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Cloud Storage & Upload Status */}
          <div className="bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 border border-pink-200 dark:border-pink-900/40 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-pink-500/15 text-pink-600 dark:text-pink-400 rounded-2xl">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'क्लाउड स्टोरेज' : 'Unlimited Cloud Storage'}
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-pink-500 text-white">
                    PRO
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {uploadedCount} {language === 'hi' ? 'वीडियोज़ क्लाउड पर सुरक्षित हैं' : 'videos safely synced to your account'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('upload')}
              className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'नया वीडियो अपलोड करें' : 'Upload Video'}</span>
            </button>
          </div>

          {/* Quick Access Sections: History, Liked, Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* History Card */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-pink-500" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {language === 'hi' ? 'इतिहास' : 'History'}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    {historyVideos.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {historyVideos.length > 0
                    ? `${language === 'hi' ? 'हाल ही में देखे गए वीडियो' : 'Recently watched videos'}`
                    : `${language === 'hi' ? 'कोई इतिहास नहीं' : 'No watch history yet'}`}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('library')}
                className="mt-4 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                <span>{language === 'hi' ? 'लाइब्रेरी में देखें' : 'View in Library'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Liked Videos Card */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-purple-500" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {language === 'hi' ? 'पसंद किए गए' : 'Liked Videos'}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    {likedVideos.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {likedVideos.length > 0
                    ? `${language === 'hi' ? 'पसंद किए गए वीडियो' : 'Videos you liked'}`
                    : `${language === 'hi' ? 'कोई पसंद वीडियो नहीं' : 'No liked videos yet'}`}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('library')}
                className="mt-4 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                <span>{language === 'hi' ? 'लाइब्रेरी में देखें' : 'View in Library'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Your Uploads Card */}
            <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Tv className="w-4 h-4 text-cyan-500" />
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                      {language === 'hi' ? 'आपके वीडियो' : 'Your Videos'}
                    </h4>
                  </div>
                  <span className="text-xs font-semibold text-gray-400">
                    {myUploads.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {myUploads.length > 0
                    ? `${language === 'hi' ? 'अपलोड किए गए वीडियो' : 'Manage your uploads'}`
                    : `${language === 'hi' ? 'अभी तक कोई वीडियो नहीं' : 'No uploads yet'}`}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('library')}
                className="mt-4 text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline flex items-center gap-1"
              >
                <span>{language === 'hi' ? 'वीडियो प्रबंधित करें' : 'Manage Videos'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Shortcuts List */}
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 overflow-hidden divide-y divide-gray-100 dark:divide-neutral-800">
            <button
              onClick={() => onNavigateTab('following')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-pink-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {language === 'hi' ? 'सब्सक्रिप्शन्स और फॉलोइंग' : 'Subscriptions & Following'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-neutral-800/60 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {language === 'hi' ? 'सभी 26 सेटिंग्स और गोपनीयता' : 'All 26 Settings & Privacy'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left text-red-500 font-semibold"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-red-500" />
                <span className="text-sm">
                  {language === 'hi' ? 'साइन आउट करें' : 'Sign out of mytube'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400" />
            </button>
          </div>
        </div>
      ) : (
        /* When NOT Logged In - Dedicated YouTube-style Sign In Landing Page */
        <div className="max-w-md mx-auto py-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden shadow-lg shadow-pink-500/20 border border-neutral-200 dark:border-neutral-700">
              <img
                src="/mytube-icon.jpg"
                alt="mytube"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              {language === 'hi' ? 'mytube में साइन इन करें' : 'Sign in to mytube'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
              {language === 'hi'
                ? 'वीडियो अपलोड करें, चैनल सब्सक्राइब करें, लाइक और कमेंट्स सेव करें।'
                : 'Upload videos, subscribe to channels, like content, and save your favorites across all devices.'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-600 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Primary Real Google Sign-In Button Only */}
          <div className="space-y-3">
            <button
              onClick={handleRealGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 border-2 border-gray-300 dark:border-neutral-600 rounded-2xl font-bold text-sm text-gray-800 dark:text-white flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-60"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>
                {loading
                  ? language === 'hi'
                    ? 'कनेक्ट हो रहा है...'
                    : 'Connecting...'
                  : language === 'hi'
                  ? 'Google खाते से साइन इन करें'
                  : 'Sign in with Google'}
              </span>
            </button>
          </div>

          {/* Account Benefits */}
          <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-5 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {language === 'hi' ? 'साइन इन करने के फ़ायदे' : 'Sign In Benefits'}
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 mt-0.5">
                  <Cloud className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'अनलिमिटेड क्लाउड वीडियो स्टोरेज' : 'Unlimited Cloud Storage'}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {language === 'hi'
                      ? 'वीडियो और शॉर्ट्स कभी डिलीट नहीं होंगे'
                      : 'Never lose your videos and shorts across browser sessions.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-0.5">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'अपना चैनल बनाएं' : 'Build Your Channel'}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {language === 'hi'
                      ? 'कस्टमाइज़ चैनल, सब्सक्राइबर्स और व्यूज'
                      : 'Custom channel handle, subscribers, and creator statistics.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 mt-0.5">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    {language === 'hi' ? 'इतिहास और प्लेलिस्ट्स सिंक' : 'Synced Watch History'}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {language === 'hi'
                      ? 'जहां छोड़ा था वहीं से दोबारा देखें'
                      : 'Resume watching any video right from where you stopped.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Founder-Only Modals: strictly unmounted unless BOTH Founder Google account AND Master PIN verified */}
      {isFounderOwner(user) && isFounderUnlocked && (
        <>
          <AiAutomationModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            language={language}
            userEmail={user?.email || ''}
          />

          <FounderAdminStudioModal
            isOpen={isFounderStudioOpen}
            onClose={() => setIsFounderStudioOpen(false)}
            language={language}
            currentVersion={appVersion}
            onVersionUpdated={(newVer) => setAppVersion(newVer)}
            currentUser={user}
            isFounderUnlocked={isFounderUnlocked}
            onLockFounder={onLockFounder}
          />
        </>
      )}
    </div>
  );
};

