
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { firestoreAdmin } from '@/firebase/admin';

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function updateUserRole(userId: string, newRole: 'premium' | 'basic') {
    try {
        const userRef = firestoreAdmin.collection('users').doc(userId);
        await userRef.update({ role: newRole });
        console.log(`User role updated: ${userId} to ${newRole}`);
        return { success: true };
    } catch (error) {
        console.error(`Error updating user role for ${userId}:`, error);
        return { success: false, error: 'Failed to update user role in Firestore.' };
    }
}


export async function POST(req: NextRequest) {
  const sig = headers().get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // For one-time payments, we check the payment status.
      // For subscriptions, we would check the subscription status.
      if (session.payment_status === 'paid') {
        const userId = session.metadata?.userId;
        if (userId) {
          console.log(`Checkout session completed and paid for user: ${userId}`);
          await updateUserRole(userId, 'premium');
        } else {
          console.error('Webhook received checkout.session.completed without userId in metadata.');
        }
      } else {
        console.log(`Checkout session completed for user ${session.metadata?.userId}, but payment status is ${session.payment_status}.`);
      }
      break;
    }
    
    // The subscription events are no longer needed for a one-time payment model.
    // case 'customer.subscription.deleted':
    // case 'customer.subscription.updated': {
    //     // This logic is for subscriptions, can be removed or adapted if you have other subscription types.
    //     break;
    // }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
