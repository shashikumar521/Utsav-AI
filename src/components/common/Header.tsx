import React, { useState } from 'react';
import { Logo } from './Logo';
import { ActiveTab } from '../../types';

interface HeaderProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onReopenWelcome?: () => void;
  onOpenQuickPlan?: () => void;
  onOpenGuidesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onReopenWelcome,
  onOpenQuickPlan,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [userEmail, setUserEmail] = useState(() => {
    try {
      return localStorage.getItem('utsav_user_email') || 'Host (Guest)';
    } catch {
      return 'Host (Guest)';
    }
  });
  const [tempEmail, setTempEmail] = useState('');

  const isDashboard = currentTab !== 'landing';

  const handleStartPlanning = () => {
    if (onOpenQuickPlan) {
      onOpenQuickPlan();
    } else {
      const el = document.getElementById('quick-plan');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('overview');
      }
    }
  };

  const handleExploreEvents = () => {
    if (isDashboard) {
      onNavigate('events');
    } else {
      const el = document.getElementById('popular-events');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigate('events');
      }
    }
  };

  const handleHowItWorks = () => {
    if (isDashboard) {
      onNavigate('landing');
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempEmail.trim()) {
      setUserEmail(tempEmail.trim());
      try {
        localStorage.setItem('utsav_user_email', tempEmail.trim());
      } catch {}
      setShowSignInModal(false);
      setTempEmail('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F0]/95 backdrop-blur-md border-b border-[#E8E1D5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] rounded-lg"
          aria-label="Utsav AI Home"
        >
          <Logo size="md" />
        </button>

        {/* Compact Navigation Links */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 font-sans text-xs lg:text-sm font-medium text-[#4C454A]"
        >
          <button
            onClick={() => {
              if (isDashboard) onNavigate('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              currentTab === 'landing'
                ? 'bg-[#F4EFE6] text-[#392538] font-semibold'
                : 'hover:bg-[#F4EFE6] hover:text-[#392538]'
            }`}
          >
            Home
          </button>

          <button
            onClick={handleExploreEvents}
            className="px-3 py-1.5 rounded-lg hover:bg-[#F4EFE6] hover:text-[#392538] transition-colors"
          >
            Explore Events
          </button>

          <button
            onClick={handleHowItWorks}
            className="px-3 py-1.5 rounded-lg hover:bg-[#F4EFE6] hover:text-[#392538] transition-colors"
          >
            How It Works
          </button>

          {isDashboard && (
            <button
              onClick={() => onNavigate('overview')}
              className="px-3 py-1.5 rounded-lg bg-[#392538] text-white font-semibold"
            >
              Dashboard
            </button>
          )}
        </nav>

        {/* Action Buttons: Intro + Sign In + Start Planning */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {onReopenWelcome && (
            <button
              onClick={onReopenWelcome}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-[#755a2a] hover:text-[#392538] hover:bg-[#F4EFE6] transition-colors inline-flex items-center gap-1 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#C5A46D]"
              title="Replay celebration welcome intro"
              aria-label="Replay Welcome Intro"
            >
              <span className="material-symbols-outlined text-base text-[#C5A46D]">auto_awesome</span>
              <span className="hidden sm:inline">Intro</span>
            </button>
          )}

          <button
            onClick={() => setShowSignInModal(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#392538] hover:bg-[#F4EFE6] rounded-lg border border-[#E8E1D5] transition-colors"
          >
            <span className="material-symbols-outlined text-sm text-[#755a2a]">account_circle</span>
            <span className="truncate max-w-[120px]">{userEmail}</span>
          </button>

          <button
            onClick={handleStartPlanning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#392538] text-[#FAF7F0] text-xs sm:text-sm font-semibold hover:bg-[#231123] transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-[#C5A46D]"
          >
            <span>Start Planning</span>
            <span className="material-symbols-outlined text-sm text-[#C5A46D]">arrow_forward</span>
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 rounded-lg text-[#392538] hover:bg-[#F4EFE6] transition-colors"
            aria-label="Toggle navigation menu"
          >
            <span className="material-symbols-outlined text-2xl">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-5 bg-[#FAF7F0] border-b border-[#E8E1D5] flex flex-col gap-2 font-sans text-sm">
          <button
            onClick={() => {
              onNavigate('landing');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538] font-medium"
          >
            Home
          </button>
          <button
            onClick={() => {
              handleExploreEvents();
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538]"
          >
            Explore Events
          </button>
          <button
            onClick={() => {
              handleHowItWorks();
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538]"
          >
            How It Works
          </button>
          {onReopenWelcome && (
            <button
              onClick={() => {
                onReopenWelcome();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#755a2a] font-medium flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base text-[#C5A46D]">auto_awesome</span>
                <span>Replay Intro</span>
              </span>
            </button>
          )}
          <button
            onClick={() => {
              setShowSignInModal(true);
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#755a2a] font-medium flex items-center justify-between"
          >
            <span>Account: {userEmail}</span>
            <span className="material-symbols-outlined text-sm">login</span>
          </button>
          <button
            onClick={() => {
              handleStartPlanning();
              setMobileMenuOpen(false);
            }}
            className="text-center mt-2 py-2.5 px-4 bg-[#392538] text-white rounded-xl font-semibold shadow-xs"
          >
            Start Planning
          </button>
        </div>
      )}

      {/* Clean Sign In Modal */}
      {showSignInModal && (
        <div className="fixed inset-0 z-50 bg-[#392538]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E8E1D5] relative animate-in fade-in duration-200">
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 text-[#4C454A] hover:text-[#392538]"
              aria-label="Close"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 rounded-lg bg-[#F4EFE6] text-[#755a2a]">
                <span className="material-symbols-outlined text-xl">person</span>
              </span>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#392538]">Host Account</h3>
                <p className="text-xs text-[#4C454A]">Save and sync your event plans</p>
              </div>
            </div>

            <form onSubmit={handleSignInSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-[#392538] mb-1">
                  Your Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF7F0] border border-[#E8E1D5] rounded-xl focus:outline-none focus:border-[#392538]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#392538] text-white rounded-xl text-xs font-semibold hover:bg-[#231123] transition-colors shadow-xs"
              >
                Save & Continue
              </button>
            </form>

            <p className="text-[11px] text-[#4C454A] text-center mt-3">
              Your plans are automatically saved on this device.
            </p>
          </div>
        </div>
      )}
    </header>
  );
};
