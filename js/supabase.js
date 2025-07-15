import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://vdjsgllncfekshbdvqpw.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkanNnbGxuY2Zla3NoYmR2cXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1OTUzODIsImV4cCI6MjA2ODE3MTM4Mn0.W8J9be_dE_aqc5ES7eurInCpl8MEbc7KlQZj3bLs3Fs'
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
