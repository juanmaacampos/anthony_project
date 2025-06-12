import { useState, useEffect, useRef } from 'react';
import { createMenuSDK } from './menu-sdk.js';
import { menuSDKManager } from './menu-sdk-singleton.js';

export function useMenu(menuSDK, options = { enabled: true }) {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(options.enabled);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const loadingRef = useRef(false);

  const loadMenuData = async (retryAttempt = 0) => {
    // No cargar si no está habilitado
    if (!options.enabled) {
      setLoading(false);
      return;
    }

    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      console.log('⏸️ Load already in progress, skipping...');
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Loading menu data (attempt ${retryAttempt + 1}) - SDK:`, menuSDK?.restaurantId);
      
      // Add small delay to prevent rapid Firebase operations
      if (retryAttempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Cargar información del restaurante y menú en paralelo
      const [restaurantInfo, menuData] = await Promise.all([
        menuSDK.getRestaurantInfo(),
        menuSDK.getFullMenu()
      ]);
      
      setRestaurant(restaurantInfo);
      setMenu(menuData);
      setRetryCount(0); // Reset retry count on success
      
      console.log('✅ Menu data loaded successfully');
    } catch (err) {
      console.error('❌ Error loading menu data:', err);
      setError(err.message);
      
      // Auto-retry logic for connection issues
      if (retryAttempt < 2 && (
        err.message.includes('offline') || 
        err.message.includes('unavailable') ||
        err.message.includes('connection') ||
        err.message.includes('INTERNAL ASSERTION FAILED')
      )) {
        console.log(`🔄 Retrying in 3 seconds... (attempt ${retryAttempt + 2}/3)`);
        setRetryCount(retryAttempt + 1);
        
        setTimeout(() => {
          loadingRef.current = false;
          loadMenuData(retryAttempt + 1);
        }, 3000);
        return;
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!menuSDK || !options.enabled) {
      setLoading(false);
      return;
    }
    
    // Cleanup function
    const cleanup = () => {
      loadingRef.current = false;
    };

    loadMenuData();
    
    return cleanup;
  }, [menuSDK, options.enabled]);

  // Manual retry function
  const retry = () => {
    if (!loadingRef.current && options.enabled) {
      loadMenuData();
    }
  };

  return { restaurant, menu, loading, error, retry, retryCount };
}

export function useCart() {
  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('restaurant-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.warn('Error loading cart from localStorage:', error);
      return [];
    }
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('restaurant-cart', JSON.stringify(cart));
    } catch (error) {
      console.warn('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  const addToCart = (item, quantity = 1) => {
    console.log('🛒 Adding to cart:', item, 'quantity:', quantity);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        const updatedCart = prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
        console.log('📝 Updated existing item in cart:', updatedCart);
        return updatedCart;
      } else {
        const newCart = [...prevCart, { ...item, quantity }];
        console.log('➕ Added new item to cart:', newCart);
        return newCart;
      }
    });
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    console.log('🗑️ Clearing cart');
    setCart([]);
    localStorage.removeItem('restaurant-cart');
  };

  const getTotal = () => {
    return cart.reduce((total, item) => {
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    total: getTotal(),
    itemCount: getItemCount()
  };
}

export function useMenuIntegration(config, options = { enabled: true }) {
  const menuSDK = menuSDKManager.getInstance(config.firebaseConfig, config.restaurantId);
  const menuData = useMenu(menuSDK, options);
  const cartData = useCart();
  
  return {
    ...menuData,
    ...cartData,
    menuSDK,
    firebaseManager: menuSDK?.firebaseManager || null
  };
}
