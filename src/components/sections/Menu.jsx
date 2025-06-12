import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MenuDisplay } from '../../cms-menu/MenuComponents.jsx';
import { useMenuIntegration } from '../../cms-menu/useMenu.js';
import { MENU_CONFIG } from '../../cms-menu/config.js';
import Cart from '../checkout/Cart';
import '../../styles/sections/Menu.css';

gsap.registerPlugin(ScrollTrigger);

const Menu = () => {
  const menuRef = useRef(null);
  const titleRef = useRef(null);
  const [showCart, setShowCart] = useState(false);

  // CMS Menu Integration - Always enabled
  const { menu, loading, error, cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount, firebaseManager } = useMenuIntegration(MENU_CONFIG, { enabled: true });

  // Debug cart changes
  useEffect(() => {
    console.log('🛒 Cart updated:', cart, 'Total items:', itemCount);
  }, [cart, itemCount]);

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

  return (
    <section id="menu" className="menu-section" ref={menuRef}>
      <div className="container">
        <div className="menu-header">
          <h2 className="section-title" ref={titleRef}>
            Nuestro Menú
          </h2>
          {itemCount > 0 && (
            <button 
              className="cart-btn"
              onClick={() => setShowCart(true)}
            >
              🛒 Carrito ({itemCount})
            </button>
          )}
        </div>
        
        <MenuDisplay 
          menu={menu} 
          loading={loading}
          error={error}
          onAddToCart={addToCart}
          showImages={true}
          showPrices={true}
          showDescription={true}
        />
      </div>

      {showCart && (
        <div className="cart-overlay" onClick={(e) => e.target.classList.contains('cart-overlay') && setShowCart(false)}>
          <Cart 
            cart={cart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
            clearCart={clearCart}
            total={total}
            onClose={() => setShowCart(false)}
            firebaseManager={firebaseManager}
          />
        </div>
      )}
    </section>
  );
};

export default Menu;
