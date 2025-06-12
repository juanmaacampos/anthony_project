import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { MenuProvider } from './context/MenuContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MenuProvider>
      <App />
    </MenuProvider>
  </StrictMode>,
)
