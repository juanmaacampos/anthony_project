import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import globalFirebaseManager from '../cms-menu/firebase-manager';
import './OrderStatus.css';

const OrderStatus = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRealTimeActive, setIsRealTimeActive] = useState(false);
  
  const unsubscribeRef = useRef(null);
  const orderId = searchParams.get('orderId') || searchParams.get('order');

  useEffect(() => {
    if (!orderId) {
      setError('No se proporcionó ID de pedido');
      setLoading(false);
      setIsRealTimeActive(false);
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null); // Reset order state on orderId change
    setIsRealTimeActive(false);

    let initialized = false;

    const setupListener = async () => {
      try {
        console.log('🔄 Initializing Firebase for OrderStatus listener...');
        await globalFirebaseManager.initializeForPayment();
        initialized = true;
        const db = globalFirebaseManager.getDatabase();
        console.log('👂 Setting up Firestore listener for order:', orderId);
        
        const orderRef = doc(db, 'orders', orderId);
        
        // Clear previous listener if any
        if (unsubscribeRef.current) {
          console.log('🧹 Unsubscribing previous listener.');
          unsubscribeRef.current();
        }

        unsubscribeRef.current = onSnapshot(
          orderRef,
          (docSnapshot) => {
            if (docSnapshot.exists()) {
              const orderData = { id: docSnapshot.id, ...docSnapshot.data() };
              console.log('🔔 Real-time update for order:', orderData);
              setOrder(orderData);
              setError(null);
              setLastUpdated(new Date());
              setIsRealTimeActive(true);
            } else {
              console.error('❌ Order not found with listener:', orderId);
              setError('Pedido no encontrado');
              setOrder(null);
              setIsRealTimeActive(false);
            }
            setLoading(false);
          },
          (err) => {
            console.error('❌ Firestore listener error:', err);
            setError('Error al escuchar cambios del pedido: ' + err.message);
            setLoading(false);
            setIsRealTimeActive(false);
          }
        );
      } catch (err) {
        console.error('❌ Error setting up Firestore listener:', err);
        setError('Error al inicializar la escucha de pedidos: ' + err.message);
        setLoading(false);
        setIsRealTimeActive(false);
      }
    };

    setupListener();

    return () => {
      console.log('🧹 Cleaning up OrderStatus listener for order:', orderId);
      if (unsubscribeRef.current) {
        console.log('🔪 Unsubscribing listener.');
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (initialized) {
        console.log('🔌 Releasing Firebase manager from OrderStatus.');
        globalFirebaseManager.release();
      }
    };
  }, [orderId]); // Re-run effect if orderId changes

  const getStatusIcon = (status, paymentStatus) => {
    if (paymentStatus === 'paid' || status === 'confirmed') return '✅';
    if (paymentStatus === 'pending' || status === 'pending') return '⏳';
    if (paymentStatus === 'failed' || status === 'payment_failed') return '❌';
    return '📋';
  };

  const getStatusText = (status, paymentStatus) => {
    if (paymentStatus === 'paid' || status === 'confirmed') return 'Confirmado';
    if (paymentStatus === 'pending' || status === 'pending') return 'Pendiente';
    if (paymentStatus === 'failed' || status === 'payment_failed') return 'Falló';
    return 'En proceso';
  };

  const getStatusColor = (status, paymentStatus) => {
    if (paymentStatus === 'paid' || status === 'confirmed') return '#28a745';
    if (paymentStatus === 'pending' || status === 'pending') return '#ffc107';
    if (paymentStatus === 'failed' || status === 'payment_failed') return '#dc3545';
    return '#6c757d';
  };

  if (loading) {
    return (
      <div className="order-status-page">
        <div className="order-status-container">
          <div className="loading-state">
            <div className="loading-icon">🔄</div>
            <h2>Cargando estado del pedido...</h2>
            <p>Obteniendo información de tu pedido en tiempo real...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-status-page">
        <div className="order-status-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Error</h2>
            <p>{error}</p>
            <div className="error-actions">
              {/* Removed refresh button, error state might need different actions or just a link to home */}
              <Link to="/" className="btn btn-secondary">
                Volver al menú
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-status-page">
        <div className="order-status-container">
          <div className="not-found-state">
            <div className="not-found-icon">🔍</div>
            <h2>Pedido no encontrado</h2>
            <p>Verificando el pedido con ID: <code>{orderId}</code>. Si existe, aparecerá en breve.</p>
            <Link to="/" className="btn btn-primary">
              Volver al menú
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-status-page">
      <div className="order-status-container">
        <div className="order-header">
          <div className="status-icon">
            {getStatusIcon(order.status, order.paymentStatus)}
          </div>
          <h1>Estado del Pedido</h1>
          <div className="order-id">
            <span>Pedido #{order.id}</span>
            {isRealTimeActive && <span className="real-time-badge">En tiempo real</span>}
          </div>
        </div>

        <div className="status-card">
          <div className="status-info">
            <div 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(order.status, order.paymentStatus) }}
            >
              {getStatusText(order.status, order.paymentStatus)}
            </div>
            <div className="status-details">
              <p><strong>Estado del pedido:</strong> {order.status || 'No definido'}</p>
              <p><strong>Estado del pago:</strong> {order.paymentStatus || 'No definido'}</p>
              {order.paymentMethod && (
                <p><strong>Método de pago:</strong> {order.paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Efectivo'}</p>
              )}
            </div>
          </div>
          
          <div className="refresh-section">
            {/* Removed refresh button */}
            {lastUpdated && (
              <p className="last-updated">
                Última actualización: {lastUpdated.toLocaleTimeString('es-AR')}
              </p>
            )}
            {!isRealTimeActive && !loading && <p className="real-time-badge-error">Actualizaciones en tiempo real no activas</p>}
          </div>
        </div>

        {order.total && (
          <div className="order-summary">
            <h3>Resumen del Pedido</h3>
            <div className="summary-info">
              <div className="summary-item">
                <span>Total:</span>
                <span className="total-amount">${order.total.toFixed(2)} ARS</span>
              </div>
              {order.createdAt && (
                <div className="summary-item">
                  <span>Fecha:</span>
                  <span>{new Date(order.createdAt.seconds * 1000).toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {order.items && order.items.length > 0 && (
          <div className="order-items">
            <h3>Productos</h3>
            <div className="items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.name || item.title}</span>
                    <span className="item-quantity">x{item.quantity}</span>
                  </div>
                  <div className="item-price">
                    ${((item.unit_price || item.price) * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {order.customer && (
          <div className="customer-info">
            <h3>Información de Contacto</h3>
            <div className="contact-details">
              <p><strong>Nombre:</strong> {order.customer.name}</p>
              <p><strong>Teléfono:</strong> {order.customer.phone}</p>
              {order.customer.email && (
                <p><strong>Email:</strong> {order.customer.email}</p>
              )}
              {order.customer.address && (
                <p><strong>Dirección:</strong> {order.customer.address}</p>
              )}
            </div>
          </div>
        )}

        {order.notes && (
          <div className="order-notes">
            <h3>Notas Adicionales</h3>
            <p>{order.notes}</p>
          </div>
        )}

        <div className="next-steps">
          <h3>¿Qué sigue?</h3>
          {order.paymentStatus === 'paid' || order.status === 'confirmed' ? (
            <div className="success-steps">
              <p>✅ Tu pedido ha sido confirmado</p>
              <p>📞 Te contactaremos por WhatsApp para coordinar la entrega</p>
              <p>🍽️ Estamos preparando tu pedido</p>
            </div>
          ) : order.paymentStatus === 'pending' ? (
            <div className="pending-steps">
              <p>⏳ Tu pago está siendo procesado</p>
              <p>📧 Recibirás una confirmación cuando se apruebe</p>
              <p>💬 Puedes contactarnos si tienes dudas</p>
            </div>
          ) : (
            <div className="failed-steps">
              <p>❌ Hubo un problema con el pago</p>
              <p>💳 Puedes intentar nuevamente</p>
              <p>📞 O contactarnos para ayuda</p>
            </div>
          )}
        </div>

        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">
            Volver al menú
          </Link>
          {(order.paymentStatus === 'failed' || order.status === 'payment_failed') && (
            <Link to="/" className="btn btn-warning">
              Intentar de nuevo
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;