import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function KnowledgeBase() {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: t('knowledge.all', 'All Topics'), icon: '📚' },
    { id: 'diseases', name: t('knowledge.diseases', 'Diseases'), icon: '🦠' },
    { id: 'treatments', name: t('knowledge.treatments', 'Treatments'), icon: '💊' },
    { id: 'prevention', name: t('knowledge.prevention', 'Prevention'), icon: '🛡️' },
    { id: 'nutrition', name: t('knowledge.nutrition', 'Nutrition'), icon: '🌾' },
    { id: 'breeding', name: t('knowledge.breeding', 'Breeding'), icon: '🐄' }
  ];

  const articles = [
    {
      id: 1,
      title: 'Common Cattle Diseases and Their Prevention',
      category: 'diseases',
      excerpt: 'Learn about the most common diseases affecting cattle and how to prevent them through proper management practices.',
      readTime: '5 min read',
      author: 'Dr. Rajesh Sharma',
      date: '2024-02-10',
      image: '🐄'
    },
    {
      id: 2,
      title: 'Vaccination Schedule for Dairy Animals',
      category: 'prevention',
      excerpt: 'A comprehensive guide to vaccination schedules for dairy cattle, including timing and important considerations.',
      readTime: '8 min read',
      author: 'Dr. Priya Patel',
      date: '2024-02-08',
      image: '💉'
    },
    {
      id: 3,
      title: 'Nutritional Requirements for Growing Calves',
      category: 'nutrition',
      excerpt: 'Understanding the nutritional needs of growing calves for optimal health and development.',
      readTime: '6 min read',
      author: 'Dr. Amit Kumar',
      date: '2024-02-05',
      image: '🍼'
    },
    {
      id: 4,
      title: 'Recognizing Signs of Respiratory Illness',
      category: 'diseases',
      excerpt: 'Early detection of respiratory problems in livestock can prevent serious complications and reduce treatment costs.',
      readTime: '4 min read',
      author: 'Dr. Sunita Rao',
      date: '2024-02-03',
      image: '🫁'
    },
    {
      id: 5,
      title: 'Best Practices for Animal Housing',
      category: 'prevention',
      excerpt: 'Proper housing design and management practices to maintain animal health and productivity.',
      readTime: '7 min read',
      author: 'Dr. Vikram Singh',
      date: '2024-02-01',
      image: '🏠'
    },
    {
      id: 6,
      title: 'Breeding Management for Dairy Cattle',
      category: 'breeding',
      excerpt: 'Effective breeding strategies to improve milk production and maintain healthy dairy herds.',
      readTime: '10 min read',
      author: 'Dr. Meera Joshi',
      date: '2024-01-28',
      image: '🐮'
    }
  ];

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('knowledge.title', 'Knowledge Center')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('knowledge.subtitle', 'Expert articles and guides for livestock health management')}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                className="input-field"
                placeholder={t('knowledge.searchPlaceholder', 'Search articles, diseases, treatments...')}
              />
            </div>
            <button className="btn-primary">
              {t('common.search', 'Search')}
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('knowledge.categories', 'Categories')}
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

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <div key={article.id} className="card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-2xl">
                  {article.image}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    {categories.find(cat => cat.id === article.category)?.name}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {article.title}
              </h3>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                {article.excerpt}
              </p>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span>{article.author}</span>
                <span>{article.readTime}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(article.date).toLocaleDateString()}
                </span>
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">
                  {t('knowledge.readMore', 'Read More')} →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Resources */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-8 border border-green-200 dark:border-green-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('knowledge.featuredResources', 'Featured Resources')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('knowledge.diseaseGuide', 'Disease Guide')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('knowledge.diseaseGuideDesc', 'Comprehensive guide to common livestock diseases')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎥</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('knowledge.videoTutorials', 'Video Tutorials')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('knowledge.videoTutorialsDesc', 'Step-by-step video guides for animal care')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('knowledge.expertConsultation', 'Expert Consultation')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {t('knowledge.expertConsultationDesc', 'Get advice from veterinary professionals')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}