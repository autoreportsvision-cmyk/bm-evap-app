
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestoreAdmin } from '@/firebase/admin';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function grantAccessAfterCheckout(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    
    if (!session.line_items) {
         console.error('Webhook Error: checkout.session.completed não continha line_items.');
         return { success: false, error: 'Itens de linha ausentes na sessão de checkout.' };
    }

    // Acessando dinamicamente o priceId
    const priceId = session.line_items.data[0]?.price?.id;
    const plan = priceId === process.env.STRIPE_YEARLY_PRICE_ID ? 'yearly' : 'monthly';


    if (!userId) {
        console.error(`Webhook Error: checkout.session.completed não continha o userId nos metadados.`);
        return { success: false, error: 'Metadados ausentes na sessão de checkout.' };
    }
    
    const firestoreAdmin = getFirestoreAdmin();
    try {
        const userRef = firestoreAdmin.collection('users').doc(userId);
        
        const now = new Date();
        const expirationDate = new Date(now);

        if (plan === 'yearly') {
          expirationDate.setFullYear(now.getFullYear() + 1);
        } else if (plan === 'monthly') {
          expirationDate.setMonth(now.getMonth() + 1);
        } else {
            console.error(`Tipo de plano inválido no webhook: ${plan}`);
            return { success: false, error: `Tipo de plano inválido: ${plan}` };
        }

        await userRef.update({ 
            role: 'premium',
            accessExpiration: expirationDate,
        });

        console.log(`Acesso premium concedido para o usuário ${userId} com o plano ${plan}. Expira em ${expirationDate.toISOString()}`);
        return { success: true };
    } catch (error) {
        console.error(`Erro ao atualizar o papel do usuário ${userId} no Firestore:`, error);
        return { success: false, error: 'Falha ao atualizar o papel do usuário no Firestore.' };
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
      
      if (session.payment_status === 'paid') {
        const result = await grantAccessAfterCheckout(session);
        if (!result.success) {
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
