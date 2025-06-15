import React, { useState, useEffect } from 'react';
import { useMenuWithTerminology, useCart } from './useMenu.js';
import { MenuDisplay, FeaturedItems, CategoryNav } from './MenuComponents.jsx';
import { createMenuSDK } from './menu-sdk.js';
import { MENU_CONFIG } from './config.js';

// Componente de testing completo para verificar la integración
export function IntegrationTester() {
  const [testResults, setTestResults] = useState({});
  const [currentTest, setCurrentTest] = useState('');

  // Crear SDK instance
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  
  // Usar el hook con terminología automática
  const { business, restaurant, menu, loading, error, terminology } = useMenuWithTerminology(menuSDK);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount } = useCart();

  // Tests automáticos
  useEffect(() => {
    if (!loading && business) {
      runIntegrationTests();
    }
  }, [loading, business, menu]);

  const runIntegrationTests = async () => {
    const results = {};

    try {
      // Test 1: Verificar configuración
      setCurrentTest('Verificando configuración...');
      results.config = {
        passed: MENU_CONFIG.businessId !== "YOUR_BUSINESS_UID_HERE",
        message: MENU_CONFIG.businessId !== "YOUR_BUSINESS_UID_HERE" 
          ? '✅ Business ID configurado correctamente' 
          : '❌ Business ID no configurado'
      };

      // Test 2: Verificar carga de business
      setCurrentTest('Verificando carga de business...');
      results.business = {
        passed: !!business,
        message: business 
          ? `✅ Business cargado: ${business.name}` 
          : '❌ No se pudo cargar business'
      };

      // Test 3: Verificar terminología
      setCurrentTest('Verificando terminología dinámica...');
      results.terminology = {
        passed: !!terminology && terminology.addToCart,
        message: terminology?.addToCart
          ? `✅ Terminología: "${terminology.addToCart}"`
          : '❌ Terminología no generada'
      };

      // Test 4: Verificar menú
      setCurrentTest('Verificando menú...');
      results.menu = {
        passed: Array.isArray(menu) && menu.length > 0,
        message: menu?.length > 0 
          ? `✅ Menú cargado: ${menu.length} categorías` 
          : '❌ Menú vacío o no cargado'
      };

      // Test 5: Verificar carrito
      setCurrentTest('Verificando funcionalidad de carrito...');
      results.cart = {
        passed: typeof cartTotal === 'number' && typeof cartCount === 'number',
        message: `✅ Carrito funcional - Total: $${cartTotal}, Items: ${cartCount}`
      };

      // Test 6: Verificar MercadoPago config
      setCurrentTest('Verificando configuración MercadoPago...');
      results.mercadopago = {
        passed: !!MENU_CONFIG.mercadoPago?.publicKey && MENU_CONFIG.mercadoPago?.enabled,
        message: MENU_CONFIG.mercadoPago?.enabled 
          ? '✅ MercadoPago configurado y habilitado' 
          : '❌ MercadoPago no configurado'
      };

      setTestResults(results);
      setCurrentTest('Tests completados');

    } catch (err) {
      setTestResults({
        error: {
          passed: false,
          message: `❌ Error en tests: ${err.message}`
        }
      });
    }
  };

  const testAddToCart = () => {
    if (menu.length > 0 && menu[0].items.length > 0) {
      const testItem = menu[0].items[0];
      addToCart(testItem, 1);
    }
  };

  const businessType = business?.businessType || 'restaurant';
  const icon = businessType === 'store' ? '🏪' : '🍽️';

  if (loading) {
    return (
      <div className="integration-tester">
        <h2>🧪 Testing Integration...</h2>
        <p>Cargando sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="integration-tester">
        <h2>❌ Integration Test Failed</h2>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="integration-tester" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🧪 Integration Test Dashboard</h1>
      
      {/* Información del Business */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>{icon} Business Information</h2>
        <p><strong>Nombre:</strong> {business?.name || 'N/A'}</p>
        <p><strong>Tipo:</strong> {business?.businessType || 'restaurant'}</p>
        <p><strong>ID:</strong> {MENU_CONFIG.businessId}</p>
        <p><strong>Terminología:</strong> {terminology?.businessName}</p>
      </section>

      {/* Resultados de Tests */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>📊 Test Results</h2>
        <p><strong>Estado actual:</strong> {currentTest}</p>
        <div style={{ marginTop: '10px' }}>
          {Object.entries(testResults).map(([testName, result]) => (
            <div key={testName} style={{ 
              margin: '5px 0', 
              padding: '8px', 
              backgroundColor: result.passed ? '#e8f5e8' : '#fde8e8',
              borderRadius: '4px'
            }}>
              <strong>{testName}:</strong> {result.message}
            </div>
          ))}
        </div>
      </section>

      {/* Test de Carrito */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>🛒 Cart Test</h2>
        <p>Items en carrito: {cartCount}</p>
        <p>Total: ${cartTotal.toFixed(2)}</p>
        <div style={{ margin: '10px 0' }}>
          <button onClick={testAddToCart} style={{ marginRight: '10px', padding: '8px 16px' }}>
            {terminology?.addToCart || 'Agregar Item Test'}
          </button>
          <button onClick={clearCart} style={{ padding: '8px 16px' }}>
            Limpiar Carrito
          </button>
        </div>
        {cart.length > 0 && (
          <div style={{ marginTop: '10px' }}>
            <h4>Items en carrito:</h4>
            {cart.map((item, index) => (
              <div key={index} style={{ 
                padding: '5px', 
                margin: '2px 0', 
                backgroundColor: '#f5f5f5',
                borderRadius: '4px'
              }}>
                {item.name} - Cantidad: {item.quantity} - ${(item.price * item.quantity).toFixed(2)}
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ marginLeft: '10px', padding: '2px 6px' }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Preview del Menú */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>📋 Menu Preview</h2>
        <p>Categorías encontradas: {menu.length}</p>
        {menu.length > 0 && (
          <>
            <CategoryNav categories={menu} terminology={terminology} />
            <FeaturedItems 
              menu={menu} 
              onAddToCart={addToCart}
              terminology={terminology}
            />
          </>
        )}
      </section>

      {/* Configuración MercadoPago */}
      <section style={{ marginBottom: '30px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>💳 MercadoPago Configuration</h2>
        <p><strong>Habilitado:</strong> {MENU_CONFIG.mercadoPago?.enabled ? '✅ Sí' : '❌ No'}</p>
        <p><strong>Public Key:</strong> {MENU_CONFIG.mercadoPago?.publicKey ? '✅ Configurado' : '❌ Faltante'}</p>
        <p><strong>Moneda:</strong> {MENU_CONFIG.mercadoPago?.currency || 'N/A'}</p>
      </section>

      {/* Acciones */}
      <section style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2>🔧 Actions</h2>
        <button 
          onClick={runIntegrationTests}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Re-run Tests
        </button>
      </section>
    </div>
  );
}

export default IntegrationTester;
