# CheckoutForm Component

## 📋 Descripción

El componente `CheckoutForm` es un formulario de checkout completo para restaurantes que integra Firebase Cloud Functions y MercadoPago para procesar pagos.

## 🚀 Características

- ✅ **Métodos de Pago**: Efectivo y MercadoPago
- ✅ **Validación de Formulario**: Validación completa de datos del cliente
- ✅ **Integración Firebase**: Guardado de pedidos en Firestore
- ✅ **Cloud Functions**: Integración con MercadoPago via Cloud Functions
- ✅ **LocalStorage**: Carga automática del carrito desde localStorage
- ✅ **Responsive**: Diseño adaptable para móviles
- ✅ **Estado de Carga**: Indicadores visuales durante el procesamiento

## 📦 Dependencias

```json
{
  "firebase": "^10.8.0",
  "uuid": "^11.1.0",
  "react": "^19.1.0"
}
```

## 🔧 Configuración

### 1. Configurar Firebase

Asegúrate de tener configurado Firebase en `src/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'southamerica-east1');
```

### 2. Configurar Restaurant ID

**⚠️ IMPORTANTE**: Cambia el `CURRENT_RESTAURANT_ID` en el componente:

```javascript
// ⚠️ Cambiar este ID por cada restaurante
const CURRENT_RESTAURANT_ID = "TU_RESTAURANT_UID_AQUI";
```

Para obtener el ID:
1. Login al CMS del restaurante
2. Abre las herramientas de desarrollador (F12)
3. En la consola ejecuta: `firebase.auth().currentUser.uid`
4. Copia ese UID al componente

### 3. Estructura del Carrito en LocalStorage

El componente espera que el carrito esté guardado en localStorage con esta estructura:

```javascript
// localStorage.getItem('cartItems')
[
  {
    "name": "Pizza Margherita",
    "price": 1500,
    "quantity": 2
  },
  {
    "name": "Coca Cola", 
    "price": 500,
    "quantity": 1
  }
]

// localStorage.getItem('cartTotal')
"3500"
```

## 📝 Uso Básico

```jsx
import React from 'react';
import CheckoutForm from './components/CheckoutForm.jsx';

function CheckoutPage() {
  return (
    <div className="checkout-page">
      <CheckoutForm />
    </div>
  );
}

export default CheckoutPage;
```

## 🔄 Flujo de Checkout

### Pago en Efectivo:
1. Usuario completa formulario
2. Se validan los datos
3. Se guarda el pedido en Firestore
4. Se redirige a `/estado-pedido?orderId={orderId}`

### Pago con MercadoPago:
1. Usuario completa formulario
2. Se validan los datos
3. Se llama a la Cloud Function `createMercadoPagoPreference`
4. Se obtiene el `init_point` de MercadoPago
5. Se redirige al usuario a MercadoPago
6. Tras el pago, MercadoPago redirige a `/estado-pedido?orderId={orderId}`

## 🏗️ Estructura de Datos del Pedido

```javascript
{
  restaurantId: "HsuTZWhRVkT88a0WOztELGzJUhl1",
  items: [
    {
      name: "Pizza Margherita",
      unit_price: 1500,
      quantity: 2
    }
  ],
  customer: {
    name: "Juan Pérez",
    phone: "+54 9 11 1234-5678",
    email: "juan@email.com",
    address: "Av. Corrientes 1234"
  },
  total: 3500,
  paymentMethod: "mercadopago", // o "cash"
  status: "pending",
  paymentStatus: "pending",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  notes: "Sin cebolla"
}
```

## 🎨 Personalización CSS

El componente incluye estilos CSS inline que puedes personalizar:

```jsx
<style jsx>{`
  .checkout-form-container {
    max-width: 600px;
    margin: 0 auto;
    /* Personaliza aquí */
  }
  
  .submit-button {
    background-color: #28a745; /* Cambia el color */
    /* Más personalizaciones */
  }
`}</style>
```

## 🔗 Integración con Cloud Functions

El componente llama a la Cloud Function `createMercadoPagoPreference` con estos datos:

```javascript
const paymentData = {
  restaurantId: "HsuTZWhRVkT88a0WOztELGzJUhl1",
  items: [...],
  customer: {...},
  totalAmount: 3500,
  orderId: "uuid-generado",
  backUrls: {
    success: "https://tu-sitio.com/estado-pedido?orderId=uuid",
    pending: "https://tu-sitio.com/estado-pedido?orderId=uuid", 
    failure: "https://tu-sitio.com/estado-pedido?orderId=uuid"
  },
  notes: "Notas adicionales"
};
```

## 📱 Responsive Design

El componente es completamente responsive e incluye:
- Diseño adaptable para móviles
- Formularios optimizados para touch
- Botones con tamaños adecuados para dedos
- Texto legible en dispositivos pequeños

## 🚨 Manejo de Errores

El componente maneja varios tipos de errores:
- **Carrito vacío**: Muestra mensaje de error
- **Datos faltantes**: Validación de campos obligatorios
- **Error de Firebase**: Mensajes de error específicos
- **Error de MercadoPago**: Manejo de errores de la API
- **Error de red**: Mensajes informativos

## 🧪 Testing

Para testear el componente:

1. Agrega items al localStorage:
```javascript
const testItems = [
  { name: "Test Pizza", price: 1000, quantity: 1 }
];
localStorage.setItem('cartItems', JSON.stringify(testItems));
localStorage.setItem('cartTotal', '1000');
```

2. Renderiza el componente
3. Completa el formulario
4. Verifica que funcione con ambos métodos de pago

## 📚 Referencias

- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions)
- [MercadoPago API](https://www.mercadopago.com.ar/developers)
- [React Hooks](https://reactjs.org/docs/hooks-intro.html)
