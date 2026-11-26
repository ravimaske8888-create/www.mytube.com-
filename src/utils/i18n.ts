export interface TranslationStrings {
  // Common
  signIn: string;
  signOut: string;
  search: string;
  searchPlaceholder: string;
  notifications: string;
  channel: string;
  
  // Tabs
  home: string;
  shorts: string;
  upload: string;
  following: string;
  library: string;
  settings: string;

  // Settings
  notSignedInTitle: string;
  notSignedInSub: string;
  signedInTitle: string;
  account: string;
  yourChannel: string;
  yourChannelSub: string;
  storage: string;
  videosUploaded: string;
  videoAndUpload: string;
  uploadOverWifi: string;
  uploadOverWifiSub: string;
  hdUpload: string;
  hdUploadSub: string;
  notificationsHeader: string;
  pushNotifications: string;
  pushNotificationsSub: string;
  subscriptions: string;
  subscriptionsSub: string;
  general: string;
  darkTheme: string;
  darkThemeSub: string;
  privacy: string;
  privacySub: string;
  aboutMytube: string;
  version: string;

  // Upload
  uploadVideoTitle: string;
  longVideo: string;
  shortVideo: string;
  tapToSelectVideo: string;
  videoFormatsHint: string;
  uploadingToCloud: string;
  cloudSyncSuccess: string;
  unlimitedCloudStorage: string;
  videoTitlePlaceholder: string;
  descriptionPlaceholder: string;
  publishVideo: string;
  selectFileButton: string;
  sampleVideoOption: string;

  // Following
  notFollowingTitle: string;
  notFollowingSub: string;
  recommendedChannels: string;
  follow: string;
  followingBtn: string;

  // Library
  libraryTitle: string;
  allPill: string;
  videosPill: string;
  shortsPill: string;
  noUploadsTitle: string;
  noUploadsSub: string;
  historySection: string;
  myUploadsSection: string;
  likedVideosSection: string;
}

export const translations: Record<'hi' | 'en', TranslationStrings> = {
  hi: {
    signIn: 'Sign In',
    signOut: 'Sign Out',
    search: 'Khojein',
    searchPlaceholder: 'mytube par khojein...',
    notifications: 'Notifications',
    channel: 'Channel',

    home: 'Home',
    shorts: 'Shorts',
    upload: 'Upload',
    following: 'Following',
    library: 'Library',
    settings: 'Settings',

    notSignedInTitle: 'Sign in nahi hain',
    notSignedInSub: 'Apna channel banane ke liye sign in karein',
    signedInTitle: 'Google Account judaa hua hai',
    account: 'ACCOUNT',
    yourChannel: 'Your channel',
    yourChannelSub: 'Channel details edit karein',
    storage: 'Storage',
    videosUploaded: '0 videos uploaded',
    videoAndUpload: 'VIDEO & UPLOAD',
    uploadOverWifi: 'Upload over Wi-Fi only',
    uploadOverWifiSub: 'Mobile data bachaein',
    hdUpload: 'HD upload',
    hdUploadSub: 'Better quality, bada size',
    notificationsHeader: 'NOTIFICATIONS',
    pushNotifications: 'Push notifications',
    pushNotificationsSub: 'Uploads aur activity ke updates',
    subscriptions: 'Subscriptions',
    subscriptionsSub: 'Naye videos ka alert',
    general: 'GENERAL',
    darkTheme: 'Dark theme',
    darkThemeSub: 'System ke hisaab se',
    privacy: 'Privacy',
    privacySub: 'Data aur permissions',
    aboutMytube: 'About mytube',
    version: 'Version 1.0',

    uploadVideoTitle: 'Upload Video',
    longVideo: 'Long Video',
    shortVideo: 'Short',
    tapToSelectVideo: 'Video select karne ke liye tap karein',
    videoFormatsHint: 'MP4, MOV — koi bhi length',
    uploadingToCloud: 'Google Cloud Storage par upload ho raha hai...',
    cloudSyncSuccess: 'Video Unlimited Cloud Storage par sync ho gaya!',
    unlimitedCloudStorage: 'Unlimited Cloud Storage',
    videoTitlePlaceholder: 'Video ka title likhein...',
    descriptionPlaceholder: 'Video ke baare me kuch batayein...',
    publishVideo: 'Video Publish Karein',
    selectFileButton: 'Device se video chunein',
    sampleVideoOption: 'Sample HD Video Use Karein',

    notFollowingTitle: 'Aap abhi tak kisi channel ko follow nahi karte.',
    notFollowingSub: 'Videos dekh kar channels follow karo.',
    recommendedChannels: 'Sujhav diye gaye Channels',
    follow: 'Follow',
    followingBtn: 'Following',

    libraryTitle: 'Library',
    allPill: 'All',
    videosPill: 'Videos',
    shortsPill: 'Shorts',
    noUploadsTitle: 'Abhi tak koi upload nahi hai.',
    noUploadsSub: 'Upload tab se apna pehla video daalein!',
    historySection: 'Dekhe gaye videos',
    myUploadsSection: 'Aapke Uploads',
    likedVideosSection: 'Pasand kiye gaye videos',
  },
  en: {
    signIn: 'Sign In',
    signOut: 'Sign Out',
    search: 'Search',
    searchPlaceholder: 'Search on mytube...',
    notifications: 'Notifications',
    channel: 'Channel',

    home: 'Home',
    shorts: 'Shorts',
    upload: 'Upload',
    following: 'Following',
    library: 'Library',
    settings: 'Settings',

    notSignedInTitle: 'Not signed in',
    notSignedInSub: 'Sign in to create your channel',
    signedInTitle: 'Google Account Connected',
    account: 'ACCOUNT',
    yourChannel: 'Your channel',
    yourChannelSub: 'Edit channel details',
    storage: 'Storage',
    videosUploaded: '0 videos uploaded',
    videoAndUpload: 'VIDEO & UPLOAD',
    uploadOverWifi: 'Upload over Wi-Fi only',
    uploadOverWifiSub: 'Save mobile data',
    hdUpload: 'HD upload',
    hdUploadSub: 'Better quality, larger file size',
    notificationsHeader: 'NOTIFICATIONS',
    pushNotifications: 'Push notifications',
    pushNotificationsSub: 'Updates on uploads and activity',
    subscriptions: 'Subscriptions',
    subscriptionsSub: 'Alerts for new videos',
    general: 'GENERAL',
    darkTheme: 'Dark theme',
    darkThemeSub: 'Follow system settings',
    privacy: 'Privacy',
    privacySub: 'Data and permissions',
    aboutMytube: 'About mytube',
    version: 'Version 1.0',

    uploadVideoTitle: 'Upload Video',
    longVideo: 'Long Video',
    shortVideo: 'Short',
    tapToSelectVideo: 'Tap to select video',
    videoFormatsHint: 'MP4, MOV — any length',
    uploadingToCloud: 'Uploading to Google Cloud Storage...',
    cloudSyncSuccess: 'Video synced to Unlimited Cloud Storage!',
    unlimitedCloudStorage: 'Unlimited Cloud Storage',
    videoTitlePlaceholder: 'Enter video title...',
    descriptionPlaceholder: 'Tell viewers about your video...',
    publishVideo: 'Publish Video',
    selectFileButton: 'Choose Video from Device',
    sampleVideoOption: 'Use Sample HD Video',

    notFollowingTitle: 'You are not following any channels yet.',
    notFollowingSub: 'Watch videos and follow channels.',
    recommendedChannels: 'Recommended Channels',
    follow: 'Follow',
    followingBtn: 'Following',

    libraryTitle: 'Library',
    allPill: 'All',
    videosPill: 'Videos',
    shortsPill: 'Shorts',
    noUploadsTitle: 'No uploads yet.',
    noUploadsSub: 'Upload your first video from the Upload tab!',
    historySection: 'Watch History',
    myUploadsSection: 'Your Uploads',
    likedVideosSection: 'Liked Videos',
  },
};
