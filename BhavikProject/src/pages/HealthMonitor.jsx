import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { db } from '../lib/supabase';
import DiseasePredictionForm from '../components/DiseasePredictionForm';
import PredictionResults from '../components/PredictionResults';
import LoadingSpinner from '../components/LoadingSpinner';

export default function HealthMonitor() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showSuccess, showError } = useApp();
  const [selectedAnimal, setSelectedAnimal] = useState('');
  const [animals, setAnimals] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('predict');
  const [predictionResult, setPredictionResult] = useState(null);
  const [healthData, setHealthData] = useState({
    temperature: '',
    heartRate: '',
    respiratoryRate: '',
    symptoms: [],
    notes: ''
  });

  const commonSymptoms = [
    { id: 'fever', label: t('health.fever', 'Fever'), icon: '🌡️' },
    { id: 'cough', label: t('health.cough', 'Cough'), icon: '😷' },
    { id: 'lethargy', label: t('health.lethargy', 'Lethargy'), icon: '😴' },
    { id: 'loss_appetite', label: t('health.lossAppetite', 'Loss of Appetite'), icon: '🍽️' },
    { id: 'diarrhea', label: t('health.diarrhea', 'Diarrhea'), icon: '💧' },
    { id: 'lameness', label: t('health.lameness', 'Lameness'), icon: '🦵' },
    { id: 'discharge', label: t('health.discharge', 'Nasal/Eye Discharge'), icon: '👁️' },
    { id: 'breathing', label: t('health.breathingDifficulty', 'Breathing Difficulty'), icon: '🫁' }
  ];

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load animals
      const { data: animalsData, error: animalsError } = await db.animals.getAll(user.id);
      if (animalsError) throw animalsError;
      setAnimals(animalsData || []);

      // Load health records
      const { data: recordsData, error: recordsError } = await db.healthRecords.getAll(user.id);
      if (recordsError) throw recordsError;
      setHealthRecords(recordsData || []);

      // Load prediction history
      const { data: predictionsData, error: predictionsError } = await db.voicePredictions?.getAll?.(user.id);
      if (!predictionsError && predictionsData) {
        setPredictionHistory(predictionsData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      showError('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionComplete = (result) => {
    setPredictionResult(result);
    loadData(); // Refresh data
  };

  const handleSaveToHealth = async () => {
    if (!predictionResult || !user) return;

    try {
      const selectedAnimalData = animals.find(a => a.id === selectedAnimal);

      const healthRecord = {
        user_id: user.id,
        animal_id: selectedAnimalData?.id || null,
        temperature: predictionResult.vital_signs_analysis?.fever_severity || null,
        symptoms: predictionResult.top_3_predictions?.map(p => p.disease) || [],
        diagnosis: predictionResult.predicted_disease,
        severity: predictionResult.condition_severity,
        recorded_by: 'ai',
        created_at: new Date().toISOString()
      };

      const { error } = await db.healthRecords.create(healthRecord);
      if (error) throw error;

      showSuccess('Prediction saved to health records!');
      loadData(); // Refresh data
      setPredictionResult(null);
    } catch (error) {
      console.error('Error saving to health records:', error);
      showError('Failed to save to health records');
    }
  };

  const handleConsultVet = () => {
    window.open('/vets', '_blank');
  };

  const handleSymptomToggle = (symptomId) => {
    setHealthData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId]
    }));
  };

  const handleInputChange = (e) => {
    setHealthData({
      ...healthData,
      [e.target.name]: e.target.value
    });
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAnimal) {
      showError('Please select an animal');
      return;
    }

    try {
      const selectedAnimalData = animals.find(a => a.id === selectedAnimal);

      const healthRecord = {
        user_id: user.id,
        animal_id: selectedAnimal,
        temperature: parseFloat(healthData.temperature) || null,
        heart_rate: parseInt(healthData.heartRate) || null,
        respiratory_rate: parseInt(healthData.respiratoryRate) || null,
        symptoms: healthData.symptoms,
        vet_notes: healthData.notes,
        recorded_by: 'owner',
        created_at: new Date().toISOString()
      };

      const { error } = await db.healthRecords.create(healthRecord);
      if (error) throw error;

      showSuccess('Health record saved successfully!');

      // Reset form
      setHealthData({
        temperature: '',
        heartRate: '',
        respiratoryRate: '',
        symptoms: [],
        notes: ''
      });
      setSelectedAnimal('');

      loadData(); // Refresh data
    } catch (error) {
      console.error('Error saving health record:', error);
      showError('Failed to save health record');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('health.title', 'Health Monitor')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('health.subtitle', 'AI-powered disease prediction and health tracking')}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'predict', label: t('health.diseasePredictor', 'Disease Predictor'), icon: '🔬' },
                { id: 'manual', label: t('health.manualRecord', 'Manual Record'), icon: '📝' },
                { id: 'records', label: t('health.healthRecords', 'Health Records'), icon: '📋' },
                { id: 'history', label: t('health.predictionHistory', 'AI Predictions'), icon: '🤖' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'predict' && (
          <div className="space-y-6">
            <DiseasePredictionForm
              selectedAnimal={animals.find(a => a.id === selectedAnimal)}
              onPredictionComplete={handlePredictionComplete}
            />

            {predictionResult && (
              <PredictionResults
                prediction={predictionResult}
                onSaveToHealth={handleSaveToHealth}
                onConsultVet={handleConsultVet}
                onClose={() => setPredictionResult(null)}
              />
            )}
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('health.newRecord', 'New Health Record')}
            </h2>

            <form onSubmit={handleManualSubmit} className="space-y-6">
              {/* Animal Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('health.selectAnimal', 'Select Animal')} *
                </label>
                <select
                  value={selectedAnimal}
                  onChange={(e) => setSelectedAnimal(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">{t('health.chooseAnimal', 'Choose an animal...')}</option>
                  {animals.map(animal => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} ({animal.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vital Signs */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('health.vitalSigns', 'Vital Signs')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('health.temperature', 'Temperature')} (°C)
                    </label>
                    <input
                      type="number"
                      name="temperature"
                      value={healthData.temperature}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="38.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('health.heartRate', 'Heart Rate')} (bpm)
                    </label>
                    <input
                      type="number"
                      name="heartRate"
                      value={healthData.heartRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('health.respiratoryRate', 'Respiratory Rate')} (rpm)
                    </label>
                    <input
                      type="number"
                      name="respiratoryRate"
                      value={healthData.respiratoryRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="20"
                    />
                  </div>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('health.symptoms', 'Symptoms')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {commonSymptoms.map((symptom) => (
                    <button
                      key={symptom.id}
                      type="button"
                      onClick={() => handleSymptomToggle(symptom.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${healthData.symptoms.includes(symptom.id)
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                    >
                      <div className="text-lg mb-1">{symptom.icon}</div>
                      <div>{symptom.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('health.notes', 'Additional Notes')}
                </label>
                <textarea
                  name="notes"
                  value={healthData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder={t('health.notesPlaceholder', 'Enter any additional observations or notes...')}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setHealthData({
                      temperature: '',
                      heartRate: '',
                      respiratoryRate: '',
                      symptoms: [],
                      notes: ''
                    });
                    setSelectedAnimal('');
                  }}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  {t('health.saveRecord', 'Save Health Record')}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('health.healthRecords', 'Health Records')}
            </h2>

            {healthRecords.length > 0 ? (
              <div className="space-y-4">
                {healthRecords.map((record) => (
                  <div key={record.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {record.animals?.name || 'Unknown Animal'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(record.created_at)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${record.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                        record.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                        {record.severity || 'Normal'}
                      </span>
                    </div>

                    {record.temperature && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Temperature: {record.temperature}°C
                      </p>
                    )}

                    {record.diagnosis && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Diagnosis: {record.diagnosis}
                      </p>
                    )}

                    {record.vet_notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Notes: {record.vet_notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('health.noRecords', 'No health records yet')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {t('health.addFirst', 'Add your first health record to track animal wellness')}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('health.predictionHistory', 'AI Prediction History')}
            </h2>

            {predictionHistory.length > 0 ? (
              <div className="space-y-4">
                {predictionHistory.map((prediction) => (
                  <div key={prediction.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {prediction.animals?.name || 'Unknown Animal'}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(prediction.created_at)}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full text-xs font-medium">
                        AI Prediction
                      </span>
                    </div>

                    {prediction.prediction_result && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          Predicted: {prediction.prediction_result.predicted_disease}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Confidence: {Math.round((prediction.confidence_score || 0) * 100)}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Severity: {prediction.severity_level}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('health.noPredictions', 'No AI predictions yet')}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  {t('health.usePrediction', 'Use the Disease Predictor to get AI-powered health insights')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}