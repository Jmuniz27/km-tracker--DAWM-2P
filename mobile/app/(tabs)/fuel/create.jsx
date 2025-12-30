import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cargasAPI, vehiculosAPI } from '../../../src/services/api';
import { TIPOS_COMBUSTIBLE } from '../../../src/utils/constants';

export default function CreateFuelLogScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehiculo: '',
    fecha: new Date().toISOString().split('T')[0],
    galones: '',
    precio_galon: '',
    tipo_combustible: 'EXTRA', // Clave en mayúsculas para API
    kilometraje: '',
    estacion_servicio: '',
    notas: '',
  });

  useEffect(() => {
    loadVehicles();
    if (isEditing) {
      loadFuelLog();
    }
  }, [id]);

  const loadVehicles = async () => {
    try {
      const response = await vehiculosAPI.getAll();
      const vehiclesList = response.data.results || response.data || [];
      setVehicles(vehiclesList);

      // Si hay vehículos y no estamos editando, seleccionar el primero por defecto
      if (!isEditing && vehiclesList.length > 0) {
        setFormData(prev => ({ ...prev, vehiculo: vehiclesList[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos');
    }
  };

  const loadFuelLog = async () => {
    try {
      setLoading(true);
      const response = await cargasAPI.getById(id);
      const fuelLog = response.data;
      setFormData({
        vehiculo: fuelLog.vehiculo.toString(),
        fecha: fuelLog.fecha,
        galones: fuelLog.galones.toString(),
        precio_galon: fuelLog.precio_galon.toString(),
        tipo_combustible: fuelLog.tipo_combustible,
        kilometraje: fuelLog.kilometraje.toString(),
        estacion_servicio: fuelLog.estacion_servicio || '',
        notas: fuelLog.notas || '',
      });
    } catch (error) {
      console.error('Error loading fuel log:', error);
      Alert.alert('Error', 'No se pudo cargar la carga de combustible');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const galones = parseFloat(formData.galones) || 0;
    const precioGalon = parseFloat(formData.precio_galon) || 0;
    return (galones * precioGalon).toFixed(2);
  };

  const validate = () => {
    if (!formData.vehiculo) {
      Alert.alert('Error', 'Selecciona un vehículo');
      return false;
    }
    if (!formData.fecha) {
      Alert.alert('Error', 'La fecha es requerida');
      return false;
    }
    if (!formData.galones) {
      Alert.alert('Error', 'Los galones son requeridos');
      return false;
    }
    const galones = parseFloat(formData.galones);
    if (isNaN(galones) || galones <= 0) {
      Alert.alert('Error', 'Los galones deben ser mayores a 0');
      return false;
    }
    if (!formData.precio_galon) {
      Alert.alert('Error', 'El precio por galón es requerido');
      return false;
    }
    const precio = parseFloat(formData.precio_galon);
    if (isNaN(precio) || precio <= 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return false;
    }
    if (!formData.kilometraje) {
      Alert.alert('Error', 'El kilometraje es requerido');
      return false;
    }
    const km = parseFloat(formData.kilometraje);
    if (isNaN(km) || km < 0) {
      Alert.alert('Error', 'El kilometraje debe ser mayor o igual a 0');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const data = {
        vehiculo: parseInt(formData.vehiculo),
        fecha: formData.fecha,
        galones: parseFloat(formData.galones),
        precio_galon: parseFloat(formData.precio_galon),
        tipo_combustible: formData.tipo_combustible,
        kilometraje: parseFloat(formData.kilometraje),
        estacion_servicio: formData.estacion_servicio.trim() || null,
        notas: formData.notas.trim() || null,
      };

      if (isEditing) {
        await cargasAPI.update(id, data);
        Alert.alert('Éxito', 'Carga de combustible actualizada correctamente');
      } else {
        await cargasAPI.create(data);
        Alert.alert('Éxito', 'Carga de combustible registrada correctamente');
      }

      router.back();
    } catch (error) {
      console.error('Error saving fuel log:', error);
      const errorMsg = error.response?.data?.detail ||
                      error.response?.data?.message ||
                      'No se pudo guardar la carga de combustible';
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (vehicles.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="car-off" size={64} color="#8E8E93" />
        <Text style={styles.emptyText}>No tienes vehículos registrados</Text>
        <Text style={styles.emptyHint}>Crea un vehículo primero para registrar cargas</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/vehicles/create')}>
          <Text style={styles.emptyButtonText}>Crear Vehículo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isMobile ? 16 : 24 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Carga' : 'Registrar Carga'}
        </Text>
      </View>

      {/* Form */}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.form, { paddingHorizontal: isMobile ? 16 : 24 }]}>
          {/* Vehículo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehículo *</Text>
            <View style={styles.vehicleButtons}>
              {vehicles.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleButton,
                    formData.vehiculo === vehicle.id.toString() && styles.vehicleButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, vehiculo: vehicle.id.toString() })}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.vehicleButtonText,
                      formData.vehiculo === vehicle.id.toString() && styles.vehicleButtonTextActive,
                    ]}
                  >
                    {vehicle.marca} {vehicle.modelo}
                  </Text>
                  <Text
                    style={[
                      styles.vehicleButtonSubtext,
                      formData.vehiculo === vehicle.id.toString() && styles.vehicleButtonSubtextActive,
                    ]}
                  >
                    {vehicle.placa}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fecha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Fecha *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.fecha}
              onChangeText={(text) => setFormData({ ...formData, fecha: text })}
              editable={!loading}
            />
            <Text style={styles.hint}>Formato: YYYY-MM-DD</Text>
          </View>

          {/* Galones y Precio en fila */}
          <View style={[styles.row, { flexDirection: isMobile ? 'column' : 'row' }]}>
            <View style={[styles.inputGroup, { flex: isMobile ? 1 : 0.48 }]}>
              <Text style={styles.label}>Galones *</Text>
              <TextInput
                style={styles.input}
                placeholder="10.5"
                value={formData.galones}
                onChangeText={(text) => setFormData({ ...formData, galones: text })}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, { flex: isMobile ? 1 : 0.48 }]}>
              <Text style={styles.label}>Precio/Galón *</Text>
              <TextInput
                style={styles.input}
                placeholder="2.50"
                value={formData.precio_galon}
                onChangeText={(text) => setFormData({ ...formData, precio_galon: text })}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Total calculado */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>${calculateTotal()}</Text>
          </View>

          {/* Tipo de Combustible */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Combustible *</Text>
            <View style={styles.fuelButtons}>
              {TIPOS_COMBUSTIBLE.map((tipo) => (
                <TouchableOpacity
                  key={tipo.value}
                  style={[
                    styles.fuelButton,
                    formData.tipo_combustible === tipo.value && styles.fuelButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, tipo_combustible: tipo.value })}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.fuelButtonText,
                      formData.tipo_combustible === tipo.value && styles.fuelButtonTextActive,
                    ]}
                  >
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Kilometraje */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kilometraje Actual *</Text>
            <TextInput
              style={styles.input}
              placeholder="50000"
              value={formData.kilometraje}
              onChangeText={(text) => setFormData({ ...formData, kilometraje: text })}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text style={styles.hint}>Kilometraje del vehículo al momento de la carga</Text>
          </View>

          {/* Estación de servicio (opcional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Estación de Servicio</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Primax, Petroecuador"
              value={formData.estacion_servicio}
              onChangeText={(text) => setFormData({ ...formData, estacion_servicio: text })}
              editable={!loading}
            />
          </View>

          {/* Notas (opcional) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notas</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Comentarios adicionales..."
              value={formData.notas}
              onChangeText={(text) => setFormData({ ...formData, notas: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingHorizontal: isMobile ? 16 : 24 }]}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Actualizar' : 'Guardar'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#F2F2F7',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  emptyHint: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    paddingTop: 24,
  },
  row: {
    justifyContent: 'space-between',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  textArea: {
    minHeight: 100,
  },
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  vehicleButtons: {
    gap: 8,
  },
  vehicleButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  vehicleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  vehicleButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  vehicleButtonTextActive: {
    color: '#FFFFFF',
  },
  vehicleButtonSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  vehicleButtonSubtextActive: {
    color: '#E5E5EA',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 24,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  fuelButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  fuelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  fuelButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  fuelButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  fuelButtonTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
