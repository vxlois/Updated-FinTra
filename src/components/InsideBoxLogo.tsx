import React from 'react';

export function InsideBoxLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#3b82f6" fillOpacity="0.4" />
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21.5 7v10l-9.5 5-9.5-5V7" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 7l10 5 10-5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 9.5l5 2.5 5-2.5" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
