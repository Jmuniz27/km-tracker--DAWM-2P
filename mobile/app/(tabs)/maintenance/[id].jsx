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
import { mantenimientoAPI } from '../../../src/services/api';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function MaintenanceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [maintenance, setMaintenance] = useState(null);

  const loadMaintenance = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const response = await mantenimientoAPI.getById(id);
      setMaintenance(response.data);
    } catch (error) {
      console.error('Error loading maintenance:', error);
      Alert.alert('Error', 'No se pudo cargar el mantenimiento');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadMaintenance();
  }, [loadMaintenance]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMaintenance(true);
  }, [loadMaintenance]);

  const handleEdit = () => {
    router.push(`/maintenance/create?id=${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Mantenimiento',
      '¿Estás seguro que deseas eliminar este mantenimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await mantenimientoAPI.delete(id);
              Alert.alert('Éxito', 'Mantenimiento eliminado correctamente', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting maintenance:', error);
              Alert.alert('Error', 'No se pudo eliminar el mantenimiento');
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
    });
  };

  const getTypeColor = (tipo) => {
    const colorMap = {
      'Preventivo': '#34C759',
      'Correctivo': '#FF9500',
      'Emergencia': '#FF3B30',
    };
    return colorMap[tipo] || '#8E8E93';
  };

  const getCategoryIcon = (categoria) => {
    const iconMap = {
      'Motor': 'engine',
      'Frenos': 'car-brake-alert',
      'Suspensión': 'car-shift-pattern',
      'Eléctrico': 'flash',
      'Transmisión': 'car-shift-pattern',
      'Neumáticos': 'tire',
      'Carrocería': 'car-door',
      'Climatización': 'air-conditioner',
      'Otro': 'wrench',
    };
    return iconMap[categoria] || 'wrench';
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!maintenance) {
    return null;
  }

  const cost = maintenance.costo ? parseFloat(maintenance.costo) : 0;

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
        <Text style={styles.headerTitle}>Detalle de Mantenimiento</Text>
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
            { backgroundColor: getTypeColor(maintenance.tipo_mantenimiento) + '20' }
          ]}>
            <MaterialCommunityIcons
              name={getCategoryIcon(maintenance.categoria)}
              size={64}
              color={getTypeColor(maintenance.tipo_mantenimiento)}
            />
          </View>
          <View style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(maintenance.tipo_mantenimiento) }
          ]}>
            <Text style={styles.typeBadgeText}>{maintenance.tipo_mantenimiento}</Text>
          </View>
          <Text style={styles.mainTitle}>{maintenance.categoria}</Text>
          {cost > 0 && (
            <Text style={styles.mainCost}>${cost.toFixed(2)}</Text>
          )}
        </View>

        {/* Detalles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="calendar" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Fecha</Text>
            </View>
            <Text style={styles.detailValue}>{formatDate(maintenance.fecha)}</Text>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="speedometer" size={20} color="#8E8E93" />
              <Text style={styles.detailLabel}>Kilometraje</Text>
            </View>
            <Text style={styles.detailValue}>
              {maintenance.kilometraje?.toLocaleString()} km
            </Text>
          </View>

          {maintenance.proximo_kilometraje && (
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="speedometer-medium" size={20} color="#8E8E93" />
                <Text style={styles.detailLabel}>Próximo Mantenimiento</Text>
              </View>
              <Text style={styles.detailValue}>
                {maintenance.proximo_kilometraje?.toLocaleString()} km
              </Text>
            </View>
          )}

          {maintenance.descripcion && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Descripción:</Text>
              <Text style={styles.descriptionText}>{maintenance.descripcion}</Text>
            </View>
          )}
        </View>

        {/* Vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículo</Text>

          <View style={styles.vehicleCard}>
            <MaterialCommunityIcons name="car" size={32} color="#007AFF" />
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>
                {maintenance.vehiculo_detalle?.marca} {maintenance.vehiculo_detalle?.modelo}
              </Text>
              <Text style={styles.vehiclePlate}>{maintenance.vehiculo_detalle?.placa}</Text>
            </View>
          </View>
        </View>

        {/* Información Adicional */}
        {maintenance.taller && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Adicional</Text>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="store" size={20} color="#8E8E93" />
                <Text style={styles.detailLabel}>Taller/Mecánico</Text>
              </View>
              <Text style={styles.detailValue}>{maintenance.taller}</Text>
            </View>
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
              Eliminar Mantenimiento
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
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  typeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  mainCost: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
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
  descriptionContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
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
