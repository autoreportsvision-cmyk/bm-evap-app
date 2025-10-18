
'use server';

/**
 * @fileOverview Generates a creative teaser message to encourage basic users to upgrade.
 *
 * - generatePremiumTeaser - A function that analyzes process data and creates a compelling message.
 * - GeneratePremiumTeaserInput - The input type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { EffectSummaryData } from '@/lib/types';

const GeneratePremiumTeaserInputSchema = z.object({
  effectsSummary: z.array(z.any()).describe('An array of summary data for each effect.'),
});

export type GeneratePremiumTeaserInput = z.infer<typeof GeneratePremiumTeaserInputSchema>;

export async function generatePremiumTeaser(input: GeneratePremiumTeaserInput): Promise<string> {
  return generatePremiumTeaserFlow(input);
}

const findWorstEffect = (effects: EffectSummaryData[]) => {
  if (!effects || effects.length === 0) {
    return null;
  }
  // Simple logic: find the effect with the lowest efficiency
  const worstEffect = effects.reduce((min, p) => (p.eficiencia < min.eficiencia ? p : min));
  return worstEffect;
};

const TeaserPromptInputSchema = z.object({
  worstEffectName: z.string(),
  worstEffectEfficiency: z.number(),
  worstEffectKgVaporM2: z.number(),
});

const teaserPrompt = ai.definePrompt({
    name: 'teaserPrompt',
    input: { schema: TeaserPromptInputSchema },
    output: { format: 'text' },
    prompt: `
        Você é um especialista em marketing e em processos industriais. Sua tarefa é criar uma frase curta, intrigante e um pouco alarmante para incentivar um usuário a assinar um plano premium.

        A frase deve mencionar o pior problema encontrado nos dados de um processo de evaporação, mas sem dar a solução. O objetivo é criar curiosidade e senso de urgência.

        **Exemplos de frases:**
        - "Notei algo preocupante no {{{worstEffectName}}}. A eficiência de {{{worstEffectEfficiency}}}% pode estar custando caro. A análise completa espera por você no plano Premium."
        - "Sua taxa de evaporação de {{{worstEffectKgVaporM2}}} kg/m² no {{{worstEffectName}}} é um sinal de alerta. Quer saber o porquê e como corrigir? Desbloqueie o diagnóstico Premium."
        - "O desempenho do {{{worstEffectName}}} está crítico. Com a versão Premium, posso te mostrar a causa raiz e o plano de ação agora mesmo."

        **Seja criativo e direto. A frase não deve ter mais que 25 palavras.**

        **Dados do Pior Efeito:**
        - Nome: {{{worstEffectName}}}
        - Eficiência: {{{worstEffectEfficiency}}}%
        - Taxa de Evaporação (kg/m²): {{{worstEffectKgVaporM2}}}
    `,
});


const generatePremiumTeaserFlow = ai.defineFlow(
  {
    name: 'generatePremiumTeaserFlow',
    inputSchema: GeneratePremiumTeaserInputSchema,
    outputSchema: z.string(),
  },
  async ({ effectsSummary }) => {
    
    const worstEffect = findWorstEffect(effectsSummary as EffectSummaryData[]);

    if (!worstEffect) {
        return "Detectei uma oportunidade de otimização no seu processo. Desbloqueie a análise completa com o plano Premium.";
    }

    const { output } = await teaserPrompt({
        worstEffectName: worstEffect.name,
        worstEffectEfficiency: worstEffect.eficiencia,
        worstEffectKgVaporM2: worstEffect.kgVaporM2
    });

    return output || "Há pontos críticos no seu processo que merecem atenção. Veja a análise completa no plano Premium.";
  }
);
