import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const EmptyState = ({ icon = 'information-outline', message = 'No hay datos', color = '#8E8E93' }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={icon} size={64} color={color} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default EmptyState;
