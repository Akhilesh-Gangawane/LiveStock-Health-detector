import { createClient } from '@supabase/supabase-js'

// These will be your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database helper functions
export const db = {
  // Animals
  animals: {
    getAll: (userId) => supabase
      .from('animals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    
    create: (animal) => supabase
      .from('animals')
      .insert([animal])
      .select(),
    
    update: (id, updates) => supabase
      .from('animals')
      .update(updates)
      .eq('id', id)
      .select(),
    
    delete: (id) => supabase
      .from('animals')
      .delete()
      .eq('id', id)
  },

  // Health Records
  healthRecords: {
    getAll: (userId) => supabase
      .from('health_records')
      .select(`
        *,
        animals (
          id,
          name,
          type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    
    create: (record) => supabase
      .from('health_records')
      .insert([record])
      .select(),
    
    getByAnimal: (animalId) => supabase
      .from('health_records')
      .select('*')
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false })
  },

  // Farms/Land
  farms: {
    getAll: (userId) => supabase
      .from('farms')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    
    create: (farm) => supabase
      .from('farms')
      .insert([farm])
      .select(),
    
    update: (id, updates) => supabase
      .from('farms')
      .update(updates)
      .eq('id', id)
      .select()
  },

  // Veterinarians
  vets: {
    getAll: () => supabase
      .from('veterinarians')
      .select('*')
      .order('rating', { ascending: false }),
    
    getByLocation: (location) => supabase
      .from('veterinarians')
      .select('*')
      .ilike('location', `%${location}%`)
      .order('rating', { ascending: false }),
    
    create: (vet) => supabase
      .from('veterinarians')
      .insert([vet])
      .select()
  },

  // User Profiles
  profiles: {
    get: (userId) => supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single(),
    
    update: (userId, updates) => supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select(),
    
    create: (profile) => supabase
      .from('profiles')
      .insert([profile])
      .select()
  },

  // Voice Predictions
  voicePredictions: {
    getAll: (userId) => supabase
      .from('voice_predictions')
      .select(`
        *,
        animals (
          id,
          name,
          type
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    
    create: (prediction) => supabase
      .from('voice_predictions')
      .insert([prediction])
      .select(),
    
    getByAnimal: (animalId) => supabase
      .from('voice_predictions')
      .select('*')
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false })
  }
}