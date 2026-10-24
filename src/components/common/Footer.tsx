import React from 'react';
import { Logo } from './Logo';
import { ActiveTab } from '../../types';

interface FooterProps {
  onNavigate: (tab: ActiveTab) => void;
  onReopenWelcome: () => void;
  onOpenGuidesModal?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onReopenWelcome,
  onOpenGuidesModal,
}) => {
  return (
    <footer className="w-full bg-[#F4EFE6] border-t border-[#E8E1D5] py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#4C454A]">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <Logo size="sm" showText={false} />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="font-serif text-sm font-bold text-[#392538]">Utsav AI</span>
            <span className="hidden sm:inline text-[#E8E1D5]">|</span>
            <span className="italic text-[#755a2a]">Every celebration, beautifully planned.</span>
          </div>
        </div>

        {/* Actionable page links */}
        <div className="flex flex-wrap items-center justify-center gap-6 font-medium">
          <button
            onClick={() => onNavigate('landing')}
            className="hover:text-[#392538] transition-colors"
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('overview')}
            className="hover:text-[#392538] transition-colors"
          >
            Command Center
          </button>
          <button
            onClick={() => onNavigate('budget')}
            className="hover:text-[#392538] transition-colors"
          >
            Budget Studio
          </button>
          <button
            onClick={() => onNavigate('timeline')}
            className="hover:text-[#392538] transition-colors"
          >
            Timeline
          </button>
          {onOpenGuidesModal && (
            <button
              onClick={onOpenGuidesModal}
              className="hover:text-[#392538] transition-colors"
            >
              Field Guides
            </button>
          )}
          <button
            onClick={onReopenWelcome}
            className="text-[#755a2a] hover:text-[#392538] hover:underline transition-colors"
          >
            Replay Intro
          </button>
        </div>

        {/* Copyright notice */}
        <div className="text-[11px] text-[#4C454A]/80">
          © 2026 Utsav AI Technologies. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
