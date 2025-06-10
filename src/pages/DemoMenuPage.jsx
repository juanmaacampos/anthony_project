import React, { useState } from 'react';
import { MenuDisplay, Cart } from '../cms-menu/MenuComponents';
import '../cms-menu/MenuComponents.css';

// Demo data for testing without Firebase
const DEMO_RESTAURANT = {
  name: "Anthony's Demo Restaurant",
  description: "A sample restaurant to test the CMS integration"
};

const DEMO_MENU = [
  {
    id: 'burgers',
    name: 'Hamburguesas',
    description: 'Nuestras deliciosas hamburguesas artesanales',
    order: 1,
    items: [
      {
        id: 'burger-1',
        name: 'Anthony Classic',
        description: 'Carne artesanal, queso cheddar, lechuga, tomate, cebolla caramelizada',
        price: 8.50,
        imageUrl: '/api/placeholder/300/200',
        isAvailable: true,
        isFeatured: true
      },
      {
        id: 'burger-2', 
        name: 'BBQ Bacon',
        description: 'Carne artesanal, bacon crocante, queso, salsa BBQ casera',
        price: 9.20,
        imageUrl: '/api/placeholder/300/200',
        isAvailable: true,
        isFeatured: false
      },
      {
        id: 'burger-3',
        name: 'Doble Cheese',
        description: 'Doble carne, doble queso cheddar, pickles, salsa especial',
        price: 10.80,
        imageUrl: '/api/placeholder/300/200',
        isAvailable: false,
        isFeatured: false
      }
    ]
  },
  {
    id: 'sides',
    name: 'Acompañamientos',
    description: 'Perfectos para complementar tu hamburguesa',
    order: 2,
    items: [
      {
        id: 'side-1',
        name: 'Papas Anthony',
        description: 'Papas caseras con especias secretas y salsa cheddar',
        price: 4.50,
        imageUrl: '/api/placeholder/300/200',
        isAvailable: true,
        isFeatured: true
      },
      {
        id: 'side-2',
        name: 'Aros de Cebolla',
        description: 'Crujientes aros de cebolla rebozados, salsa ranch',
        price: 3.80,
        imageUrl: '/api/placeholder/300/200',
        isAvailable: true,
        isFeatured: false
      }
    ]
  },
  {
    id: 'drinks',
    name: 'Bebidas',
    description: 'Refrescantes bebidas para acompañar',
    order: 3,
    items: [
      {
        id: 'drink-1',
        name: 'Malteada Oreo',
        description: 'Cremosa malteada con galletas Oreo y crema batida',
        price: 5.20,
        imageUrl: '/api/placeholder/300/200',
        isAvailable: true,
        isFeatured: false
      },
      {
        id: 'drink-2',
        name: 'Limonada de la Casa',
        description: 'Refrescante limonada natural con hierbas frescas',
        price: 3.50,
        imageUrl: '/api/placeholder/300/200',
        isAvailable: true,
        isFeatured: false
      }
    ]
  }
];

// Simple cart hook for demo
function useSimpleCart() {
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

function DemoMenuPage() {
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useSimpleCart();

  return (
    <div className="demo-menu-page">
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ff6b35, #f7931e)', 
        color: 'white', 
        padding: '2rem',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1>🍽️ {DEMO_RESTAURANT.name}</h1>
        <p>{DEMO_RESTAURANT.description}</p>
        <div style={{ 
          background: 'rgba(255,255,255,0.2)', 
          padding: '1rem', 
          borderRadius: '8px', 
          marginTop: '1rem',
          fontSize: '0.9rem'
        }}>
          <strong>🎯 Demo Mode</strong> - This is using sample data to demonstrate the CMS menu components.<br/>
          Configure Firebase in <code>src/cms-menu/config.js</code> to connect to your real CMS data.
        </div>
      </div>

      {/* Menu and Cart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', padding: '0 20px' }}>
        <div>
          <MenuDisplay 
            menu={DEMO_MENU} 
            onAddToCart={addToCart} 
            loading={false} 
            error={null}
            showImages={true}
            showPrices={true}
            showDescription={true}
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
          
          {/* Demo Actions */}
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#f8f9fa', 
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            <h4>🧪 Demo Actions</h4>
            <button 
              onClick={() => addToCart(DEMO_MENU[0].items[0], 2)}
              style={{ 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px', 
                marginRight: '0.5rem',
                marginBottom: '0.5rem',
                cursor: 'pointer'
              }}
            >
              Add 2 Classics
            </button>
            <br/>
            <button 
              onClick={clearCart}
              style={{ 
                background: '#dc3545', 
                color: 'white', 
                border: 'none', 
                padding: '0.5rem 1rem', 
                borderRadius: '4px', 
                cursor: 'pointer'
              }}
            >
              Clear Cart
            </button>
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
          🔧 To connect to your real CMS data, update the configuration in <br/>
          <code>src/cms-menu/config.js</code> and use <code>MenuPage.jsx</code> instead.
        </p>
      </div>
    </div>
  );
}

export default DemoMenuPage;
