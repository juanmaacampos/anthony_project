// Firebase Storage Test - Temporary debug file
import { globalFirebaseManager } from './firebase-manager.js';
import { MENU_CONFIG } from './config.js';
import { ref, getDownloadURL, listAll } from 'firebase/storage';

export async function testFirebaseStorage() {
  try {
    console.log('🧪 Testing Firebase Storage...');
    
    // Initialize Firebase
    const { storage } = await globalFirebaseManager.initialize(MENU_CONFIG.firebaseConfig);
    
    console.log('✅ Firebase Storage initialized');
    
    // Test listing files in the root
    console.log('📁 Listing files in root...');
    const rootRef = ref(storage);
    const rootList = await listAll(rootRef);
    
    console.log('Root folders:', rootList.prefixes.map(p => p.name));
    console.log('Root files:', rootList.items.map(i => i.name));
    
    // Test listing files in restaurants folder
    if (rootList.prefixes.find(p => p.name === 'restaurants')) {
      console.log('📁 Listing files in restaurants folder...');
      const restaurantsRef = ref(storage, 'restaurants');
      const restaurantsList = await listAll(restaurantsRef);
      
      console.log('Restaurant folders:', restaurantsList.prefixes.map(p => p.name));
      console.log('Restaurant files:', restaurantsList.items.map(i => i.name));
      
      // Test specific restaurant folder
      const restaurantRef = ref(storage, `restaurants/${MENU_CONFIG.restaurantId}`);
      try {
        const restaurantList = await listAll(restaurantRef);
        console.log(`Files for restaurant ${MENU_CONFIG.restaurantId}:`, 
                   restaurantList.items.map(i => ({ name: i.name, fullPath: i.fullPath })));
        
        // Try to get download URL for first image
        if (restaurantList.items.length > 0) {
          const firstImage = restaurantList.items[0];
          console.log('🖼️ Testing download URL for:', firstImage.fullPath);
          const downloadURL = await getDownloadURL(firstImage);
          console.log('✅ Download URL obtained:', downloadURL);
        }
      } catch (error) {
        console.log('❌ Error accessing restaurant folder:', error.message);
      }
    }
    
    // Test if we can access a specific known path (you'll need to replace this)
    // Example: 'restaurants/HsuTZWhRVkT88a0WOztELGzJUhl1/menu-images/some-image.jpg'
    
  } catch (error) {
    console.error('❌ Firebase Storage test failed:', error);
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testFirebaseStorage();
}
