import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://tu-proyecto.supabase.co'
const supabaseKey = 'tu-clave-publica'
export const supabase = createClient(supabaseUrl, supabaseKey)

// Función para obtener el usuario actual
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Función para manejar errores
export function handleSupabaseError(error) {
  console.error('Error Supabase:', error)
  alert(`Error: ${error.message}`)
  return null
}