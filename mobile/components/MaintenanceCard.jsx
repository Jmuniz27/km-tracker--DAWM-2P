import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MaintenanceCard = ({ maintenance, onPress }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

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
      'Suspensión': 'car-lifted-pickup',
      'Eléctrico': 'car-battery',
      'Transmisión': 'car-shift-pattern',
      'Neumáticos': 'tire',
      'Carrocería': 'car-door',
      'Climatización': 'air-conditioner',
      'Otro': 'wrench',
    };
    return iconMap[categoria] || 'wrench';
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
    if (!value) return 'N/A';
    return `$${parseFloat(value).toFixed(2)}`;
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width: isMobile ? '100%' : '48%' }]}
      onPress={() => onPress(maintenance)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: getTypeColor(maintenance.tipo_mantenimiento) + '20' }]}>
          <MaterialCommunityIcons
            name={getCategoryIcon(maintenance.categoria)}
            size={24}
            color={getTypeColor(maintenance.tipo_mantenimiento)}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.vehicleName} numberOfLines={1}>
            {maintenance.vehiculo_detalle?.marca} {maintenance.vehiculo_detalle?.modelo}
          </Text>
          <Text style={styles.date}>{formatDate(maintenance.fecha)}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(maintenance.tipo_mantenimiento) }]}>
          <Text style={styles.typeBadgeText}>{maintenance.tipo_mantenimiento}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.category}>{maintenance.categoria}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {maintenance.descripcion}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <MaterialCommunityIcons name="speedometer" size={16} color="#8E8E93" />
          <Text style={styles.footerText}>{maintenance.kilometraje?.toLocaleString()} km</Text>
        </View>
        {maintenance.costo && (
          <View style={styles.footerItem}>
            <MaterialCommunityIcons name="cash" size={16} color="#8E8E93" />
            <Text style={styles.footerText}>{formatCurrency(maintenance.costo)}</Text>
          </View>
        )}
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
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    marginBottom: 12,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
});

export default MaintenanceCard;
