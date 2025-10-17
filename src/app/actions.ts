
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
    let paymentLink = plan === 'monthly' ? monthlyLink : yearlyLink;

    if (!paymentLink) {
      const errorMessage = `O link de pagamento do Stripe para o plano "${plan}" não está configurado nas variáveis de ambiente do servidor.`;
      console.error(errorMessage);
      return { success: false, error: errorMessage };
    }

    // Validação simples para garantir que a URL base pareça correta.
    if (!paymentLink.startsWith('https://buy.stripe.com/')) {
        const errorMessage = `O link de pagamento para o plano "${plan}" ("${paymentLink}") não é uma URL de checkout do Stripe válida. Verifique o arquivo .env.`;
        console.error(errorMessage);
        return { success: false, error: errorMessage };
    }

    // Lógica inteligente para anexar o client_reference_id
    // Remove qualquer parâmetro client_reference_id existente para evitar duplicatas.
    const baseUrl = paymentLink.split('?')[0];

    // Constrói a URL final de forma segura
    const finalUrl = `${baseUrl}?client_reference_id=${userId}`;

    return { success: true, url: finalUrl };

  } catch (error: any) {
    console.error("Erro ao criar o redirecionamento para o pagamento:", error);
    return { success: false, error: error.message || 'Falha ao criar o redirecionamento para o pagamento.' };
  }
}
