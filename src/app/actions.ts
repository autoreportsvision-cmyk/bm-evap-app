
'use server';

import { generateEffectEvaluations } from '@/ai/flows/generate-effect-evaluations';
import type { GenerateEffectEvaluationsInput, GenerateEffectEvaluationsOutput } from '@/ai/flows/generate-effect-evaluations';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-flow';
import { generatePremiumTeaser } from '@/ai/flows/generate-premium-teaser';
import type { GeneratePremiumTeaserInput } from '@/ai/flows/generate-premium-teaser';


export async function getAiEvaluations(input: GenerateEffectEvaluationsInput): Promise<{ success: boolean; data?: GenerateEffectEvaluationsOutput; error?: string }> {
  try {
    const evaluations = await generateEffectEvaluations(input);
    return { success: true, data: evaluations };
  } catch (error: any) {
    console.error('Error in getAiEvaluations:', error);
    const errorMessage = error.message || 'Falha ao gerar avaliações de IA.';
    return { success: false, error: errorMessage };
  }
}

export async function getChatResponse(input: ChatInput): Promise<{ success: boolean; data?: string; error?: string; }> {
    try {
        const response = await chat(input);
        return { success: true, data: response };
    } catch (error: any) {
        console.error('Error in getChatResponse:', error);
        const errorMessage = error.message || 'Falha ao obter resposta do chat.';
        return { success: false, error: errorMessage };
    }
}


export async function getPremiumTeaser(input: GeneratePremiumTeaserInput): Promise<{ success: boolean; data?: string; error?: string; }> {
  try {
    const teaser = await generatePremiumTeaser(input);
    return { success: true, data: teaser };
  } catch (error: any) {
    // Don't log to console, this is an optional feature
    const errorMessage = error.message || 'Falha ao gerar o teaser.';
    return { success: false, error: errorMessage };
  }
}
