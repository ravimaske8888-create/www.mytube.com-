import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatViews,
  formatDuration,
  filterVideos,
  calculateStorageStats,
  toggleVideoLike,
  incrementVideoViews,
  calculateChannelTotalViews,
  editVideoItem,
  deleteVideoItem,
  updateVideoQuality,
} from './videoRules';
import { VideoItem } from '../types';

test('formatViews handles 0, hundreds, thousands, and millions', () => {
  assert.equal(formatViews(0), '0 views');
  assert.equal(formatViews(567), '567 views');
  assert.equal(formatViews(1234), '1,234 views');
  assert.equal(formatViews(45000), '45K views');
  assert.equal(formatViews(1200000), '1.2M views');
});

test('formatDuration formats seconds to mm:ss or hh:mm:ss', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(45), '0:45');
  assert.equal(formatDuration(185), '3:05');
  assert.equal(formatDuration(3665), '1:01:05');
});

test('filterVideos filters by type, tag category, and search text', () => {
  const mockVideos: VideoItem[] = [
    {
      id: 'v1',
      title: 'Welcome to mytube',
      description: 'Intro video',
      channelName: 'mytube Official',
      channelHandle: '@mytube',
      views: 1200,
      timestamp: '2 days ago',
      videoUrl: 'https://sample.mp4',
      type: 'video',
      likes: 10,
      dislikes: 0,
      comments: [],
      tags: ['Official', 'Tech'],
      createdAt: Date.now(),
    },
    {
      id: 's1',
      title: 'Quick tip for creators',
      description: 'Short video',
      channelName: 'Creator Hub',
      channelHandle: '@creatorhub',
      views: 500,
      timestamp: '1 day ago',
      videoUrl: 'https://short.mp4',
      type: 'short',
      likes: 25,
      dislikes: 1,
      comments: [],
      tags: ['Tutorial'],
      createdAt: Date.now(),
    },
  ];

  // Test type filter
  assert.equal(filterVideos(mockVideos, 'short').length, 1);
  assert.equal(filterVideos(mockVideos, 'video').length, 1);
  assert.equal(filterVideos(mockVideos, 'all').length, 2);

  // Test search query
  const searchResults = filterVideos(mockVideos, 'all', 'creator');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].id, 's1');
});

test('calculateStorageStats counts uploads and formats cloud storage', () => {
  const mockVideos: VideoItem[] = [
    {
      id: 'v1',
      title: 'User Video 1',
      description: '',
      channelName: 'Me',
      channelHandle: '@me',
      views: 10,
      timestamp: 'Just now',
      videoUrl: 'blob:xxx',
      type: 'video',
      likes: 0,
      dislikes: 0,
      comments: [],
      uploadedBy: 'user-1',
      storageSizeMb: 50,
      createdAt: Date.now(),
    },
    {
      id: 'v2',
      title: 'User Video 2',
      description: '',
      channelName: 'Me',
      channelHandle: '@me',
      views: 5,
      timestamp: 'Just now',
      videoUrl: 'blob:yyy',
      type: 'short',
      likes: 0,
      dislikes: 0,
      comments: [],
      uploadedBy: 'user-1',
      storageSizeMb: 25,
      createdAt: Date.now(),
    },
  ];

  const stats = calculateStorageStats(mockVideos, 'user-1');
  assert.equal(stats.count, 2);
  assert.equal(stats.totalMb, 75);
  assert.match(stats.storageDisplay, /2 videos uploaded/);
});

test('toggleVideoLike properly toggles like and dislike counts', () => {
  const video: VideoItem = {
    id: 'v1',
    title: 'Test',
    description: '',
    channelName: 'Test',
    channelHandle: '@test',
    views: 100,
    timestamp: '1h',
    videoUrl: 'test.mp4',
    type: 'video',
    likes: 10,
    dislikes: 2,
    isLiked: false,
    isDisliked: true,
    comments: [],
    createdAt: Date.now(),
  };

  const likedState = toggleVideoLike(video, false);
  assert.equal(likedState.isLiked, true);
  assert.equal(likedState.likes, 11);
  assert.equal(likedState.dislikes, 1); // clears dislike if liked

  const unlikedState = toggleVideoLike({ ...video, likes: 11, isLiked: true }, true);
  assert.equal(unlikedState.isLiked, false);
  assert.equal(unlikedState.likes, 10);
});

test('incrementVideoViews increments views correctly', () => {
  const video: VideoItem = {
    id: 'v1',
    title: 'Test',
    description: '',
    channelName: 'Test',
    channelHandle: '@test',
    views: 120,
    timestamp: '1h',
    videoUrl: 'test.mp4',
    type: 'video',
    likes: 0,
    dislikes: 0,
    comments: [],
    createdAt: Date.now(),
  };

  const updated = incrementVideoViews(video);
  assert.equal(updated.views, 121);
  assert.equal(updated.id, 'v1');
});

test('calculateChannelTotalViews sums all long and short video views', () => {
  const channelVideos: VideoItem[] = [
    {
      id: 'v1',
      title: 'Long 1',
      description: '',
      channelName: 'Me',
      channelHandle: '@me',
      views: 1500,
      timestamp: '1d',
      videoUrl: 'v1.mp4',
      type: 'video',
      likes: 0,
      dislikes: 0,
      comments: [],
      uploadedBy: 'user-ravi',
      createdAt: Date.now(),
    },
    {
      id: 's1',
      title: 'Short 1',
      description: '',
      channelName: 'Me',
      channelHandle: '@me',
      views: 3200,
      timestamp: '2d',
      videoUrl: 's1.mp4',
      type: 'short',
      likes: 0,
      dislikes: 0,
      comments: [],
      uploadedBy: 'user-ravi',
      createdAt: Date.now(),
    },
  ];

  const total = calculateChannelTotalViews(channelVideos, 'user-ravi');
  assert.equal(total, 4700);
});

test('editVideoItem updates title, description, tags, and type for long video and shorts', () => {
  const list: VideoItem[] = [
    {
      id: 'long-1',
      title: 'Original Long Video',
      description: 'Original Desc',
      channelName: 'Channel',
      channelHandle: '@ch',
      views: 100,
      timestamp: '1d',
      videoUrl: 'v1.mp4',
      type: 'video',
      likes: 10,
      dislikes: 0,
      comments: [],
      createdAt: 1000,
    },
    {
      id: 'short-1',
      title: 'Original Short',
      description: 'Original Short Desc',
      channelName: 'Channel',
      channelHandle: '@ch',
      views: 50,
      timestamp: '1d',
      videoUrl: 's1.mp4',
      type: 'short',
      likes: 5,
      dislikes: 0,
      comments: [],
      createdAt: 1001,
    },
  ];

  // Edit long video
  const editedLong = editVideoItem(list, 'long-1', {
    title: 'Updated Long Video Title',
    description: 'Updated Description',
    tags: ['Tech', 'Viral'],
  });
  assert.equal(editedLong[0].title, 'Updated Long Video Title');
  assert.equal(editedLong[0].description, 'Updated Description');
  assert.deepEqual(editedLong[0].tags, ['Tech', 'Viral']);
  assert.equal(editedLong[1].title, 'Original Short'); // Untouched

  // Edit short video
  const editedShort = editVideoItem(list, 'short-1', {
    title: 'New Short Title #shorts',
    description: 'New short info',
  });
  assert.equal(editedShort[1].title, 'New Short Title #shorts');
});

test('deleteVideoItem permanently removes long video or short from list', () => {
  const list: VideoItem[] = [
    {
      id: 'v1',
      title: 'Long 1',
      description: '',
      channelName: 'Ch',
      channelHandle: '@ch',
      views: 0,
      timestamp: '1d',
      videoUrl: 'v1.mp4',
      type: 'video',
      likes: 0,
      dislikes: 0,
      comments: [],
      createdAt: 1,
    },
    {
      id: 's1',
      title: 'Short 1',
      description: '',
      channelName: 'Ch',
      channelHandle: '@ch',
      views: 0,
      timestamp: '1d',
      videoUrl: 's1.mp4',
      type: 'short',
      likes: 0,
      dislikes: 0,
      comments: [],
      createdAt: 2,
    },
  ];

  const afterDeleteLong = deleteVideoItem(list, 'v1');
  assert.equal(afterDeleteLong.length, 1);
  assert.equal(afterDeleteLong[0].id, 's1');

  const afterDeleteShort = deleteVideoItem(list, 's1');
  assert.equal(afterDeleteShort.length, 1);
  assert.equal(afterDeleteShort[0].id, 'v1');
});

test('updateVideoQuality sets resolution and preserves all other fields', () => {
  const video: VideoItem = {
    id: 'v1',
    title: 'HD Test',
    description: '',
    channelName: 'Ch',
    channelHandle: '@ch',
    views: 0,
    timestamp: '1d',
    videoUrl: 'v1.mp4',
    type: 'video',
    likes: 0,
    dislikes: 0,
    comments: [],
    createdAt: 1,
  };

  const q1080 = updateVideoQuality(video, '1080p');
  assert.equal(q1080.quality, '1080p');
  assert.equal(q1080.title, 'HD Test');

  const qAuto = updateVideoQuality(q1080, 'Auto');
  assert.equal(qAuto.quality, 'Auto');
});

