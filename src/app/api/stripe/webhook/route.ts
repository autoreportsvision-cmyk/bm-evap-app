
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
      const userId = session.metadata?.userId;
      if (userId) {
        console.log(`Checkout session completed for user: ${userId}`);
        await updateUserRole(userId, 'premium');
      } else {
        console.error('Webhook received checkout.session.completed without userId in metadata.');
      }
      break;
    }
    case 'customer.subscription.deleted':
    case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        // The user ID might not be directly in the subscription event metadata.
        // You often need to retrieve the customer, and from the customer, find your internal user ID.
        // For simplicity, we assume we can get it. In a real app, you might need another lookup step.
        const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
        const userId = customer.metadata.userId;

        if (userId) {
            const newStatus = subscription.status;
            // If subscription is no longer active, downgrade user to 'basic'.
            if (newStatus !== 'active' && newStatus !== 'trialing') {
                console.log(`Subscription for user ${userId} is no longer active. Downgrading role.`);
                await updateUserRole(userId, 'basic');
            }
        } else {
             console.error('Webhook for subscription update/delete did not have a resolvable userId.');
        }

        break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
