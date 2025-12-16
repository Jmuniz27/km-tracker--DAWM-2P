# Guía de Personalización de Pantallas

Esta aplicación fue generada con el template `tabs` de Expo, que incluye navegación por pestañas.

## Estructura de Pantallas

El template ha creado las siguientes pantallas base:

- `(tabs)/index.tsx` - Pantalla principal (Tab 1)
- `(tabs)/explore.tsx` - Pantalla de exploración (Tab 2)

## Personalización Recomendada

Para el proyecto KmTracker, se recomienda personalizar las pantallas de la siguiente manera:

### 1. HomeScreen (index.tsx)
**Ruta**: `app/(tabs)/index.tsx`

**Contenido recomendado**:
- Bienvenida a KmTracker
- Tarjetas de navegación rápida a cada sección
- Resumen de alertas vencidas
- Estadísticas generales

**Funcionalidades**:
```javascript
import { vehiculosAPI, alertasAPI } from '../../src/services/api';
import { COLORS } from '../../src/utils/constants';

// Mostrar:
// - Número total de vehículos
// - Alertas urgentes
// - Próximo mantenimiento
// - Botones de navegación a las otras pantallas
```

### 2. VehiclesScreen (renombrar explore.tsx)
**Ruta**: `app/(tabs)/vehicles.tsx`

**Contenido recomendado**:
- Lista (FlatList) de vehículos registrados
- Card por cada vehículo mostrando:
  - Marca, modelo, placa
  - Año y tipo
  - Kilometraje actual
  - Botón para ver detalles
- Botón flotante para agregar nuevo vehículo
- Pull to refresh
- Estado de carga y empty state

**Funcionalidades**:
```javascript
import { vehiculosAPI } from '../../src/services/api';
import { TIPO_VEHICULO, COLORS } from '../../src/utils/constants';

// Cargar vehículos al montar
// Implementar navegación a detalle
// Implementar creación/edición
```

### 3. FuelLogScreen (crear nuevo tab)
**Ruta**: `app/(tabs)/fuel.tsx`

**Contenido recomendado**:
- Lista de cargas de combustible
- Card mostrando:
  - Vehículo (marca, modelo, placa)
  - Fecha de la carga
  - Litros y precio total
  - Rendimiento (km/L) si está disponible
  - Tipo de combustible
- Filtro por vehículo
- Botón para registrar nueva carga
- Sección de estadísticas (total gastado, rendimiento promedio)

**Funcionalidades**:
```javascript
import { cargasAPI, vehiculosAPI } from '../../src/services/api';
import { TIPO_COMBUSTIBLE, COLORS } from '../../src/utils/constants';

// Cargar historial de cargas
// Mostrar estadísticas
// Filtrar por vehículo
```

### 4. MaintenanceScreen (crear nuevo tab)
**Ruta**: `app/(tabs)/maintenance.tsx`

**Contenido recomendado**:
- Lista de mantenimientos realizados
- Card mostrando:
  - Vehículo
  - Tipo y categoría del mantenimiento
  - Fecha y kilometraje
  - Costo
  - Badge de color según tipo
- Filtros (por vehículo, por tipo)
- Botón para registrar nuevo mantenimiento
- Sección de alertas vencidas con badge de urgencia

**Funcionalidades**:
```javascript
import { mantenimientoAPI, alertasAPI } from '../../src/services/api';
import {
  TIPO_MANTENIMIENTO,
  CATEGORIA_MANTENIMIENTO,
  PRIORIDAD_ALERTA,
  COLORES_TIPO_MANTENIMIENTO,
  COLORES_PRIORIDAD
} from '../../src/utils/constants';

// Cargar mantenimientos
// Cargar alertas vencidas
// Mostrar estadísticas
```

## Actualizar Navegación (Tabs)

Editar el archivo `app/(tabs)/_layout.tsx` para configurar los tabs:

```javascript
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/utils/constants';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: 'Vehículos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'car' : 'car-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="fuel"
        options={{
          title: 'Cargas',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'water' : 'water-outline'} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="maintenance"
        options={{
          title: 'Mantenimiento',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'build' : 'build-outline'} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
```

## Notas Importantes

1. **Instalar dependencias adicionales** antes de implementar las pantallas:
   ```bash
   npm install axios react-native-dotenv @react-native-async-storage/async-storage
   ```

2. **Configurar variables de entorno**:
   - Copiar `.env.example` a `.env`
   - Editar `.env` con la IP local de tu computadora

3. **Descomentar código en api.js** después de instalar las dependencias

4. Las pantallas ya están creadas por el template, solo necesitan ser personalizadas con el contenido específico de KmTracker.

5. El template usa TypeScript por defecto, puedes convertir los archivos .tsx a .jsx si prefieres JavaScript.
