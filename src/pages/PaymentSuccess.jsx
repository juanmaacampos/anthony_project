import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { globalFirebaseManager } from '../cms-menu/firebase-manager';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const orderId = searchParams.get('order');

  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId) {
        setError('No se encontró el ID del pedido');
        setLoading(false);
        return;
      }

      try {
        await globalFirebaseManager.initialize();
        const db = globalFirebaseManager.getDatabase();
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        } else {
          setError('Pedido no encontrado');
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Error al cargar el pedido');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

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
    <div className="payment-result payment-success">
      <div className="success-content">
        <div className="success-icon">✅</div>
        <h1>¡Pago Exitoso!</h1>
        <p>Tu pago ha sido procesado correctamente</p>
        
        {order && (
          <div className="order-details">
            <h3>Detalles del Pedido</h3>
            <p><strong>Número de pedido:</strong> {order.id}</p>
            <p><strong>Total pagado:</strong> ${order.total?.toFixed(2)} ARS</p>
            <p><strong>Estado:</strong> {order.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}</p>
            
            <div className="order-items">
              <h4>Items:</h4>
              {order.items?.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name} x{item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
