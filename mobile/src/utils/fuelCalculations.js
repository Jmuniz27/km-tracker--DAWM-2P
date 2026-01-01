/**
 * Utilidades para cálculos de rendimiento de combustible
 * Todas las funciones trabajan con km/galón
 */

/**
 * Calcula el rendimiento en km/galón entre dos cargas consecutivas
 * @param {Object} cargaActual - Carga más reciente
 * @param {Object} cargaAnterior - Carga previa
 * @returns {number|null} Rendimiento en km/galón o null si no hay carga anterior
 */
export const calcularRendimiento = (cargaActual, cargaAnterior) => {
  if (!cargaAnterior || !cargaActual) return null;

  const kmRecorridos = cargaActual.kilometraje - cargaAnterior.kilometraje;
  const galonesUsados = cargaAnterior.galones;

  // Validaciones
  if (kmRecorridos <= 0 || galonesUsados <= 0) return null;

  const rendimiento = kmRecorridos / galonesUsados;
  return parseFloat(rendimiento.toFixed(2));
};

/**
 * Calcula el rendimiento promedio de un array de cargas
 * @param {Array} cargas - Array de cargas ordenadas por kilometraje
 * @returns {number|null} Rendimiento promedio en km/galón
 */
export const calcularRendimientoPromedio = (cargas) => {
  if (!cargas || cargas.length < 2) return null;

  // Ordenar por kilometraje ascendente
  const cargasOrdenadas = [...cargas].sort((a, b) => a.kilometraje - b.kilometraje);

  const rendimientos = [];

  // Calcular rendimiento entre cada par de cargas consecutivas
  for (let i = 1; i < cargasOrdenadas.length; i++) {
    const rendimiento = calcularRendimiento(cargasOrdenadas[i], cargasOrdenadas[i - 1]);
    if (rendimiento !== null) {
      rendimientos.push(rendimiento);
    }
  }

  if (rendimientos.length === 0) return null;

  const promedio = rendimientos.reduce((sum, r) => sum + r, 0) / rendimientos.length;
  return parseFloat(promedio.toFixed(2));
};

/**
 * Calcula el rendimiento promedio por vehículo
 * @param {Array} cargas - Todas las cargas del usuario
 * @returns {Array} Array de objetos con vehiculo_id y rendimiento_promedio
 */
export const calcularRendimientoPorVehiculo = (cargas) => {
  if (!cargas || cargas.length === 0) return [];

  // Agrupar cargas por vehículo
  const cargasPorVehiculo = {};
  cargas.forEach(carga => {
    const vehiculoId = carga.vehiculo?.id || carga.vehiculo;
    if (!cargasPorVehiculo[vehiculoId]) {
      cargasPorVehiculo[vehiculoId] = [];
    }
    cargasPorVehiculo[vehiculoId].push(carga);
  });

  // Calcular rendimiento por cada vehículo
  const rendimientos = [];
  Object.keys(cargasPorVehiculo).forEach(vehiculoId => {
    const cargasVehiculo = cargasPorVehiculo[vehiculoId];
    const rendimientoPromedio = calcularRendimientoPromedio(cargasVehiculo);

    if (rendimientoPromedio !== null) {
      rendimientos.push({
        vehiculo_id: parseInt(vehiculoId),
        vehiculo: cargasVehiculo[0]?.vehiculo,
        rendimiento_promedio: rendimientoPromedio,
        total_cargas: cargasVehiculo.length
      });
    }
  });

  return rendimientos;
};

/**
 * Clasifica la eficiencia del rendimiento
 * @param {number} kmPorGalon - Rendimiento en km/galón
 * @returns {Object} {label, color, icon}
 */
export const clasificarEficiencia = (kmPorGalon) => {
  if (kmPorGalon === null || kmPorGalon === undefined) {
    return { label: 'Sin datos', color: '#888888', icon: 'help-circle' };
  }

  if (kmPorGalon >= 15) {
    return { label: 'Excelente', color: '#22c55e', icon: 'star' };
  }
  if (kmPorGalon >= 10) {
    return { label: 'Bueno', color: '#3b82f6', icon: 'thumbs-up' };
  }
  if (kmPorGalon >= 7) {
    return { label: 'Regular', color: '#f59e0b', icon: 'alert-circle' };
  }
  return { label: 'Bajo', color: '#ef4444', icon: 'alert-triangle' };
};

/**
 * Valida si el rendimiento es sospechoso
 * @param {number} kmPorGalon - Rendimiento en km/galón
 * @returns {Object|null} {advertencia, nivel} o null si es normal
 */
export const validarRendimiento = (kmPorGalon) => {
  if (kmPorGalon === null || kmPorGalon === undefined) return null;

  if (kmPorGalon < 3) {
    return {
      advertencia: 'Rendimiento inusualmente bajo. Verifica los datos.',
      nivel: 'error'
    };
  }

  if (kmPorGalon > 30) {
    return {
      advertencia: 'Rendimiento inusualmente alto. Verifica los datos.',
      nivel: 'warning'
    };
  }

  return null;
};

/**
 * Formatea el rendimiento para mostrar
 * @param {number} kmPorGalon - Rendimiento en km/galón
 * @returns {string} Rendimiento formateado
 */
export const formatearRendimiento = (kmPorGalon) => {
  if (kmPorGalon === null || kmPorGalon === undefined) {
    return 'N/A';
  }
  return `${kmPorGalon.toFixed(2)} km/gal`;
};

/**
 * Calcula el total de kilómetros recorridos
 * @param {Array} cargas - Array de cargas ordenadas
 * @returns {number} Total de km recorridos
 */
export const calcularKmTotales = (cargas) => {
  if (!cargas || cargas.length < 2) return 0;

  const cargasOrdenadas = [...cargas].sort((a, b) => a.kilometraje - b.kilometraje);
  const kmInicial = cargasOrdenadas[0].kilometraje;
  const kmFinal = cargasOrdenadas[cargasOrdenadas.length - 1].kilometraje;

  return kmFinal - kmInicial;
};

/**
 * Obtiene el rendimiento del mes actual vs mes anterior
 * @param {Array} cargas - Todas las cargas
 * @returns {Object} {mesActual, mesAnterior, diferencia}
 */
export const compararRendimientoMensual = (cargas) => {
  if (!cargas || cargas.length === 0) {
    return { mesActual: null, mesAnterior: null, diferencia: null };
  }

  const ahora = new Date();
  const mesActual = ahora.getMonth();
  const anioActual = ahora.getFullYear();

  // Filtrar cargas del mes actual
  const cargasMesActual = cargas.filter(carga => {
    const fechaCarga = new Date(carga.fecha);
    return fechaCarga.getMonth() === mesActual && fechaCarga.getFullYear() === anioActual;
  });

  // Filtrar cargas del mes anterior
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
  const anioMesAnterior = mesActual === 0 ? anioActual - 1 : anioActual;

  const cargasMesAnterior = cargas.filter(carga => {
    const fechaCarga = new Date(carga.fecha);
    return fechaCarga.getMonth() === mesAnterior && fechaCarga.getFullYear() === anioMesAnterior;
  });

  const rendimientoMesActual = calcularRendimientoPromedio(cargasMesActual);
  const rendimientoMesAnterior = calcularRendimientoPromedio(cargasMesAnterior);

  let diferencia = null;
  if (rendimientoMesActual !== null && rendimientoMesAnterior !== null) {
    diferencia = rendimientoMesActual - rendimientoMesAnterior;
  }

  return {
    mesActual: rendimientoMesActual,
    mesAnterior: rendimientoMesAnterior,
    diferencia: diferencia !== null ? parseFloat(diferencia.toFixed(2)) : null
  };
};
