
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
    const monthlyLink = process.env.STRIPE_MONTHLY_PAYMENT_LINK;
    const yearlyLink = process.env.STRIPE_YEARLY_PAYMENT_LINK;
    const paymentLink = plan === 'monthly' ? monthlyLink : yearlyLink;

    if (!paymentLink) {
      const errorMessage = `O link de pagamento do Stripe para o plano "${plan}" não está configurado nas variáveis de ambiente do servidor.`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }
    
    // Simplificando para concatenação de string
    const finalUrl = `${paymentLink}?client_reference_id=${userId}`;

    // Validação simples para garantir que a URL final pareça correta.
    if (!finalUrl.startsWith('https://')) {
        const errorMessage = `O link de pagamento para o plano "${plan}" ("${paymentLink}") não é uma URL HTTPS válida. Verifique o arquivo .env.`;
        console.error(errorMessage);
        return { success: false, error: errorMessage };
    }

    return { success: true, url: finalUrl };

  } catch (error: any) {
    console.error("Erro ao criar o redirecionamento para o pagamento:", error);
    return { success: false, error: error.message || 'Falha ao criar o redirecionamento para o pagamento.' };
  }
}
