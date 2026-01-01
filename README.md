# KmTracker - Sistema de Gestión de Vehículos

Sistema completo para el seguimiento y gestión de vehículos, cargas de combustible y mantenimiento. Incluye un backend REST API desarrollado con Django desplegado en Azure y una aplicación móvil desarrollada con React Native/Expo.

## Autor

**Juan Andrés Munizaga Torres**

## Tecnologías

### Backend
- Python 3.x
- Django 4.2.11
- Django REST Framework 3.14.0
- djangorestframework-simplejwt 5.5.1
- MySQL Database (Azure MySQL Flexible Server en producción)
- django-cors-headers 4.3.1
- python-decouple 3.8
- drf-spectacular 0.27.0 (Documentación API)
- gunicorn 21.2.0 (Servidor de producción)
- whitenoise 6.6.0 (Archivos estáticos)

### Mobile
- React Native 0.81.5
- Expo ~54.0.29
- Expo Router 6.0.19 (File-based routing)
- React Navigation 7.1.8
- Axios 1.13.2 (Peticiones HTTP)
- AsyncStorage 2.2.0 (Almacenamiento local)
- react-native-dotenv 3.4.11 (Variables de entorno)

### Despliegue
- Backend: Azure App Service
- Base de datos: Azure Database for MySQL - Flexible Server
- CI/CD: GitHub Actions
- Repositorio: GitHub

## Estructura del Proyecto

```
km-tracker--DAWM-2P/
├── backend/
│   ├── kmtracker_api/              # Configuración del proyecto Django
│   │   ├── settings.py             # Configuración principal
│   │   ├── urls.py                 # Rutas principales
│   │   └── wsgi.py                 # WSGI para producción
│   ├── apps/
│   │   ├── authentication/         # App de autenticación JWT
│   │   ├── vehicles/               # App de vehículos
│   │   ├── fuel_logs/              # App de cargas de combustible
│   │   └── maintenance/            # App de mantenimiento y alertas
│   ├── requirements.txt            # Dependencias Python
│   ├── .env.example                # Ejemplo de variables de entorno
│   ├── manage.py                   # CLI de Django
│   └── .github/
│       └── workflows/
│           └── azure-deploy.yml    # CI/CD para Azure
└── mobile/
    ├── app/                        # Expo Router file-based routing
    │   ├── (auth)/                 # Grupo de autenticación
    │   │   ├── login.jsx           # Pantalla de login
    │   │   └── register.jsx        # Pantalla de registro
    │   ├── (tabs)/                 # Navegación con tabs
    │   │   ├── index.jsx           # Dashboard/Inicio
    │   │   ├── vehicles/           # Stack de vehículos
    │   │   ├── fuel/               # Stack de combustible
    │   │   ├── maintenance/        # Stack de mantenimiento
    │   │   ├── alerts/             # Stack de alertas
    │   │   └── profile/            # Stack de perfil
    │   └── _layout.jsx             # Layout principal
    ├── src/
    │   ├── contexts/               # Contexts de React
    │   │   └── AuthContext.jsx     # Contexto de autenticación
    │   ├── services/               # Servicios API
    │   │   └── api.js              # Cliente Axios y endpoints
    │   └── utils/                  # Utilidades y constantes
    │       └── constants.js        # Constantes de la app
    ├── components/                 # Componentes reutilizables
    ├── scripts/
    │   └── switch-env.js           # Script para cambiar entre local/remoto
    ├── package.json
    ├── .env.example
    └── babel.config.js
```

## Instalación y Configuración

### Requisitos Previos
- Python 3.8 o superior
- Node.js 18 o superior
- MySQL 8.0 (local) o Azure MySQL Flexible Server
- Git
- Expo CLI: `npm install -g expo-cli`

### Backend - Django REST API

#### 1. Clonar el repositorio:
```bash
git clone https://github.com/Jmuniz27/km-tracker--DAWM-2P.git
cd km-tracker--DAWM-2P/backend
```

#### 2. Crear y activar entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate  # En Windows
# source venv/bin/activate  # En Linux/Mac
```

#### 3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

#### 4. Configurar variables de entorno:
Crea un archivo `.env` en `backend/` basado en `.env.example`:

**Para desarrollo local:**
```env
SECRET_KEY=tu-secret-key-aqui-genera-una-nueva
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=kmtracker_db
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306
```

**Para Azure MySQL Flexible Server:**
```env
SECRET_KEY=tu-secret-key-de-produccion
DEBUG=False
ALLOWED_HOSTS=kmtracker-api.azurewebsites.net,localhost,127.0.0.1

DB_NAME=kmtracker_db
DB_USER=kmtracker_admin
DB_PASSWORD=tu_password_azure
DB_HOST=kmtracker-db.mysql.database.azure.com
DB_PORT=3306
```

#### 5. Configurar base de datos:

**Opción A: MySQL Local**
```bash
mysql -u root -p
```

```sql
CREATE DATABASE kmtracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Opción B: Azure MySQL Flexible Server**
- La base de datos debe estar creada en Azure Portal
- Agregar tu IP a las reglas de firewall
- SSL/TLS está configurado automáticamente

#### 6. Ejecutar migraciones:
```bash
python manage.py migrate
```

#### 7. Crear superusuario:
```bash
python manage.py createsuperuser
```

#### 8. Ejecutar servidor de desarrollo:
```bash
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

**Panel de administración:** `http://localhost:8000/admin`

### Mobile - React Native/Expo

#### 1. Navegar al directorio mobile:
```bash
cd mobile
```

#### 2. Instalar dependencias:
```bash
npm install
```

#### 3. Configurar ambiente de desarrollo:

La aplicación incluye scripts para cambiar fácilmente entre backend local y remoto.

**Para usar backend LOCAL:**
```bash
npm run env:local
```

Esto configurará: `API_URL=http://127.0.0.1:8000/api`

**Para usar backend REMOTO (Azure):**
```bash
npm run env:remote
```

Esto configurará: `API_URL_PRODUCTION=https://kmtracker-api.azurewebsites.net/api`

#### 4. Iniciar aplicación:
```bash
npx expo start
```

O para limpiar caché (recomendado después de cambiar ambiente):
```bash
npx expo start --clear
```

#### 5. Escanear código QR:
- **Android**: Usa la app Expo Go
- **iOS**: Usa la cámara del iPhone

#### Configuración para Dispositivo Físico en Red Local

Si quieres probar con el backend local desde un dispositivo físico:

1. Obtén tu IP local:
   - Windows: `ipconfig` (busca "IPv4 Address")
   - Linux/Mac: `ifconfig` o `ip addr`

2. Edita manualmente `mobile/.env`:
```env
API_URL=http://192.168.1.100:8000/api
```
(Reemplaza `192.168.1.100` con tu IP local)

3. Reinicia Expo:
```bash
npx expo start --clear
```

## Uso de Scripts de Ambiente

El proyecto incluye scripts para facilitar el cambio entre backend local y remoto:

### Comandos Disponibles

```bash
# Cambiar a backend LOCAL (http://127.0.0.1:8000/api)
npm run env:local

# Cambiar a backend REMOTO (https://kmtracker-api.azurewebsites.net/api)
npm run env:remote
```

### Flujo de Trabajo Típico

**Desarrollo local:**
```bash
# Terminal 1 - Backend
cd backend
venv\Scripts\activate
python manage.py runserver

# Terminal 2 - Mobile
cd mobile
npm run env:local
npx expo start --clear
```

**Pruebas con producción:**
```bash
cd mobile
npm run env:remote
npx expo start --clear
```

**Importante:** Después de cambiar el ambiente, siempre reinicia Expo con `--clear` para asegurar que la configuración se aplique.

## Endpoints de la API

### Autenticación
- `POST /api/auth/register/` - Registrar nuevo usuario
- `POST /api/auth/login/` - Iniciar sesión (devuelve tokens JWT)
- `POST /api/auth/token/refresh/` - Refrescar access token
- `GET /api/auth/profile/` - Obtener perfil del usuario autenticado
- `PUT /api/auth/profile/` - Actualizar perfil
- `POST /api/auth/change-password/` - Cambiar contraseña

### Vehículos
- `GET /api/vehicles/` - Listar todos los vehículos del usuario
- `POST /api/vehicles/` - Crear nuevo vehículo
- `GET /api/vehicles/{id}/` - Obtener vehículo específico
- `PUT /api/vehicles/{id}/` - Actualizar vehículo
- `DELETE /api/vehicles/{id}/` - Eliminar vehículo
- `POST /api/vehicles/{id}/actualizar_kilometraje/` - Actualizar kilometraje

### Cargas de Combustible
- `GET /api/fuel-logs/` - Listar todas las cargas del usuario
- `POST /api/fuel-logs/` - Registrar nueva carga
- `GET /api/fuel-logs/{id}/` - Obtener carga específica
- `PUT /api/fuel-logs/{id}/` - Actualizar carga
- `DELETE /api/fuel-logs/{id}/` - Eliminar carga
- `GET /api/fuel-logs/estadisticas/` - Obtener estadísticas de consumo

### Mantenimiento
- `GET /api/maintenance/mantenimientos/` - Listar mantenimientos
- `POST /api/maintenance/mantenimientos/` - Registrar mantenimiento
- `GET /api/maintenance/mantenimientos/{id}/` - Obtener mantenimiento específico
- `PUT /api/maintenance/mantenimientos/{id}/` - Actualizar mantenimiento
- `DELETE /api/maintenance/mantenimientos/{id}/` - Eliminar mantenimiento
- `GET /api/maintenance/mantenimientos/estadisticas/` - Estadísticas de mantenimiento

### Alertas de Mantenimiento
- `GET /api/maintenance/alertas/` - Listar alertas
- `POST /api/maintenance/alertas/` - Crear alerta
- `GET /api/maintenance/alertas/{id}/` - Obtener alerta específica
- `PUT /api/maintenance/alertas/{id}/` - Actualizar alerta
- `DELETE /api/maintenance/alertas/{id}/` - Eliminar alerta
- `POST /api/maintenance/alertas/{id}/marcar_completada/` - Marcar alerta como completada
- `GET /api/maintenance/alertas/vencidas/` - Obtener alertas vencidas

### Documentación API
- `GET /api/` - Swagger UI (documentación interactiva)
- `GET /api/schema/` - OpenAPI Schema
- `GET /api/redoc/` - ReDoc (documentación alternativa)

## Características Principales

### Gestión de Vehículos
- Registro completo de vehículos (marca, modelo, año, placa, etc.)
- Tipos: Automóvil, Motocicleta, Camión, SUV, Van
- Seguimiento de kilometraje actual
- Información técnica (motor, chasis, capacidad de tanque)
- Foto del vehículo (opcional)

### Registro de Combustible
- **Unidad:** Galones (estándar en Ecuador)
- Registro de cargas de combustible con fecha y kilometraje
- Tipos de combustible: Extra, Super, Ecopaís, Diesel
- **Cálculo automático de rendimiento (km/gal)**
- Precio por galón y costo total
- Histórico de cargas por vehículo
- Estadísticas de consumo
- Estación de servicio y notas adicionales

### Mantenimiento
- Registro de mantenimientos preventivos, correctivos y de emergencia
- Categorías: Motor, Frenos, Suspensión, Eléctrico, Transmisión, Neumáticos, Carrocería, Climatización, Otro
- Seguimiento de costos y kilometraje
- Taller donde se realizó el servicio
- Descripción detallada y notas

### Sistema de Alertas
- Alertas de mantenimiento programado
- Alertas por kilometraje (ej: cambio de aceite cada 5000 km)
- Alertas por fecha (ej: revisión técnica anual)
- Prioridades: Baja, Media, Alta, Urgente
- Notificaciones de alertas vencidas
- Marcado de alertas completadas

### Autenticación y Seguridad
- Sistema de autenticación con JWT (JSON Web Tokens)
- Tokens de acceso y refresh
- Protección de rutas en frontend
- Cada usuario solo ve sus propios datos
- Cambio de contraseña seguro

### Dashboard
- Resumen de vehículos, cargas, mantenimientos y alertas activas
- Últimas cargas de combustible
- Alertas urgentes destacadas
- Saludo personalizado según hora del día
- Pull-to-refresh para actualizar datos

## Migraciones y Cambios Recientes

### Conversión de Litros a Galones

El sistema fue actualizado de litros a galones como unidad de medida de combustible, siguiendo el estándar de Ecuador.

**Cambios en modelos:**
- Campo `litros` renombrado a `galones`
- Campo `precio_litro` renombrado a `precio_galon`
- Cálculo de rendimiento actualizado a km/gal
- Capacidad de tanque ahora en galones

**Migración aplicada:**
```bash
# Migration: 0002_rename_litros_to_galones
# Renombra campos usando RenameField (preserva datos)
```

**Factor de conversión (referencia):**
- 1 galón (US) = 3.785 litros
- 1 litro = 0.264172 galones

### Aplicar Migraciones en Azure

Si desplegaste el backend en Azure y necesitas aplicar migraciones:

**Método 1: Azure Portal (SSH)**
1. Ve a Azure Portal → Tu App Service
2. Ve a "SSH" en el menú
3. Ejecuta:
```bash
python manage.py migrate
```

**Método 2: Azure CLI**
```bash
az webapp ssh --resource-group <tu-resource-group> --name kmtracker-api

# Una vez dentro:
python manage.py migrate
```

## Despliegue en Azure

### Backend en Azure App Service

**Configuración:**
- App Service Plan: B1 (Basic)
- Runtime: Python 3.11
- Base de datos: Azure Database for MySQL - Flexible Server
- CI/CD: GitHub Actions (workflow en `.github/workflows/azure-deploy.yml`)

**Variables de entorno en Azure (Application Settings):**
```
SECRET_KEY=<tu-secret-key-de-produccion>
DEBUG=False
ALLOWED_HOSTS=kmtracker-api.azurewebsites.net
DB_NAME=kmtracker_db
DB_USER=kmtracker_admin
DB_PASSWORD=<tu-password>
DB_HOST=kmtracker-db.mysql.database.azure.com
DB_PORT=3306
```

**Comandos útiles:**

```bash
# Conectar por SSH a Azure
az webapp ssh --resource-group <resource-group> --name kmtracker-api

# Ver logs en tiempo real
az webapp log tail --resource-group <resource-group> --name kmtracker-api

# Reiniciar app
az webapp restart --resource-group <resource-group> --name kmtracker-api
```

### GitHub Actions CI/CD

El proyecto incluye workflow de CI/CD que se ejecuta automáticamente en cada push a `main`:

1. Instala dependencias
2. Ejecuta tests
3. Despliega a Azure App Service

**Nota:** Las migraciones NO se ejecutan automáticamente. Debes aplicarlas manualmente después del despliegue.

---

**Última actualización:** Enero 2026
**Versión:** 1.0.0
