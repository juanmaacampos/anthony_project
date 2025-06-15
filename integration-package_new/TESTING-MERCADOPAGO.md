# 🧪 **Guía Completa de Testing para MercadoPago**

Esta guía te ayudará a probar la integración de MercadoPago con tu SDK de menús antes de usar dinero real.

## 🚀 **Configuración Rápida**

### **1. Configurar Credenciales de Testing**

```bash
# 1. Obtener credenciales de testing desde MercadoPago
# Ve a: https://www.mercadopago.com.ar/developers/panel/credentials

# 2. Configurar en Firebase Functions
firebase functions:config:set mercadopago.access_token="TEST-TU-ACCESS-TOKEN-AQUI"

# 3. Verificar configuración
firebase functions:config:get
```

### **2. Desplegar Cloud Functions**

```bash
cd cloud-functions
npm install
firebase deploy --only functions
```

### **3. Configurar el SDK**

```javascript
// En tu config.js, asegúrate de tener la configuración correcta
export const MENU_CONFIG = {
  firebaseConfig: { /* tu config */ },
  restaurantId: "tu-restaurant-id"
};
```

## 🧪 **Métodos de Testing**

### **Método 1: Testing Suite HTML (Recomendado)**

Abre el archivo `mercadopago-testing.html` en tu navegador:

```bash
# Desde el directorio integration-package
cd integration-package
python -m http.server 8000
# Luego abre: http://localhost:8000/mercadopago-testing.html
```

**Características:**
- ✅ Tests automatizados completos
- ✅ Verificación de configuración
- ✅ Simulación de carrito
- ✅ Tarjetas de prueba incluidas
- ✅ Logs detallados

### **Método 2: Componente React**

```jsx
import { MercadoPagoTester } from './MercadoPagoTester.jsx';
import './MercadoPagoTester.css';

function App() {
  return (
    <div>
      <MercadoPagoTester />
    </div>
  );
}
```

### **Método 3: Test Rápido**

```jsx
import { QuickMercadoPagoTest } from './MercadoPagoTester.jsx';

function MiComponente() {
  return (
    <div>
      <QuickMercadoPagoTest />
      {/* Tu componente normal */}
    </div>
  );
}
```

## 💳 **Tarjetas de Prueba**

### **✅ Pagos Aprobados**
```
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Titular: APRO
```

### **❌ Pagos Rechazados**
```
Número: 4000 0000 0000 0002
CVV: 123
Vencimiento: 11/25
Titular: OTHE
```

### **⏳ Pagos Pendientes**
```
Número: 4509 9535 6623 3704
CVV: 123
Vencimiento: 11/25
Titular: CONT
```

## 🔄 **Flujo de Testing Completo**

### **1. Verificar Configuración**
```javascript
// Ejecutar en consola del navegador
import { isTestingMode, logTestingInfo } from './mercadopago-test-config.js';

logTestingInfo(); // Muestra info de testing
console.log('Testing mode:', isTestingMode());
```

### **2. Probar Creación de Pedidos**
```javascript
// Ejemplo de payload para testing
const testOrder = {
  orderId: `test_${Date.now()}`,
  items: [
    {
      id: 'pizza-1',
      name: 'Pizza Margherita',
      price: 1500,
      quantity: 1
    }
  ],
  total: 1500,
  restaurantId: 'tu-restaurant-id',
  customerInfo: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+5491234567890'
  }
};
```

### **3. Verificar Cloud Functions**
```bash
# Ver logs en tiempo real
firebase functions:log --only createPaymentPreference

# Test directo de la función
curl -X POST "https://us-central1-TU-PROJECT.cloudfunctions.net/createPaymentPreference" \
  -H "Content-Type: application/json" \
  -d '{"data": {"orderId": "test123", "items": [...], "total": 1500}}'
```

## 🐛 **Debugging y Troubleshooting**

### **Errores Comunes:**

#### **"Functions not deployed"**
```bash
# Solución
firebase deploy --only functions
firebase functions:log
```

#### **"Invalid credentials"**
```bash
# Verificar configuración
firebase functions:config:get

# Resetear si es necesario
firebase functions:config:unset mercadopago
firebase functions:config:set mercadopago.access_token="TEST-TU-TOKEN"
```

#### **"CORS errors"**
```bash
# Ejecutar script de CORS
./setup-cors.sh

# O manualmente
gsutil cors set cors.json gs://tu-bucket.appspot.com
```

### **Logs Útiles:**

```javascript
// En el navegador
console.log('Config:', MENU_CONFIG);
console.log('MP Config:', MERCADOPAGO_TEST_CONFIG);

// En Firebase Functions
console.log('Payment request:', data);
console.log('MP Response:', response);
```

## 📊 **Verificar que Todo Funciona**

### **Checklist de Testing:**

- [ ] ✅ Credenciales de testing configuradas
- [ ] ✅ Cloud Functions desplegadas
- [ ] ✅ SDK conecta a Firebase
- [ ] ✅ Carrito funciona correctamente
- [ ] ✅ Preferencia de pago se crea
- [ ] ✅ Redirección a MercadoPago
- [ ] ✅ Webhook recibe notificaciones
- [ ] ✅ Estado del pedido se actualiza

### **Test de Extremo a Extremo:**

1. **Agregar productos al carrito** ✅
2. **Proceder al checkout** ✅
3. **Llenar información del cliente** ✅
4. **Seleccionar MercadoPago** ✅
5. **Redirección automática** ✅
6. **Usar tarjeta de prueba** ✅
7. **Verificar confirmación** ✅
8. **Revisar en Firebase** ✅

## 🚀 **Pasar a Producción**

### **Cuando todo funcione en testing:**

1. **Obtener credenciales reales:**
   ```bash
   firebase functions:config:set mercadopago.access_token="APP-TU-ACCESS-TOKEN-REAL"
   ```

2. **Actualizar URLs de retorno:**
   ```javascript
   // En la Cloud Function
   back_urls: {
     success: `https://tu-dominio-real.com/confirmacion-pedido/${orderId}`,
     failure: `https://tu-dominio-real.com/pago-fallido/${orderId}`,
     pending: `https://tu-dominio-real.com/pago-pendiente/${orderId}`
   }
   ```

3. **Desplegar:**
   ```bash
   firebase deploy --only functions
   ```

4. **Probar con dinero real (cantidades pequeñas)**

## 📞 **Soporte**

### **Si algo no funciona:**

1. **Revisar logs:** `firebase functions:log`
2. **Verificar configuración:** `firebase functions:config:get`
3. **Probar con Testing Suite:** `mercadopago-testing.html`
4. **Revisar documentación:** [MercadoPago Developers](https://www.mercadopago.com.ar/developers)

### **Archivos importantes:**
- `mercadopago-test-config.js` - Configuración de testing
- `MercadoPagoTester.jsx` - Componente de testing
- `mercadopago-testing.html` - Suite de testing completa
- `PaymentFlow.jsx` - Flujo de checkout
- `cloud-functions/src/functions/index.js` - Cloud Functions

---

**¡Con esta configuración puedes probar MercadoPago de forma segura sin usar dinero real! 🎉**
