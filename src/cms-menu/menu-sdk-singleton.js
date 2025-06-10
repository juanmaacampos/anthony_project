// Menu SDK Singleton Manager
// This ensures only ONE MenuSDK instance per configuration

import { createMenuSDK } from './menu-sdk.js';

class MenuSDKManager {
  constructor() {
    this.instances = new Map();
  }

  getInstance(firebaseConfig, restaurantId) {
    const key = `${restaurantId}-${firebaseConfig.projectId}`;
    
    if (!this.instances.has(key)) {
      console.log('🏗️ Creating new MenuSDK instance for:', restaurantId);
      const sdk = createMenuSDK(firebaseConfig, restaurantId);
      this.instances.set(key, sdk);
    } else {
      console.log('♻️ Reusing existing MenuSDK instance for:', restaurantId);
    }
    
    return this.instances.get(key);
  }

  clearInstance(firebaseConfig, restaurantId) {
    const key = `${restaurantId}-${firebaseConfig.projectId}`;
    if (this.instances.has(key)) {
      console.log('🗑️ Clearing MenuSDK instance for:', restaurantId);
      this.instances.delete(key);
    }
  }

  clearAll() {
    console.log('🧹 Clearing all MenuSDK instances');
    this.instances.clear();
  }
}

// Export singleton instance
export const menuSDKManager = new MenuSDKManager();
export default menuSDKManager;
