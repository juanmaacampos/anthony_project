// Menu SDK para integración con sitios externos
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, getDocs, query, orderBy } from 'firebase/firestore';

export class MenuSDK {
  constructor(firebaseConfig, businessId) {
    this.app = initializeApp(firebaseConfig, `menu-sdk-${Date.now()}`);
    this.db = getFirestore(this.app);
    this.businessId = businessId;
  }

  /**
   * Obtiene información básica del negocio
   */
  async getBusinessInfo() {
    try {
      const businessRef = doc(this.db, 'businesses', this.businessId);
      const businessDoc = await getDoc(businessRef);
      
      if (!businessDoc.exists()) {
        throw new Error('Business not found');
      }
      
      return businessDoc.data();
    } catch (error) {
      console.error('Error getting business info:', error);
      throw error;
    }
  }

  /**
   * Obtiene información básica del restaurante (alias para compatibilidad)
   * @deprecated Use getBusinessInfo() instead
   */
  async getRestaurantInfo() {
    return this.getBusinessInfo();
  }

  /**
   * Obtiene el menú completo organizizado por categorías
   */
  async getFullMenu() {
    try {
      const categoriesRef = collection(this.db, 'businesses', this.businessId, 'menu');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      const menu = [];
      
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          items: []
        };
        
        // Obtener items de esta categoría
        const itemsRef = collection(this.db, 'businesses', this.businessId, 'menu', categoryDoc.id, 'items');
        const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
          id: itemDoc.id,
          ...itemDoc.data()
        }));
        
        menu.push(categoryData);
      }
      
      return menu;
    } catch (error) {
      console.error('Error getting full menu:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo los platos destacados
   */
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

  /**
   * Obtiene una categoría específica con sus items
   */
  async getCategory(categoryId) {
    try {
      const categoryRef = doc(this.db, 'businesses', this.businessId, 'menu', categoryId);
      const categoryDoc = await getDoc(categoryRef);
      
      if (!categoryDoc.exists()) {
        throw new Error('Category not found');
      }
      
      const categoryData = {
        id: categoryDoc.id,
        ...categoryDoc.data(),
        items: []
      };
      
      // Obtener items de esta categoría
      const itemsRef = collection(this.db, 'businesses', this.businessId, 'menu', categoryId, 'items');
      const itemsQuery = query(itemsRef, orderBy('name', 'asc'));
      const itemsSnapshot = await getDocs(itemsQuery);
      
      categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
        id: itemDoc.id,
        ...itemDoc.data()
      }));
      
      return categoryData;
    } catch (error) {
      console.error('Error getting category:', error);
      throw error;
    }
  }

  /**
   * Busca items por nombre o descripción
   */
  async searchItems(searchTerm) {
    try {
      const menu = await this.getFullMenu();
      const allItems = [];
      
      menu.forEach(category => {
        category.items.forEach(item => {
          allItems.push({
            ...item,
            categoryName: category.name,
            categoryId: category.id
          });
        });
      });
      
      const searchTermLower = searchTerm.toLowerCase();
      return allItems.filter(item => 
        item.name.toLowerCase().includes(searchTermLower) ||
        (item.description && item.description.toLowerCase().includes(searchTermLower))
      );
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  }
}

/**
 * Función helper para crear una instancia del SDK
 */
export function createMenuSDK(firebaseConfig, businessId) {
  return new MenuSDK(firebaseConfig, businessId);
}

export default MenuSDK;
