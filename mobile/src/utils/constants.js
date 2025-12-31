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
  { value: 'AUTO', label: 'Automóvil' },
  { value: 'MOTO', label: 'Motocicleta' },
  { value: 'CAMION', label: 'Camión' },
  { value: 'SUV', label: 'SUV' },
  { value: 'VAN', label: 'Van' },
];

// Tipos de combustible
export const TIPO_COMBUSTIBLE = {
  EXTRA: 'Extra',
  SUPER: 'Super',
  ECOPAIS: 'Ecopaís',
  DIESEL: 'Diesel',
};

// Array de tipos de combustible (para mapear en UI)
// Ahora usa objetos con value (clave para API) y label (display)
export const TIPOS_COMBUSTIBLE = [
  { value: 'EXTRA', label: 'Extra' },
  { value: 'SUPER', label: 'Super' },
  { value: 'ECOPAIS', label: 'Ecopaís' },
  { value: 'DIESEL', label: 'Diesel' },
];

// Tipos de mantenimiento
export const TIPO_MANTENIMIENTO = {
  PREVENTIVO: 'Preventivo',
  CORRECTIVO: 'Correctivo',
  EMERGENCIA: 'Emergencia',
};

// Array de tipos de mantenimiento (para mapear en UI)
export const TIPOS_MANTENIMIENTO = [
  { value: 'PREVENTIVO', label: 'Preventivo' },
  { value: 'CORRECTIVO', label: 'Correctivo' },
  { value: 'EMERGENCIA', label: 'Emergencia' },
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
  { value: 'MOTOR', label: 'Motor' },
  { value: 'FRENOS', label: 'Frenos' },
  { value: 'SUSPENSION', label: 'Suspensión' },
  { value: 'ELECTRICO', label: 'Eléctrico' },
  { value: 'TRANSMISION', label: 'Transmisión' },
  { value: 'NEUMATICOS', label: 'Neumáticos' },
  { value: 'CARROCERIA', label: 'Carrocería' },
  { value: 'CLIMATIZACION', label: 'Climatización' },
  { value: 'OTRO', label: 'Otro' },
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
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'URGENTE', label: 'Urgente' },
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

// Funciones de conversión código → label
export const getTipoVehiculoLabel = (codigo) => {
  const tipo = TIPOS_VEHICULO.find(t => t.value === codigo);
  return tipo ? tipo.label : codigo;
};

export const getTipoMantenimientoLabel = (codigo) => {
  const tipo = TIPOS_MANTENIMIENTO.find(t => t.value === codigo);
  return tipo ? tipo.label : codigo;
};

export const getCategoriaMantenimientoLabel = (codigo) => {
  const cat = CATEGORIAS_MANTENIMIENTO.find(c => c.value === codigo);
  return cat ? cat.label : codigo;
};

export const getPrioridadAlertaLabel = (codigo) => {
  const prio = PRIORIDADES_ALERTA.find(p => p.value === codigo);
  return prio ? prio.label : codigo;
};

export const getTipoCombustibleLabel = (codigo) => {
  const tipo = TIPOS_COMBUSTIBLE.find(t => t.value === codigo);
  return tipo ? tipo.label : codigo;
};
