import React, { useState, useEffect } from 'react';
import { MENU_CONFIG } from '../cms-menu/config';
import { createMenuSDK } from '../cms-menu/menu-sdk';

function FirebaseConnectionDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    config: 'checking',
    connection: 'checking',
    restaurant: 'checking',
    menu: 'checking'
  });
  const [details, setDetails] = useState({});

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results = {
      config: 'checking',
      connection: 'checking', 
      restaurant: 'checking',
      menu: 'checking'
    };
    const resultDetails = {};

    try {
      // 1. Verificar configuración
      console.log('🔍 Checking Firebase config...');
      if (MENU_CONFIG.firebaseConfig.apiKey && MENU_CONFIG.restaurantId) {
        results.config = 'success';
        resultDetails.config = 'Configuration is valid';
      } else {
        results.config = 'error';
        resultDetails.config = 'Missing apiKey or restaurantId';
      }
      setDiagnostics({...results});

      // 2. Verificar conexión
      console.log('🔍 Testing Firebase connection...');
      const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
      results.connection = 'success';
      resultDetails.connection = 'Firebase SDK initialized successfully';
      setDiagnostics({...results});

      // 3. Verificar información del restaurante
      console.log('🔍 Testing restaurant data...');
      try {
        const restaurant = await menuSDK.getRestaurantInfo();
        results.restaurant = 'success';
        resultDetails.restaurant = `Restaurant found: ${restaurant.name || 'Unnamed'}`;
      } catch (error) {
        results.restaurant = 'error';
        resultDetails.restaurant = `Restaurant error: ${error.message}`;
      }
      setDiagnostics({...results});

      // 4. Verificar menú
      console.log('🔍 Testing menu data...');
      try {
        const menu = await menuSDK.getFullMenu();
        results.menu = 'success';
        resultDetails.menu = `Menu loaded: ${menu.length} categories found`;
      } catch (error) {
        results.menu = 'error';
        resultDetails.menu = `Menu error: ${error.message}`;
      }

    } catch (error) {
      console.error('Diagnostic error:', error);
      results.connection = 'error';
      resultDetails.connection = `Connection failed: ${error.message}`;
    }

    setDiagnostics(results);
    setDetails(resultDetails);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'checking': return '#ffc107';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h2>🔧 Firebase Connection Diagnostic</h2>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '1.5rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3>Current Configuration:</h3>
        <ul style={{ marginLeft: '1rem' }}>
          <li><strong>Project ID:</strong> {MENU_CONFIG.firebaseConfig.projectId}</li>
          <li><strong>Restaurant ID:</strong> {MENU_CONFIG.restaurantId}</li>
          <li><strong>Auth Domain:</strong> {MENU_CONFIG.firebaseConfig.authDomain}</li>
        </ul>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {Object.entries(diagnostics).map(([test, status]) => (
          <div 
            key={test}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1rem',
              background: 'white',
              border: `2px solid ${getStatusColor(status)}`,
              borderRadius: '8px',
              fontSize: '1.1rem'
            }}
          >
            <span style={{ marginRight: '1rem', fontSize: '1.5rem' }}>
              {getStatusIcon(status)}
            </span>
            <div style={{ flex: 1 }}>
              <strong style={{ textTransform: 'capitalize' }}>{test} Test:</strong>
              <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {details[test] || 'Running...'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button 
          onClick={runDiagnostics}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🔄 Run Diagnostics Again
        </button>
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#e9ecef', 
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h4>Troubleshooting Tips:</h4>
        <ul>
          <li>If <strong>Config</strong> fails: Check your Firebase configuration in config.js</li>
          <li>If <strong>Connection</strong> fails: Check your internet connection and Firebase project status</li>
          <li>If <strong>Restaurant</strong> fails: Verify the restaurant UID is correct</li>
          <li>If <strong>Menu</strong> fails: Check if the restaurant has menu data in Firestore</li>
        </ul>
      </div>
    </div>
  );
}

export default FirebaseConnectionDiagnostic;
