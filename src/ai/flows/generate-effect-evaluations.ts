
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
  const fullInput = { ...input, currentDate };

  // This flow now uses a structured prompt defined with Genkit
  return generateEvaluationsFlow(fullInput);
}

const PromptInputSchema = GenerateEffectEvaluationsInputSchema.extend({
  currentDate: z.string(),
});

const generateEvaluationsPrompt = ai.definePrompt({
    name: 'generateEvaluationsPrompt',
    input: { schema: PromptInputSchema },
    output: { format: 'text' },
    prompt: `{{{prompt}}}

### Dados do Processo para Análise:
Data da Análise: {{{currentDate}}}
Resumo Geral: {{{overallSummary}}}

Dados por Efeito:
*   Efeito 1: ${JSON.stringify({effect1: '{{{effect1}}}'})}
*   Efeito 2: ${JSON.stringify({effect2: '{{{effect2}}}'})}
*   Efeito 3: ${JSON.stringify({effect3: '{{{effect3}}}'})}
*   Efeito 4: ${JSON.stringify({effect4: '{{{effect4}}}'})}
*   Efeito 5: ${JSON.stringify({effect5: '{{{effect5}}}'})}
`
});


const generateEvaluationsFlow = ai.defineFlow(
  {
    name: 'generateEvaluationsFlow',
    inputSchema: PromptInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // Replace the JSON string placeholders with actual stringified JSON
    // The prompt text itself is complex and contains JSON-like structures that handlebars can't handle directly.
    const promptText = input.prompt
        .replace(/\$\{input.currentDate\}/g, input.currentDate)
        .replace(/\$\{input.overallSummary\}/g, input.overallSummary)
        .replace(/\$\{JSON.stringify\(input.effect1\)\}/g, JSON.stringify(input.effect1, null, 2))
        .replace(/\$\{JSON.stringify\(input.effect2\)\}/g, JSON.stringify(input.effect2, null, 2))
        .replace(/\$\{JSON.stringify\(input.effect3\)\}/g, JSON.stringify(input.effect3, null, 2))
        .replace(/\$\{JSON.stringify\(input.effect4\)\}/g, JSON.stringify(input.effect4, null, 2))
        .replace(/\$\{JSON.stringify\(input.effect5\)\}/g, JSON.stringify(input.effect5, null, 2));


    const result = await ai.generate({
        prompt: promptText,
        model: 'googleai/gemini-2.5-flash',
    });

    return result.text;
  }
);
