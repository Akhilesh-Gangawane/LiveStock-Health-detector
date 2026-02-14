import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Vets() {
  const { t } = useTranslation();

  const veterinarians = [
    {
      id: 1,
      name: 'Dr. Rajesh Sharma',
      specialization: 'Large Animal Medicine',
      rating: 4.8,
      experience: '15 years',
      location: 'Mumbai, Maharashtra',
      phone: '+91 98765 43210',
      consultationFee: '₹500',
      available: true,
      image: '👨‍⚕️'
    },
    {
      id: 2,
      name: 'Dr. Priya Patel',
      specialization: 'Dairy Cattle Health',
      rating: 4.9,
      experience: '12 years',
      location: 'Pune, Maharashtra',
      phone: '+91 98765 43211',
      consultationFee: '₹600',
      available: true,
      image: '👩‍⚕️'
    },
    {
      id: 3,
      name: 'Dr. Amit Kumar',
      specialization: 'Poultry & Small Animals',
      rating: 4.7,
      experience: '10 years',
      location: 'Nashik, Maharashtra',
      phone: '+91 98765 43212',
      consultationFee: '₹400',
      available: false,
      image: '👨‍⚕️'
    }
  ];

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">⭐</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">⭐</span>);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('vets.title', 'Veterinarians')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('vets.subtitle', 'Find and connect with qualified veterinary professionals')}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('vets.searchLocation', 'Search by Location')}
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={t('vets.enterLocation', 'Enter city or area...')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('vets.specialization', 'Specialization')}
              </label>
              <select className="input-field">
                <option value="">{t('vets.allSpecializations', 'All Specializations')}</option>
                <option value="large-animal">Large Animal Medicine</option>
                <option value="dairy">Dairy Cattle Health</option>
                <option value="poultry">Poultry & Small Animals</option>
                <option value="surgery">Veterinary Surgery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('vets.availability', 'Availability')}
              </label>
              <select className="input-field">
                <option value="">{t('vets.allVets', 'All Veterinarians')}</option>
                <option value="available">{t('vets.availableNow', 'Available Now')}</option>
                <option value="today">{t('vets.availableToday', 'Available Today')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Veterinarians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {veterinarians.map((vet) => (
            <div key={vet.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-2xl">
                    {vet.image}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {vet.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {vet.specialization}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  vet.available 
                    ? 'text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-300' 
                    : 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300'
                }`}>
                  {vet.available ? t('vets.available', 'Available') : t('vets.busy', 'Busy')}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {renderStars(vet.rating)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {vet.rating} ({vet.experience})
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>📍</span>
                  <span>{vet.location}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>📞</span>
                  <span>{vet.phone}</span>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>💰</span>
                  <span>{t('vets.consultationFee', 'Consultation')}: {vet.consultationFee}</span>
                </div>
              </div>

              <div className="flex space-x-2">
                <button 
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    vet.available
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!vet.available}
                >
                  {t('vets.bookAppointment', 'Book Appointment')}
                </button>
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  📞
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center">
              <span className="text-2xl">🚨</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">
                {t('vets.emergency', 'Emergency Veterinary Services')}
              </h3>
              <p className="text-red-700 dark:text-red-300">
                {t('vets.emergencyDesc', 'For urgent animal health emergencies, contact our 24/7 helpline')}
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center space-x-2">
              <span>📞</span>
              <span>{t('vets.callEmergency', 'Call Emergency: +91 1800-VET-HELP')}</span>
            </button>
            <button className="border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 font-medium py-2 px-6 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              {t('vets.findNearest', 'Find Nearest Emergency Clinic')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}