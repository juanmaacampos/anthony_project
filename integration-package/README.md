# 🍽️ CMS Menu - Paquete de Integración para React

> **¿Qué hace esto?** Te permite mostrar tu menú del CMS en **cualquier** página web React + Vite. Subes platos al CMS ➜ aparecen automáticamente en tu web frontend. ✨

## 📁 ¿Qué hay en esta carpeta?

```
integration-package/           ← ESTA carpeta tiene TODO lo que necesitas
├── menu-sdk.js               # Se conecta a Firebase
├── useMenu.js                # React hooks (maneja estado)
├── MenuComponents.jsx        # Componentes visuales
├── MenuComponents.css        # Estilos bonitos
├── config.js                 # Tu configuración aquí
├── examples.jsx              # 5 ejemplos de uso
└── README.md                 # Esta guía
```

## 🚀 Instalación súper fácil (3 pasos)

### 1️⃣ Instalar Firebase en tu proyecto React
```bash
cd tu-proyecto-react
npm install firebase
```

### 2️⃣ Copiar esta carpeta completa
```bash
# Desde el directorio de tu CMS
cp -r integration-package/ tu-proyecto-react/src/cms-menu/

# O manualmente: copia TODA la carpeta integration-package/
# y pégala como src/cms-menu/ en tu proyecto
```

### 3️⃣ Configurar 2 valores
1. **Obtén el ID del restaurante**:
   - Abre tu CMS panel
   - Inicia sesión con la cuenta del restaurante
   - Pulsa F12 → Consola → ejecuta: `firebase.auth().currentUser.uid`
   - Copia ese ID (ej: `abc123def456...`)

2. **Edita `src/cms-menu/config.js`**:
   ```javascript
   export const MENU_CONFIG = {
     firebaseConfig: {
       // Pon aquí la config de Firebase (igual que en tu CMS)
       apiKey: "tu-api-key...",
       authDomain: "tu-proyecto.firebaseapp.com",
       // etc...
     },
     restaurantId: "abc123def456..."  // ← Pon tu UID aquí
   };
   ```

## 💡 Uso básico

### Opción 1: Usa un ejemplo completo
```jsx
import RestaurantPage from './cms-menu/examples.jsx';

function App() {
  return <RestaurantPage />;
}
```

### Opción 2: Construye tu propio componente
```jsx
import React from 'react';
import { createMenuSDK } from './cms-menu/menu-sdk.js';
import { MenuDisplay } from './cms-menu/MenuComponents.jsx';
import { useMenu, useCart } from './cms-menu/useMenu.js';
import { MENU_CONFIG } from './cms-menu/config.js';
import './cms-menu/MenuComponents.css';

function MiRestaurante() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { menu, loading, error } = useMenu(menuSDK);
  const { addToCart } = useCart();

  return (
    <div>
      <h1>Mi Restaurante</h1>
      <MenuDisplay 
        menu={menu}
        onAddToCart={addToCart}
        loading={loading}
        error={error}
        showImages={true}
      />
    </div>
  );
}
```

## 🎯 Ejemplos disponibles

El archivo `examples.jsx` incluye 5 casos de uso diferentes:

1. **`RestaurantPage`** - Página completa con menú y carrito
2. **`FeaturedPage`** - Solo platos destacados  
3. **`CompactMenu`** - Menú sin imágenes (compacto)
4. **`SimpleRestaurantMenu`** - Todo-en-uno más simple
5. **`MenuOnly`** - Solo menú sin carrito

## 🎨 Personalización

### Cambiar colores
Edita las variables CSS en `MenuComponents.css`:
```css
:root {
  --menu-primary: #tu-color;
  --menu-success: #tu-color;
  --menu-danger: #tu-color;
}
```

### Customizar componentes
Todos los componentes aceptan props para personalización:
```jsx
<MenuDisplay 
  menu={menu}
  showImages={false}      // Ocultar imágenes
  showPrices={true}       // Mostrar precios
  showDescription={false} // Ocultar descripciones
  onAddToCart={addToCart}
/>
```

## 🔧 API Reference

### Hooks disponibles

#### `useMenu(menuSDK)`
```javascript
const { restaurant, menu, loading, error } = useMenu(menuSDK);
```

#### `useCart()`
```javascript
const { 
  cart, 
  addToCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  cartTotal, 
  cartCount 
} = useCart();
```

#### `useFeaturedItems(menuSDK)`
```javascript
const { featuredItems, loading, error } = useFeaturedItems(menuSDK);
```

### Componentes disponibles

- `<MenuDisplay />` - Menú completo por categorías
- `<FeaturedItems />` - Solo platos destacados
- `<Cart />` - Carrito de compras
- `<MenuWithCart />` - Todo integrado
- `<MenuItem />` - Item individual

## 🛠️ Troubleshooting

### "Restaurant not found"
- ✅ Verifica que el `restaurantId` en `config.js` sea correcto
- ✅ Asegúrate de que ese restaurante tenga platos en el menú

### "Firebase error"
- ✅ Verifica la configuración de Firebase en `config.js`
- ✅ Asegúrate de que tu dominio esté autorizado en Firebase Console

### No se muestran las imágenes
- ✅ Verifica que las URLs de las imágenes sean accesibles
- ✅ Revisa la configuración de CORS en Firebase Storage

## 🔄 Flujo de trabajo

1. **Administrador usa el CMS**: Sube platos, categorías, precios
2. **Los cambios se guardan en Firebase**: En tiempo real
3. **Tu web frontend**: Muestra automáticamente los cambios
4. **Sin deploy necesario**: Todo es dinámico

## 📱 Responsive

Todos los componentes son completamente responsive y se adaptan a:
- 📱 Móviles
- 📱 Tablets  
- 💻 Desktop

¡Eso es todo! Tu CMS de menús ya está integrado 🎉
