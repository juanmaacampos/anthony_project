import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FaMapMarkerAlt, FaClock, FaPhone, FaInstagram } from 'react-icons/fa';
import '../../styles/sections/Location.css';

const Location = () => {
  const locationRef = useRef(null);
  const titleRef = useRef(null);
  const infoRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: locationRef.current,
        start: "top 70%",
        end: "bottom 30%",
        toggleActions: "play none none reverse"
      }
    });

    tl.fromTo(titleRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    )
    .fromTo(infoRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.8 },
      "-=0.5"
    )
    .fromTo(mapRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.8 },
      "-=0.8"
    );

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <section ref={locationRef} className="location section" id="location">
      <div className="container">
        <h2 ref={titleRef} className="section-title">Find Us</h2>
        
        <div className="location-content">
          <div ref={infoRef} className="location-info">
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <h3>Address</h3>
                <p>123 Main Street<br />Downtown, City</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaClock className="info-icon" />
              <div>
                <h3>Hours</h3>
                <p>Monday to Sunday<br />11:00 AM - 11:00 PM</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaPhone className="info-icon" />
              <div>
                <h3>Contact</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaInstagram className="info-icon" />
              <div>
                <h3>Síguenos</h3>
                <p>@restaurant</p>
              </div>
            </div>
          </div>
          
          <div ref={mapRef} className="location-map">
            <div className="map-container">
              <div className="map-info">
                <FaMapMarkerAlt className="map-icon" />
                <h3>Nuestra Ubicación</h3>
                <p>Av. Principal 123<br />Barrio Centro, Ciudad<br />Bogotá, Colombia</p>
                <a 
                  href="https://maps.google.com/?q=4.6243,-74.0599" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  <FaMapMarkerAlt /> Ver en Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
