// Global Firebase Manager Singleton
// This ensures only ONE Firebase instance across all SDKs

import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, enableNetwork, disableNetwork, terminate } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

class GlobalFirebaseManager {
  constructor() {
    this.app = null;
    this.db = null;
    this.storage = null;
    this.isInitialized = false;
    this.isNetworkEnabled = false;
    this.initializationPromise = null;
    this.referenceCount = 0;
  }

  async initialize(firebaseConfig) {
    // If already initializing, wait for that to complete
    if (this.initializationPromise) {
      console.log('⏳ Firebase initialization already in progress, waiting...');
      try {
        await this.initializationPromise;
        this.referenceCount++;
        console.log(`📊 Firebase references: ${this.referenceCount}`);
        return { app: this.app, db: this.db, storage: this.storage };
      } catch (error) {
        console.error('⚠️ Previous initialization failed, retrying...');
        this.initializationPromise = null;
        return this.initialize(firebaseConfig);
      }
    }

    // If already initialized, just increment reference count
    if (this.isInitialized && this.app && this.db) {
      this.referenceCount++;
      console.log(`📊 Firebase references: ${this.referenceCount}`);
      return { app: this.app, db: this.db, storage: this.storage };
    }

    // Start initialization
    this.initializationPromise = this._doInitialize(firebaseConfig);
    try {
      const result = await this.initializationPromise;
      this.referenceCount++;
      console.log(`📊 Firebase references: ${this.referenceCount}`);
      return result;
    } catch (error) {
      this.initializationPromise = null;
      throw error;
    }
  }

  async _doInitialize(firebaseConfig) {
    try {
      console.log('🚀 Global Firebase Manager: Initializing...');

      // Clean up any existing apps to avoid conflicts
      await this._cleanupExistingApps();

      // Add small delay to prevent rapid Firebase operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Create new Firebase app with unique name
      const appName = `restaurant-cms-global-${Date.now()}`;
      this.app = initializeApp(firebaseConfig, appName);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);

      // Enable network connection
      await this._ensureNetworkConnection();

      this.isInitialized = true;
      console.log('✅ Global Firebase Manager: Initialized successfully');

      return { app: this.app, db: this.db, storage: this.storage };
    } catch (error) {
      console.error('❌ Global Firebase Manager: Initialization failed:', error);
      this.isInitialized = false;
      this.initializationPromise = null;
      throw error;
    }
  }

  async _cleanupExistingApps() {
    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        console.log(`🧹 Cleaning up ${existingApps.length} existing Firebase apps`);
        await Promise.all(existingApps.map(app => deleteApp(app)));
      }
    } catch (error) {
      console.warn('⚠️ Warning during app cleanup:', error.message);
    }
  }

  async _ensureNetworkConnection() {
    if (this.isNetworkEnabled || !this.db) return;

    try {
      console.log('🌐 Enabling Firebase network...');
      await enableNetwork(this.db);
      this.isNetworkEnabled = true;
      console.log('✅ Firebase network enabled');
    } catch (error) {
      // Network might already be enabled or in transition
      if (error.code === 'failed-precondition' || 
          error.message.includes('already enabled') ||
          error.message.includes('INTERNAL ASSERTION FAILED')) {
        console.log('ℹ️ Network already enabled or in transition');
        this.isNetworkEnabled = true;
      } else {
        console.warn('⚠️ Network enable warning:', error.message);
        // Assume network is available anyway
        this.isNetworkEnabled = true;
      }
    }
  }

  async release() {
    this.referenceCount--;
    console.log(`📊 Firebase references: ${this.referenceCount}`);
    
    // Only cleanup when no more references
    if (this.referenceCount <= 0) {
      await this._cleanup();
    }
  }

  async _cleanup() {
    try {
      console.log('🧹 Global Firebase Manager: Cleaning up...');

      // Prevent new operations during cleanup
      this.isInitialized = false;

      if (this.db) {
        try {
          console.log('📴 Disabling Firestore network...');
          await disableNetwork(this.db);
        } catch (error) {
          if (!error.message.includes('failed-precondition')) {
            console.warn('⚠️ Network disable warning:', error.message);
          }
        }

        try {
          console.log('🔚 Terminating Firestore...');
          await terminate(this.db);
        } catch (error) {
          if (!error.message.includes('failed-precondition')) {
            console.warn('⚠️ Database termination warning:', error.message);
          }
        }
      }

      if (this.app) {
        try {
          console.log('🗑️ Deleting Firebase app...');
          await deleteApp(this.app);
        } catch (error) {
          console.warn('⚠️ App deletion warning:', error.message);
        }
      }

      // Reset all state
      this.app = null;
      this.db = null;
      this.storage = null;
      this.isNetworkEnabled = false;
      this.initializationPromise = null;
      this.referenceCount = 0;

      console.log('✅ Global Firebase Manager: Cleanup completed');
    } catch (error) {
      console.error('❌ Global Firebase Manager: Cleanup failed:', error);
      // Force reset even if cleanup failed
      this.app = null;
      this.db = null;
      this.storage = null;
      this.isInitialized = false;
      this.isNetworkEnabled = false;
      this.initializationPromise = null;
      this.referenceCount = 0;
    }
  }

  getDatabase() {
    if (!this.isInitialized || !this.db) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.db;
  }

  getApp() {
    if (!this.isInitialized || !this.app) {
      throw new Error('Firebase not initialized. Call initialize() first.');
    }
    return this.app;
  }

  getStorage() {
    if (!this.isInitialized || !this.storage) {
      throw new Error('Firebase Storage not initialized. Call initialize() first.');
    }
    return this.storage;
  }

  isReady() {
    return this.isInitialized && this.app && this.db;
  }
}

// Export singleton instance
export const globalFirebaseManager = new GlobalFirebaseManager();
export default globalFirebaseManager;
