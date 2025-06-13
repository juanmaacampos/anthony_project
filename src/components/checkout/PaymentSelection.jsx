import './PaymentSelection.css';

const PaymentSelection = ({ onSelect, onBack, total }) => {
  return (
    <div className="payment-selection">
      <div className="payment-header">
        <button onClick={onBack} className="back-btn">← Volver</button>
        <h3>Método de Pago</h3>
      </div>

      <div className="payment-total">
        <h4>Total a pagar: ${total.toFixed(2)} ARS</h4>
      </div>

      <div className="payment-methods">
        <div 
          className="payment-method cash"
          onClick={() => onSelect('cash')}
        >
          <div className="payment-icon">💵</div>
          <div className="payment-info">
            <h4>Efectivo</h4>
            <p>Pago al retirar el pedido</p>
            <small>Coordinaremos por WhatsApp</small>
          </div>
          <div className="payment-arrow">→</div>
        </div>

        <div 
          className="payment-method mercadopago"
          onClick={() => onSelect('mercadopago')}
        >
          <div className="payment-icon">💳</div>
          <div className="payment-info">
            <h4>MercadoPago</h4>
            <p>Tarjeta de crédito/débito</p>
            <small>Pago seguro online</small>
          </div>
          <div className="payment-arrow">→</div>
        </div>
      </div>

      <div className="payment-note">
        <p>🔒 Todos los pagos son seguros y protegidos</p>
      </div>
    </div>
  );
};

export default PaymentSelection;