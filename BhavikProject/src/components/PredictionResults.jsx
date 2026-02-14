import React from 'react'
import { useTranslation } from 'react-i18next'

export default function PredictionResults({ prediction, onSaveToHealth, onConsultVet, onClose }) {
  const { t } = useTranslation()

  if (!prediction) return null

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'acute':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
      case 'chronic':
        return 'text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800'
      case 'subacute':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800'
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getVitalSignStatus = (status) => {
    switch (status?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'low':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
      case 'normal':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('prediction.results', 'Prediction Results')}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Main Prediction */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('prediction.mostLikelyDisease', 'Most Likely Disease')}
              </h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {prediction.predicted_disease || prediction.prediction}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('prediction.confidence', 'Confidence')}
              </p>
              <p className={`text-2xl font-bold ${getConfidenceColor(prediction.confidence)}`}>
                {Math.round((prediction.confidence || 0) * 100)}%
              </p>
            </div>
          </div>

          {/* Animal Info */}
          {prediction.animal_type && (
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>🐄 {prediction.animal_type}</span>
              {prediction.condition_severity && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(prediction.condition_severity)}`}>
                  {prediction.condition_severity}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Top 3 Predictions */}
        {prediction.top_3_predictions && prediction.top_3_predictions.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('prediction.topPredictions', 'Top 3 Possible Diseases')}
            </h4>
            <div className="space-y-3">
              {prediction.top_3_predictions.map((pred, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {pred.disease}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {Math.round((pred.probability || 0) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vital Signs Analysis */}
        {prediction.vital_signs_analysis && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('prediction.vitalSigns', 'Vital Signs Analysis')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('health.temperature', 'Temperature')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVitalSignStatus(prediction.vital_signs_analysis.temperature_status)}`}>
                    {prediction.vital_signs_analysis.temperature_status}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {t('health.heartRate', 'Heart Rate')}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVitalSignStatus(prediction.vital_signs_analysis.heart_rate_status)}`}>
                    {prediction.vital_signs_analysis.heart_rate_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Syndrome Analysis */}
        {prediction.syndrome_analysis && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('prediction.syndromeAnalysis', 'Syndrome Analysis')}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {prediction.syndrome_analysis.respiratory_score || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('prediction.respiratory', 'Respiratory')}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {prediction.syndrome_analysis.gi_score || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('prediction.gastrointestinal', 'GI')}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {prediction.syndrome_analysis.systemic_score || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('prediction.systemic', 'Systemic')}
                </p>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {prediction.syndrome_analysis.neurological_score || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {t('prediction.neurological', 'Neuro')}
                </p>
              </div>
            </div>
            {prediction.syndrome_analysis.multi_system && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  ⚠️ {t('prediction.multiSystemDisease', 'Multi-system disease detected - requires immediate attention')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {prediction.recommendations && prediction.recommendations.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('prediction.recommendations', 'Recommendations')}
            </h4>
            <div className="space-y-2">
              {prediction.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onSaveToHealth && (
            <button
              onClick={onSaveToHealth}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>💾</span>
              <span>{t('prediction.saveToHealth', 'Save to Health Records')}</span>
            </button>
          )}
          
          {onConsultVet && (
            <button
              onClick={onConsultVet}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <span>👨‍⚕️</span>
              <span>{t('prediction.consultVet', 'Consult Veterinarian')}</span>
            </button>
          )}
          
          <button
            onClick={() => window.print()}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <span>🖨️</span>
            <span>{t('prediction.printResults', 'Print Results')}</span>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <span className="font-medium">⚠️ {t('prediction.disclaimer', 'Disclaimer')}:</span>{' '}
            {t('prediction.disclaimerText', 'This prediction is for informational purposes only and should not replace professional veterinary diagnosis. Please consult a qualified veterinarian for proper medical advice.')}
          </p>
        </div>
      </div>
    </div>
  )
}