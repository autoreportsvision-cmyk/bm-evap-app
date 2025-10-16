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
  prompt: `Você é um engenheiro especialista em processos industriais, com profundo conhecimento em balanço de massa e energia, especificamente na produção de açúcar e álcool a partir da cana-de-açúcar. Sua tarefa é analisar os dados de um sistema de evaporação de múltiplos efeitos e fornecer um diagnóstico técnico detalhado para cada efeito.

Analise os seguintes indicadores de desempenho para cada um dos 5 efeitos de evaporação. O seu relatório deve ser baseado estritamente nos dados fornecidos.

Resumo Geral do Processo: {{overallSummary}}

Dados detalhados por efeito:
Efeito 1: {{{effect1}}}
Efeito 2: {{{effect2}}}
Efeito 3: {{{effect3}}}
Efeito 4: {{{effect4}}}
Efeito 5: {{{effect5}}}

Para cada efeito, forneça uma avaliação em texto, abordando:
1.  **Análise de Desempenho:** Interprete os indicadores (Brix, eficiência, taxa de evaporação, kg vapor/m²).
2.  **Diagnóstico:** Identifique possíveis anomalias, como incrustações, problemas de vácuo, ou má distribuição de vapor, correlacionando os dados.
3.  **Recomendações:** Sugira ações corretivas ou otimizações para melhorar a eficiência e a estabilidade do processo.

O resultado deve ser em português e apresentado de forma clara e técnica.`,
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
