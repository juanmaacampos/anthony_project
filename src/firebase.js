/**
 * Firebase Configuration and Exports
 * Centralized Firebase setup for the restaurant checkout system
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { MENU_CONFIG } from './cms-menu/config.js';

// Initialize Firebase App
const app = initializeApp(MENU_CONFIG.firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1'); // Specify region to match deployed functions

// Connect to emulator in development (uncomment if using emulators)
// if (import.meta.env.DEV) {
//   connectFunctionsEmulator(functions, 'localhost', 5001);
// }

export default app;
