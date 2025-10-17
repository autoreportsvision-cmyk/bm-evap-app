
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

const EffectDataSchema = z.object({
  'Brix Entrada (%)': z.number(),
  'Brix Saída (%)': z.number(),
  'Vapor Gerado (t/h)': z.number(),
  'Taxa Evaporação (t/h)': z.number(),
  'Eficiência (%)': z.number(),
});

const GenerateEffectEvaluationsInputSchema = z.object({
  effect1: EffectDataSchema,
  effect2: EffectDataSchema,
  effect3: EffectDataSchema,
  effect4: EffectDataSchema,
  effect5: EffectDataSchema,
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
    effect1: EffectDataSchema,
    effect2: EffectDataSchema,
    effect3: EffectDataSchema,
    effect4: EffectDataSchema,
    effect5: EffectDataSchema,
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
*   Efeito 1: {{{json effect1}}}
*   Efeito 2: {{{json effect2}}}
*   Efeito 3: {{{json effect3}}}
*   Efeito 4: {{{json effect4}}}
*   Efeito 5: {{{json effect5}}}
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
    
    const { output } = await evaluationPrompt({
        ...input,
        currentDate,
    });
    
    return output!;
  }
);


export async function generateEffectEvaluations(
  input: GenerateEffectEvaluationsInput
): Promise<GenerateEffectEvaluationsOutput> {
    return generateEvaluationsFlow(input);
}
