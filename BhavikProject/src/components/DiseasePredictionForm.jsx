import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { mlApi } from '../services/mlApi'
import { db } from '../lib/supabase'
import LoadingSpinner from './LoadingSpinner'

export default function DiseasePredictionForm({ selectedAnimal, onPredictionComplete }) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { showSuccess, showError } = useApp()
  
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(false)
  const [predicting, setPredicting] = useState(false)
  const [formData, setFormData] = useState({
    animalId: selectedAnimal?.id || '',
    animalType: selectedAnimal?.type || '',
    breed: selectedAnimal?.breed || '',
    age: selectedAnimal?.age_months ? (selectedAnimal.age_months / 12).toString() : '3',
    gender: selectedAnimal?.gender || '',
    weight: selectedAnimal?.weight_kg?.toString() || '',
    bodyTemperature: '38.5',
    heartRate: '80',
    duration: '3',
    symptom1: 'none',
    symptom2: 'none',
    symptom3: 'none',
    symptom4: 'none',
    appetiteLoss: 'no',
    vomiting: 'no',
    diarrhea: 'no',
    coughing: 'no',
    laboredBreathing: 'no',
    lameness: 'no',
    skinLesions: 'no',
    nasalDischarge: 'no',
    eyeDischarge: 'no'
  })

  useEffect(() => {
    loadAnimals()
  }, [user])

  useEffect(() => {
    if (selectedAnimal) {
      setFormData(prev => ({
        ...prev,
        animalId: selectedAnimal.id,
        animalType: selectedAnimal.type,
        breed: selectedAnimal.breed || '',
        age: selectedAnimal.age_months ? (selectedAnimal.age_months / 12).toString() : '3',
        gender: selectedAnimal.gender || '',
        weight: selectedAnimal.weight_kg?.toString() || ''
      }))
    }
  }, [selectedAnimal])

  const loadAnimals = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await db.animals.getAll(user.id)
      if (error) throw error
      setAnimals(data || [])
    } catch (error) {
      console.error('Error loading animals:', error)
      showError('Failed to load animals')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-fill animal data when animal is selected
    if (name === 'animalId' && value) {
      const animal = animals.find(a => a.id === value)
      if (animal) {
        setFormData(prev => ({
          ...prev,
          animalType: animal.type,
          breed: animal.breed || '',
          age: animal.age_months ? (animal.age_months / 12).toString() : '3',
          gender: animal.gender || '',
          weight: animal.weight_kg?.toString() || ''
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.animalType) {
      showError('Please select an animal or specify animal type')
      return
    }

    setPredicting(true)
    
    try {
      // Format data for ML API
      const predictionData = mlApi.formatPredictionData(formData)
      
      // Make prediction
      const result = await mlApi.predictDisease(predictionData)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Save prediction to database
      if (formData.animalId) {
        await mlApi.savePredictionResult(
          user.id,
          formData.animalId,
          result.data,
          formData
        )
      }

      showSuccess('Disease prediction completed successfully!')
      
      // Call parent callback with results
      if (onPredictionComplete) {
        onPredictionComplete(result.data)
      }

    } catch (error) {
      console.error('Prediction error:', error)
      showError(error.message || 'Failed to predict disease')
    } finally {
      setPredicting(false)
    }
  }

  const symptoms = [
    'none', 'coughing', 'fever', 'lethargy', 'weakness', 'nasal discharge',
    'difficulty breathing', 'loss of appetite', 'vomiting', 'diarrhea',
    'lameness', 'swelling', 'skin lesions', 'eye discharge', 'excessive drooling'
  ]

  const animalTypes = ['Dog', 'Cat', 'Cow', 'Horse', 'Buffalo', 'Goat', 'Sheep', 'Chicken', 'Pig']

  if (loading) return <LoadingSpinner />

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('prediction.diseasePredictor', 'Disease Predictor')}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Animal Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('animals.selectAnimal', 'Select Animal')}
            </label>
            <select
              name="animalId"
              value={formData.animalId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('animals.selectAnimal', 'Select Animal')}</option>
              {animals.map(animal => (
                <option key={animal.id} value={animal.id}>
                  {animal.name} ({animal.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('animals.type', 'Animal Type')} *
            </label>
            <select
              name="animalType"
              value={formData.animalType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('animals.selectType', 'Select Type')}</option>
              {animalTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('animals.breed', 'Breed')}
            </label>
            <input
              type="text"
              name="breed"
              value={formData.breed}
              onChange={handleInputChange}
              placeholder="Mixed"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('animals.age', 'Age (years)')} *
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="0.5"
              max="20"
              step="0.5"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('animals.gender', 'Gender')} *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">{t('animals.selectGender', 'Select Gender')}</option>
              <option value="Male">{t('animals.male', 'Male')}</option>
              <option value="Female">{t('animals.female', 'Female')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('animals.weight', 'Weight (kg)')} *
            </label>
            <input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              min="1"
              max="1000"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Vital Signs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('health.temperature', 'Body Temperature (°C)')} *
            </label>
            <input
              type="number"
              name="bodyTemperature"
              value={formData.bodyTemperature}
              onChange={handleInputChange}
              min="35"
              max="45"
              step="0.1"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('health.heartRate', 'Heart Rate (bpm)')} *
            </label>
            <input
              type="number"
              name="heartRate"
              value={formData.heartRate}
              onChange={handleInputChange}
              min="20"
              max="300"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('health.duration', 'Symptom Duration (days)')} *
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              max="90"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('health.symptoms', 'Symptoms')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(num => (
              <div key={num}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('health.symptom', 'Symptom')} {num}
                </label>
                <select
                  name={`symptom${num}`}
                  value={formData[`symptom${num}`]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  {symptoms.map(symptom => (
                    <option key={symptom} value={symptom}>
                      {symptom.charAt(0).toUpperCase() + symptom.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Yes/No Symptoms */}
        <div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {t('health.specificSymptoms', 'Specific Symptoms')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              'appetiteLoss', 'vomiting', 'diarrhea', 'coughing', 'laboredBreathing',
              'lameness', 'skinLesions', 'nasalDischarge', 'eyeDischarge'
            ].map(symptom => (
              <div key={symptom}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t(`health.${symptom}`, symptom.charAt(0).toUpperCase() + symptom.slice(1).replace(/([A-Z])/g, ' $1'))}
                </label>
                <select
                  name={symptom}
                  value={formData[symptom]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="no">{t('common.no', 'No')}</option>
                  <option value="yes">{t('common.yes', 'Yes')}</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={predicting}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            {predicting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('prediction.predicting', 'Predicting...')}</span>
              </>
            ) : (
              <>
                <span>🔬</span>
                <span>{t('prediction.predictDisease', 'Predict Disease')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}