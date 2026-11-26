import React, { useState } from 'react';
import { X, User, Check } from 'lucide-react';
import { UserProfile } from '../types';

interface ChannelEditModalProps {
  user: UserProfile | null;
  onSave: (updated: UserProfile) => void;
  onClose: () => void;
}

export const ChannelEditModal: React.FC<ChannelEditModalProps> = ({
  user,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(user?.name || 'My Channel');
  const [handle, setHandle] = useState(user?.handle || '@mychannel');
  const [description, setDescription] = useState(
    'Content creator on mytube sharing tech, tutorials, and shorts.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: UserProfile = {
      ...(user || {
        id: 'usr_custom',
        email: '',
        avatarUrl: '',
        subscribersCount: 0,
        joinedDate: 'Joined recently',
        isGoogleUser: false,
        cloudStorageTier: 'Local Storage',
      }),
      name: name.trim() || 'My Channel',
      handle: handle.startsWith('@') ? handle : `@${handle}`,
    };
    onSave(updatedUser);
    onClose();
  };

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

        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Channel Details Edit Karein
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Channel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Channel Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              About / Bio
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500 resize-none"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-full text-xs font-semibold border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-full text-xs font-bold bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-md shadow-pink-500/20 hover:opacity-95"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
