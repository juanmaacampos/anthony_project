# 🚨 Guía de Solución de Problemas - CMS Menu

## Problema: "Failed to get document because the client is offline"

### ❌ Descripción del Error
Este error aparece cuando Firebase no puede conectarse a los servidores de Firestore. Es el problema más común.

### 🔍 Causas Posibles

1. **Conexión a Internet**
   - Sin conexión a internet
   - Conexión inestable
   - Firewall corporativo bloqueando Firebase

2. **Configuración de Firebase**
   - Proyecto Firebase no existe
   - Credenciales incorrectas
   - Firestore no habilitado

3. **Reglas de Seguridad**
   - Reglas muy restrictivas
   - No hay permisos de lectura

4. **Estructura de Datos**
   - Restaurante no existe en Firestore
   - UID incorrecto
   - Colecciones mal nombradas

### ✅ Soluciones Paso a Paso

#### 1. Verificar Conexión a Internet
```bash
# Probar conectividad básica
ping google.com

# Probar acceso a Firebase
curl -I https://firestore.googleapis.com
```

#### 2. Verificar Configuración de Firebase
```javascript
// En src/cms-menu/config.js, confirmar:
export const MENU_CONFIG = {
  firebaseConfig: {
    apiKey: "AIzaSyDHi_a1trI35goPoKcNPUDBMOSLKjvZKyc", // ✅ Correcto
    authDomain: "cms-menu-7b4a4.firebaseapp.com",        // ✅ Correcto
    projectId: "cms-menu-7b4a4",                         // ✅ Correcto
    storageBucket: "cms-menu-7b4a4.firebasestorage.app", // ✅ Correcto
    messagingSenderId: "509736809578",                   // ✅ Correcto
    appId: "1:509736809578:web:15471af092f3b46392c613"   // ✅ Correcto
  },
  restaurantId: "HsuTZWhRVkT88a0WOztELGzJUhl1"           // ⚠️ Verificar
};
```

#### 3. Verificar que el Proyecto Firebase Existe
1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Busca el proyecto: `cms-menu-7b4a4`
3. Verifica que Firestore esté habilitado

#### 4. Verificar Reglas de Firestore
Las reglas deben permitir lectura pública:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura pública de restaurantes
    match /restaurants/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

#### 5. Verificar Estructura de Datos
La estructura debe ser:
```
/restaurants/{restaurantId}
  - name: "Nombre del Restaurante"
  - description: "Descripción"
  /menu/{categoryId}
    - name: "Categoría"
    - order: 1
    /items/{itemId}
      - name: "Plato"
      - price: 10.50
      - description: "Descripción"
      - isAvailable: true
```

#### 6. Verificar UID del Restaurante
```javascript
// En la consola del CMS admin:
firebase.auth().currentUser.uid
// Debe devolver: HsuTZWhRVkT88a0WOztELGzJUhl1
```

### 🛠️ Herramientas de Diagnóstico

#### Usar el Diagnóstico Integrado
1. Presiona `Ctrl + M` en tu app
2. Selecciona "🔧 Diagnóstico Completo"
3. Revisa los resultados detallados

#### Verificar en la Consola del Navegador
```javascript
// Abrir DevTools (F12) y verificar errores:
// ✅ Mensajes de éxito:
// "🌐 Firebase network enabled"
// "✅ Restaurant info loaded successfully"

// ❌ Mensajes de error:
// "FIRESTORE (11.0.0) INTERNAL ASSERTION FAILED"
// "Could not reach Cloud Firestore backend"
```

### 🔧 Comandos de Solución Rápida

#### Reiniciar Firebase
```bash
# Limpiar caché y reiniciar
rm -rf node_modules/.cache
npm run dev
```

#### Forzar Reconexión
```javascript
// En la consola del navegador:
location.reload();
```

### 📞 Escalación

Si ninguna solución funciona:

1. **Verifica el Estado de Firebase**: [Firebase Status](https://status.firebase.google.com)
2. **Revisa la Documentación**: [Firestore Troubleshooting](https://firebase.google.com/docs/firestore/troubleshooting)
3. **Contacta Soporte**: Si tienes un plan pago de Firebase

### 🎯 Solución Temporal

Mientras solucionas el problema, usa el menú demo:
```jsx
// Cambiar a modo demo en Menu.jsx
const [useCMS, setUseCMS] = useState(false); // ← false = menú estático
```

### ✅ Verificación Final

Una vez solucionado, confirma que:
- [ ] El diagnóstico muestra todo en verde
- [ ] El menú CMS carga correctamente
- [ ] Los datos del restaurante aparecen
- [ ] Las categorías y platos se muestran
- [ ] No hay errores en la consola

---

💡 **Consejo**: Mantén siempre un menú estático como respaldo para casos de emergencia.
