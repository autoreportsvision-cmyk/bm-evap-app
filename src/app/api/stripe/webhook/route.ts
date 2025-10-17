
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestoreAdmin } from '@/firebase/admin';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function grantAccessAfterCheckout(session: Stripe.Checkout.Session) {
    // Para Payment Links, o client_reference_id precisa ser passado na URL.
    // Como ainda não estamos fazendo isso, vamos extrair o email e procurar o usuário.
    const customerEmail = session.customer_details?.email;
    const clientReferenceId = session.client_reference_id; // Pode ser nulo
    const paymentLinkId = session.payment_link;

    if (!customerEmail) {
        console.error(`Webhook Error: checkout.session.completed não continha o email do cliente.`);
        return { success: false, error: 'Email do cliente não encontrado na sessão de checkout.' };
    }

    const firestoreAdmin = getFirestoreAdmin();
    try {
        const usersRef = firestoreAdmin.collection('users');
        const querySnapshot = await usersRef.where('email', '==', customerEmail).limit(1).get();

        if (querySnapshot.empty) {
            console.error(`Webhook Error: Nenhum usuário encontrado com o email: ${customerEmail}`);
            return { success: false, error: `Usuário não encontrado.` };
        }
        
        const userDoc = querySnapshot.docs[0];
        const userId = userDoc.id;
        const userRef = userDoc.ref;

        // Determine o plano com base no ID do Payment Link
        const monthlyLink = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PAYMENT_LINK?.split('/').pop();
        const yearlyLink = process.env.NEXT_PUBLIC_STRIPE_YEARLY_PAYMENT_LINK?.split('/').pop();
        
        let plan: 'monthly' | 'yearly' | null = null;
        if (paymentLinkId?.includes(monthlyLink!)) {
            plan = 'monthly';
        } else if (paymentLinkId?.includes(yearlyLink!)) {
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

        console.log(`Acesso premium concedido para o usuário ${userId} com o plano ${plan}. Expira em ${expirationDate.toISOString()}`);
        return { success: true };
    } catch (error) {
        console.error(`Erro ao processar o webhook para ${customerEmail}:`, error);
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
