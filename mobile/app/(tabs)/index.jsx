import { StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useAuth } from '../../src/contexts/AuthContext';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KmTracker</Text>

      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          Bienvenido, {user?.first_name} {user?.last_name}!
        </Text>
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Próximamente:</Text>
        <Text style={styles.infoText}>• Gestión de vehículos</Text>
        <Text style={styles.infoText}>• Registro de cargas de combustible</Text>
        <Text style={styles.infoText}>• Control de mantenimientos</Text>
        <Text style={styles.infoText}>• Alertas personalizadas</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 32,
  },
  welcomeContainer: {
    backgroundColor: '#f0f9ff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: '#64748b',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
