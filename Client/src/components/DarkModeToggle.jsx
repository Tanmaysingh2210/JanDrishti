import React, { useState, useEffect } from 'react';

export default function DarkModeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('jandrishti_theme');
      if (stored) return stored === 'dark';
      return false;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('jandrishti_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('jandrishti_theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(prev => !prev)}
      type="button"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Dark Mode"
      className={`relative inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer shadow-sm ${className}`}
    >
      <span className="material-symbols-outlined text-xl transition-transform duration-300 transform dark:rotate-180">
        {isDark ? 'light_mode' : 'dark_mode'}
      </span>
      <span className="sr-only">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
