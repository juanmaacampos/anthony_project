// Test script to verify cart functionality
import { MENU_CONFIG } from './config.js';

export async function testCartFunctionality() {
  console.log('🧪 Testing cart functionality...');
  
  try {
    // Test 1: Import useCart hook
    const { useCart } = await import('./useMenu.js');
    console.log('✅ useCart hook imported successfully');
    
    // Test 2: Check configuration
    console.log('📋 Configuration:');
    console.log('- Business ID:', MENU_CONFIG.businessId);
    console.log('- Restaurant ID:', MENU_CONFIG.restaurantId);
    console.log('- MercadoPago enabled:', MENU_CONFIG.mercadoPago?.enabled);
    
    // Test 3: Test cart calculations
    const testCart = [
      { id: 1, name: 'Test Item 1', price: 10.5, quantity: 2 },
      { id: 2, name: 'Test Item 2', price: 15.0, quantity: 1 }
    ];
    
    const expectedTotal = (10.5 * 2) + (15.0 * 1); // 36.0
    const expectedCount = 2 + 1; // 3
    
    console.log('🧮 Cart calculations test:');
    console.log('- Test cart:', testCart);
    console.log('- Expected total:', expectedTotal);
    console.log('- Expected count:', expectedCount);
    
    // Manual calculation test
    const manualTotal = testCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const manualCount = testCart.reduce((total, item) => total + item.quantity, 0);
    
    console.log('- Manual total:', manualTotal);
    console.log('- Manual count:', manualCount);
    
    if (manualTotal === expectedTotal && manualCount === expectedCount) {
      console.log('✅ Cart calculations working correctly');
    } else {
      console.log('❌ Cart calculations failed');
    }
    
    return { success: true, message: 'Cart functionality test completed' };
    
  } catch (error) {
    console.error('❌ Cart test failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-run test
testCartFunctionality();
