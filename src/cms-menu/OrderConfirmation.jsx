import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { createMenuSDK } from './menu-sdk.js';
import { MENU_CONFIG } from './config.js';

export function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [business, setBusiness] = useState(null);
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

      // Cargar datos del negocio
      const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
      const businessData = await menuSDK.getBusinessInfo();
      setBusiness(businessData);
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

  const businessType = business?.businessType || 'restaurant';
  const icon = businessType === 'store' ? '🏪' : '🍽️';
  const businessLabel = businessType === 'store' ? 'Tienda' : 'Restaurante';

  return (
    <div className="order-confirmation">
      <div className="success-header">
        <h1>✅ ¡Pedido Confirmado!</h1>
        <p>Tu pedido ha sido recibido correctamente</p>
      </div>

      <div className="order-details">
        <h2>Detalles del Pedido</h2>
        <p><strong>Número de pedido:</strong> {order.id}</p>
        <p><strong>{businessLabel}:</strong> {icon} {business?.name}</p>
        
        <div className="customer-info">
          <h3>Información del cliente:</h3>
          <p><strong>Nombre:</strong> {order.customer?.name}</p>
          {order.customer?.phone && <p><strong>Teléfono:</strong> {order.customer.phone}</p>}
          {order.customer?.email && <p><strong>Email:</strong> {order.customer.email}</p>}
          {order.customer?.address && <p><strong>Dirección:</strong> {order.customer.address}</p>}
        </div>
        
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
            <div>
              <p>💳 <strong>Pagado con MercadoPago</strong></p>
              <p>Estado del pago: {order.paymentStatus}</p>
            </div>
          ) : (
            <p>💵 <strong>A pagar en efectivo</strong></p>
          )}
        </div>

        {order.notes && (
          <div className="order-notes">
            <h3>Comentarios:</h3>
            <p>{order.notes}</p>
          </div>
        )}

        <div className="next-steps">
          <h3>Próximos pasos:</h3>
          {businessType === 'store' ? (
            <ul>
              <li>Prepararemos tu pedido</li>
              <li>Te contactaremos para coordinar la entrega</li>
              <li>Recibirás una notificación cuando esté listo</li>
            </ul>
          ) : (
            <ul>
              <li>Estamos preparando tu pedido</li>
              <li>Te contactaremos cuando esté listo</li>
              <li>Tiempo estimado: 30-45 minutos</li>
            </ul>
          )}
        </div>
      </div>

      <div className="actions">
        <button onClick={() => window.location.href = '/'} className="btn-primary">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default OrderConfirmation;
