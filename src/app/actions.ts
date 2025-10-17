
'use server';

import { generateEffectEvaluations } from '@/ai/flows/generate-effect-evaluations';
import type { GenerateEffectEvaluationsInput, GenerateEffectEvaluationsOutput } from '@/ai/flows/generate-effect-evaluations';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-flow';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

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
): Promise<{ sessionId: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!process.env.STRIPE_API_KEY) {
    throw new Error('A chave da API Stripe (STRIPE_API_KEY) não está configurada nas variáveis de ambiente.');
  }
  if (!priceId) {
    throw new Error('O ID do preço do Stripe não foi fornecido.');
  }
  if (!appUrl) {
    throw new Error('A URL da aplicação (NEXT_PUBLIC_APP_URL) não está configurada nas variáveis de ambiente.');
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/`,
      cancel_url: `${appUrl}/pricing`,
      metadata: {
        userId: uid,
        plan: plan,
      },
    });

    if (!session.id) {
        throw new Error("A sessão de checkout retornada pelo Stripe não continha um ID.");
    }

    // Return a plain object with just the session ID
    return { sessionId: session.id };

  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Re-throw a more specific error to be caught by the client-side caller.
    throw new Error(`Falha ao criar sessão de checkout: ${errorMessage}`);
  }
}
