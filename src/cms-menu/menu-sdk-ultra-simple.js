import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';

// SDK Ultra Simple - Solo lectura básica, sin listeners en tiempo real
class UltraSimpleMenuSDK {
  constructor(firebaseConfig, restaurantId) {
    this.firebaseConfig = firebaseConfig;
    this.restaurantId = restaurantId;
    this.app = null;
    this.db = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Limpiar cualquier app existente
      const existingApps = getApps();
      console.log('🔍 Existing Firebase apps:', existingApps.length);

      // Usar nombre único para evitar conflictos
      const appName = `ultra-simple-${Date.now()}`;
      console.log('🚀 Initializing Firebase app:', appName);
      
      this.app = initializeApp(this.firebaseConfig, appName);
      this.db = getFirestore(this.app);
      this.initialized = true;
      
      console.log('✅ Firebase ultra simple SDK initialized');
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      throw new Error(`Error al inicializar Firebase: ${error.message}`);
    }
  }

  async getRestaurantInfo() {
    try {
      await this.initialize();
      
      console.log('🔍 Fetching restaurant info (ultra simple):', this.restaurantId);
      
      const restaurantRef = doc(this.db, 'restaurants', this.restaurantId);
      
      // Usar Promise.race con timeout más corto
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout después de 5 segundos')), 5000);
      });
      
      const docSnapshot = await Promise.race([
        getDoc(restaurantRef),
        timeoutPromise
      ]);
      
      if (!docSnapshot.exists()) {
        throw new Error(`Restaurante no encontrado: ${this.restaurantId}`);
      }
      
      const data = docSnapshot.data();
      console.log('✅ Restaurant loaded:', data.name || 'Sin nombre');
      return data;
      
    } catch (error) {
      console.error('❌ Error getting restaurant:', error);
      throw new Error(`Error del restaurante: ${error.message}`);
    }
  }

  async getFullMenu() {
    try {
      await this.initialize();
      
      console.log('🍽️ Fetching menu (ultra simple):', this.restaurantId);
      
      // Cargar categorías
      const categoriesRef = collection(this.db, 'restaurants', this.restaurantId, 'menu');
      
      // Timeout para categorías
      const categoriesTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout cargando categorías después de 8 segundos')), 8000);
      });
      
      let categoriesSnapshot;
      try {
        // Intentar con ordenamiento
        const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
        categoriesSnapshot = await Promise.race([
          getDocs(categoriesQuery),
          categoriesTimeoutPromise
        ]);
      } catch (orderError) {
        console.warn('⚠️ Error con orderBy, intentando sin ordenar:', orderError.message);
        // Fallback sin ordenamiento
        categoriesSnapshot = await Promise.race([
          getDocs(categoriesRef),
          categoriesTimeoutPromise
        ]);
      }
      
      console.log('📂 Categories found:', categoriesSnapshot.size);
      
      const menu = [];
      let processedCategories = 0;
      
      // Procesar categorías una por una con delay
      for (const categoryDoc of categoriesSnapshot.docs) {
        try {
          console.log(`📋 Processing category ${processedCategories + 1}/${categoriesSnapshot.size}`);
          
          const categoryData = {
            id: categoryDoc.id,
            ...categoryDoc.data(),
            items: []
          };
          
          // Cargar items de la categoría
          const itemsRef = collection(this.db, 'restaurants', this.restaurantId, 'menu', categoryDoc.id, 'items');
          
          const itemsTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Timeout items de ${categoryData.name} después de 5 segundos`)), 5000);
          });
          
          let itemsSnapshot;
          try {
            // Intentar con ordenamiento
            const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
            itemsSnapshot = await Promise.race([
              getDocs(itemsQuery),
              itemsTimeoutPromise
            ]);
          } catch (orderError) {
            console.warn(`⚠️ Error con orderBy en items de ${categoryData.name}, intentando sin ordenar`);
            // Fallback sin ordenamiento
            itemsSnapshot = await Promise.race([
              getDocs(itemsRef),
              itemsTimeoutPromise
            ]);
          }
          
          categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
            id: itemDoc.id,
            ...itemDoc.data()
          }));
          
          console.log(`✅ Category "${categoryData.name}": ${categoryData.items.length} items`);
          
          if (categoryData.items.length > 0) {
            menu.push(categoryData);
          }
          
          processedCategories++;
          
          // Pequeña pausa entre categorías para evitar sobrecarga
          if (processedCategories < categoriesSnapshot.size) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
        } catch (categoryError) {
          console.warn(`⚠️ Error procesando categoría ${categoryDoc.id}:`, categoryError.message);
          // Continuar con las siguientes categorías
        }
      }
      
      console.log('✅ Menu loaded successfully:', menu.length, 'categories');
      return menu;
      
    } catch (error) {
      console.error('❌ Error getting menu:', error);
      throw new Error(`Error del menú: ${error.message}`);
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

export function createUltraSimpleMenuSDK(firebaseConfig, restaurantId) {
  return new UltraSimpleMenuSDK(firebaseConfig, restaurantId);
}

export default UltraSimpleMenuSDK;
