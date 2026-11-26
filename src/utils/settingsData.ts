export interface SettingItemDef {
  id: string;
  title: string;
  section: 'account' | 'preferences' | 'help';
}

export interface SettingSectionDef {
  id: 'account' | 'preferences' | 'help';
  title: string;
  items: SettingItemDef[];
}

export const YOUTUBE_SETTINGS_SECTIONS: SettingSectionDef[] = [
  {
    id: 'account',
    title: 'Account',
    items: [
      { id: 'general', title: 'General', section: 'account' },
      { id: 'switch_account', title: 'Switch or manage account', section: 'account' },
      { id: 'family_center', title: 'Family Center', section: 'account' },
      { id: 'languages', title: 'Languages', section: 'account' },
      { id: 'time_management', title: 'Time management', section: 'account' },
      { id: 'notifications', title: 'Notifications', section: 'account' },
      { id: 'premium', title: 'Get mytube Premium', section: 'account' },
      { id: 'purchases', title: 'Purchases and memberships', section: 'account' },
      { id: 'promotions', title: 'Promotions', section: 'account' },
      { id: 'history', title: 'Manage all history', section: 'account' },
      { id: 'your_data', title: 'Your data in mytube', section: 'account' },
      { id: 'privacy', title: 'Privacy', section: 'account' },
      { id: 'connected_apps', title: 'Connected apps', section: 'account' },
      { id: 'experiments', title: 'Try experimental new features', section: 'account' },
    ],
  },
  {
    id: 'preferences',
    title: 'Video and audio preferences',
    items: [
      { id: 'quality', title: 'Quality', section: 'preferences' },
      { id: 'playback', title: 'Playback', section: 'preferences' },
      { id: 'captions', title: 'Captions', section: 'preferences' },
      { id: 'data_saving', title: 'Data saving', section: 'preferences' },
      { id: 'downloads', title: 'Downloads', section: 'preferences' },
      { id: 'live_chat', title: 'Live chat', section: 'preferences' },
      { id: 'accessibility', title: 'Accessibility', section: 'preferences' },
      { id: 'watch_on_tv', title: 'Watch on TV', section: 'preferences' },
    ],
  },
  {
    id: 'help',
    title: 'Help and policy',
    items: [
      { id: 'help', title: 'Help', section: 'help' },
      { id: 'terms', title: 'mytube Terms of Service', section: 'help' },
      { id: 'feedback', title: 'Send feedback', section: 'help' },
      { id: 'about', title: 'About', section: 'help' },
    ],
  },
];

export function getAllSettingItems(): SettingItemDef[] {
  return YOUTUBE_SETTINGS_SECTIONS.flatMap((s) => s.items);
}

export function findSettingItem(id: string): SettingItemDef | undefined {
  return getAllSettingItems().find((item) => item.id === id);
}
