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
import { alertasAPI } from '../../../src/services/api';
import LoadingSpinner from '../../../components/LoadingSpinner';

export default function AlertDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState(null);

  const loadAlert = useCallback(async (isRefreshing = false) => {
    try {
      if (!isRefreshing) {
        setLoading(true);
      }

      const response = await alertasAPI.getById(id);
      setAlert(response.data);
    } catch (error) {
      console.error('Error loading alert:', error);
      Alert.alert('Error', 'No se pudo cargar la alerta');
      router.back();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadAlert();
  }, [loadAlert]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAlert(true);
  }, [loadAlert]);

  const handleEdit = () => {
    router.push(`/alerts/create?id=${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Alerta',
      '¿Estás seguro que deseas eliminar esta alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await alertasAPI.delete(id);
              Alert.alert('Éxito', 'Alerta eliminada correctamente', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting alert:', error);
              Alert.alert('Error', 'No se pudo eliminar la alerta');
            }
          },
        },
      ]
    );
  };

  const handleToggleComplete = async () => {
    try {
      await alertasAPI.update(id, { completada: !alert.completada });
      Alert.alert(
        'Éxito',
        alert.completada ? 'Alerta reactivada' : 'Alerta marcada como completada'
      );
      loadAlert(true);
    } catch (error) {
      console.error('Error updating alert:', error);
      Alert.alert('Error', 'No se pudo actualizar la alerta');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getPriorityColor = (prioridad) => {
    const colorMap = {
      'Baja': '#34C759',
      'Media': '#FF9500',
      'Alta': '#FF3B30',
      'Urgente': '#FF3B30',
    };
    return colorMap[prioridad] || '#8E8E93';
  };

  const getStatusInfo = (alert) => {
    const isKilometraje = alert.tipo_alerta === 'Kilometraje';
    const currentValue = isKilometraje
      ? alert.vehiculo_detalle?.kilometraje_actual
      : new Date();
    const targetValue = isKilometraje
      ? alert.kilometraje_objetivo
      : new Date(alert.fecha_objetivo);

    let isExpired = false;
    let progress = 0;

    if (isKilometraje) {
      isExpired = currentValue >= targetValue;
      progress = Math.min((currentValue / targetValue) * 100, 100);
    } else {
      isExpired = currentValue >= targetValue;
      progress = isExpired ? 100 : 0;
    }

    return {
      isExpired,
      isActive: !isExpired && !alert.completada,
      progress,
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!alert) {
    return null;
  }

  const status = getStatusInfo(alert);
  const priorityColor = getPriorityColor(alert.prioridad);

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
        <Text style={styles.headerTitle}>Detalle de Alerta</Text>
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
            {
              backgroundColor: status.isExpired
                ? '#FF3B30'
                : status.isActive
                ? '#FF9500'
                : '#34C759'
            }
          ]}>
            <MaterialCommunityIcons
              name={
                status.isExpired
                  ? 'bell-alert'
                  : status.isActive
                  ? 'bell-ring'
                  : 'bell-check'
              }
              size={64}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.mainTitle}>{alert.titulo}</Text>
          <View style={[styles.statusBadge, {
            backgroundColor: status.isExpired
              ? '#FF3B30'
              : status.isActive
              ? '#FF9500'
              : '#34C759'
          }]}>
            <Text style={styles.statusBadgeText}>
              {status.isExpired ? 'Vencida' : status.isActive ? 'Activa' : 'Completada'}
            </Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
            <Text style={styles.priorityBadgeText}>Prioridad: {alert.prioridad}</Text>
          </View>
        </View>

        {/* Progreso (solo para alertas de kilometraje) */}
        {alert.tipo_alerta === 'Kilometraje' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progreso</Text>

            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Actual</Text>
              <Text style={styles.progressValue}>
                {alert.vehiculo_detalle?.kilometraje_actual?.toLocaleString()} km
              </Text>
            </View>

            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${status.progress}%`,
                      backgroundColor: status.isExpired ? '#FF3B30' : '#007AFF'
                    }
                  ]}
                />
              </View>
            </View>

            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Objetivo</Text>
              <Text style={styles.progressValue}>
                {alert.kilometraje_objetivo?.toLocaleString()} km
              </Text>
            </View>

            <View style={styles.remainingContainer}>
              <Text style={styles.remainingLabel}>
                {status.isExpired ? 'Excedido por:' : 'Faltan:'}
              </Text>
              <Text style={[
                styles.remainingValue,
                { color: status.isExpired ? '#FF3B30' : '#007AFF' }
              ]}>
                {Math.abs(
                  alert.kilometraje_objetivo - alert.vehiculo_detalle?.kilometraje_actual
                ).toLocaleString()} km
              </Text>
            </View>
          </View>
        )}

        {/* Detalles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name={alert.tipo_alerta === 'Kilometraje' ? 'speedometer' : 'calendar'}
                size={20}
                color="#8E8E93"
              />
              <Text style={styles.detailLabel}>Tipo de Alerta</Text>
            </View>
            <Text style={styles.detailValue}>{alert.tipo_alerta}</Text>
          </View>

          {alert.tipo_alerta === 'Fecha' && (
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#8E8E93" />
                <Text style={styles.detailLabel}>Fecha Objetivo</Text>
              </View>
              <Text style={styles.detailValue}>{formatDate(alert.fecha_objetivo)}</Text>
            </View>
          )}

          {alert.descripcion && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Descripción:</Text>
              <Text style={styles.descriptionText}>{alert.descripcion}</Text>
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
                {alert.vehiculo_detalle?.marca} {alert.vehiculo_detalle?.modelo}
              </Text>
              <Text style={styles.vehiclePlate}>{alert.vehiculo_detalle?.placa}</Text>
            </View>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleToggleComplete}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={alert.completada ? 'bell-ring' : 'bell-check'}
              size={24}
              color="#007AFF"
            />
            <Text style={styles.actionButtonText}>
              {alert.completada ? 'Marcar como Pendiente' : 'Marcar como Completada'}
            </Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="delete" size={24} color="#FF3B30" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
              Eliminar Alerta
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
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  priorityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityBadgeText: {
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
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  progressBarContainer: {
    marginVertical: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  remainingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  remainingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  remainingValue: {
    fontSize: 16,
    fontWeight: 'bold',
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
