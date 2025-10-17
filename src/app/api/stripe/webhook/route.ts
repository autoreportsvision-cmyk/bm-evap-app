
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestoreAdmin } from '@/firebase/admin';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function grantAccessAfterCheckout(session: Stripe.Checkout.Session) {
    const clientReferenceId = session.client_reference_id;

    if (!clientReferenceId) {
        console.error(`Webhook Error: checkout.session.completed não continha o client_reference_id (User ID). Session ID: ${session.id}`);
        return { success: false, error: 'User ID não encontrado na sessão de checkout.' };
    }

    const firestoreAdmin = getFirestoreAdmin();
    try {
        const userRef = firestoreAdmin.collection('users').doc(clientReferenceId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error(`Webhook Error: Nenhum usuário encontrado com o ID: ${clientReferenceId}`);
            return { success: false, error: `Usuário não encontrado.` };
        }

        // Tenta obter o priceId diretamente da sessão, se possível
        let priceId: string | undefined;

        // Se a sessão de checkout incluiu os line_items, eles estarão aqui
        if (session.line_items && session.line_items.data.length > 0) {
            priceId = session.line_items.data[0].price?.id;
        } else {
            // Como fallback, busca os line_items separadamente. Isso é menos eficiente, mas mais robusto.
            console.log(`Fallback: buscando line_items para a sessão ${session.id}`);
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
            priceId = lineItems.data[0]?.price?.id;
        }
        
        if (!priceId) {
            console.error(`Webhook Error: Não foi possível encontrar o price_id nos line_items da sessão: ${session.id}. Dados da sessão:`, JSON.stringify(session, null, 2));
            return { success: false, error: 'Não foi possível identificar o item comprado.' };
        }

        const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
        const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID;
        
        let plan: 'monthly' | 'yearly' | null = null;
        if (priceId === monthlyPriceId) {
            plan = 'monthly';
        } else if (priceId === yearlyPriceId) {
            plan = 'yearly';
        }
        
        if (!plan) {
            console.error(`Webhook Error: O price_id "${priceId}" não corresponde a nenhum plano configurado (mensal ou anual). Verifique os IDs no .env.`);
            return { success: false, error: 'O plano comprado não foi reconhecido.' };
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

        console.log(`ACESSO CONCEDIDO: Usuário ${clientReferenceId} agora é premium com o plano ${plan}. Expira em ${expirationDate.toISOString()}`);
        return { success: true };
    } catch (error) {
        console.error(`Erro GERAL ao processar o webhook para o usuário ${clientReferenceId}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido.';
        return { success: false, error: `Falha ao processar o webhook: ${errorMessage}` };
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

  // Lidar apenas com o evento que confirma a conclusão de um pagamento.
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Verificamos se o pagamento foi bem-sucedido
      if (session.payment_status === 'paid') {
        // Expande os line_items para garantir que tenhamos o priceId
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            { expand: ['line_items'] }
        );

        const result = await grantAccessAfterCheckout(sessionWithLineItems);
        if (!result.success) {
            // Retorna um erro 500 se a concessão de acesso falhar
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
      } else {
        console.log(`Sessão ${session.id} completada, mas pagamento não está 'paid' (status: ${session.payment_status})`);
      }
      break;
    }
    default:
      // console.log(`Evento de webhook não manipulado: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
