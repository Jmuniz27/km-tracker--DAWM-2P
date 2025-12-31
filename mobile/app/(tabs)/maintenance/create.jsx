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
import { mantenimientoAPI, vehiculosAPI } from '../../../src/services/api';
import { TIPOS_MANTENIMIENTO, CATEGORIAS_MANTENIMIENTO } from '../../../src/utils/constants';

export default function CreateMaintenanceScreen() {
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
    tipo: 'PREVENTIVO', // Clave en mayúsculas para API
    categoria: 'MOTOR', // Clave en mayúsculas para API
    descripcion: '',
    costo: '',
    kilometraje: '',
    taller: '',
    proximo_mantenimiento_km: '',
  });

  useEffect(() => {
    loadVehicles();
    if (isEditing) {
      loadMaintenance();
    }
  }, [id]);

  const loadVehicles = async () => {
    try {
      const response = await vehiculosAPI.getAll();
      const vehiclesList = response.data.results || response.data || [];
      setVehicles(vehiclesList);

      if (!isEditing && vehiclesList.length > 0) {
        setFormData(prev => ({ ...prev, vehiculo: vehiclesList[0].id.toString() }));
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      Alert.alert('Error', 'No se pudieron cargar los vehículos');
    }
  };

  const loadMaintenance = async () => {
    try {
      setLoading(true);
      const response = await mantenimientoAPI.getById(id);
      const maintenance = response.data;
      setFormData({
        vehiculo: maintenance.vehiculo.toString(),
        fecha: maintenance.fecha,
        tipo: maintenance.tipo, // El backend usa 'tipo', no 'tipo_mantenimiento'
        categoria: maintenance.categoria,
        descripcion: maintenance.descripcion,
        costo: maintenance.costo ? maintenance.costo.toString() : '',
        kilometraje: maintenance.kilometraje.toString(),
        taller: maintenance.taller || '',
        proximo_mantenimiento_km: maintenance.proximo_mantenimiento_km ? maintenance.proximo_mantenimiento_km.toString() : '',
      });
    } catch (error) {
      console.error('Error loading maintenance:', error);
      Alert.alert('Error', 'No se pudo cargar el mantenimiento');
      router.back();
    } finally {
      setLoading(false);
    }
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
    if (!formData.descripcion.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
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
    if (formData.costo) {
      const costo = parseFloat(formData.costo);
      if (isNaN(costo) || costo < 0) {
        Alert.alert('Error', 'El costo debe ser mayor o igual a 0');
        return false;
      }
    }
    if (formData.proximo_mantenimiento_km) {
      const proximoKm = parseFloat(formData.proximo_mantenimiento_km);
      if (isNaN(proximoKm) || proximoKm <= km) {
        Alert.alert('Error', 'El próximo kilometraje debe ser mayor al actual');
        return false;
      }
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
        tipo: formData.tipo, // El backend usa 'tipo', no 'tipo_mantenimiento'
        categoria: formData.categoria,
        descripcion: formData.descripcion.trim(),
        costo: formData.costo ? parseFloat(formData.costo) : null,
        kilometraje: parseFloat(formData.kilometraje),
        taller: formData.taller.trim() || null,
        proximo_mantenimiento_km: formData.proximo_mantenimiento_km ? parseFloat(formData.proximo_mantenimiento_km) : null,
      };

      if (isEditing) {
        await mantenimientoAPI.update(id, data);
        Alert.alert('Éxito', 'Mantenimiento actualizado correctamente');
      } else {
        await mantenimientoAPI.create(data);
        Alert.alert('Éxito', 'Mantenimiento registrado correctamente');
      }

      router.back();
    } catch (error) {
      console.error('Error saving maintenance:', error);
      const errorMsg = error.response?.data?.detail ||
                      error.response?.data?.message ||
                      'No se pudo guardar el mantenimiento';
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
        <Text style={styles.emptyHint}>Crea un vehículo primero para registrar mantenimientos</Text>
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
          {isEditing ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}
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
          </View>

          {/* Tipo de Mantenimiento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Mantenimiento *</Text>
            <View style={styles.typeButtons}>
              {TIPOS_MANTENIMIENTO.map((tipo) => (
                <TouchableOpacity
                  key={tipo.value}
                  style={[
                    styles.typeButton,
                    formData.tipo === tipo.value && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, tipo: tipo.value })}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.tipo === tipo.value && styles.typeButtonTextActive,
                    ]}
                  >
                    {tipo.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categoría */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.categoryButtons}>
              {CATEGORIAS_MANTENIMIENTO.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryButton,
                    formData.categoria === cat.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, categoria: cat.value })}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      formData.categoria === cat.value && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe el trabajo realizado..."
              value={formData.descripcion}
              onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Kilometraje y Costo en fila */}
          <View style={[styles.row, { flexDirection: isMobile ? 'column' : 'row' }]}>
            <View style={[styles.inputGroup, { flex: isMobile ? 1 : 0.48 }]}>
              <Text style={styles.label}>Kilometraje *</Text>
              <TextInput
                style={styles.input}
                placeholder="50000"
                value={formData.kilometraje}
                onChangeText={(text) => setFormData({ ...formData, kilometraje: text })}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, { flex: isMobile ? 1 : 0.48 }]}>
              <Text style={styles.label}>Costo</Text>
              <TextInput
                style={styles.input}
                placeholder="50.00"
                value={formData.costo}
                onChangeText={(text) => setFormData({ ...formData, costo: text })}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>
          </View>

          {/* Taller */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Taller/Mecánico</Text>
            <TextInput
              style={styles.input}
              placeholder="Nombre del taller o mecánico"
              value={formData.taller}
              onChangeText={(text) => setFormData({ ...formData, taller: text })}
              editable={!loading}
            />
          </View>

          {/* Próximo Mantenimiento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Próximo Mantenimiento (km)</Text>
            <TextInput
              style={styles.input}
              placeholder="55000"
              value={formData.proximo_mantenimiento_km}
              onChangeText={(text) => setFormData({ ...formData, proximo_mantenimiento_km: text })}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text style={styles.hint}>Kilometraje para el próximo mantenimiento de este tipo</Text>
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
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
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
