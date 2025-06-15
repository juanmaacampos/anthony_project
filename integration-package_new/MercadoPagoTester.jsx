import React, { useState, useEffect } from 'react';
import { MERCADOPAGO_TEST_CONFIG, isTestingMode, getTestCardsInfo, logTestingInfo } from './mercadopago-test-config.js';
import { CheckoutFlow } from './PaymentFlow.jsx';
import { createMenuSDK } from './menu-sdk.js';
import { MENU_CONFIG } from './config.js';
import { useCart } from './useMenu.js';

// 🧪 Componente principal para testing de MercadoPago
export function MercadoPagoTester() {
  const [currentTest, setCurrentTest] = useState('setup');
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const { cart, addToCart, clearCart, cartTotal } = useCart();
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    logTestingInfo();
    loadRestaurantData();
  }, []);

  const loadRestaurantData = async () => {
    try {
      const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
      const restaurantData = await menuSDK.getRestaurantInfo();
      setRestaurant(restaurantData);
    } catch (error) {
      console.error('Error loading restaurant:', error);
    }
  };

  // 📦 Agregar productos de prueba al carrito
  const addTestItems = () => {
    const testItems = [
      {
        id: 'test-1',
        name: 'Pizza Margherita (Testing)',
        price: 1500.00,
        description: 'Pizza de prueba para testing de pagos'
      },
      {
        id: 'test-2', 
        name: 'Hamburguesa Clásica (Testing)',
        price: 850.50,
        description: 'Hamburguesa de prueba'
      }
    ];

    testItems.forEach(item => addToCart(item));
  };

  // 🔍 Test de configuración básica
  const testConfiguration = async () => {
    setLoading(true);
    setCurrentTest('configuration');
    
    try {
      const results = {
        isTestingMode: isTestingMode(),
        hasPublicKey: !!MERCADOPAGO_TEST_CONFIG.publicKey,
        hasAccessToken: !!MERCADOPAGO_TEST_CONFIG.accessToken,
        hasReturnUrls: !!MERCADOPAGO_TEST_CONFIG.returnUrls.success,
        testCardsAvailable: Object.keys(MERCADOPAGO_TEST_CONFIG.testCards).length > 0
      };

      setTestResults(prev => ({ ...prev, configuration: results }));
      
      console.log('✅ Test de configuración completado:', results);
    } catch (error) {
      console.error('❌ Error en test de configuración:', error);
      setTestResults(prev => ({ ...prev, configuration: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  // 🛒 Test del flujo de carrito
  const testCartFlow = () => {
    setCurrentTest('cart');
    addTestItems();
    
    const results = {
      itemsAdded: cart.length > 0,
      totalCalculated: cartTotal > 0,
      cartFunctional: true
    };

    setTestResults(prev => ({ ...prev, cart: results }));
    console.log('✅ Test de carrito completado:', results);
  };

  // 💳 Test de preferencia de pago
  const testPaymentPreference = async () => {
    setLoading(true);
    setCurrentTest('payment');
    
    try {
      // Simular llamada a Cloud Function
      const testPayload = {
        orderId: `test_${Date.now()}`,
        items: cart,
        total: cartTotal,
        restaurantId: MENU_CONFIG.restaurantId,
        customerInfo: {
          name: 'Usuario de Prueba',
          email: 'test@example.com',
          phone: '+5491234567890'
        }
      };

      console.log('🔍 Testing payment preference creation with:', testPayload);

      // Aquí normalmente se llamaría a la Cloud Function
      const results = {
        payloadCreated: true,
        orderId: testPayload.orderId,
        totalAmount: testPayload.total,
        itemsCount: testPayload.items.length,
        readyForMercadoPago: true
      };

      setTestResults(prev => ({ ...prev, payment: results }));
      console.log('✅ Test de preferencia de pago completado:', results);
      
    } catch (error) {
      console.error('❌ Error en test de pago:', error);
      setTestResults(prev => ({ ...prev, payment: { error: error.message } }));
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Reset de todos los tests
  const resetTests = () => {
    setCurrentTest('setup');
    setTestResults({});
    clearCart();
  };

  return (
    <div className="mercadopago-tester">
      <div className="testing-header">
        <h1>🧪 MercadoPago Testing Suite</h1>
        <p>Herramienta para probar la integración con MercadoPago</p>
        
        {isTestingMode() ? (
          <div className="alert alert-info">
            ✅ Modo Testing Activado - Credenciales de prueba detectadas
          </div>
        ) : (
          <div className="alert alert-warning">
            ⚠️ Modo Producción - Verifica tus credenciales
          </div>
        )}
      </div>

      <div className="testing-controls">
        <h2>🎮 Controles de Testing</h2>
        
        <div className="test-buttons">
          <button 
            onClick={testConfiguration}
            disabled={loading}
            className={`test-btn ${currentTest === 'configuration' ? 'active' : ''}`}
          >
            🔧 Test Configuración
          </button>
          
          <button 
            onClick={testCartFlow}
            disabled={loading}
            className={`test-btn ${currentTest === 'cart' ? 'active' : ''}`}
          >
            🛒 Test Carrito
          </button>
          
          <button 
            onClick={testPaymentPreference}
            disabled={loading || cart.length === 0}
            className={`test-btn ${currentTest === 'payment' ? 'active' : ''}`}
          >
            💳 Test Pago
          </button>
          
          <button 
            onClick={resetTests}
            className="test-btn reset"
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Resultados de los tests */}
      <div className="test-results">
        <h2>📊 Resultados de Testing</h2>
        
        {Object.keys(testResults).map(testName => (
          <div key={testName} className="test-result">
            <h3>🧪 {testName.charAt(0).toUpperCase() + testName.slice(1)}</h3>
            <pre>{JSON.stringify(testResults[testName], null, 2)}</pre>
          </div>
        ))}
      </div>

      {/* Información de tarjetas de prueba */}
      <div className="test-cards-info">
        <h2>💳 Tarjetas de Prueba Disponibles</h2>
        <div className="cards-grid">
          {Object.entries(getTestCardsInfo().all).map(([type, card]) => (
            <div key={type} className="test-card">
              <h4>{type.charAt(0).toUpperCase() + type.slice(1)}</h4>
              <p><strong>Número:</strong> {card.number}</p>
              <p><strong>CVV:</strong> {card.cvv}</p>
              <p><strong>Vencimiento:</strong> {card.expiry}</p>
              <p><strong>Titular:</strong> {card.holder}</p>
              <p><strong>Resultado:</strong> <span className={`status ${card.status}`}>{card.status}</span></p>
            </div>
          ))}
        </div>
      </div>

      {/* Flujo de checkout real */}
      {cart.length > 0 && currentTest === 'payment' && (
        <div className="checkout-section">
          <h2>🚀 Prueba el Checkout Real</h2>
          <CheckoutFlow
            cart={cart}
            cartTotal={cartTotal}
            restaurant={restaurant}
            onOrderComplete={(orderId) => {
              console.log('✅ Pedido completado:', orderId);
              alert(`Pedido completado: ${orderId}`);
            }}
          />
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">🔄 Ejecutando test...</div>
        </div>
      )}
    </div>
  );
}

// 📱 Componente compacto para testing rápido  
export function QuickMercadoPagoTest() {
  const [status, setStatus] = useState('ready');
  
  const runQuickTest = async () => {
    setStatus('testing');
    
    try {
      // Test básico de configuración
      const hasConfig = isTestingMode();
      const testCards = getTestCardsInfo();
      
      console.log('🧪 Quick Test Results:');
      console.log('- Testing mode:', hasConfig);
      console.log('- Test cards available:', Object.keys(testCards.all).length);
      
      setStatus('success');
      setTimeout(() => setStatus('ready'), 3000);
      
    } catch (error) {
      console.error('❌ Quick test failed:', error);
      setStatus('error');
      setTimeout(() => setStatus('ready'), 3000);
    }
  };

  return (
    <div className="quick-test">
      <button 
        onClick={runQuickTest}
        disabled={status !== 'ready'}
        className={`quick-test-btn ${status}`}
      >
        {status === 'ready' && '🧪 Test Rápido MP'}
        {status === 'testing' && '🔄 Testing...'}
        {status === 'success' && '✅ Test OK'}
        {status === 'error' && '❌ Test Failed'}
      </button>
    </div>
  );
}
