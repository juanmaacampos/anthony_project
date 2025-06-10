import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../../styles/ui/MenuItem.css';

const MenuItem = ({ item }) => {
  const itemRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(itemRef.current,
      { opacity: 0, y: 30, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
        scrollTrigger: {
          trigger: itemRef.current,
          start: "top 85%",
          end: "bottom 15%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }, []);

  return (
    <div ref={itemRef} className="menu-item">
      <div className="menu-item-image">
        <img src={item.image} alt={item.title} />
      </div>
      <div className="menu-item-content">
        <h4 className="menu-item-title">{item.title}</h4>
        <p className="menu-item-description">{item.description}</p>
        <div className="menu-item-price">{item.price}</div>
      </div>
    </div>
  );
};

export default MenuItem;
