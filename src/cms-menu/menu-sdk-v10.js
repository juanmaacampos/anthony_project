// CMS Menu SDK v10 - Optimized for Firebase v10.x
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { 
  getFirestore, 
  connectFirestoreEmulator,
  collection, 
  doc, 
  getDocs, 
  getDoc,
  onSnapshot,
  enableNetwork,
  disableNetwork,
  clearIndexedDbPersistence,
  terminate
} from 'firebase/firestore';
import { MENU_CONFIG } from './config.js';

class MenuSDKv10 {
  constructor() {
    this.app = null;
    this.db = null;
    this.isInitialized = false;
    this.listeners = new Set();
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.initializationPromise = null;
  }

  async initialize() {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  async _doInitialize() {
    try {
      console.log('🔧 MenuSDK v10: Initializing Firebase...');
      
      // Clean up any existing apps
      const existingApps = getApps();
      if (existingApps.length > 0) {
        console.log(`🧹 MenuSDK v10: Cleaning up ${existingApps.length} existing Firebase apps`);
        for (const app of existingApps) {
          await deleteApp(app);
        }
      }

      // Initialize Firebase
      this.app = initializeApp(MENU_CONFIG.firebaseConfig, `cms-menu-v10-${Date.now()}`);
      this.db = getFirestore(this.app);
      
      // Test connection
      await this._testConnection();
      
      this.isInitialized = true;
      this.retryAttempts = 0;
      console.log('✅ MenuSDK v10: Firebase initialized successfully');
      
      return { success: true };
    } catch (error) {
      console.error('❌ MenuSDK v10: Initialization failed:', error);
      this.isInitialized = false;
      
      if (this.retryAttempts < this.maxRetries) {
        this.retryAttempts++;
        console.log(`🔄 MenuSDK v10: Retrying initialization (${this.retryAttempts}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * this.retryAttempts));
        return this._doInitialize();
      }
      
      throw error;
    }
  }

  async _testConnection() {
    try {
      // Simple test to verify Firestore connection
      const testRef = doc(this.db, 'test', 'connection');
      await getDoc(testRef);
      console.log('🌐 MenuSDK v10: Firestore connection verified');
    } catch (error) {
      console.warn('⚠️ MenuSDK v10: Connection test failed:', error.message);
      // Don't throw error for connection test failure
    }
  }

  async getMenu() {
    try {
      await this.initialize();
      
      console.log('📋 MenuSDK v10: Fetching menu...');
      const menuRef = collection(this.db, 'restaurants', MENU_CONFIG.restaurantId, 'menu');
      const snapshot = await getDocs(menuRef);
      
      const menu = [];
      snapshot.forEach((doc) => {
        menu.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ MenuSDK v10: Menu fetched successfully (${menu.length} items)`);
      return menu;
    } catch (error) {
      console.error('❌ MenuSDK v10: Error fetching menu:', error);
      throw new Error(`Failed to fetch menu: ${error.message}`);
    }
  }

  async getCategories() {
    try {
      await this.initialize();
      
      console.log('🏷️ MenuSDK v10: Fetching categories...');
      const categoriesRef = collection(this.db, 'restaurants', MENU_CONFIG.restaurantId, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      const categories = [];
      snapshot.forEach((doc) => {
        categories.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log(`✅ MenuSDK v10: Categories fetched successfully (${categories.length} categories)`);
      return categories;
    } catch (error) {
      console.error('❌ MenuSDK v10: Error fetching categories:', error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }
  }

  subscribeToMenu(callback) {
    return this._createSubscription('menu', callback);
  }

  subscribeToCategories(callback) {
    return this._createSubscription('categories', callback);
  }

  async _createSubscription(type, callback) {
    try {
      await this.initialize();
      
      const collectionRef = collection(this.db, 'restaurants', MENU_CONFIG.restaurantId, type);
      
      const unsubscribe = onSnapshot(
        collectionRef,
        (snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            items.push({
              id: doc.id,
              ...doc.data()
            });
          });
          callback(items);
        },
        (error) => {
          console.error(`❌ MenuSDK v10: Subscription error for ${type}:`, error);
          callback(null, error);
        }
      );

      this.listeners.add(unsubscribe);
      console.log(`🔔 MenuSDK v10: Subscribed to ${type} updates`);
      
      return unsubscribe;
    } catch (error) {
      console.error(`❌ MenuSDK v10: Failed to create ${type} subscription:`, error);
      callback(null, error);
      return () => {}; // Return empty unsubscribe function
    }
  }

  async reset() {
    try {
      console.log('🔄 MenuSDK v10: Resetting SDK...');
      
      // Clear all listeners
      this.listeners.forEach(unsubscribe => {
        try {
          unsubscribe();
        } catch (error) {
          console.warn('⚠️ MenuSDK v10: Error unsubscribing listener:', error);
        }
      });
      this.listeners.clear();

      // Terminate Firestore
      if (this.db) {
        try {
          await terminate(this.db);
        } catch (error) {
          console.warn('⚠️ MenuSDK v10: Error terminating Firestore:', error);
        }
      }

      // Delete app
      if (this.app) {
        try {
          await deleteApp(this.app);
        } catch (error) {
          console.warn('⚠️ MenuSDK v10: Error deleting app:', error);
        }
      }

      // Reset state
      this.app = null;
      this.db = null;
      this.isInitialized = false;
      this.retryAttempts = 0;
      this.initializationPromise = null;
      
      console.log('✅ MenuSDK v10: Reset completed');
    } catch (error) {
      console.error('❌ MenuSDK v10: Error during reset:', error);
    }
  }

  async cleanup() {
    await this.reset();
  }

  getConnectionStatus() {
    return {
      isInitialized: this.isInitialized,
      hasApp: !!this.app,
      hasDb: !!this.db,
      retryAttempts: this.retryAttempts,
      listenersCount: this.listeners.size
    };
  }
}

// Export singleton instance
export const menuSDK = new MenuSDKv10();
export default menuSDK;
