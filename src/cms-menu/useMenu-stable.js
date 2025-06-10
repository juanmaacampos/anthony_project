import { useState, useEffect, useRef } from 'react';
import { createStableMenuSDK, resetFirebaseConnection } from './menu-sdk-stable.js';

export function useStableMenu(config) {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const sdkRef = useRef(null);
  const mountedRef = useRef(true);

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (sdkRef.current) {
        sdkRef.current.cleanup();
      }
    };
  }, []);

  const loadMenuData = async (attempt = 0) => {
    if (!mountedRef.current) return;

    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔄 Loading menu data with stable SDK (attempt ${attempt + 1})`);
      
      // Limpiar SDK anterior si existe
      if (sdkRef.current) {
        await sdkRef.current.cleanup();
      }
      
      // Si es un reintento después de error, resetear completamente Firebase
      if (attempt > 0) {
        console.log('🔄 Resetting Firebase connection...');
        await resetFirebaseConnection();
        // Esperar un poco antes de reconectar
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Crear nuevo SDK
      sdkRef.current = createStableMenuSDK(config.firebaseConfig, config.restaurantId);
      
      // Cargar datos
      const [restaurantInfo, menuData] = await Promise.all([
        sdkRef.current.getRestaurantInfo(),
        sdkRef.current.getFullMenu()
      ]);
      
      if (!mountedRef.current) return;
      
      setRestaurant(restaurantInfo);
      setMenu(menuData);
      setRetryCount(0);
      
      console.log('✅ Menu data loaded successfully with stable SDK');
    } catch (err) {
      if (!mountedRef.current) return;
      
      console.error('❌ Error loading menu data:', err);
      setError(err.message);
      
      // Auto-retry logic mejorado
      if (attempt < 3) {
        const shouldRetry = 
          err.message.includes('INTERNAL ASSERTION FAILED') ||
          err.message.includes('Timeout') ||
          err.message.includes('offline') || 
          err.message.includes('unavailable') ||
          err.message.includes('connection');
          
        if (shouldRetry) {
          const retryDelay = Math.min(2000 * Math.pow(2, attempt), 8000); // Backoff exponencial
          console.log(`🔄 Retrying in ${retryDelay}ms... (attempt ${attempt + 2}/4)`);
          setRetryCount(attempt + 1);
          
          setTimeout(() => {
            if (mountedRef.current) {
              loadMenuData(attempt + 1);
            }
          }, retryDelay);
        }
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (config?.firebaseConfig && config?.restaurantId) {
      loadMenuData();
    }
  }, [config?.firebaseConfig?.projectId, config?.restaurantId]);

  const retry = () => {
    loadMenuData();
  };

  const forceReset = async () => {
    setLoading(true);
    setError(null);
    await resetFirebaseConnection();
    await new Promise(resolve => setTimeout(resolve, 2000));
    loadMenuData();
  };

  return { 
    restaurant, 
    menu, 
    loading, 
    error, 
    retry, 
    forceReset,
    retryCount 
  };
}

export function useStableCart() {
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

export function useStableMenuIntegration(config) {
  const menuData = useStableMenu(config);
  const cartData = useStableCart();
  
  return {
    ...menuData,
    ...cartData
  };
}
