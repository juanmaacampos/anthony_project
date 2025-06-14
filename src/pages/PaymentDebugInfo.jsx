import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { globalFirebaseManager } from '../cms-menu/firebase-manager';

const PaymentDebugInfo = () => {
  const [searchParams] = useSearchParams();
  const [debugInfo, setDebugInfo] = useState({});
  const [orderData, setOrderData] = useState(null);
  
  useEffect(() => {
    const loadDebugInfo = async () => {
      // Recopilar toda la información de la URL
      const allParams = Object.fromEntries(searchParams.entries());
      const orderId = searchParams.get('order') || searchParams.get('external_reference');
      
      const info = {
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
        allParams,
        orderId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      };
      
      setDebugInfo(info);
      
      // Intentar cargar datos del pedido desde Firebase
      if (orderId) {
        try {
          await globalFirebaseManager.initialize();
          const db = globalFirebaseManager.getDatabase();
          const orderRef = doc(db, 'orders', orderId);
          const orderDoc = await getDoc(orderRef);
          
          if (orderDoc.exists()) {
            setOrderData({ id: orderDoc.id, ...orderDoc.data() });
          }
        } catch (error) {
          console.error('Error loading order:', error);
        }
      }
    };
    
    loadDebugInfo();
  }, [searchParams]);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'monospace',
      fontSize: '0.9rem'
    }}>
      <h1>🔍 MercadoPago Payment Debug Info</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '6px', 
        marginBottom: '2rem' 
      }}>
        <h2>URL Information</h2>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>

      {orderData && (
        <div style={{ 
          background: '#e8f5e8', 
          padding: '1rem', 
          borderRadius: '6px', 
          marginBottom: '2rem' 
        }}>
          <h2>Order Data from Firebase</h2>
          <pre>{JSON.stringify(orderData, null, 2)}</pre>
        </div>
      )}

      <div style={{ 
        background: '#fff3cd', 
        padding: '1rem', 
        borderRadius: '6px', 
        marginBottom: '2rem' 
      }}>
        <h2>Recommended Action</h2>
        {debugInfo.allParams?.status === 'approved' || debugInfo.allParams?.collection_status === 'approved' ? (
          <p style={{ color: '#155724' }}>
            ✅ <strong>Payment appears to be SUCCESSFUL</strong> - should redirect to success page
          </p>
        ) : orderData?.paymentStatus === 'paid' ? (
          <p style={{ color: '#155724' }}>
            ✅ <strong>Payment is SUCCESSFUL in Firebase</strong> - should redirect to success page
          </p>
        ) : (
          <p style={{ color: '#721c24' }}>
            ❌ Payment appears to have failed or is pending
          </p>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        justifyContent: 'center' 
      }}>
        <button 
          onClick={() => window.location.href = '/restaurant_template/payment/success?order=' + debugInfo.orderId}
          style={{ 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '6px' 
          }}
        >
          Go to Success Page
        </button>
        <button 
          onClick={() => window.location.href = '/restaurant_template/payment/failure?order=' + debugInfo.orderId}
          style={{ 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '6px' 
          }}
        >
          Go to Failure Page
        </button>
        <button 
          onClick={() => window.location.href = '/restaurant_template/'}
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '6px' 
          }}
        >
          Go to Menu
        </button>
      </div>
    </div>
  );
};

export default PaymentDebugInfo;
