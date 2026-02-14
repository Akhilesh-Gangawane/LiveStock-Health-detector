import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

export const useAnimals = () => {
  const [animals, setAnimals] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { showError, showSuccess } = useApp()

  const fetchAnimals = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await db.animals.getAll(user.id)
      if (error) throw error
      setAnimals(data || [])
    } catch (error) {
      showError('Failed to load animals: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addAnimal = async (animalData) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      const { data, error } = await db.animals.create({
        ...animalData,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      
      if (error) throw error
      
      setAnimals(prev => [data[0], ...prev])
      showSuccess('Animal added successfully!')
      return { success: true, data: data[0] }
    } catch (error) {
      showError('Failed to add animal: ' + error.message)
      return { success: false, error: error.message }
    }
  }

  const updateAnimal = async (id, updates) => {
    try {
      const { data, error } = await db.animals.update(id, updates)
      if (error) throw error
      
      setAnimals(prev => prev.map(animal => 
        animal.id === id ? data[0] : animal
      ))
      showSuccess('Animal updated successfully!')
      return { success: true, data: data[0] }
    } catch (error) {
      showError('Failed to update animal: ' + error.message)
      return { success: false, error: error.message }
    }
  }

  const deleteAnimal = async (id) => {
    try {
      const { error } = await db.animals.delete(id)
      if (error) throw error
      
      setAnimals(prev => prev.filter(animal => animal.id !== id))
      showSuccess('Animal deleted successfully!')
      return { success: true }
    } catch (error) {
      showError('Failed to delete animal: ' + error.message)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchAnimals()
  }, [user])

  return {
    animals,
    loading,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    refetch: fetchAnimals
  }
}

export const useHealthRecords = () => {
  const [healthRecords, setHealthRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { showError, showSuccess } = useApp()

  const fetchHealthRecords = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await db.healthRecords.getAll(user.id)
      if (error) throw error
      setHealthRecords(data || [])
    } catch (error) {
      showError('Failed to load health records: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addHealthRecord = async (recordData) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      const { data, error } = await db.healthRecords.create({
        ...recordData,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      
      if (error) throw error
      
      setHealthRecords(prev => [data[0], ...prev])
      showSuccess('Health record added successfully!')
      return { success: true, data: data[0] }
    } catch (error) {
      showError('Failed to add health record: ' + error.message)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchHealthRecords()
  }, [user])

  return {
    healthRecords,
    loading,
    addHealthRecord,
    refetch: fetchHealthRecords
  }
}

export const useFarms = () => {
  const [farms, setFarms] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { showError, showSuccess } = useApp()

  const fetchFarms = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await db.farms.getAll(user.id)
      if (error) throw error
      setFarms(data || [])
    } catch (error) {
      showError('Failed to load farms: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addFarm = async (farmData) => {
    if (!user) return { success: false, error: 'Not authenticated' }

    try {
      const { data, error } = await db.farms.create({
        ...farmData,
        user_id: user.id,
        created_at: new Date().toISOString()
      })
      
      if (error) throw error
      
      setFarms(prev => [data[0], ...prev])
      showSuccess('Farm added successfully!')
      return { success: true, data: data[0] }
    } catch (error) {
      showError('Failed to add farm: ' + error.message)
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchFarms()
  }, [user])

  return {
    farms,
    loading,
    addFarm,
    refetch: fetchFarms
  }
}

export const useVets = () => {
  const [vets, setVets] = useState([])
  const [loading, setLoading] = useState(false)
  const { showError } = useApp()

  const fetchVets = async (location = '') => {
    setLoading(true)
    try {
      const { data, error } = location 
        ? await db.vets.getByLocation(location)
        : await db.vets.getAll()
      
      if (error) throw error
      setVets(data || [])
    } catch (error) {
      showError('Failed to load veterinarians: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVets()
  }, [])

  return {
    vets,
    loading,
    searchVets: fetchVets,
    refetch: fetchVets
  }
}