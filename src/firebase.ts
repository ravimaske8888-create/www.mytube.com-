import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { UserProfile, AppSettings, VideoItem } from './types';
import { DEFAULT_SETTINGS } from './utils/storage';
import { ManagedUser } from './utils/admin';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Firestore with specific database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test server connection as per Firebase Integration skill
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline check:', error.message);
    }
  }
}
testFirestoreConnection();

function clampStr(val: string | undefined | null, maxLen: number): string {
  return (val || '').trim().slice(0, maxLen);
}

const ALLOWED_PROFILE_KEYS = new Set([
  'id',
  'name',
  'email',
  'handle',
  'avatarUrl',
  'channelDescription',
  'subscribersCount',
  'joinedDate',
  'cloudStorageTier',
  'createdAt',
  'updatedAt',
]);

const inFlightProfileSyncs = new Map<string, Promise<UserProfile>>();

function isTimestampLike(val: unknown): val is { toMillis: () => number } {
  return Boolean(val && typeof val === 'object' && typeof (val as { toMillis?: unknown }).toMillis === 'function');
}

function isConformantExistingProfile(data: Record<string, unknown>, uid: string, email: string): boolean {
  const keys = Object.keys(data);
  if (keys.some((k) => !ALLOWED_PROFILE_KEYS.has(k))) return false;
  return (
    data.id === uid &&
    typeof data.name === 'string' &&
    data.name.length >= 1 &&
    data.email === email &&
    typeof data.handle === 'string' &&
    data.handle.length >= 2 &&
    typeof data.subscribersCount === 'number' &&
    typeof data.joinedDate === 'string' &&
    typeof data.cloudStorageTier === 'string' &&
    isTimestampLike(data.createdAt)
  );
}

/**
 * Create or sync an independent Firestore profile for the signed-in Google user.
 * Deduplicated per UID so concurrent signInWithGoogle + onAuthStateChanged never race.
 */
export function syncUserProfileToFirestore(fbUser: User): Promise<UserProfile> {
  const existingPromise = inFlightProfileSyncs.get(fbUser.uid);
  if (existingPromise) {
    return existingPromise;
  }

  const syncPromise = (async (): Promise<UserProfile> => {
    const userPath = `users/${fbUser.uid}`;
    const userRef = doc(db, 'users', fbUser.uid);

    const fallbackName = clampStr(fbUser.displayName, 120) || 'MyTube User';
    const safeEmail = clampStr(fbUser.email, 254);
    const rawHandleSlug =
      fallbackName.toLowerCase().replace(/[^a-z0-9]/g, '') ||
      (safeEmail.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '') ||
      'user';
    const fallbackHandle = clampStr(`@${rawHandleSlug}`, 64);
    const joinedMonthYear = new Date().toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });

    try {
      const existingSnap = await getDoc(userRef);

      if (existingSnap.exists()) {
        const data = existingSnap.data();
        const safeHandle =
          typeof data.handle === 'string' && data.handle.trim().length >= 2
            ? clampStr(data.handle, 64)
            : fallbackHandle;
        const resolvedName = clampStr(typeof data.name === 'string' ? data.name : '', 120) || fallbackName;
        const resolvedAvatar = clampStr(
          fbUser.photoURL || (typeof data.avatarUrl === 'string' ? data.avatarUrl : ''),
          1000
        );
        const resolvedBio =
          clampStr(typeof data.channelDescription === 'string' ? data.channelDescription : '', 1000) ||
          'Official mytube channel';
        const resolvedSubs =
          typeof data.subscribersCount === 'number' && data.subscribersCount >= 0 ? data.subscribersCount : 0;
        const resolvedJoined =
          clampStr(typeof data.joinedDate === 'string' ? data.joinedDate : '', 120) || joinedMonthYear;
        const resolvedTier =
          clampStr(typeof data.cloudStorageTier === 'string' ? data.cloudStorageTier : '', 120) ||
          'Google Cloud Storage';

        if (isConformantExistingProfile(data, fbUser.uid, safeEmail)) {
          await updateDoc(userRef, {
            name: resolvedName,
            avatarUrl: resolvedAvatar,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Safely normalize any legacy or partial profile doc to match the hardened blueprint
          await setDoc(userRef, {
            id: fbUser.uid,
            name: resolvedName,
            email: safeEmail,
            handle: safeHandle,
            avatarUrl: resolvedAvatar,
            channelDescription: resolvedBio,
            subscribersCount: resolvedSubs,
            joinedDate: resolvedJoined,
            cloudStorageTier: resolvedTier,
            createdAt: isTimestampLike(data.createdAt) ? data.createdAt : serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        }

        // Ensure settings doc exists without overwriting customized preferences
        const settingsRef = doc(db, 'users', fbUser.uid, 'settings', 'preferences');
        const settingsSnap = await getDoc(settingsRef);
        if (!settingsSnap.exists()) {
          await setDoc(settingsRef, {
            userId: fbUser.uid,
            uploadWifiOnly: DEFAULT_SETTINGS.uploadWifiOnly,
            hdUpload: DEFAULT_SETTINGS.hdUpload,
            pushNotifications: DEFAULT_SETTINGS.pushNotifications,
            subscriptionsAlert: DEFAULT_SETTINGS.subscriptionsAlert,
            darkTheme: DEFAULT_SETTINGS.darkTheme,
            language: DEFAULT_SETTINGS.language,
            updatedAt: serverTimestamp(),
          });
        }

        return {
          id: fbUser.uid,
          name: resolvedName,
          email: safeEmail,
          handle: safeHandle,
          avatarUrl: resolvedAvatar || undefined,
          channelDescription: resolvedBio,
          subscribersCount: resolvedSubs,
          joinedDate: resolvedJoined,
          isGoogleUser: true,
          emailVerified: fbUser.emailVerified,
          cloudStorageTier: resolvedTier,
        };
      }

      const newProfilePayload = {
        id: fbUser.uid,
        name: fallbackName,
        email: safeEmail,
        handle: fallbackHandle,
        avatarUrl: clampStr(fbUser.photoURL, 1000),
        channelDescription: 'Official mytube channel',
        subscribersCount: 0,
        joinedDate: joinedMonthYear,
        cloudStorageTier: 'Google Cloud Storage',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(userRef, newProfilePayload);

      // Initialize isolated default settings for this new user
      const settingsRef = doc(db, 'users', fbUser.uid, 'settings', 'preferences');
      await setDoc(settingsRef, {
        userId: fbUser.uid,
        uploadWifiOnly: DEFAULT_SETTINGS.uploadWifiOnly,
        hdUpload: DEFAULT_SETTINGS.hdUpload,
        pushNotifications: DEFAULT_SETTINGS.pushNotifications,
        subscriptionsAlert: DEFAULT_SETTINGS.subscriptionsAlert,
        darkTheme: DEFAULT_SETTINGS.darkTheme,
        language: DEFAULT_SETTINGS.language,
        updatedAt: serverTimestamp(),
      });

      return {
        id: fbUser.uid,
        name: newProfilePayload.name,
        email: safeEmail,
        handle: newProfilePayload.handle,
        avatarUrl: newProfilePayload.avatarUrl || undefined,
        channelDescription: newProfilePayload.channelDescription,
        subscribersCount: 0,
        joinedDate: newProfilePayload.joinedDate,
        isGoogleUser: true,
        emailVerified: fbUser.emailVerified,
        cloudStorageTier: newProfilePayload.cloudStorageTier,
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    } finally {
      inFlightProfileSyncs.delete(fbUser.uid);
    }
  })();

  inFlightProfileSyncs.set(fbUser.uid, syncPromise);
  return syncPromise;
}

export async function updateUserProfileInFirestore(
  uid: string,
  updates: { name?: string; handle?: string; channelDescription?: string }
): Promise<void> {
  const path = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.name !== undefined) payload.name = clampStr(updates.name, 120) || 'My Channel';
    if (updates.handle !== undefined) {
      const cleanHandle = updates.handle.startsWith('@') ? updates.handle : `@${updates.handle}`;
      const clampedHandle = clampStr(cleanHandle, 64);
      payload.handle = clampedHandle.length >= 2 ? clampedHandle : '@channel';
    }
    if (updates.channelDescription !== undefined) {
      payload.channelDescription = clampStr(updates.channelDescription, 1000);
    }
    await updateDoc(userRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// ==================== PER-USER SETTINGS ====================
export async function loadUserSettingsFromFirestore(uid: string): Promise<AppSettings | null> {
  const path = `users/${uid}/settings/preferences`;
  try {
    const snap = await getDoc(doc(db, 'users', uid, 'settings', 'preferences'));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      uploadWifiOnly: typeof d.uploadWifiOnly === 'boolean' ? d.uploadWifiOnly : DEFAULT_SETTINGS.uploadWifiOnly,
      hdUpload: typeof d.hdUpload === 'boolean' ? d.hdUpload : DEFAULT_SETTINGS.hdUpload,
      pushNotifications:
        typeof d.pushNotifications === 'boolean' ? d.pushNotifications : DEFAULT_SETTINGS.pushNotifications,
      subscriptionsAlert:
        typeof d.subscriptionsAlert === 'boolean' ? d.subscriptionsAlert : DEFAULT_SETTINGS.subscriptionsAlert,
      darkTheme: typeof d.darkTheme === 'boolean' ? d.darkTheme : DEFAULT_SETTINGS.darkTheme,
      language: d.language === 'hi' ? 'hi' : 'en',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserSettingsToFirestore(uid: string, settings: AppSettings): Promise<void> {
  const path = `users/${uid}/settings/preferences`;
  try {
    await setDoc(doc(db, 'users', uid, 'settings', 'preferences'), {
      userId: uid,
      uploadWifiOnly: Boolean(settings.uploadWifiOnly),
      hdUpload: Boolean(settings.hdUpload),
      pushNotifications: Boolean(settings.pushNotifications),
      subscriptionsAlert: Boolean(settings.subscriptionsAlert),
      darkTheme: Boolean(settings.darkTheme),
      language: settings.language === 'hi' ? 'hi' : 'en',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== PER-USER WATCH HISTORY ====================
export async function loadUserHistoryFromFirestore(uid: string): Promise<string[]> {
  const path = `users/${uid}/history`;
  try {
    const q = query(collection(db, 'users', uid, 'history'), orderBy('watchedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.id);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function recordUserHistoryInFirestore(uid: string, video: VideoItem): Promise<void> {
  const safeVideoId = video.id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const path = `users/${uid}/history/${safeVideoId}`;
  try {
    await setDoc(doc(db, 'users', uid, 'history', safeVideoId), {
      videoId: safeVideoId,
      userId: uid,
      videoTitle: clampStr(video.title, 200) || 'Untitled Video',
      videoType: video.type === 'short' ? 'short' : 'video',
      watchedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== PER-USER UPLOADS ====================
export async function loadUserUploadsFromFirestore(uid: string): Promise<VideoItem[]> {
  const path = `users/${uid}/uploads`;
  try {
    const q = query(collection(db, 'users', uid, 'uploads'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => {
      const d = docSnap.data();
      return {
        id: d.id || docSnap.id,
        title: d.title || 'Untitled',
        description: d.description || '',
        channelName: d.channelName || 'My Channel',
        channelHandle: d.channelHandle || '@channel',
        channelColor: 'from-pink-500 via-purple-500 to-cyan-500',
        views: typeof d.views === 'number' ? d.views : 0,
        timestamp: 'Uploaded to your account',
        duration: d.duration || '0:35',
        videoUrl: d.videoUrl || '',
        backupVideoUrl: d.backupVideoUrl || '',
        thumbnailUrl: d.thumbnailUrl || '',
        type: d.type === 'short' ? 'short' : 'video',
        likes: typeof d.likes === 'number' ? d.likes : 0,
        dislikes: typeof d.dislikes === 'number' ? d.dislikes : 0,
        comments: [],
        uploadedBy: uid,
        createdAt: d.createdAt?.toMillis ? d.createdAt.toMillis() : Date.now(),
        storageSizeMb: typeof d.storageSizeMb === 'number' ? d.storageSizeMb : 0,
        cloudSyncStatus: d.cloudSyncStatus || 'synced',
        quality: d.quality || '1080p',
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveUserUploadToFirestore(uid: string, video: VideoItem): Promise<void> {
  const safeId = video.id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const path = `users/${uid}/uploads/${safeId}`;
  try {
    const safeUrl = video.videoUrl.startsWith('blob:')
      ? clampStr(video.backupVideoUrl || '/videos/video1.mp4', 2048)
      : clampStr(video.videoUrl, 2048);

    await setDoc(doc(db, 'users', uid, 'uploads', safeId), {
      id: safeId,
      userId: uid,
      title: clampStr(video.title, 200) || 'New Video',
      description: clampStr(video.description, 2000),
      channelName: clampStr(video.channelName, 120) || 'My Channel',
      channelHandle: clampStr(video.channelHandle, 64) || '@channel',
      views: Math.max(0, Number(video.views) || 0),
      duration: clampStr(video.duration || '1:00', 32),
      videoUrl: safeUrl,
      backupVideoUrl: clampStr(video.backupVideoUrl || '', 2048),
      thumbnailUrl: clampStr(video.thumbnailUrl || '', 2048),
      type: video.type === 'short' ? 'short' : 'video',
      likes: Math.max(0, Number(video.likes) || 0),
      dislikes: Math.max(0, Number(video.dislikes) || 0),
      quality: clampStr(video.quality || '1080p', 32),
      storageSizeMb: Math.max(0, Number(video.storageSizeMb) || 0),
      cloudSyncStatus: 'synced',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateUserUploadInFirestore(uid: string, video: VideoItem): Promise<void> {
  const safeId = video.id.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const path = `users/${uid}/uploads/${safeId}`;
  try {
    await updateDoc(doc(db, 'users', uid, 'uploads', safeId), {
      title: clampStr(video.title, 200) || 'Untitled',
      description: clampStr(video.description, 2000),
      channelName: clampStr(video.channelName, 120) || 'My Channel',
      channelHandle: clampStr(video.channelHandle, 64) || '@channel',
      views: Math.max(0, Number(video.views) || 0),
      likes: Math.max(0, Number(video.likes) || 0),
      dislikes: Math.max(0, Number(video.dislikes) || 0),
      quality: clampStr(video.quality || '1080p', 32),
      type: video.type === 'short' ? 'short' : 'video',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteUserUploadFromFirestore(uid: string, videoId: string): Promise<void> {
  const safeId = videoId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const path = `users/${uid}/uploads/${safeId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'uploads', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== FOUNDER ADMIN OVERVIEW ====================
export async function loadAllUsersForFounder(): Promise<ManagedUser[]> {
  const path = 'users';
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((docSnap) => {
      const d = docSnap.data();
      const email = String(d.email || '');
      const name = String(d.name || 'User');
      const isOwnerAccount = email.trim().toLowerCase() === 'ravimaske8888@gmail.com';
      return {
        id: d.id || docSnap.id,
        name,
        email,
        handle: String(d.handle || '@user'),
        avatarLetter: name.charAt(0).toUpperCase() || 'U',
        avatarColor: isOwnerAccount ? 'from-amber-500 to-pink-500' : 'from-pink-500 to-cyan-500',
        role: isOwnerAccount ? 'owner' : 'creator',
        subscribersCount: typeof d.subscribersCount === 'number' ? d.subscribersCount : 0,
        totalUploads: 0,
        isVerified: isOwnerAccount,
        isSuspended: false,
        joinDate: String(d.joinedDate || 'Recent'),
        storageAllocatedGb: isOwnerAccount ? 99999 : 50,
        aiRiskScore: 0,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Real Google Sign-In with Firebase Auth
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser: User = result.user;
    return await syncUserProfileToFirestore(fbUser);
  } catch (error: unknown) {
    console.error('Firebase Google Sign-In error:', error);
    throw error;
  }
}

/**
 * Real Sign Out
 */
export async function logOutFromGoogle(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
}
