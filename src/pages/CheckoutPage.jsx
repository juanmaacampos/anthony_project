/**
 * Example Page: How to use the CheckoutForm component
 * This demonstrates the integration of the CheckoutForm in a restaurant page
 */

import React, { useEffect } from 'react';
import CheckoutForm from '../components/CheckoutForm.jsx';

const CheckoutPage = () => {
  useEffect(() => {
    // Example: Add some sample items to localStorage for testing
    const sampleCartItems = [
      {
        name: "Pizza Margherita",
        price: 1500,
        quantity: 2
      },
      {
        name: "Coca Cola",
        price: 500,
        quantity: 1
      }
    ];
    
    const sampleTotal = 3500;

    // Only add sample data if cart is empty
    const existingCart = localStorage.getItem('cartItems');
    if (!existingCart) {
      localStorage.setItem('cartItems', JSON.stringify(sampleCartItems));
      localStorage.setItem('cartTotal', sampleTotal.toString());
      console.log('📦 Sample cart items added for testing');
    }
  }, []);

  return (
    <div className="checkout-page">
      <div className="container">
        <CheckoutForm />
      </div>
      
      <style jsx>{`
        .checkout-page {
          min-height: 100vh;
          background-color: #f5f5f5;
          padding: 20px 0;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;
