import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '../../../src/services/api';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.old_password.trim()) {
      Alert.alert('Error', 'Ingresa tu contraseña actual');
      return false;
    }
    if (!formData.new_password.trim()) {
      Alert.alert('Error', 'Ingresa tu nueva contraseña');
      return false;
    }
    if (formData.new_password.length < 8) {
      Alert.alert('Error', 'La nueva contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (!formData.confirm_password.trim()) {
      Alert.alert('Error', 'Confirma tu nueva contraseña');
      return false;
    }
    if (formData.new_password !== formData.confirm_password) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }
    if (formData.old_password === formData.new_password) {
      Alert.alert('Error', 'La nueva contraseña debe ser diferente a la actual');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      await authAPI.changePassword(
        formData.old_password,
        formData.new_password,
        formData.confirm_password
      );

      Alert.alert(
        'Éxito',
        'Contraseña actualizada correctamente',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'No se pudo cambiar la contraseña. Intenta nuevamente.';

      if (error.response?.data) {
        if (error.response.data.old_password) {
          errorMessage = 'La contraseña actual es incorrecta';
        } else if (error.response.data.new_password) {
          errorMessage = Array.isArray(error.response.data.new_password)
            ? error.response.data.new_password.join('. ')
            : error.response.data.new_password;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.title}>Cambiar Contraseña</Text>
      </View>

      {/* Form */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: isMobile ? 16 : 24 }
        ]}
      >
        <View style={styles.form}>
          {/* Contraseña Actual */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña Actual *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ingresa tu contraseña actual"
                value={formData.old_password}
                onChangeText={(value) => handleChange('old_password', value)}
                secureTextEntry={!showOldPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowOldPassword(!showOldPassword)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={showOldPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Nueva Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nueva Contraseña *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ingresa tu nueva contraseña"
                value={formData.new_password}
                onChangeText={(value) => handleChange('new_password', value)}
                secureTextEntry={!showNewPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Mínimo 8 caracteres
            </Text>
          </View>

          {/* Confirmar Nueva Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Nueva Contraseña *</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirma tu nueva contraseña"
                value={formData.confirm_password}
                onChangeText={(value) => handleChange('confirm_password', value)}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#8E8E93"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Información de seguridad */}
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="information" size={20} color="#007AFF" />
            <Text style={styles.infoText}>
              Por seguridad, asegúrate de usar una contraseña fuerte que incluya letras, números y caracteres especiales.
            </Text>
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
            <>
              <MaterialCommunityIcons name="lock-check" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Cambiar Contraseña</Text>
            </>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: 16,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#000000',
  },
  eyeButton: {
    padding: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    lineHeight: 18,
  },
  footer: {
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#8E8E93',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
