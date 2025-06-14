import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { globalFirebaseManager } from '../cms-menu/firebase-manager';
import './PaymentPending.css';

const PaymentPending = () => {
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
      console.log('🔍 PaymentPending: Starting with params:', {
        orderId,
        paymentId,
        status,
        collectionStatus,
        allSearchParams: Object.fromEntries(searchParams.entries())
      });

      if (!orderId) {
        console.error('❌ PaymentPending: No orderId found');
        setError('No se encontró el ID del pedido');
        setLoading(false);
        return;
      }

      // Verificar si el estado indica que debe ir a otra página
      if (status === 'approved' || collectionStatus === 'approved') {
        console.warn('⚠️ PaymentPending: Payment approved, redirecting to success page');
        alert('¡Tu pago fue aprobado! Te redirigiremos a la página de confirmación.');
        window.location.href = `/restaurant_template/payment/success?order=${orderId}&payment_id=${paymentId}&status=${status}&collection_status=${collectionStatus}`;
        return;
      }

      if (status === 'rejected' || status === 'cancelled' || collectionStatus === 'rejected' || collectionStatus === 'cancelled') {
        console.warn('⚠️ PaymentPending: Payment failed, redirecting to failure page');
        window.location.href = `/restaurant_template/payment/failure?order=${orderId}&payment_id=${paymentId}&status=${status}&collection_status=${collectionStatus}`;
        return;
      }

      // VERIFICACIÓN ADICIONAL: Buscar en Firebase el estado real del pago
      try {
        await globalFirebaseManager.initialize();
        const db = globalFirebaseManager.getDatabase();
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          // Si en Firebase el pago está marcado como exitoso, redirigir
          if (orderData.paymentStatus === 'paid' || orderData.status === 'confirmed') {
            console.warn('🔄 Payment was actually successful according to Firebase, redirecting...');
            alert('¡Tu pago fue procesado exitosamente! Te redirigiremos a la página correcta.');
            window.location.href = `/restaurant_template/payment/success?order=${orderId}&payment_id=${paymentId}`;
            return;
          }
          // Si está marcado como fallido, redirigir a failure
          if (orderData.paymentStatus === 'failed' || orderData.status === 'payment_failed') {
            console.warn('🔄 Payment failed according to Firebase, redirecting...');
            window.location.href = `/restaurant_template/payment/failure?order=${orderId}&payment_id=${paymentId}`;
            return;
          }
        }
      } catch (dbError) {
        console.warn('⚠️ Could not verify payment status from Firebase:', dbError);
      }

      try {
        console.log('⏳ Processing pending payment for order:', orderId);
        console.log('📄 Payment details:', { paymentId, status, collectionStatus });

        await globalFirebaseManager.initialize();
        const db = globalFirebaseManager.getDatabase();
        const orderRef = doc(db, 'orders', orderId);
        const orderDoc = await getDoc(orderRef);
        
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() };
          console.log('📋 Order data found:', orderData);
          setOrder(orderData);

          // Actualizar el estado si hay información nueva de MercadoPago
          if (paymentId && orderData.paymentId !== paymentId) {
            console.log('⏳ Updating order with pending payment info');
            await updateDoc(orderRef, {
              paymentStatus: 'pending',
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
              paymentStatus: 'pending',
              paymentId: paymentId
            }));
          } else {
            console.log('⏳ No update needed for pending payment');
          }
        } else {
          console.error('❌ PaymentPending: Order not found in Firestore:', orderId);
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
    <div className="payment-result payment-pending">
      <div className="pending-content">
        <div className="pending-icon">⏳</div>
        <h1>Pago Pendiente</h1>
        <p>Tu pago está siendo procesado</p>
        
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
                <span style={{ color: '#ffc107', fontWeight: 'bold' }}>⏳ Pendiente</span>
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
          <h3>¿Qué hacer ahora?</h3>
          <p>• Tu pago está siendo verificado</p>
          <p>• Recibirás una notificación cuando se confirme</p>
          <p>• Puedes contactarnos si tienes dudas</p>
        </div>
        
        <div className="action-buttons">
          <Link to="/" className="btn btn-primary">Volver al menú</Link>
          <Link to={`/estado-pedido?orderId=${orderId}`} className="btn btn-secondary">
            Ver estado del pedido
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
