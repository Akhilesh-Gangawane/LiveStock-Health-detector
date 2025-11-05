# 🐾 FarmCare Pro - Livestock Health Management System

A comprehensive AI-powered livestock health management platform that helps farmers monitor, predict, and manage their animals' health with advanced machine learning capabilities.

## ✨ Complete All-in-One Features

### 🤖 AI-Powered Health Detection
- Advanced machine learning models for disease prediction
- Animal-specific disease analysis (8 animal types supported)
- Symptom-based health assessment with 100% training accuracy
- Comprehensive vital signs analysis and syndrome scoring

### 👨‍🌾 Complete Farm Management
- **User Accounts**: Secure registration and authentication system
- **Animal Management**: Add, track, and manage livestock records with health status
- **Farm Land Management**: Register and monitor farm properties with crop tracking
- **Dashboard**: Real-time statistics and farm overview
- **Prediction History**: Track all health assessments and results

### 🏥 Veterinary Network
- Professional veterinarian directory with ratings and specializations
- Direct contact via phone, WhatsApp, and email
- Location-based vet finder
- Emergency veterinary support information

### 📊 Analytics & Insights
- Real-time farm statistics and health metrics
- Animal health trends and patterns
- Prediction confidence scoring
- Comprehensive reporting system

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
   
   **Option 1: Interactive Startup (Recommended)**
   ```bash
   python start.py
   ```
   
   **Option 2: Direct Launch**
   ```bash
   python app.py
   ```

4. **Access the application**
   - Open your browser and go to `http://localhost:5000`
   - **Guest Mode**: Use core AI prediction features immediately
   - **Full Features**: Register an account to access complete farm management

## 📁 Clean Project Structure

```
LiveStock-Health-detector/
├── app.py                          # 🚀 Complete unified application
├── start.py                        # Interactive startup script
├── cleaned_animal_disease_prediction.csv  # Training dataset
├── requirements.txt                # Python dependencies
├── README.md                       # Documentation
├── static/
│   ├── style.css                  # Enhanced CSS styling
│   └── scripts.js                 # JavaScript functionality
└── templates/
    ├── layout.html                # Responsive base template
    ├── index.html                 # Main prediction page
    ├── result.html                # Results display
    ├── veterinarians.html         # Vet directory
    ├── auth/                      # Login/Register pages
    │   ├── login.html
    │   └── register.html
    └── dashboard/                 # Farm management pages
        ├── main.html              # Dashboard overview
        ├── animals.html           # Animal management
        ├── add_animal.html        # Add new animal
        ├── lands.html             # Land management
        ├── add_land.html          # Add new land
        └── profile.html           # User profile
```

**Note:** Database (`farmcare.db`) is auto-created on first run.

## 🎯 Usage

### 🔍 Health Assessment (Available to All Users)
1. Select animal type and breed from dropdown
2. Enter basic information (age, gender, weight, duration)
3. Select observed symptoms from comprehensive list
4. Enter vital signs (temperature, heart rate)
5. Click "Analyze with AI" for instant results with confidence scores

### 👤 Full Farm Management (Registered Users)
1. **Register Account**: Create your farmer profile
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
- **ML**: scikit-learn, pandas, numpy
- **Frontend**: Bootstrap 5, Font Awesome, custom CSS
- **Charts**: Chart.js (for analytics)

## 📱 Features Overview

### For Farmers
- ✅ Animal health prediction
- ✅ Livestock management
- ✅ Farm land tracking
- ✅ Veterinarian directory
- ✅ Health history
- ✅ Dashboard analytics

### For Veterinarians
- ✅ Professional profiles
- ✅ Contact management
- ✅ Specialization listing
- ✅ Rating system

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
- **Reset Database**: Delete `farmcare.db` file to start fresh

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

---

**🐾 FarmCare Pro - Empowering farmers with AI-driven livestock health management**