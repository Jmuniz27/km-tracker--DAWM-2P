import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getPrioridadAlertaLabel } from '../src/utils/constants';

const AlertCard = ({ alert, onPress }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const getPriorityColor = (prioridad) => {
    const colorMap = {
      'BAJA': '#34C759',
      'MEDIA': '#FF9500',
      'ALTA': '#FF3B30',
      'URGENTE': '#FF3B30',
    };
    return colorMap[prioridad] || '#8E8E93';
  };

  const getStatusInfo = (alert) => {
    // Verificar si hay objetivo de kilometraje
    const hasKmObjective = alert.kilometraje_objetivo;
    const hasFechaObjective = alert.fecha_objetivo;

    const currentKm = alert.vehiculo_detalle?.kilometraje_actual;
    const targetKm = alert.kilometraje_objetivo;
    const targetDate = alert.fecha_objetivo ? new Date(alert.fecha_objetivo) : null;
    const currentDate = new Date();

    let isExpired = false;
    let progress = 0;

    if (hasKmObjective && currentKm && targetKm) {
      isExpired = currentKm >= targetKm;
      progress = Math.min((currentKm / targetKm) * 100, 100);
    } else if (hasFechaObjective && targetDate) {
      isExpired = currentDate >= targetDate;
      progress = isExpired ? 100 : 0;
    }

    return {
      isExpired,
      isActive: !isExpired && alert.activa,
      progress,
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const status = getStatusInfo(alert);
  const priorityColor = getPriorityColor(alert.prioridad);

  return (
    <TouchableOpacity
      style={[styles.card, { width: isMobile ? '100%' : '48%' }]}
      onPress={() => onPress(alert)}
      activeOpacity={0.7}
    >
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={status.isExpired ? 'bell-alert' : status.isActive ? 'bell-ring' : 'bell-check'}
              size={24}
              color={status.isExpired ? '#FF3B30' : status.isActive ? '#FF9500' : '#34C759'}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title} numberOfLines={1}>
              {alert.titulo}
            </Text>
            <Text style={styles.vehicleName} numberOfLines={1}>
              {alert.vehiculo_detalle?.marca} {alert.vehiculo_detalle?.modelo}
            </Text>
          </View>
        </View>

        {alert.descripcion && (
          <Text style={styles.description} numberOfLines={2}>
            {alert.descripcion}
          </Text>
        )}

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons
                name={alert.kilometraje_objetivo ? 'speedometer' : 'calendar'}
                size={16}
                color="#8E8E93"
              />
              <Text style={styles.detailText}>
                {alert.kilometraje_objetivo
                  ? `${alert.kilometraje_objetivo?.toLocaleString()} km`
                  : alert.fecha_objetivo ? formatDate(alert.fecha_objetivo) : 'Sin objetivo'
                }
              </Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
              <Text style={[styles.priorityText, { color: priorityColor }]}>
                {getPrioridadAlertaLabel(alert.prioridad)}
              </Text>
            </View>
          </View>

          {alert.kilometraje_objetivo && (
            <View style={styles.progressContainer}>
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
              <Text style={styles.progressText}>
                {alert.vehiculo_detalle?.kilometraje_actual?.toLocaleString()} / {alert.kilometraje_objetivo?.toLocaleString()} km
              </Text>
            </View>
          )}

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: status.isExpired ? '#FF3B30' : status.isActive ? '#FF9500' : '#34C759' }
            ]}>
              <Text style={styles.statusText}>
                {status.isExpired ? 'Vencida' : status.isActive ? 'Activa' : 'Completada'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  priorityIndicator: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  vehicleName: {
    fontSize: 13,
    color: '#8E8E93',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 20,
  },
  details: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    gap: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F2F2F7',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AlertCard;
