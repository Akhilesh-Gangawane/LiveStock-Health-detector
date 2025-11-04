import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useAnimals } from '../hooks/useDatabase';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Animals() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { animals, loading, addAnimal, updateAnimal, deleteAnimal } = useAnimals();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'cattle',
    breed: '',
    age: '',
    weight: '',
    tagNumber: '',
    healthStatus: 'healthy'
  });

  const animalTypes = [
    { value: 'cattle', label: t('animals.cattle', 'Cattle'), icon: '🐄' },
    { value: 'goat', label: t('animals.goat', 'Goat'), icon: '🐐' },
    { value: 'sheep', label: t('animals.sheep', 'Sheep'), icon: '🐑' },
    { value: 'pig', label: t('animals.pig', 'Pig'), icon: '🐷' },
    { value: 'chicken', label: t('animals.chicken', 'Chicken'), icon: '🐔' }
  ];

  const healthStatuses = [
    { value: 'healthy', label: t('animals.healthy', 'Healthy'), color: 'text-green-600 bg-green-50' },
    { value: 'sick', label: t('animals.sick', 'Sick'), color: 'text-red-600 bg-red-50' },
    { value: 'recovering', label: t('animals.recovering', 'Recovering'), color: 'text-yellow-600 bg-yellow-50' },
    { value: 'critical', label: t('animals.critical', 'Critical'), color: 'text-red-800 bg-red-100' }
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const animalData = {
      name: formData.name,
      type: formData.type,
      breed: formData.breed,
      age_months: parseInt(formData.age) || null,
      weight_kg: parseFloat(formData.weight) || null,
      tag_number: formData.tagNumber,
      health_status: formData.healthStatus
    };

    const result = await addAnimal(animalData);
    
    if (result.success) {
      setFormData({
        name: '',
        type: 'cattle',
        breed: '',
        age: '',
        weight: '',
        tagNumber: '',
        healthStatus: 'healthy'
      });
      setShowAddForm(false);
    }
  };

  const getStatusColor = (status) => {
    const statusObj = healthStatuses.find(s => s.value === status);
    return statusObj ? statusObj.color : 'text-gray-600 bg-gray-50';
  };

  const getAnimalIcon = (type) => {
    const animalType = animalTypes.find(t => t.value === type);
    return animalType ? animalType.icon : '🐄';
  };



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Please log in to manage your animals
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be logged in to access this feature.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('animals.title', 'Animals')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('animals.subtitle', 'Manage your livestock inventory')}
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 sm:mt-0 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>➕</span>
            <span>{t('animals.addAnimal', 'Add Animal')}</span>
          </button>
        </div>

        {/* Add Animal Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('animals.addAnimal', 'Add Animal')}
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('animals.name', 'Name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                  placeholder="Enter animal name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('animals.type', 'Type')}
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  {animalTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('animals.breed', 'Breed')}
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Enter breed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('animals.age', 'Age (months)')}
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Age in months"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('animals.weight', 'Weight (kg)')}
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Weight in kg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('animals.tagNumber', 'Tag Number')}
                </label>
                <input
                  type="text"
                  name="tagNumber"
                  value={formData.tagNumber}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Unique tag number"
                />
              </div>

              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {t('common.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Animals Grid */}
        {animals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {animals.map((animal) => (
              <div key={animal.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">
                      {getAnimalIcon(animal.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {animal.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {animal.type} {animal.breed && `• ${animal.breed}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(animal.health_status)}`}>
                    {healthStatuses.find(s => s.value === animal.health_status)?.label}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  {animal.age_months && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('animals.age', 'Age')}:</span>
                      <span className="text-gray-900 dark:text-white">{animal.age_months} months</span>
                    </div>
                  )}
                  {animal.weight_kg && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('animals.weight', 'Weight')}:</span>
                      <span className="text-gray-900 dark:text-white">{animal.weight_kg} kg</span>
                    </div>
                  )}
                  {animal.tag_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">{t('animals.tagNumber', 'Tag')}:</span>
                      <span className="text-gray-900 dark:text-white">{animal.tag_number}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
                  <button className="flex-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    {t('common.view', 'View')}
                  </button>
                  <button className="flex-1 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">
                    {t('common.edit', 'Edit')}
                  </button>
                  <button className="flex-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                    {t('common.delete', 'Delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🐄</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {t('animals.noAnimals', 'No animals added yet')}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              {t('animals.addFirst', 'Add your first animal to get started')}
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              {t('animals.addAnimal', 'Add Animal')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}