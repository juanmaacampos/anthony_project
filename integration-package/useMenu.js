import React, { useState, useEffect } from 'react';

// Hook principal para usar el menú
export function useMenu(menuSDK) {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const [restaurantData, menuData] = await Promise.all([
          menuSDK.getRestaurantInfo(),
          menuSDK.getFullMenu()
        ]);
        
        setRestaurant(restaurantData);
        setMenu(menuData);
      } catch (err) {
        setError(err.message);
        console.error('Error loading menu:', err);
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

// Hook para manejar carrito
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

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount
  };
}

// Hook para solo platos destacados
export function useFeaturedItems(menuSDK) {
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadFeatured() {
      try {
        setLoading(true);
        setError(null);
        const items = await menuSDK.getFeaturedItems();
        setFeaturedItems(items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (menuSDK) {
      loadFeatured();
    }
  }, [menuSDK]);

  return { featuredItems, loading, error };
}
