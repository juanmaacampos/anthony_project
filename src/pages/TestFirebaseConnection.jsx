import React, { useEffect, useState } from 'react';
import { useMenuIntegration } from '../cms-menu/useMenu';
import { MENU_CONFIG } from '../cms-menu/config';
import '../cms-menu/MenuComponents.css';

function TestFirebaseConnection() {
  const [connectionStatus, setConnectionStatus] = useState('Probando conexión...');
  const { restaurant, menu, loading, error, menuSDK } = useMenuIntegration(MENU_CONFIG, { enabled: true });

  useEffect(() => {
    if (loading) {
      setConnectionStatus('🔄 Conectando a Firebase...');
    } else if (error) {
      setConnectionStatus(`❌ Error: ${error}`);
    } else if (restaurant && menu) {
      setConnectionStatus('✅ Conexión exitosa!');
    } else {
      setConnectionStatus('⚠️ Datos no encontrados');
    }
  }, [loading, error, restaurant, menu]);

  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>🍽️ Prueba de Conexión CMS</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '1rem', 
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3>Estado de Conexión:</h3>
        <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{connectionStatus}</p>
      </div>

      {restaurant && (
        <div style={{ 
          background: '#d4edda', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3>✅ Información del Restaurante:</h3>
          <p><strong>Nombre:</strong> {restaurant.name}</p>
          {restaurant.description && <p><strong>Descripción:</strong> {restaurant.description}</p>}
          {restaurant.address && <p><strong>Dirección:</strong> {restaurant.address}</p>}
          {restaurant.phone && <p><strong>Teléfono:</strong> {restaurant.phone}</p>}
        </div>
      )}

      {menu && menu.length > 0 && (
        <div style={{ 
          background: '#d1ecf1', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3>✅ Menú Cargado:</h3>
          <p><strong>Categorías encontradas:</strong> {menu.length}</p>
          <ul>
            {menu.map(category => (
              <li key={category.id}>
                <strong>{category.name}</strong> - {category.items?.length || 0} platos
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          padding: '1rem', 
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3>❌ Error de Conexión:</h3>
          <p>{error}</p>
          <h4>Posibles soluciones:</h4>
          <ul>
            <li>Verifica que el UID del restaurante sea correcto</li>
            <li>Asegúrate de que el restaurante tenga platos en el CMS</li>
            <li>Revisa la configuración de Firebase</li>
            <li>Verifica las reglas de seguridad de Firestore</li>
          </ul>
        </div>
      )}

      <div style={{ 
        background: '#fff3cd', 
        padding: '1rem', 
        borderRadius: '8px'
      }}>
        <h3>📋 Configuración Actual:</h3>
        <p><strong>Proyecto Firebase:</strong> {MENU_CONFIG.firebaseConfig.projectId}</p>
        <p><strong>Restaurant ID:</strong> {MENU_CONFIG.restaurantId}</p>
        <p><strong>Auth Domain:</strong> {MENU_CONFIG.firebaseConfig.authDomain}</p>
      </div>
    </div>
  );
}

export default TestFirebaseConnection;
