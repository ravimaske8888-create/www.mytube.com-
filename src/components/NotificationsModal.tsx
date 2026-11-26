import React from 'react';
import { X, Bell, Heart, UploadCloud, UserPlus, CheckCircle } from 'lucide-react';

interface NotificationsModalProps {
  onClose: () => void;
  language: 'en' | 'hi';
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  onClose,
}) => {
  const notifications = [
    {
      id: 'n1',
      icon: UploadCloud,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40',
      title: 'Google Cloud Storage Connected',
      desc: 'Aapka unlimited cloud storage quota active hai.',
      time: '10m ago',
    },
    {
      id: 'n2',
      icon: Heart,
      color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40',
      title: 'New Like on your Short',
      desc: 'Aarav Sharma liked your video "Quick tip for creators".',
      time: '1h ago',
    },
    {
      id: 'n3',
      icon: UserPlus,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
      title: 'New Subscriber!',
      desc: 'Tech Gyan followed your channel.',
      time: '3h ago',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl p-5 shadow-2xl border border-gray-100 dark:border-neutral-800 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-gray-900 dark:text-white text-base">
              Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-neutral-800 mt-2 max-h-80 overflow-y-auto">
          {notifications.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="py-3 flex items-start gap-3">
                <div className={`p-2 rounded-xl ${item.color} flex-shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {item.desc}
                  </p>
                  <span className="text-[10px] text-gray-400 mt-1 block">{item.time}</span>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-2 text-xs font-bold rounded-full bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};
