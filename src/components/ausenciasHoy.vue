<template>
  <div class="container mx-auto">
    <div class="mt-4 flex justify-center">
      <input type="date" v-model="selectedDate" class="px-4 py-2 border rounded-md text-black" />
      <button @click="fetchFaltas" class="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md">Buscar día</button>
      <button @click="generatePDF" :disabled="loading" class="ml-4 px-4 py-2 bg-green-500 text-white rounded-md flex items-center justify-center">
        <span v-if="!loading">Generar PDF</span>
        <svg v-if="loading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
    </div>
    <div id="faltas-container" class="mt-4 flex justify-center">
      <div class="text-center py-4 text-white">Cargando faltas...</div>
    </div>
    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
        <p class="text-black mb-4">{{ modalMessage }}</p>
        <div class="flex justify-end">
          <button @click="confirmAction" class="px-4 py-2 bg-red-500 text-white rounded-md">Confirmar</button>
          <button @click="closeModal" class="px-4 py-2 bg-blue-500 text-white rounded-md ml-2">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FaltasHoy',
  data() {
    return {
      faltas: [],
      diaSemana: '',
      selectedDate: '',
      loading: false,
      showModal: false,
      modalMessage: '',
      modalAction: null
    };
  },
  async mounted() {
    this.setDefaultDate();
    this.setDiaSemana();
    await this.fetchFaltas();
  },
  methods: {
    setDefaultDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      this.selectedDate = `${year}-${month}-${day}`;
    },
    setDiaSemana() {
      const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
      const today = new Date(this.selectedDate);
      this.diaSemana = days[today.getDay()];
    },
    async fetchFaltas() {
      this.setDiaSemana();
      const container = document.getElementById('faltas-container');
      container.innerHTML = '<div class="text-center py-4 text-white">Cargando faltas...</div>';
      try {
        const faltas = await this.getFaltas();
        console.log('Datos almacenados en el estado:', faltas);
        this.faltas = Array.isArray(faltas.ausencias) ? faltas.ausencias : [];
        if (this.faltas.length === 0) {
          container.innerHTML = '<div class="text-center py-4 text-white">No hay faltas registradas para hoy</div>';
        } else {
          this.renderTable();
        }
      } catch (error) {
        container.innerHTML = `<div class="text-center py-4 text-red-500">Error: ${error.message}</div>`;
      }
    },
    async getFaltas() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const selectedDate = new Date(this.selectedDate);
        const mes = selectedDate.getMonth() + 1; // Obtener mes elegido
        const dia = selectedDate.getDate(); // Obtener día 

        const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/ausencias/mes/${mes}/dia/${dia}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch faltas: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Datos recibidos de la API:', data);
        return data;
      } catch (err) {
        console.error('Error fetching faltas:', err);
        return { ausencias: [] };
      }
    },
    renderTable() {
      const container = document.getElementById('faltas-container');
      const tableContainer = document.createElement('div');
      tableContainer.className = 'w-3/4';

      const table = document.createElement('table');
      table.className = 'min-w-full bg-white mt-4';

      const thead = document.createElement('thead');
      thead.className = 'bg-gray-800 text-white';
      thead.innerHTML = `
        <tr>
          <th class="w-1/6 px-4 py-2">Nombre</th>
          <th class="w-1/6 px-4 py-2">Fecha</th>
          <th class="w-1/6 px-4 py-2">Hora</th>
          <th class="w-1/6 px-4 py-2">Aula</th>
          <th class="w-1/6 px-4 py-2">Grupo</th>
        </tr>
      `;
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      this.faltas.forEach(falta => {
  const franjasCorrespondientes = falta.user.horarios.filter(horario => horario.dia === this.diaSemana && horario.franja.hora_desde === falta.hora);
  if (franjasCorrespondientes.length > 0) {
    franjasCorrespondientes.forEach(franjaCorrespondiente => {
      const tr = document.createElement('tr');
      tr.innerHTML = this.getReadOnlyRow(falta, franjaCorrespondiente);
      tbody.appendChild(tr);
    });
  } else {
    const tr = document.createElement('tr');
    tr.innerHTML = this.getNoDataRow(falta);
    tbody.appendChild(tr);
  }
});
      table.appendChild(tbody);

      tableContainer.appendChild(table);
      container.innerHTML = '';
      container.appendChild(tableContainer);
    },
    getReadOnlyRow(falta, horario) {
      const fechaFormateada = new Date(falta.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const hora = falta.hora ? falta.hora : 'todo el día';

      return `
        <td class="border px-4 py-2 text-black">${falta.user.name}</td>
        <td class="border px-4 py-2 text-black">${fechaFormateada}</td>
        <td class="border px-4 py-2 text-black">${hora}</td>
        <td class="border px-4 py-2 text-black">${horario.aula.descripcion}</td>
        <td class="border px-4 py-2 text-black">${horario.grupo.descripcion}</td>
      `;
    },
    getNoDataRow(falta) {
      const fechaFormateada = new Date(falta.fecha).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });

      const hora = falta.hora ? falta.hora : 'todo el día';

      return `
        <td class="border px-4 py-2 text-black">${falta.user.name}</td>
        <td class="border px-4 py-2 text-black">${fechaFormateada}</td>
        <td class="border px-4 py-2 text-black">${hora}</td>
        <td class="border px-4 py-2 text-black" colspan="2">No hay datos</td>
      `;
    },
    generatePDF() {
      this.loading = true; // Establece loading a true
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        this.modalMessage = 'No se encontró el token de autenticación';
        this.showModal = true;
        this.loading = false; // Establecer loading a false si hay un error
        return;
      }

      const url = `${import.meta.env.PUBLIC_URL}/api/generate-pdf?date=${this.selectedDate}`;
      fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.message) {
          this.modalMessage = data.message;
          this.showModal = true;
        }
        this.loading = false; 
      })
      .catch(error => {
        console.error('Error generating PDF:', error);
        this.modalMessage = 'Error generating PDF';
        this.showModal = true;
        this.loading = false;
      });
    },
    confirmAction() {
      if (this.modalAction) {
        this.modalAction();
        this.closeModal();
      }
    },
    closeModal() {
      this.showModal = false;
      this.modalMessage = '';
      this.modalAction = null; 
    },
    showDeleteConfirmation(action) {
      this.modalMessage = '¿Estás seguro de que quieres eliminar esta falta?';
      this.modalAction = action;
      this.showModal = true;
    }
  }
}
</script>

<style scoped>
.text-white {
  color: white;
}
.text-black {
  color: black;
}
.min-w-full {
  min-width: 100%;
}
</style>
