// Global context for CMS state management
import React, { createContext, useContext, useState } from 'react';

const CMSContext = createContext();

export const CMSProvider = ({ children }) => {
  const [cmsMode, setCmsMode] = useState('disabled'); // 'disabled', 'debug', 'normal'

  return (
    <CMSContext.Provider value={{ cmsMode, setCmsMode }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMSContext = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMSContext must be used within a CMSProvider');
  }
  return context;
};
