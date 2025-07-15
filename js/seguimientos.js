import { supabase, handleSupabaseError, getCurrentUser } from './supabase.js'

export async function addSeguimiento(idCaso, descripcion, novedad = 'Sin novedad') {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('seguimientos')
    .insert([{
      id_caso: idCaso,
      descripcion,
      novedad,
      responsable: user.email
    }])
    .select()

  if (error) return handleSupabaseError(error)
  return data[0]
}

export async function getSeguimientosByCaso(idCaso) {
  const { data, error } = await supabase
    .from('seguimientos')
    .select('*')
    .eq('id_caso', idCaso)
    .order('created_at', { ascending: false })

  if (error) return handleSupabaseError(error)
  return data
}

export async function getRecentSeguimientos(limit = 5) {
  const { data, error } = await supabase
    .from('seguimientos')
    .select('*, casos(hallazgo, area)')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return handleSupabaseError(error)
  return data
}