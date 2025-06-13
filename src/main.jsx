import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Router from './Router.jsx'
import { MenuProvider } from './context/MenuContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MenuProvider>
      <Router />
    </MenuProvider>
  </StrictMode>,
)
