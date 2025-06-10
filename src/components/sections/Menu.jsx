import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MenuItem from '../ui/MenuItem';
import ErrorBoundary from '../ui/ErrorBoundary';
import { MenuDisplay } from '../../cms-menu/MenuComponents.jsx';
import { useMenuIntegration } from '../../cms-menu/useMenu.js';
import { MENU_CONFIG } from '../../cms-menu/config.js';
import '../../styles/sections/Menu.css';

gsap.registerPlugin(ScrollTrigger);

const Menu = () => {
  const menuRef = useRef(null);
  const titleRef = useRef(null);
  const [useCMS, setUseCMS] = useState(false); // Disabled by default to prevent conflicts

  // IMPORTANTE: Siempre llamar hooks, nunca condicionalmente
  const cmsIntegration = useMenuIntegration(MENU_CONFIG, { enabled: useCMS });
  
  // Los datos del CMS están disponibles solo cuando está habilitado
  const { menu: cmsMenu, loading, error, addToCart } = cmsIntegration;

  // Usar datos CMS solo si está habilitado
  const shouldUseCMS = useCMS;

  // Datos estáticos de respaldo (mantener el menú original como fallback)
  const staticMenuData = {
    burgers: [
      {
        id: 1,
        title: "Anthony Classic",
        description: "Carne artesanal, queso cheddar, lechuga, tomate, cebolla caramelizada",
        price: "$8.500",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop&auto=format"
      },
      {
        id: 2,
        title: "BBQ Bacon",
        description: "Carne artesanal, bacon crocante, queso, salsa BBQ casera",
        price: "$9.200",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&h=200&fit=crop&auto=format"
      },
      {
        id: 3,
        title: "Doble Cheese",
        description: "Doble carne, doble queso cheddar, pickles, salsa especial",
        price: "$10.800",
        image: "https://images.unsplash.com/photo-1586816001966-79b736744398?w=300&h=200&fit=crop&auto=format"
      }
    ],
    acompañamientos: [
      {
        id: 4,
        title: "Papas Anthony",
        description: "Papas caseras con especias secretas y salsa cheddar",
        price: "$4.500",
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=200&fit=crop&auto=format"
      },
      {
        id: 5,
        title: "Aros de Cebolla",
        description: "Crujientes aros de cebolla rebozados, salsa ranch",
        price: "$3.800",
        image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&h=200&fit=crop&auto=format"
      }
    ],
    bebidas: [
      {
        id: 6,
        title: "Malteada Oreo",
        description: "Cremosa malteada con galletas Oreo y crema batida",
        price: "$5.200",
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=200&fit=crop&auto=format"
      },
      {
        id: 7,
        title: "Limonada de la Casa",
        description: "Refrescante limonada con hierbas aromáticas",
        price: "$3.500",
        image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=200&fit=crop&auto=format"
      }
    ]
  };

  useEffect(() => {
    gsap.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  // Toggle para cambiar entre CMS y datos estáticos
  const toggleCMS = () => {
    setUseCMS(!useCMS);
  };

  return (
    <ErrorBoundary>
      <section id="menu" className="menu-section" ref={menuRef}>
        <div className="container">
          <div className="menu-header">
          <h2 className="section-title" ref={titleRef}>
            Nuestro Menú
          </h2>
          
          {/* Toggle Switch para CMS */}
          <div className="cms-toggle">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={useCMS} 
                onChange={toggleCMS}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-text">
                {useCMS ? 'CMS Menu' : 'Static Menu'}
              </span>
            </label>
          </div>
        </div>

        {/* Renderizado condicional */}
        {shouldUseCMS ? (
          <div className="cms-menu-container">
            {error && (
              <div className="cms-error">
                ❌ Error loading CMS menu: {error}
                <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  <strong>Posibles soluciones:</strong>
                  <ul style={{ textAlign: 'left', marginTop: '0.5rem' }}>
                    <li>Verifica tu conexión a internet</li>
                    <li>Revisa que el UID del restaurante sea correcto</li>
                    <li>Confirma que Firebase esté configurado correctamente</li>
                  </ul>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button onClick={() => setUseCMS(false)} className="fallback-btn">
                    Usar Menú Estático
                  </button>
                  <button 
                    onClick={() => window.location.reload()} 
                    className="fallback-btn"
                    style={{ background: '#007bff' }}
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}
            <MenuDisplay 
              menu={cmsMenu} 
              loading={loading} 
              error={error}
              onAddToCart={addToCart}
              showImages={true}
              showPrices={true}
              showDescription={true}
            />
          </div>
        ) : (
          // Renderizado del menú estático original
          <div className="static-menu-wrapper">
            {Object.entries(staticMenuData).map(([category, items]) => (
              <div key={category} className="menu-category">
                <h3 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <div className="menu-grid">
                  {items.map(item => (
                    <MenuItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  </ErrorBoundary>
  );
};

export default Menu;
