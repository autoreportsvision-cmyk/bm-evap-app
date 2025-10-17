
import { Stripe, loadStripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (publishableKey) {
  stripePromise = loadStripe(publishableKey);
} else {
  console.error("Stripe publishable key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) is not set in environment variables.");
  stripePromise = Promise.resolve(null);
}

export const getStripe = () => {
  return stripePromise;
};
