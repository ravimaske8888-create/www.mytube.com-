import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'full' | 'clean';
}

export const MytubeLogo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
  variant = 'badge',
}) => {
  const badgeSizes = {
    sm: 'w-6 h-6 rounded-md',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-14 h-14 rounded-2xl',
    xl: 'w-24 h-24 rounded-3xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-5xl',
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Exact App Icon matching user's uploaded Gemini_Generated_Image_l73wz7l73wz7l73w.png */}
      <div
        className={`relative flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm bg-black ${badgeSizes[size]}`}
      >
        <img
          src="/mytube-icon.png"
          alt="mytube icon"
          className="w-full h-full object-cover select-none"
        />
      </div>

      {showText && (
        <span
          className={`font-bold tracking-tight inline-block select-none leading-none ${textSizes[size]}`}
          style={{
            background:
              'linear-gradient(90deg, #ba1766 0%, #9c2486 20%, #663090 40%, #4949a0 60%, #367db6 80%, #20b1bf 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.03em',
            fontFamily:
              '"Plus Jakarta Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          mytube
        </span>
      )}
    </div>
  );
};
