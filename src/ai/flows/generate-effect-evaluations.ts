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
  prompt: `Você é um operador especialista em uma planta de evaporação. Sua responsabilidade é analisar a performance de cada efeito de evaporação e fornecer uma avaliação detalhada em texto.

Aqui está o resumo geral do processo de evaporação: {{overallSummary}}

Aqui estão as métricas e resultados para cada efeito:

Efeito 1: {{{effect1}}}
Efeito 2: {{{effect2}}}
Efeito 3: {{{effect3}}}
Efeito 4: {{{effect4}}}
Efeito 5: {{{effect5}}}

Baseado nessas informações, forneça uma avaliação detalhada em texto para cada efeito, destacando os principais indicadores de desempenho, possíveis problemas e áreas para melhoria.

O resultado deve ser em português.`,
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
