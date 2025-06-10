import { useEffect, useState } from 'react'
import { Header, Footer } from './components/layout'
import { Menu, Location, Contact } from './components/sections'
import { Navbar } from './components/navigation'
import { optimizeForMobile } from './utils'
import FirebaseDebugPage from './pages/FirebaseDebugPage'
import './styles/index.css'

function App() {
  const [showCMSTest, setShowCMSTest] = useState(false);

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

  // Toggle CMS Test Mode with keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        setShowCMSTest(!showCMSTest);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showCMSTest]);

  if (showCMSTest) {
    return (
      <div className="App">
        {/* CMS Test Mode Header */}
        <div style={{ 
          background: '#007bff', 
          color: 'white', 
          padding: '0.5rem', 
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          🧪 Firebase Debug Mode - 
          <button 
            onClick={() => setShowCMSTest(false)}
            style={{ 
              background: 'transparent', 
              border: '1px solid white', 
              color: 'white', 
              padding: '0.2rem 0.5rem', 
              marginLeft: '0.5rem',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Volver a la App Normal
          </button>
          <span style={{ marginLeft: '1rem', opacity: 0.8 }}>
            (Ctrl+M para alternar)
          </span>
        </div>
        <FirebaseDebugPage />
      </div>
    );
  }

  return (
    <div className="App">
      {/* CMS Toggle Button */}
      <div style={{ 
        position: 'fixed', 
        top: '20px', 
        right: '20px', 
        zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '8px',
        padding: '0.5rem'
      }}>
        <button
          onClick={() => setShowCMSTest(true)}
          style={{
            background: '#ff6b35',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold'
          }}
          title="Ctrl+M para abrir"
        >
          🍽️ Test CMS
        </button>
      </div>
      
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
