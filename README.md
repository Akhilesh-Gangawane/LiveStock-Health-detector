# 🌿 PashuCare - AI-Powered Livestock Health Management

A comprehensive eco-tech livestock health management platform that combines agricultural expertise with AI intelligence. Features bilingual support (English/Marathi) and dual theme system (Light/Dark mode) for professional farm management.

---

## 📋 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database Setup](#database-setup)
- [Veterinarian Feature](#veterinarian-feature)
- [Usage Guide](#usage-guide)
- [Technology Stack](#technology-stack)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [System Architecture](#system-architecture)

---

## ✨ Features

### 🤖 AI-Powered Health Detection
- Advanced machine learning models for disease prediction
- Animal-specific disease analysis (8 animal types supported)
- Symptom-based health assessment with 100% training accuracy
- Comprehensive vital signs analysis and syndrome scoring

### 🌐 Bilingual Support
- **English**: Complete interface in English
- **मराठी (Marathi)**: Full Marathi translation for local farmers
- **Language Toggle**: Seamless switching between languages
- **Persistent Choice**: Language preference saved automatically

### 🎨 Dual Theme System
- **🌿 Light Mode**: Eco-tech harmony with teal green and harvest yellow
- **🌌 Dark Mode**: Modern AgriTech with mint green and deep charcoal
- **Smart Toggle**: Instant theme switching with smooth animations
- **Eye Comfort**: Dark mode optimized for evening use

### 👨‍🌾 Complete Farm Management
- **User Accounts**: Secure registration and authentication system
- **Animal Management**: Add, track, and manage livestock records
- **Farm Land Management**: Register and monitor farm properties
- **Dashboard**: Real-time statistics and farm overview
- **Prediction History**: Track all health assessments and results

### 🩺 Veterinary Features
- **Vet Portal**: Dedicated dashboard for veterinarians
- **Animal Lookup**: Search by ID, name, or type
- **Vaccination Management**: Track vaccines, doses, and schedules
- **Diagnosis System**: Record diseases, treatments, and outcomes
- **Statistics**: Track animals treated, vaccinations given, diagnoses made

### 🏥 Veterinary Network
- Professional veterinarian directory with ratings and specializations
- Direct contact via phone, WhatsApp, and email
- Location-based vet finder with multilingual support

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd PashuCare
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   Create `.env` file:
   ```env
   SECRET_KEY=your-secret-key-here
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key-here
   ```

4. **Initialize Database**
   - Open Supabase Dashboard
   - Go to SQL Editor → New Query
   - Copy and run content from `database_setup.sql`

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   - Open your browser and go to `http://localhost:5000`
   - **Guest Mode**: Use core AI prediction features immediately
   - **Full Features**: Register an account to access complete farm management

---

## 📁 Project Structure

```
PashuCare/
├── app.py                          # Main Flask application
├── cleaned_animal_disease_prediction.csv  # AI training dataset
├── requirements.txt                # Python dependencies
├── README.md                       # This file
├── database_setup.sql              # Complete database schema
├── static/
│   ├── style.css                  # Eco-tech theme CSS with dark mode
│   ├── scripts.js                 # Enhanced JavaScript functionality
│   ├── manifest.json              # PWA manifest
│   ├── sw.js                      # Service worker
│   └── favicon.ico                # App icon
└── templates/
    ├── layout.html                # Base template with theme toggle
    ├── index.html                 # Main prediction page
    ├── result.html                # AI prediction results
    ├── knowledge_base.html        # Disease information
    ├── subsidies.html             # Government schemes
    ├── veterinarians.html         # Vet directory
    ├── offline.html               # Offline page
    ├── auth/                      # Authentication pages
    │   ├── login.html
    │   └── register.html
    ├── dashboard/                 # Farm management
    │   ├── main.html              # Dashboard overview
    │   ├── animals.html           # Animal management
    │   ├── add_animal.html        # Add new animal
    │   ├── lands.html             # Land management
    │   ├── add_land.html          # Add new land
    │   └── profile.html           # User profile
    └── vet/                       # Veterinarian portal
        ├── dashboard.html         # Vet dashboard
        ├── animal_detail.html     # Animal profile
        ├── search.html            # Animal search
        └── vaccinations_list.html # Vaccination records
```

---

## 🗄️ Database Setup

### Quick Setup (5 minutes)

1. **Open Supabase Dashboard**: https://your-project.supabase.co
2. **Go to SQL Editor** → New Query
3. **Copy content** from `database_setup.sql`
4. **Click Run** and wait for success message
5. **Verify**: Check that all tables are created

### Database Tables

**Core Tables:**
- `users` - User accounts (farmers and veterinarians)
- `animals` - Livestock records
- `farm_lands` - Farm property records
- `predictions` - AI prediction history

**Veterinary Tables:**
- `vaccinations` - Vaccination records with vet attribution
- `diseases` - Disease reference database (10 pre-loaded)
- `animal_diseases` - Diagnosis records
- `vet_appointments` - Appointment scheduling

**Additional Tables:**
- `veterinarians` - Vet directory
- `subsidies` - Government schemes

### Sample Credentials

**Veterinarian Account:**
```
Email: dr.sharma@pashucare.com
Password: VetPass123!
```

**Farmer Account:**
```
Email: farmer.patil@pashucare.com
Password: FarmerPass123!
```

---

## 🩺 Veterinarian Feature

### Overview
Complete veterinarian portal with animal lookup, vaccination management, and disease diagnosis capabilities.

### Key Features

**1. Vet Dashboard** (`/vet/dashboard`)
- Statistics: Animals treated, vaccinations given, diagnoses made
- Quick animal search
- Recent activity feed
- Access to all vet features

**2. Animal Lookup** (`/vet/animal/search`)
- Search by Animal ID (exact match)
- Search by Name (partial match)
- Search by Type (species filter)
- View complete animal profile with owner info

**3. Vaccination Management**
- Add vaccination records (vaccine, dose, batch number, dates)
- Edit/delete own records
- Track due dates
- View complete vaccination history

**4. Diagnosis System**
- Select disease from database
- Auto-fill recommended treatment
- Set severity and status
- Track symptoms and outcomes
- Update diagnosis status
- Schedule follow-ups

### Access Control
- **Veterinarians**: Full access to vet portal
- **Farmers**: Can view their animals' records
- **Role-based routing**: Automatic dashboard selection
- **Row Level Security**: Database-level access control

### API Endpoints

```
GET  /vet/dashboard              - Vet dashboard with stats
GET  /vet/animal/search          - Search form
POST /vet/animal/search          - Execute search
GET  /vet/animal/<id>            - Animal detail page
POST /vet/vaccinate              - Add vaccination
POST /vet/vaccinate/<id>/edit    - Edit vaccination
POST /vet/vaccinate/<id>/delete  - Delete vaccination
POST /vet/diagnose               - Add diagnosis
POST /vet/diagnose/<id>/update   - Update diagnosis
GET  /vet/vaccinations           - List all vaccinations
```

---

## 🎯 Usage Guide

### For Guest Users
1. **Health Check**: Use AI prediction without registration
2. **Browse**: View veterinarians, knowledge base, subsidies

### For Farmers
1. **Register Account**: Create farmer profile
2. **Add Animals**: Register livestock with details
3. **Add Farm Lands**: Track agricultural properties
4. **Run Health Checks**: AI-powered disease detection
5. **Track Vaccinations**: View vaccination schedules
6. **View Dashboard**: Monitor farm statistics

### For Veterinarians
1. **Login**: Use vet credentials
2. **Search Animals**: Find by ID, name, or type
3. **View Profile**: See complete animal and owner info
4. **Add Vaccinations**: Record vaccines with details
5. **Add Diagnoses**: Select disease and document treatment
6. **Track Work**: View statistics and history

### Language & Theme
- **Language Toggle**: Click 🌐 button (EN/मर)
- **Theme Toggle**: Click theme button (🌙/☀️)
- **Preferences**: Automatically saved

---

## 🛠️ Technology Stack

### Backend
- **Flask 3.0.0** - Web framework
- **Flask-Login 0.6.3** - User session management
- **Flask-Bcrypt 1.0.1** - Password hashing
- **Supabase 2.24.0+** - Cloud database
- **python-dotenv 1.0.0** - Environment variables

### Machine Learning
- **scikit-learn 1.3.0** - ML algorithms
- **XGBoost 1.7.6** - Gradient boosting
- **LightGBM 4.0.0** - Light gradient boosting
- **pandas 2.0.3** - Data manipulation
- **numpy 1.24.3** - Numerical computing

### Frontend
- **Bootstrap 5** - UI framework
- **Font Awesome** - Icons
- **Custom CSS** - Eco-tech theme
- **Vanilla JavaScript** - Interactivity

---

## 🔒 Security

### Authentication
- Bcrypt password hashing (cost factor: 12)
- Session-based authentication with Flask-Login
- Secure session cookies
- CSRF protection

### Authorization
- Role-based access control (RBAC)
- Route-level protection with decorators
- Resource ownership validation
- Supabase Row Level Security (RLS)

### Database Security
- SQL injection protection
- Parameterized queries
- Foreign key constraints
- Data integrity checks

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
- Verify `.env` file exists with correct credentials
- Check Supabase URL and API key
- Ensure database tables are created

**2. Registration Failure**
- Run `database_setup.sql` to fix RLS policies
- Check Supabase dashboard for errors
- Verify email is unique

**3. Redirect Loop (Vet Login)**
- Clear browser cookies
- Restart Flask app
- Verify user_type in database:
  ```sql
  UPDATE users SET user_type = 'veterinarian' 
  WHERE email = 'dr.sharma@pashucare.com';
  ```

**4. Model Training Time**
- First startup takes 30-60 seconds
- Subsequent runs are faster
- Ensure CSV file exists

**5. Port Already in Use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**6. Vaccination/Diagnosis Not Showing**
- Check RLS policies are enabled
- Verify foreign key relationships
- Ensure user is logged in as vet

**7. Search Returns No Results**
- Add animals via farmer account first
- Check animal exists in database
- Verify search query format

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER LAYER                            │
├──────────────────────┬──────────────────────────────────────┤
│   👨‍🌾 FARMER          │   👨‍⚕️ VETERINARIAN                   │
│   - Register animals │   - Search animals                   │
│   - View records     │   - Add vaccinations                 │
│   - Track health     │   - Add diagnoses                    │
│   - Contact vets     │   - Update treatments                │
└──────────────────────┴──────────────────────────────────────┘
           │                           │
           ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    FLASK APPLICATION                         │
├─────────────────────────────────────────────────────────────┤
│  Authentication Layer (Flask-Login + Bcrypt)                │
│  Route Layer (Farmer/Vet/Shared Routes)                     │
│  Business Logic Layer (DB Helper Class)                     │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│  Core Tables: users, animals, farm_lands                    │
│  Vet Tables: vaccinations, diseases, animal_diseases        │
│  Security: RLS, Foreign Keys, Indexes                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Vet Login Flow:**
```
User enters credentials → Flask validates → Check user_type
  → veterinarian: Redirect to /vet/dashboard
  → farmer: Redirect to /farmer/dashboard
```

**Add Vaccination Flow:**
```
Vet clicks "Add Vaccination" → Modal form opens → Vet fills form
  → Submit to /vet/vaccinate → Validate input
  → Insert into vaccinations table (with vet_id)
  → Redirect to animal detail → Show success message
```

---

## 📊 AI Model Details

- **Algorithm**: Random Forest Classifier with animal-specific models
- **Training Data**: 400+ samples across 8 animal types
- **Accuracy**: 100% on training data
- **Features**: 35+ health indicators and symptoms
- **Animals Supported**: Dog, Cat, Cow, Horse, Sheep, Goat, Pig, Rabbit
- **Prediction Time**: < 1 second

---

## 🔮 Future Enhancements

### Planned Features
1. **Appointment Scheduling** - Calendar view with reminders
2. **Prescription Management** - Digital prescriptions
3. **Analytics Dashboard** - Disease trends and insights
4. **Mobile App** - QR code scanning and offline mode
5. **Telemedicine** - Video consultations
6. **Image Analysis** - Upload photos for visual diagnosis
7. **IoT Integration** - Real-time sensor monitoring
8. **Blockchain** - Secure health records
9. **Multi-language** - Add Hindi, Tamil, Telugu
10. **Community Forum** - Farmer discussion platform

---

## 📄 License

This project is for educational and research purposes.

**Copyright © 2024 PashuCare**

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

For support and questions, please contact the development team.

---

## 🌟 Acknowledgments

- Flask Framework
- Supabase Database
- scikit-learn ML Library
- Bootstrap UI Framework
- Font Awesome Icons

---

**🌿 PashuCare - Empowering farmers with AI-driven livestock health management**

**Version:** 2.0  
**Last Updated:** December 2024  
**Status:** Production Ready ✅
