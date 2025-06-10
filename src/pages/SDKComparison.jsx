import React, { useState } from 'react';
import { useMenuIntegration } from '../cms-menu/useMenu';
import { useMenuIntegrationV2 } from '../cms-menu/useMenu-v2';
import { MenuDisplay, Cart } from '../cms-menu/MenuComponents';
import { MENU_CONFIG } from '../cms-menu/config';
import '../cms-menu/MenuComponents.css';

function SDKComparison() {
  const [activeVersion, setActiveVersion] = useState('v2');
  
  // Only initialize the currently active SDK to avoid conflicts
  const v1Data = activeVersion === 'v1' ? useMenuIntegration(MENU_CONFIG) : {
    restaurant: null,
    menu: [],
    loading: false,
    error: null,
    cart: [],
    addToCart: () => {},
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    total: 0,
    connectionStatus: 'inactive'
  };
  
  const v2Data = activeVersion === 'v2' ? useMenuIntegrationV2(MENU_CONFIG) : {
    restaurant: null,
    menu: [],
    loading: false,
    error: null,
    cart: [],
    addToCart: () => {},
    removeFromCart: () => {},
    updateQuantity: () => {},
    clearCart: () => {},
    total: 0,
    connectionStatus: 'inactive'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#28a745';
      case 'connecting': return '#ffc107';
      case 'error': return '#dc3545';
      case 'inactive': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected': return '✅';
      case 'connecting': return '🔄';
      case 'error': return '❌';
      case 'inactive': return '⏸️';
      default: return '❓';
    }
  };

  const currentData = activeVersion === 'v1' ? v1Data : v2Data;

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <h1>🔬 Comparación de SDKs</h1>
      
      {/* Selector de versión */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '2rem',
        background: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px'
      }}>
        <button
          onClick={() => setActiveVersion('v1')}
          style={{
            background: activeVersion === 'v1' ? '#007bff' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          SDK Original (v1)
        </button>
        <button
          onClick={() => setActiveVersion('v2')}
          style={{
            background: activeVersion === 'v2' ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          SDK Mejorado (v2)
        </button>
      </div>

      {/* Panel de estado */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        {/* Estado SDK v1 */}
        <div style={{
          background: 'white',
          border: `2px solid ${v1Data.error ? '#dc3545' : v1Data.loading ? '#ffc107' : '#28a745'}`,
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h3>📊 SDK Original (v1)</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Estado:</strong> {v1Data.loading ? '🔄 Cargando' : v1Data.error ? '❌ Error' : '✅ Conectado'}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Restaurante:</strong> {v1Data.restaurant ? v1Data.restaurant.name : 'No cargado'}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Categorías:</strong> {v1Data.menu ? v1Data.menu.length : 0}
          </div>
          {v1Data.error && (
            <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <strong>Error:</strong> {v1Data.error}
            </div>
          )}
          <button 
            onClick={v1Data.retry}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            🔄 Reintentar v1
          </button>
        </div>

        {/* Estado SDK v2 */}
        <div style={{
          background: 'white',
          border: `2px solid ${getStatusColor(v2Data.connectionStatus)}`,
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <h3>🚀 SDK Mejorado (v2)</h3>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Estado:</strong> {getStatusIcon(v2Data.connectionStatus)} {v2Data.connectionStatus || 'unknown'}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Restaurante:</strong> {v2Data.restaurant ? v2Data.restaurant.name : 'No cargado'}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Categorías:</strong> {v2Data.menu ? v2Data.menu.length : 0}
          </div>
          {v2Data.error && (
            <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              <strong>Error:</strong> {v2Data.error}
            </div>
          )}
          <button 
            onClick={v2Data.retry}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            🔄 Reintentar v2
          </button>
        </div>
      </div>

      {/* Características comparativas */}
      <div style={{ 
        marginBottom: '2rem',
        background: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px'
      }}>
        <h3>🔍 Características de cada SDK</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h4>SDK Original (v1)</h4>
            <ul style={{ marginLeft: '1rem' }}>
              <li>✅ Funcionalidad básica</li>
              <li>❌ Sin manejo de reintentos</li>
              <li>❌ Múltiples instancias de Firebase</li>
              <li>❌ Manejo básico de errores</li>
              <li>❌ Sin estado de conexión</li>
            </ul>
          </div>
          <div>
            <h4>SDK Mejorado (v2)</h4>
            <ul style={{ marginLeft: '1rem' }}>
              <li>✅ Funcionalidad completa</li>
              <li>✅ Sistema de reintentos automáticos</li>
              <li>✅ Singleton de Firebase (mejor performance)</li>
              <li>✅ Manejo avanzado de errores</li>
              <li>✅ Estado de conexión en tiempo real</li>
              <li>✅ Reconexión automática</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Mostrar el menú de la versión activa */}
      <div style={{ 
        background: 'white', 
        borderRadius: '8px', 
        padding: '1rem',
        border: `2px solid ${activeVersion === 'v1' ? '#007bff' : '#28a745'}`
      }}>
        <h2>
          {activeVersion === 'v1' ? '📊 Menú SDK Original' : '🚀 Menú SDK Mejorado'}
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div>
            {currentData.restaurant && (
              <div style={{ marginBottom: '1rem' }}>
                <h1>🍽️ {currentData.restaurant.name}</h1>
                {currentData.restaurant.description && (
                  <p>{currentData.restaurant.description}</p>
                )}
              </div>
            )}
            
            <MenuDisplay
              menu={currentData.menu}
              loading={currentData.loading}
              error={currentData.error}
              onAddToCart={currentData.addToCart}
              onRetry={currentData.retry}
            />
          </div>
          
          <div>
            <Cart
              cart={currentData.cart}
              onUpdateQuantity={currentData.updateQuantity}
              onRemove={currentData.removeFromCart}
              onClear={currentData.clearCart}
              total={currentData.total}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SDKComparison;
