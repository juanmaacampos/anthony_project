import { useState, useEffect } from 'react';
import { FaHome, FaUtensils, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';
import '../../styles/navigation/Navbar.css';

const Navbar = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const headerHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Show navbar after header
      setIsVisible(scrollY > headerHeight * 0.8);
      
      // Update active section
      const sections = ['home', 'menu', 'location', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { id: 'home', icon: FaHome, label: 'Inicio' },
    { id: 'menu', icon: FaUtensils, label: 'Menú' },
    { id: 'location', icon: FaMapMarkerAlt, label: 'Ubicación' },
    { id: 'contact', icon: FaEnvelope, label: 'Contacto' }
  ];

  return (
    <nav className={`navbar ${isVisible ? 'navbar-visible' : ''}`}>
      <div className="navbar-container">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`nav-item ${activeSection === id ? 'active' : ''}`}
            onClick={() => scrollToSection(id)}
          >
            <Icon className="nav-icon" />
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
