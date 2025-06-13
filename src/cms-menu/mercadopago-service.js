import { MENU_CONFIG } from './config.js';

class MercadoPagoService {
  constructor(config) {
    this.publicKey = config.publicKey;
    this.accessToken = config.accessToken;
    this.currency = config.currency || 'ARS';
    this.mp = null;
    this.initialized = false;
    this.config = config;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Load MercadoPago SDK
      if (!window.MercadoPago) {
        await this.loadScript('https://sdk.mercadopago.com/js/v2');
      }

      this.mp = new window.MercadoPago(this.publicKey);
      this.initialized = true;
      console.log('✅ MercadoPago initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing MercadoPago:', error);
      throw error;
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async createPreference(orderData) {
    try {
      console.log('🔄 Creating MercadoPago preference for order:', orderData.orderId);
      
      // Crear la preferencia directamente usando la API de MercadoPago
      const preference = {
        items: orderData.items.map(item => ({
          title: item.name,
          description: item.description || '',
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          currency_id: this.currency
        })),
        payer: {
          name: orderData.customer.name,
          surname: '',
          email: orderData.customer.email || 'cliente@ejemplo.com',
          phone: {
            area_code: '',
            number: orderData.customer.phone
          },
          address: {
            street_name: orderData.customer.address || '',
            street_number: '',
            zip_code: ''
          }
        },
        back_urls: {
          success: `${MENU_CONFIG.baseUrl}/payment/success?order_id=${orderData.orderId}`,
          failure: `${MENU_CONFIG.baseUrl}/payment/failure?order_id=${orderData.orderId}`,
          pending: `${MENU_CONFIG.baseUrl}/payment/pending?order_id=${orderData.orderId}`
        },
        auto_return: 'approved',
        external_reference: orderData.orderId,
        statement_descriptor: 'RESTAURANTE',
        notification_url: `https://us-central1-cms-menu-7b4a4.cloudfunctions.net/mercadoPagoWebhookV2`
      };

      // Hacer la llamada directa a la API de MercadoPago
      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(preference)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ MercadoPago API error:', errorData);
        throw new Error(`MercadoPago API error: ${response.status} - ${errorData}`);
      }

      const preferenceData = await response.json();
      console.log('✅ MercadoPago preference created:', preferenceData.id);
      
      return {
        id: preferenceData.id,
        init_point: preferenceData.init_point,
        sandbox_init_point: preferenceData.sandbox_init_point
      };
    } catch (error) {
      console.error('❌ Error creating MercadoPago preference:', error);
      throw error;
    }
  }

  async redirectToCheckout(preferenceId) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.mp.checkout({
        preference: {
          id: preferenceId
        }
      });
    } catch (error) {
      console.error('❌ Error redirecting to checkout:', error);
      throw error;
    }
  }
}

export default MercadoPagoService;
