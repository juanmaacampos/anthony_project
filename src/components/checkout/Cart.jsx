import { useState } from 'react';
import CustomerForm from './CustomerForm';
import { OrderService } from '../../cms-menu/order-service';
import { MENU_CONFIG } from '../../cms-menu/config';
import './Cart.css';

const Cart = ({ cart, updateQuantity, removeFromCart, clearCart, total, onClose, firebaseManager }) => {
  const [currentStep, setCurrentStep] = useState('cart'); // 'cart', 'customer'
  const [loading, setLoading] = useState(false);
  const [orderService] = useState(() => new OrderService(firebaseManager, MENU_CONFIG.restaurantId));

  const handleCustomerSubmit = async (customerData) => {
    setLoading(true);
    
    try {
      // Create order in Firebase with cash payment
      const orderData = {
        items: cart,
        customer: customerData,
        total: total,
        notes: customerData.notes,
        paymentMethod: 'cash'
      };

      const order = await orderService.createOrder(orderData);
      console.log('✅ Order created:', order);
      
      // Show success message for cash payment
      alert(`¡Pedido confirmado! 🎉\n\nID: ${order.orderId}\n\nTe contactaremos por WhatsApp para coordinar el retiro.\n\nTotal a pagar: $${total.toFixed(2)} ARS`);
      
      clearCart();
      onClose();
      
    } catch (error) {
      console.error('❌ Checkout error:', error);
      alert(`Error al procesar el pedido: ${error.message}\n\nPor favor intenta nuevamente.`);
    } finally {
      setLoading(false);
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
              onClick={() => setCurrentStep('customer')}
              className="checkout-btn"
            >
              Realizar Pedido
            </button>
          </div>
        </>
      )}

      {currentStep === 'customer' && (
        <CustomerForm 
          onSubmit={handleCustomerSubmit}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Cart;
