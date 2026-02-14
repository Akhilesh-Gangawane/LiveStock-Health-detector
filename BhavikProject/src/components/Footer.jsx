import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🐄</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {t('app.title', 'Livestock Health Monitor')}
            </h3>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t('footer.description', 'Smart livestock health monitoring and disease detection platform')}
          </p>
          
          <div className="flex justify-center space-x-6 mb-6">
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
              {t('footer.privacy', 'Privacy Policy')}
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
              {t('footer.terms', 'Terms of Service')}
            </a>
            <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
              {t('footer.contact', 'Contact Us')}
            </a>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2024 {t('app.title', 'Livestock Health Monitor')}. {t('footer.rights', 'All rights reserved.')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}