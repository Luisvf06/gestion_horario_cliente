<template>
  <div class="container mx-auto">
    <div class="mt-4 flex justify-between items-center">
      <button @click="prevPage" :disabled="currentPage === 1" class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800">Anterior</button>
      <button @click="openModal" class="text-green-700 hover:text-white border border-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Crear Ausencia</button>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800">Siguiente</button>
    </div>

    <div id="ausencias-container" class="mt-4 flex justify-center sm:justify-start">
      <div v-if="loading" class="text-center py-4 noAusencias">Cargando ausencias...</div>
      <div v-if="!loading && ausencias.length === 0" class="text-center py-4 noAusencias">No hay ausencias registradas</div>
      <div v-if="!loading && ausencias.length > 0" class="w-full sm:w-3/4">
        <table class="min-w-full bg-gray-800 text-white mt-4">
          <thead class="bg-gray-900 text-white text-center">
            <tr>
              <th class="px-4 py-2">Fecha</th>
              <th class="px-4 py-2">Hora</th>
              <th class="px-4 py-2 acciones-col">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-center">
            <tr v-for="ausencia in paginatedAusencias" :key="ausencia.id">
              <td class="border px-4 py-2">
                <div v-if="editMode[ausencia.id]">
                  <input type="date" v-model="editAusenciaData.fecha" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black">
                </div>
                <div v-else>
                  {{ ausencia.fecha ? ausencia.fecha : 'Todo el día' }}
                </div>
              </td>
              <td class="border px-4 py-2">
                <div v-if="editMode[ausencia.id]">
                  <select v-model="editAusenciaData.hora" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black">
                    <option v-for="franja in franjas" :key="franja.id" :value="franja.hora_desde">
                      {{ franja.hora_desde }}
                    </option>
                  </select>
                </div>
                <div v-else>
                  {{ ausencia.hora ? ausencia.hora : 'Todo el día' }}
                </div>
              </td>
              <td class="border px-4 py-2 acciones-col">
                <div v-if="editMode[ausencia.id]" class="flex space-x-2 justify-center">
                  <button @click="guardarAusencia(ausencia.id)" class="guardar-btn text-green-600 hover:text-white border border-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800">Guardar</button>
                  <button @click="cancelEdit(ausencia.id)" class="cancelar-btn text-gray-700 hover:text-white border border-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-gray-500 dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800">Cancelar</button>
                </div>
                <div v-else class="flex space-x-2 justify-center">
                  <button @click="editAusencia(ausencia)" class="editar-btn text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900">Editar</button>
                  <button @click="confirmEliminarAusencia(ausencia.id)" class="eliminar-btn text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <!-- Modal content -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Crear Nueva Ausencia</h3>
            <div class="mt-2">
              <form @submit.prevent="guardarNuevaAusencia">
                <div class="mt-4">
                  <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha</label>
                  <input type="date" v-model="newAusencia.fecha" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                </div>
                <div class="mt-4">
                  <label for="hora" class="block text-sm font-medium text-gray-700">Hora</label>
                  <select v-model="newAusencia.hora" class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option v-for="franja in franjas" :key="franja.id" :value="franja.hora_desde">
                      {{ franja.hora_desde }}
                    </option>
                  </select>
                </div>
                <div class="mt-4 flex justify-end">
                  <button @click="closeModal" type="button" class="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancelar</button>
                  <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div v-if="showConfirmModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Eliminar Registro</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">¿Está seguro de que quiere eliminar este registro? Esta acción no se puede deshacer.</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="eliminarAusencia(confirmModalId)" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">Eliminar</button>
            <button @click="closeConfirmModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm">Cancelar</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensajes de confirmación -->
    <div v-if="showSuccessMessage" class="fixed bottom-0 right-0 mb-4 mr-4 bg-green-500 text-white p-4 rounded-lg shadow-lg">
      Ausencia creada correctamente.
    </div>
    <div v-if="showDeleteSuccessMessage" class="fixed bottom-0 right-0 mb-4 mr-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
      Ausencia eliminada correctamente.
    </div>
  </div>
</template>

<script>
export default {
  name: 'MisAusencias',
  data() {
    return {
      ausencias: [],
      franjas: [],
      editMode: {},
      newRow: null,
      showModal: false,
      showConfirmModal: false, // Modal de confirmación
      showSuccessMessage: false,
      showDeleteSuccessMessage: false, // Mensaje de éxito de eliminación
      newAusencia: {
        fecha: '',
        hora: ''
      },
      editAusenciaData: {
        fecha: '',
        hora: ''
      },
      currentPage: 1,
      itemsPerPage: 10, // Paginación y número de filas por página
      loading: true,
      userId: null,
      sortOrder: 'desc', // Orden de ordenación inicial a descendente
      confirmModalId: null // ID de la ausencia a eliminar
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.ausencias.length / this.itemsPerPage);
    },
    sortedAusencias() {
      return this.ausencias.sort((a, b) => {
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        if (this.sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    },
    paginatedAusencias() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.sortedAusencias.slice(start, end);
    }
  },
  async mounted() {
    await this.fetchUserId();  // Fetch user ID when the component mounts
    await this.fetchAusencias();
    await this.fetchFranjas();
  },
  methods: {
    async fetchUserId() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/user`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        this.userId = data.id;
      } catch (err) {
        console.error('Error fetching user info:', err);
        alert(`Error fetching user info: ${err.message}`);
      }
    },
    async fetchAusencias() {
      const container = document.getElementById('ausencias-container');
      this.loading = true;
      try {
        const ausencias = await this.getAusencias();
        this.ausencias = ausencias;
      } catch (error) {
        container.innerHTML = `<div class="text-center py-4 text-red-500">Error: ${error.message}</div>`;
      } finally {
        this.loading = false;
      }
    },
    async fetchFranjas() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/franjas`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch franjas: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        this.franjas = data;
      } catch (err) {
        console.error('Error fetching franjas:', err);
      }
    },
    async getAusencias() {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/ausencias`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch ausencias: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data;
      } catch (err) {
        console.error('Error fetching ausencias:', err);
        return [];
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    openConfirmModal(id) {
      this.confirmModalId = id;
      this.showConfirmModal = true;
    },
    closeConfirmModal() {
      this.confirmModalId = null;
      this.showConfirmModal = false;
    },
    async guardarNuevaAusencia() {
      const { fecha, hora } = this.newAusencia;

      const date = new Date(fecha);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${month}/${day}/${year}`;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        console.error('Fecha inválida: la fecha no puede ser anterior a la fecha actual');
        alert('Fecha inválida. La fecha no puede ser anterior a la fecha actual.');
        return;
      }

      const newAusencia = { 
        user_id: this.userId,
        fecha: formattedDate, 
        hora: hora || null
      };

      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        console.log('Enviando petición con token:', token);
        console.log('Datos enviados:', newAusencia);

        const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/ausencias`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newAusencia)
        });

        const responseText = await response.text();
        console.log('Respuesta del servidor:', responseText);

        if (!response.ok) {
          throw new Error(`Failed to create ausencia: ${response.status} ${response.statusText}.`);
        }

        const createdAusencia = JSON.parse(responseText);
        this.ausencias.push(createdAusencia);
        this.newAusencia = { fecha: '', hora: '' };
        this.closeModal();
        this.showSuccessMessage = true;
        setTimeout(() => this.showSuccessMessage = false, 3000);
        await this.fetchAusencias();  // Actualiza tabla después de crear una ausencia
      } catch (err) {
        console.error('Error creating ausencia:', err);
        alert(`Error creating ausencia: ${err.message}`);
      }
    },
    async guardarAusencia(id) {
      const { fecha, hora } = this.editAusenciaData;

      const date = new Date(fecha);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const formattedDate = `${month}/${day}/${year}`;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (date < today) {
        console.error('Fecha inválida: la fecha no puede ser anterior a la fecha actual');
        alert('Fecha inválida. La fecha no puede ser anterior a la fecha actual.');
        return;
      }

      const updatedFields = {};

      const originalAusencia = this.ausencias.find(a => String(a.id) === String(id));

      if (!originalAusencia) {
        console.error(`Ausencia with id ${id} not found`);
        alert(`Ausencia con id ${id} no encontrada.`);
        return;
      }

      if (fecha && originalAusencia.fecha !== formattedDate) {
        updatedFields.fecha = formattedDate;
      }

      if (hora && originalAusencia.hora !== hora) {
        updatedFields.hora = hora;
      }

      if (Object.keys(updatedFields).length === 0) {
        console.log('No changes detected, skipping update.');
        this.editMode = { ...this.editMode, [id]: false };
        return;
      }

      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        console.log('Enviando petición con token:', token);
        console.log('Datos enviados:', updatedFields);

        const response = await fetch(`${import.meta.env.PUBLIC_URL}/api/ausencias/${id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedFields)
        });

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const responseText = await response.text();
          console.log('Server response:', responseText);

          if (!response.ok) {
            throw new Error(`Failed to update ausencia: ${response.status} ${response.statusText}. Details: ${responseText}`);
          }

          const updatedAusencia = JSON.parse(responseText);
          const index = this.ausencias.findIndex(a => a.id === id);
          if (index !== -1) {
            this.ausencias.splice(index, 1, updatedAusencia); 
          }

          this.editMode = { ...this.editMode, [id]: false };

          await this.fetchAusencias();  // Actualiza la tabla después de crear una ausencia
        } else {
          const responseText = await response.text();
          console.log('Unexpected server response:', responseText);
          throw new Error(`Unexpected server response: ${responseText}`);
        }
      } catch (err) {
        console.error('Error updating ausencia:', err);
        alert(`Error updating ausencia: ${err.message}`);
      }
    },
    editAusencia(ausencia) {
      this.editAusenciaData = { fecha: ausencia.fecha, hora: ausencia.hora };
      this.editMode = { ...this.editMode, [ausencia.id]: true };
    },
    cancelEdit(id) {
      this.editMode = { ...this.editMode, [id]: false };
    },
    async eliminarAusencia(id) {
      if (!id) {
        console.error('No id provided for deletion');
        return;
      }
      const token = sessionStorage.getItem('authToken');
      if (!token) {
        throw new Error('No se encontró el token de autenticación');
      }

      console.log('Enviando petición con token:', token);

      fetch(`${import.meta.env.PUBLIC_URL}/api/ausencias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(async response => {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
          const responseText = await response.text();
          console.log('Server response:', responseText);

          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}. Details: ${responseText}`);
          }
          return JSON.parse(responseText);
        } else {
          const responseText = await response.text();
          console.log('Unexpected server response:', responseText);
          throw new Error(`Unexpected server response: ${responseText}`);
        }
      })
      .then(async data => {
        console.log('Ausencia eliminada:', data);
        this.closeConfirmModal(); // Cierra el modal de confirmación después de eliminar
        this.showDeleteSuccessMessage = true; // Muestra el mensaje de éxito de eliminación
        setTimeout(() => this.showDeleteSuccessMessage = false, 3000); // Oculta el mensaje después de 3 segundos

        this.ausencias = this.ausencias.filter(a => a.id !== id);

        await this.fetchAusencias();  // Actualiza tabla después de eliminar una ausencia
      })
      .catch(error => {
        console.error('Error eliminando la ausencia:', error);
        alert(`Error eliminando la ausencia: ${error.message}`);
      });
    },
    confirmEliminarAusencia(id) {
      this.openConfirmModal(id);
    },
    toggleSortOrder() {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    }
  }
}
</script>

<style scoped>

.editar-btn, .eliminar-btn {
  width: 100px; 
  text-align: center;
}

td {
  padding: 0.5rem; 
}

th {
  padding: 0.75rem;
}

.acciones-col {
  width: 150px;
}
.noAusencias {
  color: white;
}

/* Añadir clases para ajustar la tabla en pantallas pequeñas */
@media (max-width: 640px) {
  .container {
    padding: 0; /* Eliminar el padding del contenedor */
  }
  #ausencias-container {
    justify-content: flex-start; /* Alinear el contenido al inicio (izquierda) */
  }
  .acciones-col {
    width: auto; /* Ajustar el ancho de la columna de acciones */
  }
}
</style>
