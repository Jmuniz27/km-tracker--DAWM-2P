# KmTracker - Sistema de Gestión de Vehículos

Sistema completo para el seguimiento y gestión de vehículos, cargas de combustible y mantenimiento. Incluye un backend REST API desarrollado con Django y una aplicación móvil desarrollada con React Native/Expo.

## Autor

**Juan Muñiz**

## Tecnologías

### Backend
- Python 3.x
- Django 4.2.11
- Django REST Framework 3.14.0
- MySQL Database
- django-cors-headers 4.3.1
- python-decouple 3.8

### Mobile
- React Native
- Expo 50
- React Navigation
- Axios para peticiones HTTP
- AsyncStorage para almacenamiento local

## Estructura del Proyecto

```
km-tracker--DAWM-2P/
├── backend/
│   ├── kmtracker_api/       # Configuración del proyecto Django
│   ├── apps/
│   │   ├── vehicles/        # App de vehículos
│   │   ├── fuel_logs/       # App de cargas de combustible
│   │   └── maintenance/     # App de mantenimiento
│   ├── requirements.txt
│   ├── .env.example
│   └── manage.py
└── mobile/
    ├── src/
    │   ├── screens/         # Pantallas de la app
    │   ├── services/        # Servicios API
    │   └── utils/           # Utilidades y constantes
    ├── package.json
    └── .env.example
```

## Instalación

### Backend - Django REST API

1. Navegar al directorio del backend:
```bash
cd backend
```

2. Crear y activar entorno virtual:
```bash
python -m venv venv
venv\Scripts\activate  # En Windows
# source venv/bin/activate  # En Linux/Mac
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:
```
SECRET_KEY=tu-secret-key-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=kmtracker_db
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=3306
```

#### Configuración para Azure MySQL Flexible Server

Si vas a usar Azure MySQL Flexible Server en lugar de MySQL local:

1. Variables de entorno en `.env`:
```bash
DB_NAME=kmtracker_db
DB_USER=kmtracker_admin
DB_PASSWORD=tu_password_azure
DB_HOST=kmtracker-db.mysql.database.azure.com
DB_PORT=3306
```

2. Requisitos de Azure:
   - SSL/TLS está habilitado automáticamente (configurado en settings.py)
   - Agregar tu IP a las reglas de firewall en Azure Portal
   - El formato del usuario NO incluye @servidor (usa Flexible Server, no Single Server)

3. Verificar conexión:
```bash
# Desde línea de comandos con mysql client
mysql -h kmtracker-db.mysql.database.azure.com -u kmtracker_admin -p --ssl-mode=REQUIRED

# Desde Django
python manage.py check --database default
```

4. Continuar con las migraciones normalmente (paso 6 más abajo)

---

5. Crear base de datos MySQL:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE kmtracker_db;
EXIT;
```

6. Ejecutar migraciones:
```bash
python manage.py makemigrations
python manage.py migrate
```

7. Crear superusuario:
```bash
python manage.py createsuperuser
```

8. Ejecutar servidor de desarrollo:
```bash
python manage.py runserver
```

El servidor estará disponible en `http://localhost:8000`

### Mobile - React Native/Expo

1. Navegar al directorio mobile:
```bash
cd mobile
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar el archivo `.env` con la IP de tu computadora:
```
API_URL=http://192.168.1.100:8000/api
```

Para obtener tu IP local:
- Windows: `ipconfig`
- Linux/Mac: `ifconfig`

4. Iniciar aplicación:
```bash
npx expo start
```

5. Escanear código QR con Expo Go en tu dispositivo móvil.

## Endpoints de la API

### Vehículos
- `GET /api/vehicles/` - Listar todos los vehículos
- `POST /api/vehicles/` - Crear nuevo vehículo
- `GET /api/vehicles/{id}/` - Obtener vehículo específico
- `PUT /api/vehicles/{id}/` - Actualizar vehículo
- `DELETE /api/vehicles/{id}/` - Eliminar vehículo
- `POST /api/vehicles/{id}/actualizar_kilometraje/` - Actualizar kilometraje

### Cargas de Combustible
- `GET /api/fuel-logs/` - Listar todas las cargas
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
- `GET /api/maintenance/alertas/vencidas/` - Obtener alertas vencidas

## Características Principales

### Gestión de Vehículos
- Registro completo de vehículos (marca, modelo, año, placa, etc.)
- Tipos: Auto, Moto, Camión, SUV, Van
- Seguimiento de kilometraje actual
- Información técnica (motor, chasis)

### Registro de Combustible
- Registro de cargas de combustible
- Tipos: Extra, Super, Ecopaís, Diesel
- Cálculo automático de rendimiento (km/L)
- Histórico de cargas por vehículo
- Estadísticas de consumo

### Mantenimiento
- Registro de mantenimientos preventivos y correctivos
- Categorías: Motor, Frenos, Suspensión, Eléctrico, etc.
- Seguimiento de costos
- Alertas de mantenimiento programado
- Notificaciones de alertas vencidas

## Panel de Administración

El backend incluye un panel de administración Django accesible en:
```
http://localhost:8000/admin
```

Desde aquí puedes gestionar todos los modelos de la aplicación.

## Desarrollo

### Backend
```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

### Mobile
```bash
cd mobile
npx expo start
```

## Licencia

Este proyecto fue desarrollado como parte de un proyecto académico.

## Contacto

Para consultas o sugerencias, contactar a Juan Muñiz.
