
import * as admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

try {
    const serviceAccount = JSON.parse(serviceAccountString);

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://globalgigs-default-rtdb.firebaseio.com",
      });
    }
    
} catch (e: any) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.", e);
    throw new Error("Failed to initialize Firebase Admin SDK.");
}

// Re-export the initialized app
export const adminApp = admin.app();
