// ML API Service for Disease Prediction
import { supabase } from '../lib/supabase'

const ML_API_BASE_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000'

class MLApiService {
  constructor() {
    this.baseUrl = ML_API_BASE_URL
  }

  // Predict disease based on symptoms and animal data
  async predictDisease(predictionData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, data: result }
    } catch (error) {
      console.error('ML API Error:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to connect to ML service'
      }
    }
  }

  // Save prediction result to database
  async savePredictionResult(userId, animalId, predictionResult, inputData) {
    try {
      const predictionRecord = {
        user_id: userId,
        animal_id: animalId,
        prediction_result: predictionResult,
        input_data: inputData,
        confidence_score: predictionResult.confidence,
        severity_level: predictionResult.condition_severity,
        recommendations: predictionResult.top_3_predictions?.map(p => p.disease) || [],
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('voice_predictions')
        .insert([predictionRecord])
        .select()

      if (error) throw error

      return { success: true, data: data[0] }
    } catch (error) {
      console.error('Error saving prediction:', error)
      return { success: false, error: error.message }
    }
  }

  // Get prediction history for user
  async getPredictionHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('voice_predictions')
        .select(`
          *,
          animals (
            id,
            name,
            type,
            breed
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching prediction history:', error)
      return { success: false, error: error.message }
    }
  }

  // Format data for ML API
  formatPredictionData(formData) {
    return {
      animal_type: formData.animalType,
      breed: formData.breed || 'Mixed',
      age: parseFloat(formData.age) || 3,
      gender: formData.gender || 'Male',
      weight: parseFloat(formData.weight) || 50,
      symptom1: formData.symptom1 || 'none',
      symptom2: formData.symptom2 || 'none',
      symptom3: formData.symptom3 || 'none',
      symptom4: formData.symptom4 || 'none',
      duration: parseInt(formData.duration) || 3,
      appetite_loss: formData.appetiteLoss || 'no',
      vomiting: formData.vomiting || 'no',
      diarrhea: formData.diarrhea || 'no',
      coughing: formData.coughing || 'no',
      labored_breathing: formData.laboredBreathing || 'no',
      lameness: formData.lameness || 'no',
      skin_lesions: formData.skinLesions || 'no',
      nasal_discharge: formData.nasalDischarge || 'no',
      eye_discharge: formData.eyeDischarge || 'no',
      body_temperature: parseFloat(formData.bodyTemperature) || 38.5,
      heart_rate: parseFloat(formData.heartRate) || 80
    }
  }

  // Check if ML service is available
  async checkServiceHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000
      })
      return response.ok
    } catch (error) {
      console.error('ML service health check failed:', error)
      return false
    }
  }
}

export const mlApi = new MLApiService()
export default mlApi