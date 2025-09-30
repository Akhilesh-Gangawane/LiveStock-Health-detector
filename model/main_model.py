import pickle
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# ⚠️ IMPORTANT: Define the EXACT class that was saved in the pickle file
class AnimalSpecificDiseasePredictor:
    def __init__(self):
        self.animal_models = {}
        self.animal_scalers = {}
        self.animal_encoders = {}
        self.feature_columns = []
        self.label_encoders = {}
        
    def fit(self, df):
        # Training method (not needed when loading)
        pass
    
    def _predict_for_animal(self, X_scaled, animal_type):
        """Make predictions for a specific animal type"""
        if animal_type not in self.animal_models:
            return np.array([0] * len(X_scaled))
        
        model_info = self.animal_models[animal_type]
        
        if model_info['type'] == 'single_disease':
            return np.array([0] * len(X_scaled))
        
        # Ensemble prediction
        models = model_info['models']
        all_predictions = []
        
        for model in models.values():
            pred = model.predict(X_scaled)
            all_predictions.append(pred)
        
        # Majority voting
        final_predictions = []
        for i in range(len(X_scaled)):
            votes = [pred[i] for pred in all_predictions]
            majority_vote = Counter(votes).most_common(1)[0][0]
            final_predictions.append(majority_vote)
        
        return np.array(final_predictions)
    
    def predict_disease(self, animal_type, breed, age, gender, weight,
                       symptom1, symptom2, symptom3, symptom4, duration,
                       appetite_loss, vomiting, diarrhea, coughing, labored_breathing,
                       lameness, skin_lesions, nasal_discharge, eye_discharge,
                       body_temperature, heart_rate):
        """Predict the most likely disease for a specific animal with given symptoms"""
        
        # Check if we have a model for this animal type
        if animal_type not in self.animal_models:
            available_animals = list(self.animal_models.keys())
            return {
                'prediction': 'Unknown - Animal type not in training data',
                'confidence': 0.0,
                'available_animals': available_animals,
                'message': f'Please use one of: {", ".join(available_animals)}'
            }
        
        # Handle single disease case
        model_info = self.animal_models[animal_type]
        if model_info['type'] == 'single_disease':
            return {
                'predicted_disease': model_info['disease'],
                'confidence': model_info['confidence'],
                'top_3_predictions': [{'disease': model_info['disease'], 'probability': 1.0}],
                'vital_signs_analysis': {'temperature_status': 'Unknown', 'heart_rate_status': 'Unknown', 'fever_severity': 0, 'hr_severity': 0},
                'syndrome_analysis': {'respiratory_score': 0, 'gi_score': 0, 'systemic_score': 0, 'neurological_score': 0, 'multi_system': False},
                'condition_severity': 'Unknown',
                'message': f'Only one disease recorded for {animal_type} in training data'
            }
        
        # Prepare input data
        input_data = {
            'Breed': breed, 'Age': age, 'Gender': gender, 'Weight': weight,
            'Symptom_1': symptom1, 'Symptom_2': symptom2, 'Symptom_3': symptom3, 'Symptom_4': symptom4,
            'Duration': duration, 'Body_Temperature': body_temperature, 'Heart_Rate': heart_rate,
            'Appetite_Loss': 1 if str(appetite_loss).lower() == 'yes' else 0,
            'Vomiting': 1 if str(vomiting).lower() == 'yes' else 0,
            'Diarrhea': 1 if str(diarrhea).lower() == 'yes' else 0,
            'Coughing': 1 if str(coughing).lower() == 'yes' else 0,
            'Labored_Breathing': 1 if str(labored_breathing).lower() == 'yes' else 0,
            'Lameness': 1 if str(lameness).lower() == 'yes' else 0,
            'Skin_Lesions': 1 if str(skin_lesions).lower() == 'yes' else 0,
            'Nasal_Discharge': 1 if str(nasal_discharge).lower() == 'yes' else 0,
            'Eye_Discharge': 1 if str(eye_discharge).lower() == 'yes' else 0
        }
        
        # Species-specific vital sign analysis
        normal_ranges = {
            'Dog': {'temp': (38.0, 39.2), 'hr': (60, 160)},
            'Cat': {'temp': (38.1, 39.2), 'hr': (140, 220)},
            'Horse': {'temp': (37.2, 38.6), 'hr': (28, 44)},
            'Cow': {'temp': (38.0, 39.3), 'hr': (48, 84)},
            'Cattle': {'temp': (38.0, 39.3), 'hr': (48, 84)},
            'Sheep': {'temp': (38.3, 39.9), 'hr': (60, 120)},
            'Goat': {'temp': (38.5, 40.0), 'hr': (70, 135)},
            'Pig': {'temp': (38.7, 39.8), 'hr': (58, 100)},
            'Rabbit': {'temp': (38.5, 40.0), 'hr': (120, 250)}
        }
        
        ranges = normal_ranges.get(animal_type, {'temp': (38.0, 39.5), 'hr': (60, 120)})
        temp_range = ranges['temp']
        hr_range = ranges['hr']
        
        # Temperature analysis
        if body_temperature > temp_range[1]:
            input_data['Temp_Abnormal'] = 1
            input_data['Fever_Severity'] = (body_temperature - temp_range[1]) / 2.0
        elif body_temperature < temp_range[0]:
            input_data['Temp_Abnormal'] = -1
            input_data['Fever_Severity'] = (temp_range[0] - body_temperature) / 2.0
        else:
            input_data['Temp_Abnormal'] = 0
            input_data['Fever_Severity'] = 0
        
        # Heart rate analysis
        if heart_rate > hr_range[1]:
            input_data['HR_Abnormal'] = 1
            input_data['HR_Severity'] = (heart_rate - hr_range[1]) / hr_range[1]
        elif heart_rate < hr_range[0]:
            input_data['HR_Abnormal'] = -1
            input_data['HR_Severity'] = (hr_range[0] - heart_rate) / hr_range[0]
        else:
            input_data['HR_Abnormal'] = 0
            input_data['HR_Severity'] = 0
        
        # Syndrome scores
        input_data['Respiratory_Syndrome'] = (input_data['Coughing'] * 3 + input_data['Labored_Breathing'] * 4 +
                                            input_data['Nasal_Discharge'] * 2 + input_data['Eye_Discharge'] * 1)
        input_data['GI_Syndrome'] = (input_data['Vomiting'] * 4 + input_data['Diarrhea'] * 3 + input_data['Appetite_Loss'] * 2)
        input_data['Systemic_Syndrome'] = (abs(input_data['Temp_Abnormal']) * 3 + input_data['Appetite_Loss'] * 2)
        input_data['Dermatological_Syndrome'] = input_data['Skin_Lesions'] * 3
        input_data['Neurological_Syndrome'] = input_data['Lameness'] * 3
        
        # Duration-based conditions
        input_data['Acute_Condition'] = 1 if duration <= 3 else 0
        input_data['Subacute_Condition'] = 1 if 3 < duration <= 14 else 0
        input_data['Chronic_Condition'] = 1 if duration > 14 else 0
        
        # Multi-system involvement
        system_count = sum([
            input_data['Respiratory_Syndrome'] > 2, input_data['GI_Syndrome'] > 2,
            input_data['Systemic_Syndrome'] > 2, input_data['Neurological_Syndrome'] > 2
        ])
        input_data['Multi_System_Disease'] = 1 if system_count >= 2 else 0
        
        # Age and size factors
        input_data['Young_Animal'] = 1 if age < 2 else 0
        input_data['Senior_Animal'] = 1 if age > 8 else 0
        input_data['Small_Animal'] = 1 if weight < 30 else 0
        input_data['Large_Animal'] = 1 if weight > 200 else 0
        
        # Encode categorical features
        for col in ['Breed', 'Gender', 'Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4']:
            if col in self.label_encoders:
                try:
                    input_data[col] = self.label_encoders[col].transform([str(input_data[col])])[0]
                except:
                    input_data[col] = 0  # Unknown category
        
        # Create DataFrame and scale
        input_df = pd.DataFrame([input_data])[self.feature_columns]
        
        if animal_type in self.animal_scalers:
            input_scaled = self.animal_scalers[animal_type].transform(input_df)
        else:
            return {'predicted_disease': 'Error - No scaler for this animal', 'confidence': 0.0}
        
        # Make prediction
        models = model_info['models']
        all_probs = []
        
        for model in models.values():
            try:
                proba = model.predict_proba(input_scaled)[0]
                all_probs.append(proba)
            except:
                pred = model.predict(input_scaled)[0]
                proba = np.zeros(len(self.animal_encoders[animal_type].classes_))
                proba[pred] = 1.0
                all_probs.append(proba)
        
        # Average probabilities
        avg_proba = np.mean(all_probs, axis=0)
        predicted_class = np.argmax(avg_proba)
        confidence = float(avg_proba[predicted_class])
        
        # Decode prediction
        predicted_disease = self.animal_encoders[animal_type].classes_[predicted_class]
        
        # Get top 3 predictions
        top_indices = np.argsort(avg_proba)[-3:][::-1]
        top_predictions = []
        for idx in top_indices:
            disease = self.animal_encoders[animal_type].classes_[idx]
            prob = float(avg_proba[idx])
            top_predictions.append({'disease': disease, 'probability': prob})
        
        return {
            'animal_type': animal_type,
            'predicted_disease': predicted_disease,
            'confidence': confidence,
            'top_3_predictions': top_predictions,
            'vital_signs_analysis': {
                'temperature_status': 'High' if input_data['Temp_Abnormal'] > 0 else 'Low' if input_data['Temp_Abnormal'] < 0 else 'Normal',
                'heart_rate_status': 'High' if input_data['HR_Abnormal'] > 0 else 'Low' if input_data['HR_Abnormal'] < 0 else 'Normal',
                'fever_severity': input_data['Fever_Severity'],
                'hr_severity': input_data['HR_Severity']
            },
            'syndrome_analysis': {
                'respiratory_score': input_data['Respiratory_Syndrome'],
                'gi_score': input_data['GI_Syndrome'],
                'systemic_score': input_data['Systemic_Syndrome'],
                'neurological_score': input_data['Neurological_Syndrome'],
                'multi_system': bool(input_data['Multi_System_Disease'])
            },
            'condition_severity': 'Acute' if input_data['Acute_Condition'] else 'Chronic' if input_data['Chronic_Condition'] else 'Subacute'
        }

# NOW load the actual pickle file
print("🔄 Loading animal_specific_disease_predictor.pkl...")

try:
    with open('animal_specific_disease_predictor.pkl', 'rb') as f:
        model_data = pickle.load(f)
    
    predictor = model_data['predictor']
    available_animals = model_data['available_animals']
    
    print("✅ Model loaded successfully!")
    print(f"🐾 Available animals: {', '.join(available_animals)}")
    
    # Test prediction
    print("\n🧪 Testing with sample data...")
    
    result = predictor.predict_disease(
        animal_type='Cat',
        breed='Siamese',
        age=5,
        gender='Male', 
        weight=30,
        symptom1='Cough',
        symptom2='Lethargy',
        symptom3='Loss of appetite',
        symptom4='Nasal discharge',
        duration=7,
        appetite_loss='yes',
        vomiting='no',
        diarrhea='no',
        coughing='yes',
        labored_breathing='yes',
        lameness='no',
        skin_lesions='no',
        nasal_discharge='yes', 
        eye_discharge='no',
        body_temperature=39.8,
        heart_rate=110
    )
    
    if 'predicted_disease' in result:
        print(f"🏥 Predicted Disease: {result['predicted_disease']}")
        print(f"🎯 Confidence: {result['confidence']*100:.1f}%")
        print("📊 Top 3 Predictions:")
        for i, pred in enumerate(result['top_3_predictions'], 1):
            print(f"   {i}. {pred['disease']} ({pred['probability']*100:.1f}%)")
        print(f"🌡️ Temperature Status: {result['vital_signs_analysis']['temperature_status']}")
        print(f"❤️ Heart Rate Status: {result['vital_signs_analysis']['heart_rate_status']}")
    else:
        print(f"⚠️ {result.get('message', 'Unknown error')}")
    
    print(f"\n✅ Your animal_specific_disease_predictor.pkl is working!")
    print("Use predictor.predict_disease() to make predictions.")
    
except FileNotFoundError:
    print("❌ File 'animal_specific_disease_predictor.pkl' not found!")
    print("Make sure the file is in the same directory.")
except Exception as e:
    print(f"❌ Error loading model: {str(e)}")