import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../firebase-applet-config.json';

// Firebase config prefers Vite env vars (set via .env / CI secrets) and falls
// back to the bundled firebase-applet-config.json for local development.
// Create a .env file (see .env.example) to override with your own project keys.
const firebaseConfigEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId
};

const firestoreDatabaseId =
  import.meta.env.VITE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId;

const app = initializeApp(firebaseConfigEnv);

/**
 * Firebase App Check (reCAPTCHA v3).
 *
 * Yalnızca `VITE_RECAPTCHA_SITE_KEY` tanımlıysa ve tarayıcı ortamındaysa
 * başlatılır. Capacitor WebView'de reCAPTCHA güvenilir çalışmadığı için native
 * kabukta atlanır — bu durumda Firestore/Auth çağrıları App Check token'ı
 * olmadan gider ve Firebase Console'da "Enforce" açıksa reddedilir.
 * Ayrıntılar: docs/observability.md
 */
const recaptchaSiteKey = String(import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? '').trim();
const appCheckDebugToken = String(import.meta.env.VITE_APPCHECK_DEBUG_TOKEN ?? '').trim();

const isNativeShell = () => {
  if (typeof window === 'undefined') return false;
  const capacitor = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(capacitor?.isNativePlatform?.());
};

if (typeof window !== 'undefined' && recaptchaSiteKey && !isNativeShell()) {
  try {
    if (appCheckDebugToken) {
      (self as unknown as Record<string, unknown>).FIREBASE_APPCHECK_DEBUG_TOKEN =
        appCheckDebugToken === 'true' ? true : appCheckDebugToken;
    }
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(recaptchaSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    // Yanlış site anahtarı tüm Firebase'i düşürmesin; uyarı bırak ve devam et.
    console.warn('[appcheck] başlatılamadı:', error);
  }
}

export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
