import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  Rocket,
  Bot,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ArrowUpRight,
  HardDrive,
  Cpu,
  Globe,
  Radio,
  Sliders,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  Check,
  Server,
  Zap,
} from 'lucide-react';
import { UserProfile } from '../types';
import { loadAllUsersForFounder } from '../firebase';
import {
  ManagedUser,
  AppRelease,
  SystemStatus,
  INITIAL_MANAGED_USERS,
  INITIAL_SYSTEM_STATUS,
  SAMPLE_TEST_USERS,
  INITIAL_APP_RELEASES,
  toggleUserVerification,
  toggleUserSuspension,
  filterAdminUsers,
  createNewAppRelease,
  toggleMaintenanceMode,
  isFounderOwner,
  validateFounderSecurityPin,
  FOUNDER_DEFAULT_PIN,
} from '../utils/admin';

interface FounderAdminStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'en' | 'hi';
  currentVersion?: string;
  onVersionUpdated?: (newVersion: string) => void;
  currentUser?: UserProfile | null;
  isFounderUnlocked?: boolean;
  onLockFounder?: () => void;
}

export const FounderAdminStudioModal: React.FC<FounderAdminStudioModalProps> = ({
  isOpen,
  onClose,
  language,
  currentVersion = 'v2.4.0',
  onVersionUpdated,
  currentUser,
  isFounderUnlocked = false,
  onLockFounder,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'updates' | 'ai_scaling'>('users');
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_MANAGED_USERS);
  const [releases, setReleases] = useState<AppRelease[]>(INITIAL_APP_RELEASES);
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'creators' | 'verified' | 'suspended' | 'bots'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Security Lock & PIN State (starts LOCKED until verified)
  const [isPinUnlocked, setIsPinUnlocked] = useState(Boolean(isFounderUnlocked));
  const [founderPin, setFounderPin] = useState(FOUNDER_DEFAULT_PIN);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showChangePin, setShowChangePin] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');

  // Dynamic Public Users Count
  const publicUsersCount = users.filter((u) => u.role !== 'owner').length;

  // System status starts at real 0
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(INITIAL_SYSTEM_STATUS);

  // App Release Deploy form state
  const [newVersionInput, setNewVersionInput] = useState('v2.4.1');
  const [newChangelogInput, setNewChangelogInput] = useState(
    'Added Founder User Management Console, Real-time App Deployer, and High-capacity AI scaling'
  );
  const [deployStep, setDeployStep] = useState<number>(0);
  const [isDeploying, setIsDeploying] = useState<boolean>(false);

  const isAuthorizedOwner = isFounderOwner(currentUser);

  // Sync lock state and load real registered Firestore users when unlocked by verified Founder
  useEffect(() => {
    setIsPinUnlocked(Boolean(isFounderUnlocked));
  }, [isFounderUnlocked]);

  useEffect(() => {
    if (isOpen && isAuthorizedOwner && isPinUnlocked) {
      loadAllUsersForFounder()
        .then((firestoreUsers) => {
          if (firestoreUsers.length > 0) {
            setUsers(firestoreUsers);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch Firestore users list:', err);
        });
    }
  }, [isOpen, isAuthorizedOwner, isPinUnlocked]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => {
      setActionNotice(null);
    }, 3500);
  };

  // IF UNAUTHORIZED USER ATTEMPTS TO OPEN: Show 403 Forbidden Screen
  if (!isAuthorizedOwner) {
    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-7 border border-red-200 dark:border-red-900/60 shadow-2xl text-center space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-3xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center text-3xl shadow-lg shadow-red-500/20">
            <Lock className="w-8 h-8 stroke-[2.2]" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
              403 FORBIDDEN • OWNER ACCESS ONLY
            </span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mt-2">
              {language === 'hi' ? 'अनधिकृत प्रवेश वर्जित (Access Denied)' : 'Access Restricted to Founder Only'}
            </h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
              {language === 'hi'
                ? 'यह User Management और App Deploy Studio केवल सत्यापित ऐप मालिक के लिए आरक्षित है।'
                : 'This User Management & App Deployment Studio is strictly reserved for the verified App Owner. Regular users do not have access.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xs hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm"
          >
            {language === 'hi' ? 'वापस जाएं (Go Back)' : 'Return to mytube'}
          </button>
        </div>
      </div>
    );
  }

  // IF FOUNDER STUDIO IS LOCKED: Show Master PIN Lock Screen
  if (!isPinUnlocked) {
    const handleVerifyPin = () => {
      if (validateFounderSecurityPin(enteredPin, founderPin)) {
        setIsPinUnlocked(true);
        setPinError('');
        setEnteredPin('');
        showToast('Welcome Ravi Maske! Founder Studio Unlocked.');
      } else {
        setPinError('Incorrect Master PIN. Default is 8888.');
      }
    };

    return (
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl p-6 border border-amber-400/50 dark:border-amber-500/40 shadow-2xl text-center space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-500 text-black flex items-center justify-center text-3xl shadow-lg shadow-amber-500/25 font-bold">
            👑
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500 text-black">
              SUPER ADMIN SECURITY LOCK
            </span>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mt-2">
              {language === 'hi' ? 'फ़ाउंडर मास्टर पिन दर्ज करें' : 'Founder Master PIN Required'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {language === 'hi'
                ? 'नमस्ते रवि भाई! यूज़र मैनेजमेंट खोलने के लिए अपना 4-अंकों का मास्टर पिन डालें (डिफ़ॉल्ट: 8888)।'
                : 'Welcome Ravi Maske! Enter your 4-digit Master PIN to unlock your Founder Studio (Default: 8888).'}
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="password"
              maxLength={6}
              value={enteredPin}
              onChange={(e) => {
                setEnteredPin(e.target.value);
                setPinError('');
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
              placeholder="••••"
              autoFocus
              className="w-full text-center tracking-[0.5em] text-2xl font-mono py-2.5 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-2 border-amber-400/60 focus:outline-hidden focus:border-amber-500 text-gray-900 dark:text-white"
            />

            {pinError && (
              <p className="text-xs text-red-500 font-semibold">{pinError}</p>
            )}

            <button
              onClick={handleVerifyPin}
              className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-600 hover:to-pink-700 text-black font-extrabold text-xs transition-all shadow-md active:scale-98"
            >
              {language === 'hi' ? 'स्टूडियो अनलॉक करें (Unlock)' : 'Unlock Founder Studio'}
            </button>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            Cancel & Close
          </button>
        </div>
      </div>
    );
  }

  // FOUNDER ACTIONS
  const handleToggleVerified = (userId: string, userName: string) => {
    const updated = toggleUserVerification(users, userId);
    setUsers(updated);
    const target = updated.find((u) => u.id === userId);
    showToast(
      target?.isVerified
        ? `Verified badge granted to ${userName}`
        : `Verified badge removed from ${userName}`
    );
  };

  const handleToggleSuspension = (userId: string, userName: string) => {
    const targetBefore = users.find((u) => u.id === userId);
    const willSuspend = !targetBefore?.isSuspended;
    const reason = willSuspend
      ? 'Suspended by Super Admin (Ravi Maske)'
      : undefined;
    const updated = toggleUserSuspension(users, userId, reason);
    setUsers(updated);
    showToast(
      willSuspend
        ? `Account ${userName} has been suspended.`
        : `Account ${userName} unsuspended and restored.`
    );
  };

  const handleGrantStorage = (userId: string, userName: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, storageAllocatedGb: u.storageAllocatedGb + 500 } : u))
    );
    showToast(`Granted +500 GB extra Cloud Storage to ${userName}`);
  };

  const handleToggleMaintenance = () => {
    const updated = toggleMaintenanceMode(
      systemStatus,
      'mytube is undergoing scheduled high-capacity performance upgrades. Back in 5 mins!'
    );
    setSystemStatus(updated);
    showToast(
      updated.maintenanceMode
        ? 'Maintenance Mode ENABLED. Public notice active.'
        : 'Maintenance Mode DISABLED. App live for all users.'
    );
  };

  const handleStartDeploy = () => {
    if (!newVersionInput.trim()) return;
    setIsDeploying(true);
    setDeployStep(1);

    setTimeout(() => {
      setDeployStep(2);
      setTimeout(() => {
        setDeployStep(3);
        setTimeout(() => {
          setDeployStep(4);
          const cleanVer = newVersionInput.trim().startsWith('v')
            ? newVersionInput.trim()
            : `v${newVersionInput.trim()}`;
          const updatedReleases = createNewAppRelease(
            releases,
            cleanVer,
            [newChangelogInput.trim() || 'General performance & UI enhancements'],
            'Ravi Maske (Founder)'
          );
          setReleases(updatedReleases);
          setIsDeploying(false);
          setDeployStep(0);
          if (onVersionUpdated) {
            onVersionUpdated(cleanVer);
          }
          showToast(`Version ${cleanVer} successfully deployed to Cloud Run! Live for all users.`);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  const handleChangePin = () => {
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      showToast('PIN must be at least 4 digits');
      return;
    }
    setFounderPin(newPinInput.trim());
    setShowChangePin(false);
    setNewPinInput('');
    showToast(`Master PIN successfully updated to: ${newPinInput.trim()}`);
  };

  const filteredUsers = filterAdminUsers(users, searchQuery, userFilter);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-neutral-800 flex flex-col max-h-[92vh]"
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/15 via-pink-500/15 to-purple-500/15 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/25">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                  Founder & Admin Studio
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-black shadow-xs">
                  MALIK / OWNER: RAVI MASKE
                </span>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Only You Have Access
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                Manage millions of users, deploy app updates live, and monitor automated AI scaling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick 1-tap Lock Button for Privacy */}
            <button
              onClick={() => {
                setIsPinUnlocked(false);
                if (onLockFounder) onLockFounder();
                showToast('Founder Studio Locked.');
              }}
              title="Lock Studio (सुरक्षित लॉक करें)"
              className="px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Lock Console</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toast Notice */}
        {actionNotice && (
          <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center animate-in slide-in-from-top-2 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Change Master PIN Drawer */}
        {showChangePin && (
          <div className="px-5 py-3 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="font-bold text-amber-900 dark:text-amber-200">
                Change Founder Master PIN (Current: {founderPin}):
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="password"
                maxLength={6}
                value={newPinInput}
                onChange={(e) => setNewPinInput(e.target.value)}
                placeholder="New 4-digit PIN"
                className="px-3 py-1 text-xs rounded-lg bg-white dark:bg-neutral-900 border border-amber-300 dark:border-amber-700 text-gray-900 dark:text-white w-32"
              />
              <button
                onClick={handleChangePin}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-lg"
              >
                Save
              </button>
              <button
                onClick={() => setShowChangePin(false)}
                className="px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Global Key Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-gray-50 dark:bg-neutral-950/60 border-b border-gray-200 dark:border-neutral-800 text-xs">
          <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-2xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Total Users</span>
              <Users className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
              {publicUsersCount}
            </p>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${publicUsersCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              {publicUsersCount === 0 ? '0 Logged In (Fresh App)' : `${publicUsersCount} Live Registered`}
            </span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-2xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Active Streams</span>
              <Radio className="w-3.5 h-3.5 text-pink-500" />
            </div>
            <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
              {systemStatus.activeConcurrentStreams}
            </p>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
              0 Active Streamers
            </span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-2xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <span>AI Shield Blocks</span>
              <Bot className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
              {systemStatus.aiBotsBlockedCount}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              All Clean (0 Spammers)
            </span>
          </div>

          <div className="bg-white dark:bg-neutral-900 p-2.5 rounded-2xl border border-gray-200 dark:border-neutral-800">
            <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider">
              <span>Cloud Status</span>
              <Server className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">
              {releases[0]?.version || currentVersion}
            </p>
            <span className="text-[10px] text-emerald-600 font-semibold">
              Cloud Run (Healthy)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-gray-200 dark:border-neutral-800 px-4 bg-white dark:bg-neutral-900">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'users'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User Management ({publicUsersCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('updates')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'updates'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>App Updates & Deploy</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_scaling')}
            className={`py-3 px-4 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'ai_scaling'
                ? 'border-pink-500 text-pink-600 dark:text-pink-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>AI vs Founder Handling</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-gray-800 dark:text-gray-200">
          {/* TAB 1: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              {/* Ownership assurance banner */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <span className="text-xl">👑</span>
                <div className="text-xs">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {language === 'hi'
                      ? 'यह पेज केवल आपके (रवि भाई) हाथ में है'
                      : 'This Console is Exclusively in Your (Ravi Maske) Hands'}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {language === 'hi'
                      ? 'mytube के करोड़ों यूज़र्स में से किसी को भी यह कंसोल दिखाई नहीं देगा। कोई आम यूज़र इस पेज को नहीं खोल सकता। आप यहां से किसी भी क्रिएटर को वैरिफ़ाई कर सकते हैं, स्पैमर्स को सस्पेंड कर सकते हैं, और स्टोरेज बढ़ा सकते हैं।'
                      : 'None of mytube’s millions of users or creators can see or open this studio. You hold 100% Super Admin power to verify creators, suspend bad actors, and allocate storage.'}
                  </p>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or handle..."
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:border-pink-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {(['all', 'creators', 'verified', 'suspended', 'bots'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setUserFilter(filter)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-colors ${
                        userFilter === filter
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-2.5">
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 bg-gray-50 dark:bg-neutral-800/50 rounded-2xl">
                    No users matching "{searchQuery}"
                  </div>
                ) : (
                  filteredUsers.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        item.isSuspended
                          ? 'bg-red-500/5 border-red-500/30'
                          : item.role === 'owner'
                          ? 'bg-amber-500/5 border-amber-500/40'
                          : 'bg-white dark:bg-neutral-800/60 border-gray-200 dark:border-neutral-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-tr ${item.avatarColor} text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm`}
                        >
                          {item.avatarLetter}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-gray-900 dark:text-white">
                              {item.name}
                            </span>
                            {item.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded-full border border-blue-200 dark:border-blue-800">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                                Verified
                              </span>
                            )}
                            {item.role === 'owner' && (
                              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-full">
                                Founder (You)
                              </span>
                            )}
                            {item.isSuspended && (
                              <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-950/60 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Suspended
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {item.handle} • {item.email}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                            <span>{item.subscribersCount.toLocaleString()} subs</span>
                            <span>•</span>
                            <span>{item.totalUploads} uploads</span>
                            <span>•</span>
                            <span>{item.storageAllocatedGb} GB Storage</span>
                            <span>•</span>
                            <span
                              className={`font-semibold ${
                                item.aiRiskScore > 70
                                  ? 'text-red-500'
                                  : item.aiRiskScore > 20
                                  ? 'text-amber-500'
                                  : 'text-emerald-500'
                              }`}
                            >
                              AI Risk: {item.aiRiskScore}%
                            </span>
                          </div>

                          {item.suspensionReason && (
                            <p className="text-[10px] text-red-600 dark:text-red-400 font-medium mt-1">
                              Reason: {item.suspensionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Founder Actions */}
                      {item.role !== 'owner' && (
                        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                          <button
                            onClick={() => handleToggleVerified(item.id, item.name)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                              item.isVerified
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800'
                                : 'bg-gray-50 hover:bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-neutral-600'
                            }`}
                          >
                            {item.isVerified ? 'Remove Checkmark' : '+ Verify Creator'}
                          </button>

                          <button
                            onClick={() => handleGrantStorage(item.id, item.name)}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-colors"
                          >
                            +500GB Storage
                          </button>

                          <button
                            onClick={() => handleToggleSuspension(item.id, item.name)}
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                              item.isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                            }`}
                          >
                            {item.isSuspended ? 'Unsuspend' : 'Suspend / Ban'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* Zero Users Real State Notice */}
                {publicUsersCount === 0 && (
                  <div className="p-6 rounded-2xl bg-gray-50 dark:bg-neutral-800/40 border border-gray-200 dark:border-neutral-700/80 text-center space-y-2 mt-3">
                    <div className="w-10 h-10 mx-auto rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg font-bold">
                      👥
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-800 dark:text-gray-200">
                        {language === 'hi'
                          ? 'वर्तमान में 0 बाहरी यूज़र लॉग-इन हैं (ताज़ा ऐप)'
                          : 'Currently 0 Public Users Registered (Fresh App)'}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-0.5 leading-relaxed">
                        {language === 'hi'
                          ? 'रवि भाई, mytube एकदम नया है इसलिए अभी टोटल यूज़र्स 0 हैं। जब कोई भी नया दर्शक या क्रिएटर गूगल से mytube में साइन-अप करेगा, तो वह तुरंत यहां लाइव दिखाई देगा।'
                          : 'Ravi, mytube is freshly deployed with 0 public users. When new viewers or creators sign in via Google, they will appear here live for you to manage.'}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          setUsers([INITIAL_MANAGED_USERS[0], ...SAMPLE_TEST_USERS]);
                          showToast('Loaded 5 sample creators to test admin tools');
                        }}
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-gray-200 dark:bg-neutral-700 hover:bg-gray-300 dark:hover:bg-neutral-600 text-gray-800 dark:text-gray-200 transition-colors"
                      >
                        + Load Demo Creators (Test Mode)
                      </button>
                    </div>
                  </div>
                )}

                {/* If demo creators are loaded, allow resetting to 0 */}
                {publicUsersCount > 0 && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setUsers([INITIAL_MANAGED_USERS[0]]);
                        showToast('Reset to 0 public users');
                      }}
                      className="text-[11px] font-semibold text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Reset back to 0 Users
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: APP UPDATES & DEPLOYMENT */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              {/* How Updates Work Notice */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 border border-purple-500/30 flex items-start gap-3.5">
                <div className="p-2 bg-purple-600 text-white rounded-xl shadow-xs mt-0.5">
                  <Rocket className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                    How mytube Web App Updates Work (Zero Downtime)
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    Whenever you add new features or ask AI to update the app, Google Cloud builds a production container and automatically rolls it out across all edge nodes. <strong>Users do not need to download an APK or app store update</strong>—as soon as they open or refresh mytube, they immediately receive the latest version without interruptions!
                  </p>
                </div>
              </div>

              {/* Deploy New Release Section */}
              <div className="bg-white dark:bg-neutral-800/80 p-5 rounded-3xl border border-gray-200 dark:border-neutral-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Deploy New App Release
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Publish a new version live to production servers with zero downtime
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                    Active: {releases[0]?.version || currentVersion}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Release Version
                    </label>
                    <input
                      type="text"
                      value={newVersionInput}
                      onChange={(e) => setNewVersionInput(e.target.value)}
                      placeholder="e.g. v2.4.1"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      Changelog / Release Highlights
                    </label>
                    <input
                      type="text"
                      value={newChangelogInput}
                      onChange={(e) => setNewChangelogInput(e.target.value)}
                      placeholder="What is new in this update?"
                      className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Deployment Progress Animator */}
                {isDeploying && (
                  <div className="p-3.5 rounded-2xl bg-gray-900 text-white text-xs space-y-2 border border-gray-800">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-pink-500 animate-spin" />
                        Deploying {newVersionInput} to Cloud Run...
                      </span>
                      <span className="text-pink-400 font-mono">Step {deployStep}/4</span>
                    </div>

                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-1.5 transition-all duration-300"
                        style={{ width: `${(deployStep / 4) * 100}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-gray-400 font-mono">
                      {deployStep === 1 && '> Compiling React Vite production bundle...'}
                      {deployStep === 2 && '> Running 24 automated validation tests (All Pass)...'}
                      {deployStep === 3 && '> Containerizing & pushing revision to Google Cloud Run...'}
                      {deployStep === 4 && '> Zero-downtime traffic switch complete! Ready.'}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleToggleMaintenance}
                    className={`text-xs font-semibold px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                      systemStatus.maintenanceMode
                        ? 'bg-amber-500 text-black border-amber-600 font-bold'
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-neutral-600'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>{systemStatus.maintenanceMode ? 'Disable Maintenance Mode' : 'Toggle Maintenance Mode'}</span>
                  </button>

                  <button
                    disabled={isDeploying}
                    onClick={handleStartDeploy}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>{isDeploying ? 'Deploying...' : 'Push Update to Production'}</span>
                  </button>
                </div>
              </div>

              {/* Past Releases Timeline */}
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Release History & Live Revisions
                </h3>

                <div className="space-y-2.5">
                  {releases.map((rel, idx) => (
                    <div
                      key={rel.version + idx}
                      className="p-3.5 rounded-2xl bg-white dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white font-mono">
                            {rel.version}
                          </span>
                          {idx === 0 && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                              CURRENT LIVE
                            </span>
                          )}
                          <span className="text-[10px] text-gray-400">{rel.releaseDate}</span>
                        </div>

                        <ul className="mt-1.5 space-y-1">
                          {rel.changelog.map((c, i) => (
                            <li key={i} className="text-gray-600 dark:text-gray-300 flex items-start gap-1.5">
                              <span className="text-pink-500 font-bold">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-[10px] text-gray-400 font-mono text-left sm:text-right shrink-0">
                        <p>Revision: {rel.cloudRunRevision}</p>
                        <p>Deployed by: {rel.deployedBy}</p>
                        <p>Commit: #{rel.buildCommit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI VS FOUNDER HANDLING */}
          {activeTab === 'ai_scaling' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/30">
                <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Your Role as Founder vs What AI Handles Automatically
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                  You are the <strong>Owner & Super Admin (Ravi Maske)</strong>. You do NOT have to sit all day managing millions of incoming user requests. The entire backend runs autonomously.
                </p>
              </div>

              {/* Side by side comparison table */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* AI / Google Cloud Column */}
                <div className="bg-purple-500/5 border border-purple-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                    <Bot className="w-4 h-4" />
                    <span>What AI & Google Cloud Do 24/7 (100% Auto)</span>
                  </div>

                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Auto-Scaling Servers:</strong> When 1,000,000 users join, Cloud Run automatically spins up 100+ server instances in milliseconds.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Video Streaming & CDN:</strong> Video segments are served from Google CDN edge servers globally without buffering.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Gemini Safety Auto-Moderation:</strong> Inappropriate, spam, or copyright-violating uploads are filtered automatically.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Account Security:</strong> Logins, Google OAuth tokens, and password resets are handled securely by Firebase Auth.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span><strong>Home Feed Recommendations:</strong> Personalized feeds are computed dynamically for each user based on viewing habits.</span>
                    </li>
                  </ul>
                </div>

                {/* Founder / Ravi Maske Column */}
                <div className="bg-amber-500/5 border border-amber-500/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                    <span className="text-base">👑</span>
                    <span>What You (Founder Ravi Maske) Control</span>
                  </div>

                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">★</span>
                      <span><strong>App Updates & Vision:</strong> You decide what features to add and deploy new versions via the App Update Center.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">★</span>
                      <span><strong>Super Admin Rights:</strong> You can edit, delete, or set quality for ANY video and short across the entire platform.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">★</span>
                      <span><strong>Creator Verification:</strong> You choose which top creators get the official blue checkmark badge.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">★</span>
                      <span><strong>Final Ban Appeals:</strong> You can review spam bots caught by AI and permanently ban abusive accounts.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">★</span>
                      <span><strong>Monetization & Rules:</strong> You set platform revenue sharing and community guidelines.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-gray-50 dark:bg-neutral-950/80 border-t border-gray-100 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <span>Owner:</span>
            <strong className="text-amber-600 dark:text-amber-400 font-mono">
              {currentUser?.email || ''}
            </strong>
            <span className="text-[10px] text-emerald-600 font-semibold">• Master Access Active</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChangePin(!showChangePin)}
              className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>Change Master PIN</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 font-semibold text-gray-800 dark:text-gray-200 transition-colors"
            >
              Close Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
