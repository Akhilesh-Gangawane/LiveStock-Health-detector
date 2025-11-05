# 📁 Project Structure - Livestock Health Monitor

## 🏗️ Complete Architecture

```
livestock-health-monitor/
├── 🔧 Configuration Files
│   ├── package.json              # NPM dependencies & scripts
│   ├── vite.config.js            # Vite build configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.cjs        # PostCSS configuration
│   ├── .env.local                # Environment variables
│   └── index.html                # HTML entry point
│
├── 🐍 FastAPI Backend
│   ├── api/
│   │   ├── main.py               # FastAPI app with ML model
│   │   ├── requirements.txt      # Python dependencies
│   │   └── __init__.py          # Python package init
│
├── ⚛️ React Frontend
│   ├── src/
│   │   ├── 📄 Entry Points
│   │   │   ├── main.jsx          # React app entry point
│   │   │   ├── App.jsx           # Main app component
│   │   │   ├── index.css         # Global styles
│   │   │   └── i18n.js           # Internationalization setup
│   │   │
│   │   ├── 🔗 Services
│   │   │   └── mlApi.js          # FastAPI integration service
│   │   │
│   │   ├── 🗄️ Database
│   │   │   └── lib/
│   │   │       └── supabase.js   # Supabase client & helpers
│   │   │
│   │   ├── 🎯 State Management
│   │   │   └── context/
│   │   │       ├── AuthContext.jsx    # User authentication
│   │   │       └── AppContext.jsx     # App-wide state
│   │   │
│   │   ├── 🧩 Components
│   │   │   ├── Charts.jsx             # Data visualization
│   │   │   ├── DashboardCards.jsx     # Dashboard widgets
│   │   │   ├── DiseaseCard.jsx        # Disease information
│   │   │   ├── DiseasePredictionForm.jsx  # AI prediction form
│   │   │   ├── Footer.jsx             # App footer
│   │   │   ├── LanguageSelector.jsx   # Language switcher
│   │   │   ├── LoadingSpinner.jsx     # Loading indicator
│   │   │   ├── Navbar.jsx             # Navigation bar
│   │   │   ├── NotificationSystem.jsx # Toast notifications
│   │   │   ├── PredictionResults.jsx  # AI results display
│   │   │   ├── SchemeFilter.jsx       # Government schemes filter
│   │   │   ├── ThemeToggle.jsx        # Dark/light mode
│   │   │   └── VetCard.jsx            # Veterinarian cards
│   │   │
│   │   ├── 📱 Pages
│   │   │   ├── Animals.jsx            # Animal management
│   │   │   ├── Dashboard.jsx          # Main dashboard
│   │   │   ├── HealthMonitor.jsx      # Health tracking + AI
│   │   │   ├── Home.jsx               # Landing page
│   │   │   ├── KnowledgeBase.jsx      # Educational content
│   │   │   ├── Land.jsx               # Farm management
│   │   │   ├── Login.jsx              # User login
│   │   │   ├── Profile.jsx            # User profile
│   │   │   ├── Register.jsx           # User registration
│   │   │   ├── Reports.jsx            # Analytics & reports
│   │   │   ├── Schemes.jsx            # Government schemes
│   │   │   ├── Vets.jsx               # Veterinarian directory
│   │   │   └── VoicePredict.jsx       # Voice analysis + AI
│   │   │
│   │   └── 🌍 Localization
│   │       └── locales/
│   │           ├── en.json            # English translations
│   │           └── mr.json            # Marathi translations
│
├── 🗄️ Database
│   ├── supabase-schema.sql       # Complete database schema
│   └── SUPABASE_SETUP_GUIDE.md   # Database setup instructions
│
├── 🧪 Mock Data (Optional)
│   └── mock/
│       └── db.json               # JSON server mock data
│
├── 🛠️ Setup Scripts
│   ├── setup.bat                 # Windows complete setup
│   └── setup.sh                  # Linux/Mac complete setup
│
└── 📚 Documentation
    ├── README.md                 # Main project documentation
    └── PROJECT_STRUCTURE.md      # This file
```

## 🔄 Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE (React)                   │
├─────────────────────────────────────────────────────────────┤
│  Home │ Dashboard │ Animals │ Health │ Voice │ Vets │ Profile │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                          │
├─────────────────────────────────────────────────────────────┤
│  AuthContext (User State) │ AppContext (Theme, Language)    │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
┌─────────────────────────┐    ┌─────────────────────────┐
│    SUPABASE CLIENT      │    │     FASTAPI CLIENT      │
│   (Database & Auth)     │    │    (AI Predictions)     │
├─────────────────────────┤    ├─────────────────────────┤
│ • User Authentication   │    │ • Disease Prediction    │
│ • Animal Records        │    │ • Symptom Analysis      │
│ • Health Records        │    │ • Vital Signs Check     │
│ • Farm Management       │    │ • Confidence Scoring    │
│ • Vet Directory         │    │ • Multi-animal Support  │
└─────────────────────────┘    └─────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI PREDICTION ENGINE                     │
├─────────────────────────────────────────────────────────────┤
│ • Rule-based Disease Classification                         │
│ • Species-specific Vital Sign Analysis                     │
│ • Syndrome Scoring (Respiratory, GI, Systemic, Neuro)      │
│ • Confidence Calculation & Top-3 Predictions               │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Features by Component

### 🏠 **Home Page**
- Hero section with call-to-action
- Feature highlights
- Farmer testimonials
- Statistics display
- Multi-language support

### 📊 **Dashboard**
- Quick stats overview
- Recent activity feed
- Quick action buttons
- Health alerts
- Animal status summary

### 🐄 **Animals Management**
- Add/edit/delete animals
- Animal profile cards
- Health status tracking
- Search and filter
- Bulk operations

### 🏥 **Health Monitor** (Main Feature)
- **Disease Predictor Tab:**
  - AI-powered disease prediction
  - Comprehensive symptom form
  - Real-time confidence scoring
  - Top-3 disease possibilities
  - Vital signs analysis
  
- **Manual Record Tab:**
  - Traditional health logging
  - Symptom selection
  - Vital signs entry
  - Notes and observations
  
- **Health Records Tab:**
  - Historical health data
  - Treatment tracking
  - Recovery monitoring
  - Export capabilities
  
- **AI History Tab:**
  - All AI predictions
  - Confidence trends
  - Accuracy tracking
  - Pattern analysis

### 🎤 **Voice Predict**
- Audio recording interface
- Voice analysis simulation
- Integration with disease predictor
- Results visualization
- Save to health records

### 👨‍⚕️ **Veterinarians**
- Vet directory with search
- Location-based filtering
- Specialization categories
- Rating and reviews
- Contact information
- Appointment booking

### 🌱 **Land Management**
- Farm property tracking
- Soil type classification
- Water source management
- Crop rotation planning
- Area calculations

### 📚 **Knowledge Base**
- Educational articles
- Disease information
- Treatment guides
- Prevention tips
- Video tutorials

### 🏛️ **Government Schemes**
- Subsidy information
- Application guides
- Eligibility criteria
- Deadline tracking
- Document requirements

### 👤 **Profile Management**
- User information
- Farm details
- Preferences
- Account settings
- Data export

## 🔧 Technical Stack

### **Frontend**
- **React 18** - Modern UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **React Context** - State management
- **i18next** - Internationalization
- **Chart.js** - Data visualization
- **Framer Motion** - Animations
- **Lucide React** - Icons

### **Backend**
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **Built-in ML** - Rule-based prediction system

### **Database**
- **Supabase** - PostgreSQL with real-time features
- **Row Level Security** - Data protection
- **JWT Authentication** - Secure sessions
- **Real-time subscriptions** - Live updates

### **Development**
- **Concurrently** - Run multiple processes
- **Hot Reload** - Development efficiency
- **TypeScript support** - Type safety
- **ESLint** - Code quality
- **Prettier** - Code formatting

## 🚀 Deployment Architecture

### **Development**
```bash
npm run dev  # Starts both frontend and backend
```

### **Production**
```
Frontend (Vercel/Netlify) ←→ Backend (Railway/Heroku) ←→ Supabase
```

## 📈 Performance Optimizations

- **Code Splitting** - Lazy loading of routes
- **Image Optimization** - WebP format support
- **Caching** - API response caching
- **Compression** - Gzip/Brotli compression
- **CDN** - Static asset delivery
- **Database Indexing** - Optimized queries
- **Connection Pooling** - Efficient database connections

## 🔒 Security Features

- **Authentication** - Supabase Auth with JWT
- **Authorization** - Row-level security policies
- **Data Validation** - Pydantic models
- **CORS Protection** - Configured origins
- **Environment Variables** - Secure configuration
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization

---

**🎯 This structure provides a complete, scalable, and maintainable livestock health monitoring platform with AI-powered disease prediction capabilities.**