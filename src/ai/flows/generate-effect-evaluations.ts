'use server';

/**
 * @fileOverview Generates detailed text evaluations for each of the 5 evaporation effects.
 *
 * - generateEffectEvaluations - A function that generates the effect evaluations.
 * - GenerateEffectEvaluationsInput - The input type for the generateEffectEvaluations function.
 * - GenerateEffectEvaluationsOutput - The return type for the generateEffectEvaluations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEffectEvaluationsInputSchema = z.object({
  effect1: z.record(z.any()).describe('Metrics and results for effect 1'),
  effect2: z.record(z.any()).describe('Metrics and results for effect 2'),
  effect3: z.record(z.any()).describe('Metrics and results for effect 3'),
  effect4: z.record(z.any()).describe('Metrics and results for effect 4'),
  effect5: z.record(z.any()).describe('Metrics and results for effect 5'),
  overallSummary: z.string().describe('Overall summary of the evaporation process'),
});
export type GenerateEffectEvaluationsInput = z.infer<
  typeof GenerateEffectEvaluationsInputSchema
>;

const GenerateEffectEvaluationsOutputSchema = z.object({
  effect1Evaluation: z
    .string()
    .describe('Detailed text evaluation for effect 1'),
  effect2Evaluation: z
    .string()
    .describe('Detailed text evaluation for effect 2'),
  effect3Evaluation: z
    .string()
    .describe('Detailed text evaluation for effect 3'),
  effect4Evaluation: z
    .string()
    .describe('Detailed text evaluation for effect 4'),
  effect5Evaluation: z
    .string()
    .describe('Detailed text evaluation for effect 5'),
});
export type GenerateEffectEvaluationsOutput = z.infer<
  typeof GenerateEffectEvaluationsOutputSchema
>;

export async function generateEffectEvaluations(
  input: GenerateEffectEvaluationsInput
): Promise<GenerateEffectEvaluationsOutput> {
  return generateEffectEvaluationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEffectEvaluationsPrompt',
  input: {schema: GenerateEffectEvaluationsInputSchema},
  output: {schema: GenerateEffectEvaluationsOutputSchema},
  prompt: `You are an expert operator in an evaporation plant. You are responsible for analyzing the performance of each evaporation effect and providing a detailed text evaluation.

Here is the overall summary of the evaporation process: {{overallSummary}}

Here are the metrics and results for each effect:

Effect 1: {{{effect1}}}

Effect 2: {{{effect2}}}

Effect 3: {{{effect3}}}

Effect 4: {{{effect4}}}

Effect 5: {{{effect5}}}

Based on this information, provide a detailed text evaluation for each effect, highlighting key performance indicators, potential issues, and areas for improvement.

Format the output as follows:

Effect 1 Evaluation: [Evaluation of effect 1]
Effect 2 Evaluation: [Evaluation of effect 2]
Effect 3 Evaluation: [Evaluation of effect 3]
Effect 4 Evaluation: [Evaluation of effect 4]
Effect 5 Evaluation: [Evaluation of effect 5]`,
});

const generateEffectEvaluationsFlow = ai.defineFlow(
  {
    name: 'generateEffectEvaluationsFlow',
    inputSchema: GenerateEffectEvaluationsInputSchema,
    outputSchema: GenerateEffectEvaluationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
