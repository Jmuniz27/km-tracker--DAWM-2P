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
import { vehiculosAPI } from '../../../src/services/api';
import VehicleCard from '../../../components/VehicleCard';
import EmptyState from '../../../components/EmptyState';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function VehiclesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVehicles = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const response = await vehiculosAPI.getAll();
      setVehicles(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los vehículos. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVehicles(true);
  }, [loadVehicles]);

  const handleVehiclePress = (vehicle) => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  const handleAddVehicle = () => {
    router.push('/vehicles/create');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isMobile ? 16 : 24 }]}>
        <View>
          <Text style={styles.title}>Mis Vehículos</Text>
          <Text style={styles.count}>
            {vehicles.length} {vehicles.length === 1 ? 'vehículo' : 'vehículos'}
          </Text>
        </View>
      </View>

      {/* Lista */}
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <VehicleCard vehicle={item} onPress={handleVehiclePress} />
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
            icon="car-off"
            message="No tienes vehículos registrados"
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { right: isMobile ? 16 : 24, bottom: isMobile ? 16 : 24 }]}
        onPress={handleAddVehicle}
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
