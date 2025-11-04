import React from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle({ className = '' }) {
  const { theme, setTheme } = useApp();
  const { t } = useTranslation();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        theme === 'dark' 
          ? 'bg-blue-600' 
          : 'bg-gray-300'
      } ${className}`}
      title={theme === 'dark' ? t('theme.switchToLight', 'Switch to light mode') : t('theme.switchToDark', 'Switch to dark mode')}
    >
      <span
        className={`inline-block w-5 h-5 rounded-full bg-white shadow-lg transform transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-3' : 'translate-x-0'
        }`}
      >
        <span className="flex items-center justify-center w-full h-full text-xs">
          {theme === 'dark' ? '🌙' : '☀️'}
        </span>
      </span>
    </button>
  );
}