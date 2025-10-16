
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
  return generateEffectEvaluationsFlow({...input, currentDate});
}

const generateEffectEvaluationsFlow = ai.defineFlow(
  {
    name: 'generateEffectEvaluationsFlow',
    inputSchema: GenerateEffectEvaluationsInputSchema.extend({ currentDate: z.string() }),
    // Output is a raw string, so no schema is needed.
  },
  async input => {

    const promptWithData = input.prompt
        .replace(/\$\{input.currentDate\}/g, input.currentDate)
        .replace(/\$\{input.overallSummary\}/g, input.overallSummary)
        .replace(/\$\{JSON.stringify\(input.effect1\)\}/g, JSON.stringify(input.effect1))
        .replace(/\$\{JSON.stringify\(input.effect2\)\}/g, JSON.stringify(input.effect2))
        .replace(/\$\{JSON.stringify\(input.effect3\)\}/g, JSON.stringify(input.effect3))
        .replace(/\$\{JSON.stringify\(input.effect4\)\}/g, JSON.stringify(input.effect4))
        .replace(/\$\{JSON.stringify\(input.effect5\)\}/g, JSON.stringify(input.effect5));

    const result = await ai.generate({
      prompt: promptWithData,
      model: 'googleai/gemini-2.5-flash',
    });

    return result.text;
  }
);
