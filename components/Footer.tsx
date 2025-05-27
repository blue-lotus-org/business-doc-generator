
import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-850 border-t border-slate-700 p-4 text-center text-sm text-slate-400">
      <p>Made by Blue Lotus "https://lotuschain.org", 2023 - {currentYear}</p>
    </footer>
  );
};
