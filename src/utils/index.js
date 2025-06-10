// Utility functions for the application

// Format currency
export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Smooth scroll to element
export const scrollToElement = (elementId) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Check if element is in viewport
export const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// Prevent horizontal scrolling utility
export const preventHorizontalScroll = () => {
  // Prevent horizontal scrolling on document
  document.documentElement.style.overflowX = 'hidden';
  document.body.style.overflowX = 'hidden';
  
  // Set max-width on all elements that might cause overflow
  const elements = document.querySelectorAll('*');
  elements.forEach(el => {
    const computed = window.getComputedStyle(el);
    if (computed.position === 'absolute' || computed.position === 'fixed') {
      el.style.maxWidth = '100vw';
    }
  });
};

// Mobile touch optimization
export const optimizeForMobile = () => {
  // Prevent zoom on form inputs on iOS
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.fontSize = '16px';
      });
    });
  }
  
  // Prevent horizontal scroll
  preventHorizontalScroll();
  
  // Add touch-action optimization
  document.body.style.touchAction = 'pan-y';
};

// Check if device is mobile
export const isMobile = () => {
  return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Safe image loading to prevent overflow
export const loadImageSafely = (imgElement, src) => {
  imgElement.style.maxWidth = '100%';
  imgElement.style.height = 'auto';
  imgElement.src = src;
};
