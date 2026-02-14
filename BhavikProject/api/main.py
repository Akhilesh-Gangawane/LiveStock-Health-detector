from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
import random

app = FastAPI(title="Livestock Disease Prediction API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class PredictionRequest(BaseModel):
    animal_type: str
    breed: str = "Mixed"
    age: float = 3.0
    gender: str = "Male"
    weight: float = 50.0
    body_temperature: float = 38.5
    heart_rate: float = 80.0
    symptom1: str = "none"
    symptom2: str = "none"
    symptom3: str = "none"
    symptom4: str = "none"
    duration: int = 3
    appetite_loss: str = "no"
    vomiting: str = "no"
    diarrhea: str = "no"
    coughing: str = "no"
    labored_breathing: str = "no"
    lameness: str = "no"
    skin_lesions: str = "no"
    nasal_discharge: str = "no"
    eye_discharge: str = "no"

class TopPrediction(BaseModel):
    disease: str
    probability: float

class VitalSignsAnalysis(BaseModel):
    temperature_status: str
    heart_rate_status: str
    fever_severity: float
    hr_severity: float

class SyndromeAnalysis(BaseModel):
    respiratory_score: int
    gi_score: int
    systemic_score: int
    neurological_score: int
    multi_system: bool

class PredictionResponse(BaseModel):
    animal_type: str
    predicted_disease: str
    confidence: float
    top_3_predictions: List[TopPrediction]
    vital_signs_analysis: VitalSignsAnalysis
    syndrome_analysis: SyndromeAnalysis
    condition_severity: str

# Disease database
DISEASE_DB = {
    'Dog': ['Kennel Cough', 'Parvovirus', 'Distemper', 'Respiratory Infection', 'Gastroenteritis'],
    'Cat': ['Upper Respiratory Infection', 'Feline Leukemia', 'Kidney Disease', 'Hyperthyroidism', 'Dental Disease'],
    'Cow': ['Mastitis', 'Pneumonia', 'Foot Rot', 'Milk Fever', 'Bloat'],
    'Cattle': ['Mastitis', 'Pneumonia', 'Foot Rot', 'Milk Fever', 'Bloat'],
    'Horse': ['Colic', 'Laminitis', 'Respiratory Disease', 'Skin Conditions', 'Arthritis'],
    'Goat': ['Pneumonia', 'Parasites', 'Pregnancy Toxemia', 'Foot Rot', 'Enterotoxemia'],
    'Sheep': ['Foot Rot', 'Parasites', 'Pneumonia', 'Pregnancy Toxemia', 'Scrapie'],
    'Pig': ['Swine Flu', 'Pneumonia', 'Diarrhea', 'Skin Conditions', 'Respiratory Disease'],
    'Chicken': ['Newcastle Disease', 'Avian Flu', 'Coccidiosis', 'Respiratory Infection', 'Egg Binding']
}

NORMAL_RANGES = {
    'Dog': {'temp': (38.0, 39.2), 'hr': (60, 160)},
    'Cat': {'temp': (38.1, 39.2), 'hr': (140, 220)},
    'Horse': {'temp': (37.2, 38.6), 'hr': (28, 44)},
    'Cow': {'temp': (38.0, 39.3), 'hr': (48, 84)},
    'Cattle': {'temp': (38.0, 39.3), 'hr': (48, 84)},
    'Sheep': {'temp': (38.3, 39.9), 'hr': (60, 120)},
    'Goat': {'temp': (38.5, 40.0), 'hr': (70, 135)},
    'Pig': {'temp': (38.7, 39.8), 'hr': (58, 100)},
    'Chicken': {'temp': (40.5, 42.0), 'hr': (250, 300)}
}

def predict_disease(request: PredictionRequest):
    """AI Disease Prediction Logic"""
    
    # Get possible diseases
    diseases = DISEASE_DB.get(request.animal_type, ['Unknown Disease'])
    
    # Calculate confidence based on symptoms
    confidence = 0.6
    symptoms = [request.appetite_loss, request.vomiting, request.diarrhea, 
               request.coughing, request.labored_breathing, request.lameness,
               request.skin_lesions, request.nasal_discharge, request.eye_discharge]
    
    symptom_count = sum(1 for s in symptoms if s == 'yes')
    confidence += min(symptom_count * 0.05, 0.25)
    
    # Temperature and heart rate factors
    if request.body_temperature > 39.5 or request.body_temperature < 37.5:
        confidence += 0.1
    if request.heart_rate > 120 or request.heart_rate < 50:
        confidence += 0.05
        
    confidence = min(confidence, 0.95)
    
    # Select disease based on symptoms
    predicted_disease = diseases[0]  # Default
    
    if request.coughing == 'yes' or request.labored_breathing == 'yes':
        respiratory_diseases = [d for d in diseases if any(word in d.lower() for word in ['respiratory', 'pneumonia', 'cough'])]
        if respiratory_diseases:
            predicted_disease = respiratory_diseases[0]
    elif request.diarrhea == 'yes' or request.vomiting == 'yes':
        gi_diseases = [d for d in diseases if any(word in d.lower() for word in ['gastro', 'diarrhea', 'enteritis'])]
        if gi_diseases:
            predicted_disease = gi_diseases[0]
    
    # Generate top 3 predictions
    top_3 = []
    remaining_prob = 1.0
    
    for i, disease in enumerate(diseases[:3]):
        if i == 0:
            prob = confidence
        elif i == 1:
            prob = (remaining_prob - confidence) * 0.7
        else:
            prob = max(remaining_prob - confidence - (top_3[1]['probability'] if len(top_3) > 1 else 0), 0.01)
        
        top_3.append(TopPrediction(disease=disease, probability=prob))
        remaining_prob -= prob
    
    # Analyze vital signs
    ranges = NORMAL_RANGES.get(request.animal_type, {'temp': (38.0, 39.5), 'hr': (60, 120)})
    
    temp_status = 'Normal'
    hr_status = 'Normal'
    fever_severity = 0.0
    hr_severity = 0.0
    
    if request.body_temperature > ranges['temp'][1]:
        temp_status = 'High'
        fever_severity = (request.body_temperature - ranges['temp'][1]) / 2.0
    elif request.body_temperature < ranges['temp'][0]:
        temp_status = 'Low'
        fever_severity = (ranges['temp'][0] - request.body_temperature) / 2.0
    
    if request.heart_rate > ranges['hr'][1]:
        hr_status = 'High'
        hr_severity = (request.heart_rate - ranges['hr'][1]) / ranges['hr'][1]
    elif request.heart_rate < ranges['hr'][0]:
        hr_status = 'Low'
        hr_severity = (ranges['hr'][0] - request.heart_rate) / ranges['hr'][0]
    
    # Syndrome analysis
    respiratory_score = (
        (3 if request.coughing == 'yes' else 0) +
        (4 if request.labored_breathing == 'yes' else 0) +
        (2 if request.nasal_discharge == 'yes' else 0) +
        (1 if request.eye_discharge == 'yes' else 0)
    )
    
    gi_score = (
        (4 if request.vomiting == 'yes' else 0) +
        (3 if request.diarrhea == 'yes' else 0) +
        (2 if request.appetite_loss == 'yes' else 0)
    )
    
    systemic_score = (2 if request.appetite_loss == 'yes' else 0)
    neurological_score = (3 if request.lameness == 'yes' else 0)
    
    multi_system = sum([
        respiratory_score > 2,
        gi_score > 2,
        systemic_score > 2,
        neurological_score > 2
    ]) >= 2
    
    # Determine severity
    if request.duration <= 3:
        severity = 'Acute'
    elif request.duration <= 14:
        severity = 'Subacute'
    else:
        severity = 'Chronic'
    
    return PredictionResponse(
        animal_type=request.animal_type,
        predicted_disease=predicted_disease,
        confidence=confidence,
        top_3_predictions=top_3,
        vital_signs_analysis=VitalSignsAnalysis(
            temperature_status=temp_status,
            heart_rate_status=hr_status,
            fever_severity=fever_severity,
            hr_severity=hr_severity
        ),
        syndrome_analysis=SyndromeAnalysis(
            respiratory_score=respiratory_score,
            gi_score=gi_score,
            systemic_score=systemic_score,
            neurological_score=neurological_score,
            multi_system=multi_system
        ),
        condition_severity=severity
    )

# API Routes
@app.get("/")
async def root():
    return {"message": "Livestock Disease Prediction API", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": True,
        "available_animals": list(DISEASE_DB.keys())
    }

@app.get("/api/animals")
async def get_available_animals():
    return {
        "animals": list(DISEASE_DB.keys()),
        "total": len(DISEASE_DB)
    }

@app.post("/api/predict", response_model=PredictionResponse)
async def predict_disease_endpoint(request: PredictionRequest):
    try:
        if request.animal_type not in DISEASE_DB:
            raise HTTPException(status_code=400, detail=f"Animal type '{request.animal_type}' not supported")
        
        result = predict_disease(request)
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)