import React from 'react';
import { useStableMenuIntegration } from '../cms-menu/useMenu-stable';
import { MenuDisplay, Cart } from '../cms-menu/MenuComponents';
import { MENU_CONFIG } from '../cms-menu/config';
import '../cms-menu/MenuComponents.css';

function StableMenuPage() {
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
    forceReset,
    retryCount
  } = useStableMenuIntegration(MENU_CONFIG);

  return (
    <div className="stable-menu-page">
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #28a745, #20c997)', 
        color: 'white', 
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1>🛡️ Menú CMS - Versión Estable</h1>
        <p>SDK optimizado para resolver errores internos de Firestore</p>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          fontSize: '0.9rem'
        }}>
          <strong>🔧 Características:</strong><br/>
          • Manejo singleton de Firebase para evitar conflictos<br/>
          • Timeouts configurables para evitar cuelgues<br/>
          • Limpieza automática de conexiones<br/>
          • Reintentos inteligentes con backoff exponencial
        </div>
      </div>

      {/* Control Panel */}
      {(error || retryCount > 0) && (
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px',
          margin: '0 20px 20px',
          border: '1px solid #dee2e6'
        }}>
          <h4>🔧 Panel de Control</h4>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
              🔄 Reintentar Normal
            </button>
            <button 
              onClick={forceReset}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔥 Reset Completo Firebase
            </button>
          </div>
          {retryCount > 0 && (
            <div style={{ marginTop: '0.5rem', color: '#666' }}>
              <small>Reintentos automáticos: {retryCount}/3</small>
            </div>
          )}
        </div>
      )}

      {/* Menu and Cart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', padding: '0 20px' }}>
        <div>
          {restaurant && (
            <div style={{ marginBottom: '20px' }}>
              <h2>🍽️ {restaurant.name}</h2>
              {restaurant.description && <p>{restaurant.description}</p>}
            </div>
          )}
          
          {/* Custom error display for stable version */}
          {error ? (
            <div style={{
              background: 'rgba(220, 53, 69, 0.1)',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
              <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>Error al cargar el menú</h3>
              <p style={{ color: '#666', marginBottom: '1rem' }}>{error}</p>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                <button 
                  onClick={retry}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Reintentar
                </button>
                <button 
                  onClick={forceReset}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  🔥 Reset Firebase
                </button>
              </div>
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: '#e9ecef', 
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}>
                <h4>💡 Posibles soluciones:</h4>
                <ul style={{ textAlign: 'left', margin: '0.5rem 0' }}>
                  <li>Verifica tu conexión a internet</li>
                  <li>Revisa que el UID del restaurante sea correcto</li>
                  <li>Confirma que Firebase esté configurado correctamente</li>
                  <li>Si el error persiste, usa el "Reset Firebase"</li>
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
          
          {/* Status Info */}
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            <h4>📊 Estado de Conexión</h4>
            <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
              <li>Firebase: {loading ? '🔄 Conectando...' : error ? '❌ Error' : '✅ Conectado'}</li>
              <li>Restaurante: {restaurant ? '✅ Cargado' : '⏳ Pendiente'}</li>
              <li>Menú: {menu.length > 0 ? `✅ ${menu.length} categorías` : '⏳ Pendiente'}</li>
              <li>SDK: 🛡️ Estable v1.0</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StableMenuPage;
