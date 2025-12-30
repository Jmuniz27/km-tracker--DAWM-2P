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
import { alertasAPI, vehiculosAPI } from '../../../src/services/api';
import { PRIORIDADES_ALERTA } from '../../../src/utils/constants';

export default function CreateAlertScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    vehiculo: '',
    titulo: '',
    descripcion: '',
    tipo_alerta: 'Kilometraje',
    kilometraje_objetivo: '',
    fecha_objetivo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 días adelante
    prioridad: 'MEDIA', // Clave en mayúsculas para API
  });

  useEffect(() => {
    loadVehicles();
    if (isEditing) {
      loadAlert();
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

  const loadAlert = async () => {
    try {
      setLoading(true);
      const response = await alertasAPI.getById(id);
      const alert = response.data;
      setFormData({
        vehiculo: alert.vehiculo.toString(),
        titulo: alert.titulo,
        descripcion: alert.descripcion || '',
        tipo_alerta: alert.tipo_alerta,
        kilometraje_objetivo: alert.kilometraje_objetivo ? alert.kilometraje_objetivo.toString() : '',
        fecha_objetivo: alert.fecha_objetivo || '',
        prioridad: alert.prioridad,
      });
    } catch (error) {
      console.error('Error loading alert:', error);
      Alert.alert('Error', 'No se pudo cargar la alerta');
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
    if (!formData.titulo.trim()) {
      Alert.alert('Error', 'El título es requerido');
      return false;
    }

    if (formData.tipo_alerta === 'Kilometraje') {
      if (!formData.kilometraje_objetivo) {
        Alert.alert('Error', 'El kilometraje objetivo es requerido');
        return false;
      }
      const km = parseFloat(formData.kilometraje_objetivo);
      if (isNaN(km) || km <= 0) {
        Alert.alert('Error', 'El kilometraje debe ser mayor a 0');
        return false;
      }
    } else {
      if (!formData.fecha_objetivo) {
        Alert.alert('Error', 'La fecha objetivo es requerida');
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
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(), // descripcion es requerido en el backend
        tipo_alerta: formData.tipo_alerta,
        kilometraje_objetivo: formData.tipo_alerta === 'Kilometraje' ? parseFloat(formData.kilometraje_objetivo) : null,
        fecha_objetivo: formData.tipo_alerta === 'Fecha' ? formData.fecha_objetivo : null,
        prioridad: formData.prioridad,
      };

      if (isEditing) {
        await alertasAPI.update(id, data);
        Alert.alert('Éxito', 'Alerta actualizada correctamente');
      } else {
        await alertasAPI.create(data);
        Alert.alert('Éxito', 'Alerta creada correctamente');
      }

      router.back();
    } catch (error) {
      console.error('Error saving alert:', error);
      const errorMsg = error.response?.data?.detail ||
                      error.response?.data?.message ||
                      'No se pudo guardar la alerta';
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
        <Text style={styles.emptyHint}>Crea un vehículo primero para configurar alertas</Text>
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
          {isEditing ? 'Editar Alerta' : 'Nueva Alerta'}
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

          {/* Título */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Cambio de aceite, Revisión técnica"
              value={formData.titulo}
              onChangeText={(text) => setFormData({ ...formData, titulo: text })}
              editable={!loading}
            />
          </View>

          {/* Descripción */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Detalles adicionales (opcional)..."
              value={formData.descripcion}
              onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!loading}
            />
          </View>

          {/* Tipo de Alerta */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Alerta *</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.tipo_alerta === 'Kilometraje' && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, tipo_alerta: 'Kilometraje' })}
                disabled={loading}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="speedometer"
                  size={20}
                  color={formData.tipo_alerta === 'Kilometraje' ? '#FFFFFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.tipo_alerta === 'Kilometraje' && styles.typeButtonTextActive,
                  ]}
                >
                  Kilometraje
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  formData.tipo_alerta === 'Fecha' && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, tipo_alerta: 'Fecha' })}
                disabled={loading}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={formData.tipo_alerta === 'Fecha' ? '#FFFFFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.tipo_alerta === 'Fecha' && styles.typeButtonTextActive,
                  ]}
                >
                  Fecha
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo condicional según tipo */}
          {formData.tipo_alerta === 'Kilometraje' ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kilometraje Objetivo *</Text>
              <TextInput
                style={styles.input}
                placeholder="55000"
                value={formData.kilometraje_objetivo}
                onChangeText={(text) => setFormData({ ...formData, kilometraje_objetivo: text })}
                keyboardType="numeric"
                editable={!loading}
              />
              <Text style={styles.hint}>Se activará al alcanzar este kilometraje</Text>
            </View>
          ) : (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha Objetivo *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.fecha_objetivo}
                onChangeText={(text) => setFormData({ ...formData, fecha_objetivo: text })}
                editable={!loading}
              />
              <Text style={styles.hint}>Formato: YYYY-MM-DD</Text>
            </View>
          )}

          {/* Prioridad */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prioridad *</Text>
            <View style={styles.priorityButtons}>
              {PRIORIDADES_ALERTA.map((prioridad) => (
                <TouchableOpacity
                  key={prioridad.value}
                  style={[
                    styles.priorityButton,
                    formData.prioridad === prioridad.value && styles.priorityButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, prioridad: prioridad.value })}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.priorityButtonText,
                      formData.prioridad === prioridad.value && styles.priorityButtonTextActive,
                    ]}
                  >
                    {prioridad.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
    minHeight: 80,
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
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
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
    color: '#8E8E93',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  priorityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  priorityButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  priorityButtonText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '500',
  },
  priorityButtonTextActive: {
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
