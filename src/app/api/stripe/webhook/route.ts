
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { firestoreAdmin } from '@/firebase/admin';

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function updateUserRoleWithExpiration(userId: string, plan: 'monthly' | 'yearly') {
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
      
      if (session.payment_status === 'paid') {
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as 'monthly' | 'yearly';

        if (userId && plan) {
          console.log(`Checkout session completed and paid for user: ${userId} with plan: ${plan}`);
          await updateUserRoleWithExpiration(userId, plan);
        } else {
          console.error('Webhook received checkout.session.completed without userId or plan in metadata.');
        }
      } else {
        console.log(`Checkout session completed for user ${session.metadata?.userId}, but payment status is ${session.payment_status}.`);
      }
      break;
    }
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
