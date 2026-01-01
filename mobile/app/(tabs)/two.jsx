import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cargasAPI, vehiculosAPI } from '../../src/services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  calcularRendimientoPorVehiculo,
  calcularRendimientoPromedio,
  compararRendimientoMensual,
  clasificarEficiencia,
  formatearRendimiento,
} from '../../src/utils/fuelCalculations';

export default function StatisticsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cargas, setCargas] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [rendimientoGeneral, setRendimientoGeneral] = useState(null);
  const [rendimientosPorVehiculo, setRendimientosPorVehiculo] = useState([]);
  const [comparacionMensual, setComparacionMensual] = useState(null);

  const loadData = async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      // Cargar cargas y vehículos en paralelo
      const [cargasResponse, vehiculosResponse] = await Promise.all([
        cargasAPI.getAll(),
        vehiculosAPI.getAll(),
      ]);

      const cargasData = cargasResponse.data.results || cargasResponse.data || [];
      const vehiculosData = vehiculosResponse.data.results || vehiculosResponse.data || [];

      setCargas(cargasData);
      setVehiculos(vehiculosData);

      // Calcular rendimiento general
      const rendimientoGral = calcularRendimientoPromedio(cargasData);
      setRendimientoGeneral(rendimientoGral);

      // Calcular rendimiento por vehículo
      const rendimientosVeh = calcularRendimientoPorVehiculo(cargasData);
      // Ordenar por rendimiento descendente
      rendimientosVeh.sort((a, b) => b.rendimiento_promedio - a.rendimiento_promedio);
      setRendimientosPorVehiculo(rendimientosVeh);

      // Comparar rendimiento mensual
      const comparacion = compararRendimientoMensual(cargasData);
      setComparacionMensual(comparacion);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const getVehiculoNombre = (vehiculoId) => {
    if (typeof vehiculoId === 'object' && vehiculoId !== null) {
      return `${vehiculoId.marca} ${vehiculoId.modelo}`;
    }
    const vehiculo = vehiculos.find(v => v.id === vehiculoId);
    return vehiculo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Vehículo desconocido';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const eficienciaGeneral = clasificarEficiencia(rendimientoGeneral);
  const totalGastado = cargas.reduce((sum, c) => sum + parseFloat(c.costo_total || 0), 0);

  // Calcular total gastado este mes
  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();
  const gastoMesActual = cargas
    .filter(c => {
      const fecha = new Date(c.fecha);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual;
    })
    .reduce((sum, c) => sum + parseFloat(c.costo_total || 0), 0);

  return (
    <ScrollView
      style={styles.container}
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
        <MaterialCommunityIcons name="chart-line" size={32} color="#007AFF" />
        <Text style={styles.title}>Estadísticas de Rendimiento</Text>
        <Text style={styles.subtitle}>Análisis de eficiencia de combustible</Text>
      </View>

      {/* Rendimiento General */}
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

      {/* Estadísticas rápidas */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="gas-station" size={24} color="#007AFF" />
          <Text style={styles.statValue}>{cargas.length}</Text>
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
          <Text style={styles.statValue}>{vehiculos.length}</Text>
          <Text style={styles.statLabel}>Vehículos</Text>
        </View>
      </View>

      {/* Comparación mensual */}
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

      {/* Ranking de vehículos */}
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

      {/* Mensaje cuando no hay datos */}
      {cargas.length === 0 && (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="chart-line-variant" size={64} color="#8E8E93" />
          <Text style={styles.emptyTitle}>Sin datos de rendimiento</Text>
          <Text style={styles.emptyMessage}>
            Registra al menos 2 cargas de combustible para ver estadísticas de rendimiento.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    paddingTop: 60,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
    textAlign: 'center',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
});
