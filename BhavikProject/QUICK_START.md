# 🚀 Quick Start Guide - Livestock Health Monitor

## ⚡ 3-Step Setup

### 1️⃣ **Complete Setup (One-time)**
```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh && ./setup.sh
```

### 2️⃣ **Start Application**
```bash
npm run dev
```

### 3️⃣ **Open & Use**
- 🌐 **Frontend:** http://localhost:5173
- 🔗 **API:** http://localhost:8000
- 📚 **Docs:** http://localhost:8000/docs

## 🎯 First Use Workflow

### **Step 1: Setup Database**
1. Go to [supabase.com](https://supabase.com)
2. Create new project: `livestock-health-monitor`
3. Copy your project URL and anon key
4. Update `.env.local` with your credentials
5. Run the SQL from `supabase-schema.sql` in Supabase SQL Editor

### **Step 2: Register Account**
1. Open http://localhost:5173
2. Click "Sign Up Free"
3. Fill registration form
4. Verify email (check inbox)
5. Login with credentials

### **Step 3: Add Your First Animal**
1. Go to "Animals" page
2. Click "Add Animal"
3. Fill details: name, type, breed, age, weight
4. Save animal

### **Step 4: Predict Disease**
1. Go to "Health Monitor" → "Disease Predictor"
2. Select your animal (auto-fills details)
3. Enter symptoms and vital signs
4. Click "Predict Disease"
5. View AI results with confidence scores
6. Save to health records

## 🎉 Success Checklist

✅ Both servers start without errors  
✅ Can register and login  
✅ Can add animals  
✅ Disease prediction works  
✅ Results save to database  
✅ No console errors  

## 🐛 Quick Troubleshooting

**❌ Python not found**
→ Install Python 3.8+ from python.org

**❌ Port already in use**
→ Kill processes: `npx kill-port 8000 5173`

**❌ Database errors**
→ Check Supabase credentials in `.env.local`

**❌ CORS errors**
→ Ensure API is running on port 8000

## 📞 Need Help?

1. Check `README.md` for detailed documentation
2. View API docs at http://localhost:8000/docs
3. Check browser console for errors
4. Verify all environment variables are set

---

**🎯 Your AI-powered livestock health monitoring system is ready in 3 steps!**