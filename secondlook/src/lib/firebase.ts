import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
}

// Configured when all required env vars are present
export const firebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID
)

// Always initialize — if not configured, placeholders prevent crashes
// and the app renders a SetupScreen before any Firebase calls are made
export const app = initializeApp(
  firebaseConfigured
    ? firebaseConfig
    : {
        apiKey: 'placeholder',
        authDomain: 'placeholder.firebaseapp.com',
        projectId: 'placeholder',
        storageBucket: 'placeholder.appspot.com',
        messagingSenderId: '000000000000',
        appId: '1:000000000000:web:placeholder',
      }
)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)
