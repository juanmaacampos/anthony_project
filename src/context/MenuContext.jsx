import React, { createContext, useContext, useState, useEffect } from 'react';
import { createMenuSDK } from '../cms-menu/menu-sdk.js';
import { MENU_CONFIG } from '../cms-menu/config.js';

const MenuContext = createContext();

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
};

export const MenuProvider = ({ children }) => {
  const [menu, setMenu] = useState([]);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sdk, setSdk] = useState(null);

  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔥 Initializing Firebase connection...');
        
        const menuSDK = createMenuSDK(
          MENU_CONFIG.firebaseConfig,
          MENU_CONFIG.restaurantId
        );
        
        setSdk(menuSDK);
        
        // Test connection by fetching restaurant info
        const info = await menuSDK.getRestaurantInfo();
        setRestaurantInfo(info);
        setIsConnected(true);
        console.log('✅ Firebase connected successfully');
        
        // Fetch menu data
        const menuData = await menuSDK.getFullMenu();
        setMenu(menuData);
        console.log('✅ Menu data loaded:', menuData.length, 'categories');
        
      } catch (err) {
        console.error('❌ Firebase connection failed:', err);
        setError(err.message);
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFirebase();
  }, []);

  const refetchMenu = async () => {
    if (!sdk) return;
    
    try {
      setIsLoading(true);
      const menuData = await sdk.getFullMenu();
      setMenu(menuData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    if (!sdk) {
      throw new Error('Firebase SDK not initialized');
    }
    
    if (!isConnected) {
      throw new Error('No connection to Firebase');
    }
    
    try {
      console.log('🔄 Creating order with data:', orderData);
      const order = await sdk.createOrder(orderData);
      console.log('✅ Order created successfully:', order);
      return order;
    } catch (err) {
      console.error('❌ Error creating order:', err);
      throw new Error(`Failed to create order: ${err.message}`);
    }
  };

  const updateOrderStatus = async (orderId, status, paymentStatus = null) => {
    if (!sdk) {
      throw new Error('Firebase SDK not initialized');
    }
    
    if (!isConnected) {
      throw new Error('No connection to Firebase');
    }
    
    try {
      await sdk.updateOrderStatus(orderId, status, paymentStatus);
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      throw new Error(`Failed to update order status: ${err.message}`);
    }
  };

  const getOrder = async (orderId) => {
    if (!sdk) {
      throw new Error('Firebase SDK not initialized');
    }
    
    if (!isConnected) {
      throw new Error('No connection to Firebase');
    }
    
    try {
      return await sdk.getOrder(orderId);
    } catch (err) {
      console.error('❌ Error getting order:', err);
      throw new Error(`Failed to get order: ${err.message}`);
    }
  };

  const value = {
    menu,
    restaurantInfo,
    isLoading,
    error,
    isConnected,
    refetchMenu,
    sdk,
    firebaseManager: sdk?.firebaseManager,
    // Add order methods
    createOrder,
    updateOrderStatus,
    getOrder
  };

  return (
    <MenuContext.Provider value={value}>
      {children}
    </MenuContext.Provider>
  );
};
