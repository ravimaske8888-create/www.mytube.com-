import test from 'node:test';
import assert from 'node:assert';
import {
  isEphemeralBlobUrl,
  getReliableCloudBackup,
  PERMANENT_CLOUD_SAMPLES,
  rehydrateVideoList,
} from './persistentVideoStorage';
import { VideoItem } from '../types';

test('isEphemeralBlobUrl correctly detects temporary blob URLs', () => {
  assert.strictEqual(isEphemeralBlobUrl('blob:http://localhost:3000/a88373-bfd'), true);
  assert.strictEqual(isEphemeralBlobUrl('blob:https://ais-dev.run.app/1234'), true);
  assert.strictEqual(isEphemeralBlobUrl('/videos/video1.mp4'), false);
  assert.strictEqual(isEphemeralBlobUrl('https://example.com/video.mp4'), false);
  assert.strictEqual(isEphemeralBlobUrl('http://example.com/video.mp4'), false);
  assert.strictEqual(isEphemeralBlobUrl(''), false);
  assert.strictEqual(isEphemeralBlobUrl(undefined), false);
});

test('getReliableCloudBackup returns stable, locally served MP4 URLs for videos and shorts', () => {
  const videoBackup = getReliableCloudBackup('video', 0);
  assert.ok(videoBackup.startsWith('/videos/'));
  assert.ok(videoBackup.endsWith('.mp4'));

  const shortBackup = getReliableCloudBackup('short', 1);
  assert.ok(shortBackup.startsWith('/videos/'));
  assert.ok(shortBackup.endsWith('.mp4'));

  // Checks rotation bounds
  const rotatedVideo = getReliableCloudBackup('video', 99);
  assert.ok(PERMANENT_CLOUD_SAMPLES.video.includes(rotatedVideo));
});

test('rehydrateVideoList migrates legacy 403 commondatastorage URLs and attaches local backup URLs', async () => {
  const sampleVideos: VideoItem[] = [
    {
      id: 'test-1',
      title: 'Legacy Video with 403 storage',
      description: 'Test description',
      channelName: 'Channel 1',
      channelHandle: '@ch1',
      views: 10,
      timestamp: '1 day ago',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'video',
      likes: 1,
      dislikes: 0,
      comments: [],
      createdAt: 1000,
    },
  ];

  const rehydrated = await rehydrateVideoList(sampleVideos);
  assert.strictEqual(rehydrated.length, 1);
  // Must be migrated away from commondatastorage
  assert.strictEqual(rehydrated[0].videoUrl.includes('commondatastorage.googleapis.com'), false);
  assert.ok(rehydrated[0].videoUrl.startsWith('/videos/'));
  assert.ok(rehydrated[0].backupVideoUrl);
  assert.ok(rehydrated[0].backupVideoUrl.startsWith('/videos/'));
});
