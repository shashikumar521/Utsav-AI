import React, { useState } from 'react';
import { Logo } from './Logo';
import { ActiveTab } from '../../types';

interface HeaderProps {
  currentTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  onReopenWelcome: () => void;
  onOpenQuickPlan?: () => void;
  onOpenGuidesModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onNavigate,
  onReopenWelcome,
  onOpenQuickPlan,
  onOpenGuidesModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboard = currentTab !== 'landing';

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F0]/90 backdrop-blur-md border-b border-[#E8E1D5] shadow-[0_4px_20px_-4px_rgba(57,37,56,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark Element */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A46D] rounded-lg"
          aria-label="Utsav AI Homepage"
        >
          <Logo size="md" />
        </button>

        {/* Zone 2: Navigation Links (single-line, clean unboxed text) */}
        <nav
          aria-label="Main Navigation"
          className="hidden md:flex items-center gap-1 font-sans text-xs lg:text-sm font-medium text-[#4C454A]"
        >
          <button
            onClick={() => onNavigate('landing')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              currentTab === 'landing'
                ? 'bg-[#F4EFE6] text-[#392538] font-semibold'
                : 'hover:bg-[#F4EFE6] hover:text-[#392538]'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => {
              if (currentTab !== 'landing') onNavigate('landing');
              setTimeout(() => {
                document.getElementById('quick-plan')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3 py-1.5 rounded-lg hover:bg-[#F4EFE6] hover:text-[#392538] whitespace-nowrap transition-colors"
          >
            Quick Plan
          </button>

          <button
            onClick={() => {
              if (currentTab !== 'landing') onNavigate('landing');
              setTimeout(() => {
                document.getElementById('featured-events')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3 py-1.5 rounded-lg hover:bg-[#F4EFE6] hover:text-[#392538] whitespace-nowrap transition-colors"
          >
            Celebrations
          </button>

          <button
            onClick={() => {
              if (currentTab !== 'landing') onNavigate('landing');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="px-3 py-1.5 rounded-lg hover:bg-[#F4EFE6] hover:text-[#392538] whitespace-nowrap transition-colors"
          >
            Methodology
          </button>

          {onOpenGuidesModal && (
            <button
              onClick={onOpenGuidesModal}
              className="px-3 py-1.5 rounded-lg hover:bg-[#F4EFE6] hover:text-[#392538] whitespace-nowrap transition-colors"
            >
              Field Guides
            </button>
          )}

          <button
            onClick={() => onNavigate('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              isDashboard
                ? 'bg-[#392538] text-[#FAF7F0] font-semibold'
                : 'hover:bg-[#F4EFE6] text-[#755a2a] font-semibold'
            }`}
          >
            Command Center
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onReopenWelcome}
            className="p-2 rounded-lg text-[#755a2a] hover:text-[#392538] hover:bg-[#F4EFE6] transition-colors inline-flex items-center gap-1 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-[#C5A46D]"
            title="Replay celebration welcome intro"
          >
            <span className="material-symbols-outlined text-base">magic_button</span>
            <span className="hidden sm:inline">Intro</span>
          </button>

          {isDashboard ? (
            <button
              onClick={() => onNavigate('ai-assistant')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#392538] text-[#FAF7F0] text-xs sm:text-sm font-semibold hover:bg-[#231123] transition shadow-xs"
            >
              <span className="material-symbols-outlined text-sm text-[#C5A46D]">auto_awesome</span>
              <span className="whitespace-nowrap">AI Assistant</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (onOpenQuickPlan) {
                  onOpenQuickPlan();
                } else {
                  const el = document.getElementById('quick-plan');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else onNavigate('overview');
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#392538] text-[#FAF7F0] text-xs sm:text-sm font-semibold hover:bg-[#231123] transition shadow-xs focus-visible:ring-2 focus-visible:ring-[#C5A46D]"
            >
              <span className="whitespace-nowrap">Start Planning</span>
              <span className="material-symbols-outlined text-sm text-[#C5A46D]">arrow_forward</span>
            </button>
          )}

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
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538] font-medium"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('overview');
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg bg-[#392538] text-[#FAF7F0] font-semibold"
          >
            Command Center
          </button>
          <button
            onClick={() => {
              onNavigate('budget');
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538]"
          >
            Budget Studio
          </button>
          <button
            onClick={() => {
              onNavigate('timeline');
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538]"
          >
            Timeline & Tasks
          </button>
          <button
            onClick={() => {
              onNavigate('moodboard');
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538]"
          >
            Moodboard Studio
          </button>
          <button
            onClick={() => {
              onNavigate('guests');
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538]"
          >
            Guests & Vendors
          </button>
          <button
            onClick={() => {
              onNavigate('ai-assistant');
              setMobileMenuOpen(false);
            }}
            className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#755a2a] font-semibold flex items-center justify-between"
          >
            <span>AI Concierge</span>
            <span className="text-[10px] bg-[#C5A46D]/20 px-1.5 py-0.5 rounded text-[#755a2a]">PRO</span>
          </button>
          {onOpenGuidesModal && (
            <button
              onClick={() => {
                onOpenGuidesModal();
                setMobileMenuOpen(false);
              }}
              className="text-left px-3 py-2 rounded-lg hover:bg-[#F4EFE6] text-[#392538]"
            >
              Editorial Field Guides
            </button>
          )}
        </div>
      )}
    </header>
  );
};
