import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MenuDisplay } from '../../cms-menu/MenuComponents.jsx';
import { useMenuIntegration } from '../../cms-menu/useMenu.js';
import { MENU_CONFIG } from '../../cms-menu/config.js';
import '../../styles/sections/Menu.css';

gsap.registerPlugin(ScrollTrigger);

const Menu = () => {
  const menuRef = useRef(null);
  const titleRef = useRef(null);

  // CMS Menu Integration - Always enabled
  const { menu, loading, error, addToCart } = useMenuIntegration(MENU_CONFIG, { enabled: true });

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
    </section>
  );
};

export default Menu;
