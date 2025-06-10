// Firebase v10 Test Page - Comprehensive testing of the CMS Menu system
import React, { useState, useEffect } from 'react';
import { useMenu, useCart } from '../cms-menu/useMenu-v10.js';
import { MenuDisplay, MenuItem, Cart, MenuWithCart } from '../cms-menu/MenuComponents.jsx';

const FirebaseV10TestPage = () => {
  const [activeView, setActiveView] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [testStatus, setTestStatus] = useState({});
  
  const { 
    menu, 
    categories, 
    loading, 
    error, 
    connectionStatus, 
    retry, 
    reset 
  } = useMenu();
  
  const cart = useCart();

  // Test Firebase v10 integration
  useEffect(() => {
    const runTests = () => {
      setTestStatus({
        firebaseVersion: 'v10.14.1',
        timestamp: new Date().toLocaleString(),
        connectionStatus,
        menuItems: menu.length,
        categoriesCount: categories.length,
        cartItems: cart.itemCount,
        hasErrors: !!error
      });
    };

    runTests();
  }, [menu, categories, cart.itemCount, error, connectionStatus]);

  const filteredMenu = selectedCategory === 'all' 
    ? menu 
    : menu.filter(item => item.category === selectedCategory);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleViewChange = (view) => {
    setActiveView(view);
  };

  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      marginBottom: '30px',
      textAlign: 'center'
    },
    title: {
      fontSize: '2.5rem',
      marginBottom: '10px',
      color: '#333'
    },
    subtitle: {
      fontSize: '1.1rem',
      color: '#666',
      marginBottom: '20px'
    },
    statusCard: {
      backgroundColor: '#f8f9fa',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '30px'
    },
    statusTitle: {
      fontSize: '1.3rem',
      marginBottom: '15px',
      color: '#495057',
      borderBottom: '2px solid #007bff',
      paddingBottom: '5px'
    },
    statusGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px'
    },
    statusItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 12px',
      backgroundColor: '#fff',
      border: '1px solid #e9ecef',
      borderRadius: '4px'
    },
    statusLabel: {
      fontWeight: '600',
      color: '#495057'
    },
    statusValue: {
      color: '#007bff'
    },
    controls: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#fff',
      border: '1px solid #dee2e6',
      borderRadius: '8px'
    },
    button: {
      padding: '10px 20px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.2s'
    },
    primaryButton: {
      backgroundColor: '#007bff',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#6c757d',
      color: 'white'
    },
    warningButton: {
      backgroundColor: '#ffc107',
      color: '#212529'
    },
    dangerButton: {
      backgroundColor: '#dc3545',
      color: 'white'
    },
    viewControls: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px'
    },
    activeButton: {
      backgroundColor: '#0056b3',
      transform: 'scale(1.05)'
    },
    categorySelect: {
      padding: '8px 12px',
      border: '1px solid #ced4da',
      borderRadius: '4px',
      fontSize: '14px'
    },
    errorMessage: {
      backgroundColor: '#f8d7da',
      color: '#721c24',
      padding: '15px',
      borderRadius: '5px',
      marginBottom: '20px',
      border: '1px solid #f5c6cb'
    },
    loadingSpinner: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '200px',
      fontSize: '18px',
      color: '#666'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🔥 Firebase v10 CMS Menu Test</h1>
        <p style={styles.subtitle}>
          Testing the complete CMS menu integration with Firebase v10.14.1
        </p>
      </div>

      {/* Status Dashboard */}
      <div style={styles.statusCard}>
        <h2 style={styles.statusTitle}>📊 System Status</h2>
        <div style={styles.statusGrid}>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Firebase Version:</span>
            <span style={styles.statusValue}>{testStatus.firebaseVersion}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Last Update:</span>
            <span style={styles.statusValue}>{testStatus.timestamp}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Connection:</span>
            <span style={{...styles.statusValue, color: connectionStatus.isInitialized ? '#28a745' : '#dc3545'}}>
              {connectionStatus.isInitialized ? '✅ Connected' : '❌ Disconnected'}
            </span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Menu Items:</span>
            <span style={styles.statusValue}>{testStatus.menuItems}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Categories:</span>
            <span style={styles.statusValue}>{testStatus.categoriesCount}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Cart Items:</span>
            <span style={styles.statusValue}>{testStatus.cartItems}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Retry Attempts:</span>
            <span style={styles.statusValue}>{connectionStatus.retryAttempts || 0}</span>
          </div>
          <div style={styles.statusItem}>
            <span style={styles.statusLabel}>Active Listeners:</span>
            <span style={styles.statusValue}>{connectionStatus.listenersCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div style={styles.controls}>
        <button 
          style={{...styles.button, ...styles.primaryButton}}
          onClick={retry}
          disabled={loading}
        >
          🔄 Retry Connection
        </button>
        
        <button 
          style={{...styles.button, ...styles.warningButton}}
          onClick={reset}
          disabled={loading}
        >
          🔧 Reset SDK
        </button>
        
        <button 
          style={{...styles.button, ...styles.dangerButton}}
          onClick={cart.clearCart}
          disabled={cart.itemCount === 0}
        >
          🗑️ Clear Cart ({cart.itemCount})
        </button>
        
        <button 
          style={{...styles.button, ...styles.secondaryButton}}
          onClick={cart.toggleCart}
        >
          🛒 {cart.isOpen ? 'Close' : 'Open'} Cart (${cart.getTotalPrice().toFixed(2)})
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorMessage}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={styles.loadingSpinner}>
          ⏳ Loading Firebase v10 data...
        </div>
      )}

      {/* Menu Display */}
      {!loading && !error && (
        <>
          {/* View Controls */}
          <div style={styles.viewControls}>
            <button 
              style={{
                ...styles.button, 
                ...styles.primaryButton,
                ...(activeView === 'grid' ? styles.activeButton : {})
              }}
              onClick={() => handleViewChange('grid')}
            >
              📋 Grid View
            </button>
            <button 
              style={{
                ...styles.button, 
                ...styles.primaryButton,
                ...(activeView === 'list' ? styles.activeButton : {})
              }}
              onClick={() => handleViewChange('list')}
            >
              📄 List View
            </button>
            <button 
              style={{
                ...styles.button, 
                ...styles.primaryButton,
                ...(activeView === 'card' ? styles.activeButton : {})
              }}
              onClick={() => handleViewChange('card')}
            >
              🃏 Card View
            </button>
            
            <select 
              style={styles.categorySelect}
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Menu Components */}
          <MenuWithCart 
            menu={filteredMenu}
            restaurant={restaurant}
            className={`firebase-v10-test-${activeView}`}
          />
        </>
      )}
    </div>
  );
};

export default FirebaseV10TestPage;
