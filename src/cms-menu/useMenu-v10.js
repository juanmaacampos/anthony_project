// React hooks for CMS Menu - Firebase v10 compatible
import { useState, useEffect, useCallback, useRef } from 'react';
import { menuSDK } from './menu-sdk-v10.js';

export function useMenu() {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({});
  const unsubscribeRefs = useRef([]);

  const updateConnectionStatus = useCallback(() => {
    setConnectionStatus(menuSDK.getConnectionStatus());
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      updateConnectionStatus();

      console.log('🔄 useMenu v10: Loading menu data...');
      
      const [menuData, categoriesData] = await Promise.all([
        menuSDK.getMenu(),
        menuSDK.getCategories()
      ]);

      setMenu(menuData);
      setCategories(categoriesData);
      updateConnectionStatus();
      
      console.log('✅ useMenu v10: Data loaded successfully');
    } catch (err) {
      console.error('❌ useMenu v10: Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      updateConnectionStatus();
    }
  }, [updateConnectionStatus]);

  const setupSubscriptions = useCallback(() => {
    console.log('🔔 useMenu v10: Setting up real-time subscriptions...');
    
    // Clear existing subscriptions
    unsubscribeRefs.current.forEach(unsubscribe => {
      try {
        unsubscribe();
      } catch (error) {
        console.warn('⚠️ useMenu v10: Error unsubscribing:', error);
      }
    });
    unsubscribeRefs.current = [];

    // Subscribe to menu changes
    const menuUnsubscribe = menuSDK.subscribeToMenu((menuData, error) => {
      if (error) {
        console.error('❌ useMenu v10: Menu subscription error:', error);
        setError(error.message);
      } else if (menuData) {
        console.log('📋 useMenu v10: Menu updated via subscription');
        setMenu(menuData);
        setError(null);
      }
      updateConnectionStatus();
    });

    // Subscribe to categories changes
    const categoriesUnsubscribe = menuSDK.subscribeToCategories((categoriesData, error) => {
      if (error) {
        console.error('❌ useMenu v10: Categories subscription error:', error);
        setError(error.message);
      } else if (categoriesData) {
        console.log('🏷️ useMenu v10: Categories updated via subscription');
        setCategories(categoriesData);
        setError(null);
      }
      updateConnectionStatus();
    });

    unsubscribeRefs.current = [menuUnsubscribe, categoriesUnsubscribe];
  }, [updateConnectionStatus]);

  const reset = useCallback(async () => {
    try {
      console.log('🔄 useMenu v10: Resetting hook...');
      setLoading(true);
      setError(null);
      
      // Clear subscriptions
      unsubscribeRefs.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('⚠️ useMenu v10: Error unsubscribing during reset:', error);
        }
      });
      unsubscribeRefs.current = [];
      
      // Reset SDK
      await menuSDK.reset();
      
      // Reset state
      setMenu([]);
      setCategories([]);
      updateConnectionStatus();
      
      console.log('✅ useMenu v10: Hook reset completed');
    } catch (error) {
      console.error('❌ useMenu v10: Error during reset:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [updateConnectionStatus]);

  useEffect(() => {
    let isMounted = true;

    const initializeHook = async () => {
      if (!isMounted) return;
      
      try {
        await loadData();
        if (isMounted) {
          setupSubscriptions();
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ useMenu v10: Initialization error:', error);
          setError(error.message);
          setLoading(false);
        }
      }
    };

    initializeHook();

    return () => {
      isMounted = false;
      console.log('🧹 useMenu v10: Cleaning up...');
      
      unsubscribeRefs.current.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('⚠️ useMenu v10: Error unsubscribing during cleanup:', error);
        }
      });
      unsubscribeRefs.current = [];
    };
  }, [loadData, setupSubscriptions]);

  return {
    menu,
    categories,
    loading,
    error,
    connectionStatus,
    retry: loadData,
    reset,
    reload: loadData
  };
}

export function useCart() {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((item, quantity = 1) => {
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
    
    console.log(`🛒 useCart v10: Added ${quantity}x ${item.name || item.title} to cart`);
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== itemId);
      console.log(`🗑️ useCart v10: Removed item ${itemId} from cart`);
      return newCart;
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      )
    );
    
    console.log(`📊 useCart v10: Updated item ${itemId} quantity to ${quantity}`);
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    console.log('🧹 useCart v10: Cart cleared');
  }, []);

  const toggleCart = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const getTotalPrice = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cart]);

  const getTotalItems = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  return {
    cart,
    isOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleCart,
    getTotalPrice,
    getTotalItems,
    itemCount: getTotalItems()
  };
}
