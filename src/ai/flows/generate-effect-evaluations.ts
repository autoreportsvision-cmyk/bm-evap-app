
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
});
export type GenerateEffectEvaluationsInput = z.infer<
  typeof GenerateEffectEvaluationsInputSchema
>;

const GenerateEffectEvaluationsOutputSchema = z.object({
  generalEvaluation: z
    .string()
    .describe('Detailed general text evaluation for the entire evaporation process'),
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
  prompt: `Você é um engenheiro especialista em processos industriais, com profundo conhecimento em balanço de massa e energia na produção de açúcar e álcool, baseado no "Manual de Produção Açucareira". Sua tarefa é analisar os dados de um sistema de evaporação de múltiplos efeitos e fornecer um DIAGNÓSTICO GERAL E CONSOLIDADO do processo, baseado estritamente nos dados fornecidos e nos parâmetros de referência.

### Parâmetros de Referência para a Análise:

**Caldo e Xarope:**
*   **Brix do Xarope (saída do último efeito):** O ideal é entre 60% e 68%. Acima de 70% há risco de cristalização.
*   **Temperatura do Caldo na Entrada:** Se baixa, consome energia que deveria ser usada para evaporar.

**Vapor e Pressão:**
*   **Pressão V1 (gerado no pré-evaporador):** Deve ficar entre 0,7 e 0,85 Kgf/cm².
*   **Vácuo (Último Efeito):** Controlar entre 23 e 25 in Hg para otimizar o ponto de ebulição.

**Desempenho:**
*   **Taxa de Evaporação:** O ideal é 25 a 30 Kg/m².h. Valores baixos podem indicar incrustações.
*   **Incrustações:** Reduzem a troca térmica. Monitorar indiretamente pela taxa de evaporação.
*   **Gases Incondensáveis:** A temperatura na saída de gases deve ser ~2°C menor que a do vapor para indicar purga eficiente.
*   **Nível (Evaporadores Robert):** Manter em 1/3 da altura da calandra para evitar arraste e pressão hidrostática excessiva.

### Tabela de Referência de Pressão e Temperatura Ideal para Efeitos (Cap. 7 do manual):
| Parâmetros          | Escape | V1    | V2    | V3     | V4     | V5     | Unidade |
|---------------------|--------|-------|-------|--------|--------|--------|---------|
| Pressão Manométrica | 1,5    | 0,7   | 0,2   | -0,2   | -0,5   | -0,8   | Kgf/cm² |
| Pressão Absoluta    | 2,5    | 1,7   | 1,2   | 0,8    | 0,5    | 0,2    | Kgf/cm² |
| Temperatura do Vapor| 126,8  | 114,5 | 104,2 | 93     | 80,9   | 59,6   | °C      |

### Dados do Processo para Análise (Resumo Detalhado por Efeito):

Resumo Geral: {{overallSummary}}

Dados por Efeito:
*   Efeito 1: {{{effect1}}}
*   Efeito 2: {{{effect2}}}
*   Efeito 3: {{{effect3}}}
*   Efeito 4: {{{effect4}}}
*   Efeito 5: {{{effect5}}}

### Sua Tarefa:

Elabore uma **AVALIAÇÃO GERAL CONCISA** em texto, em português, sobre o conjunto de evaporação. Sua análise deve ser resumida, organizada em tópicos e destacar os principais desvios encontrados. Siga o layout abaixo:

**1. Diagnóstico Geral:**
*   Faça uma avaliação geral do processo em um ou dois parágrafos.
*   Compare o Brix final do xarope com a faixa ideal (60-68%) e aponte as consequências de qualquer desvio.

**2. Principais Desvios e Pontos de Atenção:**
*   Liste em tópicos (bullet points) os 3 principais desvios encontrados, comparando os dados do processo com os parâmetros de referência (Ex: "Taxa de evaporação no Efeito 3 abaixo do ideal, sugerindo possível incrustação").
*   Seja direto e foque apenas nos problemas mais críticos.

**3. Recomendações Estratégicas:**
*   Para cada desvio apontado, forneça uma recomendação curta e objetiva.

Seja técnico, preciso e baseie sua análise exclusivamente nos dados fornecidos. O relatório final deve ser claro e fácil de ler.`,
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
