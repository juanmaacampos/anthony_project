// Configuración específica para testing de MercadoPago
// ⚠️ IMPORTANTE: Estas son credenciales de TESTING, no usar en producción

export const MERCADOPAGO_TEST_CONFIG = {
  // 🧪 Credenciales de Testing (reemplaza con las tuyas)
  publicKey: 'TEST-c7b5ad73-9f5c-4a92-bb1a-0e4acbf7f9a7', // Tu public key de testing
  accessToken: 'TEST-4234567890123456-123456-abcdef1234567890abcdef1234567890-123456789', // Tu access token de testing
  
  // 🌍 URLs de testing
  baseUrl: 'https://api.mercadopago.com',
  checkoutUrl: 'https://www.mercadopago.com.ar/checkout/v1/redirect',
  
  // 🏪 Configuración del comercio
  storeId: 'cms-menu-testing',
  storeName: 'CMS Menu - Testing',
  
  // 🔄 URLs de retorno para testing
  returnUrls: {
    success: `${window.location.origin}/confirmacion-pedido`,
    failure: `${window.location.origin}/pago-fallido`,
    pending: `${window.location.origin}/pago-pendiente`
  },

  // 💳 Tarjetas de prueba
  testCards: {
    visa: {
      number: '4509953566233704',
      cvv: '123',
      expiry: '11/25',
      holder: 'APRO',
      installments: 1,
      status: 'approved' // Se aprueba automáticamente
    },
    mastercard: {
      number: '5031755734530604',
      cvv: '123', 
      expiry: '11/25',
      holder: 'APRO',
      installments: 1,
      status: 'approved'
    },
    // Tarjeta que se rechaza
    rejected: {
      number: '4000000000000002',
      cvv: '123',
      expiry: '11/25', 
      holder: 'OTHE',
      installments: 1,
      status: 'rejected'
    },
    // Tarjeta pendiente
    pending: {
      number: '4509953566233704',
      cvv: '123',
      expiry: '11/25',
      holder: 'CONT',
      installments: 1,
      status: 'pending'
    }
  },

  // 👤 Usuarios de prueba (para testing completo)
  testUsers: {
    buyer: {
      email: 'test_user_123456@testuser.com',
      password: 'qatest123'
    },
    seller: {
      email: 'test_user_789012@testuser.com', 
      password: 'qatest123'
    }
  },

  // 🎯 Configuración específica para el SDK
  sdkConfig: {
    environment: 'sandbox', // 'sandbox' para testing, 'production' para producción
    enableDebugging: true,
    autoReturn: true,
    theme: {
      elementsColor: '#009ee3',
      headerColor: '#009ee3'
    }
  }
};

// 🔍 Función para validar si estamos en modo testing
export function isTestingMode() {
  return MERCADOPAGO_TEST_CONFIG.publicKey.startsWith('TEST-');
}

// 📝 Función para obtener info de tarjetas de prueba
export function getTestCardsInfo() {
  return {
    approved: MERCADOPAGO_TEST_CONFIG.testCards.visa,
    rejected: MERCADOPAGO_TEST_CONFIG.testCards.rejected,
    pending: MERCADOPAGO_TEST_CONFIG.testCards.pending,
    all: MERCADOPAGO_TEST_CONFIG.testCards
  };
}

// 🔧 Función helper para debugging
export function logTestingInfo() {
  if (isTestingMode()) {
    console.log('🧪 MODO TESTING DE MERCADOPAGO ACTIVADO');
    console.log('📋 Tarjetas de prueba disponibles:', getTestCardsInfo());
    console.log('🔗 URLs de retorno:', MERCADOPAGO_TEST_CONFIG.returnUrls);
    console.log('⚠️ Recuerda: Estas son credenciales de testing');
  }
}
