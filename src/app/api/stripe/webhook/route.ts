
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { firestoreAdmin } from '@/firebase/admin';

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function updateUserRoleWithExpiration(userId: string) {
    try {
        const userRef = firestoreAdmin.collection('users').doc(userId);
        
        // Calculate expiration date (1 year from now)
        const now = new Date();
        const expirationDate = new Date(now.setFullYear(now.getFullYear() + 1));

        await userRef.update({ 
            role: 'premium',
            accessExpiration: expirationDate, // Set the expiration date
        });

        console.log(`User role updated to premium for ${userId} with expiration on ${expirationDate.toISOString()}`);
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
        if (userId) {
          console.log(`Checkout session completed and paid for user: ${userId}`);
          await updateUserRoleWithExpiration(userId);
        } else {
          console.error('Webhook received checkout.session.completed without userId in metadata.');
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
