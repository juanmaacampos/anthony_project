#!/bin/bash

# 🔧 Script de Resolución Automática de Problemas CMS
# Este script identifica y resuelve problemas comunes de conectividad Firebase

echo "🔧 Iniciando diagnóstico y reparación automática..."
echo "================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar dependencias
print_status "Verificando dependencias de Firebase..."
if npm list firebase &> /dev/null; then
    print_success "Firebase está instalado"
else
    print_warning "Firebase no encontrado, instalando..."
    npm install firebase
    if [ $? -eq 0 ]; then
        print_success "Firebase instalado correctamente"
    else
        print_error "Error instalando Firebase"
        exit 1
    fi
fi

# 2. Verificar configuración
print_status "Verificando configuración..."
CONFIG_FILE="src/cms-menu/config.js"
if [ -f "$CONFIG_FILE" ]; then
    if grep -q "tu-api-key\|YOUR_RESTAURANT_UID_HERE" "$CONFIG_FILE"; then
        print_warning "La configuración necesita ser actualizada"
        echo "  - Edita $CONFIG_FILE"
        echo "  - Reemplaza 'tu-api-key' con tu API key real"
        echo "  - Reemplaza 'YOUR_RESTAURANT_UID_HERE' con el UID real"
    else
        print_success "Configuración parece estar actualizada"
    fi
else
    print_error "Archivo de configuración no encontrado: $CONFIG_FILE"
    exit 1
fi

# 3. Limpiar cache de Node
print_status "Limpiando cache de Node.js..."
npm cache clean --force
print_success "Cache limpiado"

# 4. Reinstalar node_modules si hay problemas
if [ "$1" = "--deep-clean" ]; then
    print_status "Realizando limpieza profunda..."
    rm -rf node_modules
    rm -f package-lock.json
    npm install
    print_success "Limpieza profunda completada"
fi

# 5. Verificar conectividad a Firebase
print_status "Verificando conectividad a Firebase..."
if ping -c 1 firestore.googleapis.com &> /dev/null; then
    print_success "Conectividad a Firebase OK"
else
    print_warning "Problemas de conectividad detectados"
    echo "  - Verifica tu conexión a internet"
    echo "  - Verifica que Firebase no esté bloqueado por firewall"
fi

# 6. Verificar puertos
print_status "Verificando que el puerto 5173 esté disponible..."
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    print_warning "Puerto 5173 en uso, matando proceso..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null
    sleep 2
    print_success "Puerto liberado"
else
    print_success "Puerto 5173 disponible"
fi

# 7. Generar reporte de diagnóstico
print_status "Generando reporte de diagnóstico..."
cat > diagnostic-report.txt << EOF
🔧 REPORTE DE DIAGNÓSTICO CMS - $(date)
================================================

CONFIGURACIÓN:
- Firebase instalado: $(npm list firebase 2>/dev/null | grep firebase || echo "NO INSTALADO")
- Archivo config.js existe: $([ -f "$CONFIG_FILE" ] && echo "SÍ" || echo "NO")
- Config actualizada: $(grep -q "tu-api-key\|YOUR_RESTAURANT_UID_HERE" "$CONFIG_FILE" 2>/dev/null && echo "NO" || echo "SÍ")

CONECTIVIDAD:
- Ping a Firebase: $(ping -c 1 firestore.googleapis.com &> /dev/null && echo "OK" || echo "FALLO")
- Puerto 5173: $(lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null && echo "EN USO" || echo "DISPONIBLE")

ARCHIVOS CRÍTICOS:
- menu-sdk.js: $([ -f "src/cms-menu/menu-sdk.js" ] && echo "✅" || echo "❌")
- menu-sdk-v2.js: $([ -f "src/cms-menu/menu-sdk-v2.js" ] && echo "✅" || echo "❌")
- useMenu.js: $([ -f "src/cms-menu/useMenu.js" ] && echo "✅" || echo "❌")
- useMenu-v2.js: $([ -f "src/cms-menu/useMenu-v2.js" ] && echo "✅" || echo "❌")

RECOMENDACIONES:
$(grep -q "tu-api-key\|YOUR_RESTAURANT_UID_HERE" "$CONFIG_FILE" 2>/dev/null && echo "- Actualizar configuración en $CONFIG_FILE" || echo "- Configuración parece correcta")
$(ping -c 1 firestore.googleapis.com &> /dev/null || echo "- Verificar conexión a internet y acceso a Firebase")

PRÓXIMOS PASOS:
1. Si hay problemas de configuración, edita src/cms-menu/config.js
2. Si hay problemas de conectividad, verifica tu red
3. Ejecuta 'npm run dev' para probar
4. Usa Ctrl+M en la app para acceder a herramientas de diagnóstico
5. Prueba el SDK v2 mejorado en la comparación de SDKs

EOF

print_success "Reporte guardado en diagnostic-report.txt"

# 8. Verificar estructura de archivos
print_status "Verificando estructura de archivos del CMS..."
REQUIRED_FILES=(
    "src/cms-menu/config.js"
    "src/cms-menu/menu-sdk.js"
    "src/cms-menu/menu-sdk-v2.js"
    "src/cms-menu/useMenu.js"
    "src/cms-menu/useMenu-v2.js"
    "src/cms-menu/MenuComponents.jsx"
    "src/cms-menu/MenuComponents.css"
    "src/pages/MenuPage.jsx"
    "src/pages/SDKComparison.jsx"
    "src/pages/FirebaseConnectionDiagnostic.jsx"
)

missing_files=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file"
    else
        print_error "❌ $file - FALTANTE"
        missing_files=$((missing_files + 1))
    fi
done

if [ $missing_files -eq 0 ]; then
    print_success "Todos los archivos del CMS están presentes"
else
    print_error "$missing_files archivos faltantes detectados"
fi

echo ""
echo "🎯 RESUMEN DEL DIAGNÓSTICO:"
echo "=========================="
print_success "Diagnóstico completado"
echo "📋 Reporte detallado en: diagnostic-report.txt"
echo ""
echo "🚀 PRÓXIMOS PASOS RECOMENDADOS:"
echo "1. Ejecuta: npm run dev"
echo "2. Presiona Ctrl+M en la aplicación"
echo "3. Ve a 'Comparación de SDKs' para probar el SDK v2 mejorado"
echo "4. Si sigues teniendo problemas, revisa el diagnostic-report.txt"
echo ""
echo "🔧 OPCIONES ADICIONALES:"
echo "  ./fix-cms-issues.sh --deep-clean    # Limpieza profunda"
echo "  npm run dev                         # Iniciar servidor"
echo "  npm run build                       # Probar build"
