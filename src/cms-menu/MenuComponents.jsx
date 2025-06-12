import React, { useState, useCallback } from 'react';
import { useMenu, useCart } from './useMenu.js';
import './MenuComponents.css';

// Componente mejorado para manejo de imágenes con fallback - combinando ambas versiones
function ImageWithFallback({ src, alt, className, placeholder = "🍽️" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Log cuando cambia la src prop
  React.useEffect(() => {
    console.log('🖼️ ImageWithFallback received new src:', {
      src,
      alt,
      isValidUrl: isValidFirebaseUrl(src)
    });
    setLoading(true);
    setError(false);
  }, [src]);

  const handleLoad = useCallback((event) => {
    console.log('✅ Image loaded successfully:', {
      src: src,
      alt: alt,
      naturalWidth: event.target.naturalWidth,
      naturalHeight: event.target.naturalHeight
    });
    setLoading(false);
    setError(false);
  }, [src, alt]);

  const handleError = useCallback((event) => {
    console.error('❌ Image failed to load:', {
      src: src,
      alt: alt,
      error: event.type,
      naturalWidth: event.target?.naturalWidth,
      naturalHeight: event.target?.naturalHeight
    });
    setLoading(false);
    setError(true);
  }, [src, alt]);

  // Validar URL de Firebase Storage
  const isValidFirebaseUrl = (url) => {
    if (!url) return false;
    const isValid = url.includes('firebasestorage.googleapis.com') || 
           url.includes('storage.googleapis.com') ||
           url.startsWith('http://') || 
           url.startsWith('https://');
    
    console.log('🔍 URL validation:', { url, isValid });
    return isValid;
  };

  // Si no hay src, mostrar placeholder directamente
  if (!src || !isValidFirebaseUrl(src)) {
    const reason = !src ? 'no src' : 'invalid URL';
    console.log('🔄 Showing placeholder:', { src, reason });
    return <div className={`${className} item-placeholder`}>{placeholder}</div>;
  }

  // Si hubo error, mostrar placeholder
  if (error) {
    console.log('🔄 Showing placeholder due to error:', { src });
    return <div className={`${className} item-placeholder`}>{placeholder}</div>;
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      {loading && <div className="item-placeholder">🔄</div>}
      <img 
        src={src} 
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        style={{ 
          display: loading ? 'none' : 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}

export function MenuDisplay({ 
  menu, 
  loading, 
  error, 
  onAddToCart, 
  showDescription = true,
  onRetry
}) {
  if (loading) return (
    <div className="menu-loading">
      🍽️ Cargando menú...
      <div className="loading-spinner"></div>
    </div>
  );
  
  if (error) return (
    <div className="menu-error">
      <div className="error-icon">😔</div>
      <h3>Menú temporalmente no disponible</h3>
      <p>Estamos experimentando dificultades técnicas. Por favor, intenta de nuevo en unos momentos.</p>
      {onRetry && (
        <button onClick={onRetry} className="retry-button">
          🔄 Intentar de nuevo
        </button>
      )}
    </div>
  );
  
  if (!menu || menu.length === 0) return (
    <div className="menu-empty">
      🍽️ Estamos preparando nuestro menú...
      {onRetry && (
        <button onClick={onRetry} className="retry-button" style={{ marginTop: '1rem' }}>
          🔄 Actualizar
        </button>
      )}
    </div>
  );

  return (
    <div className="menu-display">
      {menu.map(category => (
        <div key={category.id} className="menu-category">
          <h3 className="category-title">{category.name}</h3>
          {category.description && showDescription && (
            <p className="category-description">{category.description}</p>
          )}
          <div className="menu-items">
            {category.items.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
                showDescription={showDescription}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MenuItem({ 
  item, 
  onAddToCart, 
  showImage = true, 
  showPrice = true, 
  showDescription = true 
}) {
  const handleAddToCart = () => {
    if (onAddToCart && item.isAvailable) {
      onAddToCart(item);
    }
  };

  return (
    <div className={`menu-item ${!item.isAvailable ? 'unavailable' : ''}`}>
      {showImage && (
        <ImageWithFallback 
          src={item.image} 
          alt={item.name} 
          className="item-image"
          placeholder="🍽️"
        />
      )}
      
      <div className="item-content">
        <div className="item-header">
          <h4 className="item-name">{item.name}</h4>
          {showPrice && <span className="item-price">${item.price}</span>}
        </div>
        
        {showDescription && item.description && (
          <p className="item-description">{item.description}</p>
        )}
        
        <div className="item-tags">
          {item.isFeatured && <span className="tag featured">⭐ Destacado</span>}
          {!item.isAvailable && <span className="tag unavailable">No disponible</span>}
        </div>
        
        <button 
          className="add-button"
          onClick={handleAddToCart}
          disabled={!item.isAvailable}
        >
          {item.isAvailable ? 'Agregar al carrito' : 'No disponible'}
        </button>
      </div>
    </div>
  );
}

export function Cart({ cart, onUpdateQuantity, onRemove, onClear, total }) {
  if (cart.length === 0) {
    return (
      <div className="cart empty">
        <h3>🛒 Carrito vacío</h3>
        <p>Agrega algunos productos deliciosos</p>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h3>🛒 Tu Pedido ({cart.length} items)</h3>
        <button className="clear-cart" onClick={onClear}>
          Limpiar
        </button>
      </div>
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <h4>{item.name}</h4>
              <p>${item.price}</p>
            </div>
            <div className="cart-item-controls">
              <button 
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                className="quantity-btn"
              >
                -
              </button>
              <span className="quantity">{item.quantity}</span>
              <button 
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="quantity-btn"
              >
                +
              </button>
              <button 
                onClick={() => onRemove(item.id)}
                className="remove-btn"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-total">
        <strong>Total: ${total.toLocaleString()}</strong>
      </div>
      
      <button className="checkout-btn">
        Proceder al Pago
      </button>
    </div>
  );
}

export function MenuWithCart({ menuSDK }) {
  const { restaurant, menu, loading, error, retry } = useMenu(menuSDK, { enabled: true });
  const { cart, addToCart, updateQuantity, removeFromCart, clearCart, total } = useCart();

  return (
    <div className="menu-with-cart">
      <div className="menu-section">
        {restaurant && (
          <div className="restaurant-header">
            <h1>{restaurant.name}</h1>
            {restaurant.description && <p>{restaurant.description}</p>}
          </div>
        )}
        
        <MenuDisplay
          menu={menu}
          loading={loading}
          error={error}
          onAddToCart={addToCart}
          onRetry={retry}
        />
      </div>
      
      <div className="cart-section">
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
}
