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

// Array de tipos de vehículo (para mapear en UI)
export const TIPOS_VEHICULO = [
  'Automóvil',
  'Motocicleta',
  'Camión',
  'SUV',
  'Van',
];

// Tipos de combustible
export const TIPO_COMBUSTIBLE = {
  EXTRA: 'Extra',
  SUPER: 'Super',
  ECOPAIS: 'Ecopaís',
  DIESEL: 'Diesel',
};

// Array de tipos de combustible (para mapear en UI)
export const TIPOS_COMBUSTIBLE = [
  'Extra',
  'Super',
  'Ecopaís',
  'Diesel',
];

// Tipos de mantenimiento
export const TIPO_MANTENIMIENTO = {
  PREVENTIVO: 'Preventivo',
  CORRECTIVO: 'Correctivo',
  EMERGENCIA: 'Emergencia',
};

// Array de tipos de mantenimiento (para mapear en UI)
export const TIPOS_MANTENIMIENTO = [
  'Preventivo',
  'Correctivo',
  'Emergencia',
];

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

// Array de categorías de mantenimiento (para mapear en UI)
export const CATEGORIAS_MANTENIMIENTO = [
  'Motor',
  'Frenos',
  'Suspensión',
  'Eléctrico',
  'Transmisión',
  'Neumáticos',
  'Carrocería',
  'Climatización',
  'Otro',
];

// Prioridades de alerta
export const PRIORIDAD_ALERTA = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
};

// Array de prioridades de alerta (para mapear en UI)
export const PRIORIDADES_ALERTA = [
  'Baja',
  'Media',
  'Alta',
  'Urgente',
];

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

// Factores de conversión de unidades
export const CONVERSION = {
  LITERS_TO_GALLONS: 0.264172,
  GALLONS_TO_LITERS: 3.785,
};

// Nota: La app ahora usa GALONES exclusivamente
// Ecuador usa galones como unidad estándar de combustible
