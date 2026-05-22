import React from 'react';

interface LogoProps {
  className?: string;
}

export const LogoIQ: React.FC<LogoProps> = ({ className = "w-10 h-10" }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="iqGradient" x1="0%" y1="20%" x2="100%" y2="80%">
        <stop offset="0%" stopColor="#2dd4bf" /> {/* Teal */}
        <stop offset="50%" stopColor="#3b82f6" /> {/* Blue */}
        <stop offset="100%" stopColor="#a855f7" /> {/* Purple */}
      </linearGradient>
    </defs>
    <circle cx="45" cy="45" r="28" stroke="url(#iqGradient)" strokeWidth="18" />
    <path d="M 45 45 L 80 80" stroke="url(#iqGradient)" strokeWidth="18" strokeLinecap="round" />
  </svg>
);
