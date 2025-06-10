# 🤖 Prompt para Copilot Agent - Integración Automática CMS Menu

Copia y pega este prompt en Copilot Agent para que integre automáticamente tu CMS en cualquier proyecto React + Vite:

---

## PROMPT PARA COPILOT AGENT:

```
Ayúdame a integrar un CMS de menús de restaurantes en mi proyecto React + Vite. Necesito que hagas la integración completa automáticamente.

CONTEXTO:
- Tengo un CMS de menús que funciona con Firebase
- Necesito mostrar el menú en mi proyecto React + Vite frontend
- Quiero componentes listos para usar con carrito de compras
- El CMS usa Firestore para almacenar restaurantes, categorías y platos

ARCHIVOS A CREAR/INSTALAR:
1. Instala Firebase: `npm install firebase`
2. Crea la carpeta `src/cms-menu/` 
3. Crea estos archivos en esa carpeta:

ARCHIVO: src/cms-menu/menu-sdk.js
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';

export class MenuSDK {
  constructor(firebaseConfig, restaurantId) {
    this.app = initializeApp(firebaseConfig, `menu-sdk-${Date.now()}`);
    this.db = getFirestore(this.app);
    this.restaurantId = restaurantId;
  }

  async getRestaurantInfo() {
    try {
      const restaurantRef = doc(this.db, 'restaurants', this.restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (!restaurantDoc.exists()) {
        throw new Error('Restaurant not found');
      }
      
      return restaurantDoc.data();
    } catch (error) {
      console.error('Error getting restaurant info:', error);
      throw error;
    }
  }

  async getFullMenu() {
    try {
      const categoriesRef = collection(this.db, 'restaurants', this.restaurantId, 'menu');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const menu = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          items: []
        };
        
        const itemsRef = collection(this.db, 'restaurants', this.restaurantId, 'menu', categoryDoc.id, 'items');
        const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
          id: itemDoc.id,
          ...itemDoc.data()
        }));
        
        if (categoryData.items.length > 0) {
          menu.push(categoryData);
        }
      }
      
      return menu;
    } catch (error) {
      console.error('Error getting full menu:', error);
      throw error;
    }
  }

  async getFeaturedItems() {
    try {
      const menu = await this.getFullMenu();
      const featuredItems = [];
      
      menu.forEach(category => {
        const featured = category.items.filter(item => item.isFeatured && item.isAvailable);
        featuredItems.push(...featured.map(item => ({
          ...item,
          categoryName: category.name
        })));
      });
      
      return featuredItems;
    } catch (error) {
      console.error('Error getting featured items:', error);
      throw error;
    }
  }
}

export function createMenuSDK(firebaseConfig, restaurantId) {
  return new MenuSDK(firebaseConfig, restaurantId);
}
```

ARCHIVO: src/cms-menu/useMenu.js
```javascript
import { useState, useEffect } from 'react';

export function useMenu(menuSDK) {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [restaurantData, menuData] = await Promise.all([
          menuSDK.getRestaurantInfo(),
          menuSDK.getFullMenu()
        ]);
        
        setRestaurant(restaurantData);
        setMenu(menuData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (menuSDK) {
      loadData();
    }
  }, [menuSDK]);

  return { restaurant, menu, loading, error };
}

export function useCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (item, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal
  };
}

export function useMenuIntegration(config) {
  const menuSDK = createMenuSDK(config.firebaseConfig, config.restaurantId);
  const menuData = useMenu(menuSDK);
  const cartData = useCart();

  return {
    ...menuData,
    ...cartData,
    menuSDK
  };
}
```

ARCHIVO: src/cms-menu/config.js
```javascript
export const MENU_CONFIG = {
  firebaseConfig: {
    // ⚠️ REEMPLAZAR con tu configuración de Firebase
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
  },
  
  // ⚠️ REEMPLAZAR con el UID real del restaurante
  // Para obtenerlo: ve al CMS, haz login, F12 → Consola → firebase.auth().currentUser.uid
  restaurantId: "YOUR_RESTAURANT_UID_HERE"
};
```

ARCHIVO: src/cms-menu/MenuComponents.jsx
```javascript
import React from 'react';
import { useMenu, useCart } from './useMenu.js';
import './MenuComponents.css';

export function MenuDisplay({ 
  menu, 
  onAddToCart, 
  loading, 
  error,
  showImages = true,
  showPrices = true,
  showDescription = true 
}) {
  if (loading) return <div className="menu-loading">🍽️ Cargando menú...</div>;
  if (error) return <div className="menu-error">❌ Error: {error}</div>;
  if (!menu || menu.length === 0) return <div className="menu-empty">📋 No hay platos disponibles</div>;

  return (
    <div className="menu-display">
      {menu.map(category => (
        <div key={category.id} className="menu-category">
          <h2 className="category-title">{category.name}</h2>
          <div className="menu-items">
            {category.items.map(item => (
              <MenuItem
                key={item.id}
                item={item}
                onAddToCart={onAddToCart}
                showImage={showImages}
                showPrice={showPrices}
                showDescription={showDescription}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MenuItem({ item, onAddToCart, showImage = true, showPrice = true, showDescription = true }) {
  return (
    <div className="menu-item">
      {showImage && (
        item.imageUrl ? 
          <img src={item.imageUrl} alt={item.name} className="item-image" /> :
          <div className="item-placeholder">🍽️</div>
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
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}

export function Cart({ cart, onUpdateQuantity, onRemove, onClear, total }) {
  if (cart.length === 0) {
    return <div className="cart-empty">🛒 Tu carrito está vacío</div>;
  }

  return (
    <div className="cart">
      <div className="cart-header">
        <h3>Carrito ({cart.length})</h3>
        <button onClick={onClear} className="clear-button">Limpiar</button>
      </div>
      
      <div className="cart-items">
        {cart.map(item => (
          <div key={item.id} className="cart-item">
            <span className="cart-item-name">{item.name}</span>
            <div className="cart-item-controls">
              <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
              <span>{item.quantity}</span>
              <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
              <button onClick={() => onRemove(item.id)} className="remove-btn">✕</button>
            </div>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      
      <div className="cart-total">
        <strong>Total: ${total.toFixed(2)}</strong>
      </div>
    </div>
  );
}

export function MenuWithCart({ menuSDK }) {
  const { restaurant, menu, loading, error } = useMenu(menuSDK);
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  return (
    <div className="menu-with-cart">
      <div className="menu-section">
        {restaurant && <h1>🍽️ {restaurant.name}</h1>}
        <MenuDisplay menu={menu} onAddToCart={addToCart} loading={loading} error={error} />
      </div>
      
      <div className="cart-section">
        <Cart 
          cart={cart} 
          onUpdateQuantity={updateQuantity} 
          onRemove={removeFromCart} 
          onClear={clearCart} 
          total={cartTotal} 
        />
      </div>
    </div>
  );
}
```

ARCHIVO: src/cms-menu/MenuComponents.css
```css
.menu-display { max-width: 1200px; margin: 0 auto; padding: 20px; }
.menu-category { margin-bottom: 40px; }
.category-title { font-size: 1.8rem; color: #333; margin-bottom: 20px; border-bottom: 2px solid #ff6b35; padding-bottom: 10px; }
.menu-items { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
.menu-item { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; transition: transform 0.2s; }
.menu-item:hover { transform: translateY(-4px); }
.item-image { width: 100%; height: 200px; object-fit: cover; }
.item-placeholder { width: 100%; height: 200px; background: #e9ecef; display: flex; align-items: center; justify-content: center; font-size: 3rem; }
.item-content { padding: 20px; }
.item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.item-name { font-size: 1.3rem; margin: 0; color: #333; }
.item-price { font-size: 1.4rem; font-weight: bold; color: #ff6b35; }
.item-description { color: #666; margin-bottom: 15px; }
.item-tags { margin-bottom: 15px; }
.tag { padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; margin-right: 8px; }
.tag.featured { background: rgba(255, 193, 7, 0.1); color: #ffc107; }
.tag.unavailable { background: rgba(220, 53, 69, 0.1); color: #dc3545; }
.add-button { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; width: 100%; }
.add-button:hover { background: #218838; }
.add-button:disabled { background: #ccc; cursor: not-allowed; }
.cart { background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.cart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.cart-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #eee; }
.cart-item-controls { display: flex; align-items: center; gap: 8px; }
.cart-item-controls button { background: #007bff; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; }
.remove-btn { background: #dc3545 !important; }
.cart-total { margin-top: 15px; padding-top: 15px; border-top: 2px solid #ff6b35; font-size: 1.2rem; }
.menu-loading, .menu-error, .menu-empty, .cart-empty { text-align: center; padding: 40px; font-size: 1.2rem; }
.menu-with-cart { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
@media (max-width: 768px) { .menu-with-cart { grid-template-columns: 1fr; } }
```

EJEMPLO DE USO - Crea también un archivo de ejemplo:
ARCHIVO: src/pages/MenuPage.jsx
```javascript
import React from 'react';
import { useMenuIntegration, MenuDisplay, Cart } from '../cms-menu/MenuComponents';
import { MENU_CONFIG } from '../cms-menu/config';
import '../cms-menu/MenuComponents.css';

function MenuPage() {
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
    cartTotal 
  } = useMenuIntegration(MENU_CONFIG);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', padding: '20px' }}>
      <div>
        {restaurant && <h1>🍽️ {restaurant.name}</h1>}
        <MenuDisplay 
          menu={menu} 
          onAddToCart={addToCart} 
          loading={loading} 
          error={error} 
        />
      </div>
      
      <div>
        <Cart 
          cart={cart} 
          onUpdateQuantity={updateQuantity} 
          onRemove={removeFromCart} 
          onClear={clearCart} 
          total={cartTotal} 
        />
      </div>
    </div>
  );
}

export default MenuPage;
```

PASOS FINALES:
1. Actualiza src/cms-menu/config.js con tu configuración real de Firebase
2. Obtén el UID del restaurante (desde el CMS: firebase.auth().currentUser.uid)
3. Reemplaza "YOUR_RESTAURANT_UID_HERE" con ese UID
4. Importa y usa MenuPage en tu App.jsx o donde necesites

RESULTADO:
- Menú completo con categorías y platos
- Carrito de compras funcional
- Componentes reutilizables
- Estilos incluidos
- Conexión automática con Firebase
- Todo responsive y listo para usar

¿Puedes hacer toda esta integración automáticamente?
```

---

## Instrucciones para usar el prompt:

1. **Copia el prompt completo** (desde "Ayúdame a integrar..." hasta "¿Puedes hacer...")
2. **Abre Copilot Agent** en tu proyecto React + Vite
3. **Pega el prompt** y ejecuta
4. **Copilot creará todos los archivos automáticamente**
5. **Solo necesitas configurar 2 valores** en `config.js`:
   - Tu configuración de Firebase
   - El UID del restaurante

¡Listo! Copilot hará toda la integración por ti. 🚀
