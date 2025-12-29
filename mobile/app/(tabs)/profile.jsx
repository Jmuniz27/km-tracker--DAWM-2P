import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { vehiculosAPI, cargasAPI, mantenimientoAPI, alertasAPI } from '../../src/services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    vehicles: 0,
    fuelLogs: 0,
    maintenances: 0,
    alerts: 0,
  });

  const loadStats = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const [vehiclesRes, fuelRes, maintenanceRes, alertsRes] = await Promise.all([
        vehiculosAPI.getAll(),
        cargasAPI.getAll(),
        mantenimientoAPI.getAll(),
        alertasAPI.getAll(),
      ]);

      setStats({
        vehicles: (vehiclesRes.data.results || vehiclesRes.data || []).length,
        fuelLogs: (fuelRes.data.results || fuelRes.data || []).length,
        maintenances: (maintenanceRes.data.results || maintenanceRes.data || []).length,
        alerts: (alertsRes.data.results || alertsRes.data || []).length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadStats(true);
  }, [loadStats]);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleChangePassword = () => {
    router.push('/profile/change-password');
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const getInitials = () => {
    if (!user) return 'U';
    const firstName = user.first_name || user.username || '';
    const lastName = user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.username.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: isMobile ? 16 : 24 }
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Mi Perfil</Text>
        </View>

        {/* Avatar y datos del usuario */}
        <View style={styles.userSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username || 'Usuario'}
            </Text>
            <Text style={styles.userEmail}>{user?.email || 'Sin email'}</Text>
            <Text style={styles.userDate}>
              Miembro desde {formatDate(user?.date_joined)}
            </Text>
          </View>
        </View>

        {/* Estadísticas */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Estadísticas</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="car" size={32} color="#007AFF" />
              <Text style={styles.statValue}>{stats.vehicles}</Text>
              <Text style={styles.statLabel}>Vehículos</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="gas-station" size={32} color="#FF9500" />
              <Text style={styles.statValue}>{stats.fuelLogs}</Text>
              <Text style={styles.statLabel}>Cargas</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="wrench" size={32} color="#34C759" />
              <Text style={styles.statValue}>{stats.maintenances}</Text>
              <Text style={styles.statLabel}>Mantenimientos</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="bell" size={32} color="#FF3B30" />
              <Text style={styles.statValue}>{stats.alerts}</Text>
              <Text style={styles.statLabel}>Alertas</Text>
            </View>
          </View>
        </View>

        {/* Opciones */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Configuración</Text>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleEditProfile}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons name="account-edit" size={24} color="#007AFF" />
            </View>
            <Text style={styles.optionText}>Editar Perfil</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons name="lock-reset" size={24} color="#007AFF" />
            </View>
            <Text style={styles.optionText}>Cambiar Contraseña</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.optionIconContainer}>
              <MaterialCommunityIcons name="logout" size={24} color="#FF3B30" />
            </View>
            <Text style={[styles.optionText, styles.logoutText]}>Cerrar Sesión</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Versión */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>KmTracker v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  header: {
    paddingTop: 44,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  userSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  statsSection: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  optionsSection: {
    marginVertical: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  logoutButton: {
    marginTop: 12,
  },
  logoutText: {
    color: '#FF3B30',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
