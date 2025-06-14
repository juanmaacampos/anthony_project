import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import PaymentSuccess from './pages/PaymentSuccess.jsx';
import PaymentPending from './pages/PaymentPending.jsx';
import PaymentFailure from './pages/PaymentFailure.jsx';
import OrderStatus from './pages/OrderStatus.jsx';
import WebhookHandler from './pages/WebhookHandler.jsx';
import PaymentDebugInfo from './pages/PaymentDebugInfo.jsx';
// import PaymentDebug from './pages/PaymentDebug.jsx';

const Router = () => {
  return (
    <BrowserRouter basename="/restaurant_template">
      <Routes>
        {/* Ruta principal del restaurante */}
        <Route path="/" element={<App />} />
        
        {/* Rutas de estado de pago de MercadoPago */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/pending" element={<PaymentPending />} />
        <Route path="/payment/failure" element={<PaymentFailure />} />
        <Route path="/payment/debug" element={<PaymentDebugInfo />} />
        {/* <Route path="/payment/debug" element={<PaymentDebug />} /> */}
        
        {/* Ruta para manejar webhooks de MercadoPago (opcional) */}
        <Route path="/webhook/mercadopago" element={<WebhookHandler />} />
        
        {/* Ruta para estado del pedido */}
        <Route path="/estado-pedido" element={<OrderStatus />} />
        <Route path="/order-status" element={<OrderStatus />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
