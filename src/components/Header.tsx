import React from 'react';
import { Search, Bell, Globe } from 'lucide-react';
import { MytubeLogo } from './MytubeLogo';
import { UserProfile } from '../types';
import { isFounderOwner } from '../utils/admin';

interface HeaderProps {
  user?: UserProfile | null;
  isFounderUnlocked?: boolean;
  onOpenSignIn?: () => void;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenYourChannel?: () => void;
  onOpenSettings?: () => void;
  language: 'en' | 'hi';
  onToggleLanguage: () => void;
  onLogoClick: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  isFounderUnlocked = false,
  onOpenSearch,
  onOpenNotifications,
  language,
  onToggleLanguage,
  onLogoClick,
  notificationCount = 2,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-[#0f0f10] border-b border-gray-100 dark:border-neutral-800 transition-colors">
      {/* Top accent bar matching exact screenshots */}
      <div className="h-2 w-full bg-gradient-to-r from-[#ec4899] via-[#f43f5e] to-[#ec4899]" />

      <div className="flex items-center justify-between px-3.5 py-2.5 max-w-7xl mx-auto">
        {/* Brand Logo & Developer Indicator */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onLogoClick}
            className="flex items-center text-left focus:outline-none hover:opacity-90 transition-opacity"
            aria-label="mytube home"
          >
            <MytubeLogo size="md" />
          </button>

          {/* Founder / Developer Badge — visible ONLY after verified Founder email + Master PIN */}
          {isFounderUnlocked && isFounderOwner(user) && (
            <span
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500/15 to-pink-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700/60 shadow-xs"
              title="You have 100% full developer & owner access to mytube"
            >
              <span>👑</span>
              <span>{language === 'hi' ? 'फ़ाउंडर व डेवलपर' : 'Founder & Dev'}</span>
            </span>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isFounderUnlocked && isFounderOwner(user) && (
            <span
              className="sm:hidden text-sm"
              title="Founder & Developer Full Access"
            >
              👑
            </span>
          )}
          {/* Search Icon */}
          <button
            onClick={onOpenSearch}
            className="p-1.5 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 stroke-[2]" />
          </button>

          {/* Notifications Icon with badge */}
          <button
            onClick={onOpenNotifications}
            className="relative p-1.5 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 stroke-[2]" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white dark:ring-neutral-900" />
            )}
          </button>

          {/* Language Switcher pill */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label="Change language"
            title="Switch Language (English / Hindi)"
          >
            <Globe className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
