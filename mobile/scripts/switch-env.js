#!/usr/bin/env node

/**
 * Script para cambiar entre ambiente LOCAL y REMOTO
 * Uso:
 *   node scripts/switch-env.js local   - Para usar backend local
 *   node scripts/switch-env.js remote  - Para usar backend remoto en Azure
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const mode = process.argv[2];

const envConfigs = {
  local: `# Configuración LOCAL
API_URL=http://127.0.0.1:8000/api
# API_URL_PRODUCTION=https://kmtracker-api.azurewebsites.net/api

# Modo: LOCAL - Backend corriendo en localhost
# Para probar en dispositivo físico, cambia 127.0.0.1 por tu IP local (ej: 192.168.1.X)
`,
  remote: `# Configuración REMOTA
# API_URL=http://127.0.0.1:8000/api
API_URL_PRODUCTION=https://kmtracker-api.azurewebsites.net/api

# Modo: REMOTO - Backend en Azure
# La app se conectará al servidor de producción
`
};

if (!mode || !envConfigs[mode]) {
  console.error('\n❌ Error: Debes especificar "local" o "remote"\n');
  console.log('Uso:');
  console.log('  npm run env:local   - Usar backend local (http://127.0.0.1:8000)');
  console.log('  npm run env:remote  - Usar backend remoto (Azure)\n');
  process.exit(1);
}

try {
  fs.writeFileSync(envPath, envConfigs[mode], 'utf8');

  console.log('\n✅ Configuración actualizada exitosamente!\n');

  if (mode === 'local') {
    console.log('📍 Modo: LOCAL');
    console.log('🔗 Backend: http://127.0.0.1:8000/api');
    console.log('');
    console.log('⚠️  Asegúrate de que el backend esté corriendo:');
    console.log('   cd backend');
    console.log('   python manage.py runserver\n');
  } else {
    console.log('📍 Modo: REMOTO');
    console.log('🔗 Backend: https://kmtracker-api.azurewebsites.net/api');
    console.log('');
    console.log('⚠️  Asegúrate de que las migraciones estén aplicadas en Azure\n');
  }

  console.log('🔄 Para aplicar los cambios, reinicia Expo:');
  console.log('   npx expo start --clear\n');

} catch (error) {
  console.error('❌ Error al escribir el archivo .env:', error.message);
  process.exit(1);
}
