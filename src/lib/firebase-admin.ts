
import * as admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

try {
    const serviceAccount = JSON.parse(serviceAccountString);

    let adminApp: admin.app.App;

    if (!admin.apps.length) {
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://globalgigs-default-rtdb.firebaseio.com",
      });
    } else {
      adminApp = admin.app();
    }

    // Ensure databaseURL is part of the options for subsequent app() calls if needed
    if (adminApp.options.databaseURL !== "https://globalgigs-default-rtdb.firebaseio.com") {
        // This is a bit of a hack, but if the app was initialized without the URL,
        // we can't easily add it. Re-initializing is complex.
        // For most cases, the initial check is sufficient.
        // console.warn("Firebase admin app was already initialized without the correct databaseURL.");
    }
    
    
    

    
} catch (e: any) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.", e);
    throw new Error("Failed to initialize Firebase Admin SDK.");
}

// Re-export the initialized app
export const adminApp = admin.app();
