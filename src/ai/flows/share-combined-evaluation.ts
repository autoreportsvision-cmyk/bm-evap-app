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
  prompt: `You are an expert in summarizing technical data related to evaporation processes.  Create a concise, easy-to-understand summary for sharing via WhatsApp.

Clarified Juice: {{{clarifiedJuice}}}
First Effect Performance: {{{firstEffectPerformance}}}

Combine the above information into a single paragraph suitable for sharing with team members. Focus on the overall performance and key takeaways.`,
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
