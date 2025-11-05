# 🚀 Supabase Setup Guide for Livestock Health Monitor

## Step 1: Create Supabase Account & Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Click "Start your project"**
3. **Sign up with GitHub/Google or create account**
4. **Create a new project:**
   - Project name: `livestock-health-monitor`
   - Database password: Create a strong password (save it!)
   - Region: Choose closest to your location
   - Click "Create new project"

## Step 2: Get Your Project Credentials

1. **In your Supabase dashboard, go to Settings → API**
2. **Copy these values:**
   - Project URL (looks like: `https://your-project-id.supabase.co`)
   - Anon public key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Configure Environment Variables

1. **Open your `.env.local` file in the project root**
2. **Replace the placeholder values:**

```env
# Replace with your actual Supabase credentials
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
```

## Step 4: Set Up Database Schema

1. **In Supabase dashboard, go to SQL Editor**
2. **Click "New query"**
3. **Copy the entire content from `supabase-schema.sql` file**
4. **Paste it in the SQL editor**
5. **Click "Run" to execute the schema**

This will create all the necessary tables:

- `profiles` - User profiles
- `animals` - Animal records
- `health_records` - Health monitoring data
- `farms` - Farm/land information
- `veterinarians` - Vet directory
- `appointments` - Vet appointments
- `voice_predictions` - AI voice analysis results
- `notifications` - User notifications

## Step 5: Enable Authentication

1. **Go to Authentication → Settings**
2. **Configure these settings:**
   - Site URL: `http://localhost:5173` (for development)
   - Redirect URLs: `http://localhost:5173/**`
3. **Enable Email authentication** (it's enabled by default)

## Step 6: Test the Setup

1. **Start your development server:**

```bash
npm run dev
```

2. **Go to `http://localhost:5173`**
3. **Try to register a new account**
4. **Check your email for verification link**
5. **After verification, try logging in**

## Step 7: Verify Database Connection

1. **After logging in, go to Animals page**
2. **Try adding a new animal**
3. **Check Supabase dashboard → Table Editor → animals**
4. **You should see your new animal record**

## 🔧 Troubleshooting

### Common Issues

**1. "Invalid API key" error:**

- Double-check your `.env.local` file
- Make sure there are no extra spaces
- Restart your dev server after changing env variables

**2. "Row Level Security" errors:**

- Make sure you ran the complete SQL schema
- Check that RLS policies were created properly

**3. Authentication not working:**

- Verify Site URL in Supabase Auth settings
- Check browser console for errors
- Make sure email verification is working

**4. Database operations failing:**

- Check browser network tab for API errors
- Verify user is logged in before database operations
- Check Supabase logs in dashboard

## 📊 Database Structure Overview

```
Users (auth.users) ← Supabase handles this
    ↓
Profiles (public.profiles) ← User details
    ↓
├── Animals (public.animals) ← Animal records
│   └── Health Records (public.health_records)
├── Farms (public.farms) ← Land management
├── Appointments (public.appointments)
└── Voice Predictions (public.voice_predictions)

Veterinarians (public.veterinarians) ← Public directory
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Users can only access their own data
- **JWT Authentication** - Secure token-based auth
- **Email Verification** - Prevents fake accounts
- **Secure API Keys** - Environment-based configuration

## 🚀 Next Steps

After setup is complete, you can:

1. **Add more animals** and test the Animals page
2. **Create health records** for your animals
3. **Add farm information** in the Land page
4. **Browse veterinarians** in the Vets page
5. **Test voice predictions** (when AI integration is added)

## 📱 Production Deployment

When deploying to production:

1. **Update environment variables** with production URLs
2. **Configure Auth settings** with your production domain
3. **Set up proper email templates** in Supabase Auth
4. **Enable additional security features** as needed

## 💡 Tips

- **Always backup your database** before making schema changes
- **Use Supabase dashboard** to monitor usage and performance
- **Check logs regularly** for any issues
- **Keep your API keys secure** - never commit them to version control

---

## 🆘 Need Help?

If you encounter any issues:

1. Check the browser console for errors
2. Look at Supabase dashboard logs
3. Verify all environment variables are correct
4. Make sure the database schema was applied completely
5. Test with a fresh browser session (clear cache/cookies)

Your livestock health monitoring app is now ready with a full database backend! 🎉
