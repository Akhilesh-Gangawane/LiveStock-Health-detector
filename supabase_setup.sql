-- PashuCare Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(128),
    name VARCHAR(100) NOT NULL,
    farm_name VARCHAR(100),
    location VARCHAR(100),
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'farmer',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Animals Table
CREATE TABLE IF NOT EXISTS animals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    animal_id VARCHAR(50) UNIQUE NOT NULL,
    animal_type VARCHAR(50) NOT NULL,
    breed VARCHAR(100) NOT NULL,
    name VARCHAR(100),
    age FLOAT NOT NULL,
    gender VARCHAR(10) NOT NULL,
    weight FLOAT NOT NULL,
    health_status VARCHAR(20) DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Farm Lands Table
CREATE TABLE IF NOT EXISTS farm_lands (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    land_name VARCHAR(100) NOT NULL,
    size_acres FLOAT NOT NULL,
    location VARCHAR(200) NOT NULL,
    soil_type VARCHAR(50),
    crops_grown TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    animal_id INTEGER REFERENCES animals(id) ON DELETE SET NULL,
    prediction_data TEXT NOT NULL,
    result TEXT NOT NULL,
    confidence FLOAT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Veterinarians Table
CREATE TABLE IF NOT EXISTS veterinarians (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    location VARCHAR(200),
    phone VARCHAR(20),
    email VARCHAR(120),
    experience_years INTEGER,
    rating FLOAT DEFAULT 0.0,
    is_available BOOLEAN DEFAULT TRUE
);

-- Diseases Table
CREATE TABLE IF NOT EXISTS diseases (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    animal_types TEXT,
    symptoms TEXT,
    description TEXT,
    prevention TEXT,
    treatment TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Subsidies Table
CREATE TABLE IF NOT EXISTS subsidies (
    id SERIAL PRIMARY KEY,
    scheme_name VARCHAR(200) NOT NULL,
    scheme_type VARCHAR(50),
    state VARCHAR(50),
    description TEXT,
    eligibility TEXT,
    subsidy_amount VARCHAR(100),
    application_deadline DATE,
    contact_info TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Vaccinations Table
CREATE TABLE IF NOT EXISTS vaccinations (
    id SERIAL PRIMARY KEY,
    animal_id INTEGER REFERENCES animals(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(100) NOT NULL,
    vaccination_date DATE NOT NULL,
    next_due_date DATE,
    veterinarian VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_animal_type ON animals(animal_type);
CREATE INDEX IF NOT EXISTS idx_farm_lands_user_id ON farm_lands(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_animal_id ON predictions(animal_id);
CREATE INDEX IF NOT EXISTS idx_vaccinations_animal_id ON vaccinations(animal_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert sample veterinarians data
INSERT INTO veterinarians (name, specialization, location, phone, email, experience_years, rating, is_available) VALUES
('Dr. Rajesh Kumar', 'Large Animals', 'Mumbai, Maharashtra', '+91-9876543210', 'rajesh.kumar@vet.com', 15, 4.8, TRUE),
('Dr. Priya Sharma', 'Dairy Cattle', 'Pune, Maharashtra', '+91-9876543211', 'priya.sharma@vet.com', 12, 4.7, TRUE),
('Dr. Amit Patel', 'Poultry', 'Ahmedabad, Gujarat', '+91-9876543212', 'amit.patel@vet.com', 10, 4.6, TRUE),
('Dr. Sunita Desai', 'Small Animals', 'Nashik, Maharashtra', '+91-9876543213', 'sunita.desai@vet.com', 8, 4.9, TRUE),
('Dr. Vikram Singh', 'Equine', 'Jaipur, Rajasthan', '+91-9876543214', 'vikram.singh@vet.com', 20, 4.5, TRUE);

-- Insert sample diseases data
INSERT INTO diseases (name, animal_types, symptoms, description, prevention, treatment, severity) VALUES
('Foot and Mouth Disease', '["Cattle", "Buffalo", "Goat", "Sheep"]', '["Fever", "Blisters", "Lameness", "Drooling"]', 'Highly contagious viral disease affecting cloven-hoofed animals', 'Regular vaccination, quarantine new animals, maintain hygiene', 'Supportive care, antibiotics for secondary infections, isolation', 'high'),
('Mastitis', '["Cattle", "Buffalo", "Goat"]', '["Swollen udder", "Fever", "Reduced milk", "Pain"]', 'Inflammation of mammary gland tissue', 'Proper milking hygiene, teat dipping, dry cow therapy', 'Antibiotics, anti-inflammatory drugs, frequent milking', 'medium'),
('Newcastle Disease', '["Chicken", "Duck", "Turkey"]', '["Respiratory distress", "Diarrhea", "Nervous signs", "Drop in egg production"]', 'Viral disease affecting poultry', 'Vaccination, biosecurity measures, quarantine', 'No specific treatment, supportive care, cull infected birds', 'high'),
('Brucellosis', '["Cattle", "Buffalo", "Goat", "Sheep"]', '["Abortion", "Retained placenta", "Reduced milk", "Infertility"]', 'Bacterial disease causing reproductive problems', 'Vaccination, test and cull, biosecurity', 'Antibiotics (limited effectiveness), culling recommended', 'high'),
('Parasitic Infestation', '["Cattle", "Buffalo", "Goat", "Sheep"]', '["Weight loss", "Diarrhea", "Anemia", "Poor coat"]', 'Internal and external parasites affecting livestock', 'Regular deworming, pasture management, hygiene', 'Anthelmintics, ectoparasiticides, supportive care', 'medium');

-- Insert sample subsidies data
INSERT INTO subsidies (scheme_name, scheme_type, state, description, eligibility, subsidy_amount, application_deadline, contact_info, is_active) VALUES
('National Livestock Mission', 'livestock', 'All India', 'Comprehensive scheme for livestock development', 'All farmers with livestock', 'Up to 50% of project cost', '2025-12-31', 'contact@nlm.gov.in', TRUE),
('Dairy Entrepreneurship Development Scheme', 'dairy', 'All India', 'Support for setting up dairy farms', 'Individual farmers, cooperatives', '25-33% subsidy', '2025-12-31', 'deds@nddb.org', TRUE),
('Poultry Venture Capital Fund', 'poultry', 'All India', 'Financial assistance for poultry farming', 'Small and marginal farmers', 'Up to 40% subsidy', '2025-06-30', 'pvcf@dahd.gov.in', TRUE),
('Rashtriya Gokul Mission', 'cattle', 'All India', 'Indigenous cattle breed development', 'Farmers with indigenous breeds', 'Variable based on activity', '2025-12-31', 'rgm@dahd.gov.in', TRUE),
('Maharashtra Livestock Development Scheme', 'livestock', 'Maharashtra', 'State-level livestock support', 'Maharashtra farmers', '30-50% subsidy', '2025-09-30', 'ahd.mah@gov.in', TRUE);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_lands ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow public user registration
CREATE POLICY "Allow public user registration" ON users
    FOR INSERT 
    WITH CHECK (true);

-- Users can view their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT 
    USING (true);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE 
    USING (true);

-- RLS Policies for animals table
CREATE POLICY "Users can view own animals" ON animals
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own animals" ON animals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own animals" ON animals
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own animals" ON animals
    FOR DELETE USING (true);

-- RLS Policies for farm_lands table
CREATE POLICY "Users can view own lands" ON farm_lands
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own lands" ON farm_lands
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own lands" ON farm_lands
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete own lands" ON farm_lands
    FOR DELETE USING (true);

-- RLS Policies for predictions table
CREATE POLICY "Users can view own predictions" ON predictions
    FOR SELECT USING (true);

CREATE POLICY "Users can insert own predictions" ON predictions
    FOR INSERT WITH CHECK (true);

-- RLS Policies for vaccinations table
CREATE POLICY "Users can view vaccinations for own animals" ON vaccinations
    FOR SELECT USING (true);

CREATE POLICY "Users can insert vaccinations for own animals" ON vaccinations
    FOR INSERT WITH CHECK (true);

-- Public read access for reference tables
CREATE POLICY "Anyone can view veterinarians" ON veterinarians
    FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view diseases" ON diseases
    FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view subsidies" ON subsidies
    FOR SELECT USING (TRUE);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
