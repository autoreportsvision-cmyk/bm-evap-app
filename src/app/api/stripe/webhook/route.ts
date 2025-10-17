
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestoreAdmin } from '@/firebase/admin';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function grantAccessAfterCheckout(session: Stripe.Checkout.Session) {
    const clientReferenceId = session.client_reference_id;
    const paymentLinkId = session.payment_link;

    if (!clientReferenceId) {
        return { success: false, error: 'User ID (client_reference_id) não encontrado na sessão de checkout.', status: 400 };
    }
    
    if (!paymentLinkId) {
        return { success: false, error: 'ID do Link de Pagamento (payment_link) não encontrado na sessão.', status: 400 };
    }

    const firestoreAdmin = getFirestoreAdmin();
    try {
        const userRef = firestoreAdmin.collection('users').doc(clientReferenceId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return { success: false, error: `Usuário com ID ${clientReferenceId} não encontrado no Firestore.`, status: 404 };
        }

        const monthlyPaymentLinkId = process.env.STRIPE_MONTHLY_PAYMENT_LINK_ID;
        const yearlyPaymentLinkId = process.env.STRIPE_YEARLY_PAYMENT_LINK_ID;
        
        let plan: 'monthly' | 'yearly' | null = null;
        if (paymentLinkId === monthlyPaymentLinkId) {
            plan = 'monthly';
        } else if (paymentLinkId === yearlyPaymentLinkId) {
            plan = 'yearly';
        }
        
        if (!plan) {
            return { success: false, error: `O payment_link_id "${paymentLinkId}" recebido não corresponde a nenhum plano configurado (mensal ou anual).`, status: 400 };
        }

        const now = new Date();
        const expirationDate = new Date(now);

        if (plan === 'yearly') {
          expirationDate.setFullYear(now.getFullYear() + 1);
        } else { // monthly
          expirationDate.setMonth(now.getMonth() + 1);
        }

        await userRef.update({ 
            role: 'premium',
            accessExpiration: expirationDate,
        });

        return { success: true, status: 200 };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
        return { success: false, error: `Falha ao processar o webhook: ${errorMessage}`, status: 500 };
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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.payment_status === 'paid') {
      const result = await grantAccessAfterCheckout(session);
      if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: result.status });
      }
    }
  }

  return NextResponse.json({ received: true });
}
