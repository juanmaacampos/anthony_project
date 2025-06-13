import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { globalFirebaseManager } from '../cms-menu/firebase-manager';
import './PaymentFailure.css';

const PaymentFailure = () => {
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
    <div className="payment-result payment-failure">
      <div className="failure-content">
        <div className="failure-icon">❌</div>
        <h1>Pago No Completado</h1>
        <p>Hubo un problema al procesar tu pago</p>
        
        {order && (
          <div className="order-details">
            <h3>Detalles del Pedido</h3>
            <p><strong>Número de pedido:</strong> {order.id}</p>
            <p><strong>Total:</strong> ${order.total?.toFixed(2)} ARS</p>
            <p><strong>Estado:</strong> Pago fallido</p>
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
          <Link to="/" className="btn btn-secondary">Intentar nuevamente</Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
