import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Configuração do Firebase para o cliente
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAn-mUnj5tF51ZHjrfsXghvSwlhPdERdec",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "rotacerta-44aef.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "rotacerta-44aef",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "rotacerta-44aef.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "164967131364",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:164967131364:web:9fba0fc0ebf5a3070be4f1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-V6NG7L232R"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Auth
export const auth = getAuth(app);

// Inicializar Analytics (apenas em produção)
export const analytics = typeof window !== 'undefined' && !import.meta.env.DEV ? getAnalytics(app) : null;

// Emuladores desabilitados - usando Firebase em produção
// Para habilitar emuladores, descomente as linhas abaixo e inicie os emuladores
/*
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulador já conectado
  }
  
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    // Emulador já conectado
  }
}
*/

export default app;