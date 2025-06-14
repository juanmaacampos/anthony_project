import React, { useState, useEffect } from 'react';

const PaymentStatusNotification = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Mostrar la notificación después de un breve delay
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: '#fff3cd',
      border: '1px solid #ffeaa7',
      borderRadius: '8px',
      padding: '1rem',
      maxWidth: '400px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>
            ⚠️ ¿Problema con el pago?
          </h4>
          <p style={{ margin: '0', fontSize: '0.9rem', color: '#856404' }}>
            Si ves esta página de error pero tu pago fue exitoso, <strong>no te preocupes</strong>. 
            Tu pedido fue procesado correctamente. Contactanos para confirmar.
          </p>
          <div style={{ marginTop: '0.5rem' }}>
            <a 
              href="https://wa.me/1234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                background: '#25d366',
                color: 'white',
                textDecoration: 'none',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.8rem',
                display: 'inline-block'
              }}
            >
              📱 WhatsApp
            </a>
          </div>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.2rem',
            cursor: 'pointer',
            color: '#856404'
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default PaymentStatusNotification;
