import React, { useState, useEffect } from 'react';
import { TabType, VideoItem, ChannelItem, UserProfile, AppSettings } from './types';
import {
  DEFAULT_SETTINGS,
  loadStoredVideos,
  saveStoredVideos,
  loadStoredChannels,
  saveStoredChannels,
  loadStoredSettings,
  saveStoredSettings,
  loadWatchHistory,
  recordWatchHistory,
  loadDeletedVideoIds,
  recordDeletedVideoId,
} from './utils/storage';
import { INITIAL_VIDEOS, INITIAL_CHANNELS } from './data/initialVideos';
import { calculateStorageStats } from './utils/videoRules';
import { rehydrateVideoList, deleteVideoFromIndexedDB } from './utils/persistentVideoStorage';
import {
  isFounderEmail,
  isFounderOwner,
  isFounderFullyUnlocked,
  validateFounderSecurityPin,
} from './utils/admin';
import {
  auth,
  syncUserProfileToFirestore,
  updateUserProfileInFirestore,
  loadUserSettingsFromFirestore,
  saveUserSettingsToFirestore,
  loadUserHistoryFromFirestore,
  recordUserHistoryInFirestore,
  loadUserUploadsFromFirestore,
  saveUserUploadToFirestore,
  updateUserUploadInFirestore,
  deleteUserUploadFromFirestore,
} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ShortsScreen } from './components/ShortsScreen';
import { UploadScreen } from './components/UploadScreen';
import { FollowingScreen } from './components/FollowingScreen';
import { LibraryScreen } from './components/LibraryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { AccountScreen } from './components/AccountScreen';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { SearchModal } from './components/SearchModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ChannelEditModal } from './components/ChannelEditModal';
import { PrivacyModal } from './components/PrivacyModal';
import { YourChannelModal } from './components/YourChannelModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  // Default signed-out state: no user is logged in when first opening the app
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isFounderPinVerified, setIsFounderPinVerified] = useState<boolean>(false);

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const deleted = new Set(loadDeletedVideoIds(null));
    return INITIAL_VIDEOS.filter((v) => !deleted.has(v.id));
  });
  const [channels, setChannels] = useState<ChannelItem[]>(() => INITIAL_CHANNELS);
  const [settings, setSettings] = useState<AppSettings>(() => DEFAULT_SETTINGS);
  const [historyIds, setHistoryIds] = useState<string[]>([]);

  // Active modals
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChannelEditOpen, setIsChannelEditOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isYourChannelOpen, setIsYourChannelOpen] = useState(false);

  const isFounderUnlocked = isFounderFullyUnlocked(user, isFounderPinVerified);

  // Listen to real Firebase Google Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Reset Founder Master PIN lock on every auth state change
      setIsFounderPinVerified(false);

      if (!fbUser) {
        const guestDeleted = new Set(loadDeletedVideoIds(null));
        setUser(null);
        setVideos(INITIAL_VIDEOS.filter((v) => !guestDeleted.has(v.id)));
        setChannels(INITIAL_CHANNELS);
        setSettings(DEFAULT_SETTINGS);
        setHistoryIds([]);
        return;
      }

      // Immediately scope local cache to this UID while loading Firestore data
      const uid = fbUser.uid;
      const deletedForUser = new Set(loadDeletedVideoIds(uid));
      const scopedLocalSettings = loadStoredSettings(uid);
      const scopedLocalHistory = loadWatchHistory(uid).filter((id) => !deletedForUser.has(id));
      const scopedLocalVideos = loadStoredVideos(uid).filter((v) => !deletedForUser.has(v.id));
      const scopedLocalChannels = loadStoredChannels(uid);

      setSettings(scopedLocalSettings);
      setHistoryIds(scopedLocalHistory);
      setVideos(scopedLocalVideos);
      setChannels(scopedLocalChannels);

      try {
        const syncedProfile = await syncUserProfileToFirestore(fbUser);
        setUser({
          ...syncedProfile,
          isGoogleUser: true,
          emailVerified: fbUser.emailVerified,
          role: 'user',
          isDeveloper: false,
        });

        // Load independent per-user Settings, History, and Uploads from Firestore
        const [fsSettings, fsHistory, fsUploads] = await Promise.all([
          loadUserSettingsFromFirestore(uid).catch(() => null),
          loadUserHistoryFromFirestore(uid).catch(() => null),
          loadUserUploadsFromFirestore(uid).catch(() => null),
        ]);

        const latestDeleted = new Set(loadDeletedVideoIds(uid));
        if (fsSettings) {
          setSettings(fsSettings);
        }
        if (fsHistory) {
          setHistoryIds(fsHistory.filter((id) => !latestDeleted.has(id)));
        }
        if (fsUploads) {
          // Merge official demo feed with ONLY this user's own uploads, respecting deleted items
          const merged = [
            ...fsUploads,
            ...INITIAL_VIDEOS.filter(
              (iv) => !latestDeleted.has(iv.id) && !fsUploads.some((u) => u.id === iv.id)
            ),
          ];
          const rehydrated = await rehydrateVideoList(merged);
          setVideos(rehydrated);
        } else {
          const rehydrated = await rehydrateVideoList(scopedLocalVideos);
          setVideos(rehydrated);
        }
      } catch (err) {
        console.warn('Firestore user isolation sync fallback:', err);
        const isOwner = Boolean(fbUser.emailVerified && isFounderEmail(fbUser.email));
        setUser({
          id: uid,
          name: fbUser.displayName || 'MyTube User',
          email: fbUser.email || '',
          handle: `@${(fbUser.displayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'}`,
          avatarUrl: fbUser.photoURL || undefined,
          subscribersCount: 0,
          joinedDate: 'Joined recently',
          isGoogleUser: true,
          emailVerified: fbUser.emailVerified,
          role: isOwner ? 'user' : 'user',
          isDeveloper: false,
          cloudStorageTier: 'Google Cloud Storage',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Rehydrate video URLs on initial guest boot
  useEffect(() => {
    const guestDeleted = new Set(loadDeletedVideoIds(null));
    const filteredInitial = INITIAL_VIDEOS.filter((v) => !guestDeleted.has(v.id));
    rehydrateVideoList(filteredInitial).then((rehydrated) => {
      setVideos((prev) => (prev.length === filteredInitial.length && !user ? rehydrated : prev));
    });
  }, []);

  // Sync user-scoped state to local cache ONLY when signed in
  useEffect(() => {
    if (user?.id) {
      saveStoredVideos(videos, user.id);
    }
  }, [videos, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveStoredChannels(channels, user.id);
    }
  }, [channels, user?.id]);

  useEffect(() => {
    if (user?.id) {
      saveStoredSettings(settings, user.id);
    }
    if (settings.darkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings, user?.id]);

  // Verify Master PIN (8888) ONLY after verified Google login as Founder
  const handleVerifyFounderPin = (pinInput: string): boolean => {
    if (!isFounderOwner(user)) {
      setIsFounderPinVerified(false);
      return false;
    }
    if (validateFounderSecurityPin(pinInput)) {
      setIsFounderPinVerified(true);
      setUser((prev) =>
        prev
          ? {
              ...prev,
              role: 'owner',
              isDeveloper: true,
              cloudStorageTier: 'Unlimited Google Cloud Storage (Full Developer Access)',
            }
          : prev
      );
      return true;
    }
    return false;
  };

  const handleLockFounder = () => {
    setIsFounderPinVerified(false);
    setUser((prev) =>
      prev
        ? {
            ...prev,
            role: 'user',
            isDeveloper: false,
          }
        : prev
    );
  };

  // Video playback: tracks watch history strictly for the signed-in user
  const handleSelectVideo = (video: VideoItem) => {
    if (user?.id) {
      const updatedHist = recordWatchHistory(video.id, user.id);
      setHistoryIds(updatedHist);
      recordUserHistoryInFirestore(user.id, video).catch((err) => {
        console.warn('Could not persist watch history to Firestore:', err);
      });
    }

    const updatedWithView = {
      ...video,
      views: (video.views || 0) + 1,
    };
    handleUpdateVideo(updatedWithView);
    setActiveVideo(updatedWithView);
  };

  const handleUpdateVideo = (updated: VideoItem) => {
    setVideos((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    if (activeVideo && activeVideo.id === updated.id) {
      setActiveVideo(updated);
    }
    if (user?.id && updated.uploadedBy === user.id) {
      updateUserUploadInFirestore(user.id, updated).catch((err) => {
        console.warn('Could not update user upload in Firestore:', err);
      });
    }
  };

  const handleDeleteVideo = (videoId: string) => {
    const target = videos.find((v) => v.id === videoId);
    recordDeletedVideoId(videoId, user?.id || null);
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    setHistoryIds((prev) => prev.filter((id) => id !== videoId));
    if (activeVideo && activeVideo.id === videoId) {
      setActiveVideo(null);
    }
    deleteVideoFromIndexedDB(videoId).catch(() => {});
    if (user?.id && target?.uploadedBy === user.id) {
      deleteUserUploadFromFirestore(user.id, videoId).catch((err) => {
        console.warn('Could not delete user upload from Firestore:', err);
      });
    }
  };

  const handleUploadSuccess = (newVideo: VideoItem) => {
    if (!user?.id) return;
    const scopedVideo: VideoItem = {
      ...newVideo,
      uploadedBy: user.id,
      channelName: user.name,
      channelHandle: user.handle,
    };
    setVideos((prev) => [scopedVideo, ...prev]);
    saveUserUploadToFirestore(user.id, scopedVideo).catch((err) => {
      console.warn('Could not save user upload to Firestore:', err);
    });
    setCurrentTab('library');
  };

  const handleToggleFollowChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === channelId ? { ...c, isFollowed: !c.isFollowed } : c))
    );
  };

  const handleToggleFollowByHandle = (handle: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.handle.toLowerCase() === handle.toLowerCase()
          ? { ...c, isFollowed: !c.isFollowed }
          : c
      )
    );
  };

  const handleToggleLanguage = () => {
    const nextLang: 'en' | 'hi' = settings.language === 'hi' ? 'en' : 'hi';
    handleUpdateSettings({ language: nextLang });
  };

  const handleUpdateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      if (user?.id) {
        saveUserSettingsToFirestore(user.id, next).catch((err) => {
          console.warn('Could not persist user settings to Firestore:', err);
        });
      }
      return next;
    });
  };

  const handleLogin = (newUser: UserProfile) => {
    // Always start with PIN locked until verified; role/isDeveloper are NOT auto-granted
    setIsFounderPinVerified(false);
    setUser({
      ...newUser,
      isDeveloper: false,
      role: 'user',
    });
  };

  const handleLogout = () => {
    const guestDeleted = new Set(loadDeletedVideoIds(null));
    setIsFounderPinVerified(false);
    setUser(null);
    setVideos(INITIAL_VIDEOS.filter((v) => !guestDeleted.has(v.id)));
    setChannels(INITIAL_CHANNELS);
    setSettings(DEFAULT_SETTINGS);
    setHistoryIds([]);
  };

  const handleSaveUserProfile = (updated: UserProfile) => {
    setUser(updated);
    if (updated.id) {
      updateUserProfileInFirestore(updated.id, {
        name: updated.name,
        handle: updated.handle,
        channelDescription: updated.channelDescription,
      }).catch((err) => {
        console.warn('Could not update profile in Firestore:', err);
      });
    }
  };

  // Filtered lists strictly isolated per authenticated user
  const userUploadedVideos = user ? videos.filter((v) => v.uploadedBy === user.id) : [];

  const historyVideos = user
    ? historyIds
        .map((id) => videos.find((v) => v.id === id))
        .filter((v): v is VideoItem => Boolean(v))
    : [];

  const likedVideos = user ? videos.filter((v) => v.isLiked) : [];
  const shortsList = videos.filter((v) => v.type === 'short');

  const { count: storageUploadCount } = calculateStorageStats(videos, user?.id);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        settings.darkTheme ? 'dark bg-[#0f0f10] text-white' : 'bg-[#fafafa] text-gray-900'
      }`}
    >
      {/* Top Header */}
      {currentTab !== 'settings' && currentTab !== 'account' && (
        <Header
          user={user}
          isFounderUnlocked={isFounderUnlocked}
          onOpenSignIn={() => setIsAuthOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenYourChannel={() => setIsYourChannelOpen(true)}
          language={settings.language}
          onToggleLanguage={handleToggleLanguage}
          onLogoClick={() => setCurrentTab('home')}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto">
        {currentTab === 'home' && (
          <HomeScreen
            videos={videos}
            onSelectVideo={handleSelectVideo}
            onEditVideo={handleUpdateVideo}
            onDeleteVideo={handleDeleteVideo}
            language={settings.language}
          />
        )}

        {currentTab === 'shorts' && (
          <ShortsScreen
            shorts={shortsList}
            onUpdateShort={handleUpdateVideo}
            onDeleteShort={handleDeleteVideo}
            language={settings.language}
          />
        )}

        {currentTab === 'upload' && (
          <UploadScreen
            user={user}
            onUploadSuccess={handleUploadSuccess}
            onOpenSignIn={() => setIsAuthOpen(true)}
            language={settings.language}
          />
        )}

        {currentTab === 'following' && (
          <FollowingScreen
            channels={channels}
            videos={videos}
            onToggleFollowChannel={handleToggleFollowChannel}
            onSelectVideo={handleSelectVideo}
            language={settings.language}
          />
        )}

        {currentTab === 'library' && (
          <LibraryScreen
            userVideos={userUploadedVideos}
            historyVideos={historyVideos}
            likedVideos={likedVideos}
            onSelectVideo={handleSelectVideo}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenYourChannel={() => setIsYourChannelOpen(true)}
            onEditVideo={handleUpdateVideo}
            onDeleteVideo={handleDeleteVideo}
            language={settings.language}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsScreen
            user={user}
            isFounderUnlocked={isFounderUnlocked}
            onVerifyFounderPin={handleVerifyFounderPin}
            onLockFounder={handleLockFounder}
            settings={settings}
            uploadedCount={storageUploadCount}
            onOpenSignIn={() => setIsAuthOpen(true)}
            onSignOut={handleLogout}
            onOpenEditChannel={() => setIsChannelEditOpen(true)}
            onOpenYourChannel={() => setIsYourChannelOpen(true)}
            onOpenPrivacy={() => setIsPrivacyOpen(true)}
            onUpdateSettings={handleUpdateSettings}
            language={settings.language}
            onBack={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'account' && (
          <AccountScreen
            user={user}
            isFounderUnlocked={isFounderUnlocked}
            onVerifyFounderPin={handleVerifyFounderPin}
            onLockFounder={handleLockFounder}
            language={settings.language}
            videos={videos}
            historyVideos={historyVideos}
            likedVideos={likedVideos}
            uploadedCount={storageUploadCount}
            onBack={() => setCurrentTab('home')}
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onOpenYourChannel={() => setIsYourChannelOpen(true)}
            onOpenEditChannel={() => setIsChannelEditOpen(true)}
            onSelectVideo={handleSelectVideo}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        language={settings.language}
        user={user}
        onOpenSignIn={() => setIsAuthOpen(true)}
        onOpenYourChannel={() => setIsYourChannelOpen(true)}
        onSignOut={handleLogout}
      />

      {/* Video Player Modal */}
      {activeVideo && (
        <VideoPlayerModal
          video={activeVideo}
          allVideos={videos}
          user={user}
          onClose={() => setActiveVideo(null)}
          onUpdateVideo={handleUpdateVideo}
          onDeleteVideo={handleDeleteVideo}
          onToggleFollow={handleToggleFollowByHandle}
          isFollowed={Boolean(
            channels.find(
              (c) => c.handle.toLowerCase() === activeVideo.channelHandle.toLowerCase() && c.isFollowed
            )
          )}
          onSelectRelated={(v) => handleSelectVideo(v)}
          language={settings.language}
        />
      )}

      {/* Google Auth Modal */}
      {isAuthOpen && (
        <GoogleAuthModal
          currentUser={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onClose={() => setIsAuthOpen(false)}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <SearchModal
          videos={videos}
          onSelectVideo={handleSelectVideo}
          onClose={() => setIsSearchOpen(false)}
          language={settings.language}
        />
      )}

      {/* Notifications Modal */}
      {isNotificationsOpen && (
        <NotificationsModal
          onClose={() => setIsNotificationsOpen(false)}
          language={settings.language}
        />
      )}

      {/* Channel Edit Modal */}
      {isChannelEditOpen && (
        <ChannelEditModal
          user={user}
          onSave={handleSaveUserProfile}
          onClose={() => setIsChannelEditOpen(false)}
        />
      )}

      {/* Privacy Modal */}
      {isPrivacyOpen && <PrivacyModal onClose={() => setIsPrivacyOpen(false)} />}

      {/* YouTube Your Channel Modal */}
      {isYourChannelOpen && (
        <YourChannelModal
          isOpen={isYourChannelOpen}
          onClose={() => setIsYourChannelOpen(false)}
          user={user}
          videos={videos}
          onSelectVideo={handleSelectVideo}
          onOpenUpload={() => {
            setIsYourChannelOpen(false);
            setCurrentTab('upload');
          }}
          onUpdateUser={handleSaveUserProfile}
          onDeleteVideo={handleDeleteVideo}
          language={settings.language}
        />
      )}
    </div>
  );
}
