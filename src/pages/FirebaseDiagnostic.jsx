import React, { useState, useEffect } from 'react';
import { MENU_CONFIG } from '../cms-menu/config';
import { createMenuSDK } from '../cms-menu/menu-sdk';

function FirebaseDiagnostic() {
  const [diagnostics, setDiagnostics] = useState({
    loading: true,
    config: null,
    connection: null,
    restaurant: null,
    menu: null,
    errors: []
  });

  const runDiagnostics = async () => {
    const results = {
      loading: false,
      config: null,
      connection: null,
      restaurant: null,
      menu: null,
      errors: []
    };

    try {
      // 1. Verificar configuración
      console.log('🔧 Checking Firebase configuration...');
      results.config = {
        status: 'success',
        projectId: MENU_CONFIG.firebaseConfig.projectId,
        restaurantId: MENU_CONFIG.restaurantId,
        hasApiKey: !!MENU_CONFIG.firebaseConfig.apiKey,
        hasAuthDomain: !!MENU_CONFIG.firebaseConfig.authDomain
      };

      // 2. Crear SDK y probar conexión
      console.log('🔌 Testing Firebase connection...');
      const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
      results.connection = { status: 'success', message: 'SDK created successfully' };

      // 3. Probar obtener información del restaurante
      console.log('🏪 Testing restaurant data...');
      try {
        const restaurantInfo = await menuSDK.getRestaurantInfo();
        results.restaurant = { 
          status: 'success', 
          data: restaurantInfo,
          message: `Restaurant found: ${restaurantInfo.name || 'Unnamed'}`
        };
      } catch (error) {
        results.restaurant = { 
          status: 'error', 
          error: error.message,
          code: error.code
        };
        results.errors.push(`Restaurant: ${error.message}`);
      }

      // 4. Probar obtener menú
      console.log('🍽️ Testing menu data...');
      try {
        const menuData = await menuSDK.getFullMenu();
        results.menu = { 
          status: 'success', 
          categoriesCount: menuData.length,
          totalItems: menuData.reduce((total, cat) => total + cat.items.length, 0),
          message: `Menu loaded: ${menuData.length} categories`
        };
      } catch (error) {
        results.menu = { 
          status: 'error', 
          error: error.message,
          code: error.code
        };
        results.errors.push(`Menu: ${error.message}`);
      }

    } catch (error) {
      results.connection = { 
        status: 'error', 
        error: error.message 
      };
      results.errors.push(`Connection: ${error.message}`);
    }

    setDiagnostics(results);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const StatusIndicator = ({ status }) => {
    const styles = {
      success: { color: '#28a745', fontWeight: 'bold' },
      error: { color: '#dc3545', fontWeight: 'bold' },
      loading: { color: '#ffc107', fontWeight: 'bold' }
    };
    
    const icons = {
      success: '✅',
      error: '❌',
      loading: '⏳'
    };

    return (
      <span style={styles[status]}>
        {icons[status]} {status.toUpperCase()}
      </span>
    );
  };

  const DiagnosticCard = ({ title, data, icon }) => (
    <div style={{
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon} {title}
      </h4>
      
      {data ? (
        <>
          <div style={{ marginBottom: '0.5rem' }}>
            <StatusIndicator status={data.status} />
          </div>
          
          {data.status === 'success' && (
            <div style={{ fontSize: '0.9rem', color: '#28a745' }}>
              {data.message && <p>✓ {data.message}</p>}
              {data.data && (
                <details style={{ marginTop: '0.5rem' }}>
                  <summary style={{ cursor: 'pointer' }}>Ver datos</summary>
                  <pre style={{ 
                    background: '#f8f9fa', 
                    padding: '0.5rem', 
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(data.data, null, 2)}
                  </pre>
                </details>
              )}
              {data.categoriesCount !== undefined && (
                <p>📂 {data.categoriesCount} categorías, {data.totalItems} items total</p>
              )}
            </div>
          )}
          
          {data.status === 'error' && (
            <div style={{ fontSize: '0.9rem', color: '#dc3545' }}>
              <p><strong>Error:</strong> {data.error}</p>
              {data.code && <p><strong>Código:</strong> {data.code}</p>}
            </div>
          )}
        </>
      ) : (
        <StatusIndicator status="loading" />
      )}
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'linear-gradient(135deg, #007bff, #0056b3)',
        color: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <h1>🔧 Firebase Diagnostic Tool</h1>
        <p>Herramienta para diagnosticar problemas de conectividad con Firebase</p>
        
        <button
          onClick={runDiagnostics}
          disabled={diagnostics.loading}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: diagnostics.loading ? 'not-allowed' : 'pointer',
            marginTop: '1rem'
          }}
        >
          {diagnostics.loading ? '⏳ Ejecutando...' : '🔄 Ejecutar Diagnóstico'}
        </button>
      </div>

      {/* Error Summary */}
      {diagnostics.errors.length > 0 && (
        <div style={{
          background: '#f8d7da',
          color: '#721c24',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '1px solid #f5c6cb'
        }}>
          <h3>⚠️ Problemas Detectados:</h3>
          <ul>
            {diagnostics.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Diagnostic Results */}
      <DiagnosticCard
        title="Configuración Firebase"
        icon="⚙️"
        data={diagnostics.config}
      />

      <DiagnosticCard
        title="Conexión Firebase"
        icon="🔌"
        data={diagnostics.connection}
      />

      <DiagnosticCard
        title="Información del Restaurante"
        icon="🏪"
        data={diagnostics.restaurant}
      />

      <DiagnosticCard
        title="Datos del Menú"
        icon="🍽️"
        data={diagnostics.menu}
      />

      {/* Troubleshooting Tips */}
      <div style={{
        background: '#d1ecf1',
        color: '#0c5460',
        padding: '1rem',
        borderRadius: '8px',
        marginTop: '2rem',
        border: '1px solid #bee5eb'
      }}>
        <h3>💡 Consejos para Solucionar Problemas:</h3>
        <ul>
          <li><strong>Error "offline":</strong> Verifica tu conexión a internet</li>
          <li><strong>Error "permission-denied":</strong> Revisa las reglas de seguridad de Firestore</li>
          <li><strong>Error "not found":</strong> Verifica que el UID del restaurante sea correcto</li>
          <li><strong>Error "unavailable":</strong> El servicio de Firebase está temporalmente no disponible</li>
        </ul>
        
        <h4>🔧 Acciones Recomendadas:</h4>
        <ol>
          <li>Verifica que tu proyecto Firebase tenga Firestore habilitado</li>
          <li>Asegúrate de que las reglas de Firestore permitan lectura pública</li>
          <li>Confirma que el UID del restaurante existe en la colección 'restaurants'</li>
          <li>Revisa que el menú tenga categorías con items</li>
        </ol>
      </div>
    </div>
  );
}

export default FirebaseDiagnostic;
