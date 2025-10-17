
'use server';

import { generateEffectEvaluations } from '@/ai/flows/generate-effect-evaluations';
import type { GenerateEffectEvaluationsInput, GenerateEffectEvaluationsOutput } from '@/ai/flows/generate-effect-evaluations';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-flow';
import { stripe } from '@/lib/stripe';
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
): Promise<void> {
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

  let session;
  try {
    session = await stripe.checkout.sessions.create({
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

  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    // Lançar um erro que o cliente pode tratar, se necessário, embora o redirect seja o caminho feliz.
    throw new Error(`Falha ao criar sessão de checkout: ${errorMessage}`);
  }

  // Redireciona o usuário para a URL de checkout do Stripe.
  // Esta chamada deve estar fora do bloco try/catch.
  if (session?.url) {
    redirect(session.url);
  } else {
    // Caso a sessão não tenha uma URL por algum motivo.
    throw new Error('Não foi possível obter a URL de checkout do Stripe.');
  }
}
