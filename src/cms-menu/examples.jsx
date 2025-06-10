// Ejemplo de cómo usar el CMS Menu en tu proyecto

import React from 'react';
import { MenuWithCart, MenuDisplay } from './cms-menu/MenuComponents.jsx';
import { useMenuIntegration } from './cms-menu/useMenu.js';
import { MENU_CONFIG } from './cms-menu/config.js';

// EJEMPLO 1: Menu completo con carrito (más común)
export function FullMenuExample() {
  const { menuSDK } = useMenuIntegration(MENU_CONFIG);
  
  return (
    <div>
      <h1>Nuestro Restaurante</h1>
      <MenuWithCart menuSDK={menuSDK} />
    </div>
  );
}

// EJEMPLO 2: Solo mostrar el menú sin carrito
export function SimpleMenuExample() {
  const { menu, loading, error, addToCart } = useMenuIntegration(MENU_CONFIG);
  
  return (
    <div>
      <h1>Nuestro Menú</h1>
      <MenuDisplay 
        menu={menu}
        loading={loading}
        error={error}
        onAddToCart={addToCart}
        showDescription={true}
      />
    </div>
  );
}

// EJEMPLO 3: Integración personalizada
export function CustomMenuExample() {
  const { 
    restaurant, 
    menu, 
    loading, 
    error, 
    cart, 
    addToCart, 
    total, 
    itemCount 
  } = useMenuIntegration(MENU_CONFIG);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ padding: '20px' }}>
      {restaurant && (
        <header>
          <h1>{restaurant.name}</h1>
          <p>{restaurant.description}</p>
        </header>
      )}
      
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          {menu.map(category => (
            <div key={category.id}>
              <h2>{category.name}</h2>
              <div style={{ display: 'grid', gap: '10px' }}>
                {category.items.map(item => (
                  <div key={item.id} style={{ 
                    border: '1px solid #ddd', 
                    padding: '10px', 
                    borderRadius: '8px' 
                  }}>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>${item.price}</span>
                      <button 
                        onClick={() => addToCart(item)}
                        disabled={!item.isAvailable}
                      >
                        {item.isAvailable ? 'Agregar' : 'No disponible'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ width: '300px' }}>
          <h3>Carrito ({itemCount} items)</h3>
          <p>Total: ${total.toLocaleString()}</p>
          {cart.map(item => (
            <div key={item.id}>
              {item.name} x{item.quantity}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// CONFIGURACIÓN: Recuerda actualizar el archivo config.js con tus datos reales:
/*
export const MENU_CONFIG = {
  firebaseConfig: {
    apiKey: "tu-api-key-real",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
  },
  restaurantId: "tu-restaurant-uid-real"
};
*/
