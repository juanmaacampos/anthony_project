/**
 * Firebase Cloud Functions for Restaurant CMS Menu System
 * MercadoPago Payment Integration
 */

const { onCall } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");
const mercadopago = require("mercadopago");

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Initialize Secret Manager client
const secretClient = new SecretManagerServiceClient();

/**
 * Cloud Function para crear una preferencia de pago en MercadoPago
 * Callable function que recibe datos del frontend y retorna el init_point
 */
exports.createMercadoPagoPreference = onCall(async (request) => {
  try {
    logger.info("🔄 Creating MercadoPago preference...", { request: request.data });

    // 1. Validar datos de entrada
    const { 
      restaurantId, 
      items, 
      customer, 
      totalAmount, 
      orderId, 
      backUrls,
      notes = ""
    } = request.data;

    // Validaciones
    if (!restaurantId || typeof restaurantId !== 'string') {
      throw new Error('restaurantId is required and must be a string');
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('items is required and must be a non-empty array');
    }

    if (!customer || typeof customer !== 'object' || !customer.name || !customer.phone) {
      throw new Error('customer is required with name and phone');
    }

    if (!totalAmount || typeof totalAmount !== 'number' || totalAmount <= 0) {
      throw new Error('totalAmount is required and must be a positive number');
    }

    if (!orderId || typeof orderId !== 'string') {
      throw new Error('orderId is required and must be a string');
    }

    if (!backUrls || typeof backUrls !== 'object' || !backUrls.success || !backUrls.pending || !backUrls.failure) {
      throw new Error('backUrls is required with success, pending, and failure URLs');
    }

    // Validar estructura de items
    for (const item of items) {
      if (!item.name || typeof item.unit_price !== 'number' || typeof item.quantity !== 'number') {
        throw new Error('Each item must have name, unit_price (number), and quantity (number)');
      }
    }

    logger.info("✅ Input validation passed");

    // 2. Obtener Access Token desde Secret Manager
    const secretName = `MERCADOPAGO_ACCESS_TOKEN_${restaurantId}`;
    const projectId = process.env.GCLOUD_PROJECT;
    const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    let accessToken;
    try {
      logger.info(`🔐 Fetching secret: ${secretName}`);
      const [version] = await secretClient.accessSecretVersion({
        name: secretPath,
      });
      accessToken = version.payload.data.toString();
      logger.info("✅ Access token retrieved successfully");
    } catch (error) {
      logger.error("❌ Failed to retrieve access token from Secret Manager:", error);
      throw new Error(`Failed to retrieve MercadoPago access token for restaurant ${restaurantId}. Please check Secret Manager configuration.`);
    }

    // 3. Configurar MercadoPago SDK
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: accessToken,
    });
    const preference = new mercadopago.Preference(client);

    logger.info("✅ MercadoPago SDK configured");

    // 4. Guardar/actualizar pedido en Firestore
    const orderData = {
      restaurantId,
      items,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address || ''
      },
      total: totalAmount,
      paymentMethod: "mercadopago",
      status: "pending",
      paymentStatus: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      notes: notes || ''
    };

    // Usar merge para actualizar si ya existe
    await db.collection('orders').doc(orderId).set(orderData, { merge: true });
    logger.info(`✅ Order saved/updated in Firestore: ${orderId}`);

    // 5. Crear preferencia de pago en MercadoPago
    const preferenceData = {
      items: items.map(item => ({
        title: item.name,
        unit_price: parseFloat(item.unit_price),
        quantity: parseInt(item.quantity),
        currency_id: "ARS"
      })),
      payer: {
        name: customer.name,
        phone: {
          number: customer.phone
        },
        email: customer.email || undefined
      },
      back_urls: {
        success: backUrls.success,
        pending: backUrls.pending,
        failure: backUrls.failure
      },
      auto_return: "approved",
      external_reference: orderId,
      notification_url: `https://us-central1-cms-menu-7b4a4.cloudfunctions.net/mercadoPagoWebhookV2`,
      metadata: {
        restaurant_id: restaurantId,
        order_id: orderId
      }
    };

    logger.info("🔄 Creating MercadoPago preference...", { preferenceData });

    const mpResponse = await preference.create({ body: preferenceData });
    
    if (!mpResponse || !mpResponse.id || !mpResponse.init_point) {
      throw new Error('Invalid response from MercadoPago API');
    }

    logger.info("✅ MercadoPago preference created:", { 
      preferenceId: mpResponse.id, 
      initPoint: mpResponse.init_point 
    });

    // 6. Actualizar pedido con el ID de preferencia de MercadoPago
    await db.collection('orders').doc(orderId).update({
      mpPreferenceId: mpResponse.id,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    logger.info(`✅ Order updated with MercadoPago preference ID: ${mpResponse.id}`);

    // 7. Retornar init_point al frontend
    return {
      success: true,
      init_point: mpResponse.init_point,
      preference_id: mpResponse.id,
      order_id: orderId
    };

  } catch (error) {
    logger.error("❌ Error creating MercadoPago preference:", error);
    
    // Retornar error estructurado
    throw new Error(`Failed to create MercadoPago preference: ${error.message}`);
  }
});

/**
 * Webhook para recibir notificaciones de MercadoPago
 * HTTP function que maneja las notificaciones de estado de pago
 */
exports.mercadoPagoWebhookV2 = onRequest(async (req, res) => {
  try {
    logger.info("🔔 MercadoPago webhook received:", {
      method: req.method,
      query: req.query,
      body: req.body,
      headers: req.headers
    });

    // 1. Validar que la petición sea POST
    if (req.method !== 'POST') {
      logger.warn("⚠️ Webhook received non-POST request");
      res.status(200).send('OK'); // Responder 200 para evitar reintentos
      return;
    }

    // 2. Extraer topic e id de query o body
    let topic = req.query.topic || req.body.topic;
    let id = req.query.id || req.body.id || req.body.data?.id;

    logger.info(`📋 Webhook details - Topic: ${topic}, ID: ${id}`);

    // Si faltan topic o id, responder OK pero registrar advertencia
    if (!topic || !id) {
      logger.warn("⚠️ Missing topic or id in webhook notification", {
        topic,
        id,
        query: req.query,
        body: req.body
      });
      res.status(200).send('OK');
      return;
    }

    // 3. Manejar notificaciones de payment
    if (topic === 'payment') {
      await handlePaymentNotification(id);
    } else {
      // Para otros topics, responder OK pero registrar advertencia
      logger.warn(`⚠️ Unhandled webhook topic: ${topic}`, { id });
    }

    res.status(200).send('OK');
    
  } catch (error) {
    logger.error("❌ Error processing MercadoPago webhook:", error);
    // Aún así responder 200 para evitar reintentos innecesarios
    res.status(200).send('OK');
  }
});

/**
 * Procesa notificaciones de pago de MercadoPago
 * @param {string} paymentId - ID del pago en MercadoPago
 */
async function handlePaymentNotification(paymentId) {
  try {
    logger.info(`💳 Processing payment notification for ID: ${paymentId}`);

    // 3a. Obtener el paymentId (ya lo tenemos)
    
    // 3b. Obtener Access Token general desde Secret Manager
    const projectId = process.env.GCLOUD_PROJECT;
    const secretName = 'MERCADOPAGO_ACCESS_TOKEN_GENERAL';
    const secretPath = `projects/${projectId}/secrets/${secretName}/versions/latest`;

    let accessToken;
    try {
      logger.info(`🔐 Fetching general secret: ${secretName}`);
      const [version] = await secretClient.accessSecretVersion({
        name: secretPath,
      });
      accessToken = version.payload.data.toString();
      logger.info("✅ General access token retrieved successfully");
    } catch (error) {
      logger.error("❌ Failed to retrieve general access token from Secret Manager:", error);
      throw new Error(`Failed to retrieve general MercadoPago access token. Please check Secret Manager configuration.`);
    }

    // 3c. Configurar MercadoPago SDK
    const client = new mercadopago.MercadoPagoConfig({
      accessToken: accessToken,
    });
    const payment = new mercadopago.Payment(client);

    logger.info("✅ MercadoPago SDK configured for webhook");

    // 3d. Consultar detalles del pago
    logger.info(`🔍 Fetching payment details for ID: ${paymentId}`);
    const mpPayment = await payment.get({ id: paymentId });

    if (!mpPayment) {
      throw new Error(`Payment not found: ${paymentId}`);
    }

    logger.info("✅ Payment details retrieved:", {
      id: mpPayment.id,
      status: mpPayment.status,
      external_reference: mpPayment.external_reference
    });

    // 3e. Extraer status y external_reference
    const paymentStatus = mpPayment.status;
    const orderId = mpPayment.external_reference;

    if (!orderId) {
      logger.warn("⚠️ Payment has no external_reference (orderId)");
      return;
    }

    logger.info(`📦 Processing order update - Order: ${orderId}, Status: ${paymentStatus}`);

    // 3f. Actualizar documento del pedido en Firestore
    const updateData = {
      mpPaymentId: paymentId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    // Mapear status de MercadoPago a nuestros estados
    switch (paymentStatus) {
      case 'approved':
        updateData.paymentStatus = 'paid';
        updateData.status = 'confirmed';
        logger.info(`✅ Payment approved for order ${orderId}`);
        break;
      case 'pending':
        updateData.paymentStatus = 'pending';
        updateData.status = 'pending';
        logger.info(`⏳ Payment pending for order ${orderId}`);
        break;
      case 'rejected':
      case 'cancelled':
        updateData.paymentStatus = 'failed';
        updateData.status = 'cancelled';
        logger.info(`❌ Payment rejected/cancelled for order ${orderId}`);
        break;
      case 'in_process':
        updateData.paymentStatus = 'processing';
        updateData.status = 'pending';
        logger.info(`🔄 Payment in process for order ${orderId}`);
        break;
      default:
        updateData.paymentStatus = 'unknown';
        logger.warn(`⚠️ Unknown payment status: ${paymentStatus} for order ${orderId}`);
    }

    // Actualizar en Firestore
    await db.collection('orders').doc(orderId).update(updateData);
    
    logger.info(`✅ Order ${orderId} updated successfully`, {
      paymentStatus: updateData.paymentStatus,
      orderStatus: updateData.status,
      mpPaymentId: paymentId
    });

    // Log adicional para debugging
    logger.info(`🎉 Webhook processing completed for payment ${paymentId}`);

  } catch (error) {
    logger.error(`❌ Error processing payment notification ${paymentId}:`, error);
    throw error;
  }
}
