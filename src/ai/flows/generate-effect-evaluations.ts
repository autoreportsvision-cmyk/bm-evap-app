
'use server';

/**
 * @fileOverview Generates a detailed text evaluation for the entire evaporation process.
 *
 * - generateEffectEvaluations - A function that generates the effect evaluations.
 * - GenerateEffectEvaluationsInput - The input type for the generateEffectEvaluations function.
 * - GenerateEffectEvaluationsOutput - The return type for the generateEffectEvaluations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const GenerateEffectEvaluationsInputSchema = z.object({
  effects: z.record(z.any()), // flexible effects object
  overallSummary: z.string().describe('Overall summary of the evaporation process'),
  prompt: z.string().describe('The prompt to be used for the AI evaluation'),
});
export type GenerateEffectEvaluationsInput = z.infer<
  typeof GenerateEffectEvaluationsInputSchema
>;

export type GenerateEffectEvaluationsOutput = string;


const PromptInputSchema = z.object({
    prompt: z.string(),
    currentDate: z.string(),
    overallSummary: z.string(),
    effectsJson: z.string(),
});

const evaluationPrompt = ai.definePrompt({
    name: 'evaluationPrompt',
    input: { schema: PromptInputSchema },
    output: { format: 'text' },
    prompt: `
{{{prompt}}}

### Dados do Processo para Análise:
Data da Análise: {{{currentDate}}}
Resumo Geral: {{{overallSummary}}}

Dados por Efeito:
{{{effectsJson}}}
`
});


const generateEvaluationsFlow = ai.defineFlow(
  {
    name: 'generateEvaluationsFlow',
    inputSchema: GenerateEffectEvaluationsInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const currentDate = new Date().toLocaleString('pt-BR');
    
    // Create a JSON string of the effects to pass to the prompt
    const effectsJson = Object.entries(input.effects).map(([key, value]) => {
        return `*   ${key.replace('effect', 'Efeito ')}: ${JSON.stringify(value)}`;
    }).join('\n');

    const { output } = await evaluationPrompt({
        prompt: input.prompt,
        currentDate,
        overallSummary: input.overallSummary,
        effectsJson: effectsJson,
    });
    
    return output!;
  }
);


export async function generateEffectEvaluations(
  input: GenerateEffectEvaluationsInput
): Promise<GenerateEffectEvaluationsOutput> {
    return generateEvaluationsFlow(input);
}
