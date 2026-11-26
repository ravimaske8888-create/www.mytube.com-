export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatarLetter: string;
  avatarColor: string;
  role: 'owner' | 'creator' | 'viewer' | 'bot';
  subscribersCount: number;
  totalUploads: number;
  isVerified: boolean;
  isSuspended: boolean;
  joinDate: string;
  storageAllocatedGb: number;
  aiRiskScore: number; // 0 to 100 (0 = clean, >80 = spammer/bot)
  suspensionReason?: string;
}

export interface AppRelease {
  version: string;
  releaseDate: string;
  status: 'production' | 'rolling_out' | 'draft';
  changelog: string[];
  deployedBy: string;
  buildCommit: string;
  cloudRunRevision: string;
}

export interface SystemStatus {
  totalUsersCount: number;
  activeConcurrentStreams: number;
  aiBotsBlockedCount: number;
  cloudRunInstancesActive: number;
  cdnHitRatioPercent: number;
  maintenanceMode: boolean;
  maintenanceNotice: string;
}

export const INITIAL_SYSTEM_STATUS: SystemStatus = {
  totalUsersCount: 0,
  activeConcurrentStreams: 0,
  aiBotsBlockedCount: 0,
  cloudRunInstancesActive: 1,
  cdnHitRatioPercent: 100,
  maintenanceMode: false,
  maintenanceNotice: '',
};

export const INITIAL_MANAGED_USERS: ManagedUser[] = [];

export const SAMPLE_TEST_USERS: ManagedUser[] = [
  {
    id: 'user-neha',
    name: 'Tech with Neha',
    email: 'neha.tech@example.com',
    handle: '@nehatech',
    avatarLetter: 'N',
    avatarColor: 'from-pink-500 to-rose-600',
    role: 'creator',
    subscribersCount: 420000,
    totalUploads: 32,
    isVerified: true,
    isSuspended: false,
    joinDate: 'Feb 2024',
    storageAllocatedGb: 500,
    aiRiskScore: 2,
  },
  {
    id: 'user-aman',
    name: 'Aman Gaming',
    email: 'aman.gaming@example.com',
    handle: '@amangames',
    avatarLetter: 'A',
    avatarColor: 'from-purple-500 to-indigo-600',
    role: 'creator',
    subscribersCount: 280000,
    totalUploads: 64,
    isVerified: false,
    isSuspended: false,
    joinDate: 'Mar 2024',
    storageAllocatedGb: 250,
    aiRiskScore: 12,
  },
  {
    id: 'user-spambot1',
    name: 'Crypto Free Coins 2025',
    email: 'bot981@spammail.org',
    handle: '@cryptofree_bot',
    avatarLetter: 'C',
    avatarColor: 'from-red-500 to-amber-700',
    role: 'bot',
    subscribersCount: 0,
    totalUploads: 140,
    isVerified: false,
    isSuspended: true,
    joinDate: 'Yesterday',
    storageAllocatedGb: 0,
    aiRiskScore: 98,
    suspensionReason: 'AI Gemini Shield: Automated spam & unauthorized link injection',
  },
  {
    id: 'user-vikram',
    name: 'Vikram Street Explorer',
    email: 'vikram.travel@example.com',
    handle: '@vikramtravels',
    avatarLetter: 'V',
    avatarColor: 'from-emerald-500 to-teal-600',
    role: 'creator',
    subscribersCount: 95000,
    totalUploads: 21,
    isVerified: false,
    isSuspended: false,
    joinDate: 'May 2024',
    storageAllocatedGb: 100,
    aiRiskScore: 5,
  },
  {
    id: 'user-priya',
    name: 'Priya Kitchen & Vlogs',
    email: 'priya.cooks@example.com',
    handle: '@priyacooks',
    avatarLetter: 'P',
    avatarColor: 'from-orange-500 to-yellow-600',
    role: 'creator',
    subscribersCount: 162000,
    totalUploads: 43,
    isVerified: true,
    isSuspended: false,
    joinDate: 'Apr 2024',
    storageAllocatedGb: 200,
    aiRiskScore: 1,
  },
];

export const INITIAL_APP_RELEASES: AppRelease[] = [
  {
    version: 'v2.4.0',
    releaseDate: 'Today (Active)',
    status: 'production',
    changelog: [
      'Added full Video & Shorts Edit, Delete, and Quality selection in 3-dot menu',
      'All UI text and settings standardized to clean, accessible English',
      'Unified Developer & Founder Master Access for Ravi Maske (Super Admin)',
      'High-speed local and CDN adaptive buffering',
    ],
    deployedBy: 'Ravi Maske (Founder)',
    buildCommit: 'c4e97a1',
    cloudRunRevision: 'mytube-prod-00240-live',
  },
  {
    version: 'v2.3.0',
    releaseDate: '3 days ago',
    status: 'production',
    changelog: [
      'Shorts auto-scroll and double-tap like mechanics',
      'Direct MP4 device video upload with local preview caching',
      'Channel customization with avatar and banner palettes',
    ],
    deployedBy: 'Ravi Maske (Founder)',
    buildCommit: '8d2a10b',
    cloudRunRevision: 'mytube-prod-00230-stable',
  },
];

export function toggleUserVerification(users: ManagedUser[], userId: string): ManagedUser[] {
  return users.map((u) => {
    if (u.id === userId) {
      return { ...u, isVerified: !u.isVerified };
    }
    return u;
  });
}

export function toggleUserSuspension(
  users: ManagedUser[],
  userId: string,
  reason?: string
): ManagedUser[] {
  return users.map((u) => {
    if (u.id === userId) {
      const willSuspend = !u.isSuspended;
      return {
        ...u,
        isSuspended: willSuspend,
        suspensionReason: willSuspend
          ? reason || 'Manually suspended by Super Admin (Ravi Maske)'
          : undefined,
      };
    }
    return u;
  });
}

export function filterAdminUsers(
  users: ManagedUser[],
  query: string,
  filterType: 'all' | 'creators' | 'verified' | 'suspended' | 'bots'
): ManagedUser[] {
  const q = query.trim().toLowerCase();
  return users.filter((u) => {
    const matchesQuery =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q);

    if (!matchesQuery) return false;

    if (filterType === 'creators') return u.role === 'creator' || u.role === 'owner';
    if (filterType === 'verified') return u.isVerified;
    if (filterType === 'suspended') return u.isSuspended;
    if (filterType === 'bots') return u.role === 'bot' || u.aiRiskScore > 70;
    return true;
  });
}

export function createNewAppRelease(
  releases: AppRelease[],
  version: string,
  changelogItems: string[],
  deployedBy: string = 'Ravi Maske (Founder)'
): AppRelease[] {
  const cleanVersion = version.startsWith('v') ? version : `v${version}`;
  const newRelease: AppRelease = {
    version: cleanVersion,
    releaseDate: 'Just now',
    status: 'production',
    changelog: changelogItems.filter(Boolean),
    deployedBy,
    buildCommit: Math.random().toString(16).substring(2, 9),
    cloudRunRevision: `mytube-prod-${cleanVersion.replace(/\./g, '')}-${Date.now().toString().slice(-4)}`,
  };

  // Mark previous releases as archived
  const updatedPrevious = releases.map((r) => ({
    ...r,
    status: 'production' as const,
  }));

  return [newRelease, ...updatedPrevious];
}

export function toggleMaintenanceMode(
  currentStatus: SystemStatus,
  customMessage?: string
): SystemStatus {
  const nextState = !currentStatus.maintenanceMode;
  return {
    ...currentStatus,
    maintenanceMode: nextState,
    maintenanceNotice: nextState
      ? customMessage || 'mytube is briefly undergoing high-capacity maintenance. We will be back online in minutes!'
      : '',
  };
}

export const FOUNDER_EMAIL = 'ravimaske8888@gmail.com';
export const FOUNDER_DEFAULT_PIN = '8888';

export function isFounderEmail(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === FOUNDER_EMAIL.toLowerCase();
}

export function isFounderOwner(
  user: { email?: string; isGoogleUser?: boolean; emailVerified?: boolean } | null | undefined
): boolean {
  if (!user || !user.email) return false;
  if (user.isGoogleUser !== true || user.emailVerified !== true) return false;
  return isFounderEmail(user.email);
}

export function validateFounderSecurityPin(inputPin: string, customPin?: string): boolean {
  const targetPin = (customPin || FOUNDER_DEFAULT_PIN).trim();
  return inputPin.trim() === targetPin;
}

/**
 * Founder/Admin access is unlocked ONLY when:
 * 1. User is authenticated via verified Google Sign-In as the founder email, AND
 * 2. Master PIN (8888) has been explicitly verified in the current session.
 */
export function isFounderFullyUnlocked(
  user: { email?: string; isGoogleUser?: boolean; emailVerified?: boolean } | null | undefined,
  isPinVerified: boolean
): boolean {
  return isFounderOwner(user) && isPinVerified === true;
}

export function checkFounderAccess(
  user: { email?: string; isGoogleUser?: boolean; emailVerified?: boolean } | null | undefined,
  pinEntered?: string,
  sessionVerified?: boolean,
  customPin?: string
): { allowed: boolean; status: 'authorized' | 'pin_required' | 'unauthorized'; reason: string } {
  if (!isFounderOwner(user)) {
    return {
      allowed: false,
      status: 'unauthorized',
      reason:
        'Access Denied: Only the verified Founder Google account is authorized to access Founder & Admin Studio.',
    };
  }

  if (sessionVerified) {
    return {
      allowed: true,
      status: 'authorized',
      reason: 'Authorized as Founder with verified Master PIN.',
    };
  }

  if (pinEntered && validateFounderSecurityPin(pinEntered, customPin)) {
    return {
      allowed: true,
      status: 'authorized',
      reason: 'Founder Master PIN successfully verified.',
    };
  }

  return {
    allowed: false,
    status: 'pin_required',
    reason:
      'Security Verification Required: Enter your Master PIN to unlock Founder & Admin Dashboard.',
  };
}
