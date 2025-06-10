import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import '../../styles/layout/Header.css';

const Header = () => {
  const headerRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { opacity: 0, y: 100 }, 
      { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    )
    .fromTo(subtitleRef.current, 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 
      "-=0.5"
    )
    .fromTo(ctaRef.current, 
      { opacity: 0, scale: 0.8 }, 
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" }, 
      "-=0.3"
    );
  }, []);

  const scrollToMenu = () => {
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header ref={headerRef} className="header" id="home">
      <div className="header-bg"></div>
      <div className="container">
        <div className="header-content">
          <h1 ref={titleRef} className="header-title">
            ANTHONY
            <br />
            BURG<span className="burger-icon">🍔</span>R
          </h1>
          <p ref={subtitleRef} className="header-subtitle">
            Comunidad
          </p>
          <button ref={ctaRef} className="btn-primary header-cta" onClick={scrollToMenu}>
            Ver Menú
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
