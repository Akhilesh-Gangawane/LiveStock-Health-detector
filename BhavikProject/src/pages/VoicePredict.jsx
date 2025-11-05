import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import DiseasePredictionForm from '../components/DiseasePredictionForm';
import PredictionResults from '../components/PredictionResults';
import { db } from '../lib/supabase';

export default function VoicePredict() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showSuccess, showError } = useApp();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Simulate recording for demo
    setTimeout(() => {
      setIsRecording(false);
      setIsAnalyzing(true);
      
      // Simulate analysis
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisResult({
          prediction: 'Respiratory Distress',
          confidence: 87,
          recommendations: [
            'Monitor breathing patterns closely',
            'Check for nasal discharge',
            'Consult veterinarian if symptoms persist',
            'Ensure proper ventilation in housing'
          ],
          severity: 'moderate'
        });
      }, 3000);
    }, 5000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setIsRecording(false);
    setIsAnalyzing(false);
    setShowPredictionForm(false);
    setPredictionResult(null);
  };

  const handlePredictionComplete = (result) => {
    setPredictionResult(result);
    setShowPredictionForm(false);
  };

  const handleSaveToHealth = async () => {
    if (!predictionResult || !user) return;
    
    try {
      const healthRecord = {
        user_id: user.id,
        animal_id: null, // Will be set if animal was selected
        temperature: predictionResult.vital_signs_analysis?.temperature || null,
        symptoms: predictionResult.top_3_predictions?.map(p => p.disease) || [],
        diagnosis: predictionResult.predicted_disease,
        severity: predictionResult.condition_severity,
        recorded_by: 'ai',
        created_at: new Date().toISOString()
      };

      const { error } = await db.healthRecords.create(healthRecord);
      if (error) throw error;

      showSuccess('Prediction saved to health records!');
    } catch (error) {
      console.error('Error saving to health records:', error);
      showError('Failed to save to health records');
    }
  };

  const handleConsultVet = () => {
    // Navigate to vets page or open consultation
    window.open('/vets', '_blank');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t('voice.title', 'Voice Prediction')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('voice.subtitle', 'AI-powered illness detection from animal sounds')}
          </p>
        </div>

        {/* Recording Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
          <div className="text-center">
            {!isRecording && !isAnalyzing && !analysisResult && (
              <>
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🎤</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('voice.readyToRecord', 'Ready to Record')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {t('voice.instructions', 'Hold your device close to the animal and record for 10-30 seconds')}
                </p>
                <button
                  onClick={handleStartRecording}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                >
                  <span>🎤</span>
                  <span>{t('voice.startRecording', 'Start Recording')}</span>
                </button>
              </>
            )}

            {isRecording && (
              <>
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                  <span className="text-4xl">🔴</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('voice.recording', 'Recording...')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {t('voice.recordingInProgress', 'Keep the device steady and close to the animal')}
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={handleStopRecording}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>⏹️</span>
                    <span>{t('voice.stopRecording', 'Stop Recording')}</span>
                  </button>
                </div>
              </>
            )}

            {isAnalyzing && (
              <>
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('voice.analyzing', 'Analyzing...')}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  {t('voice.analysisInProgress', 'AI is analyzing the audio for health indicators')}
                </p>
              </>
            )}

            {analysisResult && (
              <>
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">✅</span>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  {t('voice.analysisComplete', 'Analysis Complete')}
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPredictionForm(true)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    {t('voice.predictDisease', 'Predict Disease')}
                  </button>
                  <button
                    onClick={handleReset}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    {t('voice.recordAnother', 'Record Another')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Disease Prediction Form */}
        {showPredictionForm && (
          <DiseasePredictionForm
            onPredictionComplete={handlePredictionComplete}
          />
        )}

        {/* Prediction Results */}
        {predictionResult && (
          <PredictionResults
            prediction={predictionResult}
            onSaveToHealth={handleSaveToHealth}
            onConsultVet={handleConsultVet}
            onClose={() => setPredictionResult(null)}
          />
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t('voice.results', 'Analysis Results')}
            </h3>

            <div className="space-y-6">
              {/* Prediction */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    {t('voice.prediction', 'Prediction')}
                  </h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {analysisResult.prediction}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('voice.confidence', 'Confidence')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {analysisResult.confidence}%
                  </p>
                </div>
              </div>

              {/* Severity */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t('voice.severity', 'Severity Level')}
                </h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(analysisResult.severity)}`}>
                  {analysisResult.severity.charAt(0).toUpperCase() + analysisResult.severity.slice(1)}
                </span>
              </div>

              {/* Recommendations */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {t('voice.recommendations', 'Recommendations')}
                </h4>
                <div className="space-y-2">
                  {analysisResult.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                      <p className="text-gray-700 dark:text-gray-300">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  {t('voice.saveRecord', 'Save to Health Records')}
                </button>
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  {t('voice.consultVet', 'Consult Veterinarian')}
                </button>
                <button className="flex-1 btn-secondary">
                  {t('voice.shareResults', 'Share Results')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
            {t('voice.howItWorks', 'How It Works')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🎤</span>
              </div>
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {t('voice.step1', 'Record Audio')}
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                {t('voice.step1Desc', 'Capture animal sounds for 10-30 seconds')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">🤖</span>
              </div>
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {t('voice.step2', 'AI Analysis')}
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                {t('voice.step2Desc', 'Advanced algorithms analyze sound patterns')}
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl">📊</span>
              </div>
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                {t('voice.step3', 'Get Results')}
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                {t('voice.step3Desc', 'Receive predictions and recommendations')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}