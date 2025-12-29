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
import { mantenimientoAPI } from '../../../src/services/api';
import MaintenanceCard from '../../../components/MaintenanceCard';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function MaintenanceScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  const loadMaintenances = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const response = await mantenimientoAPI.getAll();
      const logs = response.data.results || response.data || [];
      setMaintenances(logs);

      // Calcular estadísticas
      if (logs.length > 0) {
        const withCost = logs.filter(m => m.costo);
        const totalCost = withCost.reduce((sum, m) => sum + parseFloat(m.costo), 0);
        const preventivo = logs.filter(m => m.tipo_mantenimiento === 'Preventivo').length;
        const correctivo = logs.filter(m => m.tipo_mantenimiento === 'Correctivo').length;
        const emergencia = logs.filter(m => m.tipo_mantenimiento === 'Emergencia').length;

        setStats({
          count: logs.length,
          totalCost: totalCost,
          preventivo,
          correctivo,
          emergencia,
        });
      } else {
        setStats(null);
      }
    } catch (error) {
      console.error('Error loading maintenances:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los mantenimientos. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMaintenances();
  }, [loadMaintenances]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMaintenances(true);
  }, [loadMaintenances]);

  const handleMaintenancePress = (maintenance) => {
    router.push(`/maintenance/${maintenance.id}`);
  };

  const handleAddMaintenance = () => {
    router.push('/maintenance/create');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isMobile ? 16 : 24 }]}>
        <View>
          <Text style={styles.title}>Mantenimientos</Text>
          <Text style={styles.count}>
            {maintenances.length} {maintenances.length === 1 ? 'registro' : 'registros'}
          </Text>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Costo Total</Text>
              <Text style={styles.statValue}>${stats.totalCost.toFixed(2)}</Text>
            </View>
            <View style={styles.typeStats}>
              <View style={styles.typeStat}>
                <View style={[styles.typeDot, { backgroundColor: '#34C759' }]} />
                <Text style={styles.typeStatText}>{stats.preventivo} Preventivo</Text>
              </View>
              <View style={styles.typeStat}>
                <View style={[styles.typeDot, { backgroundColor: '#FF9500' }]} />
                <Text style={styles.typeStatText}>{stats.correctivo} Correctivo</Text>
              </View>
              <View style={styles.typeStat}>
                <View style={[styles.typeDot, { backgroundColor: '#FF3B30' }]} />
                <Text style={styles.typeStatText}>{stats.emergencia} Emergencia</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Lista */}
      <FlatList
        data={maintenances}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MaintenanceCard maintenance={item} onPress={handleMaintenancePress} />
        )}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingHorizontal: isMobile ? 16 : 24,
            flexDirection: isMobile ? 'column' : 'row',
            flexWrap: isMobile ? 'nowrap' : 'wrap',
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="wrench-outline"
            message="No tienes mantenimientos registrados"
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { right: isMobile ? 16 : 24, bottom: isMobile ? 16 : 24 }]}
        onPress={handleAddMaintenance}
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
    gap: 12,
  },
  statItem: {
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
  typeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  typeStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 8,
    gap: 6,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeStatText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '500',
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
