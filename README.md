# Restaurant CMS Menu System

## 📋 Descripción

Este proyecto incluye un sistema CMS (Content Management System) completo para menús de restaurantes, integrado con Firebase Firestore. El sistema permite cargar y mostrar menús de forma dinámica desde una base de datos en la nube, con funcionalidades avanzadas como carrito de compras, gestión de estado y optimización de rendimiento.

## 🏗️ Arquitectura del CMS

### Componentes Principales

#### 1. **GlobalFirebaseManager** (`src/cms-menu/firebase-manager.js`)
- Gestiona la conexión global a Firebase
- Implementa patrón Singleton para evitar múltiples inicializaciones
- Maneja la limpieza de recursos automáticamente
- Incluye sistema de conteo de referencias para cleanup seguro

#### 2. **MenuSDK** (`src/cms-menu/menu-sdk.js`)
- SDK principal para interactuar con los datos del menú
- Métodos principales:
  - `getRestaurantInfo()`: Obtiene información del restaurante
  - `getFullMenu()`: Carga el menú completo con categorías e ítems
  - `getFeaturedItems()`: Obtiene productos destacados

#### 3. **MenuSDKManager** (`src/cms-menu/menu-sdk-singleton.js`)
- Gestiona instancias únicas del MenuSDK
- Evita crear múltiples conexiones para el mismo restaurante
- Optimiza el uso de memoria y recursos

#### 4. **Hooks de React** (`src/cms-menu/useMenu.js`)
- `useMenu()`: Hook para cargar y gestionar datos del menú
- `useCart()`: Hook para gestión del carrito de compras
- `useMenuIntegration()`: Hook unificado que combina menú y carrito

#### 5. **Componentes UI** (`src/cms-menu/MenuComponents.jsx`)
- `MenuDisplay`: Componente principal para mostrar el menú
- `MenuItem`: Componente individual para cada producto
- `Cart`: Componente del carrito de compras
- `MenuWithCart`: Componente integrado con funcionalidad completa

## 🔧 Configuración

### Firebase Setup

1. **Configuración en `src/cms-menu/config.js`:**
```javascript
export const MENU_CONFIG = {
  firebaseConfig: {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123",
    measurementId: "G-XXXXXXXXX"
  },
  restaurantId: "tu-restaurant-uid"
};
```

2. **Estructura de Datos en Firestore:**
```
restaurants/
  └── {restaurantId}/
      ├── name: "Nombre del Restaurante"
      ├── description: "Descripción"
      ├── phone: "+1234567890"
      ├── email: "contacto@restaurante.com"
      └── menu/
          └── {categoryId}/
              ├── name: "Categoría"
              ├── description: "Descripción de categoría"
              ├── order: 1
              └── items/
                  └── {itemId}/
                      ├── name: "Nombre del producto"
                      ├── description: "Descripción"
                      ├── price: 12.99
                      ├── image: "url-imagen"
                      ├── isAvailable: true
                      └── isFeatured: false
```

## 🚀 Integración en la Aplicación

### Paso 1: Importar el Sistema CMS

```jsx
import { useMenuIntegration } from './cms-menu/useMenu.js';
import { MENU_CONFIG } from './cms-menu/config.js';
import { MenuDisplay } from './cms-menu/MenuComponents.jsx';
```

### Paso 2: Implementar en un Componente

```jsx
const Menu = () => {
  // Integración completa del CMS
  const { menu, loading, error, addToCart, cart, total } = useMenuIntegration(
    MENU_CONFIG, 
    { enabled: true }
  );

  return (
    <section>
      <MenuDisplay 
        menu={menu} 
        loading={loading}
        error={error}
        onAddToCart={addToCart}
        showImages={true}
        showPrices={true}
        showDescription={true}
      />
    </section>
  );
};
```

### Paso 3: Ejemplo de Integración Avanzada

```jsx
const RestaurantApp = () => {
  const menuIntegration = useMenuIntegration(MENU_CONFIG);
  
  return (
    <div>
      {/* Menú principal */}
      <MenuDisplay {...menuIntegration} />
      
      {/* Carrito flotante */}
      {menuIntegration.cart.length > 0 && (
        <Cart 
          cart={menuIntegration.cart}
          total={menuIntegration.total}
          onUpdateQuantity={menuIntegration.updateQuantity}
          onRemove={menuIntegration.removeFromCart}
          onClear={menuIntegration.clearCart}
        />
      )}
    </div>
  );
};
```

## 📱 Funcionalidades

### ✅ Gestión de Menú
- ✅ Carga automática de categorías y productos
- ✅ Ordenamiento personalizable
- ✅ Filtrado por disponibilidad
- ✅ Productos destacados
- ✅ Imágenes optimizadas
- ✅ Precios dinámicos

### ✅ Carrito de Compras
- ✅ Agregar/quitar productos
- ✅ Actualizar cantidades
- ✅ Cálculo automático de totales
- ✅ Persistencia en sesión
- ✅ Contador de productos

### ✅ Optimización y Rendimiento
- ✅ Singleton pattern para Firebase
- ✅ Gestión automática de recursos
- ✅ Lazy loading de imágenes
- ✅ Error handling robusto
- ✅ Retry automático en errores de red
- ✅ Cleanup automático de memoria

### ✅ UX/UI Features
- ✅ Estados de carga
- ✅ Manejo de errores user-friendly
- ✅ Animaciones suaves
- ✅ Responsive design
- ✅ Accesibilidad

## 🛠️ API Reference

### useMenuIntegration Hook

```javascript
const {
  // Datos del restaurante
  restaurant,
  
  // Menú completo
  menu,
  
  // Estados
  loading,
  error,
  retry,
  
  // Carrito
  cart,
  total,
  itemCount,
  
  // Acciones del carrito
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  
  // SDK instance
  menuSDK
} = useMenuIntegration(config, options);
```

### MenuSDK Methods

```javascript
const menuSDK = createMenuSDK(firebaseConfig, restaurantId);

// Obtener información del restaurante
const restaurant = await menuSDK.getRestaurantInfo();

// Obtener menú completo
const menu = await menuSDK.getFullMenu();

// Obtener productos destacados
const featured = await menuSDK.getFeaturedItems();
```

## 🔄 Estados del Sistema

### Loading States
- `loading: true` - Cargando datos iniciales
- `loading: false` - Datos cargados o error

### Error States
- Errores de red
- Errores de permisos
- Errores de Firebase
- Retry automático disponible

## 🎨 Personalización

### CSS Classes Disponibles
```css
.menu-display
.menu-category
.category-title
.category-description
.menu-items
.menu-item
.item-image
.item-info
.item-name
.item-description
.item-price
.add-to-cart-btn
.cart-container
.cart-item
.cart-total
```

### Configuración de Estilos
Personaliza los estilos en `src/cms-menu/MenuComponents.css` o sobrescribe las clases CSS en tu tema.

## 🚀 Deployment

1. **Build del proyecto:**
```bash
npm run build
```

2. **Preview local:**
```bash
npm run preview
```

3. **Deploy a GitHub Pages:**
```bash
npm run deploy
```

## 📋 Requisitos del Sistema

- React 18+
- Firebase 10+
- Node.js 16+
- Vite 5+

## 🔐 Seguridad

### Reglas de Firebase Security
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública de restaurantes y menús
    match /restaurants/{restaurantId} {
      allow read: if true;
      match /menu/{categoryId} {
        allow read: if true;
        match /items/{itemId} {
          allow read: if true;
        }
      }
    }
  }
}
```

## 🐛 Troubleshooting

### Errores Comunes

1. **"Firebase not initialized"**
   - Verificar configuración en `config.js`
   - Comprobar conectividad a internet

2. **"Permission denied"**
   - Verificar reglas de Firestore
   - Comprobar configuración del proyecto

3. **"Restaurant not found"**
   - Verificar que el `restaurantId` exista en Firestore
   - Verificar estructura de datos

### Debug Mode
```javascript
// Activar logs detallados
const options = { 
  enabled: true, 
  debug: true 
};
```

## 📞 Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio del proyecto.

---

**Desarrollado con ❤️ para restaurantes modernos**