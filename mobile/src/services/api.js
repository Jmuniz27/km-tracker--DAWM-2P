// Servicio centralizado para peticiones a la API
// NOTA: Antes de usar, instalar dependencias: npm install axios react-native-dotenv @react-native-async-storage/async-storage

// import axios from 'axios';
// import { API_URL } from '@env';

// Descomentar después de instalar las dependencias
/*
const api = axios.create({
  baseURL: API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios para Vehículos
export const vehiculosAPI = {
  getAll: (params = {}) => api.get('/vehicles/', { params }),
  getById: (id) => api.get(`/vehicles/${id}/`),
  create: (data) => api.post('/vehicles/', data),
  update: (id, data) => api.put(`/vehicles/${id}/`, data),
  delete: (id) => api.delete(`/vehicles/${id}/`),
  actualizarKilometraje: (id, kilometraje) =>
    api.post(`/vehicles/${id}/actualizar_kilometraje/`, { kilometraje }),
};

// Servicios para Cargas de Combustible
export const cargasAPI = {
  getAll: (params = {}) => api.get('/fuel-logs/', { params }),
  getById: (id) => api.get(`/fuel-logs/${id}/`),
  create: (data) => api.post('/fuel-logs/', data),
  update: (id, data) => api.put(`/fuel-logs/${id}/`, data),
  delete: (id) => api.delete(`/fuel-logs/${id}/`),
  getEstadisticas: (vehiculoId) =>
    api.get('/fuel-logs/estadisticas/', { params: { vehiculo: vehiculoId } }),
};

// Servicios para Mantenimiento
export const mantenimientoAPI = {
  getAll: (params = {}) => api.get('/maintenance/mantenimientos/', { params }),
  getById: (id) => api.get(`/maintenance/mantenimientos/${id}/`),
  create: (data) => api.post('/maintenance/mantenimientos/', data),
  update: (id, data) => api.put(`/maintenance/mantenimientos/${id}/`, data),
  delete: (id) => api.delete(`/maintenance/mantenimientos/${id}/`),
  getEstadisticas: (vehiculoId) =>
    api.get('/maintenance/mantenimientos/estadisticas/', { params: { vehiculo: vehiculoId } }),
};

// Servicios para Alertas
export const alertasAPI = {
  getAll: (params = {}) => api.get('/maintenance/alertas/', { params }),
  getById: (id) => api.get(`/maintenance/alertas/${id}/`),
  create: (data) => api.post('/maintenance/alertas/', data),
  update: (id, data) => api.put(`/maintenance/alertas/${id}/`, data),
  delete: (id) => api.delete(`/maintenance/alertas/${id}/`),
  getVencidas: (vehiculoId) =>
    api.get('/maintenance/alertas/vencidas/', { params: { vehiculo: vehiculoId } }),
};

export default api;
*/

// Exportación temporal mientras se instalan dependencias
export const vehiculosAPI = {};
export const cargasAPI = {};
export const mantenimientoAPI = {};
export const alertasAPI = {};
