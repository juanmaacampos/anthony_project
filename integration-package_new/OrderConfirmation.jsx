import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { createMenuSDK } from './menu-sdk.js';
import { MENU_CONFIG } from './config.js';

export function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      const db = getFirestore();
      
      // Cargar pedido
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (orderDoc.exists()) {
        setOrder({ id: orderDoc.id, ...orderDoc.data() });
      }

      // Cargar datos del restaurante
      const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
      const restaurantData = await menuSDK.getRestaurantInfo();
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error al cargar pedido:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Cargando confirmación...</div>;
  }

  if (!order) {
    return <div className="error">Pedido no encontrado</div>;
  }

  return (
    <div className="order-confirmation">
      <div className="success-header">
        <h1>✅ ¡Pedido Confirmado!</h1>
        <p>Tu pedido ha sido recibido correctamente</p>
      </div>

      <div className="order-details">
        <h2>Detalles del Pedido</h2>
        <p><strong>Número de pedido:</strong> {order.id}</p>
        <p><strong>Restaurante:</strong> {restaurant?.name}</p>
        
        <div className="order-items">
          <h3>Items ordenados:</h3>
          {order.items.map((item, index) => (
            <div key={index} className="order-item">
              <span>{item.name} x{item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="order-total">
          <strong>Total: ${order.total.toFixed(2)}</strong>
        </div>

        <div className="payment-info">
          {order.paymentMethod === 'mercadopago' ? (
            <p>💳 <strong>Pagado con MercadoPago</strong></p>
          ) : (
            <p>💵 <strong>A pagar en efectivo</strong></p>
          )}
        </div>
      </div>
    </div>
  );
}
