/**
 * Helper para migrar de restaurants a businesses
 * Facilita la transición manteniendo compatibilidad con código existente
 */

import { createMenuSDK } from './menu-sdk.js';
import { useMenu } from './useMenu.js';

/**
 * Factory function que crea SDK con compatibilidad hacia atrás
 * Acepta tanto restaurantId como businessId
 */
export function createCompatibleMenuSDK(firebaseConfig, restaurantIdOrBusinessId) {
  // El SDK internamente usa businessId, pero acepta restaurantId para compatibilidad
  return createMenuSDK(firebaseConfig, restaurantIdOrBusinessId);
}

/**
 * Wrapper class que mantiene la API anterior pero usa el nuevo sistema
 * @deprecated Use MenuSDK directly with businesses
 */
export class RestaurantMenuSDK {
  constructor(firebaseConfig, restaurantId) {
    console.warn('RestaurantMenuSDK is deprecated. Use MenuSDK with businessId instead.');
    this.sdk = createMenuSDK(firebaseConfig, restaurantId);
  }

  // Métodos que redirigen al nuevo SDK
  async getRestaurantInfo() {
    return this.sdk.getBusinessInfo();
  }

  async getFullMenu() {
    return this.sdk.getFullMenu();
  }

  async getFeaturedItems() {
    return this.sdk.getFeaturedItems();
  }

  async getCategory(categoryId) {
    return this.sdk.getCategory(categoryId);
  }

  async searchItems(searchTerm) {
    return this.sdk.searchItems(searchTerm);
  }
}

/**
 * Hook de migración que funciona con el código existente
 * @deprecated Use useMenu or useMenuWithTerminology instead
 */
export function useRestaurantMenu(menuSDK) {
  console.warn('useRestaurantMenu is deprecated. Use useMenu instead.');
  
  // Re-export del hook nuevo manteniendo la misma API
  return useMenu(menuSDK);
}

// Función helper para detectar si necesita migración
export function needsMigration(config) {
  // Si el config tiene restaurantId en lugar de businessId
  return config.restaurantId && !config.businessId;
}

// Función para migrar configuración automáticamente
export function migrateConfig(oldConfig) {
  if (oldConfig.restaurantId && !oldConfig.businessId) {
    return {
      ...oldConfig,
      businessId: oldConfig.restaurantId,
      // Mantener restaurantId para compatibilidad temporal
      restaurantId: oldConfig.restaurantId
    };
  }
  return oldConfig;
}

export default {
  createCompatibleMenuSDK,
  RestaurantMenuSDK,
  useRestaurantMenu,
  needsMigration,
  migrateConfig
};
