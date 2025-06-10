# 🛡️ SDK Estable - Solución para Errores de Firestore

## 🚨 Problema Resuelto

Este SDK estable fue creado específicamente para resolver el error:
```
FIRESTORE (11.9.0) INTERNAL ASSERTION FAILED: Unexpected state (ID: b815)
```

## 🔧 Características del SDK Estable

### ✅ Mejoras Implementadas

1. **Manejo Singleton de Firebase**
   - Evita múltiples inicializaciones que causan conflictos
   - Una sola instancia de Firebase por aplicación

2. **Limpieza Automática de Conexiones**
   - Termina conexiones previas antes de crear nuevas
   - Limpia IndexedDB para evitar estados corruptos

3. **Timeouts Configurables**
   - Evita cuelgues indefinidos de consultas
   - Timeouts específicos para restaurante (10s) y menú (15s)

4. **Reintentos Inteligentes**
   - Backoff exponencial (2s, 4s, 8s)
   - Reset completo de Firebase en reintentos
   - Máximo 3 reintentos automáticos

5. **Manejo Robusto de Errores**
   - Detección específica de errores internos de Firestore
   - Mensajes de error más informativos
   - Opciones de recuperación manual

## 📦 Instalación y Uso

### Importar el SDK Estable

```javascript
import { useStableMenuIntegration } from './cms-menu/useMenu-stable';
// o
import { createStableMenuSDK } from './cms-menu/menu-sdk-stable';
```

### Uso Básico

```javascript
import React from 'react';
import { useStableMenuIntegration } from './cms-menu/useMenu-stable';
import { MENU_CONFIG } from './cms-menu/config';

function MyMenuPage() {
  const { 
    restaurant, 
    menu, 
    loading, 
    error, 
    retry, 
    forceReset 
  } = useStableMenuIntegration(MENU_CONFIG);

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={retry}>Reintentar</button>
        <button onClick={forceReset}>Reset Firebase</button>
      </div>
    );
  }

  // Resto del componente...
}
```

### Uso Avanzado con SDK Directo

```javascript
import { createStableMenuSDK, resetFirebaseConnection } from './cms-menu/menu-sdk-stable';

async function loadMenuManually() {
  try {
    const sdk = createStableMenuSDK(firebaseConfig, restaurantId);
    const restaurant = await sdk.getRestaurantInfo();
    const menu = await sdk.getFullMenu();
    
    return { restaurant, menu };
  } catch (error) {
    console.error('Error:', error);
    
    // Reset completo si es necesario
    await resetFirebaseConnection();
    throw error;
  }
}
```

## 🔄 Funciones de Recuperación

### `retry()`
Reintenta la carga normal de datos sin reset completo.

### `forceReset()`
Realiza un reset completo de Firebase:
1. Termina todas las conexiones
2. Elimina todas las apps de Firebase
3. Limpia IndexedDB
4. Espera 2 segundos
5. Reinicia la conexión

### `resetFirebaseConnection()`
Función utilitaria para reset manual desde cualquier lugar.

## 🎯 Cuándo Usar el SDK Estable

### ✅ Usar Cuando:
- Experimentas errores "INTERNAL ASSERTION FAILED"
- Las conexiones se cuelgan o timeout
- Tienes múltiples componentes usando Firebase
- Necesitas máxima estabilidad en producción

### ⚠️ Considerar SDK Original Cuando:
- Desarrollo/testing inicial
- No experimentas problemas de conectividad
- Necesitas features experimentales

## 🐛 Solución de Problemas

### Error: "Firebase no está inicializado"
```javascript
// Asegúrate de llamar initialize() si usas el SDK directamente
const sdk = createStableMenuSDK(config, restaurantId);
await sdk.initialize(); // ¡Importante!
```

### Error: "Timeout: La consulta tardó demasiado"
- Verifica tu conexión a internet
- Usa `forceReset()` para limpiar estado corrupto
- Revisa la configuración de Firebase

### Error: "Sin permisos para acceder"
- Verifica las reglas de Firestore
- Confirma que el UID del restaurante es correcto
- Revisa la configuración de autenticación

## 📊 Monitoreo de Estado

El SDK estable incluye logging detallado:

```
🔥 Firebase initialized successfully
🔍 Fetching restaurant info for: [UID]
✅ Restaurant info loaded successfully
🍽️ Fetching full menu for restaurant: [UID]
📂 Found X menu categories
📋 Category "Nombre": X items
✅ Full menu loaded successfully: X categories
```

## 🚀 Recomendaciones de Uso

1. **Usa el SDK Estable como primera opción** para resolver errores de Firestore
2. **Implementa los botones de retry y reset** en tu UI
3. **Monitorea los logs** para identificar patrones de error
4. **Considera timeout personalizado** si tu red es lenta
5. **Usa cleanup en unmount** para evitar memory leaks

## 📝 Ejemplo Completo

Ver `src/pages/StableMenuPage.jsx` para un ejemplo completo de implementación.

---

**💡 Tip:** Si aún experimentas problemas después de usar el SDK estable, considera verificar:
- Configuración de red/firewall
- Estado del proyecto Firebase
- Reglas de Firestore
- Límites de uso de Firebase
