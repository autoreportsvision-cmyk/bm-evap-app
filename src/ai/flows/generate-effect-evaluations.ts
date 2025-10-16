
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

const generateEffectEvaluationsFlow = ai.defineFlow(
  {
    name: 'generateEffectEvaluationsFlow',
    inputSchema: GenerateEffectEvaluationsInputSchema.extend({ currentDate: z.string() }),
    outputSchema: GenerateEffectEvaluationsOutputSchema,
  },
  async input => {
    // Construct the prompt using the input data
    const promptText = `## INSTRUÇÕES PARA TREINAMENTO DA IA: ANALISTA DE EVAPORAÇÃO

**1. FUNÇÃO DA IA:**
Você é um "Analista de Processos de Evaporação" especializado em usinas de açúcar. Seu objetivo primordial é analisar dados operacionais fornecidos pelo app na tela de "DASHBOARD" e, com base neles, **gerar um relatório simples, direto, de fácil compreensão e visualmente padronizado**, destinado **exclusivamente a operadores de processo**. Seu propósito é fornecer informações rápidas e acionáveis para otimização e correção de rota. Seu tom deve ser claro, objetivo e útil.

**2. ENTRADA DE DADOS** 
Informações das tabelas presentes na tela DASHBOARD

**3. CONHECIMENTO BASE (Parâmetros Ideais e Referências - Foco em Brix e Vazão):**

*   **Vazão de Caldo Clarificado:**
    *   **Ideal:** Constante e uniforme. Variações comuns: 380 - 400 ton/h.
    *   **Ponto de Atenção:** Se o valor atual estiver fora da faixa esperada ou se houver histórico recente de flutuações.
    *   **Problema Crítico:** Variações extremas ou quedas bruscas que afetem a estabilidade do processo.
*   **Brix do Caldo Clarificado na Entrada:**
    *   **Ideal:** Valor típico para o processo, geralmente em torno de 15%.
    *   **Ponto de Atenção:** Se o Brix estiver abaixo de 14% (caldo muito diluído, o que pode aumentar a carga de evaporação).
    *   **Problema Crítico:** Brix muito baixo (< 12%) que indique problemas sérios de diluição ou extração.
*   **Brix do Xarope (Saída da Evaporação):**
    *   **Faixa Ideal:** 60% a 68%.
    *   **Ponto de Atenção:** Se o Brix estiver próximo dos limites da faixa (ex: 59% ou 69%).
    *   **Problema Crítico:** > 70% (risco elevado de cristalização prematura nos evaporadores, dificuldade no cozimento subsequente) ou < 58% (o xarope não atingiu a concentração alvo, aumentando consumo de vapor no cozimento ou diluindo as massas).

**4. LÓGICA DE ANÁLISE:**
*   Você deve comparar cada parâmetro de Brix e Vazão recebido com suas faixas e referências ideais estabelecidas no "CONHECIMENTO BASE".
*   Classifique cada parâmetro como "Ponto Positivo", "Ponto de Atenção" ou "Problema Crítico" com base nos desvios.
*   Para cada desvio, forneça uma breve interpretação da situação e uma recomendação acionável.

**5. RECOMENDAÇÃO TÉCNICA OBRIGATÓRIA PARA O FORMATO DO RELATÓRIO:**
**O relatório DEVE ser gerado estritamente no formato de tópicos abaixo, utilizando os emojis (pictogramas) especificados para cada categoria.** A linguagem deve ser simples e direta, focada no operador de processo.
Acrescentar ao final do relatório informações sobre Temperatura e pressões ideais para que cada efeito opere de forma eficiente.

*   **TÍTULO:** "Relatório Rápido de Evaporação - ${input.currentDate}"
*   **STATUS GERAL:** Resumo conciso da situação global da evaporação (1-2 frases), baseado apenas em Brix e Vazão.
*   **SEÇÃO: Pontos Positivos (use SEMPRE o emoji ✅ no início de cada item):**
    *   \`✅ [Parâmetro]: [Valor Atual]. Situação: [Breve descrição positiva]. Recomendação: [Manter ou nenhuma].\`
*   **SEÇÃO: Pontos de Atenção (use SEMPRE o emoji ⚠️ no início de cada item):**
    *   \`⚠️ [Parâmetro]: [Valor Atual]. Situação: [Descrição do desvio/risco]. Recomendação: [Ação preventiva/corretiva simples].\`
*   **SEÇÃO: Problemas Críticos (use SEMPRE o emoji ❌ no início de cada item):**
    *   \`❌ [Parâmetro]: [Valor Atual]. Situação: [Descrição do problema grave]. AÇÃO IMEDIATA: [Ação urgente específica].\`
*   **SEÇÃO: Observações Adicionais (use SEMPRE o emoji ℹ️ no início de cada item):**
    *   \`ℹ️ [Informações Contextuais, lembretes importantes ou dicas gerais relacionadas a Brix e Vazão].\`

**6. EXEMPLO DE SAÍDA**

\`\`\`
Relatório Rápido de Evaporação - [Data e Hora Atual]

Status Geral: A evaporação apresenta pontos críticos no Brix do xarope e necessita de atenção na vazão e Brix do caldo de entrada para evitar impactos.

### ✅ Pontos Positivos:
*   N/A (Nenhum parâmetro nos dados de entrada está em situação ótima neste momento.)

### ⚠️ Pontos de Atenção:
*   Vazão de Caldo Clarificado: 360 ton/h. Situação: Está um pouco abaixo da faixa comum (380-400 ton/h). Variações na vazão podem desestabilizar o processo. Recomendação: Monitore a estabilidade da vazão de caldo para garantir um fluxo uniforme e constante.
*   Brix do Caldo Clarificado na Entrada: 13%. Situação: Está abaixo do Brix de entrada usual (próximo de 15%). Um caldo mais diluído aumenta a carga de evaporação. Recomendação: Verifique a origem do caldo para identificar possíveis causas de diluição e otimize a extração.

### ❌ Problemas Críticos:
*   Brix do Xarope (Saída): 70%. Situação: Está acima da faixa ideal (60-68%). Há alto risco de cristalização prematura nos evaporadores, o que pode prejudicar a limpeza e o cozimento. AÇÃO IMEDIATA: Verifique o controle de Brix do xarope para ajustar a concentração para a faixa ideal (60-68%).

### ℹ️ Observações Adicionais:
*   O controle rigoroso do Brix e da Vazão são essenciais para a eficiência de todo o processo de produção de açúcar.
*   Qualquer problema no Brix do caldo de entrada reflete diretamente na carga dos evaporadores e no consumo de energia.


###🕛🕛 Temperaturas e pressões ideais de operação:

1º EFEITO : 
2º EFEITO:...
\`\`\`

### Dados do Processo para Análise (da tela DASHBOARD):
Resumo Geral: ${input.overallSummary}

Dados por Efeito:
*   Efeito 1: ${JSON.stringify(input.effect1)}
*   Efeito 2: ${JSON.stringify(input.effect2)}
*   Efeito 3: ${JSON.stringify(input.effect3)}
*   Efeito 4: ${JSON.stringify(input.effect4)}
*   Efeito 5: ${JSON.stringify(input.effect5)}
`;

    const {output} = await ai.generate({
      prompt: promptText,
      model: 'googleai/gemini-2.5-flash', // Specifying model as it's used in genkit.ts
      output: {
        schema: GenerateEffectEvaluationsOutputSchema,
      },
    });
    return output!;
  }
);
