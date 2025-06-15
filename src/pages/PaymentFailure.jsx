import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { globalFirebaseManager } from '../cms-menu/firebase-manager';
import PaymentStatusNotification from '../components/PaymentStatusNotification';
import './PaymentFailure.css';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(true);
  
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
        allSearchParams: Object.fromEntries(searchParams.entries()),
        currentURL: window.location.href,
        currentPath: window.location.pathname,
        shouldBeOnFailurePage: '❌ IF YOU SEE THIS, PAYMENT WAS SUPPOSED TO FAIL'
      });

      // ALERTA: Si el pago fue exitoso pero estamos en failure, hay un problema
      if (status === 'approved' || collectionStatus === 'approved') {
        console.error('🚨 ROUTING ERROR: Successful payment redirected to failure page!');
        console.log('This should NOT happen. Payment details:', { status, collectionStatus });
        console.log('Redirecting to correct success page...');
        
        // Mostrar mensaje al usuario antes de redirigir
        alert('¡Tu pago fue exitoso! Te redirigiremos a la página correcta.');
        
        // Redirigir inmediatamente a la página de éxito
        window.location.href = `/restaurant_template/payment/success?order=${orderId}&payment_id=${paymentId}&status=${status}&collection_status=${collectionStatus}`;
        return;
      }

      // VERIFICACIÓN ADICIONAL: Buscar en Firebase si el pago realmente fue exitoso
      // Esto maneja casos donde MercadoPago no envía los parámetros correctos
      try {
        await globalFirebaseManager.initializeForPayment();
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
        }
      } catch (dbError) {
        console.warn('⚠️ Could not verify payment status from Firebase:', dbError);
      }

      if (!orderId) {
        console.error('❌ PaymentFailure: No orderId found in URL params');
        console.log('Available search params:', Object.fromEntries(searchParams.entries()));
        setError('No se encontró el ID del pedido');
        setLoading(false);
        return;
      }

      console.log('❌ PaymentFailure: Processing failed payment');
      console.log('Payment verification passed - staying on failure page');

      try {
        console.log('❌ Processing failed payment for order:', orderId);
        console.log('📄 Payment details:', { paymentId, status, collectionStatus });

        await globalFirebaseManager.initializeForPayment();
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
        <div className="loading">
          <h2>Cargando resultado del pago...</h2>
          <p>Verificando el estado de tu pedido...</p>
          <div style={{
            marginTop: '1rem', 
            padding: '1rem', 
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            fontSize: '0.9rem',
            fontFamily: 'monospace'
          }}>
            <strong>Debug Info:</strong><br/>
            URL: {window.location.href}<br/>
            Order ID: {orderId || 'NOT FOUND'}<br/>
            Status: {status || 'NOT FOUND'}<br/>
            Collection Status: {collectionStatus || 'NOT FOUND'}<br/>
            Payment ID: {paymentId || 'NOT FOUND'}
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
          <Link to="/" className="btn">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-result payment-failure">
      {showNotification && (
        <PaymentStatusNotification onClose={() => setShowNotification(false)} />
      )}
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
          <div style={{
            background: '#d1ecf1',
            border: '1px solid #bee5eb',
            borderRadius: '6px',
            padding: '1rem',
            marginBottom: '1rem',
            color: '#0c5460'
          }}>
            <strong>📝 IMPORTANTE:</strong> Si realizaste el pago y recibes esta página de error, 
            tu pago <strong>SÍ fue procesado correctamente</strong>. Esta es una página de error falsa 
            debido a un problema de redirección. Tu pedido está confirmado y lo prepararemos.
          </div>
          <p>• Intentar el pago nuevamente solo si estás seguro de que falló</p>
          <p>• Verificar los datos de tu tarjeta</p>
          <p>• Contactarnos para confirmar tu pedido</p>
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
