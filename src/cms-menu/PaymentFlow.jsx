import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { MENU_CONFIG } from './config.js';

export function CheckoutFlow({ cart, cartTotal, restaurant, onOrderComplete }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    notes: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      if (paymentMethod === 'mercadopago') {
        // Flujo MercadoPago con Cloud Functions
        const functions = getFunctions();
        const createPayment = httpsCallable(functions, 'createPaymentPreference');
        
        const result = await createPayment({
          orderId,
          items: cart,
          total: cartTotal,
          businessId: MENU_CONFIG.businessId,
          customerInfo
        });

        if (result.data.success) {
          // Redirigir a MercadoPago
          window.location.href = result.data.checkoutUrl;
        } else {
          throw new Error('Error al crear la preferencia de pago');
        }
      } else if (paymentMethod === 'efectivo') {
        // Flujo Efectivo - guardar directamente
        const db = getFirestore();
        await setDoc(doc(db, 'orders', orderId), {
          businessId: MENU_CONFIG.businessId,
          items: cart,
          customer: customerInfo,
          total: cartTotal,
          currency: 'ARS',
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'cash',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          notes: customerInfo.notes || ''
        });

        // Redirigir a confirmación
        window.location.href = `/confirmacion-pedido/${orderId}`;
      }
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      alert('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-flow">
      <h2>Finalizar Pedido</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Información del cliente */}
        <div className="customer-info">
          <h3>Información de contacto</h3>
          <input
            type="text"
            placeholder="Tu nombre"
            value={customerInfo.name}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={customerInfo.phone}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            value={customerInfo.email}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
          />
          <input
            type="text"
            placeholder="Dirección (opcional)"
            value={customerInfo.address}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
          />
          <textarea
            placeholder="Comentarios adicionales (opcional)"
            value={customerInfo.notes}
            onChange={(e) => setCustomerInfo(prev => ({ ...prev, notes: e.target.value }))}
            rows="3"
          />
        </div>

        {/* Método de pago */}
        <div className="payment-methods">
          <h3>Método de pago</h3>
          
          <label>
            <input
              type="radio"
              value="mercadopago"
              checked={paymentMethod === 'mercadopago'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            💳 Pagar con MercadoPago
          </label>
          
          <label>
            <input
              type="radio"
              value="efectivo"
              checked={paymentMethod === 'efectivo'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            💵 Pagar en efectivo
          </label>
        </div>

        {/* Resumen del pedido */}
        <div className="order-summary">
          <h3>Resumen del pedido</h3>
          {cart.map(item => (
            <div key={item.id} className="order-item">
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="order-total">
            <strong>Total: ${cartTotal.toFixed(2)}</strong>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={!paymentMethod || loading}
          className="checkout-button"
        >
          {loading ? 'Procesando...' : 'Confirmar Pedido'}
        </button>
      </form>
    </div>
  );
}

export default CheckoutFlow;
