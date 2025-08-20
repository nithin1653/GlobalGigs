
import * as admin from 'firebase-admin';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.');
}

const serviceAccountKey = JSON.parse(serviceAccount);

let adminApp: admin.app.App;

if (!admin.apps.length) {
  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: "https://globalgigs-default-rtdb.firebaseio.com",
  });
} else {
  adminApp = admin.app();
}

export { adminApp };
