
'use server';

import { generateEffectEvaluations } from '@/ai/flows/generate-effect-evaluations';
import type { GenerateEffectEvaluationsInput, GenerateEffectEvaluationsOutput } from '@/ai/flows/generate-effect-evaluations';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-flow';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// O Next.js carrega automaticamente as variáveis do .env no servidor,
// então a importação explícita do 'dotenv' não é necessária e pode causar conflitos.

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

export async function createStripeCheckoutSession(plan: 'monthly' | 'yearly', userId: string): Promise<{ success: boolean; url?: string | null; error?: string }> {
  if (!userId) {
    return { success: false, error: 'auth/no-user-id' };
  }
  
  // A verificação agora é feita diretamente no 'process.env' que o Next.js popula.
  if (!process.env.STRIPE_API_KEY) {
     return { success: false, error: 'A chave da API do Stripe não está configurada no servidor.' };
  }

  const monthlyPriceId = process.env.STRIPE_MONTHLY_PRICE_ID;
  const yearlyPriceId = process.env.STRIPE_YEARLY_PRICE_ID;
  const app_url = process.env.NEXT_PUBLIC_APP_URL;

  if (!monthlyPriceId || !yearlyPriceId) {
      return { success: false, error: 'Os IDs de preço do Stripe não estão configurados nas variáveis de ambiente do servidor (STRIPE_MONTHLY_PRICE_ID, STRIPE_YEARLY_PRICE_ID).' };
  }
  if (!app_url) {
      return { success: false, error: 'A URL do aplicativo (NEXT_PUBLIC_APP_URL) não está configurada nas variáveis de ambiente.' };
  }

  const priceId = plan === 'monthly' ? monthlyPriceId : yearlyPriceId;

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
      metadata: {
        userId: userId,
        plan: plan
      },
      success_url: `${app_url}/?payment_success=true`,
      cancel_url: `${app_url}/pricing?payment_canceled=true`,
    });

    return { success: true, url: session.url };

  } catch (error: any) {
    console.error("Erro ao criar a sessão de checkout do Stripe:", error);
    return { success: false, error: error.message || 'Falha ao criar a sessão de checkout.' };
  }
}
