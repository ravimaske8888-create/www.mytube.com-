import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SETTINGS,
  loadStoredVideos,
  saveStoredVideos,
  loadStoredSettings,
  saveStoredSettings,
  loadWatchHistory,
  recordWatchHistory,
  loadDeletedVideoIds,
  recordDeletedVideoId,
} from './storage';
import { INITIAL_VIDEOS } from '../data/initialVideos';

function setupMockLocalStorage() {
  const store = new Map<string, string>();
  (globalThis as unknown as { localStorage: Storage }).localStorage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
  return store;
}

test('Signed-out users receive default settings, empty history, and only official feed', () => {
  setupMockLocalStorage();

  assert.deepEqual(loadStoredSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(loadWatchHistory(null), []);
  assert.equal(loadStoredVideos(null).length, INITIAL_VIDEOS.length);

  // Attempting to save while signed out must be a no-op
  saveStoredSettings({ ...DEFAULT_SETTINGS, darkTheme: true, language: 'hi' }, null);
  assert.deepEqual(loadStoredSettings(null), DEFAULT_SETTINGS);
});

test('Deleted short/video IDs are persisted per user and isolated between users', () => {
  setupMockLocalStorage();

  assert.deepEqual(loadDeletedVideoIds('user-a'), []);
  recordDeletedVideoId('short-1', 'user-a');
  recordDeletedVideoId('short-1', 'user-a'); // duplicate ignored

  assert.deepEqual(loadDeletedVideoIds('user-a'), ['short-1']);
  assert.deepEqual(loadDeletedVideoIds('user-b'), []);
  assert.deepEqual(loadDeletedVideoIds(null), []);

  // Empty stored videos list stays empty rather than resetting to INITIAL_VIDEOS
  saveStoredVideos([], 'user-a');
  assert.deepEqual(loadStoredVideos('user-a'), []);
});

test('User A uploads, history, and settings are completely isolated from User B', () => {
  setupMockLocalStorage();

  const userA = 'uid-alice-111';
  const userB = 'uid-bob-222';

  // User A saves settings, watch history, and an uploaded video
  saveStoredSettings({ ...DEFAULT_SETTINGS, darkTheme: true, language: 'hi' }, userA);
  recordWatchHistory('vid-secret-alice', userA);
  saveStoredVideos(
    [
      ...INITIAL_VIDEOS,
      {
        id: 'upload-alice-1',
        title: 'Alice Private Upload',
        description: 'Only Alice',
        thumbnailUrl: '/thumb.jpg',
        videoUrl: '/vid.mp4',
        duration: '1:00',
        views: 0,
        likes: 0,
        dislikes: 0,
        timestamp: 'Just now',
        channelName: 'Alice',
        channelHandle: '@alice',
        channelAvatar: '/avatar.jpg',
        type: 'video',
        comments: [],
        uploadedBy: userA,
        createdAt: Date.now(),
      },
    ],
    userA
  );

  // Also ensure cross-user uploads accidentally passed into saveStoredVideos(userB) get stripped
  saveStoredVideos(
    [
      ...INITIAL_VIDEOS,
      {
        id: 'upload-alice-leaked',
        title: 'Leaked Upload',
        description: 'Should be filtered out',
        thumbnailUrl: '/thumb.jpg',
        videoUrl: '/vid.mp4',
        duration: '1:00',
        views: 0,
        likes: 0,
        dislikes: 0,
        timestamp: 'Just now',
        channelName: 'Alice',
        channelHandle: '@alice',
        channelAvatar: '/avatar.jpg',
        type: 'video',
        comments: [],
        uploadedBy: userA,
        createdAt: Date.now(),
      },
    ],
    userB
  );

  // User B should see default settings, empty history, and none of Alice's uploads
  assert.deepEqual(loadStoredSettings(userB), DEFAULT_SETTINGS);
  assert.deepEqual(loadWatchHistory(userB), []);
  assert.equal(
    loadStoredVideos(userB).some((v) => v.uploadedBy === userA),
    false
  );

  // User A sees their own data intact
  assert.equal(loadStoredSettings(userA).darkTheme, true);
  assert.equal(loadStoredSettings(userA).language, 'hi');
  assert.deepEqual(loadWatchHistory(userA), ['vid-secret-alice']);
  assert.equal(
    loadStoredVideos(userA).some((v) => v.id === 'upload-alice-1'),
    true
  );

  // Signed-out user still sees clean defaults
  assert.deepEqual(loadWatchHistory(null), []);
  assert.equal(
    loadStoredVideos(null).some((v) => v.uploadedBy === userA),
    false
  );
});
