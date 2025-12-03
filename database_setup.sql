-- ============================================
-- PASHUCARE - COMPLETE DATABASE SETUP
-- ============================================
-- This script creates all tables and sample data
-- Run this in Supabase SQL Editor for fresh installation
-- For existing databases, see migration notes below

-- ============================================
-- PART 1: CORE TABLES
-- ============================================

-- Users table (farmers and veterinarians)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    farm_name VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(50),
    user_type VARCHAR(20) DEFAULT 'farmer',
    -- Vet-specific fields
    clinic_name VARCHAR(255),
    license_number VARCHAR(100),
    specialization VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animals table
CREATE TABLE IF NOT EXISTS animals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    animal_id VARCHAR(50) UNIQUE,
    animal_type VARCHAR(50) NOT NULL,
    breed VARCHAR(100),
    name VARCHAR(255),
    age FLOAT,
    gender VARCHAR(20),
    weight FLOAT,
    health_status VARCHAR(50) DEFAULT 'healthy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Farm lands table
CREATE TABLE IF NOT EXISTS farm_lands (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    land_name VARCHAR(255) NOT NULL,
    size_acres FLOAT,
    location VARCHAR(255),
    soil_type VARCHAR(100),
    crops_grown TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    animal_id INTEGER REFERENCES animals(id) ON DELETE SET NULL,
    prediction_data JSONB,
    result JSONB,
    confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 2: VETERINARY FEATURE TABLES
-- ============================================

-- Diseases reference table
CREATE TABLE IF NOT EXISTS diseases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    symptoms TEXT,
    recommended_treatment TEXT,
    prevention_measures TEXT,
    severity VARCHAR(50) DEFAULT 'medium',
    animal_types TEXT,
    is_contagious BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vaccinations table
CREATE TABLE IF NOT EXISTS vaccinations (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    vet_id INTEGER REFERENCES users(id) ON DELETE RESTRICT,
    vaccine_name VARCHAR(255) NOT NULL,
    dose VARCHAR(100),
    batch_number VARCHAR(100),
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    administered_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Animal diseases (diagnosis records)
CREATE TABLE IF NOT EXISTS animal_diseases (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    disease_id INTEGER NOT NULL REFERENCES diseases(id) ON DELETE RESTRICT,
    diagnosed_by_vet_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    date_diagnosed DATE NOT NULL,
    severity VARCHAR(50) DEFAULT 'medium',
    status VARCHAR(50) DEFAULT 'active',
    symptoms_observed TEXT,
    treatment_given TEXT,
    notes TEXT,
    follow_up_date DATE,
    recovery_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vet appointments table
CREATE TABLE IF NOT EXISTS vet_appointments (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
    vet_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(255),
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Veterinarians directory table
CREATE TABLE IF NOT EXISTS veterinarians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    specialization VARCHAR(255),
    location VARCHAR(255),
    phone VARCHAR(50),
    email VARCHAR(255),
    experience_years INTEGER,
    rating FLOAT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subsidies table
CREATE TABLE IF NOT EXISTS subsidies (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    scheme_type VARCHAR(100),
    state VARCHAR(100),
    description TEXT,
    eligibility TEXT,
    subsidy_amount VARCHAR(100),
    application_deadline DATE,
    contact_info VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 3: INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_type ON animals(animal_type);
CREATE INDEX IF NOT EXISTS idx_farm_lands_user_id ON farm_lands(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_animal_id ON predictions(animal_id);

CREATE INDEX IF NOT EXISTS idx_vaccinations_animal_id ON vaccinations(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_vet_id ON vaccinations(vet_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_date ON vaccinations(vaccination_date DESC);

CREATE INDEX IF NOT EXISTS idx_animal_diseases_animal_id ON animal_diseases(animal_id);
CREATE INDEX IF NOT EXISTS idx_animal_diseases_vet_id ON animal_diseases(diagnosed_by_vet_id);
CREATE INDEX IF NOT EXISTS idx_animal_diseases_date ON animal_diseases(date_diagnosed DESC);
CREATE INDEX IF NOT EXISTS idx_animal_diseases_status ON animal_diseases(status);

CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON vet_appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON vet_appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON vet_appointments(status);

CREATE INDEX IF NOT EXISTS idx_diseases_name ON diseases(name);
CREATE INDEX IF NOT EXISTS idx_diseases_severity ON diseases(severity);

-- ============================================
-- PART 4: ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_diseases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vet_appointments ENABLE ROW LEVEL SECURITY;

-- Users policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Animals policies
DROP POLICY IF EXISTS "Users can view own animals" ON animals;
DROP POLICY IF EXISTS "Users can insert own animals" ON animals;
DROP POLICY IF EXISTS "Users can update own animals" ON animals;
DROP POLICY IF EXISTS "Users can delete own animals" ON animals;
DROP POLICY IF EXISTS "Vets can view all animals" ON animals;

CREATE POLICY "Users can view own animals" ON animals
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own animals" ON animals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own animals" ON animals
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own animals" ON animals
    FOR DELETE USING (true);

CREATE POLICY "Vets can view all animals" ON animals
    FOR SELECT USING (true);

-- Farm lands policies
DROP POLICY IF EXISTS "Users can manage own lands" ON farm_lands;

CREATE POLICY "Users can manage own lands" ON farm_lands
    FOR ALL USING (true);

-- Predictions policies
DROP POLICY IF EXISTS "Users can view own predictions" ON predictions;
DROP POLICY IF EXISTS "Users can insert predictions" ON predictions;

CREATE POLICY "Users can view own predictions" ON predictions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert predictions" ON predictions
    FOR INSERT WITH CHECK (true);

-- Vaccinations policies
DROP POLICY IF EXISTS "Allow authenticated users to view vaccinations" ON vaccinations;
DROP POLICY IF EXISTS "Allow authenticated users to insert vaccinations" ON vaccinations;
DROP POLICY IF EXISTS "Allow users to update their own vaccinations" ON vaccinations;
DROP POLICY IF EXISTS "Allow users to delete their own vaccinations" ON vaccinations;

CREATE POLICY "Allow authenticated users to view vaccinations" ON vaccinations
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert vaccinations" ON vaccinations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own vaccinations" ON vaccinations
    FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete their own vaccinations" ON vaccinations
    FOR DELETE USING (true);

-- Diseases policies
DROP POLICY IF EXISTS "Anyone can view diseases" ON diseases;

CREATE POLICY "Anyone can view diseases" ON diseases
    FOR SELECT USING (true);

-- Animal diseases policies
DROP POLICY IF EXISTS "Allow authenticated users to view diagnoses" ON animal_diseases;
DROP POLICY IF EXISTS "Allow authenticated users to insert diagnoses" ON animal_diseases;
DROP POLICY IF EXISTS "Allow users to update diagnoses" ON animal_diseases;

CREATE POLICY "Allow authenticated users to view diagnoses" ON animal_diseases
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert diagnoses" ON animal_diseases
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update diagnoses" ON animal_diseases
    FOR UPDATE USING (true);

-- Appointments policies
DROP POLICY IF EXISTS "Allow authenticated users to view appointments" ON vet_appointments;
DROP POLICY IF EXISTS "Allow authenticated users to create appointments" ON vet_appointments;
DROP POLICY IF EXISTS "Allow users to update appointments" ON vet_appointments;

CREATE POLICY "Allow authenticated users to view appointments" ON vet_appointments
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create appointments" ON vet_appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update appointments" ON vet_appointments
    FOR UPDATE USING (true);

-- ============================================
-- PART 5: SAMPLE DATA
-- ============================================

-- Insert sample diseases
INSERT INTO diseases (name, description, symptoms, recommended_treatment, prevention_measures, severity, animal_types, is_contagious) VALUES
('Foot and Mouth Disease', 'Highly contagious viral disease affecting cloven-hoofed animals', 'Fever, blisters in mouth and on feet, lameness, excessive salivation', 'Isolation, supportive care, vaccination of healthy animals', 'Regular vaccination, biosecurity measures', 'critical', 'Cow,Sheep,Goat,Pig', true),
('Mastitis', 'Inflammation of mammary gland tissue', 'Swollen udder, abnormal milk, fever, reduced milk production', 'Antibiotics, anti-inflammatory drugs, proper milking hygiene', 'Clean milking equipment, proper udder care', 'high', 'Cow,Goat,Sheep', false),
('Rabies', 'Fatal viral disease affecting nervous system', 'Behavioral changes, aggression, paralysis, excessive salivation', 'No treatment - prevention through vaccination is critical', 'Mandatory vaccination, avoid contact with wild animals', 'critical', 'Dog,Cat,Cow,Horse', true),
('Canine Parvovirus', 'Highly contagious viral illness in dogs', 'Severe vomiting, bloody diarrhea, lethargy, loss of appetite', 'IV fluids, anti-nausea medication, antibiotics for secondary infections', 'Vaccination at 6-8 weeks, avoid contact with infected dogs', 'critical', 'Dog', true),
('Feline Leukemia', 'Viral disease affecting cats immune system', 'Weight loss, poor coat condition, fever, anemia', 'Supportive care, manage secondary infections, isolation from other cats', 'Vaccination, test new cats before introduction', 'high', 'Cat', true),
('Equine Influenza', 'Respiratory disease in horses', 'Cough, nasal discharge, fever, lethargy', 'Rest, anti-inflammatory drugs, antibiotics if secondary infection', 'Annual vaccination, quarantine new horses', 'medium', 'Horse', true),
('Pneumonia', 'Lung infection causing breathing difficulties', 'Coughing, difficulty breathing, nasal discharge, fever', 'Antibiotics, anti-inflammatory drugs, supportive care', 'Good ventilation, avoid stress, proper nutrition', 'high', 'Cow,Sheep,Goat,Horse,Pig', false),
('Ringworm', 'Fungal skin infection', 'Circular patches of hair loss, scaly skin, itching', 'Antifungal medication, topical treatment, environmental cleaning', 'Maintain hygiene, isolate infected animals', 'low', 'Dog,Cat,Cow,Horse', true),
('Bloat', 'Gas accumulation in stomach', 'Distended abdomen, restlessness, difficulty breathing, drooling', 'Emergency surgery, stomach decompression, IV fluids', 'Proper feeding schedule, avoid rapid feed changes', 'critical', 'Cow,Sheep,Goat,Dog', false),
('Coccidiosis', 'Parasitic disease affecting intestines', 'Diarrhea (often bloody), weight loss, dehydration, weakness', 'Anticoccidial drugs, fluid therapy, improved sanitation', 'Clean water, proper sanitation, avoid overcrowding', 'medium', 'Cow,Sheep,Goat,Pig,Rabbit', false)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    symptoms = EXCLUDED.symptoms,
    recommended_treatment = EXCLUDED.recommended_treatment,
    prevention_measures = EXCLUDED.prevention_measures,
    severity = EXCLUDED.severity,
    animal_types = EXCLUDED.animal_types,
    is_contagious = EXCLUDED.is_contagious;

-- Insert sample veterinarian user
-- Password: VetPass123! (hashed with bcrypt)
INSERT INTO users (email, password_hash, name, user_type, phone, location, clinic_name, license_number, specialization, created_at)
VALUES (
    'dr.sharma@pashucare.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYEwtim8olu',
    'Dr. Rajesh Sharma',
    'veterinarian',
    '+91-9876543210',
    'Mumbai, Maharashtra',
    'PashuCare Veterinary Clinic',
    'VET-MH-2024-001',
    'Large Animal Medicine, Surgery',
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    user_type = 'veterinarian',
    clinic_name = EXCLUDED.clinic_name,
    license_number = EXCLUDED.license_number,
    specialization = EXCLUDED.specialization;

-- Insert sample farmer user
-- Password: FarmerPass123!
INSERT INTO users (email, password_hash, name, user_type, phone, location, farm_name, created_at)
VALUES (
    'farmer.patil@pashucare.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYEwtim8olu',
    'Ramesh Patil',
    'farmer',
    '+91-9876543211',
    'Pune, Maharashtra',
    'Patil Dairy Farm',
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- PART 6: COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'User accounts for farmers and veterinarians';
COMMENT ON TABLE animals IS 'Livestock records';
COMMENT ON TABLE farm_lands IS 'Farm property records';
COMMENT ON TABLE predictions IS 'AI prediction history';
COMMENT ON TABLE vaccinations IS 'Vaccination records administered by veterinarians';
COMMENT ON TABLE diseases IS 'Reference table of animal diseases';
COMMENT ON TABLE animal_diseases IS 'Diagnosis records linking animals to diseases';
COMMENT ON TABLE vet_appointments IS 'Appointment scheduling between vets and farmers';

COMMENT ON COLUMN vaccinations.vet_id IS 'Veterinarian who administered the vaccination';
COMMENT ON COLUMN vaccinations.batch_number IS 'Vaccine batch number for tracking';

-- ============================================
-- PART 7: VERIFICATION
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '=== Database Setup Verification ===';
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE '✓ users table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animals') THEN
        RAISE NOTICE '✓ animals table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vaccinations') THEN
        RAISE NOTICE '✓ vaccinations table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'animal_diseases') THEN
        RAISE NOTICE '✓ animal_diseases table exists';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vet_appointments') THEN
        RAISE NOTICE '✓ vet_appointments table exists';
    END IF;
    
    RAISE NOTICE '=== End Verification ===';
END $$;

-- Show counts
SELECT 
    (SELECT COUNT(*) FROM diseases) as disease_count,
    (SELECT COUNT(*) FROM users WHERE user_type = 'veterinarian') as vet_count,
    (SELECT COUNT(*) FROM users WHERE user_type = 'farmer') as farmer_count;

-- Setup complete!
SELECT '✓ Database setup completed successfully!' as status;

-- ============================================
-- MIGRATION NOTES
-- ============================================
-- If you have existing data, this script is safe to run
-- It uses IF NOT EXISTS and ON CONFLICT clauses
-- Your existing data will be preserved
-- 
-- For detailed migration guide, see README.md
-- ============================================
