'use server';

/**
 * @fileOverview Genkit flow for sharing a combined evaluation of the evaporation process via WhatsApp.
 *
 * - shareCombinedEvaluation - A function that generates a combined evaluation summary and prepares it for sharing.
 * - ShareCombinedEvaluationInput - The input type for the shareCombinedEvaluation function.
 * - ShareCombinedEvaluationOutput - The return type for the shareCombinedEvaluation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ShareCombinedEvaluationInputSchema = z.object({
  clarifiedJuice: z.string().describe('Summary of the clarified juice metric.'),
  firstEffectPerformance: z.string().describe('Summary of the first effect performance metric.'),
});

export type ShareCombinedEvaluationInput = z.infer<typeof ShareCombinedEvaluationInputSchema>;

const ShareCombinedEvaluationOutputSchema = z.object({
  combinedEvaluationText: z.string().describe('A combined summary of the evaporation process for sharing.'),
});

export type ShareCombinedEvaluationOutput = z.infer<typeof ShareCombinedEvaluationOutputSchema>;

export async function shareCombinedEvaluation(input: ShareCombinedEvaluationInput): Promise<ShareCombinedEvaluationOutput> {
  return shareCombinedEvaluationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'shareCombinedEvaluationPrompt',
  input: {schema: ShareCombinedEvaluationInputSchema},
  output: {schema: ShareCombinedEvaluationOutputSchema},
  prompt: `Você é um especialista em resumir dados técnicos relacionados a processos de evaporação. Crie um resumo conciso e de fácil compreensão para ser compartilhado via WhatsApp.

Caldo Clarificado: {{{clarifiedJuice}}}
Desempenho do Primeiro Efeito: {{{firstEffectPerformance}}}

Combine as informações acima em um único parágrafo adequado para compartilhar com os membros da equipe. Foque no desempenho geral e nos pontos principais. O resultado deve ser em português.`,
});

const shareCombinedEvaluationFlow = ai.defineFlow(
  {
    name: 'shareCombinedEvaluationFlow',
    inputSchema: ShareCombinedEvaluationInputSchema,
    outputSchema: ShareCombinedEvaluationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
