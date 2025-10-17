
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getFirestoreAdmin } from '@/firebase/admin';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

async function grantAccessAfterCheckout(session: Stripe.Checkout.Session) {
    const clientReferenceId = session.client_reference_id;

    if (!clientReferenceId) {
        console.error(`[WEBHOOK_ERROR] checkout.session.completed não continha o client_reference_id (User ID). Session ID: ${session.id}`);
        return { success: false, error: 'User ID não encontrado na sessão de checkout.' };
    }

    const firestoreAdmin = getFirestoreAdmin();
    try {
        const userRef = firestoreAdmin.collection('users').doc(clientReferenceId);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.error(`[WEBHOOK_ERROR] Nenhum usuário encontrado com o ID: ${clientReferenceId}`);
            return { success: false, error: `Usuário não encontrado.` };
        }

        const lineItems = session.line_items;
        
        if (!lineItems || lineItems.data.length === 0 || !lineItems.data[0].price) {
            console.error(`[WEBHOOK_ERROR] Não foi possível encontrar o price_id nos line_items da sessão: ${session.id}. Dados da sessão:`, JSON.stringify(session, null, 2));
            return { success: false, error: 'Não foi possível identificar o item comprado.' };
        }
        
        const priceId = lineItems.data[0].price.id;
        console.log(`[WEBHOOK_INFO] Price ID recebido do Stripe: ${priceId}`);


        const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
        const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID;
        console.log(`[WEBHOOK_INFO] Price IDs do .env: Mensal=${monthlyPriceId}, Anual=${yearlyPriceId}`);
        
        let plan: 'monthly' | 'yearly' | null = null;
        if (priceId === monthlyPriceId) {
            plan = 'monthly';
        } else if (priceId === yearlyPriceId) {
            plan = 'yearly';
        }
        
        if (!plan) {
            console.error(`[WEBHOOK_ERROR] O price_id "${priceId}" não corresponde a nenhum plano configurado (mensal ou anual). Verifique os IDs no .env e no Stripe.`);
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

        console.log(`[WEBHOOK_SUCCESS] ACESSO CONCEDIDO: Usuário ${clientReferenceId} agora é premium com o plano ${plan}. Expira em ${expirationDate.toISOString()}`);
        return { success: true };
    } catch (error) {
        console.error(`[WEBHOOK_ERROR] Erro GERAL ao processar o webhook para o usuário ${clientReferenceId}:`, error);
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
    console.error(`[WEBHOOK_ERROR] Falha na verificação da assinatura do Webhook: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Lidar apenas com o evento que confirma a conclusão de um pagamento.
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    if (session.payment_status === 'paid') {
      try {
        const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
            session.id,
            { expand: ['line_items.data.price.product'] } // Expande tudo que precisamos
        );

        const result = await grantAccessAfterCheckout(sessionWithLineItems);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
      } catch (error) {
        console.error(`[WEBHOOK_ERROR] Falha ao buscar sessão expandida ou ao processar o acesso: `, error);
        return NextResponse.json({ error: 'Falha interna ao processar o pagamento.' }, { status: 500 });
      }
    } else {
      console.log(`[WEBHOOK_INFO] Sessão ${session.id} completada, mas pagamento não está 'paid' (status: ${session.payment_status})`);
    }
  }

  return NextResponse.json({ received: true });
}
