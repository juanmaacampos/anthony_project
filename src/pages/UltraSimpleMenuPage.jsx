import React from 'react';
import { useUltraSimpleMenuIntegration } from '../cms-menu/useMenu-ultra-simple';
import { MenuDisplay, Cart } from '../cms-menu/MenuComponents';
import { MENU_CONFIG } from '../cms-menu/config';
import '../cms-menu/MenuComponents.css';

function UltraSimpleMenuPage() {
  const { 
    restaurant, 
    menu, 
    loading, 
    error, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    total,
    retry,
    retryCount
  } = useUltraSimpleMenuIntegration(MENU_CONFIG);

  return (
    <div className="ultra-simple-menu-page">
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #6f42c1, #007bff)', 
        color: 'white', 
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1>⚡ Menú CMS - Ultra Simple</h1>
        <p>SDK minimalista diseñado para máxima compatibilidad</p>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          fontSize: '0.9rem'
        }}>
          <strong>🎯 Características Ultra Simple:</strong><br/>
          • Firebase 10.8.0 (versión estable)<br/>
          • Solo operaciones básicas de lectura<br/>
          • Sin listeners en tiempo real<br/>
          • Timeouts muy cortos (5-8 segundos)<br/>
          • Fallback sin ordenamiento<br/>
          • Procesamiento secuencial
        </div>
      </div>

      {/* Status Panel */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '8px',
        margin: '0 20px 20px',
        border: '1px solid #dee2e6'
      }}>
        <h4>📊 Estado Ultra Simple</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Firebase:</strong> {loading ? '🔄 Cargando...' : error ? '❌ Error' : '✅ OK'}
          </div>
          <div>
            <strong>Restaurante:</strong> {restaurant ? `✅ ${restaurant.name}` : '⏳ Pendiente'}
          </div>
          <div>
            <strong>Menú:</strong> {menu.length > 0 ? `✅ ${menu.length} categorías` : '⏳ Pendiente'}
          </div>
          <div>
            <strong>Reintentos:</strong> {retryCount}/2
          </div>
        </div>
        
        {error && (
          <div style={{ marginTop: '1rem' }}>
            <button 
              onClick={retry}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 Reintentar Ultra Simple
            </button>
          </div>
        )}
      </div>

      {/* Menu and Cart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', padding: '0 20px' }}>
        <div>
          {restaurant && (
            <div style={{ marginBottom: '20px' }}>
              <h2>🍽️ {restaurant.name}</h2>
              {restaurant.description && <p>{restaurant.description}</p>}
            </div>
          )}
          
          {/* Custom error display */}
          {error ? (
            <div style={{
              background: 'rgba(220, 53, 69, 0.1)',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
              <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error en SDK Ultra Simple</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
              
              <button 
                onClick={retry}
                style={{
                  background: '#6f42c1',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ⚡ Reintentar Ultra Simple
              </button>
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#e9ecef', 
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}>
                <h4>🛠️ Este SDK es la última opción:</h4>
                <ul style={{ textAlign: 'left', margin: '0.5rem 0' }}>
                  <li>Usa Firebase 10.8.0 estable</li>
                  <li>Solo operaciones básicas de lectura</li>
                  <li>Timeouts muy cortos</li>
                  <li>Sin features avanzadas de Firebase</li>
                  <li>Si esto falla, el problema puede ser de red o configuración</li>
                </ul>
              </div>
            </div>
          ) : (
            <MenuDisplay 
              menu={menu} 
              onAddToCart={addToCart} 
              loading={loading} 
              error={null}
              onRetry={retry}
            />
          )}
        </div>
        
        <div>
          <Cart 
            cart={cart} 
            onUpdateQuantity={updateQuantity} 
            onRemove={removeFromCart} 
            onClear={clearCart} 
            total={total} 
          />
          
          {/* Debug Info */}
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            <h4>🔧 Información de Debug</h4>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
              <li>Firebase Version: 10.8.0</li>
              <li>SDK Type: Ultra Simple</li>
              <li>Real-time Listeners: Disabled</li>
              <li>Query Timeout: 5-8 seconds</li>
              <li>Retry Strategy: 2 attempts max</li>
              <li>Fallback: No ordenamiento</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        color: '#666',
        borderTop: '1px solid #eee',
        marginTop: '2rem'
      }}>
        <p>
          ⚡ <strong>SDK Ultra Simple</strong> - Diseñado para resolver problemas de compatibilidad de Firebase.<br/>
          Si este SDK no funciona, el problema puede estar en la configuración de red o Firebase.
        </p>
      </div>
    </div>
  );
}

export default UltraSimpleMenuPage;
