
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  // When running in a Google Cloud environment, the GOOGLE_APPLICATION_CREDENTIALS
  // environment variable is automatically set. The SDK uses this to initialize.
  // In a local development environment, you must set this variable manually.
  try {
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
    // If you are running locally, make sure you have the GOOGLE_APPLICATION_CREDENTIALS
    // environment variable set to the path of your service account key file.
  }
}

export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();
