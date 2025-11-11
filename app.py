from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.metrics import accuracy_score
from imblearn.over_sampling import SMOTE
from collections import Counter
import os
import json
from datetime import datetime
import warnings
from supabase import create_client, Client
from dotenv import load_dotenv

warnings.filterwarnings('ignore')

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'pashucare-secret-key-2024')

# Initialize Supabase
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Initialize extensions
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
bcrypt = Bcrypt(app)

# User class for Flask-Login (Supabase version)
class User(UserMixin):
    def __init__(self, id, email, name, farm_name=None, location=None, phone=None, user_type='farmer'):
        self.id = id
        self.email = email
        self.name = name
        self.farm_name = farm_name
        self.location = location
        self.phone = phone
        self.user_type = user_type
    
    @staticmethod
    def get(user_id):
        """Get user by ID from Supabase"""
        try:
            response = supabase.table('users').select('*').eq('id', user_id).execute()
            if response.data and len(response.data) > 0:
                user_data = response.data[0]
                return User(
                    id=user_data['id'],
                    email=user_data['email'],
                    name=user_data['name'],
                    farm_name=user_data.get('farm_name'),
                    location=user_data.get('location'),
                    phone=user_data.get('phone'),
                    user_type=user_data.get('user_type', 'farmer')
                )
        except Exception as e:
            print(f"Error getting user: {e}")
        return None
    
    @staticmethod
    def get_by_email(email):
        """Get user by email from Supabase"""
        try:
            response = supabase.table('users').select('*').eq('email', email).execute()
            if response.data and len(response.data) > 0:
                user_data = response.data[0]
                return User(
                    id=user_data['id'],
                    email=user_data['email'],
                    name=user_data['name'],
                    farm_name=user_data.get('farm_name'),
                    location=user_data.get('location'),
                    phone=user_data.get('phone'),
                    user_type=user_data.get('user_type', 'farmer')
                ), user_data.get('password_hash')
        except Exception as e:
            print(f"Error getting user by email: {e}")
        return None, None
    
    @staticmethod
    def create(email, password, name, farm_name=None, location=None, phone=None, user_type='farmer'):
        """Create new user in Supabase"""
        try:
            password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            response = supabase.table('users').insert({
                'email': email,
                'password_hash': password_hash,
                'name': name,
                'farm_name': farm_name,
                'location': location,
                'phone': phone,
                'user_type': user_type
            }).execute()
            
            if response.data and len(response.data) > 0:
                user_data = response.data[0]
                return User(
                    id=user_data['id'],
                    email=user_data['email'],
                    name=user_data['name'],
                    farm_name=user_data.get('farm_name'),
                    location=user_data.get('location'),
                    phone=user_data.get('phone'),
                    user_type=user_data.get('user_type', 'farmer')
                )
        except Exception as e:
            print(f"Error creating user: {e}")
        return None

# Database Helper Functions for Supabase
class DB:
    @staticmethod
    def get_user_animals(user_id):
        try:
            response = supabase.table('animals').select('*').eq('user_id', user_id).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    @staticmethod
    def get_user_lands(user_id):
        try:
            response = supabase.table('farm_lands').select('*').eq('user_id', user_id).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    @staticmethod
    def get_user_predictions(user_id):
        try:
            response = supabase.table('predictions').select('*').eq('user_id', user_id).order('created_at', desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    @staticmethod
    def add_animal(user_id, data):
        try:
            data['user_id'] = user_id
            response = supabase.table('animals').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def add_land(user_id, data):
        try:
            data['user_id'] = user_id
            response = supabase.table('farm_lands').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def add_prediction(user_id, animal_id, prediction_data, result, confidence):
        try:
            data = {
                'user_id': user_id,
                'animal_id': animal_id,
                'prediction_data': json.dumps(prediction_data),
                'result': json.dumps(result),
                'confidence': confidence
            }
            response = supabase.table('predictions').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def get_all_veterinarians():
        try:
            response = supabase.table('veterinarians').select('*').eq('is_available', True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    @staticmethod
    def get_all_diseases():
        try:
            response = supabase.table('diseases').select('*').execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    @staticmethod
    def get_all_subsidies():
        try:
            response = supabase.table('subsidies').select('*').eq('is_active', True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    @staticmethod
    def get_animal(animal_id, user_id):
        try:
            response = supabase.table('animals').select('*').eq('id', animal_id).eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def update_animal(animal_id, user_id, data):
        try:
            response = supabase.table('animals').update(data).eq('id', animal_id).eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def get_animal_predictions(animal_id):
        try:
            response = supabase.table('predictions').select('*').eq('animal_id', animal_id).order('created_at', desc=True).limit(10).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    @staticmethod
    def get_animal_vaccinations(animal_id):
        try:
            response = supabase.table('vaccinations').select('*').eq('animal_id', animal_id).order('vaccination_date', desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            print(f"Error: {e}")
            return []
    
    @staticmethod
    def add_vaccination(animal_id, data):
        try:
            data['animal_id'] = animal_id
            response = supabase.table('vaccinations').insert(data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def get_land(land_id, user_id):
        try:
            response = supabase.table('farm_lands').select('*').eq('id', land_id).eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def update_land(land_id, user_id, data):
        try:
            response = supabase.table('farm_lands').update(data).eq('id', land_id).eq('user_id', user_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            print(f"Error: {e}")
            return None

# Load user callback for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.get(int(user_id))

# Multi-language support
LANGUAGES = {
    'en': {
        'app_name': 'PashuCare',
        'home': 'Home',
        'dashboard': 'Dashboard',
        'animals': 'Animals',
        'lands': 'Farm Lands',
        'health_check': 'Health Check',
        'veterinarians': 'Veterinarians',
        'knowledge_base': 'Knowledge Base',
        'subsidies': 'Subsidies & Schemes',
        'login': 'Login',
        'register': 'Register',
        'logout': 'Logout',
        'profile': 'Profile',
        'welcome': 'Welcome to PashuCare',
        'ai_prediction': 'AI-powered livestock health detection',
        'add_animal': 'Add Animal',
        'add_land': 'Add Farm Land',
        'total_animals': 'Total Animals',
        'total_lands': 'Total Farm Lands',
        'sick_animals': 'Sick Animals',
        'predictions': 'Health Predictions',
        'animal_type': 'Animal Type',
        'breed': 'Breed',
        'age': 'Age',
        'gender': 'Gender',
        'weight': 'Weight',
        'health_status': 'Health Status',
        'healthy': 'Healthy',
        'sick': 'Sick',
        'recovering': 'Recovering',
        'symptoms': 'Symptoms',
        'predict_disease': 'Predict Disease',
        'confidence': 'Confidence',
        'recommendations': 'Recommendations',
        'prevention': 'Prevention',
        'treatment': 'Treatment',
        'contact_vet': 'Contact Veterinarian',
        'scheme_type': 'Scheme Type',
        'state': 'State',
        'eligibility': 'Eligibility',
        'apply_now': 'Apply Now',
        'vaccination_due': 'Vaccination Due',
        'next_vaccination': 'Next Vaccination',
        
        # Additional translations for homepage and features
        'powerful_ai_features': 'Powerful AI-Driven Features',
        'advanced_technology': 'Advanced technology meets veterinary expertise to provide comprehensive livestock health management',
        'ai_disease_detection': 'AI Disease Detection',
        'ai_disease_desc': 'Advanced machine learning algorithms analyze symptoms to detect potential illnesses with high accuracy and provide instant results.',
        'voice_analysis': 'Voice Analysis',
        'voice_analysis_desc': 'Describe symptoms verbally and let our AI analyze the audio for comprehensive health assessment and recommendations.',
        'knowledge_base_desc': 'Access comprehensive information about common livestock diseases, treatments, and prevention methods from experts.',
        'quick_actions': 'Quick Actions',
        'quick_actions_desc': 'Access essential farm management tools and services with just one click',
        'health_assessment': 'Health Assessment',
        'health_assessment_desc': 'Quick AI-powered health check for your livestock',
        'add_animal_desc': 'Register new livestock to your farm',
        'view_analytics': 'View Analytics',
        'view_analytics_desc': 'Monitor farm performance and health trends',
        'create_account': 'Create Account',
        'create_account_desc': 'Join PashuCare for full features',
        'find_veterinarian': 'Find Veterinarian',
        'find_veterinarian_desc': 'Locate qualified vets in your area',
        'government_schemes': 'Government Schemes',
        'government_schemes_desc': 'Explore available subsidies and programs',
        'learn_educate': 'Learn & Educate',
        'learn_educate_desc': 'Access educational resources and guides',
        'trusted_by_farmers': 'Trusted by Farmers Worldwide',
        'trusted_desc': 'Join thousands of farmers who trust PashuCare for their livestock health management',
        'animal_species_supported': 'Animal Species Supported',
        'ai_model_accuracy': 'AI Model Accuracy',
        'available_support': 'Available Support',
        'disease_patterns': 'Disease Patterns',
        
        # Modal and form translations
        'animal_health_assessment': 'Animal Health Assessment',
        'comprehensive_ai_analysis': 'Comprehensive AI-powered health analysis for your livestock',
        'basic_information': 'Basic Information',
        'select_animal_type': 'Select Animal Type',
        'first_select_animal': 'First select animal type',
        'select_breed': 'Select Breed',
        'years': 'years',
        'select_gender': 'Select Gender',
        'male': 'Male',
        'female': 'Female',
        'kg': 'kg',
        'days': 'days',
        'primary_symptoms': 'Primary Symptoms',
        'primary_symptom': 'Primary Symptom',
        'secondary_symptom': 'Secondary Symptom',
        'additional_symptom': 'Additional Symptom',
        'other_symptom': 'Other Symptom',
        'select_primary_symptom': 'Select Primary Symptom',
        'select_secondary_symptom': 'Select Secondary Symptom',
        'select_additional_symptom': 'Select Additional Symptom',
        'select_other_symptom': 'Select Other Symptom',
        'observable_symptoms': 'Observable Symptoms',
        'select_all_observed': 'Select all symptoms you have observed in the animal',
        'appetite_loss': 'Appetite Loss',
        'vomiting': 'Vomiting',
        'diarrhea': 'Diarrhea',
        'coughing': 'Coughing',
        'labored_breathing': 'Labored Breathing',
        'nasal_discharge': 'Nasal Discharge',
        'lameness': 'Lameness',
        'skin_lesions': 'Skin Lesions',
        'eye_discharge': 'Eye Discharge',
        'vital_signs': 'Vital Signs',
        'body_temperature': 'Body Temperature (°C)',
        'normal_range_temp': 'Normal range: 38.0-39.5°C for most livestock',
        'heart_rate': 'Heart Rate (BPM)',
        'normal_range_hr': 'Normal range varies by species and age',
        'analyze_with_ai': 'Analyze with AI',
        'voice_analysis_btn': 'Voice Analysis',
        
        # Navigation items
        'services': 'Services',
        'find_veterinarians': 'Find Veterinarians',
        'my_animals': 'My Animals',
        'my_farm_lands': 'My Farm Lands',
        'go_to_dashboard': 'Go to Dashboard',
        'start_health_assessment': 'Start Health Assessment',
        
        # Common actions
        'view_details': 'View Details',
        'edit': 'Edit',
        'delete': 'Delete',
        'update': 'Update',
        'save': 'Save',
        'cancel': 'Cancel',
        'submit': 'Submit',
        'filter': 'Filter',
        'back': 'Back',
        'add': 'Add',
        
        # Dashboard and profile
        'personal_information': 'Personal Information',
        'farm_information': 'Farm Information',
        'update_profile': 'Update Profile',
        'name': 'Name',
        'email': 'Email',
        'phone': 'Phone Number',
        'farm_name': 'Farm Name',
        'location': 'Location',
        'password': 'Password',
        'confirm_password': 'Confirm Password',
        
        # Animal management
        'edit_animal': 'Edit Animal',
        'add_animal_title': 'Add New Animal',
        'update_animal': 'Update Animal',
        'back_to_animal': 'Back to Animal',
        'back_to_animals': 'Back to Animals',
        'animal_details': 'Animal Details',
        'basic_information': 'Basic Information',
        'health_information': 'Health Information',
        'vaccination_records': 'Vaccination Records',
        'prediction_history': 'Prediction History',
        'health_check_btn': 'Health Check',
        'add_vaccination': 'Add Vaccination',
        'save_vaccination_record': 'Save Vaccination Record',
        'vaccine_name': 'Vaccine Name',
        'vaccination_date': 'Vaccination Date',
        'next_due_date': 'Next Due Date',
        'administered_by': 'Administered By',
        'notes': 'Notes',
        
        # Land management
        'add_land_title': 'Add Farm Land',
        'land_details': 'Land Details',
        'land_area': 'Land Area',
        'land_type': 'Land Type',
        'crop_type': 'Crop Type',
        'irrigation': 'Irrigation',
        'soil_type': 'Soil Type',
        'edit_land': 'Edit Farm Land',
        'update_land': 'Update Land',
        'back_to_lands': 'Back to Lands',
        'land_name': 'Land Name',
        'size_acres': 'Size (Acres)',
        'crops_grown': 'Crops Grown',
        'land_analytics': 'Land Analytics',
        'productivity': 'Productivity',
        'crop_yield': 'Crop Yield',
        'soil_health': 'Soil Health',
        'water_usage': 'Water Usage',
        'fertilizer_usage': 'Fertilizer Usage',
        'recent_activities': 'Recent Activities',
        'land_overview': 'Land Overview',
        'performance_metrics': 'Performance Metrics',
        'yield_trends': 'Yield Trends',
        'resource_utilization': 'Resource Utilization',
        
        # Veterinarians
        'specialization': 'Specialization',
        'experience': 'Experience',
        'rating': 'Rating',
        'call_now': 'Call Now',
        'whatsapp': 'WhatsApp',
        'email_vet': 'Email',
        
        # Knowledge Base
        'common_symptoms': 'Common Symptoms',
        'affects': 'Affects',
        'high_risk': 'High Risk',
        'medium_risk': 'Medium Risk',
        'low_risk': 'Low Risk',
        
        # Subsidies
        'subsidy_amount': 'Subsidy Amount',
        'application_deadline': 'Application Deadline',
        'contact_information': 'Contact Information',
        'share': 'Share',
        'not_specified': 'Not specified',
        
        # Results page
        'prediction_result': 'Prediction Result',
        'predicted_disease': 'Predicted Disease',
        'confidence_level': 'Confidence Level',
        'very_high': 'Very High',
        'high': 'High',
        'moderate': 'Moderate',
        'low': 'Low',
        'condition_severity': 'Condition Severity',
        'acute_condition': 'Acute Condition',
        'chronic_condition': 'Chronic Condition',
        'subacute_condition': 'Subacute Condition',
        'vital_signs_analysis': 'Vital Signs Analysis',
        'temperature': 'Temperature',
        'normal': 'Normal',
        'syndrome_scores': 'Syndrome Scores',
        'respiratory': 'Respiratory',
        'gastrointestinal': 'Gastrointestinal',
        'systemic': 'Systemic',
        'multi_system_alert': 'Multiple body systems affected - Immediate veterinary attention recommended',
        'top_predictions': 'Top 3 Possible Conditions',
        'immediate_actions': 'Immediate Actions',
        'consult_veterinarian': 'Consult a Veterinarian',
        'monitor_closely': 'Monitor Animal Closely',
        'isolate_if_needed': 'Isolate if Contagious',
        'detailed_recommendations': 'Detailed Recommendations',
        'prevention_measures': 'Prevention Measures',
        'treatment_options': 'Treatment Options',
        'when_to_seek_help': 'When to Seek Veterinary Help',
        
        # Auth
        'create_new_account': 'Create New Account',
        'already_have_account': 'Already have an account?',
        'dont_have_account': "Don't have an account?",
        'sign_up': 'Sign Up',
        'sign_in': 'Sign In'
    },
    'mr': {
        'app_name': 'पशुकेअर',
        'home': 'मुख्यपृष्ठ',
        'dashboard': 'डॅशबोर्ड',
        'animals': 'जनावरे',
        'lands': 'शेतजमीन',
        'health_check': 'आरोग्य तपासणी',
        'veterinarians': 'पशुवैद्य',
        'knowledge_base': 'ज्ञान केंद्र',
        'subsidies': 'अनुदान आणि योजना',
        'login': 'लॉगिन',
        'register': 'नोंदणी',
        'logout': 'लॉगआउट',
        'profile': 'प्रोफाइल',
        'welcome': 'पशुकेअर मध्ये आपले स्वागत',
        'ai_prediction': 'AI-आधारित पशुधन आरोग्य शोध',
        'add_animal': 'जनावर जोडा',
        'add_land': 'शेतजमीन जोडा',
        'total_animals': 'एकूण जनावरे',
        'total_lands': 'एकूण शेतजमीन',
        'sick_animals': 'आजारी जनावरे',
        'predictions': 'आरोग्य अंदाज',
        'animal_type': 'जनावराचा प्रकार',
        'breed': 'जात',
        'age': 'वय',
        'gender': 'लिंग',
        'weight': 'वजन',
        'health_status': 'आरोग्य स्थिती',
        'healthy': 'निरोगी',
        'sick': 'आजारी',
        'recovering': 'बरे होत आहे',
        'symptoms': 'लक्षणे',
        'predict_disease': 'रोगाचा अंदाज',
        'confidence': 'विश्वास',
        'recommendations': 'शिफारसी',
        'prevention': 'प्रतिबंध',
        'treatment': 'उपचार',
        'contact_vet': 'पशुवैद्यांशी संपर्क',
        'scheme_type': 'योजनेचा प्रकार',
        'state': 'राज्य',
        'eligibility': 'पात्रता',
        'apply_now': 'आता अर्ज करा',
        'vaccination_due': 'लसीकरण बाकी',
        'next_vaccination': 'पुढील लसीकरण',
        
        # Additional translations for homepage and features
        'powerful_ai_features': 'शक्तिशाली AI-चालित वैशिष्ट्ये',
        'advanced_technology': 'प्रगत तंत्रज्ञान पशुवैद्यकीय तज्ञांसह मिळून व्यापक पशुधन आरोग्य व्यवस्थापन प्रदान करते',
        'ai_disease_detection': 'AI रोग शोध',
        'ai_disease_desc': 'प्रगत मशीन लर्निंग अल्गोरिदम लक्षणांचे विश्लेषण करून संभाव्य आजारांचा उच्च अचूकतेने शोध लावतात आणि तत्काळ परिणाम देतात.',
        'voice_analysis': 'आवाज विश्लेषण',
        'voice_analysis_desc': 'लक्षणांचे मौखिक वर्णन करा आणि आमच्या AI ला व्यापक आरोग्य मूल्यांकन आणि शिफारसींसाठी ऑडिओचे विश्लेषण करू द्या.',
        'knowledge_base_desc': 'तज्ञांकडून सामान्य पशुधन रोग, उपचार आणि प्रतिबंधक पद्धतींबद्दल व्यापक माहिती मिळवा.',
        'quick_actions': 'द्रुत क्रिया',
        'quick_actions_desc': 'फक्त एका क्लिकसह आवश्यक शेत व्यवस्थापन साधने आणि सेवांमध्ये प्रवेश करा',
        'health_assessment': 'आरोग्य मूल्यांकन',
        'health_assessment_desc': 'आपल्या पशुधनासाठी द्रुत AI-चालित आरोग्य तपासणी',
        'add_animal_desc': 'आपल्या शेतात नवीन पशुधनाची नोंदणी करा',
        'view_analytics': 'विश्लेषणे पहा',
        'view_analytics_desc': 'शेताची कामगिरी आणि आरोग्य ट्रेंडचे निरीक्षण करा',
        'create_account': 'खाते तयार करा',
        'create_account_desc': 'संपूर्ण वैशिष्ट्यांसाठी पशुकेअर मध्ये सामील व्हा',
        'find_veterinarian': 'पशुवैद्य शोधा',
        'find_veterinarian_desc': 'आपल्या क्षेत्रातील पात्र पशुवैद्यांचा शोध घ्या',
        'government_schemes': 'सरकारी योजना',
        'government_schemes_desc': 'उपलब्ध अनुदान आणि कार्यक्रमांचा शोध घ्या',
        'learn_educate': 'शिका आणि शिक्षण घ्या',
        'learn_educate_desc': 'शैक्षणिक संसाधने आणि मार्गदर्शकांमध्ये प्रवेश करा',
        'trusted_by_farmers': 'जगभरातील शेतकऱ्यांचा विश्वास',
        'trusted_desc': 'हजारो शेतकरी त्यांच्या पशुधन आरोग्य व्यवस्थापनासाठी पशुकेअर वर विश्वास ठेवतात',
        'animal_species_supported': 'प्राणी प्रजाती समर्थित',
        'ai_model_accuracy': 'AI मॉडेल अचूकता',
        'available_support': 'उपलब्ध समर्थन',
        'disease_patterns': 'रोग पॅटर्न',
        
        # Modal and form translations
        'animal_health_assessment': 'प्राणी आरोग्य मूल्यांकन',
        'comprehensive_ai_analysis': 'आपल्या पशुधनासाठी व्यापक AI-चालित आरोग्य विश्लेषण',
        'basic_information': 'मूलभूत माहिती',
        'select_animal_type': 'प्राणी प्रकार निवडा',
        'first_select_animal': 'प्रथम प्राणी प्रकार निवडा',
        'select_breed': 'जात निवडा',
        'years': 'वर्षे',
        'select_gender': 'लिंग निवडा',
        'male': 'नर',
        'female': 'मादा',
        'kg': 'किलो',
        'days': 'दिवस',
        'primary_symptoms': 'प्राथमिक लक्षणे',
        'primary_symptom': 'प्राथमिक लक्षण',
        'secondary_symptom': 'दुय्यम लक्षण',
        'additional_symptom': 'अतिरिक्त लक्षण',
        'other_symptom': 'इतर लक्षण',
        'select_primary_symptom': 'प्राथमिक लक्षण निवडा',
        'select_secondary_symptom': 'दुय्यम लक्षण निवडा',
        'select_additional_symptom': 'अतिरिक्त लक्षण निवडा',
        'select_other_symptom': 'इतर लक्षण निवडा',
        'observable_symptoms': 'निरीक्षणयोग्य लक्षणे',
        'select_all_observed': 'प्राण्यामध्ये आपण पाहिलेली सर्व लक्षणे निवडा',
        'appetite_loss': 'भूक न लागणे',
        'vomiting': 'उलट्या',
        'diarrhea': 'अतिसार',
        'coughing': 'खोकला',
        'labored_breathing': 'कष्टकरी श्वास',
        'nasal_discharge': 'नाकातून स्राव',
        'lameness': 'लंगडेपणा',
        'skin_lesions': 'त्वचेवर जखम',
        'eye_discharge': 'डोळ्यातून स्राव',
        'vital_signs': 'महत्वाचे चिन्हे',
        'body_temperature': 'शरीराचे तापमान',
        'normal_range_temp': 'सामान्य श्रेणी: बहुतेक पशुधनासाठी 38.0-39.5°C',
        'heart_rate': 'हृदयाचे ठोके',
        'normal_range_hr': 'सामान्य श्रेणी प्रजाती आणि वयानुसार बदलते',
        'analyze_with_ai': 'AI सह विश्लेषण करा',
        'voice_analysis_btn': 'आवाज विश्लेषण',
        
        # Navigation items
        'services': 'सेवा',
        'find_veterinarians': 'पशुवैद्य शोधा',
        'my_animals': 'माझे जनावरे',
        'my_farm_lands': 'माझी शेतजमीन',
        'go_to_dashboard': 'डॅशबोर्डवर जा',
        'start_health_assessment': 'आरोग्य मूल्यांकन सुरू करा',
        
        # Common actions
        'view_details': 'तपशील पहा',
        'edit': 'संपादित करा',
        'delete': 'हटवा',
        'update': 'अद्यतनित करा',
        'save': 'जतन करा',
        'cancel': 'रद्द करा',
        'submit': 'सबमिट करा',
        'filter': 'फिल्टर',
        'back': 'परत',
        'add': 'जोडा',
        
        # Dashboard and profile
        'personal_information': 'वैयक्तिक माहिती',
        'farm_information': 'शेत माहिती',
        'update_profile': 'प्रोफाइल अद्यतनित करा',
        'name': 'नाव',
        'email': 'ईमेल',
        'phone': 'फोन नंबर',
        'farm_name': 'शेताचे नाव',
        'location': 'स्थान',
        'password': 'पासवर्ड',
        'confirm_password': 'पासवर्ड पुष्टी करा',
        
        # Animal management
        'edit_animal': 'जनावर संपादित करा',
        'add_animal_title': 'नवीन जनावर जोडा',
        'update_animal': 'जनावर अद्यतनित करा',
        'back_to_animal': 'जनावराकडे परत',
        'back_to_animals': 'जनावरांकडे परत',
        'animal_details': 'जनावराचे तपशील',
        'basic_information': 'मूलभूत माहिती',
        'health_information': 'आरोग्य माहिती',
        'vaccination_records': 'लसीकरण नोंदी',
        'prediction_history': 'अंदाज इतिहास',
        'health_check_btn': 'आरोग्य तपासणी',
        'add_vaccination': 'लसीकरण जोडा',
        'save_vaccination_record': 'लसीकरण नोंद जतन करा',
        'vaccine_name': 'लसीचे नाव',
        'vaccination_date': 'लसीकरण तारीख',
        'next_due_date': 'पुढील देय तारीख',
        'administered_by': 'द्वारे प्रशासित',
        'notes': 'टिपा',
        
        # Land management
        'add_land_title': 'शेतजमीन जोडा',
        'land_details': 'जमिनीचे तपशील',
        'land_area': 'जमिनीचे क्षेत्रफळ',
        'land_type': 'जमिनीचा प्रकार',
        'crop_type': 'पिकाचा प्रकार',
        'irrigation': 'सिंचन',
        'soil_type': 'मातीचा प्रकार',
        'edit_land': 'शेतजमीन संपादित करा',
        'update_land': 'जमीन अद्यतनित करा',
        'back_to_lands': 'जमिनींकडे परत',
        'land_name': 'जमिनीचे नाव',
        'size_acres': 'आकार (एकर)',
        'crops_grown': 'पिके',
        'land_analytics': 'जमीन विश्लेषणे',
        'productivity': 'उत्पादकता',
        'crop_yield': 'पीक उत्पन्न',
        'soil_health': 'मातीचे आरोग्य',
        'water_usage': 'पाण्याचा वापर',
        'fertilizer_usage': 'खताचा वापर',
        'recent_activities': 'अलीकडील क्रियाकलाप',
        'land_overview': 'जमिनीचे विहंगावलोकन',
        'performance_metrics': 'कामगिरी मेट्रिक्स',
        'yield_trends': 'उत्पन्न ट्रेंड',
        'resource_utilization': 'संसाधन वापर',
        
        # Veterinarians
        'specialization': 'विशेषज्ञता',
        'experience': 'अनुभव',
        'rating': 'रेटिंग',
        'call_now': 'आता कॉल करा',
        'whatsapp': 'व्हाट्सअॅप',
        'email_vet': 'ईमेल',
        
        # Knowledge Base
        'common_symptoms': 'सामान्य लक्षणे',
        'affects': 'प्रभावित करते',
        'high_risk': 'उच्च जोखीम',
        'medium_risk': 'मध्यम जोखीम',
        'low_risk': 'कमी जोखीम',
        
        # Subsidies
        'subsidy_amount': 'अनुदान रक्कम',
        'application_deadline': 'अर्ज शेवटची तारीख',
        'contact_information': 'संपर्क माहिती',
        'share': 'शेअर करा',
        'not_specified': 'निर्दिष्ट नाही',
        
        # Results page
        'prediction_result': 'अंदाज परिणाम',
        'predicted_disease': 'अंदाजित रोग',
        'confidence_level': 'विश्वास पातळी',
        'very_high': 'खूप उच्च',
        'high': 'उच्च',
        'moderate': 'मध्यम',
        'low': 'कमी',
        'condition_severity': 'स्थितीची तीव्रता',
        'acute_condition': 'तीव्र स्थिती',
        'chronic_condition': 'जुनाट स्थिती',
        'subacute_condition': 'उपतीव्र स्थिती',
        'vital_signs_analysis': 'महत्वाचे चिन्हे विश्लेषण',
        'temperature': 'तापमान',
        'normal': 'सामान्य',
        'syndrome_scores': 'सिंड्रोम स्कोअर',
        'respiratory': 'श्वसन',
        'gastrointestinal': 'पाचक',
        'systemic': 'प्रणालीगत',
        'multi_system_alert': 'अनेक शरीर प्रणाली प्रभावित - तात्काळ पशुवैद्यकीय लक्ष शिफारस केले',
        'top_predictions': 'शीर्ष 3 संभाव्य स्थिती',
        'immediate_actions': 'तात्काळ कृती',
        'consult_veterinarian': 'पशुवैद्यांचा सल्ला घ्या',
        'monitor_closely': 'जनावराचे बारकाईने निरीक्षण करा',
        'isolate_if_needed': 'संसर्गजन्य असल्यास वेगळे करा',
        'detailed_recommendations': 'तपशीलवार शिफारसी',
        'prevention_measures': 'प्रतिबंधात्मक उपाय',
        'treatment_options': 'उपचार पर्याय',
        'when_to_seek_help': 'पशुवैद्यकीय मदत कधी घ्यावी',
        
        # Auth
        'create_new_account': 'नवीन खाते तयार करा',
        'already_have_account': 'आधीच खाते आहे?',
        'dont_have_account': 'खाते नाही?',
        'sign_up': 'साइन अप',
        'sign_in': 'साइन इन'
    }
}

def get_language():
    return session.get('language', 'en')

def get_text(key):
    lang = get_language()
    return LANGUAGES.get(lang, LANGUAGES['en']).get(key, key)

@app.context_processor
def inject_language():
    return dict(get_text=get_text, current_language=get_language())

# Template filters
@app.template_filter('from_json')
def from_json_filter(value):
    try:
        return json.loads(value) if value else []
    except:
        return []

@app.template_filter('format_date')
def format_date_filter(value, format='%B %d, %Y'):
    """Format date string or datetime object"""
    if not value:
        return 'N/A'
    
    try:
        # If it's already a datetime object
        if hasattr(value, 'strftime'):
            return value.strftime(format)
        
        # If it's a string, try to parse it
        from dateutil import parser
        dt = parser.parse(str(value))
        return dt.strftime(format)
    except:
        # If all else fails, return the string as-is
        return str(value)

@app.template_filter('format_datetime')
def format_datetime_filter(value):
    """Format datetime with time"""
    return format_date_filter(value, '%B %d, %Y at %I:%M %p')

# AI Disease Prediction Model
class AnimalSpecificDiseasePredictor:
    def __init__(self):
        self.animal_models = {}
        self.animal_scalers = {}
        self.animal_encoders = {}
        self.feature_columns = []
        self.label_encoders = {}
        
    def fit(self, df):
        print("Building Animal-Specific Disease Models...")
        
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
            
            if len(animal_data) < 5:
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
                        pass
            
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
        
        print("All animal-specific models trained!")
    
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
                'prediction': model_info['disease'],
                'confidence': model_info['confidence'],
                'message': f'Only one disease recorded for {animal_type} in training data'
            }
        
        # Prepare input data with all required features
        input_data = self._prepare_input_features(
            breed, age, gender, weight, symptom1, symptom2, symptom3, symptom4,
            duration, appetite_loss, vomiting, diarrhea, coughing, labored_breathing,
            lameness, skin_lesions, nasal_discharge, eye_discharge,
            body_temperature, heart_rate, animal_type
        )
        
        # Encode categorical features
        for col in ['Breed', 'Gender', 'Symptom_1', 'Symptom_2', 'Symptom_3', 'Symptom_4']:
            if col in self.label_encoders:
                try:
                    input_data[col] = self.label_encoders[col].transform([str(input_data[col])])[0]
                except:
                    input_data[col] = 0
        
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
            },
            'syndrome_analysis': {
                'respiratory_score': input_data['Respiratory_Syndrome'],
                'gi_score': input_data['GI_Syndrome'],
                'systemic_score': input_data['Systemic_Syndrome'],
                'multi_system': bool(input_data['Multi_System_Disease'])
            },
            'condition_severity': 'Acute' if input_data['Acute_Condition'] else 'Chronic' if input_data['Chronic_Condition'] else 'Subacute'
        }
    
    def _prepare_input_features(self, breed, age, gender, weight, symptom1, symptom2, 
                               symptom3, symptom4, duration, appetite_loss, vomiting, 
                               diarrhea, coughing, labored_breathing, lameness, 
                               skin_lesions, nasal_discharge, eye_discharge, 
                               body_temperature, heart_rate, animal_type):
        """Prepare input features with all medical calculations"""
        
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
        
        # Species-specific vital sign analysis
        normal_ranges = {
            'Dog': {'temp': (38.0, 39.2), 'hr': (60, 160)},
            'Cat': {'temp': (38.1, 39.2), 'hr': (140, 220)},
            'Horse': {'temp': (37.2, 38.6), 'hr': (28, 44)},
            'Cow': {'temp': (38.0, 39.3), 'hr': (48, 84)},
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
        
        return input_data

# Global variables
predictor = None
breed_data = {}

def load_and_train_model():
    """Load data and train the model"""
    global predictor, breed_data
    
    print("Loading and training Animal Disease Prediction Model...")
    print("=" * 60)
    
    try:
        # Load and preprocess data
        df = pd.read_csv('cleaned_animal_disease_prediction.csv')
        
        # Load breed data
        breed_data = {}
        for animal in df['Animal_Type'].unique():
            breeds = df[df['Animal_Type'] == animal]['Breed'].unique().tolist()
            breed_data[animal] = sorted(breeds)
        
        print("📊 Loaded breeds from CSV:")
        for animal, breeds in breed_data.items():
            print(f"   {animal}: {len(breeds)} breeds")
        
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
        animal_counts = df['Animal_Type'].value_counts()
        print(f"Animals in dataset: {len(animal_counts)}")
        for animal, count in animal_counts.items():
            unique_diseases = df[df['Animal_Type'] == animal]['Disease_Prediction'].nunique()
            print(f"  {animal}: {count} samples, {unique_diseases} diseases")

        print("\n🎯 Creating animal-specific medical features...")

        # Create comprehensive medical features
        df = create_species_specific_features(df)
        
        # Train the model
        predictor = AnimalSpecificDiseasePredictor()
        predictor.fit(df)
        
        print("Model training completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error loading/training model: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_species_specific_features(df):
    """Create species-specific medical features"""
    normal_ranges = {
        'Dog': {'temp': (38.0, 39.2), 'hr': (60, 160)},
        'Cat': {'temp': (38.1, 39.2), 'hr': (140, 220)},
        'Horse': {'temp': (37.2, 38.6), 'hr': (28, 44)},
        'Cow': {'temp': (38.0, 39.3), 'hr': (48, 84)},
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
        
        ranges = normal_ranges.get(animal, {'temp': (38.0, 39.5), 'hr': (60, 120)})
        temp_range = ranges['temp']
        hr_range = ranges['hr']
        
        if temp > temp_range[1]:
            df.loc[idx, 'Temp_Abnormal'] = 1
            df.loc[idx, 'Fever_Severity'] = (temp - temp_range[1]) / 2.0
        elif temp < temp_range[0]:
            df.loc[idx, 'Temp_Abnormal'] = -1
            df.loc[idx, 'Fever_Severity'] = (temp_range[0] - temp) / 2.0
        
        if hr > hr_range[1]:
            df.loc[idx, 'HR_Abnormal'] = 1
            df.loc[idx, 'HR_Severity'] = (hr - hr_range[1]) / hr_range[1]
        elif hr < hr_range[0]:
            df.loc[idx, 'HR_Abnormal'] = -1
            df.loc[idx, 'HR_Severity'] = (hr_range[0] - hr) / hr_range[0]
    
    # Create comprehensive medical scoring systems
    df['Respiratory_Syndrome'] = (df['Coughing'] * 3 + df['Labored_Breathing'] * 4 + 
                                 df['Nasal_Discharge'] * 2 + df['Eye_Discharge'] * 1)
    df['GI_Syndrome'] = (df['Vomiting'] * 4 + df['Diarrhea'] * 3 + df['Appetite_Loss'] * 2)
    df['Systemic_Syndrome'] = (df['Temp_Abnormal'].abs() * 3 + df['Appetite_Loss'] * 2)
    df['Dermatological_Syndrome'] = df['Skin_Lesions'] * 3
    df['Neurological_Syndrome'] = df['Lameness'] * 3

    # Disease severity indicators
    df['Acute_Condition'] = (df['Duration'] <= 3).astype(int)
    df['Chronic_Condition'] = (df['Duration'] > 14).astype(int)

    # Multi-system involvement
    df['Multi_System_Disease'] = ((df['Respiratory_Syndrome'] > 2) + 
                                 (df['GI_Syndrome'] > 2) + 
                                 (df['Systemic_Syndrome'] > 2) + 
                                 (df['Neurological_Syndrome'] > 2) >= 2).astype(int)

    # Age and size risk factors
    df['Young_Animal'] = (df['Age'] < 2).astype(int)
    df['Senior_Animal'] = (df['Age'] > 8).astype(int)
    df['Small_Animal'] = (df['Weight'] < 30).astype(int)
    df['Large_Animal'] = (df['Weight'] > 200).astype(int)

    return df

def initialize_database():
    """Database is initialized via supabase_setup.sql - this function is kept for compatibility"""
    print("Using Supabase - run supabase_setup.sql in Supabase Dashboard to initialize database")
    return True

def initialize_database_old():
    """Old SQLite initialization - kept for reference only"""
    if False:  # Disabled - using Supabase now
        # Add sample veterinarians if none exist
        if False:
            sample_vets = [
                Veterinarian(
                    name="Dr. Rajesh Sharma",
                    specialization="Large Animal Medicine",
                    location="Village Center, Pune",
                    phone="+91 98765 43210",
                    email="rajesh.sharma@email.com",
                    experience_years=15,
                    rating=4.8
                ),
                Veterinarian(
                    name="Dr. Priya Patel",
                    specialization="Dairy Cattle Specialist",
                    location="Market Road, Pune",
                    phone="+91 87654 32109",
                    email="priya.patel@email.com",
                    experience_years=12,
                    rating=4.6
                ),
                Veterinarian(
                    name="Dr. Amit Kumar",
                    specialization="Poultry & Small Animals",
                    location="Hospital Road, Pune",
                    phone="+91 76543 21098",
                    email="amit.kumar@email.com",
                    experience_years=8,
                    rating=4.4
                )
            ]
            
            for vet in sample_vets:
                db.session.add(vet)
            
            db.session.commit()
            print("Sample veterinarians added to database")
        
        # Add sample diseases if none exist
        if Disease.query.count() == 0:
            sample_diseases = [
                Disease(
                    name="Bovine Respiratory Disease",
                    animal_types='["Cow", "Buffalo"]',
                    symptoms='["Coughing", "Nasal discharge", "Fever", "Labored breathing"]',
                    description="Common respiratory infection affecting cattle. Symptoms include coughing, nasal discharge, and fever.",
                    prevention="Proper ventilation, vaccination, quarantine of new animals",
                    treatment="Antibiotics, supportive care, isolation",
                    severity="medium"
                ),
                Disease(
                    name="Foot and Mouth Disease",
                    animal_types='["Cow", "Buffalo", "Goat", "Sheep", "Pig"]',
                    symptoms='["Fever", "Blisters", "Lameness", "Loss of appetite"]',
                    description="Highly contagious viral disease affecting cloven-hoofed animals.",
                    prevention="Vaccination, biosecurity measures, movement restrictions",
                    treatment="Supportive care, isolation, wound management",
                    severity="high"
                ),
                Disease(
                    name="Mastitis",
                    animal_types='["Cow", "Buffalo", "Goat"]',
                    symptoms='["Swelling", "Heat in udder", "Abnormal milk"]',
                    description="Inflammation of mammary gland, common in dairy animals.",
                    prevention="Proper milking hygiene, teat dipping, dry cow therapy",
                    treatment="Antibiotics, anti-inflammatory drugs, proper milking",
                    severity="medium"
                ),
                Disease(
                    name="Parvovirus",
                    animal_types='["Dog"]',
                    symptoms='["Vomiting", "Diarrhea", "Lethargy", "Loss of appetite"]',
                    description="Highly contagious viral infection affecting dogs, especially puppies.",
                    prevention="Vaccination, proper hygiene, isolation of infected animals",
                    treatment="Supportive care, IV fluids, anti-nausea medication",
                    severity="high"
                ),
                Disease(
                    name="Upper Respiratory Infection",
                    animal_types='["Cat"]',
                    symptoms='["Sneezing", "Eye discharge", "Nasal discharge", "Coughing"]',
                    description="Common respiratory infection in cats, often viral in nature.",
                    prevention="Vaccination, stress reduction, proper ventilation",
                    treatment="Supportive care, antibiotics if bacterial, eye drops",
                    severity="low"
                ),
                Disease(
                    name="Anthrax",
                    animal_types='["Cow", "Buffalo", "Goat", "Sheep", "Horse"]',
                    symptoms='["Sudden death", "Fever", "Swelling", "Difficulty breathing"]',
                    description="Serious bacterial infection that can cause sudden death.",
                    prevention="Annual vaccination, proper carcass disposal, quarantine",
                    treatment="Early antibiotic treatment, supportive care",
                    severity="high"
                )
            ]
            
            for disease in sample_diseases:
                db.session.add(disease)
            
            db.session.commit()
            print("Sample diseases added to database")
        
        # Add sample subsidies if none exist
        if Subsidy.query.count() == 0:
            from datetime import date, timedelta
            
            sample_subsidies = [
                Subsidy(
                    scheme_name="National Livestock Development Scheme",
                    scheme_type="livestock",
                    state="Maharashtra",
                    description="Financial assistance for livestock development and breeding programs",
                    eligibility="Small and marginal farmers with livestock",
                    subsidy_amount="Up to ₹50,000 per beneficiary",
                    application_deadline=date.today() + timedelta(days=90),
                    contact_info="District Animal Husbandry Office"
                ),
                Subsidy(
                    scheme_name="Dairy Development Scheme",
                    scheme_type="dairy",
                    state="Maharashtra",
                    description="Support for dairy farming and milk production enhancement",
                    eligibility="Dairy farmers and cooperatives",
                    subsidy_amount="₹25,000 - ₹1,00,000",
                    application_deadline=date.today() + timedelta(days=60),
                    contact_info="State Dairy Development Board"
                ),
                Subsidy(
                    scheme_name="Poultry Development Assistance",
                    scheme_type="poultry",
                    state="Karnataka",
                    description="Financial support for poultry farming and infrastructure",
                    eligibility="Farmers interested in poultry farming",
                    subsidy_amount="Up to ₹75,000",
                    application_deadline=date.today() + timedelta(days=120),
                    contact_info="Department of Animal Husbandry"
                ),
                Subsidy(
                    scheme_name="Goat Development Program",
                    scheme_type="livestock",
                    state="Tamil Nadu",
                    description="Support for goat rearing and breed improvement",
                    eligibility="Rural farmers with land for goat rearing",
                    subsidy_amount="₹15,000 - ₹40,000",
                    application_deadline=date.today() + timedelta(days=75),
                    contact_info="Tamil Nadu Animal Husbandry Department"
                )
            ]
            
            for subsidy in sample_subsidies:
                db.session.add(subsidy)
            
            db.session.commit()
            print("Sample subsidies added to database")

# Routes
@app.route('/')
def index():
    animals = list(breed_data.keys()) if breed_data else ['Dog', 'Cat', 'Cow', 'Horse']
    symptoms = [
        'Fever', 'Cough', 'Lethargy', 'Loss of appetite', 'Vomiting', 'Diarrhea',
        'Nasal discharge', 'Eye discharge', 'Labored breathing', 'Lameness',
        'Skin lesions', 'Swelling', 'Excessive drooling', 'Seizures'
    ]
    
    return render_template('index.html', animals=animals, symptoms=symptoms)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('user_type', 'farmer')
        
        # Check if user already exists
        existing_user, _ = User.get_by_email(email)
        if existing_user:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Email already registered'})
            flash('Email already registered', 'error')
            return redirect(url_for('register'))
        
        # Create new user
        user = User.create(
            email=email,
            password=password,
            name=name,
            user_type=user_type
        )
        
        if user:
            login_user(user)
            
            if request.is_json:
                return jsonify({'success': True, 'message': 'Registration successful'})
            
            flash('Registration successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Registration failed'})
            flash('Registration failed', 'error')
            return redirect(url_for('register'))
    
    return render_template('auth/register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        email = data.get('email')
        password = data.get('password')
        
        user, password_hash = User.get_by_email(email)
        
        if user and password_hash and bcrypt.check_password_hash(password_hash, password):
            login_user(user)
            
            if request.is_json:
                return jsonify({'success': True, 'message': 'Login successful'})
            
            flash('Login successful!', 'success')
            return redirect(url_for('dashboard'))
        else:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Invalid credentials'})
            
            flash('Invalid email or password', 'error')
    
    return render_template('auth/login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out', 'info')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    # Get user statistics
    animals = DB.get_user_animals(current_user.id)
    lands = DB.get_user_lands(current_user.id)
    predictions = DB.get_user_predictions(current_user.id)
    
    total_animals = len(animals)
    total_lands = len(lands)
    total_predictions = len(predictions)
    
    # Get recent animals (last 5)
    recent_animals = sorted(animals, key=lambda x: x.get('created_at', ''), reverse=True)[:5]
    
    # Get recent predictions (last 5)
    recent_predictions = predictions[:5]
    
    # Count sick animals
    sick_animals = len([a for a in animals if a.get('health_status') == 'sick'])
    
    stats = {
        'total_animals': total_animals,
        'total_lands': total_lands,
        'total_predictions': total_predictions,
        'sick_animals': sick_animals
    }
    
    return render_template('dashboard/main.html', 
                         stats=stats, 
                         recent_animals=recent_animals,
                         recent_predictions=recent_predictions)

@app.route('/animals')
@login_required
def animals():
    user_animals = DB.get_user_animals(current_user.id)
    return render_template('dashboard/animals.html', animals=user_animals)

@app.route('/add_animal', methods=['GET', 'POST'])
@login_required
def add_animal():
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        # Generate unique animal ID
        animals = DB.get_user_animals(current_user.id)
        animal_count = len(animals)
        animal_id = f"{data.get('animal_type')[0].upper()}{animal_count + 1:03d}"
        
        animal_data = {
            'animal_id': animal_id,
            'animal_type': data.get('animal_type'),
            'breed': data.get('breed'),
            'name': data.get('name', animal_id),
            'age': float(data.get('age')),
            'gender': data.get('gender'),
            'weight': float(data.get('weight')),
            'health_status': data.get('health_status', 'healthy')
        }
        
        result = DB.add_animal(current_user.id, animal_data)
        
        if result:
            if request.is_json:
                return jsonify({'success': True, 'message': 'Animal added successfully'})
            
            flash('Animal added successfully!', 'success')
            return redirect(url_for('animals'))
        else:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Failed to add animal'})
            flash('Failed to add animal', 'error')
            return redirect(url_for('add_animal'))
    
    animals = list(breed_data.keys()) if breed_data else []
    return render_template('dashboard/add_animal.html', animals=animals)

@app.route('/lands')
@login_required
def lands():
    user_lands = DB.get_user_lands(current_user.id)
    return render_template('dashboard/lands.html', lands=user_lands)

@app.route('/add_land', methods=['GET', 'POST'])
@login_required
def add_land():
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        land_data = {
            'land_name': data.get('land_name'),
            'size_acres': float(data.get('size_acres')),
            'location': data.get('location'),
            'soil_type': data.get('soil_type'),
            'crops_grown': data.get('crops_grown')
        }
        
        result = DB.add_land(current_user.id, land_data)
        
        if result:
            if request.is_json:
                return jsonify({'success': True, 'message': 'Farm land added successfully'})
            
            flash('Farm land added successfully!', 'success')
        else:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Failed to add land'})
            flash('Failed to add land', 'error')
        return redirect(url_for('lands'))
    
    return render_template('dashboard/add_land.html')

@app.route('/land/<int:land_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_land(land_id):
    land = DB.get_land(land_id, current_user.id)
    
    if not land:
        flash('Land not found', 'error')
        return redirect(url_for('lands'))
    
    if request.method == 'POST':
        data = {
            'land_name': request.form.get('land_name'),
            'size_acres': float(request.form.get('size_acres')),
            'location': request.form.get('location'),
            'soil_type': request.form.get('soil_type'),
            'crops_grown': request.form.get('crops_grown'),
            'irrigation_type': request.form.get('irrigation_type'),
            'notes': request.form.get('notes')
        }
        
        result = DB.update_land(land_id, current_user.id, data)
        
        if result:
            flash('Farm land updated successfully!', 'success')
            return redirect(url_for('lands'))
        else:
            flash('Failed to update land', 'error')
    
    return render_template('dashboard/edit_land.html', land=land)

@app.route('/land/<int:land_id>/analytics')
@login_required
def land_analytics(land_id):
    land = DB.get_land(land_id, current_user.id)
    
    if not land:
        flash('Land not found', 'error')
        return redirect(url_for('lands'))
    
    return render_template('dashboard/land_analytics.html', land=land)

@app.route('/profile')
@login_required
def profile():
    return render_template('dashboard/profile.html', user=current_user)

@app.route('/update_profile', methods=['POST'])
@login_required
def update_profile():
    data = request.get_json() if request.is_json else request.form
    
    try:
        update_data = {
            'name': data.get('name', current_user.name),
            'farm_name': data.get('farm_name', current_user.farm_name),
            'location': data.get('location', current_user.location),
            'phone': data.get('phone', current_user.phone)
        }
        
        supabase.table('users').update(update_data).eq('id', current_user.id).execute()
        
        # Update current_user object
        current_user.name = update_data['name']
        current_user.farm_name = update_data['farm_name']
        current_user.location = update_data['location']
        current_user.phone = update_data['phone']
        
        if request.is_json:
            return jsonify({'success': True, 'message': 'Profile updated successfully'})
        
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('profile'))
    except Exception as e:
        print(f"Error updating profile: {e}")
        if request.is_json:
            return jsonify({'success': False, 'message': 'Failed to update profile'})
        flash('Failed to update profile', 'error')
        return redirect(url_for('profile'))

@app.route('/veterinarians')
def veterinarians():
    vets = DB.get_all_veterinarians()
    return render_template('veterinarians.html', veterinarians=vets)

@app.route('/predict', methods=['POST'])
def predict():
    if not predictor:
        return render_template('result.html', 
                             error="Model not loaded. Please check if the data file exists and try again.",
                             form_data=request.form)
    
    try:
        # Get form data
        animal_type = request.form['animal_type']
        breed = request.form['breed']
        age = float(request.form['age'])
        gender = request.form['gender']
        weight = float(request.form['weight'])
        symptom1 = request.form['symptom1']
        symptom2 = request.form['symptom2']
        symptom3 = request.form['symptom3']
        symptom4 = request.form['symptom4']
        duration = float(request.form['duration'])
        appetite_loss = request.form.get('appetite_loss', 'no')
        vomiting = request.form.get('vomiting', 'no')
        diarrhea = request.form.get('diarrhea', 'no')
        coughing = request.form.get('coughing', 'no')
        labored_breathing = request.form.get('labored_breathing', 'no')
        lameness = request.form.get('lameness', 'no')
        skin_lesions = request.form.get('skin_lesions', 'no')
        nasal_discharge = request.form.get('nasal_discharge', 'no')
        eye_discharge = request.form.get('eye_discharge', 'no')
        body_temperature = float(request.form['body_temperature'])
        heart_rate = float(request.form['heart_rate'])
        
        print(f"🎯 Making prediction for {animal_type}...")
        
        # Make prediction using the trained model
        raw_result = predictor.predict_disease(
            animal_type=animal_type,
            breed=breed,
            age=age,
            gender=gender,
            weight=weight,
            symptom1=symptom1,
            symptom2=symptom2,
            symptom3=symptom3,
            symptom4=symptom4,
            duration=duration,
            appetite_loss=appetite_loss,
            vomiting=vomiting,
            diarrhea=diarrhea,
            coughing=coughing,
            labored_breathing=labored_breathing,
            lameness=lameness,
            skin_lesions=skin_lesions,
            nasal_discharge=nasal_discharge,
            eye_discharge=eye_discharge,
            body_temperature=body_temperature,
            heart_rate=heart_rate
        )
        
        print(f"Raw prediction result received")
        
        # Save prediction if user is logged in
        if current_user.is_authenticated:
            DB.add_prediction(
                user_id=current_user.id,
                animal_id=None,
                prediction_data=request.form.to_dict(),
                result=raw_result,
                confidence=raw_result.get('confidence', 0)
            )
        
        return render_template('result.html', result=raw_result, form_data=request.form)
    
    except Exception as e:
        error_msg = f"Prediction error: {str(e)}"
        print(f"❌ {error_msg}")
        return render_template('result.html', error=error_msg, form_data=request.form)

@app.route('/get_breeds/<animal_type>')
def get_breeds(animal_type):
    breeds = breed_data.get(animal_type, [])
    return jsonify(breeds)

@app.route('/model_status')
def model_status():
    """Endpoint to check model status"""
    status = {
        'model_loaded': predictor is not None,
        'available_animals': list(breed_data.keys()) if breed_data else [],
    }
    
    if predictor:
        status['trained_animals'] = list(predictor.animal_models.keys())
        animal_details = {}
        for animal in predictor.animal_models.keys():
            model_info = predictor.animal_models[animal]
            if model_info['type'] == 'single_disease':
                animal_details[animal] = {
                    'type': 'single_disease',
                    'disease': model_info['disease']
                }
            else:
                if animal in predictor.animal_encoders:
                    diseases = list(predictor.animal_encoders[animal].classes_)
                    animal_details[animal] = {
                        'type': 'ensemble',
                        'disease_count': len(diseases),
                        'diseases': diseases[:5]
                    }
        status['animal_details'] = animal_details
    
    return jsonify(status)

@app.route('/animal/<int:animal_id>')
@login_required
def animal_detail(animal_id):
    """View detailed information about a specific animal"""
    animal = DB.get_animal(animal_id, current_user.id)
    
    if not animal:
        flash('Animal not found', 'error')
        return redirect(url_for('animals'))
    
    # Get animal's prediction history
    predictions = DB.get_animal_predictions(animal_id)
    
    # Get vaccination records
    vaccinations = DB.get_animal_vaccinations(animal_id)
    
    return render_template('dashboard/animal_detail.html', 
                         animal=animal, 
                         predictions=predictions,
                         vaccinations=vaccinations)

@app.route('/animal/<int:animal_id>/edit', methods=['GET', 'POST'])
@login_required
def edit_animal(animal_id):
    """Edit animal information"""
    animal = DB.get_animal(animal_id, current_user.id)
    
    if not animal:
        flash('Animal not found', 'error')
        return redirect(url_for('animals'))
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        update_data = {
            'name': data.get('name', animal.get('name')),
            'age': float(data.get('age', animal.get('age'))),
            'weight': float(data.get('weight', animal.get('weight'))),
            'health_status': data.get('health_status', animal.get('health_status'))
        }
        
        updated_animal = DB.update_animal(animal_id, current_user.id, update_data)
        
        if updated_animal:
            if request.is_json:
                return jsonify({'success': True, 'message': 'Animal updated successfully'})
            
            flash('Animal updated successfully!', 'success')
            return redirect(url_for('animal_detail', animal_id=animal_id))
        else:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Failed to update animal'})
            
            flash('Failed to update animal', 'error')
            return redirect(url_for('edit_animal', animal_id=animal_id))
    
    animals = list(breed_data.keys()) if breed_data else []
    return render_template('dashboard/edit_animal.html', animal=animal, animals=animals)

@app.route('/animal/<int:animal_id>/predict', methods=['GET', 'POST'])
@login_required
def predict_for_animal(animal_id):
    """Run disease prediction for a specific animal"""
    animal = DB.get_animal(animal_id, current_user.id)
    
    if not animal:
        flash('Animal not found', 'error')
        return redirect(url_for('animals'))
    
    if request.method == 'POST':
        if not predictor:
            return jsonify({'error': 'Model not loaded'}), 500
        
        try:
            data = request.get_json() if request.is_json else request.form
            
            # Use animal's existing data as defaults
            result = predictor.predict_disease(
                animal_type=animal.get('animal_type'),
                breed=animal.get('breed'),
                age=animal.get('age'),
                gender=animal.get('gender'),
                weight=animal.get('weight'),
                symptom1=data.get('symptom1'),
                symptom2=data.get('symptom2'),
                symptom3=data.get('symptom3'),
                symptom4=data.get('symptom4'),
                duration=float(data.get('duration', 1)),
                appetite_loss=data.get('appetite_loss', 'no'),
                vomiting=data.get('vomiting', 'no'),
                diarrhea=data.get('diarrhea', 'no'),
                coughing=data.get('coughing', 'no'),
                labored_breathing=data.get('labored_breathing', 'no'),
                lameness=data.get('lameness', 'no'),
                skin_lesions=data.get('skin_lesions', 'no'),
                nasal_discharge=data.get('nasal_discharge', 'no'),
                eye_discharge=data.get('eye_discharge', 'no'),
                body_temperature=float(data.get('body_temperature', 38.5)),
                heart_rate=float(data.get('heart_rate', 80))
            )
            
            # Save prediction linked to this animal
            DB.add_prediction(
                user_id=current_user.id,
                animal_id=animal_id,
                prediction_data=data,
                result=result,
                confidence=result.get('confidence', 0)
            )
            
            if request.is_json:
                return jsonify({'success': True, 'result': result})
            
            return render_template('result.html', result=result, animal=animal)
            
        except Exception as e:
            if request.is_json:
                return jsonify({'error': str(e)}), 500
            return render_template('result.html', error=str(e), animal=animal)
    
    # GET request - show prediction form
    symptoms = [
        'Fever', 'Cough', 'Lethargy', 'Loss of appetite', 'Vomiting', 'Diarrhea',
        'Nasal discharge', 'Eye discharge', 'Labored breathing', 'Lameness',
        'Skin lesions', 'Swelling', 'Excessive drooling', 'Seizures'
    ]
    
    return render_template('dashboard/animal_predict.html', animal=animal, symptoms=symptoms)

@app.route('/animal/<int:animal_id>/vaccinations')
@login_required
def animal_vaccinations(animal_id):
    """View vaccination records for an animal"""
    animal = DB.get_animal(animal_id, current_user.id)
    
    if not animal:
        flash('Animal not found', 'error')
        return redirect(url_for('animals'))
    
    vaccinations = DB.get_animal_vaccinations(animal_id)
    
    return render_template('dashboard/vaccinations.html', animal=animal, vaccinations=vaccinations)

@app.route('/animal/<int:animal_id>/add_vaccination', methods=['GET', 'POST'])
@login_required
def add_vaccination(animal_id):
    """Add vaccination record for an animal"""
    animal = DB.get_animal(animal_id, current_user.id)
    
    if not animal:
        flash('Animal not found', 'error')
        return redirect(url_for('animals'))
    
    if request.method == 'POST':
        data = request.get_json() if request.is_json else request.form
        
        from datetime import datetime, timedelta
        vaccination_date = data.get('vaccination_date')
        
        # Calculate next due date (default 1 year later)
        if data.get('next_due_date'):
            next_due_date = data.get('next_due_date')
        else:
            # Add 365 days to vaccination date
            vac_date = datetime.strptime(vaccination_date, '%Y-%m-%d')
            next_due_date = (vac_date + timedelta(days=365)).strftime('%Y-%m-%d')
        
        vaccination_data = {
            'vaccine_name': data.get('vaccine_name'),
            'vaccination_date': vaccination_date,
            'next_due_date': next_due_date,
            'veterinarian': data.get('veterinarian'),
            'notes': data.get('notes')
        }
        
        result = DB.add_vaccination(animal_id, vaccination_data)
        
        if result:
            if request.is_json:
                return jsonify({'success': True, 'message': 'Vaccination record added successfully'})
            
            flash('Vaccination record added successfully!', 'success')
        else:
            if request.is_json:
                return jsonify({'success': False, 'message': 'Failed to add vaccination record'})
            
            flash('Failed to add vaccination record', 'error')
        return redirect(url_for('animal_vaccinations', animal_id=animal_id))
    
    return render_template('dashboard/add_vaccination.html', animal=animal)

@app.route('/api/dashboard_data')
@login_required
def dashboard_data():
    """API endpoint for dashboard data"""
    # Get health trends (last 30 days of predictions)
    from datetime import datetime, timedelta
    from dateutil import parser
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    
    predictions = DB.get_user_predictions(current_user.id)
    
    health_trends = []
    for prediction in predictions:
        try:
            # Parse the created_at string to datetime
            created_at = parser.parse(prediction.get('created_at'))
            if created_at >= thirty_days_ago:
                health_trends.append({
                    'date': created_at.strftime('%m/%d'),
                    'confidence': prediction.get('confidence', 0)
                })
        except:
            pass
    
    # Get animal distribution
    animals = DB.get_user_animals(current_user.id)
    animal_types = {}
    for animal in animals:
        animal_types[animal.get('animal_type')] = animal_types.get(animal.get('animal_type'), 0) + 1
    
    animal_distribution = [
        {'type': animal_type, 'count': count}
        for animal_type, count in animal_types.items()
    ]
    
    # Get upcoming vaccinations (next 30 days)
    # For now, return 0 as we need to implement a more complex query
    # or iterate through all animals and their vaccinations
    upcoming_vaccinations = 0
    animals = DB.get_user_animals(current_user.id)
    thirty_days_later = datetime.utcnow().date() + timedelta(days=30)
    today = datetime.utcnow().date()
    
    for animal in animals:
        vaccinations = DB.get_animal_vaccinations(animal.get('id'))
        for vacc in vaccinations:
            next_due = vacc.get('next_due_date')
            if next_due:
                try:
                    next_due_date = parser.parse(next_due).date()
                    if today <= next_due_date <= thirty_days_later:
                        upcoming_vaccinations += 1
                except:
                    pass
    
    return jsonify({
        'health_trends': health_trends,
        'animal_distribution': animal_distribution,
        'upcoming_vaccinations': upcoming_vaccinations
    })

@app.route('/knowledge_base')
def knowledge_base():
    """Knowledge base with disease information"""
    diseases = DB.get_all_diseases()
    return render_template('knowledge_base.html', diseases=diseases)

@app.route('/subsidies')
def subsidies():
    """Government subsidies and schemes"""
    subsidies = DB.get_all_subsidies()
    return render_template('subsidies.html', subsidies=subsidies)

@app.route('/set_language/<language>')
def set_language(language):
    """Set user language preference"""
    if language in LANGUAGES:
        session['language'] = language
    return redirect(request.referrer or url_for('index'))



# Additional routes for enhanced functionality

# Voice prediction route (simulated)
@app.route('/voice_predict', methods=['POST'])
def voice_predict():
    # This would integrate with speech recognition in a real implementation
    transcript = request.form.get('transcript', '')
    
    # Simple keyword-based analysis for demo
    symptoms = []
    if 'cough' in transcript.lower():
        symptoms.append('Coughing')
    if 'fever' in transcript.lower():
        symptoms.append('Fever')
    if 'tired' in transcript.lower() or 'weak' in transcript.lower():
        symptoms.append('Lethargy')
    
    return jsonify({
        'transcript': transcript,
        'detected_symptoms': symptoms,
        'confidence': 0.85,
        'recommendation': 'Based on voice analysis, consider veterinary consultation.'
    })

# Offline page route
@app.route('/offline.html')
def offline():
    return render_template('offline.html')

# Service Worker route
@app.route('/sw.js')
def service_worker():
    return app.send_static_file('sw.js')

# File upload route for images
@app.route('/upload_image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # In a real implementation, this would process the image with AI
    # For now, return a simulated response
    return jsonify({
        'analysis': 'Image analysis complete',
        'detected_issues': ['Possible skin condition', 'Monitor for changes'],
        'confidence': 0.78,
        'recommendation': 'Consult veterinarian for proper diagnosis'
    })

if __name__ == '__main__':
    # Initialize everything
    success = load_and_train_model()
    initialize_database()
    
    if success:
        print("\nStarting PashuCare Complete System...")
        print(f"Available animals: {list(predictor.animal_models.keys())}")
        print("Server running on http://localhost:5000")
        print("Visit /model_status to see detailed model information")
        print("Register an account to access full features!")
    else:
        print("\nStarting server in limited mode (model not loaded)")
        print("Server running on http://localhost:5000")
    
    app.run(debug=True, host='0.0.0.0', port=5000)