/**
 * CheckoutForm Component
 * React component for restaurant checkout with MercadoPago and Cash payment integration
 */

import React, { useState, useEffect } from 'react';
import { db, functions } from '../firebase.js';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc, collection, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { MENU_CONFIG } from '../cms-menu/config.js';

// Usar el restaurantId de la configuración centralizada
const CURRENT_RESTAURANT_ID = MENU_CONFIG.restaurantId;

const CheckoutForm = () => {
  // Estados del componente
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [restaurantData, setRestaurantData] = useState(null);

  // Cargar datos del carrito y restaurante al montar el componente
  useEffect(() => {
    loadCartFromStorage();
    loadRestaurantData();
  }, []);

  /**
   * Cargar datos del carrito desde localStorage
   */
  const loadCartFromStorage = () => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      const storedTotal = localStorage.getItem('cartTotal');
      
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setCartItems(parsedCart);
        console.log('✅ Cart loaded from localStorage:', parsedCart);
      }
      
      if (storedTotal) {
        const parsedTotal = parseFloat(storedTotal);
        setTotalAmount(parsedTotal);
        console.log('✅ Total loaded from localStorage:', parsedTotal);
      }
    } catch (error) {
      console.error('❌ Error loading cart from localStorage:', error);
      setFeedbackMessage('Error al cargar el carrito. Intenta agregar productos nuevamente.');
    }
  };

  /**
   * Función opcional para cargar datos del restaurante desde Firestore
   */
  const loadRestaurantData = async () => {
    try {
      const restaurantRef = doc(db, 'restaurants', CURRENT_RESTAURANT_ID);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (restaurantDoc.exists()) {
        setRestaurantData(restaurantDoc.data());
        console.log('✅ Restaurant data loaded:', restaurantDoc.data());
      } else {
        console.warn('⚠️ Restaurant document not found');
      }
    } catch (error) {
      console.error('❌ Error loading restaurant data:', error);
    }
  };

  /**
   * Manejar cambios en los campos del formulario
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Validaciones básicas del formulario
   */
  const validateForm = () => {
    // Validar carrito
    if (!cartItems || cartItems.length === 0) {
      setFeedbackMessage('El carrito está vacío. Agrega productos antes de proceder.');
      return false;
    }

    if (!totalAmount || totalAmount <= 0) {
      setFeedbackMessage('El total del pedido debe ser mayor a 0.');
      return false;
    }

    // Validar información del cliente
    if (!customerInfo.name.trim()) {
      setFeedbackMessage('El nombre es obligatorio.');
      return false;
    }

    if (!customerInfo.phone.trim()) {
      setFeedbackMessage('El teléfono es obligatorio.');
      return false;
    }

    if (!selectedPaymentMethod) {
      setFeedbackMessage('Selecciona un método de pago.');
      return false;
    }

    return true;
  };

  /**
   * Función principal para manejar el envío del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Establecer estado de carga
    setIsLoading(true);
    setFeedbackMessage('');

    try {
      // Validar formulario
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      // Generar ID único para el pedido
      const orderId = uuidv4();
      console.log('🆔 Generated order ID:', orderId);

      // Procesar según el método de pago seleccionado
      if (selectedPaymentMethod === 'cash') {
        await handleCashPayment(
          CURRENT_RESTAURANT_ID,
          cartItems,
          customerInfo,
          totalAmount,
          customerInfo.notes,
          orderId
        );
      } else if (selectedPaymentMethod === 'mercadopago') {
        await handleMercadoPagoPayment(
          CURRENT_RESTAURANT_ID,
          cartItems,
          customerInfo,
          totalAmount,
          customerInfo.notes,
          orderId
        );
      }

    } catch (error) {
      console.error('❌ Error processing order:', error);
      setFeedbackMessage(`Error al procesar el pedido: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Manejar pago en efectivo
   */
  const handleCashPayment = async (restaurantId, cartItems, customerInfo, totalAmount, notes, orderId) => {
    try {
      console.log('💵 Processing cash payment...');

      // Preparar datos del pedido
      const orderData = {
        restaurantId,
        items: cartItems.map(item => ({
          name: item.name || item.title,
          unit_price: item.price || item.unit_price,
          quantity: item.quantity
        })),
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email || '',
          address: customerInfo.address || ''
        },
        total: totalAmount,
        paymentMethod: "cash",
        status: "pending",
        paymentStatus: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        notes: notes || ''
      };

      // Guardar pedido en Firestore
      const orderRef = doc(db, 'orders', orderId);
      await setDoc(orderRef, orderData);

      console.log('✅ Cash order saved successfully');
      setFeedbackMessage('¡Pedido confirmado! Redirigiendo...');

      // Limpiar carrito
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartTotal');

      // Redirigir a página de estado del pedido
      setTimeout(() => {
        window.location.href = `/estado-pedido?orderId=${orderId}`;
      }, 1500);

    } catch (error) {
      console.error('❌ Error processing cash payment:', error);
      throw new Error('Error al procesar el pago en efectivo');
    }
  };

  /**
   * Manejar pago con MercadoPago
   */
  const handleMercadoPagoPayment = async (restaurantId, cartItems, customerInfo, totalAmount, notes, orderId) => {
    try {
      console.log('💳 Processing MercadoPago payment...');

      // Construir URLs de retorno usando la configuración de producción
      const backUrls = {
        success: `${MENU_CONFIG.baseUrl}/payment/success?order=${orderId}`,
        pending: `${MENU_CONFIG.baseUrl}/payment/pending?order=${orderId}`,
        failure: `${MENU_CONFIG.baseUrl}/payment/failure?order=${orderId}`
      };

      // Preparar datos para la Cloud Function
      const paymentData = {
        restaurantId,
        items: cartItems.map(item => ({
          name: item.name || item.title,
          unit_price: item.price || item.unit_price,
          quantity: item.quantity
        })),
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email || '',
          address: customerInfo.address || ''
        },
        totalAmount,
        orderId,
        backUrls,
        notes: notes || ''
      };

      console.log('📤 Calling MercadoPago Cloud Function with data:', paymentData);

      // Llamar a la Cloud Function
      const createMercadoPagoPreferenceCallable = httpsCallable(functions, 'createMercadoPagoPreference');
      const result = await createMercadoPagoPreferenceCallable(paymentData);

      console.log('✅ MercadoPago Cloud Function response:', result.data);

      // Verificar respuesta y redirigir
      if (result.data && result.data.init_point) {
        setFeedbackMessage('Redirigiendo a MercadoPago...');
        
        // Limpiar carrito
        localStorage.removeItem('cartItems');
        localStorage.removeItem('cartTotal');

        // Redirigir a MercadoPago
        setTimeout(() => {
          window.location.href = result.data.init_point;
        }, 1000);
      } else {
        throw new Error('No se recibió el enlace de pago de MercadoPago');
      }

    } catch (error) {
      console.error('❌ Error processing MercadoPago payment:', error);
      throw new Error(`Error al procesar el pago con MercadoPago: ${error.message}`);
    }
  };

  return (
    <div className="checkout-form-container">
      <div className="checkout-form">
        {/* Información del restaurante */}
        {restaurantData && (
          <div className="restaurant-info">
            <h2>{restaurantData.name}</h2>
            {restaurantData.slogan && <p className="slogan">{restaurantData.slogan}</p>}
          </div>
        )}

        <h3>Finalizar Pedido</h3>

        {/* Mostrar items del carrito */}
        <div className="cart-summary">
          <h4>Resumen del Pedido:</h4>
          {cartItems.length > 0 ? (
            <div className="cart-items">
              {cartItems.map((item, index) => (
                <div key={index} className="cart-item">
                  <span className="item-name">{item.name || item.title}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                  <span className="item-price">${(item.price || item.unit_price) * item.quantity}</span>
                </div>
              ))}
              <div className="cart-total">
                <strong>Total: ${totalAmount}</strong>
              </div>
            </div>
          ) : (
            <p>El carrito está vacío</p>
          )}
        </div>

        {/* Formulario de checkout */}
        <form onSubmit={handleSubmit} className="checkout-form-fields">
          {/* Información del cliente */}
          <div className="customer-info">
            <h4>Información de Contacto:</h4>
            
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={customerInfo.name}
                onChange={handleInputChange}
                required
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={customerInfo.phone}
                onChange={handleInputChange}
                required
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={customerInfo.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Dirección</label>
              <input
                type="text"
                id="address"
                name="address"
                value={customerInfo.address}
                onChange={handleInputChange}
                placeholder="Tu dirección de entrega"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas adicionales</label>
              <textarea
                id="notes"
                name="notes"
                value={customerInfo.notes}
                onChange={handleInputChange}
                placeholder="Instrucciones especiales, alergias, etc."
                rows={3}
              />
            </div>
          </div>

          {/* Métodos de pago */}
          <div className="payment-methods">
            <h4>Método de Pago:</h4>
            
            <div className="payment-option">
              <input
                type="radio"
                id="cash"
                name="paymentMethod"
                value="cash"
                checked={selectedPaymentMethod === 'cash'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              />
              <label htmlFor="cash">
                💵 Pago en Efectivo
                <span className="payment-description">Pagar al recibir el pedido</span>
              </label>
            </div>

            <div className="payment-option">
              <input
                type="radio"
                id="mercadopago"
                name="paymentMethod"
                value="mercadopago"
                checked={selectedPaymentMethod === 'mercadopago'}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              />
              <label htmlFor="mercadopago">
                💳 MercadoPago
                <span className="payment-description">Tarjeta de débito, crédito o efectivo</span>
              </label>
            </div>
          </div>

          {/* Mensaje de feedback */}
          {feedbackMessage && (
            <div className={`feedback-message ${feedbackMessage.includes('Error') ? 'error' : 'success'}`}>
              {feedbackMessage}
            </div>
          )}

          {/* Botón de envío */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading || cartItems.length === 0}
          >
            {isLoading ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </form>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .checkout-form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .checkout-form {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .restaurant-info {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eee;
        }

        .restaurant-info h2 {
          color: #333;
          margin: 0 0 8px 0;
        }

        .slogan {
          color: #666;
          font-style: italic;
          margin: 0;
        }

        .cart-summary {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .cart-total {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 2px solid #333;
          text-align: right;
          font-size: 1.1em;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 600;
          color: #333;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .payment-methods {
          margin: 24px 0;
        }

        .payment-option {
          margin-bottom: 12px;
        }

        .payment-option input[type="radio"] {
          margin-right: 8px;
        }

        .payment-option label {
          display: flex;
          align-items: center;
          cursor: pointer;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .payment-option label:hover {
          background-color: #f8f9fa;
        }

        .payment-option input[type="radio"]:checked + label {
          background-color: #e3f2fd;
          border-color: #2196f3;
        }

        .payment-description {
          margin-left: auto;
          font-size: 0.9em;
          color: #666;
        }

        .feedback-message {
          padding: 12px;
          border-radius: 4px;
          margin: 16px 0;
          text-align: center;
        }

        .feedback-message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .feedback-message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          font-size: 18px;
          font-weight: 600;
          color: white;
          background-color: #28a745;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-button:hover:not(:disabled) {
          background-color: #218838;
        }

        .submit-button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .checkout-form-container {
            padding: 10px;
          }
          
          .checkout-form {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default CheckoutForm;
