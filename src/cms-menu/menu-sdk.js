import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { globalFirebaseManager } from './firebase-manager.js';

export class MenuSDK {
  constructor(firebaseConfig, restaurantId) {
    this.firebaseConfig = firebaseConfig;
    this.restaurantId = restaurantId;
    this.app = null;
    this.db = null;
    this.storage = null;
    this.initialized = false;
  }

  async _ensureInitialized() {
    if (this.initialized) return;

    try {
      const { app, db, storage } = await globalFirebaseManager.initialize(this.firebaseConfig);
      this.app = app;
      this.db = db;
      this.storage = storage;
      this.initialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize MenuSDK: ${error.message}`);
    }
  }

  async _resolveImageUrl(imagePath) {
    console.log('🔍 Attempting to resolve image path:', imagePath);
    
    if (!imagePath) {
      console.log('❌ No image path provided');
      return null;
    }
    
    try {
      // Si ya es una URL completa, devolverla tal como está
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        console.log('✅ Already a complete URL:', imagePath);
        return imagePath;
      }
      
      await this._ensureInitialized();
      
      if (!this.storage) {
        console.error('❌ Firebase Storage not initialized');
        return null;
      }
      
      console.log('🔧 Creating Firebase Storage reference for path:', imagePath);
      
      // Crear referencia al archivo en Firebase Storage
      const imageRef = ref(this.storage, imagePath);
      console.log('📁 Storage reference created:', imageRef.fullPath);
      
      const downloadURL = await getDownloadURL(imageRef);
      
      console.log('🖼️ Image URL resolved successfully:', { 
        originalPath: imagePath, 
        resolvedURL: downloadURL,
        bucket: imageRef.bucket,
        fullPath: imageRef.fullPath
      });
      
      return downloadURL;
    } catch (error) {
      console.error('❌ Failed to resolve image URL:', {
        path: imagePath,
        error: error.message,
        code: error.code,
        fullError: error
      });
      return null;
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
      } else if (error.message.includes('INTERNAL ASSERTION FAILED')) {
        throw new Error('Firebase internal error. This is usually temporary - please try again in a moment.');
      }
      
      throw error;
    }
  }

  async getFullMenu() {
    try {
      await this._ensureInitialized();
      
      console.log('🍽️ Fetching full menu for restaurant:', this.restaurantId);
      
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
        
        // Resolver URLs de imágenes para cada item
        console.log(`🔄 Processing ${itemsSnapshot.docs.length} items for category "${categoryData.name}"`);
        
        const itemsWithImages = await Promise.all(
          itemsSnapshot.docs.map(async (itemDoc) => {
            const itemData = {
              id: itemDoc.id,
              ...itemDoc.data()
            };
            
            console.log(`📄 Processing item "${itemData.name}":`, {
              hasImage: !!itemData.image,
              imagePath: itemData.image,
              itemId: itemData.id
            });
            
            // Resolver URL de imagen si existe
            if (itemData.image) {
              console.log(`🖼️ Resolving image for "${itemData.name}": ${itemData.image}`);
              const resolvedImageUrl = await this._resolveImageUrl(itemData.image);
              
              if (resolvedImageUrl) {
                itemData.image = resolvedImageUrl;
                console.log(`✅ Image resolved for "${itemData.name}": ${resolvedImageUrl}`);
              } else {
                console.warn(`⚠️ Failed to resolve image for "${itemData.name}": ${itemData.image}`);
                itemData.image = null; // Set to null if resolution fails
              }
            } else {
              console.log(`ℹ️ No image for item "${itemData.name}"`);
            }
            
            return itemData;
          })
        );
        
        categoryData.items = itemsWithImages;
        
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
      } else if (error.message.includes('INTERNAL ASSERTION FAILED')) {
        throw new Error('Firebase internal error. This is usually temporary - please try again in a moment.');
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
