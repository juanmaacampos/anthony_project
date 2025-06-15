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
      const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
      const restaurantData = await menuSDK.getRestaurantInfo();
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWhatsAppMessage = () => {
    if (!order || !restaurant) return '';

    const paymentText = order.paymentMethod === 'mercadopago' 
      ? '💳 *Pagado con MercadoPago*' 
      : '💵 *A pagar en efectivo*';

    const itemsList = order.items.map(item => 
      `• ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    // Manejar diferentes formatos de fecha
    let dateText = 'Ahora';
    if (order.createdAt) {
      try {
        if (order.createdAt.toDate) {
          // Timestamp de Firestore
          dateText = order.createdAt.toDate().toLocaleString();
        } else if (order.createdAt.seconds) {
          // Timestamp de Firestore serializado
          dateText = new Date(order.createdAt.seconds * 1000).toLocaleString();
        } else if (order.createdAt instanceof Date) {
          // Objeto Date normal
          dateText = order.createdAt.toLocaleString();
        }
      } catch (error) {
        console.error('Error formatting date:', error);
        dateText = 'Ahora';
      }
    }

    return encodeURIComponent(`
🍽️ *Nuevo Pedido - ${restaurant.name}*

👤 *Cliente:* ${order.customerInfo?.name || 'No especificado'}
📱 *Teléfono:* ${order.customerInfo?.phone || 'No especificado'}
🆔 *Pedido:* ${order.orderId}

📋 *Detalle del pedido:*
${itemsList}

💰 *Total: $${order.total.toFixed(2)}*
${paymentText}

⏰ *Fecha:* ${dateText}
    `);
  };

  const sendWhatsAppMessage = () => {
    if (!restaurant?.contactInfo?.whatsapp) {
      alert('No hay WhatsApp configurado para este restaurante');
      return;
    }

    const message = generateWhatsAppMessage();
    const whatsappNumber = restaurant.contactInfo.whatsapp.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
    
    window.open(whatsappUrl, '_blank');
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
        <p><strong>Número de pedido:</strong> {order.orderId}</p>
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

      <div className="whatsapp-section">
        <h3>📱 Enviar resumen por WhatsApp</h3>
        <p>Envía un resumen de tu pedido al restaurante por WhatsApp</p>
        <button 
          onClick={sendWhatsAppMessage}
          className="whatsapp-button"
          disabled={!restaurant?.contactInfo?.whatsapp}
        >
          🟢 Enviar por WhatsApp
        </button>
      </div>
    </div>
  );
}
