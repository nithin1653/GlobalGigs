
import * as admin from 'firebase-admin';

const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let adminApp: admin.app.App;

if (!admin.apps.length) {
    if (!serviceAccountString) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
    }

    try {
        const serviceAccount = JSON.parse(serviceAccountString);

        adminApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://globalgigs-default-rtdb.firebaseio.com",
        });
        
    } catch (e: any) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it's a valid JSON string.", e);
        throw new Error("Failed to initialize Firebase Admin SDK.");
    }
} else {
    adminApp = admin.app();
}

// Re-export the initialized app
export { adminApp };
