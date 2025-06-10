import React, { useState, useEffect } from 'react';
import { globalFirebaseManager } from '../cms-menu/firebase-manager.js';
import { MENU_CONFIG } from '../cms-menu/config.js';

function FirebaseDebugPage() {
  const [status, setStatus] = useState('initializing');
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testFirebaseConnection = async () => {
    try {
      setStatus('connecting');
      setError(null);
      setRestaurant(null);
      setMenu([]);
      setLogs([]);

      addLog('🚀 Starting Firebase connection test...');

      // Initialize Firebase
      const { app, db } = await globalFirebaseManager.initialize(MENU_CONFIG.firebaseConfig);
      addLog('✅ Firebase initialized successfully');

      // Test basic connectivity
      const { doc, getDoc, collection, getDocs, query, orderBy } = await import('firebase/firestore');
      
      // Test 1: Get restaurant info
      addLog('🔍 Testing restaurant data fetch...');
      const restaurantRef = doc(db, 'restaurants', MENU_CONFIG.restaurantId);
      const restaurantDoc = await getDoc(restaurantRef);
      
      if (!restaurantDoc.exists()) {
        throw new Error('Restaurant not found');
      }
      
      const restaurantData = restaurantDoc.data();
      setRestaurant(restaurantData);
      addLog(`✅ Restaurant loaded: ${restaurantData.name || 'Unnamed Restaurant'}`);

      // Test 2: Get menu categories
      addLog('🍽️ Testing menu data fetch...');
      const categoriesRef = collection(db, 'restaurants', MENU_CONFIG.restaurantId, 'menu');
      const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'));
      const categoriesSnapshot = await getDocs(categoriesQuery);
      
      addLog(`📂 Found ${categoriesSnapshot.size} menu categories`);
      
      const menuData = [];
      for (const categoryDoc of categoriesSnapshot.docs) {
        const categoryData = {
          id: categoryDoc.id,
          ...categoryDoc.data(),
          items: []
        };
        
        // Get items for this category
        const itemsRef = collection(db, 'restaurants', MENU_CONFIG.restaurantId, 'menu', categoryDoc.id, 'items');
        const itemsQuery = query(itemsRef, orderBy('order', 'asc'));
        const itemsSnapshot = await getDocs(itemsQuery);
        
        categoryData.items = itemsSnapshot.docs.map(itemDoc => ({
          id: itemDoc.id,
          ...itemDoc.data()
        }));
        
        addLog(`📋 Category "${categoryData.name}": ${categoryData.items.length} items`);
        
        if (categoryData.items.length > 0) {
          menuData.push(categoryData);
        }
      }
      
      setMenu(menuData);
      setStatus('connected');
      addLog(`🎉 Test completed successfully! Loaded ${menuData.length} categories`);

    } catch (err) {
      setError(err.message);
      setStatus('error');
      addLog(`❌ Test failed: ${err.message}`);
      console.error('Firebase test error:', err);
    }
  };

  const resetConnection = async () => {
    try {
      addLog('🧹 Resetting Firebase connection...');
      await globalFirebaseManager._cleanup();
      addLog('✅ Firebase connection reset');
      setStatus('ready');
    } catch (err) {
      addLog(`⚠️ Reset warning: ${err.message}`);
    }
  };

  useEffect(() => {
    setStatus('ready');
    return () => {
      // Cleanup on unmount
      globalFirebaseManager.release().catch(err => 
        console.warn('Cleanup warning:', err.message)
      );
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return '#28a745';
      case 'connecting': return '#ffc107';
      case 'error': return '#dc3545';
      case 'ready': return '#007bff';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected': return '✅';
      case 'connecting': return '🔄';
      case 'error': return '❌';
      case 'ready': return '⚡';
      default: return '❓';
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🔧 Firebase Debug Page</h1>
      <p>This page tests a single Firebase connection to identify and fix the errors.</p>

      {/* Status */}
      <div style={{ 
        background: getStatusColor(), 
        color: 'white', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <span style={{ fontSize: '1.5rem' }}>{getStatusIcon()}</span>
        <div>
          <h3 style={{ margin: 0 }}>Status: {status.toUpperCase()}</h3>
          {error && <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{error}</p>}
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={testFirebaseConnection}
          disabled={status === 'connecting'}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: status === 'connecting' ? 'not-allowed' : 'pointer',
            opacity: status === 'connecting' ? 0.6 : 1
          }}
        >
          {status === 'connecting' ? '🔄 Testing...' : '🧪 Run Firebase Test'}
        </button>

        <button
          onClick={resetConnection}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🔄 Reset Connection
        </button>
      </div>

      {/* Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Restaurant Info */}
        <div>
          <h3>🏪 Restaurant Info</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px',
            minHeight: '100px'
          }}>
            {restaurant ? (
              <div>
                <h4>{restaurant.name || 'Unnamed Restaurant'}</h4>
                {restaurant.description && <p>{restaurant.description}</p>}
                <small>ID: {MENU_CONFIG.restaurantId}</small>
              </div>
            ) : (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                No restaurant data loaded
              </p>
            )}
          </div>
        </div>

        {/* Menu Info */}
        <div>
          <h3>🍽️ Menu Info</h3>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1rem', 
            borderRadius: '8px',
            minHeight: '100px'
          }}>
            {menu.length > 0 ? (
              <div>
                <p><strong>Categories:</strong> {menu.length}</p>
                <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                  {menu.map(category => (
                    <li key={category.id}>
                      {category.name} ({category.items.length} items)
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
                No menu data loaded
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Logs */}
      <div style={{ marginTop: '2rem' }}>
        <h3>📋 Test Logs</h3>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1rem', 
          borderRadius: '8px',
          maxHeight: '300px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.9rem'
        }}>
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '0.25rem' }}>
                {log}
              </div>
            ))
          ) : (
            <p style={{ color: '#6c757d', fontStyle: 'italic' }}>
              No logs yet. Run a test to see detailed information.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FirebaseDebugPage;
