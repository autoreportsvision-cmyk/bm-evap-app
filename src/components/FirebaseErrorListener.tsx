'use client';

import { useState, useEffect } from 'react';
import { errorEmitter, AppEvents } from '@/firebase/error-emitter';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * It throws any received error to be caught by Next.js's global-error.tsx.
 * It is specifically designed for Firestore permission errors and will ignore other error types.
 */
export function FirebaseErrorListener() {
  // Use a generic Error type for the state, but we will only throw specific instances.
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // The callback now expects a payload that matches one of the event types in AppEvents.
    const handleError = (errorPayload: AppEvents[keyof AppEvents]) => {
      // Check if the received error is an instance of FirestorePermissionError.
      // This ensures we only handle the specific errors this component is designed for.
      if (errorPayload.name === 'FirestorePermissionError') {
        // Set error in state to trigger a re-render.
        setError(errorPayload);
      }
    };

    // Subscribe to the 'permission-error' event.
    errorEmitter.on('permission-error', handleError);

    // Unsubscribe on unmount to prevent memory leaks.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // On re-render, if an error exists in state, throw it.
  // This will be caught by Next.js's error boundary.
  if (error) {
    throw error;
  }

  // This component renders nothing.
  return null;
}
