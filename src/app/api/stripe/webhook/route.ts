
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestoreAdmin } from '@/firebase/admin';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function grantAccessAfterCheckout(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan as 'monthly' | 'yearly' | undefined;

    if (!userId || !plan) {
        console.error(`Webhook Error: checkout.session.completed não continha os metadados necessários (userId: ${userId}, plan: ${plan}).`);
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

  // Lidar apenas com o evento que confirma a conclusão de um pagamento único.
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // A verificação de payment_status é importante.
      if (session.payment_status === 'paid') {
        const result = await grantAccessAfterCheckout(session);
        if (!result.success) {
            // Se algo der errado ao conceder acesso, retorne um erro 500 para que o Stripe possa tentar novamente.
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
      }
      break;
    }
    default:
      // Não manipule outros eventos, apenas registre-os se necessário.
      // console.log(`Evento de webhook não manipulado: ${event.type}`);
  }

  // Retorne uma resposta 200 para o Stripe para confirmar o recebimento do evento.
  return NextResponse.json({ received: true });
}
