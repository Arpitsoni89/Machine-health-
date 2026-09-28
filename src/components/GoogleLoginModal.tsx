import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  UserCheck, 
  HeartHandshake, 
  Sparkles,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { UserProfile } from '../types';
import { useTheme } from '../context/ThemeContext';
import { triggerHaptic } from '../utils/notificationHelpers';

export const GoogleLoginModal: React.FC = () => {
  const { 
    isLoginModalOpen, 
    closeLoginModal, 
    loginWithGoogle, 
    loginWithGooglePopup,
    user,
    isLoading,
    authError,
    clearAuthError
  } = useAuth();
  const { themeConfig } = useTheme();
  const [selectedRole, setSelectedRole] = useState<UserProfile['role']>('Plant Operations Manager');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleRealGooglePopup = async () => {
    triggerHaptic(20);
    await loginWithGooglePopup(selectedRole);
  };

  const handleQuickGoogleSignIn = (email: string, name: string) => {
    triggerHaptic(20);
    loginWithGoogle(email, name, selectedRole);
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    triggerHaptic(20);
    loginWithGoogle(customEmail, customName || undefined, selectedRole);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={closeLoginModal}
    >
      <div 
        className="relative w-full max-w-md bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden p-5 sm:p-7 max-h-[92dvh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 pb-safe sm:pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden pt-1 pb-2 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-300" />
        </div>

        {/* Close Button */}
        <button
          onClick={closeLoginModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-2xl ${themeConfig.badgeBg} ${themeConfig.textClass} flex items-center justify-center shadow-2xs`}>
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">MachineMind</h3>
            <p className={`text-xs font-semibold ${themeConfig.textClass}`}>Google Identity & Predictive Care</p>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-slate-900">
            {user ? 'Switch Google Account' : 'Sign in with Google'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Secure single sign-on for plant operators, reliability engineers, and factory owners.
          </p>
        </div>

        {/* Error Notice if any */}
        {authError && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{authError}</p>
            </div>
            <button onClick={clearAuthError} className="text-amber-600 hover:text-amber-900 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
            Operational Role:
          </label>
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {(
              [
                'Plant Operations Manager',
                'Chief Reliability Engineer',
                'Predictive Maintenance Specialist',
                'Executive VP Operations',
              ] as UserProfile['role'][]
            ).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  setSelectedRole(role);
                }}
                className={`p-2 sm:p-2.5 rounded-xl border text-left font-medium transition flex items-center justify-between cursor-pointer active:scale-95 ${
                  selectedRole === role
                    ? `${themeConfig.bgLightClass} ${themeConfig.textClass} border-sky-400 ring-1 ring-sky-500/30 font-bold`
                    : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span className="truncate">{role}</span>
                {selectedRole === role && <CheckCircle2 className={`w-3.5 h-3.5 ${themeConfig.textClass} shrink-0 ml-1`} />}
              </button>
            ))}
          </div>
        </div>

        {/* Google Sign In Actions */}
        {!isCustomMode ? (
          <div className="space-y-2.5">
            {/* Real Firebase Google OAuth Popup Button */}
            <button
              onClick={handleRealGooglePopup}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-2xl transition shadow-md cursor-pointer active:scale-95 disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.39 7.35 24 12 24z" />
                  <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z" />
                </svg>
              )}
              <span>{isLoading ? 'Connecting Google Account...' : 'Continue with Google Account'}</span>
            </button>

            {/* Quick 1-Click Profile: Harshit Sharma */}
            <div className="pt-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Or Quick-Access Factory Profile:
              </span>

              <button
                onClick={() => handleQuickGoogleSignIn('harshit998ops@gmail.com', 'Harshit Sharma')}
                disabled={isLoading}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition group shadow-2xs cursor-pointer active:scale-95"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
                    alt="Harshit Sharma"
                    className="w-8 h-8 rounded-full object-cover border border-slate-300 shrink-0"
                  />
                  <div className="text-left min-w-0">
                    <p className={`text-xs font-bold text-slate-900 group-hover:${themeConfig.textClass} transition truncate`}>
                      Harshit Sharma (Plant Owner)
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">harshit998ops@gmail.com</p>
                  </div>
                </div>
                <span className={`text-xs font-bold ${themeConfig.textClass} shrink-0 ml-2`}>
                  Sign in →
                </span>
              </button>
            </div>

            {/* Custom Google account button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`text-xs text-slate-500 hover:${themeConfig.textClass} font-semibold transition cursor-pointer`}
              >
                Sign in with custom plant credentials
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="engineer@company.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name (optional)</label>
              <input
                type="text"
                placeholder="e.g. Vikramaditya Rathore"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm focus:outline-hidden focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition cursor-pointer min-h-[44px]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading || !customEmail}
                className={`flex-1 py-2.5 px-4 ${themeConfig.primaryClass} ${themeConfig.primaryHoverClass} text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Security Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Firebase & Google OAuth 2.0</span>
          </div>
          <div>
            <span>Plant Alpha · Alwar Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
};
