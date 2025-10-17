
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

// The output is a raw string, not a JSON object.
export type GenerateEffectEvaluationsOutput = string;

export async function generateEffectEvaluations(
  input: GenerateEffectEvaluationsInput
): Promise<GenerateEffectEvaluationsOutput> {
  const currentDate = new Date().toLocaleString('pt-BR');
  // Stringify the effect data before passing it to the flow
  const stringifiedInput = {
    ...input,
    currentDate,
    effect1: JSON.stringify(input.effect1, null, 2),
    effect2: JSON.stringify(input.effect2, null, 2),
    effect3: JSON.stringify(input.effect3, null, 2),
    effect4: JSON.stringify(input.effect4, null, 2),
    effect5: JSON.stringify(input.effect5, null, 2),
  };

  return generateEvaluationsFlow(stringifiedInput);
}

// The input schema for the prompt now expects the effect data as strings.
const PromptInputSchema = z.object({
    prompt: z.string(),
    currentDate: z.string(),
    overallSummary: z.string(),
    effect1: z.string(),
    effect2: z.string(),
    effect3: z.string(),
    effect4: z.string(),
    effect5: z.string(),
});


const generateEvaluationsFlow = ai.defineFlow(
  {
    name: 'generateEvaluationsFlow',
    inputSchema: PromptInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {

    const promptText = `
{{{prompt}}}

### Dados do Processo para Análise:
Data da Análise: {{{currentDate}}}
Resumo Geral: {{{overallSummary}}}

Dados por Efeito:
*   Efeito 1: {{{effect1}}}
*   Efeito 2: {{{effect2}}}
*   Efeito 3: {{{effect3}}}
*   Efeito 4: {{{effect4}}}
*   Efeito 5: {{{effect5}}}
`;

    const result = await ai.generate({
        prompt: promptText,
        model: 'googleai/gemini-2.5-flash',
        // Use handlebars to substitute variables
        templateData: input
    });

    return result.text;
  }
);
