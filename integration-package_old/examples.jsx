// Ejemplos de uso del SDK de menú CMS
import React from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { MenuDisplay, MenuItem, FeaturedItems, CartComponent } from './MenuComponents.jsx';
import { useMenu, useCart } from './useMenu.js';
import { MENU_CONFIG } from './config.js';
import './MenuComponents.css';

// ========================================
// EJEMPLO 1: Página completa con menú y carrito
// ========================================
export function RestaurantPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();

  const handleAddToCart = (item) => {
    addToCart(item);
    console.log('Item agregado al carrito:', item.name);
  };

  if (loading) return <div className="menu-loading">🍽️ Cargando menú...</div>;
  if (error) return <div className="menu-error">❌ Error: {error}</div>;

  return (
    <div className="menu-with-cart">
      <div className="menu-section">
        {restaurant && (
          <div className="restaurant-header">
            <h1>{restaurant.name}</h1>
            {restaurant.description && (
              <p className="restaurant-description">{restaurant.description}</p>
            )}
          </div>
        )}
        
        <MenuDisplay
          menu={menu}
          onAddToCart={handleAddToCart}
          loading={loading}
          error={error}
          showImages={true}
          showPrices={true}
          showDescription={true}
        />
      </div>

      <div className="cart-section">
        <CartComponent
          cart={cart}
          onRemove={removeFromCart}
          onUpdateQuantity={updateQuantity}
          onClear={clearCart}
          totalPrice={getTotalPrice()}
        />
      </div>
    </div>
  );
}

// ========================================
// EJEMPLO 2: Solo platos destacados
// ========================================
export function FeaturedPage() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const [featuredItems, setFeaturedItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function loadFeatured() {
      try {
        const featured = await menuSDK.getFeaturedItems();
        setFeaturedItems(featured);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    loadFeatured();
  }, [menuSDK]);

  const handleAddToCart = (item) => {
    console.log('Agregado al carrito:', item);
    // Aquí integrarías con tu sistema de carrito
  };

  return (
    <div className="menu-display">
      <h2 className="featured-title">🌟 Platos Destacados</h2>
      <FeaturedItems
        featuredItems={featuredItems}
        onAddToCart={handleAddToCart}
        loading={loading}
        error={error}
      />
    </div>
  );
}

// ========================================
// EJEMPLO 3: Menú compacto (sin imágenes)
// ========================================
export function CompactMenu() {
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
// EJEMPLO 4: Todo-en-uno más simple
// ========================================
export function SimpleRestaurantMenu() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { menu, loading, error } = useMenu(menuSDK);

  if (loading) return <div>Cargando menú...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="menu-display">
      <h1>Nuestro Menú</h1>
      {menu.map(category => (
        <div key={category.id} className="menu-category">
          <h2>{category.name}</h2>
          <div className="menu-items">
            {category.items.map(item => (
              <div key={item.id} className="menu-item">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt={item.name} className="item-image" />
                )}
                <div className="item-content">
                  <h3>{item.name} - ${item.price}</h3>
                  {item.description && <p>{item.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========================================
// EJEMPLO 5: Solo menú sin carrito
// ========================================
export function MenuOnly() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  const { menu, loading, error } = useMenu(menuSDK);

  return (
    <MenuDisplay
      menu={menu}
      loading={loading}
      error={error}
      showImages={true}
      showPrices={true}
      showDescription={true}
      // Sin onAddToCart para no mostrar botones
    />
  );
}

// Exportar como default el ejemplo principal
export default RestaurantPage;
