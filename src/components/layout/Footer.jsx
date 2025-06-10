import { FaInstagram, FaFacebook, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import '../../styles/layout/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>YOUR RESTAURANT</h3>
            <p>The best dining experience in town</p>
          </div>
          
          <div className="footer-social">
            <h4>Follow Us</h4>
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
            <h4>Contact</h4>
            <p>123 Main Street</p>
            <p>+1 (555) 123-4567</p>
            <p>info@yourrestaurant.com</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 Your Restaurant. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
