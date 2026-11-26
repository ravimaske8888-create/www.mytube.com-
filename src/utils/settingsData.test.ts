import test from 'node:test';
import assert from 'node:assert/strict';
import {
  YOUTUBE_SETTINGS_SECTIONS,
  getAllSettingItems,
  findSettingItem,
} from './settingsData';

test('YouTube settings has exactly 3 sections matching user video', () => {
  assert.equal(YOUTUBE_SETTINGS_SECTIONS.length, 3);
  assert.equal(YOUTUBE_SETTINGS_SECTIONS[0].title, 'Account');
  assert.equal(YOUTUBE_SETTINGS_SECTIONS[1].title, 'Video and audio preferences');
  assert.equal(YOUTUBE_SETTINGS_SECTIONS[2].title, 'Help and policy');
});

test('YouTube settings has exactly 26 items in total', () => {
  const allItems = getAllSettingItems();
  assert.equal(allItems.length, 26);
  assert.equal(YOUTUBE_SETTINGS_SECTIONS[0].items.length, 14);
  assert.equal(YOUTUBE_SETTINGS_SECTIONS[1].items.length, 8);
  assert.equal(YOUTUBE_SETTINGS_SECTIONS[2].items.length, 4);
});

test('Item IDs are unique and findable', () => {
  const allItems = getAllSettingItems();
  const ids = new Set(allItems.map((i) => i.id));
  assert.equal(ids.size, 26);

  assert.equal(findSettingItem('general')?.title, 'General');
  assert.equal(findSettingItem('premium')?.title, 'Get mytube Premium');
  assert.equal(findSettingItem('your_data')?.title, 'Your data in mytube');
  assert.equal(findSettingItem('quality')?.title, 'Quality');
  assert.equal(findSettingItem('terms')?.title, 'mytube Terms of Service');
  assert.equal(findSettingItem('about')?.title, 'About');
});
