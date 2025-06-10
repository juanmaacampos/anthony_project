#!/bin/bash

# Script para instalar el CMS Menu Integration en un proyecto React + Vite
# Uso: ./install.sh [ruta-al-proyecto]

echo "🍽️ Instalador CMS Menu Integration"
echo "=================================="

# Verificar que se proporcione la ruta del proyecto
if [ -z "$1" ]; then
  echo "❌ Error: Debes proporcionar la ruta del proyecto"
  echo "💡 Uso: ./install.sh /ruta/a/tu/proyecto"
  exit 1
fi

PROJECT_PATH="$1"
CMS_MENU_PATH="$PROJECT_PATH/src/cms-menu"

# Verificar que el proyecto existe y tiene package.json
if [ ! -f "$PROJECT_PATH/package.json" ]; then
  echo "❌ Error: No se encontró package.json en $PROJECT_PATH"
  echo "💡 Asegúrate de que sea un proyecto React válido"
  exit 1
fi

echo "📁 Proyecto encontrado: $PROJECT_PATH"

# Crear directorio cms-menu
echo "📦 Creando directorio cms-menu..."
mkdir -p "$CMS_MENU_PATH"

# Copiar archivos
echo "📋 Copiando archivos del SDK..."
cp menu-sdk.js "$CMS_MENU_PATH/"
cp useMenu.js "$CMS_MENU_PATH/"
cp MenuComponents.jsx "$CMS_MENU_PATH/"
cp MenuComponents.css "$CMS_MENU_PATH/"
cp config.js "$CMS_MENU_PATH/"
cp examples.jsx "$CMS_MENU_PATH/"
cp README.md "$CMS_MENU_PATH/"

# Verificar si Firebase está instalado
echo "🔥 Verificando dependencias..."
cd "$PROJECT_PATH"

if ! npm list firebase > /dev/null 2>&1; then
  echo "📦 Instalando Firebase..."
  npm install firebase
else
  echo "✅ Firebase ya está instalado"
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a $CMS_MENU_PATH/config.js"
echo "2. Reemplaza 'YOUR_RESTAURANT_UID_HERE' con tu UID real"
echo "3. Importa y usa los componentes en tu app:"
echo ""
echo "   import RestaurantPage from './cms-menu/examples.jsx';"
echo ""
echo "4. ¡Listo! Tu menú ya está integrado 🚀"
echo ""
echo "📖 Lee $CMS_MENU_PATH/README.md para más ejemplos"
