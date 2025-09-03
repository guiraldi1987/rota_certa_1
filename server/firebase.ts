import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Configuração do Firebase Admin SDK
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Inicializar Firebase Admin apenas se ainda não foi inicializado
let app;
if (!getApps().length) {
  app = initializeApp({
    credential: cert(firebaseConfig),
    projectId: firebaseConfig.projectId,
  });
} else {
  app = getApps()[0];
}

// Inicializar Firestore
export const db = getFirestore(app);

// Inicializar Auth
export const auth = getAuth(app);

// Configurações do Firestore
db.settings({
  ignoreUndefinedProperties: true,
});

export default app;