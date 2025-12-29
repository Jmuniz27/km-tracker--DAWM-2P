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
import { alertasAPI } from '../../src/services/api';
import AlertCard from '../../components/AlertCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AlertsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, expired, completed
  const [stats, setStats] = useState(null);

  const loadAlerts = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const response = await alertasAPI.getAll();
      const alertsList = response.data.results || response.data || [];
      setAlerts(alertsList);

      // Calcular estadísticas
      const active = alertsList.filter(a => !a.completada && !isExpired(a)).length;
      const expired = alertsList.filter(a => isExpired(a) && !a.completada).length;
      const completed = alertsList.filter(a => a.completada).length;

      setStats({
        total: alertsList.length,
        active,
        expired,
        completed,
      });
    } catch (error) {
      console.error('Error loading alerts:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar las alertas. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const isExpired = (alert) => {
    if (alert.tipo_alerta === 'Kilometraje') {
      return alert.vehiculo_detalle?.kilometraje_actual >= alert.kilometraje_objetivo;
    } else {
      return new Date() >= new Date(alert.fecha_objetivo);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    // Aplicar filtro
    let filtered = [...alerts];

    if (filter === 'active') {
      filtered = alerts.filter(a => !a.completada && !isExpired(a));
    } else if (filter === 'expired') {
      filtered = alerts.filter(a => isExpired(a) && !a.completada);
    } else if (filter === 'completed') {
      filtered = alerts.filter(a => a.completada);
    }

    setFilteredAlerts(filtered);
  }, [alerts, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlerts(true);
  }, [loadAlerts]);

  const handleAlertPress = (alert) => {
    router.push(`/alerts/${alert.id}`);
  };

  const handleAddAlert = () => {
    router.push('/alerts/create');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isMobile ? 16 : 24 }]}>
        <View>
          <Text style={styles.title}>Alertas</Text>
          <Text style={styles.count}>
            {alerts.length} {alerts.length === 1 ? 'alerta' : 'alertas'}
          </Text>
        </View>

        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="bell-ring" size={16} color="#FF9500" />
                <Text style={styles.statText}>{stats.active} Activas</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="bell-alert" size={16} color="#FF3B30" />
                <Text style={styles.statText}>{stats.expired} Vencidas</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="bell-check" size={16} color="#34C759" />
                <Text style={styles.statText}>{stats.completed} Completadas</Text>
              </View>
            </View>
          </View>
        )}

        {/* Filtros */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'active' && styles.filterButtonActive]}
            onPress={() => setFilter('active')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'active' && styles.filterButtonTextActive]}>
              Activas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'expired' && styles.filterButtonActive]}
            onPress={() => setFilter('expired')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'expired' && styles.filterButtonTextActive]}>
              Vencidas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'completed' && styles.filterButtonActive]}
            onPress={() => setFilter('completed')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterButtonText, filter === 'completed' && styles.filterButtonTextActive]}>
              Completadas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <AlertCard alert={item} onPress={handleAlertPress} />
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
            icon="bell-off-outline"
            message={
              filter === 'all'
                ? 'No tienes alertas registradas'
                : filter === 'active'
                ? 'No tienes alertas activas'
                : filter === 'expired'
                ? 'No tienes alertas vencidas'
                : 'No tienes alertas completadas'
            }
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { right: isMobile ? 16 : 24, bottom: isMobile ? 16 : 24 }]}
        onPress={handleAddAlert}
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
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 10,
    borderRadius: 8,
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  filterButtonTextActive: {
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
