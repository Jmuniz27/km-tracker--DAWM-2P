import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cargasAPI } from '../../../src/services/api';
import FuelCard from '../../../components/FuelCard';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';
import { calcularRendimientoPromedio } from '../../../src/utils/fuelCalculations';

export default function FuelScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [fuelLogs, setFuelLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const loadFuelLogs = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const response = await cargasAPI.getAll();
      const logs = response.data.results || response.data || [];

      // Ordenar por kilometraje descendente (más reciente primero)
      const sortedLogs = [...logs].sort((a, b) => b.kilometraje - a.kilometraje);
      setFuelLogs(sortedLogs);

      // Calcular estadísticas completas
      if (sortedLogs.length > 0) {
        const total = sortedLogs.reduce((sum, log) => sum + parseFloat(log.costo_total), 0);
        const totalGalones = sortedLogs.reduce((sum, log) => sum + parseFloat(log.galones), 0);
        const rendimientoPromedio = calcularRendimientoPromedio(sortedLogs);

        setStats({
          count: sortedLogs.length,
          totalSpent: total,
          avgPerFill: total / sortedLogs.length,
          totalGalones: totalGalones,
          avgGalones: totalGalones / sortedLogs.length,
          rendimientoPromedio: rendimientoPromedio,
        });
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading fuel logs:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las cargas de combustible. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFuelLogs();
  }, [loadFuelLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFuelLogs(true);
  }, [loadFuelLogs]);

  const handleFuelLogPress = (fuelLog) => {
    router.push(`/fuel/${fuelLog.id}`);
  };

  const handleAddFuelLog = () => {
    router.push('/fuel/create');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isMobile ? 16 : 24 }]}>
        <View>
          <Text style={styles.title}>Cargas de Combustible</Text>
          <Text style={styles.count}>
            {fuelLogs.length} {fuelLogs.length === 1 ? 'carga' : 'cargas'}
          </Text>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total gastado</Text>
              <Text style={styles.statValue}>${stats.totalSpent.toFixed(2)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Promedio por carga</Text>
              <Text style={styles.statValue}>${stats.avgPerFill.toFixed(2)}</Text>
            </View>
            {stats.rendimientoPromedio && (
              <View style={[styles.statItem, styles.statItemHighlight]}>
                <Text style={styles.statLabel}>Rendimiento promedio</Text>
                <Text style={[styles.statValue, styles.statValueHighlight]}>
                  {stats.rendimientoPromedio.toFixed(2)} km/gal
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Lista */}
      <FlatList
        data={fuelLogs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => {
          // Obtener la carga anterior (siguiente en el array ordenado por km descendente)
          const cargaAnterior = index < fuelLogs.length - 1 ? fuelLogs[index + 1] : null;
          return (
            <FuelCard
              fuelLog={item}
              cargaAnterior={cargaAnterior}
              onPress={handleFuelLogPress}
            />
          );
        }}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: isMobile ? 16 : 24,
          },
        ]}
        numColumns={isMobile ? 1 : 2}
        key={isMobile ? 'mobile' : 'web'}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="gas-station-off"
            message="No tienes cargas de combustible registradas"
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { right: isMobile ? 16 : 24, bottom: isMobile ? 16 : 24 }]}
        onPress={handleAddFuelLog}
        activeOpacity={0.8}
      >
        <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  statItemHighlight: {
    backgroundColor: '#007AFF',
  },
  statValueHighlight: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
