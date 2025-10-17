
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestoreAdmin } from '@/firebase/admin';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function grantAccessAfterCheckout(session: Stripe.Checkout.Session) {
    // O client_reference_id é o ID do usuário que passamos no componente do Buy Button
    const clientReferenceId = session.client_reference_id;
    // O payment_link é o ID do link de pagamento que foi usado para a compra
    const paymentLinkId = session.payment_link;

    if (!clientReferenceId) {
        console.error(`Webhook Error: checkout.session.completed não continha o client_reference_id (User ID).`);
        return { success: false, error: 'User ID não encontrado na sessão de checkout.' };
    }

    if (!paymentLinkId) {
        console.error(`Webhook Error: checkout.session.completed não continha o payment_link_id.`);
        return { success: false, error: 'Payment Link ID não encontrado na sessão de checkout.' };
    }

    const firestoreAdmin = getFirestoreAdmin();
    try {
        const userRef = firestoreAdmin.collection('users').doc(clientReferenceId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error(`Webhook Error: Nenhum usuário encontrado com o ID: ${clientReferenceId}`);
            return { success: false, error: `Usuário não encontrado.` };
        }
        
        // Determinamos o plano com base no ID do Payment Link que vem no evento do webhook.
        // Comparamos com os IDs que estão no nosso .env.
        const monthlyLinkId = process.env.STRIPE_MONTHLY_PAYMENT_LINK_ID;
        const yearlyLinkId = process.env.STRIPE_YEARLY_PAYMENT_LINK_ID;
        
        let plan: 'monthly' | 'yearly' | null = null;
        if (paymentLinkId === monthlyLinkId) {
            plan = 'monthly';
        } else if (paymentLinkId === yearlyLinkId) {
            plan = 'yearly';
        }
        
        if (!plan) {
            console.error(`Webhook Error: Não foi possível determinar o plano a partir do payment_link_id: ${paymentLinkId}`);
            return { success: false, error: 'Não foi possível determinar o plano comprado.' };
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

        console.log(`Acesso premium concedido para o usuário ${clientReferenceId} com o plano ${plan}. Expira em ${expirationDate.toISOString()}`);
        return { success: true };
    } catch (error) {
        console.error(`Erro ao processar o webhook para o usuário ${clientReferenceId}:`, error);
        return { success: false, error: 'Falha ao processar o webhook e atualizar o usuário.' };
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

  // Lidar apenas com o evento que confirma a conclusão de um pagamento.
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Verificamos se o pagamento foi bem-sucedido
      if (session.payment_status === 'paid') {
        const result = await grantAccessAfterCheckout(session);
        if (!result.success) {
            // Retorna um erro 500 se a concessão de acesso falhar
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
      }
      break;
    }
    default:
      // console.log(`Evento de webhook não manipulado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
