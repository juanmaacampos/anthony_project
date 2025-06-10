import React from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { MenuDisplay, FeaturedItems, Cart, MenuWithCart } from './MenuComponents.jsx';
import { useMenu, useCart, useFeaturedItems } from './useMenu.js';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';

// ========================================
// EJEMPLO 1: Página completa del restaurante
// ========================================
function RestaurantPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  return (
    <div>
      {/* Header del restaurante */}
      {restaurant && (
        <div className="restaurant-header">
          <h1>🍽️ {restaurant.name}</h1>
          {restaurant.description && (
            <p className="restaurant-description">{restaurant.description}</p>
          )}
        </div>
      )}

      {/* Layout con menú y carrito */}
      <div className="menu-with-cart">
        <div className="menu-section">
          <MenuDisplay
            menu={menu}
            onAddToCart={addToCart}
            loading={loading}
            error={error}
            showImages={true}
            showPrices={true}
            showDescription={true}
          />
        </div>
        
        <div className="cart-section">
          <Cart
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            total={cartTotal}
            title="Tu Pedido"
          />
        </div>
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 2: Solo platos destacados
// ========================================
function FeaturedPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { featuredItems, loading, error } = useFeaturedItems(menuSDK);
  const { cart, addToCart, cartTotal } = useCart();

  return (
    <div>
      <h1>⭐ Nuestros Platos Destacados</h1>
      
      <FeaturedItems
        featuredItems={featuredItems}
        onAddToCart={addToCart}
        loading={loading}
        error={error}
        title="Especialidades de la Casa"
      />

      {cart.length > 0 && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <p>Items en carrito: {cart.length} | Total: ${cartTotal.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

// ========================================
// EJEMPLO 3: Menú compacto (sin imágenes)
// ========================================
function CompactMenu() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { menu, loading, error } = useMenu(menuSDK);

  const handleAddToCart = (item) => {
    console.log('Agregado al carrito:', item);
    // Aquí puedes integrar con tu propio sistema de carrito
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Nuestro Menú</h2>
      <MenuDisplay
        menu={menu}
        onAddToCart={handleAddToCart}
        loading={loading}
        error={error}
        showImages={false}  // Sin imágenes para vista compacta
        showPrices={true}
        showDescription={false}  // Sin descripciones para vista compacta
      />
    </div>
  );
}

// ========================================
// EJEMPLO 4: Componente todo-en-uno (más simple)
// ========================================
function SimpleRestaurantMenu() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  
  return (
    <MenuWithCart 
      menuSDK={menuSDK}
      showImages={true}
    />
  );
}

// ========================================
// EJEMPLO 5: Solo mostrar menú (sin carrito)
// ========================================
function MenuOnly() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { restaurant, menu, loading, error } = useMenu(menuSDK);

  return (
    <div>
      {restaurant && <h1>{restaurant.name}</h1>}
      <MenuDisplay
        menu={menu}
        onAddToCart={null}  // Sin función de carrito
        loading={loading}
        error={error}
        showImages={true}
        showPrices={true}
        showDescription={true}
      />
    </div>
  );
}

// ========================================
// EXPORTAR TODOS LOS EJEMPLOS
// ========================================
export {
  RestaurantPage,
  FeaturedPage,
  CompactMenu,
  SimpleRestaurantMenu,
  MenuOnly
};

// Exportar por defecto el más completo
export default RestaurantPage;
