import { initializeApp, getApps, getApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Initialize Firebase configuration from environment variables.
// Fallback values match the provided 'skillizee-products' project.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key-placeholder",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "skillizee-products.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "skillizee-products",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "skillizee-products.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:mockappid"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Firebase Storage instance
const storage = getStorage(app);

/**
 * Uploads a file to Firebase Storage under the 'alumni_dashboard' folder.
 * If credentials are mock placeholders, it falls back to simulating the upload with a local/Object URL.
 * 
 * @param file The file object to upload
 * @param path The storage path (e.g. 'avatars/user-123.jpg')
 * @returns Promise resolving to the download URL
 */
export async function uploadFileToStorage(file: File, path: string): Promise<string> {
  // If the apiKey is the placeholder, simulate upload locally by converting to compressed Base64
  if (firebaseConfig.apiKey === "mock-api-key-placeholder") {
    console.warn("Using mock Firebase configuration. Converting to Base64...");
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 256;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            resolve(dataUrl);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => {
          resolve(event.target?.result as string);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  try {
    // Prefix path to organize inside the 'alumni_dashboard' folder
    const fullPath = path.startsWith('alumni_dashboard/') ? path : `alumni_dashboard/${path}`;
    const storageRef = ref(storage, fullPath);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error("Firebase Storage Upload failed: ", error);
    throw error;
  }
}

export { app, storage };
