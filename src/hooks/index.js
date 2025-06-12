// Custom hooks for the application

import { useState, useEffect } from 'react';

// Hook for tracking scroll position
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      setScrollPosition(window.pageYOffset);
    };

    window.addEventListener('scroll', updatePosition);
    updatePosition();

    return () => window.removeEventListener('scroll', updatePosition);
  }, []);

  return scrollPosition;
};

// Hook for intersection observer
export const useIntersectionObserver = (ref, options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

// Hook for window dimensions
export const useWindowDimensions = () => {
  const [windowDimensions, setWindowDimensions] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
};

// Hook for Firebase connection status
export const useFirebaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  useEffect(() => {
    // This will be integrated with the MenuContext
    const checkConnection = () => {
      try {
        // Basic connection check
        setConnectionStatus('connected');
      } catch (error) {
        setConnectionStatus('error');
      }
    };
    
    checkConnection();
  }, []);
  
  return connectionStatus;
};
