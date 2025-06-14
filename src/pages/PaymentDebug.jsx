import React from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Componente de debug para mostrar exactamente qué parámetros se están recibiendo
 * Esto nos ayudará a entender qué está enviando MercadoPago
 */
const PaymentDebug = () => {
  const [searchParams] = useSearchParams();
  const allParams = Object.fromEntries(searchParams.entries());
  
  console.log('🔍 PaymentDebug: All URL parameters:', allParams);
  console.log('🔍 PaymentDebug: Current URL:', window.location.href);
  console.log('🔍 PaymentDebug: Current path:', window.location.pathname);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '2rem auto',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      fontFamily: 'monospace'
    }}>
      <h1>🐛 Payment Debug Page</h1>
      <h2>Current URL:</h2>
      <p style={{backgroundColor: '#e9ecef', padding: '1rem', wordBreak: 'break-all'}}>
        {window.location.href}
      </p>
      
      <h2>URL Parameters:</h2>
      <pre style={{backgroundColor: '#e9ecef', padding: '1rem', overflow: 'auto'}}>
        {JSON.stringify(allParams, null, 2)}
      </pre>
      
      <h2>Key Parameters:</h2>
      <ul>
        <li><strong>order/external_reference:</strong> {searchParams.get('order') || searchParams.get('external_reference') || 'NOT FOUND'}</li>
        <li><strong>payment_id:</strong> {searchParams.get('payment_id') || 'NOT FOUND'}</li>
        <li><strong>status:</strong> {searchParams.get('status') || 'NOT FOUND'}</li>
        <li><strong>collection_status:</strong> {searchParams.get('collection_status') || 'NOT FOUND'}</li>
      </ul>
      
      <h2>Manual Navigation:</h2>
      <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
        <button 
          onClick={() => window.location.href = '/restaurant_template/payment/success?' + searchParams.toString()}
          style={{padding: '0.5rem 1rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px'}}
        >
          Go to Success Page
        </button>
        <button 
          onClick={() => window.location.href = '/restaurant_template/payment/failure?' + searchParams.toString()}
          style={{padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px'}}
        >
          Go to Failure Page
        </button>
        <button 
          onClick={() => window.location.href = '/restaurant_template/payment/pending?' + searchParams.toString()}
          style={{padding: '0.5rem 1rem', backgroundColor: '#ffc107', color: 'black', border: 'none', borderRadius: '4px'}}
        >
          Go to Pending Page
        </button>
      </div>
      
      <div style={{marginTop: '2rem'}}>
        <button 
          onClick={() => window.location.href = '/restaurant_template/'}
          style={{padding: '0.5rem 1rem', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px'}}
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};

export default PaymentDebug;
