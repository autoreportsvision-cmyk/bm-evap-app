
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { firestoreAdmin } from '@/firebase/admin';

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function handleSubscription(userId: string, plan: 'monthly' | 'yearly') {
    try {
        const userRef = firestoreAdmin.collection('users').doc(userId);
        
        const now = new Date();
        const expirationDate = new Date(now);

        if (plan === 'yearly') {
          expirationDate.setFullYear(now.getFullYear() + 1);
        } else if (plan === 'monthly') {
          expirationDate.setMonth(now.getMonth() + 1);
        } else {
            throw new Error(`Invalid plan type: ${plan}`);
        }

        await userRef.update({ 
            role: 'premium',
            accessExpiration: expirationDate,
        });

        console.log(`User role updated to premium for ${userId} with plan ${plan}. Expiration on ${expirationDate.toISOString()}`);
        return { success: true };
    } catch (error) {
        console.error(`Error updating user role for ${userId}:`, error);
        return { success: false, error: 'Failed to update user role in Firestore.' };
    }
}

async function handleCheckoutSession(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const plan = session.metadata?.plan as 'monthly' | 'yearly' | undefined;

  if (!userId || !plan) {
    console.error('Webhook received checkout.session.completed without userId or plan in metadata.');
    return;
  }
  
  // For subscriptions, payment is not 'paid' immediately in checkout.session.completed.
  // The 'invoice.paid' event is more reliable for subscriptions.
  // For one-time payments, 'paid' is correct. We handle both for robustness.
  if (session.mode === 'subscription' || session.payment_status === 'paid') {
      console.log(`Checkout session for subscription/payment completed for user: ${userId} with plan: ${plan}`);
      await handleSubscription(userId, plan);
  } else {
      console.log(`Checkout session completed for user ${userId}, but payment status is ${session.payment_status}. Waiting for invoice payment.`);
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription;
  if (typeof subscriptionId !== 'string') {
      console.log('Invoice paid event without a subscription ID.');
      return;
  }
  
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.userId;
    const plan = subscription.metadata?.plan as 'monthly' | 'yearly' | undefined;

    if (userId && plan) {
      console.log(`Invoice paid for subscription. Granting access to user: ${userId} for plan: ${plan}`);
      await handleSubscription(userId, plan);
    } else {
      console.error('Invoice paid, but subscription metadata is missing userId or plan.');
    }
  } catch (error) {
      console.error('Error retrieving subscription details from invoice.paid event:', error);
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
      await handleCheckoutSession(session);
      break;
    }
    case 'invoice.paid': {
        // This event is often more reliable for confirming a subscription has started.
        const invoice = event.data.object as Stripe.Invoice;
        // We only care about the first invoice payment of a subscription
        if (invoice.billing_reason === 'subscription_create') {
           await handleInvoicePaid(invoice);
        }
        break;
    }
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
