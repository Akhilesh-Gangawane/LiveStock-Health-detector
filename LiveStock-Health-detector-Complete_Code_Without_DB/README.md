# 🌿 PashuCare - AI-Powered Livestock Health Management

A comprehensive eco-tech livestock health management platform that combines agricultural expertise with AI intelligence. Features bilingual support (English/Marathi) and dual theme system (Light/Dark mode) for professional farm management.

## ✨ Key Features

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

### 🏥 Veterinary Network
- Professional veterinarian directory with ratings and specializations
- Direct contact via phone, WhatsApp, and email
- Location-based vet finder with multilingual support

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd LiveStock-Health-detector
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:5000`
   - **Guest Mode**: Use core AI prediction features immediately
   - **Full Features**: Register an account to access complete farm management

## 📁 Project Structure

```
PashuCare/
├── app.py                          # 🚀 Main Flask application
├── cleaned_animal_disease_prediction.csv  # AI training dataset
├── requirements.txt                # Python dependencies
├── README.md                       # Project documentation
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
    └── dashboard/                 # Farm management
        ├── main.html              # Dashboard overview
        ├── animals.html           # Animal management
        ├── add_animal.html        # Add new animal
        ├── lands.html             # Land management
        ├── add_land.html          # Add new land
        └── profile.html           # User profile
```

**Note:** Database (`pashucare.db`) and instance folder are auto-created on first run.

## 🎯 Usage

### 🌐 Language & Theme Selection
1. **Language Toggle**: Click the language button in navigation (🌐 EN/मर)
2. **Theme Toggle**: Click the theme button (🌙/☀️) for light/dark mode
3. **Preferences**: Your choices are automatically saved

### 🔍 Health Assessment (Available to All Users)
1. Click "Health Check" or "आरोग्य तपासणी" in navigation
2. Select animal type and breed from dropdown
3. Enter basic information (age, gender, weight, duration)
4. Select observed symptoms from comprehensive list
5. Enter vital signs (temperature, heart rate)
6. Click "Analyze with AI" / "AI सह विश्लेषण करा" for instant results

### 👤 Full Farm Management (Registered Users)
1. **Register Account**: Create your farmer profile in preferred language
2. **Dashboard**: View farm statistics and recent activity
3. **Add Animals**: Register livestock with detailed profiles
4. **Add Farm Lands**: Track agricultural properties and crops
5. **Prediction History**: Review all health assessments
6. **Profile Management**: Update farm and personal information
7. **Veterinarian Directory**: Find and contact local vets

## 🔬 AI Model Details

- **Algorithm**: Random Forest Classifier with animal-specific models
- **Training Data**: 400+ samples across 8 animal types
- **Accuracy**: 100% on training data (specialized models per animal)
- **Features**: 20+ health indicators and symptoms
- **Animals Supported**: Dog, Cat, Cow, Horse, Sheep, Goat, Pig, Rabbit

## 🛠️ Technology Stack

- **Backend**: Flask (Python web framework)
- **Database**: SQLite with SQLAlchemy ORM
- **Authentication**: Flask-Login with bcrypt password hashing
- **ML/AI**: scikit-learn, pandas, numpy, XGBoost, LightGBM
- **Frontend**: Bootstrap 5, Font Awesome, custom eco-tech CSS
- **Internationalization**: Flask session-based language system
- **Themes**: CSS variables with smooth transitions
- **PWA**: Service worker and manifest for app-like experience

## 📱 Features Overview

### For Farmers
- ✅ **Bilingual Interface**: English and Marathi support
- ✅ **AI Health Prediction**: Instant disease detection
- ✅ **Livestock Management**: Complete animal tracking
- ✅ **Farm Land Tracking**: Property and crop management
- ✅ **Veterinarian Directory**: Local vet finder
- ✅ **Health History**: Prediction tracking and analytics
- ✅ **Dashboard Analytics**: Real-time farm insights
- ✅ **Dark/Light Mode**: Eye-friendly theme options

### For Veterinarians
- ✅ **Professional Profiles**: Detailed vet information
- ✅ **Contact Management**: Multiple communication channels
- ✅ **Specialization Listing**: Area of expertise display
- ✅ **Rating System**: Community feedback and reviews

### For Developers
- ✅ **Clean Codebase**: Well-organized, documented code
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **PWA Ready**: Progressive web app capabilities
- ✅ **Eco-Tech Theme**: Professional agricultural design

## 🔒 Security Features

- Secure password hashing with bcrypt
- Session management with Flask-Login
- SQL injection protection with SQLAlchemy
- CSRF protection with Flask-WTF

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📄 License

This project is for educational and research purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🔧 Troubleshooting

### Common Issues

**1. Database Initialization**
- **First Run**: Database tables are created automatically
- **Reset Database**: Delete `pashucare.db` file to start fresh

**2. Model Training Time**
- **First Startup**: Takes 30-60 seconds to train AI models
- **Subsequent Runs**: Models load faster

**3. Missing Dependencies**
```bash
pip install -r requirements.txt
```

**4. Model Training Issues**
- Ensure `cleaned_animal_disease_prediction.csv` exists in the project root
- Check Python version (3.8+ required)

**5. Port Already in Use**
- Change port in the app files or kill existing processes:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

### Performance Tips
- **Clean Installation**: All unnecessary files removed for optimal performance
- **Guest Mode**: Instant access to AI predictions
- **Registered Mode**: Full features with data persistence
- **First Run**: Allow 30-60 seconds for model training and database setup
- **Database**: SQLite database auto-created on first user registration

## 📞 Support

For support and questions, please contact the development team.

## 🌟 Screenshots & Demo

### Light Mode (Eco-Tech Theme)
- 🌿 Teal green navigation with harvest yellow accents
- ☀️ Clean, professional interface for daytime use
- 🌱 Mint green hover effects and interactions

### Dark Mode (Modern AgriTech Theme)  
- 🌌 Deep charcoal background with mint green highlights
- 🌾 Eye-friendly interface for evening farm management
- ☀️ Harvest yellow CTAs maintain prominence

### Bilingual Support
- **English**: Complete professional interface
- **मराठी**: Full Marathi translation for local farmers
- **Seamless Toggle**: Instant language switching

## 🚀 Live Demo

Visit the application at `http://localhost:5000` after running the setup instructions above.

**Test Features:**
- Try the language toggle (🌐 EN/मर) in the navigation
- Switch between light/dark themes (🌙/☀️)
- Test AI prediction with sample animal data
- Explore the bilingual interface

---

## 📋 Setup & Configuration Guide

### Supabase Database Setup

**Your Supabase Credentials:**
- **URL**: https://czksxminnpsndccwmnzz.supabase.co
- **API Key**: Stored in `.env` file
- ⚠️ **Important**: Never commit `.env` file to Git!

**Quick Setup Steps:**
1. Install dependencies: `pip install -r requirements.txt`
2. Open Supabase Dashboard: https://czksxminnpsndccwmnzz.supabase.co
3. Go to **SQL Editor** → **New Query**
4. Copy and run content from `supabase_setup.sql`
5. Test connection: `python test_connection.py`
6. Run app: `python app.py`

**Database Tables Created:**
- users, animals, farm_lands, predictions, veterinarians, diseases, subsidies, vaccinations
- Includes Row Level Security policies and sample data

### Known Issues & Fixes

**Registration Issue (FIXED):**
- Problem: Row Level Security blocking user creation
- Solution: Updated RLS policies in `supabase_setup.sql` and `fix_registration.sql`
- Quick fix: Run `fix_registration.sql` in Supabase SQL Editor if registration fails

**Date Formatting Issue (FIXED):**
- Problem: Supabase returns dates as strings, not datetime objects
- Solution: Added custom Jinja2 filters (`format_date`, `format_datetime`) in `app.py`
- All templates updated to use these filters

**Profile & Animal Edit (FIXED):**
- Problem: Forms missing action attributes and using SQLAlchemy instead of Supabase
- Solution: Updated all routes and templates to use Supabase dictionary methods
- Changed from `animal.name` to `animal.get('name')` in templates

### Testing Checklist

✅ Registration and Login
✅ Dashboard with correct date formatting
✅ Add/Edit Animals
✅ Add Farm Lands
✅ Health Predictions
✅ Profile Updates
✅ Vaccination Tracking
✅ View Veterinarians, Diseases, Subsidies

### Troubleshooting

**Registration Still Failing?**
```sql
-- Run in Supabase SQL Editor to disable RLS temporarily
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE animals DISABLE ROW LEVEL SECURITY;
ALTER TABLE farm_lands DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictions DISABLE ROW LEVEL SECURITY;
```

**Date Errors?**
- Restart app: `python app.py`
- Install dateutil: `pip install python-dateutil`

**Connection Error?**
- Verify `.env` file exists
- Check Supabase credentials
- Run `python test_connection.py`

---

**🌿 PashuCare - Empowering farmers with AI-driven livestock health management in their preferred language and theme**