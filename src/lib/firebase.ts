import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, browserSessionPersistence, inMemoryPersistence, browserPopupRedirectResolver, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC55E2s1Ugd0ZV_IcJRL13pjHSGotTNoA0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'zaloon-aecb6.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zaloon-aecb6',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'zaloon-aecb6.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '400676871624',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:400676871624:web:a1d9167dee32844ba934fd',
  measurementId: 'G-E8YPBZJ7Z0',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// Local storage keeps the web session across visits without waiting for an
// IndexedDB upgrade/lock held by another tab. Fall back for private browsers.
const auth = (() => {
  // Next.js also evaluates client modules while rendering on the server;
  // browser persistence/resolver implementations only exist in the browser.
  if (typeof window === 'undefined') return getAuth(app);
  try {
    return initializeAuth(app, {
      persistence: [browserLocalPersistence, browserSessionPersistence, inMemoryPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/already-initialized') return getAuth(app);
    throw error;
  }
})();
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db, googleProvider };
