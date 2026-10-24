import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

interface WelcomeExperienceProps {
  isOpen: boolean;
  onDismiss: (target?: 'plan' | 'explore' | 'dashboard') => void;
}

export const WelcomeExperience: React.FC<WelcomeExperienceProps> = ({
  isOpen,
  onDismiss,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  // Prevent unwanted scrolling on body/html while welcome screen is active
  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      const prevOverscroll = document.body.style.overscrollBehavior;

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';

      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [isOpen]);

  // Handle Escape key to skip directly to celebration studio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isClosing]);

  if (!isOpen) return null;

  const handleClose = (target?: 'plan' | 'explore' | 'dashboard') => {
    setIsClosing(true);
    setTimeout(() => {
      try {
        sessionStorage.setItem('utsav_welcome_dismissed', 'true');
      } catch {}
      setIsClosing(false);
      onDismiss(target);
    }, 400);
  };

  return (
    <aside
      aria-label="Celebration Welcome Experience"
      aria-modal="true"
      role="dialog"
      className={`fixed inset-0 z-50 w-full h-[100dvh] max-h-[100dvh] overflow-hidden flex items-center justify-center p-3 sm:p-5 md:p-6 transition-all duration-500 ease-out bg-[#FAF7F0]/95 backdrop-blur-2xl select-none ${
        isClosing ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Glowing Floating Lanterns Decor */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Lantern 1 Top Left */}
        <div className="absolute top-[5%] left-[4%] sm:left-[8%] animate-lantern opacity-85">
          <div className="relative w-12 h-18 sm:w-16 sm:h-24 rounded-full bg-gradient-to-b from-[#C5A46D]/40 via-[#C97862]/60 to-[#392538]/70 shadow-[0_0_40px_16px_rgba(197,164,109,0.35)] flex items-center justify-center">
            <div className="w-3.5 h-5 sm:w-4 sm:h-6 rounded-full bg-[#C5A46D]/80 blur-[2px] animate-pulse" />
            <div className="absolute -top-2.5 sm:-top-3 w-5 sm:w-6 h-2.5 sm:h-3 rounded-t-md bg-[#C5A46D]" />
            <div className="absolute -bottom-2 w-2.5 sm:w-3 h-3.5 sm:h-4 bg-[#C97862]/80 rounded-b" />
          </div>
        </div>

        {/* Lantern 2 Top Right */}
        <div
          className="absolute top-[6%] right-[5%] sm:right-[10%] animate-lantern opacity-90"
          style={{ animationDelay: '-2.5s' }}
        >
          <div className="relative w-14 h-20 sm:w-20 sm:h-28 rounded-full bg-gradient-to-b from-[#FAF7F0] via-[#C5A46D]/60 to-[#C97862]/80 shadow-[0_0_50px_20px_rgba(201,120,98,0.35)] flex items-center justify-center">
            <div className="w-4 h-6 sm:w-5 sm:h-8 rounded-full bg-amber-200/90 blur-[2px] animate-pulse" />
            <div className="absolute -top-2.5 sm:-top-3 w-7 sm:w-8 h-2.5 sm:h-3 rounded-t-md bg-[#392538]" />
            <div className="absolute -bottom-2.5 sm:-bottom-3 w-3.5 sm:w-4 h-4 sm:h-5 bg-[#C5A46D] rounded-b" />
          </div>
        </div>

        {/* Lantern 3 Bottom Left */}
        <div
          className="hidden md:block absolute bottom-[8%] left-[8%] animate-lantern opacity-75"
          style={{ animationDelay: '-4s' }}
        >
          <div className="relative w-11 h-16 rounded-full bg-gradient-to-b from-[#C5A46D]/50 to-[#392538]/80 shadow-[0_0_35px_12px_rgba(197,164,109,0.25)] flex items-center justify-center">
            <div className="w-3 h-5 rounded-full bg-yellow-100 blur-[1px]" />
          </div>
        </div>

        {/* Floating Marigold Petals */}
        <div
          className="absolute w-3.5 h-5 rounded-full bg-amber-500/80 blur-[0.5px]"
          style={{ top: '-10px', left: '22%', animation: 'petalFall 9s linear infinite', animationDelay: '0.2s' }}
        />
        <div
          className="absolute w-3 h-4.5 rounded-full bg-[#C97862]/90"
          style={{ top: '-10px', left: '45%', animation: 'petalFall 11s linear infinite', animationDelay: '2.1s' }}
        />
        <div
          className="absolute w-3.5 h-5 rounded-full bg-amber-400/85"
          style={{ top: '-10px', left: '78%', animation: 'petalFall 8.5s linear infinite', animationDelay: '1.4s' }}
        />
        <div
          className="absolute w-2.5 h-3.5 rounded-full bg-amber-600/70"
          style={{ top: '-10px', left: '63%', animation: 'petalFall 10s linear infinite', animationDelay: '4s' }}
        />

        {/* Gold Shimmer Particles */}
        <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-[#C5A46D] blur-[1px] animate-shimmer" />
        <div
          className="absolute top-2/3 right-1/4 w-2 h-2 rounded-full bg-[#C5A46D] blur-[1px] animate-shimmer"
          style={{ animationDelay: '1.8s' }}
        />
        <div
          className="absolute top-1/2 left-1/5 w-2 h-2 rounded-full bg-amber-300 blur-[0.5px] animate-shimmer"
          style={{ animationDelay: '0.9s' }}
        />
      </div>

      {/* Modal Center Stage Card */}
      <div className="relative w-full max-w-[540px] mx-auto rounded-3xl bg-white/95 border border-[#C5A46D]/30 shadow-[0_20px_60px_-15px_rgba(57,37,56,0.20)] p-5 sm:p-7 md:p-8 text-center flex flex-col items-center gap-3.5 sm:gap-4 md:gap-5 z-10 my-auto">
        {/* Brand Emblem */}
        <div className="relative flex flex-col items-center">
          <Logo size="lg" showText={false} className="sm:scale-110" />
          <div className="mt-2.5 flex items-center gap-1.5 px-3 py-0.5 sm:py-1 rounded-full bg-[#F4EFE6] text-[#755a2a] text-[10px] sm:text-xs tracking-widest uppercase font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C97862] animate-ping" />
            Welcome to Utsav AI
          </div>
        </div>

        {/* Tagline & Serene Typography */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#392538] font-medium tracking-tight leading-snug sm:leading-tight">
            Every celebration, <br className="hidden sm:inline" />
            <span className="italic text-[#755a2a]">beautifully planned.</span>
          </h2>
          <p className="font-serif italic text-base sm:text-lg md:text-xl text-[#C97862] tracking-wide font-normal">
            Dream it. Plan it. Celebrate it.
          </p>
          <p className="font-sans text-xs sm:text-sm md:text-base text-[#4C454A] max-w-md mx-auto mt-0.5 leading-relaxed">
            Step into an atelier where heartfelt traditions, exquisite aesthetics, and intelligent logistics align seamlessly for your milestone moments.
          </p>
        </div>

        {/* Dual Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full pt-1">
          <button
            onClick={() => handleClose('plan')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#392538] text-[#FAF7F0] hover:bg-[#231123] font-sans text-xs sm:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all ring-1 ring-[#C5A46D]/30 focus-visible:ring-2 focus-visible:ring-[#C5A46D] cursor-pointer"
          >
            <span>Plan My Celebration</span>
            <span className="material-symbols-outlined text-base text-[#C5A46D]">auto_awesome</span>
          </button>
          <button
            onClick={() => handleClose('explore')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#F4EFE6] text-[#392538] hover:bg-[#ECE6DA] font-sans text-xs sm:text-sm font-semibold tracking-wide transition-colors focus-visible:ring-2 focus-visible:ring-[#C5A46D] cursor-pointer"
          >
            <span>Explore Celebrations</span>
            <span className="material-symbols-outlined text-base text-[#755a2a]">arrow_forward</span>
          </button>
        </div>

        {/* Subtle Quick Skip Link */}
        <button
          onClick={() => handleClose()}
          className="text-[11px] sm:text-xs font-sans text-[#4C454A]/80 hover:text-[#392538] underline underline-offset-4 decoration-[#C5A46D]/50 focus-visible:outline-none transition-colors cursor-pointer"
        >
          Skip directly to celebration studio (Esc)
        </button>
      </div>
    </aside>
  );
};
