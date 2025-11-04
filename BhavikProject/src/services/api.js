import { supabase } from '../lib/supabase'

// Animals API
export const animalsAPI = {
  // Get all animals for current user
  getAll: async () => {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get single animal
  getById: async (id) => {
    const { data, error } = await supabase
      .from('animals')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Create new animal
  create: async (animalData) => {
    const { data, error } = await supabase
      .from('animals')
      .insert([animalData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update animal
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('animals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete animal
  delete: async (id) => {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Health Records API
export const healthRecordsAPI = {
  // Get health records for an animal
  getByAnimalId: async (animalId) => {
    const { data, error } = await supabase
      .from('health_records')
      .select(`
        *,
        animals(name, type),
        profiles(name)
      `)
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create health record
  create: async (recordData) => {
    const { data, error } = await supabase
      .from('health_records')
      .insert([recordData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get recent health records
  getRecent: async (limit = 10) => {
    const { data, error } = await supabase
      .from('health_records')
      .select(`
        *,
        animals(name, type, owner_id),
        profiles(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }
}

// Voice Predictions API
export const voicePredictionsAPI = {
  // Get all predictions for current user
  getAll: async () => {
    const { data, error } = await supabase
      .from('voice_predictions')
      .select(`
        *,
        animals(name, type)
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Create new prediction
  create: async (predictionData) => {
    const { data, error } = await supabase
      .from('voice_predictions')
      .insert([predictionData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update prediction status
  updateStatus: async (id, status, notes = null) => {
    const updates = { status }
    if (notes) updates.veterinarian_notes = notes
    
    const { data, error } = await supabase
      .from('voice_predictions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Veterinarians API
export const veterinariansAPI = {
  // Get all verified veterinarians
  getAll: async () => {
    const { data, error } = await supabase
      .from('veterinarians')
      .select(`
        *,
        profiles(name, phone, avatar)
      `)
      .eq('is_verified', true)
      .order('rating', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get veterinarian by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('veterinarians')
      .select(`
        *,
        profiles(name, phone, avatar)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Appointments API
export const appointmentsAPI = {
  // Get appointments for current user
  getAll: async () => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        veterinarians(
          clinic_name,
          profiles(name, phone)
        ),
        animals(name, type)
      `)
      .order('scheduled_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  // Create appointment
  create: async (appointmentData) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointmentData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update appointment status
  updateStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Knowledge Base API
export const knowledgeAPI = {
  // Get published articles
  getArticles: async (category = null, limit = null) => {
    let query = supabase
      .from('knowledge_articles')
      .select(`
        *,
        profiles(name)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (limit) {
      query = query.limit(limit)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },

  // Get article by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select(`
        *,
        profiles(name)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // Search articles
  search: async (searchTerm) => {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select(`
        *,
        profiles(name)
      `)
      .eq('is_published', true)
      .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}

// Government Schemes API
export const schemesAPI = {
  // Get active schemes
  getAll: async () => {
    const { data, error } = await supabase
      .from('government_schemes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Get scheme by ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('government_schemes')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// File Upload API
export const uploadAPI = {
  // Upload file to Supabase Storage
  uploadFile: async (bucket, file, path) => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file)
    
    if (error) throw error
    return data
  },

  // Get public URL for file
  getPublicUrl: (bucket, path) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  },

  // Delete file
  deleteFile: async (bucket, path) => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
    
    if (error) throw error
  }
}