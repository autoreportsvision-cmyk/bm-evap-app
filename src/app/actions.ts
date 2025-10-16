
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
  uid: string
): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    if (!process.env.STRIPE_API_KEY) {
      throw new Error('A chave da API Stripe (STRIPE_API_KEY) não está configurada nas variáveis de ambiente.');
    }
    if (!process.env.STRIPE_PRICE_ID) {
      throw new Error('O ID do preço do Stripe (STRIPE_PRICE_ID) não está configurado nas variáveis de ambiente.');
    }
    
    const headersList = headers();
    const origin = headersList.get('origin');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        userId: uid,
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
