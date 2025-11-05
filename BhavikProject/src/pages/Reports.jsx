import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Reports() {
  const { t } = useTranslation();

  const reportTypes = [
    {
      title: t('reports.healthReport', 'Health Report'),
      description: t('reports.healthReportDesc', 'Comprehensive health analysis of your animals'),
      icon: '📊',
      color: 'bg-blue-500'
    },
    {
      title: t('reports.vaccinationReport', 'Vaccination Report'),
      description: t('reports.vaccinationReportDesc', 'Track vaccination schedules and compliance'),
      icon: '💉',
      color: 'bg-green-500'
    },
    {
      title: t('reports.financialReport', 'Financial Report'),
      description: t('reports.financialReportDesc', 'Monitor expenses and revenue from livestock'),
      icon: '💰',
      color: 'bg-yellow-500'
    },
    {
      title: t('reports.productionReport', 'Production Report'),
      description: t('reports.productionReportDesc', 'Track milk, eggs, and other production metrics'),
      icon: '🥛',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('reports.title', 'Reports')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('reports.subtitle', 'Generate and view detailed reports about your livestock')}
          </p>
        </div>

        {/* Report Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {reportTypes.map((report, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300 cursor-pointer group"
            >
              <div className={`w-12 h-12 ${report.color} rounded-lg flex items-center justify-center text-white text-xl mb-4 group-hover:scale-110 transition-transform`}>
                {report.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {report.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {report.description}
              </p>
              <button className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                {t('reports.generate', 'Generate Report')}
              </button>
            </div>
          ))}
        </div>

        {/* Recent Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('reports.recent', 'Recent Reports')}
          </h2>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('reports.noReports', 'No reports generated yet')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t('reports.generateFirst', 'Generate your first report to see it here')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}