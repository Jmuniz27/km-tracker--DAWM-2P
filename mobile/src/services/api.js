import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, API_URL_PRODUCTION } from '@env';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_URL_PRODUCTION || API_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT a las peticiones
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al obtener token:', error);
    }
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y refrescar tokens
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no hemos intentado refrescar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');

        if (refreshToken) {
          const baseURL = API_URL_PRODUCTION || API_URL || 'http://127.0.0.1:8000/api';
          const response = await axios.post(
            `${baseURL}/auth/refresh/`,
            { refresh: refreshToken }
          );

          const { access } = response.data;
          await AsyncStorage.setItem('access_token', access);

          // Reintentar la petición original con el nuevo token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, limpiar tokens y redirigir al login
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
        console.error('Error al refrescar token:', refreshError);
        return Promise.reject(refreshError);
      }
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios de Autenticación
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login/', { username, password }),

  register: (userData) =>
    api.post('/auth/register/', userData),

  logout: async () => {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    return api.post('/auth/logout/', { refresh: refreshToken });
  },

  getProfile: () =>
    api.get('/auth/me/'),

  updateProfile: (data) =>
    api.put('/auth/me/', data),

  changePassword: (oldPassword, newPassword, newPassword2) =>
    api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
      new_password2: newPassword2,
    }),
};

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
