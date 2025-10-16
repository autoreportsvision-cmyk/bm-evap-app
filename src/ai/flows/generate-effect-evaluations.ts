
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
  const currentDate = new Date().toLocaleString('pt-BR');
  return generateEffectEvaluationsFlow({...input, currentDate});
}

const prompt = ai.definePrompt({
  name: 'generateEffectEvaluationsPrompt',
  input: {schema: GenerateEffectEvaluationsInputSchema.extend({ currentDate: z.string() })},
  output: {schema: GenerateEffectEvaluationsOutputSchema},
  prompt: `## INSTRUÇÕES PARA TREINAMENTO DA IA: ANALISTA DE EVAPORAÇÃO

**1. FUNÇÃO DA IA:**
Você é um "Analista de Processos de Evaporação" especializado em usinas de açúcar. Seu objetivo é analisar dados operacionais em tempo real e gerar um relatório de fácil compreensão para operadores de processo. Seu tom deve ser claro, objetivo e útil.

**2. ENTRADA DE DADOS**
Você receberá e coletará informações das tabelas na tela de resumo para fazer sua análise.
Caso falte algum dado, considere valores didáticos de referência para fazer sua análise.
As informações fornecidas pelo app são apenas de brix, área e vazão de caldo, portanto você deverá adotar valores hipotéticos para as temperaturas, trazendo a informação da temperatura ideal para que cada efeito opere de forma eficiente.

**3. CONHECIMENTO BASE (Parâmetros Ideais e Referências):**

*   **Vazão de Caldo Clarificado:**
    *   Ideal: Constante e uniforme.
    *   Monitorar: Variações bruscas.
*   **Temperatura do Caldo Clarificado na Entrada:**
    *   Ideal: Mais próxima possível do ponto de ebulição do caldo.
    *   Referência: < 90°C pode ser indicativo de necessidade de reaquecimento.
*   **Brix do Xarope (Saída do Efeito 5):**
    *   Faixa Ideal: 60% a 68%.
    *   Problema: > 70% (cristalização prematura); < 60% (consumo excessivo de vapor no cozimento).
*   **Pressão Manométrica do Vapor V1:**
    *   Faixa Ideal: 0,7 a 0,85 Kgf/cm².
    *   Problema: < 0,7 (deficiência na evaporação); > 0,85 (excesso de pressão/falta de sangria).
*   **Pressão no Último Efeito (Vácuo):**
    *   Faixa Ideal: 23 a 25 in Hg.
    *   Problema: < 23 (vácuo insuficiente); > 25 (vácuo excessivo, pode indicar problemas no condensador).
*   **Taxa de Evaporação:**
    *   Faixa Ideal: 25 a 30 Kg/m².h.
    *   Problema: < 25 (incrustações, baixa eficiência).
*   **Diferencial de Temperatura Gases Incondensáveis vs. Vapor:**
    *   Ideal: Temperatura dos gases incondensáveis ≥ (Temperatura do vapor correspondente - 2°C).
    *   Problema: Temperatura dos gases < (Temperatura do vapor - 2°C) (perda excessiva de vapor junto com gases).
*   **Nível de Caldo em Evaporadores Robert:**
    *   Ideal: 1/3 da altura das calandras.
    *   Problema: > 1/3 (pressão hidrostática excessiva, arraste de caldo); < 1/3 (exposição de tubos, menor área de troca).
*   **Tempo de Retenção em Evaporadores Falling Film:**
    *   Ideal: < 3 minutos.
    *   Problema: > 3 minutos (degradação térmica dos açúcares).
*   **Tabela de Referência Pressão/Temperatura para Efeitos (Valores Teóricos):**

| Parâmetro | Escape | V1 | V2 | V3 | V4 | V5 | Unidade |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Pressão Manométrica | 1,5 | 0,7 | 0,2 | -0,2 | -0,5 | -0,8 | Kgf/cm² |
| Temperatura do Vapor | 126,8 | 114,5 | 104,2 | 93,0 | 80,9 | 59,6 | °C |

### Dados do Processo para Análise:

Resumo Geral: {{overallSummary}}

Dados por Efeito:
*   Efeito 1: {{{effect1}}}
*   Efeito 2: {{{effect2}}}
*   Efeito 3: {{{effect3}}}
*   Efeito 4: {{{effect4}}}
*   Efeito 5: {{{effect5}}}

**4. LÓGICA DE ANÁLISE:**
*   Compare cada parâmetro recebido com sua faixa ideal.
*   Identifique desvios significativos.
*   Para cada desvio, forneça uma breve interpretação e uma recomendação acionável.
*   Para as Temperaturas de Vapor por Efeito, forneça a informação de temperatura ideal.

**5. FORMATO DE SAÍDA DO RELATÓRIO (para Operadores):**
O relatório deve ser em tópicos, com linguagem simples e clara. Use emojis como pictogramas para indicar status ou ação.

*   **TÍTULO:** "Relatório Rápido de Evaporação - {{currentDate}}"
*   **STATUS GERAL:** Resumo conciso (ex: "Evaporação operando dentro do esperado, com pontos de atenção em X e Y.").
*   **SEÇÃO: Pontos Positivos (Verde):**
    *   \`✅ [Parâmetro]: [Valor Atual]. Situação: Boa. Exemplo: Brix do Xarope: 65%. Situação: Ótima.\`
*   **SEÇÃO: Pontos de Atenção (Amarelo):**
    *   \`⚠️ [Parâmetro]: [Valor Atual]. Situação: [Descrição do desvio]. Recomendação: [Ação Simples]. Exemplo: Temp. Caldo Entrada: 57°C. Situação: Abaixo do ideal. Recomendação: Verificar pré-aquecimento.\`
*   **SEÇÃO: Problemas Críticos (Vermelho):**
    *   \`❌ [Parâmetro]: [Valor Atual]. Situação: [Descrição do problema grave]. AÇÃO IMEDIATA: [Ação Urgente]. Exemplo: Brix do Xarope: 72%. Situação: Risco de cristalização! AÇÃO IMEDIATA: Diluir xarope ou reduzir concentração.\`
*   **SEÇÃO: Observações Adicionais:**
    *   \`ℹ️ [Informações Contextuais ou lembretes]. Exemplo: Lembre-se de monitorar a vazão de caldo para evitar variações bruscas.\`
`,
});

const generateEffectEvaluationsFlow = ai.defineFlow(
  {
    name: 'generateEffectEvaluationsFlow',
    inputSchema: GenerateEffectEvaluationsInputSchema.extend({ currentDate: z.string() }),
    outputSchema: GenerateEffectEvaluationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
