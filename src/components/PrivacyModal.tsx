import React from 'react';
import { X, ShieldCheck, Lock, Eye, Database } from 'lucide-react';

interface PrivacyModalProps {
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-6 h-6 text-pink-500" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Privacy & Permissions
          </h3>
        </div>

        <div className="space-y-3.5 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          <div className="flex gap-2.5 items-start">
            <Lock className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Data Protection</p>
              <p>Your uploaded videos and personal profile data are encrypted and securely stored.</p>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <Database className="w-4 h-4 text-pink-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Google Cloud Storage</p>
              <p>Unlimited cloud storage bandwidth is provisioned for video streaming and downloads.</p>
            </div>
          </div>

          <div className="flex gap-2.5 items-start">
            <Eye className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Public Visibility</p>
              <p>Videos published to mytube can be watched by anyone with the link or in the search feed.</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-full text-xs font-bold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90"
        >
          I Understand
        </button>
      </div>
    </div>
  );
};
