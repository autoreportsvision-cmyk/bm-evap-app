
import * as admin from 'firebase-admin';

// Make sure to initialize the app only once
if (!admin.apps.length) {
  try {
    // When running in a Google Cloud environment (like Firebase App Hosting),
    // the SDK automatically uses the GOOGLE_APPLICATION_CREDENTIALS.
    // Locally, this env var needs to be set to your service account key file.
    admin.initializeApp();
  } catch (error: any) {
    console.error('Firebase Admin initialization error:', error.message);
    // This log helps diagnose setup issues in different environments.
  }
}

// It's safer to export functions that return the services
// to ensure they are accessed after initialization.
export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();
