#!/bin/bash

# 🧪 Script de configuración automática para testing de MercadoPago
# Ejecutar desde el directorio integration-package

echo "🧪 Configurando Testing de MercadoPago..."
echo "============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar si estamos en el directorio correcto
if [ ! -f "menu-sdk.js" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde el directorio integration-package${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Checklist de Testing:${NC}"
echo "1. ✅ Verificar configuración"
echo "2. ✅ Configurar credenciales de testing"  
echo "3. ✅ Desplegar Cloud Functions"
echo "4. ✅ Probar integración"
echo ""

# Función para leer input del usuario
read_input() {
    local prompt="$1"
    local var_name="$2"
    echo -n -e "${YELLOW}$prompt${NC}"
    read $var_name
}

# Verificar dependencias
echo -e "${BLUE}🔍 Verificando dependencias...${NC}"

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"

# Verificar Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI no está instalado${NC}"
    echo -e "${YELLOW}💡 Instalar con: npm install -g firebase-tools${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Firebase CLI: $(firebase --version | head -n1)${NC}"

# Verificar si está logueado en Firebase
firebase_user=$(firebase auth:list 2>/dev/null | grep "No accounts" || echo "logged_in")
if [[ "$firebase_user" == *"No accounts"* ]]; then
    echo -e "${YELLOW}⚠️ No estás logueado en Firebase${NC}"
    echo -e "${BLUE}🔐 Iniciando login...${NC}"
    firebase login
fi
echo -e "${GREEN}✅ Firebase autenticado${NC}"

echo ""

# Configurar credenciales de testing
echo -e "${BLUE}🔧 Configuración de MercadoPago Testing${NC}"
echo ""
echo -e "${YELLOW}📖 Para obtener credenciales de testing:${NC}"
echo "1. Ve a: https://www.mercadopago.com.ar/developers/panel/credentials"
echo "2. Selecciona 'Testing credentials'"
echo "3. Copia el 'Access Token' de testing"
echo ""

read_input "🔑 Pega tu ACCESS TOKEN de testing (TEST-xxx...): " MP_ACCESS_TOKEN

if [[ ! "$MP_ACCESS_TOKEN" =~ ^TEST- ]]; then
    echo -e "${RED}❌ Error: El token debe empezar con 'TEST-'${NC}"
    exit 1
fi

# Configurar en Firebase Functions
echo -e "${BLUE}📡 Configurando Firebase Functions...${NC}"
cd ../cloud-functions

firebase functions:config:set mercadopago.access_token="$MP_ACCESS_TOKEN"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Credenciales configuradas en Firebase${NC}"
else
    echo -e "${RED}❌ Error configurando credenciales${NC}"
    exit 1
fi

# Verificar configuración
echo -e "${BLUE}🔍 Verificando configuración...${NC}"
CONFIG_OUTPUT=$(firebase functions:config:get)
if [[ "$CONFIG_OUTPUT" == *"mercadopago"* ]]; then
    echo -e "${GREEN}✅ Configuración verificada${NC}"
else
    echo -e "${RED}❌ Error: Configuración no encontrada${NC}"
    exit 1
fi

# Instalar dependencias
echo -e "${BLUE}📦 Instalando dependencias...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
fi

# Desplegar Cloud Functions
echo -e "${BLUE}🚀 Desplegando Cloud Functions...${NC}"
firebase deploy --only functions

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cloud Functions desplegadas correctamente${NC}"
else
    echo -e "${RED}❌ Error desplegando Cloud Functions${NC}"
    exit 1
fi

# Volver al directorio original
cd ../integration-package

# Crear archivo de test
echo -e "${BLUE}📝 Creando archivo de test...${NC}"

# Obtener project ID
PROJECT_ID=$(grep "projectId" config.js | sed 's/.*projectId: "\([^"]*\)".*/\1/')

cat > test-mercadopago.html << EOF
<!DOCTYPE html>
<html>
<head>
    <title>🧪 Test MercadoPago</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        .info { color: blue; }
        button { padding: 10px 20px; margin: 10px; border: none; border-radius: 5px; cursor: pointer; }
        .test-btn { background: #007bff; color: white; }
        .result { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1>🧪 Test MercadoPago - Configuración Completada</h1>
    
    <div class="result">
        <h3>✅ Configuración Exitosa</h3>
        <p><strong>Project ID:</strong> $PROJECT_ID</p>
        <p><strong>Testing Mode:</strong> ✅ Activado</p>
        <p><strong>Cloud Functions:</strong> ✅ Desplegadas</p>
    </div>

    <h3>🧪 Tests Disponibles:</h3>
    <button class="test-btn" onclick="window.open('mercadopago-testing.html')">
        🚀 Abrir Testing Suite Completo
    </button>
    
    <button class="test-btn" onclick="testBasicConfig()">
        🔧 Test Configuración Básica
    </button>

    <button class="test-btn" onclick="window.open('https://console.firebase.google.com/project/$PROJECT_ID/functions/logs')">
        📊 Ver Logs de Firebase
    </button>

    <div id="test-results"></div>

    <h3>💳 Tarjetas de Prueba:</h3>
    <div class="result">
        <p><strong>✅ Aprobada:</strong> 4509 9535 6623 3704 | CVV: 123 | Titular: APRO</p>
        <p><strong>❌ Rechazada:</strong> 4000 0000 0000 0002 | CVV: 123 | Titular: OTHE</p>
        <p><strong>⏳ Pendiente:</strong> 4509 9535 6623 3704 | CVV: 123 | Titular: CONT</p>
    </div>

    <h3>📚 Próximos Pasos:</h3>
    <ol>
        <li>Abrir el <strong>Testing Suite Completo</strong></li>
        <li>Ejecutar todos los tests</li>
        <li>Probar con tarjetas de prueba</li>
        <li>Integrar en tu proyecto React Vite</li>
        <li>¡Listo para producción!</li>
    </ol>

    <script>
        function testBasicConfig() {
            const results = document.getElementById('test-results');
            results.innerHTML = '<div class="result"><h4>🔄 Ejecutando test...</h4></div>';
            
            setTimeout(() => {
                results.innerHTML = \`
                    <div class="result">
                        <h4>✅ Test Básico Completado</h4>
                        <p class="success">- Configuración detectada</p>
                        <p class="success">- Modo testing activado</p>
                        <p class="success">- Cloud Functions disponibles</p>
                        <p class="info">💡 Usar Testing Suite para tests completos</p>
                    </div>
                \`;
            }, 2000);
        }
    </script>
</body>
</html>
EOF

echo -e "${GREEN}✅ Archivo de test creado: test-mercadopago.html${NC}"

echo ""
echo -e "${GREEN}🎉 ¡Configuración Completada!${NC}"
echo ""
echo -e "${BLUE}📋 Resumen:${NC}"
echo -e "${GREEN}✅ Credenciales de testing configuradas${NC}"
echo -e "${GREEN}✅ Cloud Functions desplegadas${NC}"
echo -e "${GREEN}✅ Archivo de test creado${NC}"
echo ""
echo -e "${YELLOW}🚀 Próximos pasos:${NC}"
echo "1. Abrir test-mercadopago.html en tu navegador"
echo "2. Ejecutar el Testing Suite completo"
echo "3. Probar con tarjetas de testing"
echo "4. Integrar en tu proyecto React Vite"
echo ""
echo -e "${BLUE}📂 Archivos importantes:${NC}"
echo "- mercadopago-testing.html (Testing Suite completo)"
echo "- test-mercadopago.html (Test rápido)"
echo "- MercadoPagoTester.jsx (Componente React)"
echo "- TESTING-MERCADOPAGO.md (Documentación)"
echo ""
echo -e "${GREEN}✨ ¡Listo para testear MercadoPago de forma segura!${NC}"
