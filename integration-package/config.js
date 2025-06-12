// Configuración para la integración del menú CMS
// ⚠️ IMPORTANTE: Reemplaza estos valores con tu configuración real

export const MENU_CONFIG = {
  // Configuración de Firebase (copia desde tu Firebase Console)
  firebaseConfig: {
    apiKey: "AIzaSyDHi_a1trI35goPoKcNPUDBMOSLKjvZKyc",
    authDomain: "cms-menu-7b4a4.firebaseapp.com",
    projectId: "cms-menu-7b4a4",
    storageBucket: "cms-menu-7b4a4.firebasestorage.app",
    messagingSenderId: "509736809578",
    appId: "1:509736809578:web:15471af092f3b46392c613"
  },
  
  // ✅ Restaurant ID configurado
  restaurantId: "HsuTZWhRVkT88a0WOztELGzJUhl1"
};

// Función para obtener el UID del restaurante
// Instrucciones:
// 1. Ve a tu CMS panel y haz login con la cuenta del restaurante
// 2. Abre las herramientas de desarrollador (F12)
// 3. En la consola ejecuta: firebase.auth().currentUser.uid
// 4. Copia ese UID y reemplaza "YOUR_RESTAURANT_UID_HERE" arriba

export function validateConfig() {
  if (MENU_CONFIG.restaurantId === "YOUR_RESTAURANT_UID_HERE") {
    console.warn("⚠️ Configuración incompleta!");
    console.log("📝 Para obtener tu Restaurant UID:");
    console.log("1. Ve a tu panel CMS de menús");
    console.log("2. Haz login con la cuenta del restaurante");
    console.log("3. Abre las herramientas de desarrollador (F12)");
    console.log("4. En la consola ejecuta: firebase.auth().currentUser.uid");
    console.log("5. Copia ese UID a config.js");
    return false;
  }
  return true;
}
