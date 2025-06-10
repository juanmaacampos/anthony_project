import { useEffect } from 'react'
import { Header, Footer } from './components/layout'
import { Menu, Location, Contact } from './components/sections'
import { Navbar } from './components/navigation'
import { optimizeForMobile } from './utils'
import './styles/index.css'

function App() {
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
