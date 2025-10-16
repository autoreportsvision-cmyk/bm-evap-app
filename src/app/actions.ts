'use server';

import { generateEffectEvaluations } from '@/ai/flows/generate-effect-evaluations';
import type { GenerateEffectEvaluationsInput } from '@/ai/flows/generate-effect-evaluations';
import { shareCombinedEvaluation } from '@/ai/flows/share-combined-evaluation';
import type { ShareCombinedEvaluationInput } from '@/ai/flows/share-combined-evaluation';

export async function getAiEvaluations(input: GenerateEffectEvaluationsInput) {
  try {
    const evaluations = await generateEffectEvaluations(input);
    return { success: true, data: evaluations };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao gerar avaliações de IA.' };
  }
}

export async function getSharedEvaluation(input: ShareCombinedEvaluationInput) {
  try {
    const sharedText = await shareCombinedEvaluation(input);
    return { success: true, data: sharedText };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao gerar avaliação para compartilhamento.' };
  }
}
