import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const { theme, language } = useApp();

  const features = [
    {
      title: t('home.animalManagement', 'जनावरांचे व्यवस्थापन'),
      description: t('home.animalManagementDesc', 'आपल्या पशुधनाचा मागोवा घ्या आणि व्यवस्थापन करा'),
      icon: '🐄',
      path: '/animals',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      title: t('home.healthMonitoring', 'आरोग्य निरीक्षण'),
      description: t('home.healthMonitoringDesc', 'जनावरांचे आरोग्य आणि लक्षणे तपासा'),
      icon: '❤️',
      path: '/health',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      title: t('home.voicePrediction', 'आवाज अंदाज'),
      description: t('home.voicePredictionDesc', 'जनावरांच्या आवाजावरून AI-आधारित रोग शोध'),
      icon: '🎤',
      path: '/voice',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      title: t('home.findVets', 'पशुवैद्य शोधा'),
      description: t('home.findVetsDesc', 'स्थानिक पशुवैद्यकीय व्यावसायिकांशी संपर्क साधा'),
      icon: '👨‍⚕️',
      path: '/vets',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
    }
  ];

  const stats = [
    {
      number: '10,000+',
      label: t('home.happyFarmers', 'समाधानी शेतकरी'),
      icon: '👨‍🌾'
    },
    {
      number: '50,000+',
      label: t('home.animalsMonitored', 'निरीक्षण केलेली जनावरे'),
      icon: '🐄'
    },
    {
      number: '95%',
      label: t('home.accuracyRate', 'अचूकता दर'),
      icon: '🎯'
    },
    {
      number: '24/7',
      label: t('home.support', 'सहाय्य उपलब्ध'),
      icon: '🕐'
    }
  ];

  const testimonials = [
    {
      name: 'राजेश पाटील',
      location: 'पुणे, महाराष्ट्र',
      text: t('testimonial1', 'या अॅपमुळे माझ्या गायींचे आरोग्य चांगले राहते. खूप उपयुक्त आहे!'),
      rating: 5,
      avatar: '👨‍🌾'
    },
    {
      name: 'सुनिता शर्मा',
      location: 'नाशिक, महाराष्ट्र',
      text: t('testimonial2', 'आवाज ओळखण्याचे तंत्रज्ञान खरोखर आश्चर्यकारक आहे. लवकर रोग ओळखता येतो.'),
      rating: 5,
      avatar: '👩‍🌾'
    },
    {
      name: 'अमित कुमार',
      location: 'मुंबई, महाराष्ट्र',
      text: t('testimonial3', 'पशुवैद्यांशी संपर्क साधणे आता खूप सोपे झाले आहे. धन्यवाद!'),
      rating: 5,
      avatar: '👨‍🌾'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-blue-600/10 dark:from-green-400/5 dark:to-blue-400/5" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-24">
          <div className="text-center">
            <div className="mb-8 animate-bounce">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <span className="text-4xl">🐄</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                {t('app.title', 'पशुधन आरोग्य मॉनिटर')}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
              {t('app.subtitle', 'स्मार्ट पशुधन आरोग्य निरीक्षण आणि रोग शोध प्लॅटफॉर्म')}
            </p>
            
            {isAuthenticated && (
              <div className="mb-8 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl inline-block shadow-lg border border-green-200 dark:border-green-800">
                <p className="text-green-700 dark:text-green-300 text-lg font-medium">
                  {t('home.welcome', 'परत स्वागत')}, {user?.name}! 👋
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {t('home.welcomeMessage', 'आपल्या पशुधनाचे आरोग्य व्यवस्थापन सुरू करा')}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register"
                    className="group px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                  >
                    <span>{t('home.getStarted', 'आज सुरुवात करा')}</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  <Link
                    to="/login"
                    className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 transform hover:scale-105"
                  >
                    {t('auth.login', 'लॉगिन')}
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>{t('home.goToDashboard', 'डॅशबोर्डवर जा')}</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.features', 'मुख्य वैशिष्ट्ये')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t('home.featuresDesc', 'आधुनिक तंत्रज्ञानाचा वापर करून आपल्या पशुधनाचे संपूर्ण आरोग्य व्यवस्थापन')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Link
                key={index}
                to={feature.path}
                className={`group p-8 ${feature.bgColor} rounded-2xl border-2 ${feature.borderColor} hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2`}
              >
                <div className="text-center">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    <span className="mr-2">{t('common.learnMore', 'अधिक जाणा')}</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('home.testimonials', 'शेतकऱ्यांचे अनुभव')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {t('home.testimonialsDesc', 'आमच्या प्लॅटफॉर्मचा वापर करणाऱ्या शेतकऱ्यांचे मत')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-4">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl p-12 shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {t('home.readyToStart', 'आपल्या पशुधनाचे आरोग्य व्यवस्थापन सुधारण्यासाठी तयार आहात?')}
              </h2>
              <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
                {t('home.joinFarmers', 'हजारो शेतकऱ्यांमध्ये सामील व्हा जे आमच्या प्लॅटफॉर्मवर विश्वास ठेवतात')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {t('home.startFree', 'मोफत सुरुवात करा')}
                </Link>
                <Link
                  to="/knowledge"
                  className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
                >
                  {t('home.learnMore', 'अधिक जाणून घ्या')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer Note */}
      <section className="py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {t('home.trustedBy', 'विश्वसनीय')} <span className="font-bold text-green-600 dark:text-green-400">10,000+</span> {t('home.farmers', 'शेतकऱ्यांकडून महाराष्ट्रभर')}
        </p>
      </section>
    </div>
  );
}