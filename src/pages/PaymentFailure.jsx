import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { globalFirebaseManager } from '../cms-menu/firebase-manager';
import './PaymentFailure.css';

const PaymentFailure = () => {
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
      console.log('🔍 PaymentFailure: Starting with params:', {
        orderId,
        paymentId,
        status,
        collectionStatus,
        allSearchParams: Object.fromEntries(searchParams.entries())
      });

      if (!orderId) {
        console.error('❌ PaymentFailure: No orderId found');
        setError('No se encontró el ID del pedido');
        setLoading(false);
        return;
      }

      // Verificar que realmente el pago falló según MercadoPago
      const isPaymentFailed = (
        status === 'rejected' || 
        status === 'cancelled' ||
        collectionStatus === 'rejected' ||
        collectionStatus === 'cancelled'
      );

      if (!isPaymentFailed) {
        console.warn('⚠️ PaymentFailure: Payment not actually failed, redirecting to appropriate page');
        console.log('Status details:', { status, collectionStatus });
        
        // Redirigir a la página correcta según el estado
        if (status === 'approved' || collectionStatus === 'approved') {
          window.location.href = `/restaurant_template/payment/success?order=${orderId}&payment_id=${paymentId}&status=${status}&collection_status=${collectionStatus}`;
        } else {
          window.location.href = `/restaurant_template/payment/pending?order=${orderId}&payment_id=${paymentId}&status=${status}&collection_status=${collectionStatus}`;
        }
        return;
      }

      try {
        console.log('❌ Processing failed payment for order:', orderId);
        console.log('📄 Payment details:', { paymentId, status, collectionStatus });

        await globalFirebaseManager.initialize();
        const db = globalFirebaseManager.getDatabase();
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() };
          console.log('📋 Order data found:', orderData);
          setOrder(orderData);

          // Actualizar el estado del pedido a fallido
          if (orderData.paymentStatus !== 'failed') {
            console.log('❌ Updating order payment status to failed');
            await updateDoc(orderRef, {
              paymentStatus: 'failed',
              status: 'payment_failed',
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
              paymentStatus: 'failed',
              status: 'payment_failed',
              paymentId: paymentId
            }));
          } else {
            console.log('⚠️ Order already marked as failed');
          }
        } else {
          console.error('❌ PaymentFailure: Order not found in Firestore:', orderId);
          setError('Pedido no encontrado');
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
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-result">
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <Link to="/" className="btn">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result payment-failure">
      <div className="failure-content">
        <div className="failure-icon">❌</div>
        <h1>Pago No Completado</h1>
        <p>Hubo un problema al procesar tu pago</p>
        
        {order && (
          <div className="order-details">
            <h3>Detalles del Pedido</h3>
            <div className="order-info">
              <div className="order-info-item">
                <span>Número de pedido:</span>
                <span>{order.id}</span>
              </div>
              <div className="order-info-item">
                <span>Total:</span>
                <span>${order.total?.toFixed(2)} ARS</span>
              </div>
              <div className="order-info-item">
                <span>Estado del pago:</span>
                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>❌ Falló</span>
              </div>
              {paymentId && (
                <div className="order-info-item">
                  <span>ID de pago:</span>
                  <span>{paymentId}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="next-steps">
          <h3>¿Qué puedes hacer?</h3>
          <p>• Intentar el pago nuevamente</p>
          <p>• Verificar los datos de tu tarjeta</p>
          <p>• Contactarnos para ayuda</p>
          <p>• Pagar en efectivo al retirar</p>
        </div>
        
        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">Volver al menú</Link>
          <Link to="/" className="btn btn-warning">Intentar nuevamente</Link>
          <Link to={`/estado-pedido?orderId=${orderId}`} className="btn btn-secondary">
            Ver estado del pedido
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
