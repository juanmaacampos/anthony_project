import { useState } from 'react';
import CustomerForm from './CustomerForm';
import PaymentSelection from './PaymentSelection';
import { OrderService } from '../../cms-menu/order-service';
import { paymentService } from '../../cms-menu/payment-service';
import { MENU_CONFIG } from '../../cms-menu/config';
import './Cart.css';

const Cart = ({ cart, updateQuantity, removeFromCart, clearCart, total, onClose, firebaseManager }) => {
  const [currentStep, setCurrentStep] = useState('cart'); // 'cart', 'payment', 'customer'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderService] = useState(() => new OrderService(firebaseManager, MENU_CONFIG.restaurantId));

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setCurrentStep('customer');
  };

  const handleCustomerSubmit = async (customerData) => {
    setLoading(true);
    
    try {
      // Generate unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (selectedPaymentMethod === 'mercadopago') {
        // MercadoPago payment flow
        await handleMercadoPagoPayment(orderId, customerData);
      } else {
        // Cash payment flow
        await handleCashPayment(orderId, customerData);
      }
      
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert(`Error al procesar el pedido: ${error.message}\n\nPor favor intenta nuevamente.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCashPayment = async (orderId, customerData) => {
    // Create order in Firebase with cash payment
    const orderData = {
      items: cart,
      customer: customerData,
      total: total,
      notes: customerData.notes,
      paymentMethod: 'cash'
    };

    const order = await orderService.createOrder(orderData);
    console.log('✅ Cash order created:', order);
    
    // Show success message for cash payment
    alert(`¡Pedido confirmado! 🎉\n\nID: ${order.orderId}\n\nTe contactaremos por WhatsApp para coordinar el retiro.\n\nTotal a pagar: $${total.toFixed(2)} ARS`);
    
    clearCart();
    onClose();
  };

  const handleMercadoPagoPayment = async (orderId, customerData) => {
    console.log('🔄 Processing MercadoPago payment...');

    // Generate back URLs
    const baseUrl = window.location.origin;
    const backUrls = paymentService.generateBackUrls(baseUrl, orderId);

    // Prepare order data for MercadoPago
    const orderData = {
      restaurantId: MENU_CONFIG.restaurantId,
      items: cart.map(item => ({
        name: item.name,
        unit_price: item.price,
        quantity: item.quantity
      })),
      customer: {
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email || '',
        address: customerData.address || ''
      },
      totalAmount: total,
      orderId: orderId,
      backUrls: backUrls,
      notes: customerData.notes || ''
    };

    try {
      // Create MercadoPago preference using Cloud Function
      const result = await paymentService.createMercadoPagoPreference(orderData);
      
      if (result.success && result.init_point) {
        console.log('✅ Redirecting to MercadoPago:', result.init_point);
        
        // Clear cart before redirecting
        clearCart();
        
        // Redirect to MercadoPago checkout
        window.location.href = result.init_point;
      } else {
        throw new Error('Failed to create payment preference');
      }
      
    } catch (error) {
      console.error('❌ MercadoPago error:', error);
      throw new Error(`Error con MercadoPago: ${error.message}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <p>Tu carrito está vacío</p>
        <button onClick={onClose} className="close-btn">Cerrar</button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>Tu Pedido</h2>
        <button onClick={onClose} className="close-btn">×</button>
      </div>

      {currentStep === 'cart' && (
        <>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p className="item-price">${item.price}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <h3>Total: ${total.toFixed(2)} ARS</h3>
          </div>

          <div className="cart-actions">
            <button onClick={clearCart} className="clear-btn">
              Vaciar Carrito
            </button>
            <button 
              onClick={() => setCurrentStep('payment')}
              className="checkout-btn"
            >
              Continuar
            </button>
          </div>
        </>
      )}

      {currentStep === 'payment' && (
        <PaymentSelection
          onSelect={handlePaymentMethodSelect}
          onBack={() => setCurrentStep('cart')}
          total={total}
        />
      )}

      {currentStep === 'customer' && (
        <CustomerForm
          onSubmit={handleCustomerSubmit}
          loading={loading}
          paymentMethod={selectedPaymentMethod}
          onBack={() => setCurrentStep('payment')}
        />
      )}
    </div>
  );
};

export default Cart;
