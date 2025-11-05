import React from 'react';

export default function DashboardCards({ stats, className = '', columns = 4 }) {
  if (!stats || !Array.isArray(stats) || stats.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <div className="text-gray-400 dark:text-gray-500 mb-3">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium">No statistics available</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add some data to see your metrics</p>
      </div>
    );
  }

  const gridConfig = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  };

  const getTrendStyles = (trend) => {
    const baseStyles = 'px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1';
    
    switch (trend) {
      case 'up':
        return `${baseStyles} text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20`;
      case 'down':
        return `${baseStyles} text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20`;
      case 'neutral':
        return `${baseStyles} text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800`;
      default:
        return `${baseStyles} text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800`;
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`grid ${gridConfig[columns] || gridConfig[4]} gap-4 md:gap-6 ${className}`}>
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                {stat.title}
              </h3>
              
              {stat.trend && stat.trendValue && (
                <div className={`mt-2 ${getTrendStyles(stat.trend)}`}>
                  {getTrendIcon(stat.trend)}
                  <span className="font-semibold">{stat.trendValue}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            
            {stat.subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {stat.subtitle}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}