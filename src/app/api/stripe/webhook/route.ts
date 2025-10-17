
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestoreAdmin } from '@/firebase/admin';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function grantAccessAfterCheckout(session: Stripe.Checkout.Session) {
    const clientReferenceId = session.client_reference_id;
    // CORREÇÃO: O campo correto é `payment_link`
    const paymentLink = session.payment_link;

    if (!clientReferenceId) {
        console.error('Webhook Error: client_reference_id não encontrado na sessão do Stripe.');
        return { success: false, error: 'User ID (client_reference_id) não encontrado na sessão de checkout.', status: 400 };
    }
    
    if (!paymentLink) {
        console.error('Webhook Error: payment_link não encontrado na sessão do Stripe.');
        return { success: false, error: 'ID do Link de Pagamento (payment_link) não encontrado na sessão.', status: 400 };
    }

    const firestoreAdmin = getFirestoreAdmin();
    try {
        const userRef = firestoreAdmin.collection('users').doc(clientReferenceId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error(`Webhook Error: Usuário com ID ${clientReferenceId} não encontrado no Firestore.`);
            return { success: false, error: `Usuário com ID ${clientReferenceId} não encontrado no Firestore.`, status: 404 };
        }

        const monthlyPaymentLinkId = process.env.STRIPE_MONTHLY_PAYMENT_LINK_ID;
        const yearlyPaymentLinkId = process.env.STRIPE_YEARLY_PAYMENT_LINK_ID;
        
        let plan: 'monthly' | 'yearly' | null = null;
        
        // CORREÇÃO: Comparando `paymentLink` com as variáveis de ambiente
        if (paymentLink === monthlyPaymentLinkId) {
            plan = 'monthly';
        } else if (paymentLink === yearlyPaymentLinkId) {
            plan = 'yearly';
        }
        
        if (!plan) {
            console.error(`Webhook Error: O payment_link "${paymentLink}" não corresponde a nenhum plano configurado.`);
            return { success: false, error: `O payment_link "${paymentLink}" recebido não corresponde a nenhum plano configurado (mensal ou anual).`, status: 400 };
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

        console.log(`Sucesso: Acesso Premium concedido ao usuário ${clientReferenceId} até ${expirationDate.toISOString()}`);
        return { success: true, status: 200 };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no servidor.';
        console.error('Webhook Error: Falha ao processar o webhook no Firestore.', error);
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
    console.error(`Webhook Signature Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.payment_status === 'paid') {
      const result = await grantAccessAfterCheckout(session);
      if (!result.success) {
          // O console.error já está dentro da função grantAccessAfterCheckout
          return NextResponse.json({ error: result.error }, { status: result.status });
      }
    }
  }

  return NextResponse.json({ received: true });
}
