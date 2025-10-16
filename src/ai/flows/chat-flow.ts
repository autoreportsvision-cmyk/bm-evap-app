
'use server';

/**
 * @fileOverview A conversational AI flow for analyzing evaporation process data.
 *
 * - chat - A function that handles the chat interaction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatInputSchema = z.object({
  message: z.string().describe("The user's latest message."),
  processData: z.string().describe('A JSON string of the calculated process data.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

export async function chat(input: ChatInput): Promise<string> {
    const { message, processData } = input;

    // Define the clear, direct system prompt.
    const systemPrompt = `Você é um "Analista de Processos de Evaporação" sênior, especializado em usinas de açúcar e álcool. Seu único propósito é responder a perguntas de operadores de processo com base nos dados fornecidos. Suas respostas devem ser claras, concisas, objetivas e focadas em ajudar o operador a entender o estado atual do processo de evaporação. Seja direto e use uma linguagem que um operador possa entender facilmente. Não invente informações não contidas nos dados.`;

    const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        system: systemPrompt,
        prompt: `Com base nos seguintes dados do processo, responda à minha pergunta.

### Dados do Processo (JSON)
\`\`\`json
${processData}
\`\`\`

### Pergunta
${message}`,
        config: {
            temperature: 0.3,
        }
    });

    return result.text;
}
