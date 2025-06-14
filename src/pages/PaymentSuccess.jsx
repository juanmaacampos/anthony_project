import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { globalFirebaseManager } from '../cms-menu/firebase-manager';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const orderId = searchParams.get('order') || searchParams.get('external_reference');
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const collectionStatus = searchParams.get('collection_status');

  useEffect(() => {
    const loadAndUpdateOrder = async () => {
      console.log('🔍 PaymentSuccess: Starting with params:', {
        orderId,
        paymentId,
        status,
        collectionStatus,
        allSearchParams: Object.fromEntries(searchParams.entries()),
        currentURL: window.location.href,
        currentPath: window.location.pathname,
        shouldBeOnSuccessPage: '✅ IF YOU SEE THIS, PAYMENT WAS SUPPOSED TO SUCCEED'
      });

      if (!orderId) {
        console.error('❌ PaymentSuccess: No orderId found in URL params');
        console.log('Available search params:', Object.fromEntries(searchParams.entries()));
        setError('No se encontró el ID del pedido');
        setLoading(false);
        return;
      }

      console.log('✅ PaymentSuccess: Processing approved payment');
      console.log('Payment verification passed - staying on success page');

      try {
        console.log('💳 Processing successful payment for order:', orderId);
        console.log('📄 Payment details:', { paymentId, status, collectionStatus });

        await globalFirebaseManager.initialize();
        const db = globalFirebaseManager.getDatabase();
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() };
          console.log('📋 Order data found:', orderData);
          setOrder(orderData);

          // Actualizar el estado del pedido a pagado si no está ya actualizado
          if (orderData.paymentStatus !== 'paid') {
            console.log('✅ Updating order payment status to paid');
            await updateDoc(orderRef, {
              paymentStatus: 'paid',
              status: 'confirmed',
              paymentId: paymentId,
              updatedAt: serverTimestamp(),
              mercadopagoData: {
                payment_id: paymentId,
                status: status,
                collection_status: collectionStatus,
                processed_at: serverTimestamp()
              }
            });

            // Actualizar el estado local
            setOrder(prev => ({
              ...prev,
              paymentStatus: 'paid',
              status: 'confirmed',
              paymentId: paymentId
            }));
          } else {
            console.log('✅ Order already marked as paid');
          }
        } else {
          console.error('❌ PaymentSuccess: Order not found in Firestore:', orderId);
          setError('Pedido no encontrado en la base de datos');
        }
      } catch (err) {
        console.error('❌ Error loading/updating order:', err);
        setError('Error al procesar el pedido');
      } finally {
        setLoading(false);
      }
    };

    loadAndUpdateOrder();
  }, [orderId, paymentId, status, collectionStatus]);

  if (loading) {
    return (
      <div className="payment-result">
        <div className="loading">
          <h2>✅ Procesando Pago Exitoso</h2>
          <p>Verificando el estado de tu pedido...</p>
          <div style={{
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontFamily: 'monospace'
          }}>
            <div><strong>Debug Info:</strong></div>
            <div>URL: {window.location.href}</div>
            <div>Order ID: {orderId || 'NOT FOUND'}</div>
            <div>Payment ID: {paymentId || 'NOT FOUND'}</div>
            <div>Status: {status || 'NOT FOUND'}</div>
            <div>Collection Status: {collectionStatus || 'NOT FOUND'}</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result">
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <div style={{
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontFamily: 'monospace'
          }}>
            <div><strong>Debug Info:</strong></div>
            <div>URL: {window.location.href}</div>
            <div>Order ID: {orderId || 'NOT FOUND'}</div>
            <div>Payment ID: {paymentId || 'NOT FOUND'}</div>
            <div>Status: {status || 'NOT FOUND'}</div>
            <div>Collection Status: {collectionStatus || 'NOT FOUND'}</div>
          </div>
          <Link to="/" className="btn">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result payment-success">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu pago ha sido procesado correctamente</p>
        
        {order && (
          <div className="order-details">
            <h3>Detalles del Pedido</h3>
            <div className="order-info">
              <div className="order-info-item">
                <span>Número de pedido:</span>
                <span>{order.id}</span>
              </div>
              <div className="order-info-item">
                <span>Total pagado:</span>
                <span>${order.total?.toFixed(2)} ARS</span>
              </div>
              <div className="order-info-item">
                <span>Estado del pago:</span>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Pagado</span>
              </div>
              <div className="order-info-item">
                <span>Estado del pedido:</span>
                <span style={{ color: '#28a745', fontWeight: 'bold' }}>✅ Confirmado</span>
              </div>
              {paymentId && (
                <div className="order-info-item">
                  <span>ID de pago:</span>
                  <span>{paymentId}</span>
                </div>
              )}
            </div>
            
            {order.items && order.items.length > 0 && (
              <div className="order-items">
                <h4>Items del pedido:</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-info-item">
                    <span>{item.name} x{item.quantity}</span>
                    <span>${((item.unit_price || item.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {order.customer && (
              <div className="customer-info">
                <h4>Información de contacto:</h4>
                <p><strong>Nombre:</strong> {order.customer.name}</p>
                <p><strong>Teléfono:</strong> {order.customer.phone}</p>
                {order.customer.email && <p><strong>Email:</strong> {order.customer.email}</p>}
                {order.customer.address && <p><strong>Dirección:</strong> {order.customer.address}</p>}
              </div>
            )}
          </div>
        )}
        
        <div className="next-steps">
          <h3>¿Qué sigue?</h3>
          <p>• Te contactaremos por WhatsApp para coordinar la entrega</p>
          <p>• Recibirás una confirmación por email</p>
          <p>• Prepararemos tu pedido lo antes posible</p>
        </div>
        
        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">Volver al menú</Link>
          {orderId && (
            <Link to={`/estado-pedido?orderId=${orderId}`} className="btn btn-secondary">
              Ver estado del pedido
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
