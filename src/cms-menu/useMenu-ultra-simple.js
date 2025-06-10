import { useState, useEffect, useRef } from 'react';
import { createUltraSimpleMenuSDK } from './menu-sdk-ultra-simple.js';

export function useUltraSimpleMenu(config) {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const sdkRef = useRef(null);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMenuData = async (attempt = 0) => {
    if (!mountedRef.current || loadingRef.current) return;

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Loading menu with ultra simple SDK (attempt ${attempt + 1})`);
      
      // Crear SDK ultra simple
      sdkRef.current = createUltraSimpleMenuSDK(config.firebaseConfig, config.restaurantId);
      
      // Cargar datos secuencialmente para evitar conflictos
      console.log('📊 Step 1: Loading restaurant info...');
      const restaurantInfo = await sdkRef.current.getRestaurantInfo();
      
      if (!mountedRef.current) return;
      setRestaurant(restaurantInfo);
      
      console.log('📊 Step 2: Loading menu...');
      const menuData = await sdkRef.current.getFullMenu();
      
      if (!mountedRef.current) return;
      
      setMenu(menuData);
      setRetryCount(0);
      
      console.log('✅ Ultra simple menu data loaded successfully');
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('❌ Error loading menu data (ultra simple):', err);
      setError(err.message);
      
      // Reintentos más agresivos para el SDK ultra simple
      if (attempt < 2) {
        const retryDelay = 1000 * (attempt + 1); // 1s, 2s
        console.log(`🔄 Ultra simple retry in ${retryDelay}ms... (attempt ${attempt + 2}/3)`);
        setRetryCount(attempt + 1);
        
        setTimeout(() => {
          if (mountedRef.current) {
            loadMenuData(attempt + 1);
          }
        }, retryDelay);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  };

  useEffect(() => {
    if (config?.firebaseConfig && config?.restaurantId) {
      loadMenuData();
    }
  }, [config?.firebaseConfig?.projectId, config?.restaurantId]);

  const retry = () => {
    if (!loadingRef.current) {
      loadMenuData();
    }
  };

  return { 
    restaurant, 
    menu, 
    loading, 
    error, 
    retry,
    retryCount 
  };
}

export function useUltraSimpleCart() {
  const [cart, setCart] = useState([]);

  const addToCart = (item, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity }];
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
    setCart([]);
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

export function useUltraSimpleMenuIntegration(config) {
  const menuData = useUltraSimpleMenu(config);
  const cartData = useUltraSimpleCart();
  
  return {
    ...menuData,
    ...cartData
  };
}
