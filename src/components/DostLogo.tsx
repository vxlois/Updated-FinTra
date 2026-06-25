import React from 'react';

export function DostLogo({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Top Left Circle */}
      {/* Black top half */}
      <path d="M 2 26 A 24 24 0 0 1 50 26 L 26 26 Z" fill="#000000" />
      {/* Blue bottom-left quadrant */}
      <path d="M 2 26 A 24 24 0 0 0 26 50 L 26 26 Z" fill="#00AEEF" />
      {/* White bottom-right quadrant */}
      <path d="M 26 26 L 26 50 A 24 24 0 0 0 50 26 Z" fill="#ffffff" />

      {/* Top Right Circle */}
      {/* Blue top-left quadrant */}
      <path d="M 50 26 A 24 24 0 0 1 74 2 L 74 26 Z" fill="#00AEEF" />
      {/* Black right half */}
      <path d="M 74 2 A 24 24 0 0 1 98 26 A 24 24 0 0 1 74 50 L 74 26 Z" fill="#000000" />
      {/* White bottom-left quadrant */}
      <path d="M 74 26 L 50 26 A 24 24 0 0 0 74 50 Z" fill="#ffffff" />

      {/* Bottom Left Circle */}
      {/* Black left half */}
      <path d="M 26 50 A 24 24 0 0 0 2 74 A 24 24 0 0 0 26 98 L 26 74 Z" fill="#000000" />
      {/* White top-right quadrant */}
      <path d="M 26 74 L 26 50 A 24 24 0 0 1 50 74 Z" fill="#ffffff" />
      {/* Blue bottom-right quadrant */}
      <path d="M 26 74 L 50 74 A 24 24 0 0 1 26 98 Z" fill="#00AEEF" />

      {/* Bottom Right Circle */}
      {/* White top-left quadrant */}
      <path d="M 74 74 L 50 74 A 24 24 0 0 1 74 50 Z" fill="#ffffff" />
      {/* Blue top-right quadrant */}
      <path d="M 74 74 L 74 50 A 24 24 0 0 1 98 74 Z" fill="#00AEEF" />
      {/* Black bottom half */}
      <path d="M 50 74 A 24 24 0 0 0 74 98 A 24 24 0 0 0 98 74 L 74 74 Z" fill="#000000" />

      {/* Center Black Star/Diamond */}
      <path d="M 26 50 A 24 24 0 0 0 50 26 A 24 24 0 0 0 74 50 A 24 24 0 0 0 50 74 A 24 24 0 0 0 26 50 Z" fill="#000000" />
    </svg>
  );
}
