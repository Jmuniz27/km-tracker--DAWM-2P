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
import { vehiculosAPI } from '../../../src/services/api';
import { TIPOS_VEHICULO } from '../../../src/utils/constants';

export default function CreateVehicleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    anio: '',
    placa: '',
    tipo_vehiculo: 'Automóvil',
    kilometraje_actual: '',
  });

  useEffect(() => {
    if (isEditing) {
      loadVehicle();
    }
  }, [id]);

  const loadVehicle = async () => {
    try {
      setLoading(true);
      const response = await vehiculosAPI.getById(id);
      const vehicle = response.data;
      setFormData({
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        anio: vehicle.anio.toString(),
        placa: vehicle.placa,
        tipo_vehiculo: vehicle.tipo_vehiculo,
        kilometraje_actual: vehicle.kilometraje_actual.toString(),
      });
    } catch (error) {
      console.error('Error loading vehicle:', error);
      Alert.alert('Error', 'No se pudo cargar el vehículo');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    if (!formData.marca.trim()) {
      Alert.alert('Error', 'La marca es requerida');
      return false;
    }
    if (!formData.modelo.trim()) {
      Alert.alert('Error', 'El modelo es requerido');
      return false;
    }
    if (!formData.anio) {
      Alert.alert('Error', 'El año es requerido');
      return false;
    }
    const anio = parseInt(formData.anio);
    if (isNaN(anio) || anio < 1900 || anio > 2100) {
      Alert.alert('Error', 'El año debe estar entre 1900 y 2100');
      return false;
    }
    if (!formData.placa.trim()) {
      Alert.alert('Error', 'La placa es requerida');
      return false;
    }
    if (!formData.kilometraje_actual) {
      Alert.alert('Error', 'El kilometraje es requerido');
      return false;
    }
    const km = parseFloat(formData.kilometraje_actual);
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
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        anio: parseInt(formData.anio),
        placa: formData.placa.trim().toUpperCase(),
        tipo_vehiculo: formData.tipo_vehiculo,
        kilometraje_actual: parseFloat(formData.kilometraje_actual),
      };

      if (isEditing) {
        await vehiculosAPI.update(id, data);
        Alert.alert('Éxito', 'Vehículo actualizado correctamente');
      } else {
        await vehiculosAPI.create(data);
        Alert.alert('Éxito', 'Vehículo creado correctamente');
      }

      router.back();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      const errorMsg = error.response?.data?.detail || 'No se pudo guardar el vehículo';
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: isMobile ? 16 : 24 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        </Text>
      </View>

      {/* Form */}
      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={[styles.form, { paddingHorizontal: isMobile ? 16 : 24 }]}>
          {/* Marca */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Marca *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Toyota, Chevrolet, etc."
              value={formData.marca}
              onChangeText={(text) => setFormData({ ...formData, marca: text })}
              editable={!loading}
            />
          </View>

          {/* Modelo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Modelo *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Corolla, Aveo, etc."
              value={formData.modelo}
              onChangeText={(text) => setFormData({ ...formData, modelo: text })}
              editable={!loading}
            />
          </View>

          {/* Año y Placa en fila (responsive) */}
          <View style={[styles.row, { flexDirection: isMobile ? 'column' : 'row' }]}>
            <View style={[styles.inputGroup, { flex: isMobile ? 1 : 0.48 }]}>
              <Text style={styles.label}>Año *</Text>
              <TextInput
                style={styles.input}
                placeholder="2020"
                value={formData.anio}
                onChangeText={(text) => setFormData({ ...formData, anio: text })}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputGroup, { flex: isMobile ? 1 : 0.48 }]}>
              <Text style={styles.label}>Placa *</Text>
              <TextInput
                style={styles.input}
                placeholder="ABC-1234"
                value={formData.placa}
                onChangeText={(text) => setFormData({ ...formData, placa: text })}
                autoCapitalize="characters"
                editable={!loading}
              />
            </View>
          </View>

          {/* Tipo de Vehículo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Vehículo *</Text>
            <View style={styles.typeButtons}>
              {TIPOS_VEHICULO.map((tipo) => (
                <TouchableOpacity
                  key={tipo}
                  style={[
                    styles.typeButton,
                    formData.tipo_vehiculo === tipo && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, tipo_vehiculo: tipo })}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      formData.tipo_vehiculo === tipo && styles.typeButtonTextActive,
                    ]}
                  >
                    {tipo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Kilometraje */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {isEditing ? 'Kilometraje Actual *' : 'Kilometraje Inicial *'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="50000"
              value={formData.kilometraje_actual}
              onChangeText={(text) => setFormData({ ...formData, kilometraje_actual: text })}
              keyboardType="numeric"
              editable={!loading}
            />
            <Text style={styles.hint}>Ingresa el kilometraje en km</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer con botón */}
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
  hint: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
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
