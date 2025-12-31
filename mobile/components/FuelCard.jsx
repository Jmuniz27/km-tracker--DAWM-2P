import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FuelCard = ({ fuelLog, onPress }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const getFuelColor = (tipo) => {
    const colorMap = {
      'Extra': '#FF9500',
      'Super': '#FF3B30',
      'Ecopaís': '#34C759',
      'Diesel': '#8E8E93',
    };
    return colorMap[tipo] || '#8E8E93';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    return `$${parseFloat(value).toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: isMobile ? '100%' : '48%' }]}
      onPress={() => onPress(fuelLog)}
      activeOpacity={0.7}
    >
      <View style={[styles.fuelTypeIndicator, { backgroundColor: getFuelColor(fuelLog.tipo_combustible) }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="gas-station" size={24} color="#007AFF" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.vehicleName} numberOfLines={1}>
              {fuelLog.vehiculo_detalle?.marca} {fuelLog.vehiculo_detalle?.modelo}
            </Text>
            <Text style={styles.date}>{formatDate(fuelLog.fecha)}</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="fuel" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{fuelLog.galones} gal</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="cash" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{formatCurrency(fuelLog.costo_total)}</Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <View style={styles.badge} style={[styles.badge, { backgroundColor: getFuelColor(fuelLog.tipo_combustible) + '20' }]}>
              <Text style={[styles.badgeText, { color: getFuelColor(fuelLog.tipo_combustible) }]}>
                {fuelLog.tipo_combustible}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="speedometer" size={16} color="#8E8E93" />
              <Text style={styles.detailText}>{fuelLog.kilometraje?.toLocaleString()} km</Text>
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
  fuelTypeIndicator: {
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
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: '#8E8E93',
  },
  details: {
    gap: 8,
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
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FuelCard;
