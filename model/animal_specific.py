import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.svm import SVC
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import accuracy_score, f1_score
from imblearn.over_sampling import SMOTE
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

print("🐾 ANIMAL-SPECIFIC DISEASE PREDICTION SYSTEM")
print("=" * 55)
print("Direct: Animal Type + Symptoms → Most Likely Disease")
print("=" * 55)

# Load and preprocess data
df = pd.read_csv('cleaned_animal_disease_prediction.csv')

# Binary encoding for symptoms
yesno_cols = ['Appetite_Loss', 'Vomiting', 'Diarrhea', 'Coughing', 'Labored_Breathing',
              'Lameness', 'Skin_Lesions', 'Nasal_Discharge', 'Eye_Discharge']
for col in yesno_cols:
    df[col] = df[col].map({'Yes': 1, 'No': 0})

# Duration conversion
def convert_duration_to_days(duration):
    num = int(''.join(filter(str.isdigit, duration)))
    return num * 7 if 'week' in duration else num

df['Duration'] = df['Duration'].apply(convert_duration_to_days).astype(float)
df['Body_Temperature'] = df['Body_Temperature'].str.replace('°', '').str.replace('C', '').str.strip().astype(float)
df['Heart_Rate'] = df['Heart_Rate'].astype(float)

print("📊 Analyzing animal-specific disease patterns...")

# Show animal distribution
animal_counts = df['Animal_Type'].value_counts()
print(f"Animals in dataset: {len(animal_counts)}")
for animal, count in animal_counts.items():
    unique_diseases = df[df['Animal_Type'] == animal]['Disease_Prediction'].nunique()
    print(f"  {animal}: {count} samples, {unique_diseases} diseases")

print("\n🎯 Creating animal-specific medical features...")

# Species-specific vital sign analysis
def create_species_specific_features(df):
    """Create features based on species-specific normal ranges"""
    
    # Define normal ranges for different animals
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
    
    df['Temp_Abnormal'] = 0
    df['HR_Abnormal'] = 0
    df['Fever_Severity'] = 0
    df['HR_Severity'] = 0
    
    for idx, row in df.iterrows():
        animal = row['Animal_Type']
        temp = row['Body_Temperature']
        hr = row['Heart_Rate']
        
        # Get normal ranges (use generic if animal not in list)
        ranges = normal_ranges.get(animal, {'temp': (38.0, 39.5), 'hr': (60, 120)})
        temp_range = ranges['temp']
        hr_range = ranges['hr']
        
        # Temperature abnormalities
        if temp > temp_range[1]:
            df.loc[idx, 'Temp_Abnormal'] = 1  # Fever
            df.loc[idx, 'Fever_Severity'] = (temp - temp_range[1]) / 2.0
        elif temp < temp_range[0]:
            df.loc[idx, 'Temp_Abnormal'] = -1  # Hypothermia
            df.loc[idx, 'Fever_Severity'] = (temp_range[0] - temp) / 2.0
        
        # Heart rate abnormalities
        if hr > hr_range[1]:
            df.loc[idx, 'HR_Abnormal'] = 1  # Tachycardia
            df.loc[idx, 'HR_Severity'] = (hr - hr_range[1]) / hr_range[1]
        elif hr < hr_range[0]:
            df.loc[idx, 'HR_Abnormal'] = -1  # Bradycardia
            df.loc[idx, 'HR_Severity'] = (hr_range[0] - hr) / hr_range[0]
    
    return df

df = create_species_specific_features(df)

# Create comprehensive medical scoring systems
df['Respiratory_Syndrome'] = (df['Coughing'] * 3 + df['Labored_Breathing'] * 4 + 
                             df['Nasal_Discharge'] * 2 + df['Eye_Discharge'] * 1)
df['GI_Syndrome'] = (df['Vomiting'] * 4 + df['Diarrhea'] * 3 + df['Appetite_Loss'] * 2)
df['Systemic_Syndrome'] = (df['Temp_Abnormal'].abs() * 3 + df['Appetite_Loss'] * 2)
df['Dermatological_Syndrome'] = df['Skin_Lesions'] * 3
df['Neurological_Syndrome'] = df['Lameness'] * 3

# Disease severity indicators
df['Acute_Condition'] = (df['Duration'] <= 3).astype(int)
df['Subacute_Condition'] = ((df['Duration'] > 3) & (df['Duration'] <= 14)).astype(int)
df['Chronic_Condition'] = (df['Duration'] > 14).astype(int)

# Multi-system involvement (indicates serious disease)
df['Multi_System_Disease'] = ((df['Respiratory_Syndrome'] > 2) + 
                             (df['GI_Syndrome'] > 2) + 
                             (df['Systemic_Syndrome'] > 2) + 
                             (df['Neurological_Syndrome'] > 2) >= 2).astype(int)

# Age and size risk factors
df['Young_Animal'] = (df['Age'] < 2).astype(int)
df['Senior_Animal'] = (df['Age'] > 8).astype(int)
df['Small_Animal'] = (df['Weight'] < 30).astype(int)
df['Large_Animal'] = (df['Weight'] > 200).astype(int)

# Animal-Specific Disease Prediction Models
class AnimalSpecificDiseasePredictor:
    def __init__(self):
        self.animal_models = {}
        self.animal_scalers = {}
        self.animal_encoders = {}
        self.feature_columns = []
        
    def fit(self, df):
        print("🏗️ Building Animal-Specific Disease Models...")
        
        # Define feature columns
        self.feature_columns = [
            'Breed', 'Age', 'Gender', 'Weight', 
            'Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4',
            'Duration', 'Body_Temperature', 'Heart_Rate',
            'Appetite_Loss', 'Vomiting', 'Diarrhea', 'Coughing', 'Labored_Breathing',
            'Lameness', 'Skin_Lesions', 'Nasal_Discharge', 'Eye_Discharge',
            'Temp_Abnormal', 'HR_Abnormal', 'Fever_Severity', 'HR_Severity',
            'Respiratory_Syndrome', 'GI_Syndrome', 'Systemic_Syndrome',
            'Dermatological_Syndrome', 'Neurological_Syndrome',
            'Acute_Condition', 'Chronic_Condition', 'Multi_System_Disease',
            'Young_Animal', 'Senior_Animal', 'Small_Animal', 'Large_Animal'
        ]
        
        # Encode categorical features first
        cat_cols = ['Breed', 'Gender', 'Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4']
        self.label_encoders = {}
        
        for col in cat_cols:
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col].astype(str))
            self.label_encoders[col] = le
        
        # Train model for each animal type
        for animal_type in df['Animal_Type'].unique():
            animal_data = df[df['Animal_Type'] == animal_type].copy()
            
            if len(animal_data) < 5:  # Skip animals with too few samples
                print(f"   Skipping {animal_type} (only {len(animal_data)} samples)")
                continue
            
            diseases = animal_data['Disease_Prediction'].value_counts()
            print(f"   Training {animal_type} model: {len(animal_data)} samples, {len(diseases)} diseases")
            
            # Handle single disease case
            if len(diseases) == 1:
                self.animal_models[animal_type] = {
                    'type': 'single_disease',
                    'disease': diseases.index[0],
                    'confidence': 1.0
                }
                continue
            
            # Prepare features and target
            X_animal = animal_data[self.feature_columns]
            y_animal = animal_data['Disease_Prediction']
            
            # Encode diseases for this animal
            le_diseases = LabelEncoder()
            y_encoded = le_diseases.fit_transform(y_animal)
            self.animal_encoders[animal_type] = le_diseases
            
            # Scale features
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X_animal)
            self.animal_scalers[animal_type] = scaler
            
            # Apply SMOTE for better balance (if possible)
            if len(animal_data) > 10 and len(np.unique(y_encoded)) > 1:
                disease_counts = Counter(y_encoded)
                min_samples = min(disease_counts.values())
                
                if min_samples > 1:
                    k_neighbors = min(3, min_samples - 1)
                    try:
                        smote = SMOTE(random_state=42, k_neighbors=k_neighbors)
                        X_scaled, y_encoded = smote.fit_resample(X_scaled, y_encoded)
                    except:
                        pass  # Continue without SMOTE if it fails
            
            # Train ensemble of models for this animal
            models = {}
            
            # Random Forest (primary model)
            models['rf'] = RandomForestClassifier(
                n_estimators=300, max_depth=None, min_samples_split=2,
                min_samples_leaf=1, class_weight='balanced', random_state=42
            )
            models['rf'].fit(X_scaled, y_encoded)
            
            # XGBoost
            models['xgb'] = XGBClassifier(
                n_estimators=200, max_depth=6, learning_rate=0.1,
                random_state=42, eval_metric='mlogloss'
            )
            models['xgb'].fit(X_scaled, y_encoded)
            
            # LightGBM  
            models['lgb'] = LGBMClassifier(
                n_estimators=200, max_depth=8, learning_rate=0.1,
                random_state=42, verbose=-1
            )
            models['lgb'].fit(X_scaled, y_encoded)
            
            self.animal_models[animal_type] = {
                'type': 'ensemble',
                'models': models
            }
            
            # Calculate accuracy for this animal
            predictions = self._predict_for_animal(X_scaled, animal_type)
            accuracy = accuracy_score(y_encoded, predictions)
            print(f"     {animal_type} Model Accuracy: {accuracy:.3f} ({accuracy*100:.1f}%)")
        
        print("✅ All animal-specific models trained!")
    
    def _predict_for_animal(self, X_scaled, animal_type):
        """Make predictions for a specific animal type"""
        if animal_type not in self.animal_models:
            return np.array([0] * len(X_scaled))
        
        model_info = self.animal_models[animal_type]
        
        if model_info['type'] == 'single_disease':
            return np.array([0] * len(X_scaled))  # Single disease encoded as 0
        
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
        """
        Predict the most likely disease for a specific animal with given symptoms
        """
        
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
                'prediction': model_info['disease'],
                'confidence': model_info['confidence'],
                'message': f'Only one disease recorded for {animal_type} in training data'
            }
        
        # Prepare input data
        input_data = {
            'Breed': breed,
            'Age': age,
            'Gender': gender,
            'Weight': weight,
            'Symptom_1': symptom1,
            'Symptom_2': symptom2,
            'Symptom_3': symptom3,
            'Symptom_4': symptom4,
            'Duration': duration,
            'Body_Temperature': body_temperature,
            'Heart_Rate': heart_rate,
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
        
        # Add species-specific features
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
        input_data['Respiratory_Syndrome'] = (input_data['Coughing'] * 3 + 
                                            input_data['Labored_Breathing'] * 4 +
                                            input_data['Nasal_Discharge'] * 2 + 
                                            input_data['Eye_Discharge'] * 1)
        
        input_data['GI_Syndrome'] = (input_data['Vomiting'] * 4 + 
                                    input_data['Diarrhea'] * 3 + 
                                    input_data['Appetite_Loss'] * 2)
        
        input_data['Systemic_Syndrome'] = (abs(input_data['Temp_Abnormal']) * 3 + 
                                         input_data['Appetite_Loss'] * 2)
        
        input_data['Dermatological_Syndrome'] = input_data['Skin_Lesions'] * 3
        input_data['Neurological_Syndrome'] = input_data['Lameness'] * 3
        
        # Duration-based conditions
        input_data['Acute_Condition'] = 1 if duration <= 3 else 0
        input_data['Subacute_Condition'] = 1 if 3 < duration <= 14 else 0
        input_data['Chronic_Condition'] = 1 if duration > 14 else 0
        
        # Multi-system involvement
        system_count = sum([
            input_data['Respiratory_Syndrome'] > 2,
            input_data['GI_Syndrome'] > 2,
            input_data['Systemic_Syndrome'] > 2,
            input_data['Neurological_Syndrome'] > 2
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
            return {'prediction': 'Error - No scaler for this animal', 'confidence': 0.0}
        
        # Make prediction
        models = model_info['models']
        all_probs = []
        
        for model in models.values():
            try:
                proba = model.predict_proba(input_scaled)[0]
                all_probs.append(proba)
            except:
                pred = model.predict(input_scaled)[0]
                # Convert to probability-like format
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

# Train the system
print("\n🚀 Training Animal-Specific Disease Prediction System...")
predictor = AnimalSpecificDiseasePredictor()
predictor.fit(df)

# Test the system
print("\n🧪 Testing the prediction system...")

# Example prediction
test_result = predictor.predict_disease(
    animal_type='Dog',
    breed='Labrador',
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

print("\n🏥 SAMPLE DISEASE PREDICTION:")
print("=" * 50)
print(f"Animal: {test_result['animal_type']}")
print(f"Most Likely Disease: {test_result['predicted_disease']}")
print(f"Confidence: {test_result['confidence']:.3f} ({test_result['confidence']*100:.1f}%)")
print(f"Condition Severity: {test_result['condition_severity']}")

print(f"\nTop 3 Possible Diseases:")
for i, pred in enumerate(test_result['top_3_predictions'], 1):
    print(f"  {i}. {pred['disease']} - {pred['probability']:.3f} ({pred['probability']*100:.1f}%)")

print(f"\nVital Signs Analysis:")
vs = test_result['vital_signs_analysis']
print(f"  Temperature: {vs['temperature_status']}")
print(f"  Heart Rate: {vs['heart_rate_status']}")

print(f"\nSyndrome Analysis:")
sa = test_result['syndrome_analysis']
print(f"  Respiratory Score: {sa['respiratory_score']}")
print(f"  GI Score: {sa['gi_score']}")
print(f"  Multi-System Disease: {sa['multi_system']}")

# Save the model
import pickle

final_model = {
    'predictor': predictor,
    'available_animals': list(predictor.animal_models.keys()),
    'description': 'Animal-Specific Disease Prediction System'
}

with open('animal_specific_disease_predictor.pkl', 'wb') as f:
    pickle.dump(final_model, f)

print(f"\n💾 ANIMAL-SPECIFIC MODEL SAVED!")
print(f"🐾 Available Animals: {', '.join(predictor.animal_models.keys())}")

print(f"\n🚀 SYSTEM READY FOR DISEASE PREDICTION!")
print("=" * 50)
print("Usage: predictor.predict_disease(")
print("    animal_type='Dog',")
print("    breed='Mixed',")
print("    age=3,")
print("    gender='Female',")
print("    weight=25,")
print("    symptom1='Cough',")
print("    symptom2='Fever',")
print("    symptom3='Lethargy',")
print("    symptom4='None',")
print("    duration=5,")
print("    appetite_loss='yes',")
print("    vomiting='no',")
print("    diarrhea='no',")
print("    coughing='yes',")
print("    labored_breathing='no',")
print("    lameness='no',")
print("    skin_lesions='no',")
print("    nasal_discharge='yes',")
print("    eye_discharge='no',")
print("    body_temperature=39.5,")
print("    heart_rate=120")
print(")")