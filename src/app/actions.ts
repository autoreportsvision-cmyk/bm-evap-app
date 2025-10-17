
'use server';

import { generateEffectEvaluations } from '@/ai/flows/generate-effect-evaluations';
import type { GenerateEffectEvaluationsInput, GenerateEffectEvaluationsOutput } from '@/ai/flows/generate-effect-evaluations';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-flow';

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

export async function createStripeRedirect(plan: 'monthly' | 'yearly', userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!userId) {
    return { success: false, error: 'auth/no-user-id' };
  }
  
  try {
    // No servidor, usamos as variáveis de ambiente sem NEXT_PUBLIC_
    const monthlyLink = process.env.STRIPE_MONTHLY_PAYMENT_LINK;
    const yearlyLink = process.env.STRIPE_YEARLY_PAYMENT_LINK;
    const paymentLink = plan === 'monthly' ? monthlyLink : yearlyLink;

    if (!paymentLink) {
      // Retorna um erro estruturado em vez de lançar uma exceção
      const errorMessage = `Stripe payment link for "${plan}" plan is not configured.`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }

    const urlWithUser = new URL(paymentLink);
    urlWithUser.searchParams.append('client_reference_id', userId);

    return { success: true, url: urlWithUser.toString() };

  } catch (error: any) {
    console.error("Error creating Stripe redirect:", error);
    return { success: false, error: error.message || 'Falha ao criar o redirecionamento para o pagamento.' };
  }
}
