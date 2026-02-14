import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const stats = [
    {
      title: t('home.totalAnimals', 'Total Animals'),
      value: '0',
      icon: '🐄',
      color: 'bg-blue-500'
    },
    {
      title: t('home.healthyAnimals', 'Healthy Animals'),
      value: '0',
      icon: '❤️',
      color: 'bg-green-500'
    },
    {
      title: t('home.alerts', 'Active Alerts'),
      value: '0',
      icon: '⚠️',
      color: 'bg-orange-500'
    },
    {
      title: t('health.title', 'Health Records'),
      value: '0',
      icon: '📋',
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    {
      title: t('animals.addAnimal', 'Add Animal'),
      description: t('animals.addAnimalDesc', 'Register a new animal'),
      icon: '➕',
      path: '/animals',
      color: 'bg-blue-500'
    },
    {
      title: t('health.title', 'Health Check'),
      description: t('health.recordHealth', 'Record health data'),
      icon: '🩺',
      path: '/health',
      color: 'bg-green-500'
    },
    {
      title: t('voice.title', 'Voice Analysis'),
      description: t('voice.analyzeSound', 'Analyze animal sounds'),
      icon: '🎤',
      path: '/voice',
      color: 'bg-purple-500'
    },
    {
      title: t('vets.title', 'Find Vet'),
      description: t('vets.findNearby', 'Find nearby veterinarians'),
      icon: '👨‍⚕️',
      path: '/vets',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('nav.dashboard', 'Dashboard')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('home.welcome', 'Welcome back')}, {user?.name}! 👋
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('home.quickActions', 'Quick Actions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.path}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('dashboard.recentActivity', 'Recent Activity')}
          </h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('dashboard.noActivity', 'No recent activity')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t('dashboard.startByAdding', 'Start by adding your first animal or recording health data')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}