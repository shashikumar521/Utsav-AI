import React from 'react';
import { Logo } from './Logo';
import { ActiveTab } from '../../types';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onReopenWelcome?: () => void;
  onOpenGuidesModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onReopenWelcome }) => {
  return (
    <footer className="w-full bg-[#F4EFE6] border-t border-[#E8E1D5] py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4C454A]">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <Logo size="sm" showText={false} />
          <span className="font-serif text-sm font-semibold text-[#392538]">Utsav AI</span>
          <span className="text-[#DFD7C7]">·</span>
          <span>Every celebration, beautifully planned.</span>
        </div>

        {/* Useful quick links */}
        <div className="flex items-center gap-5 font-medium">
          <button
            onClick={() => {
              onNavigate('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hover:text-[#392538] transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('events')}
            className="hover:text-[#392538] transition-colors"
          >
            Explore Events
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              setTimeout(() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="hover:text-[#392538] transition-colors"
          >
            How It Works
          </button>
          <button
            onClick={() => onNavigate('overview')}
            className="hover:text-[#392538] transition-colors font-semibold text-[#392538]"
          >
            Dashboard
          </button>
          {onReopenWelcome && (
            <button
              onClick={onReopenWelcome}
              className="text-[#755a2a] hover:text-[#392538] transition-colors font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm text-[#C5A46D]">auto_awesome</span>
              <span>Replay Intro</span>
            </button>
          )}
        </div>

        {/* Copyright notice */}
        <div className="text-[11px] text-[#4C454A]/70">
          © 2026 Utsav AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
