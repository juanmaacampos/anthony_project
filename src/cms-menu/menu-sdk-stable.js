import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, terminate, clearIndexedDbPersistence } from 'firebase/firestore';
import { collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';

// Singleton para manejar una sola instancia de Firebase
class FirebaseManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.initialized = false;
  }

  async initialize(firebaseConfig) {
    try {
      // Limpiar cualquier instancia previa
      await this.cleanup();
      
      // Crear nueva instancia
      const appName = 'cms-menu-stable';
      this.app = initializeApp(firebaseConfig, appName);
      this.db = getFirestore(this.app);
      this.initialized = true;
      
      console.log('🔥 Firebase initialized successfully');
      return this.db;
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw new Error(`Error al inicializar Firebase: ${error.message}`);
    }
  }

  async cleanup() {
    try {
      if (this.db) {
        await terminate(this.db);
      }
      
      // Eliminar todas las apps existentes
      const apps = getApps();
      await Promise.all(apps.map(app => deleteApp(app)));
      
      // Limpiar IndexedDB
      try {
        await clearIndexedDbPersistence(this.db);
      } catch (e) {
        // Ignorar errores de limpieza de IndexedDB
      }
      
      this.app = null;
      this.db = null;
      this.initialized = false;
      
      console.log('🧹 Firebase cleanup completed');
    } catch (error) {
      console.warn('⚠️ Firebase cleanup warning:', error.message);
    }
  }

  getDb() {
    if (!this.initialized || !this.db) {
      throw new Error('Firebase no está inicializado. Llama a initialize() primero.');
    }
    return this.db;
  }
}

// Instancia singleton
const firebaseManager = new FirebaseManager();

export class MenuSDKStable {
  constructor(firebaseConfig, restaurantId) {
    this.firebaseConfig = firebaseConfig;
    this.restaurantId = restaurantId;
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return this.db;
    }

    try {
      this.db = await firebaseManager.initialize(this.firebaseConfig);
      this.initialized = true;
      return this.db;
    } catch (error) {
      throw new Error(`Error al inicializar SDK: ${error.message}`);
    }
  }

  async getRestaurantInfo() {
    try {
      await this.initialize();
      
      console.log('🔍 Fetching restaurant info for:', this.restaurantId);
      
      const restaurantRef = doc(this.db, 'restaurants', this.restaurantId);
      
      // Usar una estrategia de timeout para evitar cuelgues
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La consulta tardó demasiado')), 10000);
      });
      
      const docPromise = getDoc(restaurantRef);
      const restaurantDoc = await Promise.race([docPromise, timeoutPromise]);
      
      if (!restaurantDoc.exists()) {
        throw new Error(`Restaurante no encontrado con ID: ${this.restaurantId}`);
      }
      
      const data = restaurantDoc.data();
      console.log('✅ Restaurant info loaded successfully');
      return data;
    } catch (error) {
      console.error('❌ Error getting restaurant info:', error);
      
      if (error.message.includes('Timeout')) {
        throw new Error('La conexión con Firebase está tardando demasiado. Verifica tu conexión a internet.');
      }
      
      if (error.code === 'permission-denied') {
        throw new Error('Sin permisos para acceder a los datos del restaurante. Verifica las reglas de Firestore.');
      }
      
      throw new Error(`Error al cargar información del restaurante: ${error.message}`);
    }
  }

  async getFullMenu() {
    try {
      await this.initialize();
      
      console.log('🍽️ Fetching full menu for restaurant:', this.restaurantId);
      
      const categoriesRef = collection(this.db, 'restaurants', this.restaurantId, 'menu');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      
      // Timeout para la consulta de categorías
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: La consulta del menú tardó demasiado')), 15000);
      });
      
      const categoriesPromise = getDocs(categoriesQuery);
      const categoriesSnapshot = await Promise.race([categoriesPromise, timeoutPromise]);
      
      console.log('📂 Found', categoriesSnapshot.size, 'menu categories');
      
      const menu = [];
      
      // Procesar categorías secuencialmente para evitar sobrecarga
      for (const categoryDoc of categoriesSnapshot.docs) {
        try {
          const categoryData = {
            id: categoryDoc.id,
            ...categoryDoc.data(),
            items: []
          };
          
          const itemsRef = collection(this.db, 'restaurants', this.restaurantId, 'menu', categoryDoc.id, 'items');
          const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
          
          // Timeout para cada categoría de items
          const itemsTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout cargando items de categoría: ${categoryData.name}`)), 8000);
          });
          
          const itemsPromise = getDocs(itemsQuery);
          const itemsSnapshot = await Promise.race([itemsPromise, itemsTimeoutPromise]);
          
          categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
            id: itemDoc.id,
            ...itemDoc.data()
          }));
          
          console.log(`📋 Category "${categoryData.name}":`, categoryData.items.length, 'items');
          
          if (categoryData.items.length > 0) {
            menu.push(categoryData);
          }
          
          // Pequeña pausa entre categorías para evitar sobrecarga
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (categoryError) {
          console.warn(`⚠️ Error loading category ${categoryDoc.id}:`, categoryError.message);
          // Continuar con las otras categorías
        }
      }
      
      console.log('✅ Full menu loaded successfully:', menu.length, 'categories');
      return menu;
    } catch (error) {
      console.error('❌ Error getting full menu:', error);
      
      if (error.message.includes('Timeout')) {
        throw new Error('La carga del menú está tardando demasiado. Verifica tu conexión a internet.');
      }
      
      if (error.code === 'permission-denied') {
        throw new Error('Sin permisos para acceder al menú. Verifica las reglas de Firestore.');
      }
      
      throw new Error(`Error al cargar el menú: ${error.message}`);
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

  async cleanup() {
    await firebaseManager.cleanup();
    this.initialized = false;
    this.db = null;
  }
}

export function createStableMenuSDK(firebaseConfig, restaurantId) {
  return new MenuSDKStable(firebaseConfig, restaurantId);
}

// Función de utilidad para limpiar Firebase completamente
export async function resetFirebaseConnection() {
  await firebaseManager.cleanup();
  console.log('🔄 Firebase connection reset');
}
