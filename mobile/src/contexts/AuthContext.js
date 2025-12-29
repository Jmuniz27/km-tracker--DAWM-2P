import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Cargar usuario al iniciar la app
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const accessToken = await AsyncStorage.getItem('access_token');

      if (storedUser && accessToken) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);

        // Verificar que el token siga siendo válido
        try {
          const response = await authAPI.getProfile();
          setUser(response.data);
        } catch (error) {
          // Si el token no es válido, cerrar sesión
          await logout();
        }
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      const { access, refresh } = response.data;

      // Guardar tokens
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);

      // Obtener datos del usuario
      const userResponse = await authAPI.getProfile();
      const userData = userResponse.data;

      await AsyncStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Error en login:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Error al iniciar sesión. Verifica tus credenciales.';

      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user: newUser, tokens } = response.data;

      // Guardar tokens
      await AsyncStorage.setItem('access_token', tokens.access);
      await AsyncStorage.setItem('refresh_token', tokens.refresh);
      await AsyncStorage.setItem('user', JSON.stringify(newUser));

      setUser(newUser);
      setIsAuthenticated(true);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error en registro:', error);
      const errorData = error.response?.data || {};

      // Formatear errores de validación
      let errorMessage = 'Error al registrar usuario.';

      if (errorData.username) {
        errorMessage = `Usuario: ${errorData.username[0]}`;
      } else if (errorData.email) {
        errorMessage = `Email: ${errorData.email[0]}`;
      } else if (errorData.password) {
        errorMessage = `Contraseña: ${errorData.password[0]}`;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar datos locales
      await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = async (newUserData) => {
    try {
      const response = await authAPI.updateProfile(newUserData);
      const updatedUser = response.data;

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return {
        success: false,
        error: 'Error al actualizar perfil',
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
