import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Componente que maneja las notificaciones de MercadoPago webhook
 * Redirige automáticamente a la página de estado correspondiente
 */
const WebhookHandler = () => {
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    const collection_id = searchParams.get('collection_id');
    const collection_status = searchParams.get('collection_status');
    const payment_id = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const external_reference = searchParams.get('external_reference');
    const payment_type = searchParams.get('payment_type');
    const merchant_order_id = searchParams.get('merchant_order_id');
    const preference_id = searchParams.get('preference_id');
    const site_id = searchParams.get('site_id');
    const processing_mode = searchParams.get('processing_mode');
    const merchant_account_id = searchParams.get('merchant_account_id');

    console.log('🔔 MercadoPago webhook parameters received:', {
      collection_id,
      collection_status,
      payment_id,
      status,
      external_reference,
      payment_type,
      merchant_order_id,
      preference_id,
      site_id,
      processing_mode,
      merchant_account_id
    });

    // Redirigir basado en el estado del pago
    const orderId = external_reference;
    const baseUrl = '/restaurant_template';
    
    if (status === 'approved' || collection_status === 'approved') {
      window.location.href = `${baseUrl}/payment/success?order=${orderId}`;
    } else if (status === 'pending' || collection_status === 'pending') {
      window.location.href = `${baseUrl}/payment/pending?order=${orderId}`;
    } else if (status === 'rejected' || status === 'cancelled' || collection_status === 'rejected') {
      window.location.href = `${baseUrl}/payment/failure?order=${orderId}`;
    } else {
      // Si no hay estado claro, redirigir a pendiente
      window.location.href = `${baseUrl}/payment/pending?order=${orderId}`;
    }
  }, [searchParams]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '2rem' }}>🔄</div>
      <p>Procesando resultado del pago...</p>
      <p style={{ color: '#666', fontSize: '0.9rem' }}>
        Serás redirigido automáticamente
      </p>
    </div>
  );
};

export default WebhookHandler;
