import React from 'react';
import { Home, PlaySquare, PlusCircle, User, LayoutGrid, Settings, LogIn } from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  language: 'en' | 'hi';
  user?: UserProfile | null;
  onOpenSignIn?: () => void;
  onOpenYourChannel?: () => void;
  onSignOut?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  language,
  user,
}) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0f0f11] text-gray-400 border-t border-neutral-900 px-1 py-1.5 safe-bottom"
      aria-label="Bottom Navigation"
    >
      <div className="max-w-lg mx-auto grid grid-cols-7 items-center">
        {/* 1. Home */}
        <button
          key="home"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all group ${
            currentTab === 'home' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label={language === 'hi' ? 'होम' : 'Home'}
          aria-current={currentTab === 'home' ? 'page' : undefined}
        >
          <div
            className={`transition-transform duration-150 ${
              currentTab === 'home' ? 'scale-110' : 'group-hover:scale-105'
            }`}
          >
            <Home
              className={`w-5 h-5 ${
                currentTab === 'home' ? 'stroke-[2.4]' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 font-medium transition-colors truncate max-w-full ${
              currentTab === 'home' ? 'text-white font-semibold' : 'text-gray-400'
            }`}
          >
            {language === 'hi' ? 'होम' : 'Home'}
          </span>
        </button>

        {/* 2. Shorts */}
        <button
          key="shorts"
          onClick={() => onSelectTab('shorts')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all group ${
            currentTab === 'shorts' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label="Shorts"
          aria-current={currentTab === 'shorts' ? 'page' : undefined}
        >
          <div
            className={`transition-transform duration-150 ${
              currentTab === 'shorts' ? 'scale-110' : 'group-hover:scale-105'
            }`}
          >
            <PlaySquare
              className={`w-5 h-5 ${
                currentTab === 'shorts' ? 'stroke-[2.4]' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 font-medium transition-colors truncate max-w-full ${
              currentTab === 'shorts' ? 'text-white font-semibold' : 'text-gray-400'
            }`}
          >
            Shorts
          </span>
        </button>

        {/* 3. Following */}
        <button
          key="following"
          onClick={() => onSelectTab('following')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all group ${
            currentTab === 'following' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label={language === 'hi' ? 'फॉलोइंग' : 'Following'}
          aria-current={currentTab === 'following' ? 'page' : undefined}
        >
          <div
            className={`transition-transform duration-150 ${
              currentTab === 'following' ? 'scale-110' : 'group-hover:scale-105'
            }`}
          >
            <User
              className={`w-5 h-5 ${
                currentTab === 'following' ? 'stroke-[2.4]' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 font-medium transition-colors truncate max-w-full ${
              currentTab === 'following' ? 'text-white font-semibold' : 'text-gray-400'
            }`}
          >
            {language === 'hi' ? 'फॉलोइंग' : 'Following'}
          </span>
        </button>

        {/* 4. Upload (EXACT CENTER: position 4 out of 7) */}
        <button
          key="upload"
          onClick={() => onSelectTab('upload')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all group ${
            currentTab === 'upload' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label={language === 'hi' ? 'अपलोड' : 'Upload'}
          aria-current={currentTab === 'upload' ? 'page' : undefined}
        >
          <div
            className={`transition-transform duration-150 ${
              currentTab === 'upload' ? 'scale-110' : 'group-hover:scale-105'
            }`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-dashed border-pink-500/80 bg-pink-500/10 group-hover:bg-pink-500/20 group-hover:border-pink-400 transition-colors">
              <PlusCircle
                className={`w-5 h-5 ${
                  currentTab === 'upload'
                    ? 'text-pink-400 stroke-[2.4]'
                    : 'text-pink-500 stroke-[2.2]'
                }`}
              />
            </div>
          </div>
          <span
            className={`text-[10px] tracking-tight mt-0.5 font-bold transition-colors truncate max-w-full ${
              currentTab === 'upload' ? 'text-pink-400' : 'text-pink-500/90'
            }`}
          >
            {language === 'hi' ? 'अपलोड' : 'Upload'}
          </span>
        </button>

        {/* 5. Library */}
        <button
          key="library"
          onClick={() => onSelectTab('library')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all group ${
            currentTab === 'library' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label={language === 'hi' ? 'लाइब्रेरी' : 'Library'}
          aria-current={currentTab === 'library' ? 'page' : undefined}
        >
          <div
            className={`transition-transform duration-150 ${
              currentTab === 'library' ? 'scale-110' : 'group-hover:scale-105'
            }`}
          >
            <LayoutGrid
              className={`w-5 h-5 ${
                currentTab === 'library' ? 'stroke-[2.4]' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 font-medium transition-colors truncate max-w-full ${
              currentTab === 'library' ? 'text-white font-semibold' : 'text-gray-400'
            }`}
          >
            {language === 'hi' ? 'लाइब्रेरी' : 'Library'}
          </span>
        </button>

        {/* 6. Settings (Button 6, immediately to the left of Login) */}
        <button
          key="settings"
          onClick={() => onSelectTab('settings')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all group ${
            currentTab === 'settings' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label={language === 'hi' ? 'सेटिंग्स' : 'Settings'}
          aria-current={currentTab === 'settings' ? 'page' : undefined}
        >
          <div
            className={`transition-transform duration-150 ${
              currentTab === 'settings' ? 'scale-110' : 'group-hover:scale-105'
            }`}
          >
            <Settings
              className={`w-5 h-5 ${
                currentTab === 'settings' ? 'stroke-[2.4]' : 'stroke-[1.8]'
              }`}
            />
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 font-medium transition-colors truncate max-w-full ${
              currentTab === 'settings' ? 'text-white font-semibold' : 'text-gray-400'
            }`}
          >
            {language === 'hi' ? 'सेटिंग्स' : 'Settings'}
          </span>
        </button>

        {/* 7. Login / Account (Button 7, shifted to the RIGHT side of Settings, opens full account page) */}
        <button
          key="account"
          onClick={() => onSelectTab('account')}
          className={`flex flex-col items-center justify-center py-1 px-0.5 transition-all group ${
            currentTab === 'account' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
          }`}
          aria-label={user && user.isGoogleUser ? 'User Account' : 'Login'}
          aria-current={currentTab === 'account' ? 'page' : undefined}
        >
          <div
            className={`transition-transform duration-150 ${
              currentTab === 'account' ? 'scale-110' : 'group-hover:scale-105'
            } flex items-center justify-center`}
          >
            {user && user.isGoogleUser ? (
              user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className={`w-5 h-5 rounded-full object-cover border ${
                    currentTab === 'account'
                      ? 'border-pink-400 ring-2 ring-pink-500/50'
                      : 'border-pink-500/70'
                  }`}
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 text-white font-bold text-[10px] flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )
            ) : (
              <LogIn
                className={`w-5 h-5 ${
                  currentTab === 'account'
                    ? 'text-pink-400 stroke-[2.4]'
                    : 'text-pink-500 stroke-[2.0]'
                }`}
              />
            )}
          </div>
          <span
            className={`text-[10px] tracking-tight mt-1 font-medium transition-colors truncate max-w-full ${
              currentTab === 'account'
                ? 'text-white font-semibold'
                : 'text-pink-400/90 font-medium'
            }`}
          >
            {user && user.isGoogleUser
              ? language === 'hi'
                ? 'आप'
                : 'You'
              : language === 'hi'
              ? 'लॉगिन'
              : 'Login'}
          </span>
        </button>
      </div>
    </nav>
  );
};
