import { supabase, handleSupabaseError } from './supabase.js'
import { getCasos, createCaso } from './casos.js'
import { getRecentSeguimientos } from './seguimientos.js'

// Cargar dashboard
export async function loadDashboard() {
  // Obtener estadísticas
  const casos = await getCasos()
  if (!casos) return

  // Calcular estadísticas
  const stats = {
    total: casos.length,
    abiertos: casos.filter(c => c.estado === 'Abierto').length,
    proceso: casos.filter(c => c.estado === 'En Proceso').length,
    cerrados: casos.filter(c => c.estado === 'Cerrado').length,
    porArea: {}
  }

  casos.forEach(caso => {
    stats.porArea[caso.area] = (stats.porArea[caso.area] || 0) + 1
  })

  // Actualizar UI
  updateStatsUI(stats)
  
  // Cargar últimos casos
  loadRecentCasos(casos.slice(0, 5))
  
  // Cargar últimos seguimientos
  const seguimientos = await getRecentSeguimientos()
  if (seguimientos) loadRecentSeguimientos(seguimientos)
}

function updateStatsUI(stats) {
  document.getElementById('total-cases').textContent = stats.total
  document.getElementById('open-cases').textContent = stats.abiertos
  document.getElementById('progress-cases').textContent = stats.proceso
  document.getElementById('closed-cases').textContent = stats.cerrados

  // Actualizar gráfico de áreas
  const areaCtx = document.getElementById('area-chart').getContext('2d')
  new Chart(areaCtx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(stats.porArea),
      datasets: [{
        data: Object.values(stats.porArea),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'
        ]
      }]
    }
  })
}

function loadRecentCasos(casos) {
  const container = document.getElementById('recent-cases')
  container.innerHTML = casos.map(caso => `
    <div class="case-card">
      <div class="case-header">
        <span class="case-id">#${caso.id_caso.substring(0, 8)}</span>
        <span class="case-priority ${caso.prioridad.toLowerCase()}">${caso.prioridad}</span>
      </div>
      <h4>${caso.hallazgo.substring(0, 50)}${caso.hallazgo.length > 50 ? '...' : ''}</h4>
      <div class="case-meta">
        <span><i class="fas fa-folder"></i> ${caso.area}</span>
        <span><i class="fas fa-user"></i> ${caso.responsable.split('@')[0]}</span>
      </div>
      <div class="case-footer">
        <span class="case-status ${caso.estado.replace(' ', '-').toLowerCase()}">${caso.estado}</span>
        <span class="case-date">${new Date(caso.fecha).toLocaleDateString()}</span>
      </div>
    </div>
  `).join('')
}

function loadRecentSeguimientos(seguimientos) {
  const container = document.getElementById('recent-followups')
  container.innerHTML = seguimientos.map(seg => `
    <div class="followup-item">
      <div class="followup-header">
        <span class="followup-case">Caso: ${seg.casos.hallazgo.substring(0, 30)}...</span>
        <span class="followup-novelty ${seg.novedad.replace(' ', '-').toLowerCase()}">${seg.novedad}</span>
      </div>
      <p>${seg.descripcion}</p>
      <div class="followup-footer">
        <span><i class="fas fa-user"></i> ${seg.responsable.split('@')[0]}</span>
        <span>${new Date(seg.created_at).toLocaleString()}</span>
      </div>
    </div>
  `).join('')
}

// Inicializar dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Cargar dashboard por defecto
  if (document.getElementById('dashboard-section').classList.contains('active')) {
    loadDashboard()
  }

  // Navegación entre secciones
  document.querySelectorAll('.nav-menu li').forEach(item => {
    item.addEventListener('click', () => {
      // Remover clase active de todos
      document.querySelectorAll('.nav-menu li').forEach(i => i.classList.remove('active'))
      document.querySelectorAll('.section-content').forEach(s => s.classList.remove('active'))
      
      // Agregar active al seleccionado
      item.classList.add('active')
      const section = item.getAttribute('data-section')
      document.getElementById(`${section}-section`).classList.add('active')
      document.getElementById('section-title').textContent = item.textContent.trim()
      
      // Cargar contenido dinámico
      if (section === 'dashboard') loadDashboard()
      if (section === 'casos') loadAllCasos()
      if (section === 'seguimientos') loadAllSeguimientos()
    })
  })
})

// Función para cargar todos los casos
async function loadAllCasos() {
  const casos = await getCasos()
  if (!casos) return

  const container = document.getElementById('casos-section')
  container.innerHTML = `
    <div class="section-toolbar">
      <div class="filters">
        <select id="filter-status">
          <option value="">Todos los estados</option>
          <option value="Abierto">Abierto</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Cerrado">Cerrado</option>
        </select>
        <select id="filter-area">
          <option value="">Todas las áreas</option>
          <option value="TI">TI</option>
          <option value="Operaciones">Operaciones</option>
          <option value="RRHH">RRHH</option>
        </select>
        <button id="btn-apply-filters">Aplicar</button>
      </div>
      <button id="btn-export-cases" class="btn-secondary">
        <i class="fas fa-file-export"></i> Exportar
      </button>
    </div>
    <div class="table-container">
      <table id="cases-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Fecha</th>
            <th>Hallazgo</th>
            <th>Área</th>
            <th>Responsable</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${casos.map(caso => `
            <tr>
              <td>${caso.id_caso.substring(0, 8)}</td>
              <td>${new Date(caso.fecha).toLocaleDateString()}</td>
              <td>${caso.hallazgo.substring(0, 50)}${caso.hallazgo.length > 50 ? '...' : ''}</td>
              <td>${caso.area}</td>
              <td>${caso.responsable.split('@')[0]}</td>
              <td><span class="status-badge ${caso.estado.replace(' ', '-').toLowerCase()}">${caso.estado}</span></td>
              <td>
                <button class="btn-icon btn-view-case" data-id="${caso.id_caso}">
                  <i class="fas fa-eye"></i>
                </button>
                <button class="btn-icon btn-edit-case" data-id="${caso.id_caso}">
                  <i class="fas fa-edit"></i>
                </button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `

  // Configurar eventos de filtrado
  document.getElementById('btn-apply-filters').addEventListener('click', async () => {
    const status = document.getElementById('filter-status').value
    const area = document.getElementById('filter-area').value
    
    const filtered = await getCasos({
      estado: status || undefined,
      area: area || undefined
    })
    
    if (filtered) {
      const tbody = document.querySelector('#cases-table tbody')
      tbody.innerHTML = filtered.map(caso => `
        <tr>
          <td>${caso.id_caso.substring(0, 8)}</td>
          <td>${new Date(caso.fecha).toLocaleDateString()}</td>
          <td>${caso.hallazgo.substring(0, 50)}${caso.hallazgo.length > 50 ? '...' : ''}</td>
          <td>${caso.area}</td>
          <td>${caso.responsable.split('@')[0]}</td>
          <td><span class="status-badge ${caso.estado.replace(' ', '-').toLowerCase()}">${caso.estado}</span></td>
          <td>
            <button class="btn-icon btn-view-case" data-id="${caso.id_caso}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn-icon btn-edit-case" data-id="${caso.id_caso}">
              <i class="fas fa-edit"></i>
            </button>
          </td>
        </tr>
      `).join('')
    }
  })
}