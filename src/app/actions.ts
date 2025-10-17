
'use server';

import { generateEffectEvaluations } from '@/ai/flows/generate-effect-evaluations';
import type { GenerateEffectEvaluationsInput, GenerateEffectEvaluationsOutput } from '@/ai/flows/generate-effect-evaluations';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-flow';
import { stripe } from '@/lib/stripe';
import { auth } from 'firebase-admin';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getAiEvaluations(input: GenerateEffectEvaluationsInput): Promise<{ success: boolean; data?: GenerateEffectEvaluationsOutput; error?: string }> {
  try {
    const evaluations = await generateEffectEvaluations(input);
    return { success: true, data: evaluations };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao gerar avaliações de IA.' };
  }
}

export async function getChatResponse(input: ChatInput): Promise<{ success: boolean; data?: string; error?: string; }> {
    try {
        const response = await chat(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Falha ao obter resposta do chat.' };
    }
}


export async function createCheckoutSession(
  uid: string,
  priceId: string,
  plan: 'monthly' | 'yearly'
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const stripeApiKey = process.env.STRIPE_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!stripeApiKey) {
      throw new Error('A chave da API Stripe (STRIPE_API_KEY) não está configurada nas variáveis de ambiente.');
    }
    if (!priceId) {
      throw new Error('O ID do preço do Stripe não foi fornecido.');
    }
    if (!appUrl) {
        throw new Error('A URL da aplicação (NEXT_PUBLIC_APP_URL) não está configurada nas variáveis de ambiente.');
    }
    
    // Assinaturas usam o modo 'subscription', pagamentos únicos usam 'payment'
    const mode = (plan === 'monthly' || plan === 'yearly') ? 'subscription' : 'payment';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      success_url: `${appUrl}/`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        userId: uid,
        plan: plan, // Pass the plan to the webhook
      },
    });

    if (!session.id) {
        throw new Error('Could not create Stripe checkout session');
    }

    return { success: true, sessionId: session.id };
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { success: false, error: `Falha ao criar sessão de checkout: ${errorMessage}` };
  }
}
