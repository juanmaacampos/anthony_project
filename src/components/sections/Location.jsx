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
  }, []);

  return (
    <section ref={locationRef} className="location section" id="location">
      <div className="container">
        <h2 ref={titleRef} className="section-title">Encuéntranos</h2>
        
        <div className="location-content">
          <div ref={infoRef} className="location-info">
            <div className="info-item">
              <FaMapMarkerAlt className="info-icon" />
              <div>
                <h3>Dirección</h3>
                <p>Av. Principal 123<br />Barrio Centro, Ciudad</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaClock className="info-icon" />
              <div>
                <h3>Horarios</h3>
                <p>Lunes a Domingo<br />11:00 AM - 11:00 PM</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaPhone className="info-icon" />
              <div>
                <h3>Contacto</h3>
                <p>+57 300 123 4567</p>
              </div>
            </div>
            
            <div className="info-item">
              <FaInstagram className="info-icon" />
              <div>
                <h3>Síguenos</h3>
                <p>@anthonyburger</p>
              </div>
            </div>
          </div>
          
          <div ref={mapRef} className="location-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.8157573732705!2d-74.05991292509314!3d4.624335743368436!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f99a7e9f9d7d7%3A0x4b8c9d8e9f9d7d7!2sBogot%C3%A1%2C%20Colombia!5e0!3m2!1sen!2sco!4v1635000000000!5m2!1sen!2sco"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '20px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
