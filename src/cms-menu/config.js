export const MENU_CONFIG = {
  firebaseConfig: {
    apiKey: "AIzaSyDHi_a1trI35goPoKcNPUDBMOSLKjvZKyc",
    authDomain: "cms-menu-7b4a4.firebaseapp.com",
    projectId: "cms-menu-7b4a4",
    storageBucket: "cms-menu-7b4a4.firebasestorage.app",
    messagingSenderId: "509736809578",
    appId: "1:509736809578:web:15471af092f3b46392c613",
    measurementId: "G-X4F9XDEL13"
  },
  
  // UID del restaurante configurado
  restaurantId: "HsuTZWhRVkT88a0WOztELGzJUhl1", // Debe coincidir con el Secret Manager
  
  // MercadoPago configuration - PRODUCCIÓN
  mercadoPago: {
    publicKey: "APP_USR-6359a306-23ca-4d23-924e-b72a3fd1816f", // Tu public key de producción
    currency: "ARS",
    enabled: true // Habilitado para producción
  },
  
  // URLs de tu aplicación - PRODUCCIÓN
  baseUrl: "https://juanmaacampos.github.io/restaurant_template", // URL de producción GitHub Pages
  backendUrl: "https://us-central1-cms-menu-7b4a4.cloudfunctions.net" // Cloud Functions URL
};
