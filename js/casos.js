import { supabase, handleSupabaseError, getCurrentUser } from './supabase.js'

export async function createCaso(casoData) {
  const user = await getCurrentUser()
  
  const completeData = {
    ...casoData,
    responsable: user.email,
    estado: 'Abierto',
    fecha: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('casos')
    .insert([completeData])
    .select()

  if (error) return handleSupabaseError(error)
  return data[0]
}

export async function getCasos(filters = {}) {
  let query = supabase
    .from('casos')
    .select('*')
    .order('fecha', { ascending: false })

  // Aplicar filtros
  if (filters.estado) query = query.eq('estado', filters.estado)
  if (filters.area) query = query.eq('area', filters.area)
  if (filters.responsable) query = query.eq('responsable', filters.responsable)
  if (filters.search) query = query.ilike('hallazgo', `%${filters.search}%`)

  const { data, error } = await query

  if (error) return handleSupabaseError(error)
  return data
}

export async function updateCaso(id, updates) {
  const { data, error } = await supabase
    .from('casos')
    .update(updates)
    .eq('id_caso', id)
    .select()

  if (error) return handleSupabaseError(error)
  return data[0]
}

export async function deleteCaso(id) {
  const { error } = await supabase
    .from('casos')
    .delete()
    .eq('id_caso', id)

  if (error) return handleSupabaseError(error)
  return true
}

// Inicializar eventos relacionados con casos
document.addEventListener('DOMContentLoaded', () => {
  // Quick case form
  document.getElementById('quick-case-form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const hallazgo = document.getElementById('quick-hallazgo').value
    
    const result = await createCaso({
      hallazgo,
      area: 'General',
      prioridad: 'Media'
    })

    if (result) {
      alert('Caso creado exitosamente!')
      document.getElementById('quick-hallazgo').value = ''
      document.getElementById('quick-case-modal').style.display = 'none'
      // Refresh dashboard
      loadDashboard()
    }
  })

  // Modal controls
  document.getElementById('btn-quick-case').addEventListener('click', () => {
    document.getElementById('quick-case-modal').style.display = 'block'
  })

  document.querySelector('.close-modal').addEventListener('click', () => {
    document.getElementById('quick-case-modal').style.display = 'none'
  })
})