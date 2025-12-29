import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const VehicleCard = ({ vehicle, onPress }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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

  return (
    <TouchableOpacity
      style={[styles.card, { width: isMobile ? '100%' : '48%' }]}
      onPress={() => onPress(vehicle)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons
          name={getVehicleIcon(vehicle.tipo_vehiculo)}
          size={32}
          color="#007AFF"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {vehicle.marca} {vehicle.modelo}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {vehicle.placa} • {vehicle.anio}
        </Text>
        <View style={styles.footer}>
          <View style={styles.badge}>
            <MaterialCommunityIcons name="speedometer" size={14} color="#8E8E93" />
            <Text style={styles.badgeText}>{vehicle.kilometraje_actual?.toLocaleString()} km</Text>
          </View>
          <Text style={styles.type}>{vehicle.tipo_vehiculo}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 4,
    fontWeight: '500',
  },
  type: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
});

export default VehicleCard;
