/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  : undefined;

let isInitialized = false;

if (getApps().length === 0) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      isInitialized = true;
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
    }
  } else {
    console.warn('Firebase Admin environment variables are missing. Skipping initialization.');
  }
} else {
  isInitialized = true;
}

// Export a proxy object to protect collection accesses during static build pre-rendering
export const firestore = new Proxy({} as any, {
  get(target, prop) {
    if (prop === 'collection') {
      return (name: string) => {
        if (!isInitialized && getApps().length === 0) {
          throw new Error("Firebase Admin SDK is not initialized. Please configure your environment variables.");
        }
        return getFirestore().collection(name);
      };
    }
    return (target as any)[prop];
  }
});
