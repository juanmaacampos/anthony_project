import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import '../../styles/layout/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>ANTHONY BURGER</h3>
            <p>La mejor experiencia en hamburguesas artesanales</p>
          </div>
          
          <div className="footer-social">
            <h4>Síguenos</h4>
            <div className="social-links">
              <a href="#" className="social-link">
                <FaInstagram />
              </a>
              <a href="#" className="social-link">
                <FaFacebook />
              </a>
              <a href="#" className="social-link">
                <FaTwitter />
              </a>
              <a href="#" className="social-link">
                <FaWhatsapp />
              </a>
            </div>
          </div>
          
          <div className="footer-contact">
            <h4>Contacto</h4>
            <p>Av. Principal 123</p>
            <p>+57 300 123 4567</p>
            <p>info@anthonyburger.com</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Anthony Burger. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
