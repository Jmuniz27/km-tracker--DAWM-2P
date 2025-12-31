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
  local: `# Configuración LOCAL (emulador/web)
API_URL=http://127.0.0.1:8000/api
# API_URL_PRODUCTION=https://kmtracker-api.azurewebsites.net/api

# Modo: LOCAL - Backend corriendo en localhost
# Solo funciona en emulador Android o web, NO en dispositivo físico
`,
  'local-device': `# Configuración LOCAL (dispositivo físico)
API_URL=http://192.168.100.218:8000/api
# API_URL_PRODUCTION=https://kmtracker-api.azurewebsites.net/api

# Modo: LOCAL DEVICE - Backend corriendo en tu PC
# Funciona con dispositivo físico en la misma red WiFi
# IMPORTANTE: Asegúrate de que tu PC y celular estén en la misma red
`,
  remote: `# Configuración REMOTA
# API_URL=http://127.0.0.1:8000/api
API_URL_PRODUCTION=https://kmtracker-api.azurewebsites.net/api

# Modo: REMOTO - Backend en Azure (DEFAULT)
# La app se conectará al servidor de producción
# Funciona desde cualquier lugar con internet
`
};

if (!mode || !envConfigs[mode]) {
  console.error('\n❌ Error: Debes especificar el modo de conexión\n');
  console.log('Modos disponibles:');
  console.log('  npm run env:remote        - Backend en Azure (DEFAULT, recomendado)');
  console.log('  npm run env:local         - Backend local para emulador/web');
  console.log('  npm run env:local-device  - Backend local para dispositivo físico\n');
  process.exit(1);
}

try {
  fs.writeFileSync(envPath, envConfigs[mode], 'utf8');

  console.log('\n✅ Configuración actualizada exitosamente!\n');

  if (mode === 'local') {
    console.log('📍 Modo: LOCAL (Emulador/Web)');
    console.log('🔗 Backend: http://127.0.0.1:8000/api');
    console.log('');
    console.log('⚠️  Asegúrate de que el backend esté corriendo:');
    console.log('   cd backend');
    console.log('   python manage.py runserver');
    console.log('');
    console.log('💡 Usa Emulador Android o web (NO funcionará en dispositivo físico)');
  } else if (mode === 'local-device') {
    console.log('📍 Modo: LOCAL (Dispositivo Físico)');
    console.log('🔗 Backend: http://192.168.100.218:8000/api');
    console.log('');
    console.log('⚠️  Requisitos:');
    console.log('   1. Backend corriendo: python manage.py runserver');
    console.log('   2. PC y celular en la MISMA red WiFi');
    console.log('   3. Firewall permita conexiones al puerto 8000');
  } else {
    console.log('📍 Modo: REMOTO (Azure) - DEFAULT');
    console.log('🔗 Backend: https://kmtracker-api.azurewebsites.net/api');
    console.log('');
    console.log('✨ Funciona desde cualquier lugar con internet');
    console.log('⚠️  Los cambios de código deben estar desplegados en Azure');
  }

  console.log('\n🔄 Para aplicar los cambios, reinicia Expo:');
  console.log('   npx expo start --clear\n');

} catch (error) {
  console.error('❌ Error al escribir el archivo .env:', error.message);
  process.exit(1);
}
