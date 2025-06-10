import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy, enableNetwork, connectFirestoreEmulator } from 'firebase/firestore';

// Singleton mejorado para Firebase
class FirebaseManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.isInitialized = false;
    this.isNetworkEnabled = false;
  }

  async initialize(firebaseConfig) {
    if (this.isInitialized) {
      return { app: this.app, db: this.db };
    }

    try {
      // Verificar si ya existe una app
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.app = existingApps[0];
        console.log('🔄 Using existing Firebase app');
      } else {
        this.app = initializeApp(firebaseConfig, 'anthony-cms-app');
        console.log('🚀 Initialized new Firebase app');
      }

      this.db = getFirestore(this.app);
      
      // Habilitar red de forma más robusta
      await this.ensureNetworkConnection();
      
      this.isInitialized = true;
      console.log('✅ Firebase manager initialized successfully');
      
      return { app: this.app, db: this.db };
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw error;
    }
  }

  async ensureNetworkConnection() {
    if (this.isNetworkEnabled) return;
    
    try {
      await enableNetwork(this.db);
      this.isNetworkEnabled = true;
      console.log('🌐 Firebase network connection enabled');
    } catch (error) {
      // El error puede ser que la red ya esté habilitada
      if (error.code !== 'failed-precondition') {
        console.warn('⚠️ Network enable warning:', error.message);
      }
      this.isNetworkEnabled = true; // Asumir que está habilitada
    }
  }

  async withRetry(operation, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Executing operation (attempt ${attempt}/${maxRetries})`);
        const result = await operation();
        console.log(`✅ Operation successful on attempt ${attempt}`);
        return result;
      } catch (error) {
        console.error(`❌ Attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw new Error(`Operation failed after ${maxRetries} attempts: ${error.message}`);
        }
        
        // Si es un error de red, intentar reconectar
        if (error.code === 'unavailable' || error.message.includes('offline')) {
          console.log('🔌 Network issue detected, attempting to reconnect...');
          this.isNetworkEnabled = false;
          await this.ensureNetworkConnection();
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
}

// Instancia singleton
const firebaseManager = new FirebaseManager();

export class MenuSDKv2 {
  constructor(firebaseConfig, restaurantId) {
    this.firebaseConfig = firebaseConfig;
    this.restaurantId = restaurantId;
    this.app = null;
    this.db = null;
    this.isReady = false;
  }

  async initialize() {
    if (this.isReady) return;
    
    try {
      const { app, db } = await firebaseManager.initialize(this.firebaseConfig);
      this.app = app;
      this.db = db;
      this.isReady = true;
      console.log('✅ MenuSDKv2 ready');
    } catch (error) {
      console.error('❌ MenuSDKv2 initialization failed:', error);
      throw error;
    }
  }

  async getRestaurantInfo() {
    await this.initialize();
    
    return await firebaseManager.withRetry(async () => {
      console.log('🔍 Fetching restaurant info for:', this.restaurantId);
      
      const restaurantRef = doc(this.db, 'restaurants', this.restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (!restaurantDoc.exists()) {
        throw new Error(`Restaurant with ID "${this.restaurantId}" not found in database`);
      }
      
      const data = restaurantDoc.data();
      console.log('✅ Restaurant info loaded:', data.name || 'Unnamed Restaurant');
      return data;
    });
  }

  async getFullMenu() {
    await this.initialize();
    
    return await firebaseManager.withRetry(async () => {
      console.log('🍽️ Fetching full menu for restaurant:', this.restaurantId);
      
      // Obtener categorías
      const categoriesRef = collection(this.db, 'restaurants', this.restaurantId, 'menu');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      console.log('📂 Found', categoriesSnapshot.size, 'menu categories');
      
      if (categoriesSnapshot.empty) {
        console.warn('⚠️ No menu categories found for restaurant:', this.restaurantId);
        return [];
      }
      
      const menu = [];
      
      // Procesar cada categoría
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          items: []
        };
        
        try {
          // Obtener items de la categoría
          const itemsRef = collection(this.db, 'restaurants', this.restaurantId, 'menu', categoryDoc.id, 'items');
          const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
          const itemsSnapshot = await getDocs(itemsQuery);
          
          categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
            id: itemDoc.id,
            ...itemDoc.data()
          }));
          
          console.log(`📋 Category "${categoryData.name}": ${categoryData.items.length} items`);
          
          // Solo agregar categorías que tienen items
          if (categoryData.items.length > 0) {
            menu.push(categoryData);
          }
        } catch (error) {
          console.error(`❌ Error loading items for category ${categoryDoc.id}:`, error);
          // Continuar con las otras categorías
        }
      }
      
      console.log('✅ Full menu loaded successfully:', menu.length, 'categories');
      return menu;
    });
  }

  async getFeaturedItems() {
    await this.initialize();
    
    return await firebaseManager.withRetry(async () => {
      const menu = await this.getFullMenu();
      const featuredItems = [];
      
      menu.forEach(category => {
        const featured = category.items.filter(item => item.isFeatured && item.isAvailable);
        featuredItems.push(...featured.map(item => ({
          ...item,
          categoryName: category.name
        })));
      });
      
      console.log('⭐ Found', featuredItems.length, 'featured items');
      return featuredItems;
    });
  }

  // Método para verificar el estado de la conexión
  async checkConnection() {
    try {
      await this.initialize();
      const testDoc = doc(this.db, 'restaurants', this.restaurantId);
      await getDoc(testDoc);
      return { status: 'connected', message: 'Connection is working' };
    } catch (error) {
      return { 
        status: 'error', 
        message: error.message,
        code: error.code
      };
    }
  }
}

// Factory function
export function createMenuSDKv2(firebaseConfig, restaurantId) {
  return new MenuSDKv2(firebaseConfig, restaurantId);
}

// Función para limpiar y reinicializar Firebase (útil para debugging)
export function resetFirebaseConnection() {
  firebaseManager.isInitialized = false;
  firebaseManager.isNetworkEnabled = false;
  firebaseManager.app = null;
  firebaseManager.db = null;
  console.log('🔄 Firebase connection reset');
}
