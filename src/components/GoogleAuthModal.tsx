import React, { useState } from 'react';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { signInWithGoogle, logOutFromGoogle } from '../firebase';

interface GoogleAuthModalProps {
  currentUser: UserProfile | null;
  onLogin: (user: UserProfile) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  currentUser,
  onLogin,
  onLogout,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRealGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const userProfile = await signInWithGoogle();
      onLogin(userProfile);
      onClose();
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      if (firebaseErr.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In popup was closed. Please try again.');
      } else if (firebaseErr.code === 'auth/popup-blocked') {
        setErrorMsg('Popups are blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setErrorMsg(firebaseErr.message || 'Could not complete Google Sign-In. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logOutFromGoogle();
    onLogout();
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

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl overflow-hidden shadow-md shadow-pink-500/20 border border-neutral-200 dark:border-neutral-700">
            <img
              src="/mytube-icon.jpg"
              alt="mytube"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {currentUser?.isGoogleUser ? 'Google Account Connected' : 'Sign in to mytube'}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Secure Firebase Google Authentication & Personal Profile
          </p>
        </div>

        {currentUser?.isGoogleUser ? (
          /* Already Signed In View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-800/80 border border-gray-100 dark:border-neutral-700 flex items-center gap-3.5">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-pink-500 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-500 text-white font-bold text-base flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Google Account
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
              >
                Sign out of Google Account
              </button>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Signed Out -> Real Google Sign-In Only */
          <div className="space-y-4">
            <button
              onClick={handleRealGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-pink-500/30 hover:border-pink-500 bg-white dark:bg-neutral-800 text-gray-900 dark:text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 group active:scale-98 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 text-pink-500 animate-spin" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  </div>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                <p>{errorMsg}</p>
              </div>
            )}

            <p className="text-[11px] text-center text-gray-500 dark:text-gray-400">
              Sign in with your personal Gmail account to keep your own private Uploads, Watch History, and Settings synced securely.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
