import React, { useState } from 'react';
import TestFirebaseConnection from './TestFirebaseConnection';
import FirebaseDiagnostic from './FirebaseDiagnostic';
import FirebaseConnectionDiagnostic from './FirebaseConnectionDiagnostic';
import MenuPage from './MenuPage';
import DemoMenuPage from './DemoMenuPage';
import StableMenuPage from './StableMenuPage';
import UltraSimpleMenuPage from './UltraSimpleMenuPage';
import FirebaseV10TestPage from './FirebaseV10TestPage';
// import SDKComparison from './SDKComparison';

function CMSTestSuite() {
  const [currentTest, setCurrentTest] = useState('stable');

  const tests = [
    // { 
    //   id: 'comparison', 
    //   name: '🔬 Comparación de SDKs', 
    //   component: <SDKComparison />,
    //   description: 'Compara el SDK original vs el SDK mejorado lado a lado'
    // },
    { 
      id: 'diagnostic', 
      name: '🔧 Diagnóstico Completo', 
      component: <FirebaseConnectionDiagnostic />,
      description: 'Herramienta avanzada para diagnosticar problemas de conectividad'
    },
    { 
      id: 'legacy-diagnostic', 
      name: '🔍 Diagnóstico Legacy', 
      component: <FirebaseDiagnostic />,
      description: 'Diagnóstico original para comparación'
    },
    { 
      id: 'connection', 
      name: '🔌 Test Conexión Simple', 
      component: <TestFirebaseConnection />,
      description: 'Verifica que la conexión con Firebase funcione correctamente'
    },
    { 
      id: 'demo', 
      name: '🎭 Demo con Datos de Ejemplo', 
      component: <DemoMenuPage />,
      description: 'Muestra cómo funcionan los componentes con datos simulados'
    },
    { 
      id: 'stable', 
      name: '🛡️ Menú CMS Estable', 
      component: <StableMenuPage />,
      description: 'SDK optimizado para resolver errores internos de Firestore (RECOMENDADO)'
    },
    { 
      id: 'ultra-simple', 
      name: '⚡ Menú CMS Ultra Simple', 
      component: <UltraSimpleMenuPage />,
      description: 'SDK ultra minimalista con máxima compatibilidad - Solo lectura básica'
    },
    { 
      id: 'live', 
      name: '🍽️ Menú CMS Original', 
      component: <MenuPage />,
      description: 'Conecta con tu CMS real usando el SDK original'
    }
  ];

  const currentTestObj = tests.find(t => t.id === currentTest);

  return (
    <div>
      {/* Navigation Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #ff6b35, #f7931e)', 
        color: 'white', 
        padding: '1rem 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🍽️ CMS Menu Integration - Test Suite</h1>
          
          {/* Test Selector */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            marginTop: '1rem',
            flexWrap: 'wrap'
          }}>
            {tests.map(test => (
              <button
                key={test.id}
                onClick={() => setCurrentTest(test.id)}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: currentTest === test.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: currentTest === test.id ? 'bold' : 'normal',
                  transition: 'all 0.3s ease'
                }}
              >
                {test.name}
              </button>
            ))}
          </div>
          
          {/* Current Test Info */}
          <p style={{ 
            margin: '1rem 0 0 0', 
            fontSize: '0.9rem', 
            opacity: 0.9 
          }}>
            {currentTestObj?.description}
          </p>
        </div>
      </div>

      {/* Test Content */}
      <div>
        {currentTestObj?.component}
      </div>

      {/* Footer Info */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '2rem',
        textAlign: 'center',
        borderTop: '1px solid #dee2e6',
        marginTop: '2rem'
      }}>
        <h3>✅ Configuración Completada</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          maxWidth: '800px',
          margin: '1rem auto'
        }}>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4>🔥 Firebase</h4>
            <p>Proyecto: cms-menu-7b4a4</p>
            <p>✅ Configurado</p>
          </div>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4>👤 Restaurante</h4>
            <p>UID: HsuTZWhRVkT88a0WOztELGzJUhl1</p>
            <p>✅ Configurado</p>
          </div>
          <div style={{ padding: '1rem', background: 'white', borderRadius: '8px' }}>
            <h4>📦 Componentes</h4>
            <p>Menu SDK, Hooks, UI</p>
            <p>✅ Instalados</p>
          </div>
        </div>
        
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#6c757d' }}>
          <p>
            🎯 <strong>Próximo paso:</strong> ¡Tu CMS está listo! Usa cualquiera de los componentes en tu aplicación.
          </p>
          <p>
            📖 Ver documentación completa en: <code>CMS_INTEGRATION_GUIDE.md</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CMSTestSuite;
