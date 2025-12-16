// Constantes de colores
export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  danger: '#FF3B30',
  warning: '#FF9500',
  info: '#5AC8FA',
  light: '#F2F2F7',
  dark: '#1C1C1E',
  gray: '#8E8E93',
  white: '#FFFFFF',
  black: '#000000',
};

// Tipos de vehículo
export const TIPO_VEHICULO = {
  AUTO: 'Automóvil',
  MOTO: 'Motocicleta',
  CAMION: 'Camión',
  SUV: 'SUV',
  VAN: 'Van',
};

// Tipos de combustible
export const TIPO_COMBUSTIBLE = {
  EXTRA: 'Extra',
  SUPER: 'Super',
  ECOPAIS: 'Ecopaís',
  DIESEL: 'Diesel',
};

// Tipos de mantenimiento
export const TIPO_MANTENIMIENTO = {
  PREVENTIVO: 'Preventivo',
  CORRECTIVO: 'Correctivo',
  EMERGENCIA: 'Emergencia',
};

// Categorías de mantenimiento
export const CATEGORIA_MANTENIMIENTO = {
  MOTOR: 'Motor',
  FRENOS: 'Frenos',
  SUSPENSION: 'Suspensión',
  ELECTRICO: 'Eléctrico',
  TRANSMISION: 'Transmisión',
  NEUMATICOS: 'Neumáticos',
  CARROCERIA: 'Carrocería',
  CLIMATIZACION: 'Climatización',
  OTRO: 'Otro',
};

// Prioridades de alerta
export const PRIORIDAD_ALERTA = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

// Colores por prioridad
export const COLORES_PRIORIDAD = {
  BAJA: COLORS.info,
  MEDIA: COLORS.warning,
  ALTA: COLORS.danger,
  URGENTE: COLORS.danger,
};

// Colores por tipo de mantenimiento
export const COLORES_TIPO_MANTENIMIENTO = {
  PREVENTIVO: COLORS.success,
  CORRECTIVO: COLORS.warning,
  EMERGENCIA: COLORS.danger,
};
