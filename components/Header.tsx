
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-slate-800 shadow-md p-4 sticky top-0 z-50">
      <h1 className="text-3xl font-bold text-center text-sky-400">{title}</h1>
    </header>
  );
};
