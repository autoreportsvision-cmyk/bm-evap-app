
import Stripe from 'stripe';

// The STRIPE_API_KEY is now checked within the server action that uses it.
// This prevents the app from crashing on startup if the key is not set.
export const stripe = new Stripe(process.env.STRIPE_API_KEY ?? '', {
  apiVersion: '2024-06-20',
  typescript: true,
});
