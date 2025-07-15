import { supabase, handleSupabaseError } from './supabase.js'

// Inicializar sesión
export async function initAuth() {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      updateUserUI(session.user)
    } else {
      window.location.href = 'login.html'
    }
  })

  // Verificar sesión al cargar
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) window.location.href = 'login.html'
}

// Actualizar UI con info de usuario
function updateUserUI(user) {
  const avatar = document.getElementById('user-avatar')
  const name = document.getElementById('user-name')
  
  // Extraer iniciales
  const names = user.email.split('@')[0].split('.')
  const initials = names.map(n => n[0].toUpperCase()).join('')
  
  avatar.textContent = initials
  name.textContent = user.email
}

// Cerrar sesión
document.getElementById('btn-logout').addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut()
  if (!error) window.location.href = 'login.html'
})

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initAuth)