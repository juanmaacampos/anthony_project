import { collection, addDoc, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';

export class OrderService {
  constructor(firebaseManager, restaurantId) {
    this.firebaseManager = firebaseManager;
    this.restaurantId = restaurantId;
    
    // Validate Firebase manager on construction
    if (!firebaseManager) {
      console.warn('⚠️ OrderService created without Firebase manager');
    }
  }

  async createOrder(orderData) {
    try {
      // Check Firebase manager first
      if (!this.firebaseManager) {
        throw new Error('Firebase manager is not initialized. Please check your Firebase configuration.');
      }

      // Validate required data
      if (!orderData) {
        throw new Error('Order data is required');
      }
      
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Order must contain at least one item');
      }
      
      if (!orderData.customer || !orderData.customer.name || !orderData.customer.phone) {
        throw new Error('Customer name and phone are required');
      }
      
      if (!orderData.total || orderData.total <= 0) {
        throw new Error('Order total must be greater than 0');
      }

      console.log('🔄 Creating order with validated data:', orderData);
      
      const db = this.firebaseManager.getDatabase();
      if (!db) {
        throw new Error('Firebase database not available. Connection may be offline.');
      }
      
      const ordersCollection = collection(db, 'orders');
      
      const order = {
        restaurantId: this.restaurantId,
        items: orderData.items,
        customer: {
          name: orderData.customer.name,
          phone: orderData.customer.phone,
          email: orderData.customer.email || '',
          address: orderData.customer.address || ''
        },
        total: orderData.total,
        currency: 'ARS',
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: orderData.paymentMethod || 'mercadopago',
        mercadopagoId: null, // Se actualizará cuando se procese el pago
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        notes: orderData.notes || ''
      };

      const docRef = await addDoc(ordersCollection, order);
      console.log('✅ Order created with ID:', docRef.id);
      
      return {
        orderId: docRef.id,
        ...order
      };
    } catch (error) {
      console.error('❌ Error creating order:', error.message);
      console.error('Order data:', orderData);
      console.error('Firebase manager available:', !!this.firebaseManager);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status, paymentStatus = null) {
    try {
      const db = this.firebaseManager.getDatabase();
      const orderRef = doc(db, 'orders', orderId);
      
      const updateData = {
        status,
        updatedAt: Timestamp.now()
      };

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      await updateDoc(orderRef, updateData);
      console.log('✅ Order status updated:', orderId, status);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  async getOrder(orderId) {
    try {
      const db = this.firebaseManager.getDatabase();
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        return {
          orderId: orderSnap.id,
          ...orderSnap.data()
        };
      } else {
        throw new Error('Order not found');
      }
    } catch (error) {
      console.error('❌ Error getting order:', error);
      throw error;
    }
  }
}
