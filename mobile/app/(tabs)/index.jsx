import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { vehiculosAPI, cargasAPI, mantenimientoAPI, alertasAPI } from '../../src/services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    vehicles: 0,
    fuelLogs: 0,
    maintenances: 0,
    activeAlerts: 0,
  });
  const [recentFuel, setRecentFuel] = useState([]);
  const [urgentAlerts, setUrgentAlerts] = useState([]);

  const loadDashboardData = useCallback(async (isRefreshing = false) => {
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

      const vehicles = vehiclesRes.data.results || vehiclesRes.data || [];
      const fuel = fuelRes.data.results || fuelRes.data || [];
      const maintenances = maintenanceRes.data.results || maintenanceRes.data || [];
      const alerts = alertsRes.data.results || alertsRes.data || [];

      // Calcular alertas activas
      const activeAlerts = alerts.filter(a => {
        if (a.completada) return false;
        if (a.tipo_alerta === 'Kilometraje') {
          return a.vehiculo_detalle?.kilometraje_actual < a.kilometraje_objetivo;
        } else {
          return new Date() < new Date(a.fecha_objetivo);
        }
      });

      // Obtener últimas 3 cargas de combustible
      const sortedFuel = [...fuel].sort((a, b) =>
        new Date(b.fecha) - new Date(a.fecha)
      ).slice(0, 3);

      // Obtener alertas urgentes (prioridad Alta o Urgente)
      const urgent = alerts.filter(a =>
        !a.completada && (a.prioridad === 'Alta' || a.prioridad === 'Urgente')
      ).slice(0, 3);

      setStats({
        vehicles: vehicles.length,
        fuelLogs: fuel.length,
        maintenances: maintenances.length,
        activeAlerts: activeAlerts.length,
      });
      setRecentFuel(sortedFuel);
      setUrgentAlerts(urgent);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData(true);
  }, [loadDashboardData]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
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
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {user?.first_name || user?.username || 'Usuario'}
            </Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/vehicles')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <MaterialCommunityIcons name="car" size={32} color="#007AFF" />
            </View>
            <Text style={styles.statValue}>{stats.vehicles}</Text>
            <Text style={styles.statLabel}>Vehículos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/fuel')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#FFF3E0' }]}>
              <MaterialCommunityIcons name="gas-station" size={32} color="#FF9500" />
            </View>
            <Text style={styles.statValue}>{stats.fuelLogs}</Text>
            <Text style={styles.statLabel}>Cargas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/maintenance')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <MaterialCommunityIcons name="wrench" size={32} color="#34C759" />
            </View>
            <Text style={styles.statValue}>{stats.maintenances}</Text>
            <Text style={styles.statLabel}>Mantenimientos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => router.push('/alerts')}
            activeOpacity={0.7}
          >
            <View style={[styles.statIconContainer, { backgroundColor: '#FFEBEE' }]}>
              <MaterialCommunityIcons name="bell" size={32} color="#FF3B30" />
            </View>
            <Text style={styles.statValue}>{stats.activeAlerts}</Text>
            <Text style={styles.statLabel}>Alertas Activas</Text>
          </TouchableOpacity>
        </View>

        {/* Alertas Urgentes */}
        {urgentAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Alertas Urgentes</Text>
              <TouchableOpacity onPress={() => router.push('/alerts')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {urgentAlerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertItem}
                onPress={() => router.push(`/alerts/${alert.id}`)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.alertPriority,
                  { backgroundColor: alert.prioridad === 'Urgente' ? '#FF3B30' : '#FF9500' }
                ]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle} numberOfLines={1}>
                    {alert.titulo}
                  </Text>
                  <Text style={styles.alertVehicle} numberOfLines={1}>
                    {alert.vehiculo_detalle?.marca} {alert.vehiculo_detalle?.modelo}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Últimas Cargas de Combustible */}
        {recentFuel.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Cargas</Text>
              <TouchableOpacity onPress={() => router.push('/fuel')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            </View>
            {recentFuel.map((fuel) => (
              <TouchableOpacity
                key={fuel.id}
                style={styles.fuelItem}
                onPress={() => router.push(`/fuel/${fuel.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.fuelIconContainer}>
                  <MaterialCommunityIcons name="gas-station" size={24} color="#FF9500" />
                </View>
                <View style={styles.fuelContent}>
                  <Text style={styles.fuelVehicle} numberOfLines={1}>
                    {fuel.vehiculo_detalle?.marca} {fuel.vehiculo_detalle?.modelo}
                  </Text>
                  <Text style={styles.fuelDate}>{formatDate(fuel.fecha)}</Text>
                </View>
                <View style={styles.fuelRight}>
                  <Text style={styles.fuelLiters}>{fuel.galones} gal</Text>
                  <Text style={styles.fuelPrice}>${parseFloat(fuel.costo_total).toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Empty State */}
        {stats.vehicles === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="car-off" size={64} color="#8E8E93" />
            <Text style={styles.emptyTitle}>Comienza a usar KmTracker</Text>
            <Text style={styles.emptyText}>
              Registra tu primer vehículo para empezar a llevar el control de combustible, mantenimiento y más.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/vehicles/create')}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.emptyButtonText}>Agregar Vehículo</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
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
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  seeAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  alertPriority: {
    width: 4,
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  alertContent: {
    flex: 1,
    marginLeft: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  alertVehicle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fuelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fuelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fuelContent: {
    flex: 1,
  },
  fuelVehicle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  fuelDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  fuelRight: {
    alignItems: 'flex-end',
  },
  fuelLiters: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  fuelPrice: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
