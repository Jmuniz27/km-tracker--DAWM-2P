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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { vehiculosAPI } from '../../../src/services/api';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function VehicleDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicle, setVehicle] = useState(null);

  const loadVehicle = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const response = await vehiculosAPI.getById(id);
      setVehicle(response.data);
    } catch (error) {
      console.error('Error loading vehicle:', error);
      Alert.alert('Error', 'No se pudo cargar el vehículo');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadVehicle();
  }, [loadVehicle]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVehicle(true);
  }, [loadVehicle]);

  const handleEdit = () => {
    router.push(`/vehicles/create?id=${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Vehículo',
      '¿Estás seguro que deseas eliminar este vehículo? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await vehiculosAPI.delete(id);
              Alert.alert('Éxito', 'Vehículo eliminado correctamente', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting vehicle:', error);
              Alert.alert('Error', 'No se pudo eliminar el vehículo');
            }
          },
        },
      ]
    );
  };

  const handleUpdateKm = () => {
    Alert.prompt(
      'Actualizar Kilometraje',
      `Kilometraje actual: ${vehicle?.kilometraje_actual?.toLocaleString()} km`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Actualizar',
          onPress: async (newKm) => {
            const km = parseInt(newKm);
            if (!km || km < 0) {
              Alert.alert('Error', 'Ingresa un kilometraje válido');
              return;
            }
            if (km < vehicle.kilometraje_actual) {
              Alert.alert('Error', 'El nuevo kilometraje debe ser mayor al actual');
              return;
            }
            try {
              await vehiculosAPI.actualizarKilometraje(id, km);
              Alert.alert('Éxito', 'Kilometraje actualizado correctamente');
              loadVehicle(true);
            } catch (error) {
              console.error('Error updating km:', error);
              Alert.alert('Error', 'No se pudo actualizar el kilometraje');
            }
          },
        },
      ],
      'plain-text',
      vehicle?.kilometraje_actual?.toString()
    );
  };

  const getVehicleIcon = (tipo) => {
    const iconMap = {
      'Automóvil': 'car-side',
      'Motocicleta': 'motorbike',
      'Camión': 'truck',
      'SUV': 'car-estate',
      'Van': 'van-utility',
    };
    return iconMap[tipo] || 'car';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vehicle) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isMobile ? 16 : 24 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Vehículo</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="pencil" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
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
        {/* Información Principal */}
        <View style={styles.mainCard}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={getVehicleIcon(vehicle.tipo_vehiculo)}
              size={64}
              color="#007AFF"
            />
          </View>
          <Text style={styles.vehicleName}>
            {vehicle.marca} {vehicle.modelo}
          </Text>
          <Text style={styles.vehicleYear}>{vehicle.anio}</Text>
        </View>

        {/* Detalles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="card-text" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Placa</Text>
            </View>
            <Text style={styles.detailValue}>{vehicle.placa || 'Sin placa'}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="car" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Tipo</Text>
            </View>
            <Text style={styles.detailValue}>{vehicle.tipo_vehiculo}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="speedometer" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Kilometraje Actual</Text>
            </View>
            <Text style={styles.detailValue}>
              {vehicle.kilometraje_actual?.toLocaleString()} km
            </Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleUpdateKm}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="speedometer" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Actualizar Kilometraje</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Eliminar Vehículo
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  editButton: {
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  vehicleYear: {
    fontSize: 18,
    color: '#8E8E93',
  },
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#000000',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    gap: 12,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  deleteButtonText: {
    color: '#FF3B30',
  },
});
