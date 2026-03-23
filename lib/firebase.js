import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDLk7j_zvJ-piPcdbSj0BOwI9eQPylpqo0',
  authDomain: 'sneakoutwebv1.firebaseapp.com',
  projectId: 'sneakoutwebv1',
  storageBucket: 'sneakoutwebv1.firebasestorage.app',
  messagingSenderId: '647559661076',
  appId: '1:647559661076:web:c7d4d700145c65a141c901',
  measurementId: 'G-L1VJK3XN3P',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
