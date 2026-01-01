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
import { vehiculosAPI, cargasAPI, alertasAPI } from '../../src/services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  calcularRendimientoPorVehiculo,
  calcularRendimientoPromedio,
  compararRendimientoMensual,
  clasificarEficiencia,
  formatearRendimiento,
} from '../../src/utils/fuelCalculations';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [fuelLogs, setFuelLogs] = useState([]);
  const [alertasActivas, setAlertasActivas] = useState(0);
  const [rendimientoGeneral, setRendimientoGeneral] = useState(null);
  const [rendimientosPorVehiculo, setRendimientosPorVehiculo] = useState([]);
  const [comparacionMensual, setComparacionMensual] = useState(null);

  const loadDashboardData = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const [vehiclesRes, fuelRes, alertsRes] = await Promise.all([
        vehiculosAPI.getAll(),
        cargasAPI.getAll(),
        alertasAPI.getAll(),
      ]);

      const vehiclesData = vehiclesRes.data.results || vehiclesRes.data || [];
      const fuelData = fuelRes.data.results || fuelRes.data || [];
      const alerts = alertsRes.data.results || alertsRes.data || [];

      setVehicles(vehiclesData);
      setFuelLogs(fuelData);

      // Calcular alertas activas
      const activeAlerts = alerts.filter(a => {
        if (a.completada) return false;
        if (a.tipo_alerta === 'Kilometraje') {
          return a.vehiculo_detalle?.kilometraje_actual < a.kilometraje_objetivo;
        } else {
          return new Date() < new Date(a.fecha_objetivo);
        }
      });
      setAlertasActivas(activeAlerts.length);

      // Calcular rendimiento general
      const rendimientoGral = calcularRendimientoPromedio(fuelData);
      setRendimientoGeneral(rendimientoGral);

      // Calcular rendimiento por vehículo
      const rendimientosVeh = calcularRendimientoPorVehiculo(fuelData);
      rendimientosVeh.sort((a, b) => b.rendimiento_promedio - a.rendimiento_promedio);
      setRendimientosPorVehiculo(rendimientosVeh);

      // Comparar rendimiento mensual
      const comparacion = compararRendimientoMensual(fuelData);
      setComparacionMensual(comparacion);
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

  const getVehiculoNombre = (vehiculoId) => {
    if (typeof vehiculoId === 'object' && vehiculoId !== null) {
      return `${vehiculoId.marca} ${vehiculoId.modelo}`;
    }
    const vehiculo = vehicles.find(v => v.id === vehiculoId);
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Vehículo desconocido';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const eficienciaGeneral = clasificarEficiencia(rendimientoGeneral);
  const totalGastado = fuelLogs.reduce((sum, c) => sum + parseFloat(c.costo_total || 0), 0);

  // Calcular total gastado este mes
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();
  const gastoMesActual = fuelLogs
    .filter(c => {
      const fecha = new Date(c.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    })
    .reduce((sum, c) => sum + parseFloat(c.costo_total || 0), 0);

  // Obtener últimas 3 cargas
  const recentFuel = [...fuelLogs]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 3);

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
        {/* Header con Saludo + Botón Alertas */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>
              {user?.first_name || user?.username || 'Usuario'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/alerts')}
            style={styles.alertButton}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="bell" size={28} color="#007AFF" />
            {alertasActivas > 0 && (
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{alertasActivas}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Rendimiento Promedio General (Azul) */}
        {rendimientoGeneral !== null && (
          <View style={[styles.card, styles.highlightCard]}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="gauge" size={24} color="#FFFFFF" />
              <Text style={styles.highlightCardTitle}>Rendimiento Promedio General</Text>
            </View>
            <Text style={styles.highlightValue}>
              {formatearRendimiento(rendimientoGeneral)}
            </Text>
            <View style={styles.efficiencyBadge}>
              <MaterialCommunityIcons
                name={eficienciaGeneral.icon}
                size={16}
                color={eficienciaGeneral.color}
              />
              <Text style={[styles.efficiencyText, { color: eficienciaGeneral.color }]}>
                {eficienciaGeneral.label}
              </Text>
            </View>
          </View>
        )}

        {/* Grid de 4 Estadísticas */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="gas-station" size={24} color="#007AFF" />
            <Text style={styles.statValue}>{fuelLogs.length}</Text>
            <Text style={styles.statLabel}>Cargas totales</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="cash" size={24} color="#34C759" />
            <Text style={styles.statValue}>${totalGastado.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Total gastado</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="calendar-month" size={24} color="#FF9500" />
            <Text style={styles.statValue}>${gastoMesActual.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Gasto este mes</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialCommunityIcons name="car-multiple" size={24} color="#8E8E93" />
            <Text style={styles.statValue}>{vehicles.length}</Text>
            <Text style={styles.statLabel}>Vehículos</Text>
          </View>
        </View>

        {/* Comparación Mensual */}
        {comparacionMensual && comparacionMensual.diferencia !== null && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="calendar-compare" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>Comparación Mensual</Text>
            </View>
            <View style={styles.comparisonRow}>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Mes anterior</Text>
                <Text style={styles.comparisonValue}>
                  {comparacionMensual.mesAnterior?.toFixed(2) || 'N/A'} km/gal
                </Text>
              </View>
              <View style={styles.comparisonArrow}>
                <MaterialCommunityIcons
                  name={comparacionMensual.diferencia >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={24}
                  color={comparacionMensual.diferencia >= 0 ? '#34C759' : '#FF3B30'}
                />
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.comparisonLabel}>Mes actual</Text>
                <Text style={styles.comparisonValue}>
                  {comparacionMensual.mesActual?.toFixed(2) || 'N/A'} km/gal
                </Text>
              </View>
            </View>
            <View style={[
              styles.comparisonBadge,
              { backgroundColor: comparacionMensual.diferencia >= 0 ? '#34C75920' : '#FF3B3020' }
            ]}>
              <Text style={[
                styles.comparisonBadgeText,
                { color: comparacionMensual.diferencia >= 0 ? '#34C759' : '#FF3B30' }
              ]}>
                {comparacionMensual.diferencia >= 0 ? '+' : ''}
                {comparacionMensual.diferencia.toFixed(2)} km/gal
                {comparacionMensual.diferencia >= 0 ? ' mejor' : ' peor'} que el mes anterior
              </Text>
            </View>
          </View>
        )}

        {/* Ranking de Vehículos */}
        {rendimientosPorVehiculo.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="trophy" size={20} color="#007AFF" />
              <Text style={styles.cardTitle}>Ranking de Vehículos por Eficiencia</Text>
            </View>
            {rendimientosPorVehiculo.map((item, index) => {
              const eficiencia = clasificarEficiencia(item.rendimiento_promedio);
              const vehiculoNombre = getVehiculoNombre(item.vehiculo_id);

              return (
                <View key={item.vehiculo_id} style={styles.rankingItem}>
                  <View style={styles.rankingPosition}>
                    {index === 0 && (
                      <MaterialCommunityIcons name="trophy" size={24} color="#FFD700" />
                    )}
                    {index === 1 && (
                      <MaterialCommunityIcons name="medal" size={24} color="#C0C0C0" />
                    )}
                    {index === 2 && (
                      <MaterialCommunityIcons name="medal" size={24} color="#CD7F32" />
                    )}
                    {index > 2 && (
                      <Text style={styles.rankingNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <View style={styles.rankingInfo}>
                    <Text style={styles.rankingName}>{vehiculoNombre}</Text>
                    <Text style={styles.rankingCargas}>
                      {item.total_cargas} {item.total_cargas === 1 ? 'carga' : 'cargas'}
                    </Text>
                  </View>
                  <View style={styles.rankingScore}>
                    <Text style={styles.rankingValue}>
                      {item.rendimiento_promedio.toFixed(2)}
                    </Text>
                    <Text style={styles.rankingUnit}>km/gal</Text>
                  </View>
                  <View
                    style={[styles.rankingBadge, { backgroundColor: eficiencia.color + '20' }]}
                  >
                    <MaterialCommunityIcons
                      name={eficiencia.icon}
                      size={12}
                      color={eficiencia.color}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Últimas Cargas de Combustible */}
        {recentFuel.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Cargas de Combustible</Text>
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
        {vehicles.length === 0 && (
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  alertButton: {
    position: 'relative',
    padding: 8,
  },
  alertBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  highlightCard: {
    backgroundColor: '#007AFF',
    padding: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  highlightCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  highlightValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 16,
  },
  efficiencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    alignSelf: 'center',
  },
  efficiencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '48%',
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
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 12,
  },
  comparisonItem: {
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  comparisonArrow: {
    marginHorizontal: 16,
  },
  comparisonBadge: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  comparisonBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  rankingPosition: {
    width: 40,
    alignItems: 'center',
  },
  rankingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8E8E93',
  },
  rankingInfo: {
    flex: 1,
    marginHorizontal: 12,
  },
  rankingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  rankingCargas: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  rankingScore: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  rankingValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  rankingUnit: {
    fontSize: 12,
    color: '#8E8E93',
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
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
