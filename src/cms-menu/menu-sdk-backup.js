import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { globalFirebaseManager } from './firebase-manager.js';

export class MenuSDK {
  constructor(firebaseConfig, restaurantId) {
    this.firebaseConfig = firebaseConfig;
    this.restaurantId = restaurantId;
    this.app = null;
    this.db = null;
    this.initialized = false;
  }

  async _ensureInitialized() {
    if (this.initialized) return;

    try {
      const { app, db } = await globalFirebaseManager.initialize(this.firebaseConfig);
      this.app = app;
      this.db = db;
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize MenuSDK: ${error.message}`);
    }
  }

  async getRestaurantInfo() {
    try {
      await this._ensureInitialized();
      
      console.log('🔍 Fetching restaurant info for:', this.restaurantId);
      
      const restaurantRef = doc(this.db, 'restaurants', this.restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (!restaurantDoc.exists()) {
        console.error('❌ Restaurant document not found for ID:', this.restaurantId);
        throw new Error(`Restaurant not found with ID: ${this.restaurantId}`);
      }
      
      console.log('✅ Restaurant info loaded successfully');
      return restaurantDoc.data();
    } catch (error) {
      console.error('❌ Error getting restaurant info:', error);
      
      // Provide better error context
      if (error.code === 'unavailable') {
        throw new Error('Firebase service is temporarily unavailable. Please check your internet connection.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Check your Firebase security rules.');
      } else if (error.message.includes('offline')) {
        throw new Error('Firebase is in offline mode. Check your internet connection.');
      }
      
      throw error;
    }
  }

  async getFullMenu() {
    try {
      console.log('🍽️ Fetching full menu for restaurant:', this.restaurantId);
      
      // Asegurar conexión de red antes de la consulta
      await this.ensureNetworkConnection();
      
      const categoriesRef = collection(this.db, 'restaurants', this.restaurantId, 'menu');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      console.log('📂 Found', categoriesSnapshot.size, 'menu categories');
      
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
        
        console.log(`📋 Category "${categoryData.name}":`, categoryData.items.length, 'items');
        
        if (categoryData.items.length > 0) {
          menu.push(categoryData);
        }
      }
      
      console.log('✅ Full menu loaded successfully:', menu.length, 'categories');
      return menu;
    } catch (error) {
      console.error('❌ Error getting full menu:', error);
      
      // Proporcionar más contexto sobre el error
      if (error.code === 'unavailable') {
        throw new Error('Firebase service is temporarily unavailable. Please check your internet connection.');
      } else if (error.code === 'permission-denied') {
        throw new Error('Permission denied. Check your Firebase security rules.');
      } else if (error.message.includes('offline')) {
        throw new Error('Firebase is in offline mode. Check your internet connection.');
      }
      
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
