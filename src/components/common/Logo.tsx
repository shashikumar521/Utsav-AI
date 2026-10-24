import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textClassName = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Brandmark SVG with Deep Plum background, ivory 'U', champagne star sparkle, terracotta dot */}
      <svg
        className={`${sizeMap[size]} shrink-0 rounded-xl shadow-xs`}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Utsav AI Brandmark"
      >
        <rect width="48" height="48" rx="10" fill="#392538" />
        <path
          d="M15 14V26C15 31.5 18.5 35 24 35C29.5 35 33 31.5 33 26V14"
          stroke="#FAF7F0"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Auspicious 4-point celebration sparkle in champagne gold */}
        <path
          d="M33 13C33 16.5 35.5 19 39 19C35.5 19 33 21.5 33 25C33 21.5 30.5 19 27 19C30.5 19 33 16.5 33 13Z"
          fill="#C5A46D"
        />
        {/* Soft terracotta center accent dot */}
        <circle cx="24" cy="24" r="1.8" fill="#C97862" />
      </svg>

      {showText && (
        <div className={`flex flex-col leading-tight ${textClassName}`}>
          <span className="font-serif text-lg lg:text-xl font-bold tracking-tight text-[#392538]">
            Utsav AI
          </span>
          <span className="font-sans text-[10px] tracking-widest uppercase text-[#755a2a] font-semibold">
            Celebration Studio
          </span>
        </div>
      )}
    </div>
  );
};
