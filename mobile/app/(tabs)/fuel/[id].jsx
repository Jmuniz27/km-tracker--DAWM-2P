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
import { cargasAPI } from '../../../src/services/api';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function FuelDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fuel, setFuel] = useState(null);

  const loadFuel = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const response = await cargasAPI.getById(id);
      setFuel(response.data);
    } catch (error) {
      console.error('Error loading fuel:', error);
      Alert.alert('Error', 'No se pudo cargar la carga de combustible');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadFuel();
  }, [loadFuel]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFuel(true);
  }, [loadFuel]);

  const handleEdit = () => {
    router.push(`/fuel/create?id=${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Carga',
      '¿Estás seguro que deseas eliminar esta carga de combustible?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cargasAPI.delete(id);
              Alert.alert('Éxito', 'Carga eliminada correctamente', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting fuel:', error);
              Alert.alert('Error', 'No se pudo eliminar la carga');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFuelColor = (tipo) => {
    const colorMap = {
      'Extra': '#FF9500',
      'Super': '#FF3B30',
      'Ecopaís': '#34C759',
      'Diesel': '#8E8E93',
    };
    return colorMap[tipo] || '#8E8E93';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!fuel) {
    return null;
  }

  const totalCost = parseFloat(fuel.costo);
  const pricePerGallon = parseFloat(fuel.precio_galon);
  const gallons = parseFloat(fuel.galones);

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
        <Text style={styles.headerTitle}>Detalle de Carga</Text>
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
          <View style={[
            styles.iconContainer,
            { backgroundColor: getFuelColor(fuel.tipo_combustible) + '20' }
          ]}>
            <MaterialCommunityIcons
              name="gas-station"
              size={64}
              color={getFuelColor(fuel.tipo_combustible)}
            />
          </View>
          <Text style={styles.mainAmount}>${totalCost.toFixed(2)}</Text>
          <Text style={styles.mainLabel}>Costo Total</Text>
          <View style={[
            styles.fuelBadge,
            { backgroundColor: getFuelColor(fuel.tipo_combustible) }
          ]}>
            <Text style={styles.fuelBadgeText}>{fuel.tipo_combustible}</Text>
          </View>
        </View>

        {/* Detalles de la Carga */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de la Carga</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Fecha</Text>
            </View>
            <Text style={styles.detailValue}>{formatDate(fuel.fecha)}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="gas-cylinder" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Galones</Text>
            </View>
            <Text style={styles.detailValue}>{gallons.toFixed(2)} gal</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="cash" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Precio por Galón</Text>
            </View>
            <Text style={styles.detailValue}>${pricePerGallon.toFixed(2)}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="speedometer" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Kilometraje</Text>
            </View>
            <Text style={styles.detailValue}>
              {fuel.kilometraje?.toLocaleString()} km
            </Text>
          </View>
        </View>

        {/* Vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículo</Text>

          <View style={styles.vehicleCard}>
            <MaterialCommunityIcons name="car" size={32} color="#007AFF" />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {fuel.vehiculo_detalle?.marca} {fuel.vehiculo_detalle?.modelo}
              </Text>
              <Text style={styles.vehiclePlate}>{fuel.vehiculo_detalle?.placa}</Text>
            </View>
          </View>
        </View>

        {/* Información Adicional */}
        {(fuel.estacion_servicio || fuel.notas) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>

            {fuel.estacion_servicio && (
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#8E8E93" />
                  <Text style={styles.detailLabel}>Estación</Text>
                </View>
                <Text style={styles.detailValue}>{fuel.estacion_servicio}</Text>
              </View>
            )}

            {fuel.notas && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notas:</Text>
                <Text style={styles.notesText}>{fuel.notas}</Text>
              </View>
            )}
          </View>
        )}

        {/* Acciones */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Eliminar Carga
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  mainLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  fuelBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fuelBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    textAlign: 'right',
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
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
