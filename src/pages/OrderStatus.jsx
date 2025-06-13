import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { db } from '../firebase.js';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import './OrderStatus.css';

/**
 * OrderStatus Component - Real-time order tracking page
 * Displays order details and status updates using Firestore real-time listeners
 */
const OrderStatus = () => {
  // State management
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  
  // URL parameter extraction
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Validate orderId from URL
    if (!orderId) {
      setError('ID de pedido no encontrado en la URL');
      setIsLoading(false);
      return;
    }

    console.log('🔍 Setting up real-time listener for order:', orderId);

    // Set up real-time listener for order document
    const orderRef = doc(db, 'orders', orderId);
    
    const unsubscribe = onSnapshot(
      orderRef,
      async (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            const orderData = docSnapshot.data();
            
            console.log('📄 Order data updated:', orderData);
            setOrder({ id: docSnapshot.id, ...orderData });
            
            // Fetch restaurant name if we have a restaurantId and haven't fetched it yet
            if (orderData.restaurantId && !restaurantName) {
              try {
                console.log('🏪 Fetching restaurant info for:', orderData.restaurantId);
                const restaurantRef = doc(db, 'restaurants', orderData.restaurantId);
                const restaurantSnap = await getDoc(restaurantRef);
                
                if (restaurantSnap.exists()) {
                  const restaurantData = restaurantSnap.data();
                  setRestaurantName(restaurantData.name || 'Restaurante');
                  console.log('✅ Restaurant name loaded:', restaurantData.name);
                } else {
                  console.warn('⚠️ Restaurant document not found');
                  setRestaurantName('Restaurante');
                }
              } catch (restaurantError) {
                console.error('❌ Error fetching restaurant info:', restaurantError);
                setRestaurantName('Restaurante');
              }
            }
            
            setError('');
          } else {
            console.warn('⚠️ Order document does not exist:', orderId);
            setError('Pedido no encontrado. Verifica el ID del pedido.');
          }
        } catch (err) {
          console.error('❌ Error processing order snapshot:', err);
          setError(`Error al cargar el pedido: ${err.message}`);
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.error('❌ Error in order listener:', err);
        setError(`Error de conexión: ${err.message}`);
        setIsLoading(false);
      }
    );

    // Cleanup function to unsubscribe from the listener
    return () => {
      console.log('🔚 Cleaning up order listener for:', orderId);
      unsubscribe();
    };
  }, [orderId, restaurantName]); // Include restaurantName to prevent multiple fetches

  // Status display helpers
  const getStatusDisplay = (status) => {
    const statusMap = {
      'pending': { text: 'Pendiente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⏳' },
      'confirmed': { text: 'Confirmado', color: 'text-green-600', bg: 'bg-green-100', icon: '✅' },
      'preparing': { text: 'Preparando', color: 'text-blue-600', bg: 'bg-blue-100', icon: '👨‍🍳' },
      'ready': { text: 'Listo', color: 'text-purple-600', bg: 'bg-purple-100', icon: '🍽️' },
      'completed': { text: 'Completado', color: 'text-green-700', bg: 'bg-green-200', icon: '🎉' },
      'cancelled': { text: 'Cancelado', color: 'text-red-600', bg: 'bg-red-100', icon: '❌' }
    };
    
    return statusMap[status] || { text: status || 'Desconocido', color: 'text-gray-600', bg: 'bg-gray-100', icon: '❓' };
  };

  const getPaymentStatusDisplay = (paymentStatus) => {
    const statusMap = {
      'pending': { text: 'Pendiente', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '💳' },
      'paid': { text: 'Pagado', color: 'text-green-600', bg: 'bg-green-100', icon: '✅' },
      'failed': { text: 'Falló', color: 'text-red-600', bg: 'bg-red-100', icon: '❌' },
      'processing': { text: 'Procesando', color: 'text-blue-600', bg: 'bg-blue-100', icon: '🔄' }
    };
    
    return statusMap[paymentStatus] || { text: paymentStatus || 'Desconocido', color: 'text-gray-600', bg: 'bg-gray-100', icon: '❓' };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estado del pedido...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">😞</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No order found
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-4xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Pedido no encontrado</h2>
            <p className="text-gray-600">No se pudo encontrar el pedido solicitado.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(order.status);
  const paymentInfo = getPaymentStatusDisplay(order.paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold mb-2">Estado del Pedido</h1>
            <p className="opacity-90">ID: {order.id}</p>
            {restaurantName && (
              <p className="opacity-90">🏪 {restaurantName}</p>
            )}
          </div>

          {/* Status Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Order Status */}
              <div className={`p-4 rounded-lg ${statusInfo.bg}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{statusInfo.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Estado del Pedido</h3>
                    <p className={`${statusInfo.color} font-medium`}>{statusInfo.text}</p>
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div className={`p-4 rounded-lg ${paymentInfo.bg}`}>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{paymentInfo.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">Estado del Pago</h3>
                    <p className={`${paymentInfo.color} font-medium`}>{paymentInfo.text}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Detalles del Pedido</h3>
              
              {/* Order Items */}
              {order.items && order.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Artículos:</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <span className="font-medium">{item.name}</span>
                          <span className="text-gray-500 ml-2">x{item.quantity}</span>
                        </div>
                        <span className="font-medium">
                          ${typeof item.unit_price !== 'undefined' ? 
                            (item.unit_price * item.quantity).toLocaleString() : 
                            (item.price * item.quantity).toLocaleString()
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-lg">Total:</span>
                  <span className="font-bold text-xl text-green-600">
                    ${order.total ? order.total.toLocaleString() : 'N/A'} ARS
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              {order.customer && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Información del Cliente:</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><span className="font-medium">Nombre:</span> {order.customer.name}</p>
                    <p><span className="font-medium">Teléfono:</span> {order.customer.phone}</p>
                    {order.customer.email && (
                      <p><span className="font-medium">Email:</span> {order.customer.email}</p>
                    )}
                    {order.customer.address && (
                      <p><span className="font-medium">Dirección:</span> {order.customer.address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              {order.paymentMethod && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Método de Pago:</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="capitalize">
                      {order.paymentMethod === 'mercadopago' ? 'MercadoPago' : order.paymentMethod}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {order.notes && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">Notas:</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p>{order.notes}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-sm text-gray-500 border-t pt-4">
                {order.createdAt && (
                  <p>Creado: {new Date(order.createdAt.seconds * 1000).toLocaleString('es-AR')}</p>
                )}
                {order.updatedAt && (
                  <p>Última actualización: {new Date(order.updatedAt.seconds * 1000).toLocaleString('es-AR')}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver al Menú
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
