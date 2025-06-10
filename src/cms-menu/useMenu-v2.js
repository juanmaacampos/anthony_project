import { useState, useEffect, useCallback } from 'react';
import { createMenuSDKv2 } from './menu-sdk-v2';

export function useMenuV2(config) {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [menuSDK, setMenuSDK] = useState(null);

  // Initialize SDK
  useEffect(() => {
    if (!config) return;
    
    const sdk = createMenuSDKv2(config.firebaseConfig, config.restaurantId);
    setMenuSDK(sdk);
  }, [config]);

  const loadMenuData = useCallback(async () => {
    if (!menuSDK) return;

    setLoading(true);
    setError(null);
    setConnectionStatus('connecting');

    try {
      console.log('🚀 Starting menu data load with SDK v2...');

      // Verificar conexión primero
      const connectionCheck = await menuSDK.checkConnection();
      setConnectionStatus(connectionCheck.status);

      if (connectionCheck.status === 'error') {
        throw new Error(`Connection failed: ${connectionCheck.message}`);
      }

      // Cargar datos en paralelo
      const [restaurantInfo, menuData] = await Promise.all([
        menuSDK.getRestaurantInfo(),
        menuSDK.getFullMenu()
      ]);

      setRestaurant(restaurantInfo);
      setMenu(menuData);
      setConnectionStatus('connected');
      
      console.log('✅ Menu data loaded successfully with SDK v2');
      
    } catch (err) {
      console.error('❌ Error loading menu data:', err);
      setError(err.message);
      setConnectionStatus('error');
    } finally {
      setLoading(false);
    }
  }, [menuSDK]);

  // Load data when SDK is ready
  useEffect(() => {
    loadMenuData();
  }, [loadMenuData]);

  const retry = useCallback(() => {
    console.log('🔄 Manual retry triggered');
    loadMenuData();
  }, [loadMenuData]);

  return {
    restaurant,
    menu,
    loading,
    error,
    connectionStatus,
    retry,
    menuSDK
  };
}

// Hook para carrito (sin cambios)
export function useCart() {
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

// Hook integrado v2
export function useMenuIntegrationV2(config) {
  const menuData = useMenuV2(config);
  const cartData = useCart();
  
  return {
    ...menuData,
    ...cartData
  };
}
