import { useEffect } from 'react'
import { Header, Footer } from './components/layout'
import { Menu, Location, Contact } from './components/sections'
import { Navbar } from './components/navigation'
import { ConnectionStatus } from './components/ConnectionStatus'
import { useMenu } from './context/MenuContext'
import { optimizeForMobile } from './utils'
import './styles/index.css'

function App() {
  const { isConnected, error } = useMenu();

  useEffect(() => {
    // Optimize for mobile devices
    optimizeForMobile();
    
    // Re-run optimization on window resize
    const handleResize = () => {
      optimizeForMobile();
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="App">
      <ConnectionStatus />
      {error && (
        <div style={{
          background: '#ffebee',
          color: '#c62828',
          padding: '1rem',
          margin: '1rem',
          borderRadius: '4px',
          textAlign: 'center'
        }}>
          Error de conexión: {error}
        </div>
      )}
      <Header />
      <Menu />
      <Location />
      <Contact />
      <Footer />
      <Navbar />
    </div>
  )
}

export default App
