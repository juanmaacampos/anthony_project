import React, { useState } from 'react';
import { useMenu, useCart } from './useMenu.js';
import './MenuComponents.css';

// Componente para navegación de categorías
export function CategoryNav({ categories, terminology = {}, className = "" }) {
  if (!categories || categories.length === 0) return null;

  return (
    <nav className={`category-nav ${className}`}>
      <h3 className="category-nav-title">
        {terminology.categoriesOfMenu || 'Categorías'}
      </h3>
      <div className="category-nav-items">
        {categories.map(category => (
          <a 
            key={category.id}
            href={`#category-${category.id}`}
            className="category-nav-item"
          >
            {category.name}
            {category.items && <span className="item-count">({category.items.length})</span>}
          </a>
        ))}
      </div>
    </nav>
  );
}

// Componente para imagen con loading y error handling mejorado
function ImageWithFallback({ src, alt, className, placeholder = "🍽️" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    console.warn(`Error al cargar imagen: ${src}`);
  };

  // Si no hay src, mostrar placeholder directamente
  if (!src) {
    return <div className={`${className} item-placeholder`}>{placeholder}</div>;
  }

  // Si hubo error, mostrar placeholder
  if (error) {
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
          objectFit: 'cover'
        }}
      />
    </div>
  );
}

// Componente principal del menú
export function MenuDisplay({ 
  menu, 
  onAddToCart, 
  loading, 
  error,
  showImages = true,
  showPrices = true,
  showDescription = true,
  terminology = {}
}) {
  if (loading) {
    return <div className="menu-loading">🍽️ Cargando {terminology.menuName || 'menú'} delicioso...</div>;
  }

  if (error) {
    return <div className="menu-error">❌ Error: {error}</div>;
  }

  if (!menu || menu.length === 0) {
    return <div className="menu-empty">📋 No hay {terminology.items || 'platos'} disponibles</div>;
  }

  return (
    <div className="menu-display">
      {menu.map(category => (
        <div key={category.id} className="menu-category">
          <h2 className="category-title">{category.name}</h2>
          {category.description && (
            <p className="category-description">{category.description}</p>
          )}
          <div className="menu-items">
            {category.items.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
                showImage={showImages}
                showPrice={showPrices}
                showDescription={showDescription}
                terminology={terminology}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente individual del item
export function MenuItem({ 
  item, 
  onAddToCart, 
  showImage = true, 
  showPrice = true, 
  showDescription = true,
  terminology = {}
}) {
  return (
    <div className="menu-item">
      {showImage && (
        <ImageWithFallback 
          src={item.imageUrl} 
          alt={item.name} 
          className="item-image"
        />
      )}
      
      <div className="item-content">
        <div className="item-header">
          <h3 className="item-name">{item.name}</h3>
          {showPrice && <span className="item-price">${item.price}</span>}
        </div>
        
        {showDescription && item.description && (
          <p className="item-description">{item.description}</p>
        )}
        
        <div className="item-tags">
          {item.isFeatured && <span className="tag featured">⭐ Destacado</span>}
          {!item.isAvailable && <span className="tag unavailable">No disponible</span>}
        </div>
        
        {onAddToCart && (
          <button 
            className="add-button"
            onClick={() => onAddToCart(item)}
            disabled={!item.isAvailable}
          >
            {terminology.addToCart || 'Agregar al carrito'}
          </button>
        )}
      </div>
    </div>
  );
}

// Componente solo para platos destacados
export function FeaturedItems({ 
  featuredItems, 
  menu,
  onAddToCart, 
  loading, 
  error,
  title,
  terminology = {}
}) {
  // Si se pasa menu, extraer destacados de ahí
  const itemsToShow = featuredItems || (menu ? 
    menu.flatMap(category => 
      category.items.filter(item => item.isFeatured && item.isAvailable)
        .map(item => ({ ...item, categoryName: category.name }))
    ) : []
  );

  const displayTitle = title || terminology.featuredProducts || "Platos Destacados";

  if (loading) {
    return <div className="menu-loading">🌟 Cargando destacados...</div>;
  }

  if (error) {
    return <div className="menu-error">❌ Error: {error}</div>;
  }

  if (!itemsToShow || itemsToShow.length === 0) {
    return <div className="menu-empty">⭐ No hay {terminology.items || 'platos'} destacados</div>;
  }

  return (
    <div className="featured-items">
      <h2 className="featured-title">{displayTitle}</h2>
      <div className="menu-items">
        {itemsToShow.map(item => (
          <MenuItem
            key={item.id}
            item={item}
            onAddToCart={onAddToCart}
            showImage={true}
            showPrice={true}
            showDescription={true}
            terminology={terminology}
          />
        ))}
      </div>
    </div>
  );
}

// Componente de carrito
export function Cart({ 
  cart, 
  onUpdateQuantity, 
  onRemove, 
  onClear,
  total,
  title = "Carrito" 
}) {
  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <h3>{title}</h3>
        <p>Tu carrito está vacío</p>
        <span className="cart-icon">🛒</span>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h3>{title} ({cart.length})</h3>
        <button onClick={onClear} className="clear-button">
          Limpiar
        </button>
      </div>
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-price">${item.price}</span>
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
                ✕
              </button>
            </div>
            <div className="cart-item-total">
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="cart-footer">
        <div className="cart-total">
          <strong>Total: ${total.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}

// Componente completo con menú y carrito integrado
export function MenuWithCart({ menuSDK, showImages = true, terminology = {} }) {
  const { restaurant, business, menu, loading, error } = useMenu(menuSDK);
  const { 
    cart, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartTotal 
  } = useCart();

  // Usar business si está disponible, sino restaurant para compatibilidad
  const businessData = business || restaurant;
  const businessType = businessData?.businessType || 'restaurant';
  const icon = businessType === 'store' ? '🏪' : '🍽️';

  return (
    <div className="menu-with-cart">
      <div className="menu-section">
        {businessData && (
          <div className="restaurant-header">
            <h1>{icon} {businessData.name}</h1>
            {businessData.description && (
              <p className="restaurant-description">{businessData.description}</p>
            )}
          </div>
        )}
        
        <MenuDisplay
          menu={menu}
          onAddToCart={addToCart}
          loading={loading}
          error={error}
          showImages={showImages}
          terminology={terminology}
        />
      </div>
      
      <div className="cart-section">
        <Cart
          cart={cart}
          onUpdateQuantity={updateQuantity}
          onRemove={removeFromCart}
          onClear={clearCart}
          total={cartTotal}
          title={terminology.orderSummary || "Carrito"}
        />
      </div>
    </div>
  );
}
