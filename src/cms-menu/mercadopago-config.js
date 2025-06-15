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
      number: '4000000000000044',
      cvv: '123',
      expiry: '11/25',
      holder: 'CONT',
      installments: 1,
      status: 'pending'
    }
  },

  // 🧪 Usuarios de prueba
  testUsers: {
    buyer: {
      email: 'test_user_123456@testuser.com',
      password: 'qatest123'
    },
    seller: {
      email: 'test_user_654321@testuser.com', 
      password: 'qatest123'
    }
  },

  // ⚙️ Configuración de preferencias por defecto
  defaultPreference: {
    currency_id: 'ARS',
    country: 'AR',
    locale: 'es-AR',
    expires: true,
    expiration_date_from: null,
    expiration_date_to: null,
    auto_return: 'approved',
    binary_mode: false,
    excluded_payment_methods: [],
    excluded_payment_types: [],
    installments: 12,
    default_installments: 1
  }
};

// Función para validar si estamos en modo testing
export function isTestingMode() {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.search.includes('test=true');
}

// Función para obtener la configuración correcta según el entorno
export function getMercadoPagoConfig() {
  if (isTestingMode()) {
    return MERCADOPAGO_TEST_CONFIG;
  }
  
  // Configuración de producción
  return {
    publicKey: 'APP_USR-6359a306-23ca-4d23-924e-b72a3fd1816f',
    currency: 'ARS',
    baseUrl: 'https://api.mercadopago.com',
    returnUrls: {
      success: `${window.location.origin}/payment-success`,
      failure: `${window.location.origin}/payment-failure`, 
      pending: `${window.location.origin}/payment-pending`
    }
  };
}

export default MERCADOPAGO_TEST_CONFIG;
