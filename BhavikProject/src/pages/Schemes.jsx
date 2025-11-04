import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Schemes() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('schemes.all', 'All Schemes'), icon: '🏛️' },
    { id: 'subsidy', name: t('schemes.subsidy', 'Subsidies'), icon: '💰' },
    { id: 'insurance', name: t('schemes.insurance', 'Insurance'), icon: '🛡️' },
    { id: 'loan', name: t('schemes.loan', 'Loans'), icon: '🏦' },
    { id: 'training', name: t('schemes.training', 'Training'), icon: '📚' }
  ];

  const schemes = [
    {
      id: 1,
      title: 'Dairy Development Scheme',
      category: 'subsidy',
      description: 'Financial assistance for setting up dairy farms and purchasing dairy animals.',
      benefits: ['Up to ₹5 lakh subsidy', 'Low interest loans', 'Technical support'],
      eligibility: ['Small and marginal farmers', 'Annual income below ₹3 lakh', 'Land ownership proof'],
      deadline: '2024-03-31',
      status: 'active',
      department: 'Department of Animal Husbandry',
      icon: '🥛'
    },
    {
      id: 2,
      title: 'Livestock Insurance Scheme',
      category: 'insurance',
      description: 'Comprehensive insurance coverage for cattle, buffalo, sheep, goat, and poultry.',
      benefits: ['100% premium subsidy for small farmers', 'Coverage up to ₹50,000 per animal', 'Quick claim settlement'],
      eligibility: ['All livestock owners', 'Animals aged 6 months to 8 years', 'Healthy animals only'],
      deadline: '2024-12-31',
      status: 'active',
      department: 'Ministry of Agriculture',
      icon: '🐄'
    },
    {
      id: 3,
      title: 'Poultry Development Program',
      category: 'loan',
      description: 'Credit support for establishing commercial poultry farms and hatcheries.',
      benefits: ['Loans up to ₹20 lakh', '4% interest rate', '5-year repayment period'],
      eligibility: ['Entrepreneurs and farmers', 'Technical knowledge required', 'Project report mandatory'],
      deadline: '2024-06-30',
      status: 'active',
      department: 'National Bank for Agriculture',
      icon: '🐔'
    },
    {
      id: 4,
      title: 'Veterinary Training Initiative',
      category: 'training',
      description: 'Skill development program for livestock health management and modern farming techniques.',
      benefits: ['Free training for 30 days', 'Certificate provided', 'Job placement assistance'],
      eligibility: ['Age 18-45 years', '10th pass minimum', 'Interest in animal husbandry'],
      deadline: '2024-04-15',
      status: 'active',
      department: 'Skill Development Ministry',
      icon: '👨‍⚕️'
    },
    {
      id: 5,
      title: 'Goat Development Scheme',
      category: 'subsidy',
      description: 'Support for goat rearing with focus on breed improvement and productivity enhancement.',
      benefits: ['₹2 lakh per unit subsidy', 'Breed improvement support', 'Marketing assistance'],
      eligibility: ['BPL families preferred', 'Land for goat shed', 'Basic animal husbandry knowledge'],
      deadline: '2024-02-28',
      status: 'expired',
      department: 'State Animal Husbandry',
      icon: '🐐'
    }
  ];

  const filteredSchemes = selectedCategory === 'all' 
    ? schemes 
    : schemes.filter(scheme => scheme.category === selectedCategory);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-700 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'expired':
        return 'text-red-700 bg-red-50 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'upcoming':
        return 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
    }
  };

  const isDeadlineNear = (deadline) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('schemes.title', 'Government Schemes')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('schemes.subtitle', 'Explore government schemes and subsidies for livestock farmers')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400">✅</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {schemes.filter(s => s.status === 'active').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Schemes</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400">⏰</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {schemes.filter(s => isDeadlineNear(s.deadline)).length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ending Soon</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400">💰</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {schemes.filter(s => s.category === 'subsidy').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Subsidies</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400">🏦</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {schemes.filter(s => s.category === 'loan').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loan Schemes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('schemes.categories', 'Categories')}
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchemes.map((scheme) => (
            <div key={scheme.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-2xl">
                    {scheme.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {scheme.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {scheme.department}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(scheme.status)}`}>
                    {scheme.status === 'active' ? t('schemes.active', 'Active') : 
                     scheme.status === 'expired' ? t('schemes.expired', 'Expired') : 
                     t('schemes.upcoming', 'Upcoming')}
                  </span>
                  {isDeadlineNear(scheme.deadline) && scheme.status === 'active' && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800">
                      {t('schemes.endingSoon', 'Ending Soon')}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {scheme.description}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('schemes.benefits', 'Benefits')}
                  </h4>
                  <ul className="space-y-1">
                    {scheme.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="text-green-500 mt-0.5">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    {t('schemes.eligibility', 'Eligibility')}
                  </h4>
                  <ul className="space-y-1">
                    {scheme.eligibility.map((criteria, index) => (
                      <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="text-blue-500 mt-0.5">•</span>
                        <span>{criteria}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">{t('schemes.deadline', 'Deadline')}:</span> {new Date(scheme.deadline).toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
                    {t('schemes.viewDetails', 'View Details')}
                  </button>
                  {scheme.status === 'active' && (
                    <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-3 rounded text-sm transition-colors">
                      {t('schemes.apply', 'Apply Now')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              {t('schemes.needHelp', 'Need Help with Applications?')}
            </h2>
            <p className="text-blue-700 dark:text-blue-300 mb-6 max-w-2xl mx-auto">
              {t('schemes.helpDesc', 'Our team can help you understand eligibility criteria, prepare documents, and complete your applications successfully.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                {t('schemes.getHelp', 'Get Application Help')}
              </button>
              <button className="border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-medium py-2 px-6 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                {t('schemes.downloadGuide', 'Download Application Guide')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}