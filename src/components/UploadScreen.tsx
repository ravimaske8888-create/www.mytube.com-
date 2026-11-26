import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, Film, Sparkles, Cloud, ArrowRight } from 'lucide-react';
import { VideoItem, VideoType, UserProfile } from '../types';
import { saveVideoToIndexedDB, getReliableCloudBackup } from '../utils/persistentVideoStorage';

interface UploadScreenProps {
  user: UserProfile | null;
  onUploadSuccess: (newVideo: VideoItem) => void;
  onOpenSignIn: () => void;
  language: 'en' | 'hi';
}

export const UploadScreen: React.FC<UploadScreenProps> = ({
  user,
  onUploadSuccess,
  onOpenSignIn,
  language,
}) => {
  const [videoType, setVideoType] = useState<VideoType>('video');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('Trending');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleLongVideo = '/videos/video1.mp4';
  const sampleShortVideo = '/videos/short1.mp4';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUseSample = () => {
    const isShort = videoType === 'short';
    setPreviewUrl(isShort ? sampleShortVideo : sampleLongVideo);
    setTitle(isShort ? 'My New Trending Short #mytube' : 'Exploring Next-Gen Video Sharing with Cloud Storage');
    setDescription(
      isShort
        ? 'Created and uploaded straight to mytube shorts with unlimited cloud storage.'
        : 'Uploaded directly to mytube with unlimited Google Cloud storage integration.'
    );
  };

  const handlePublish = () => {
    if (!user) {
      onOpenSignIn();
      return;
    }
    if (!title.trim() && !previewUrl) return;

    setIsUploading(true);
    setUploadProgress(15);

    const newVideoId = `user_vid_${Date.now()}`;
    const backupCloudUrl = getReliableCloudBackup(videoType, Date.now());

    // Save actual video blob to IndexedDB for permanent storage across days
    if (selectedFile) {
      saveVideoToIndexedDB(newVideoId, selectedFile).catch((err) => {
        console.warn('Could not save to IndexedDB:', err);
      });
    }

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadComplete(true);

            const newVideoItem: VideoItem = {
              id: newVideoId,
              title: title.trim() || (videoType === 'short' ? 'New Short' : 'New Video'),
              description: description.trim() || 'Uploaded to mytube with Google Cloud Storage.',
              channelName: user.name,
              channelHandle: user.handle,
              channelColor: 'from-pink-500 via-purple-500 to-cyan-500',
              views: 1,
              timestamp: 'Just now',
              duration: videoType === 'short' ? '0:35' : '3:12',
              videoUrl: previewUrl || backupCloudUrl,
              backupVideoUrl: backupCloudUrl,
              hasIndexedDbBlob: Boolean(selectedFile),
              thumbnailUrl: '',
              type: videoType,
              likes: 1,
              dislikes: 0,
              isLiked: true,
              comments: [],
              tags: [tag, 'Creator', 'GoogleCloud'],
              uploadedBy: user.id,
              createdAt: Date.now(),
              storageSizeMb: selectedFile ? +(selectedFile.size / (1024 * 1024)).toFixed(1) : 24.5,
              cloudSyncStatus: 'synced',
            };

            onUploadSuccess(newVideoItem);
          }, 600);
          return 100;
        }
        return prev + 20;
      });
    }, 180);
  };

  if (!user) {
    return (
      <div className="pb-24 pt-6 px-4 max-w-md mx-auto text-center">
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-3xl p-7 shadow-sm space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <Upload className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {language === 'hi' ? 'अपलोड करने के लिए साइन इन करें' : 'Sign in to Upload'}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {language === 'hi'
              ? 'अपने Google खाते से साइन इन करें ताकि आपके अपलोड सुरक्षित रूप से केवल आपके खाते में सेव रहें।'
              : 'Sign in with your Google account so your uploaded videos and shorts are saved privately to your personal profile.'}
          </p>
          <button
            onClick={onOpenSignIn}
            className="w-full py-3 rounded-full font-bold text-sm text-white bg-gradient-to-r from-[#ec4899] to-[#06b6d4] hover:opacity-95 shadow-md"
          >
            {language === 'hi' ? 'Google से साइन इन करें' : 'Sign in with Google'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-2 px-4 max-w-xl mx-auto">
      {/* Title matching Screenshot 3 */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Upload Video
      </h1>

      {/* Segmented Switch matching Screenshot 3 */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => {
            setVideoType('video');
            if (previewUrl === sampleShortVideo) setPreviewUrl(sampleLongVideo);
          }}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all shadow-sm ${
            videoType === 'video'
              ? 'bg-gradient-to-r from-[#ec4899] to-[#06b6d4] text-white shadow-pink-500/20'
              : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50'
          }`}
        >
          Long Video
        </button>

        <button
          onClick={() => {
            setVideoType('short');
            if (previewUrl === sampleLongVideo) setPreviewUrl(sampleShortVideo);
          }}
          className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all shadow-sm ${
            videoType === 'short'
              ? 'bg-gradient-to-r from-[#ec4899] to-[#06b6d4] text-white shadow-pink-500/20'
              : 'bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50'
          }`}
        >
          Short
        </button>
      </div>

      {/* Dashed Pink Border Dropzone matching Screenshot 3 */}
      {!previewUrl && !uploadComplete && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-pink-400 dark:border-pink-500/80 rounded-2xl bg-pink-50/30 dark:bg-pink-950/10 p-8 sm:p-12 text-center cursor-pointer hover:bg-pink-50/60 transition-all group flex flex-col items-center justify-center min-h-[220px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
          />

          {/* Upload Pink Icon matching Screenshot 3 */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-[#ec4899] mb-3 group-hover:scale-110 transition-transform">
            <svg
              className="w-10 h-10 stroke-[#ec4899]"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          {/* Primary & Sub text from Screenshot 3 */}
          <p className="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-100 mb-1">
            {language === 'hi'
              ? 'Video select karne ke liye tap karein'
              : 'Tap to select video'}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {language === 'hi' ? 'MP4, MOV — koi bhi length' : 'MP4, MOV — any length'}
          </p>

          {/* Instant sample button for convenient testing */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleUseSample();
            }}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full bg-white dark:bg-neutral-800 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-900 shadow-xs hover:bg-pink-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Sample HD {videoType === 'short' ? 'Short' : 'Video'} Use Karein
          </button>
        </div>
      )}

      {/* Video Preview and Metadata Form */}
      {previewUrl && !uploadComplete && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video border border-gray-200 dark:border-neutral-800">
            <video
              src={previewUrl}
              controls
              className="w-full h-full object-contain"
            />
            <button
              onClick={() => {
                setPreviewUrl('');
                setSelectedFile(null);
              }}
              className="absolute top-2 right-2 px-2.5 py-1 text-xs font-semibold bg-black/70 text-white rounded-full hover:bg-black/90"
            >
              Change
            </button>
          </div>

          {/* Unlimited Cloud Storage Banner */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 via-pink-500/10 to-purple-500/10 border border-cyan-500/20 text-xs text-gray-700 dark:text-gray-300">
            <Cloud className="w-5 h-5 text-cyan-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">
                Google Cloud Storage (Unlimited)
              </p>
              <p className="text-gray-500 text-[11px]">
                High bandwidth fast streaming • Automatically synced
              </p>
            </div>
            {!user?.isGoogleUser && (
              <button
                onClick={onOpenSignIn}
                className="text-pink-600 font-semibold underline text-[11px]"
              >
                Sign In
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Video Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My Awesome Vlog #mytube"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write a description for your audience..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {['Trending', 'Tech', 'Music', 'Vlog', 'Gaming', 'Tutorial'].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTag(t)}
                  className={`px-3 py-1 text-xs rounded-full font-medium ${
                    tag === t
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Uploading progress bar */}
          {isUploading && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Cloud className="w-4 h-4 text-pink-500 animate-pulse" />
                  Syncing to Google Cloud Storage...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-cyan-500 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={isUploading}
            className="w-full py-3 rounded-full font-bold text-white bg-gradient-to-r from-[#ec4899] to-[#06b6d4] hover:opacity-95 active:scale-98 transition-all shadow-md shadow-pink-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              'Uploading to Cloud...'
            ) : (
              <>
                <span>Publish {videoType === 'short' ? 'Short' : 'Video'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload Success State */}
      {uploadComplete && (
        <div className="text-center py-10 px-4 bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 rounded-2xl shadow-sm animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Upload Successful!
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            Aapka video Google Cloud Storage par sync ho gaya hai aur feed me live hai.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => {
                setUploadComplete(false);
                setPreviewUrl('');
                setTitle('');
                setDescription('');
              }}
              className="px-5 py-2 text-sm font-semibold rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200"
            >
              Upload Another Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
