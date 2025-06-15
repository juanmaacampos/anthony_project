import React from 'react';
import { MenuWithCart, FeaturedItems, CategoryNav } from './MenuComponents.jsx';
import { useMenuWithTerminology } from './useMenu.js';
import { createMenuSDK } from './menu-sdk.js';
import { MENU_CONFIG } from './config.js';

// Ejemplo completo usando el nuevo sistema unificado de businesses
export function BusinessExample() {
  // Crear SDK instance
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  
  // Usar el hook con terminología automática
  const { business, menu, loading, error, terminology } = useMenuWithTerminology(menuSDK);

  if (loading) {
    return <div>Cargando {terminology?.menuName || 'menú'}...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const businessType = business?.businessType || 'restaurant';
  const icon = businessType === 'store' ? '🏪' : '🍽️';

  return (
    <div className="business-example">
      {/* Header adaptativo */}
      <header className="business-header">
        <h1>{icon} {business?.name}</h1>
        <p>{business?.description}</p>
        <p>Tipo: {terminology?.businessName}</p>
      </header>

      {/* Navegación de categorías */}
      <CategoryNav 
        categories={menu} 
        terminology={terminology}
        className="main-category-nav"
      />

      {/* Productos/Platos destacados */}
      <section className="featured-section">
        <FeaturedItems 
          menu={menu}
          terminology={terminology}
          title={terminology?.featuredProducts}
        />
      </section>

      {/* Menú completo con carrito integrado */}
      <section className="full-menu-section">
        <MenuWithCart 
          menuSDK={menuSDK}
          showImages={true}
          terminology={terminology}
        />
      </section>

      {/* Información adicional según el tipo de negocio */}
      <section className="service-options">
        <h3>Opciones de servicio:</h3>
        <ul>
          {businessType === 'store' ? (
            <>
              <li>📦 {terminology?.serviceOptions?.pickup || 'Retiro en tienda'}</li>
              <li>🚚 {terminology?.serviceOptions?.delivery || 'Envío a domicilio'}</li>
              <li>📮 {terminology?.serviceOptions?.shipping || 'Envío postal'}</li>
            </>
          ) : (
            <>
              <li>🍽️ {terminology?.serviceOptions?.dineIn || 'Comer en el local'}</li>
              <li>🥡 {terminology?.serviceOptions?.takeaway || 'Para llevar'}</li>
              <li>🛵 {terminology?.serviceOptions?.delivery || 'Delivery'}</li>
            </>
          )}
        </ul>
      </section>
    </div>
  );
}

// Ejemplo usando solo hooks individuales
export function CustomBusinessExample() {
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.businessId);
  const { business, menu, loading, error, terminology } = useMenuWithTerminology(menuSDK);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Ejemplo personalizado</h1>
      <p>Negocio: {business?.name}</p>
      <p>Tipo: {business?.businessType}</p>
      <p>Terminología: {terminology?.itemTypePlural}</p>
      
      {/* Implementación personalizada usando la terminología */}
      <div className="custom-menu">
        {menu.map(category => (
          <div key={category.id}>
            <h2>{category.name}</h2>
            <p>{category.items.length} {terminology?.items}</p>
            {category.items.map(item => (
              <div key={item.id} className="custom-item">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <span>${item.price}</span>
                <button>
                  {terminology?.addToCart || 'Agregar'}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Ejemplo de migración desde el sistema anterior
export function MigrationExample() {
  // ✅ El código anterior sigue funcionando
  const menuSDK = createMenuSDK(MENU_CONFIG.firebaseConfig, MENU_CONFIG.restaurantId);
  
  // ✅ Pero ahora también tienes acceso a la nueva funcionalidad
  const { business, restaurant, menu, terminology } = useMenuWithTerminology(menuSDK);
  
  return (
    <div>
      <h1>Ejemplo de migración</h1>
      
      {/* ✅ business y restaurant contienen los mismos datos */}
      <p>Business: {business?.name}</p>
      <p>Restaurant (compatibilidad): {restaurant?.name}</p>
      
      {/* 🆕 Nueva terminología automática */}
      <p>Tipo de items: {terminology?.itemTypePlural}</p>
      <p>Texto del botón: {terminology?.addToCart}</p>
    </div>
  );
}

export default BusinessExample;
