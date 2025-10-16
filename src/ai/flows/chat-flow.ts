
'use server';

/**
 * @fileOverview A conversational AI flow for analyzing evaporation process data.
 *
 * - chat - A function that handles the chat interaction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Message } from '@/lib/types';


const ChatInputSchema = z.object({
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })),
  message: z.string().describe('The user\'s latest message.'),
  processData: z.string().describe('A JSON string of the calculated process data.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput): Promise<string> {
    const { history, message, processData } = input;

    const systemPrompt = `Você é um "Analista de Processos de Evaporação" sênior, especializado em usinas de açúcar e álcool. Seu único propósito é responder a perguntas de operadores de processo com base nos dados fornecidos. Suas respostas devem ser claras, concisas, objetivas e focadas em ajudar o operador a entender o estado atual do processo de evaporação.

Use os dados do processo abaixo como a única fonte de verdade para suas respostas. Não invente informações.

Dados do Processo (em formato JSON):
\`\`\`json
${processData}
\`\`\`

Seja direto e use uma linguagem que um operador possa entender facilmente.`;

    const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        system: systemPrompt,
        messages: [...history, { role: 'user', content: message }],
        config: {
            temperature: 0.3,
        }
    });

    return result.text;
}
