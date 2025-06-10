import React, { useState } from 'react';
import { useMenuIntegration } from '../cms-menu/useMenu';
import { MenuDisplay, Cart, MenuWithCart } from '../cms-menu/MenuComponents';
import { createMenuSDK } from '../cms-menu/menu-sdk';
import { MENU_CONFIG } from '../cms-menu/config';
import '../cms-menu/MenuComponents.css';

function MenuPage() {
  const [viewMode, setViewMode] = useState('integrated'); // 'integrated', 'separate', 'simple'
  
  // Full integration with hooks
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
    total 
  } = useMenuIntegration(MENU_CONFIG, { enabled: true });

  // Alternative: Direct SDK usage
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);

  const renderIntegratedView = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', padding: '20px' }}>
      <div>
        {restaurant && (
          <div style={{ marginBottom: '20px' }}>
            <h1>🍽️ {restaurant.name}</h1>
            {restaurant.description && <p>{restaurant.description}</p>}
          </div>
        )}
        <MenuDisplay 
          menu={menu} 
          onAddToCart={addToCart} 
          loading={loading} 
          error={error}
          onRetry={retry}
        />
      </div>
      
      <div>
        <Cart 
          cart={cart} 
          onUpdateQuantity={updateQuantity} 
          onRemove={removeFromCart} 
          onClear={clearCart} 
          total={total} 
        />
      </div>
    </div>
  );

  const renderSeparateView = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '40px' }}>
        {restaurant && <h1>🍽️ {restaurant.name}</h1>}
        <MenuDisplay 
          menu={menu} 
          onAddToCart={addToCart} 
          loading={loading} 
          error={error}
          onRetry={retry}
        />
      </div>
      
      <div style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Cart 
          cart={cart} 
          onUpdateQuantity={updateQuantity} 
          onRemove={removeFromCart} 
          onClear={clearCart} 
          total={total} 
        />
      </div>
    </div>
  );

  const renderSimpleView = () => (
    <div style={{ padding: '20px' }}>
      <MenuWithCart menuSDK={menuSDK} />
    </div>
  );

  return (
    <div className="menu-page">
      {/* View Mode Selector */}
      <div style={{ 
        padding: '20px', 
        background: '#f8f9fa', 
        borderBottom: '1px solid #dee2e6',
        textAlign: 'center'
      }}>
        <h2>🍽️ CMS Menu Integration Demo</h2>
        <div style={{ marginTop: '10px' }}>
          <button 
            onClick={() => setViewMode('integrated')}
            style={{
              margin: '0 5px',
              padding: '8px 16px',
              background: viewMode === 'integrated' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Integrated View
          </button>
          <button 
            onClick={() => setViewMode('separate')}
            style={{
              margin: '0 5px',
              padding: '8px 16px',
              background: viewMode === 'separate' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Separate View
          </button>
          <button 
            onClick={() => setViewMode('simple')}
            style={{
              margin: '0 5px',
              padding: '8px 16px',
              background: viewMode === 'simple' ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Simple Component
          </button>
        </div>
        <p style={{ marginTop: '10px', color: '#6c757d' }}>
          {viewMode === 'integrated' && 'Side-by-side menu and cart layout'}
          {viewMode === 'separate' && 'Menu first, then cart below'}
          {viewMode === 'simple' && 'Using the all-in-one MenuWithCart component'}
        </p>
      </div>

      {/* Content */}
      {viewMode === 'integrated' && renderIntegratedView()}
      {viewMode === 'separate' && renderSeparateView()}
      {viewMode === 'simple' && renderSimpleView()}
    </div>
  );
}

export default MenuPage;
