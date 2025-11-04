-- Supabase Database Schema for Livestock Health Monitor
-- Run this SQL in your Supabase SQL Editor

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    farm_name TEXT,
    location TEXT,
    experience_years INTEGER DEFAULT 0,
    role TEXT DEFAULT 'farmer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create animals table
CREATE TABLE IF NOT EXISTS public.animals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- cattle, goat, sheep, pig, chicken
    breed TEXT,
    age_months INTEGER,
    weight_kg DECIMAL(8,2),
    tag_number TEXT,
    health_status TEXT DEFAULT 'healthy', -- healthy, sick, recovering, critical
    gender TEXT, -- male, female
    date_acquired DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create health_records table
CREATE TABLE IF NOT EXISTS public.health_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE NOT NULL,
    temperature DECIMAL(4,1),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    symptoms TEXT[], -- array of symptoms
    diagnosis TEXT,
    treatment TEXT,
    vet_notes TEXT,
    severity TEXT DEFAULT 'low', -- low, medium, high, critical
    recorded_by TEXT DEFAULT 'owner', -- owner, vet, ai
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create farms table
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    location TEXT,
    area_acres DECIMAL(10,2),
    soil_type TEXT, -- loamy, clay, sandy, silt, rocky
    water_source TEXT, -- borewell, river, canal, rainwater, pond
    current_crops TEXT[],
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create veterinarians table
CREATE TABLE IF NOT EXISTS public.veterinarians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    specialization TEXT[], -- array of specializations
    location TEXT NOT NULL,
    address TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    consultation_fee INTEGER,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    availability_status TEXT DEFAULT 'available', -- available, busy, unavailable
    license_number TEXT,
    experience_years INTEGER DEFAULT 0,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voice_predictions table (for AI voice analysis)
CREATE TABLE IF NOT EXISTS public.voice_predictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    audio_file_url TEXT,
    prediction_result JSONB, -- stores AI prediction results
    confidence_score DECIMAL(5,4),
    severity_level TEXT,
    recommendations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vet_id UUID REFERENCES public.veterinarians(id) ON DELETE CASCADE NOT NULL,
    animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, completed, cancelled
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info', -- info, warning, error, success
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Animals policies
CREATE POLICY "Users can view own animals" ON public.animals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own animals" ON public.animals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own animals" ON public.animals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own animals" ON public.animals
    FOR DELETE USING (auth.uid() = user_id);

-- Health records policies
CREATE POLICY "Users can view own health records" ON public.health_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records" ON public.health_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Farms policies
CREATE POLICY "Users can view own farms" ON public.farms
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own farms" ON public.farms
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own farms" ON public.farms
    FOR UPDATE USING (auth.uid() = user_id);

-- Voice predictions policies
CREATE POLICY "Users can view own voice predictions" ON public.voice_predictions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice predictions" ON public.voice_predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Appointments policies
CREATE POLICY "Users can view own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Veterinarians policies (public read access)
CREATE POLICY "Anyone can view veterinarians" ON public.veterinarians
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON public.animals(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON public.health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_animal_id ON public.health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON public.appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_veterinarians_location ON public.veterinarians(location);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.animals
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.farms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.veterinarians
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample veterinarians data
INSERT INTO public.veterinarians (name, phone, specialization, location, consultation_fee, rating, experience_years) VALUES
('Dr. Rajesh Patil', '+91-9876543210', ARRAY['Cattle', 'Buffalo'], 'Pune, Maharashtra', 500, 4.5, 15),
('Dr. Priya Sharma', '+91-9876543211', ARRAY['Poultry', 'Small Animals'], 'Mumbai, Maharashtra', 400, 4.8, 12),
('Dr. Amit Desai', '+91-9876543212', ARRAY['Large Animals', 'Surgery'], 'Nashik, Maharashtra', 600, 4.3, 20),
('Dr. Sunita Joshi', '+91-9876543213', ARRAY['Dairy', 'Reproduction'], 'Kolhapur, Maharashtra', 450, 4.7, 18),
('Dr. Vikram Singh', '+91-9876543214', ARRAY['Emergency Care', 'General Practice'], 'Aurangabad, Maharashtra', 350, 4.2, 10);

-- Create a function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();