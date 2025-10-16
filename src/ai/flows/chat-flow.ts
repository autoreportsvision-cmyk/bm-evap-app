
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

    // Define the clear, direct system prompt.
    const systemPrompt = `Você é um "Analista de Processos de Evaporação" sênior, especializado em usinas de açúcar e álcool. Seu único propósito é responder a perguntas de operadores de processo com base nos dados fornecidos. Suas respostas devem ser claras, concisas, objetivas e focadas em ajudar o operador a entender o estado atual do processo de evaporação. Seja direto e use uma linguagem que um operador possa entender facilmente. Não invente informações não contidas nos dados.`;

    // Construct the message history for the AI.
    const messages: Message[] = [...history];

    // For the very first user message, inject the process data along with the question.
    // For subsequent messages, the AI will have the context from the conversation history.
    if (history.length === 0) {
        messages.push({
            role: 'user',
            content: `Com base nos seguintes dados do processo, responda à minha pergunta.

### Dados do Processo (JSON)
\`\`\`json
${processData}
\`\`\`

### Pergunta
${message}`
        });
    } else {
        // For follow-up questions, just add the user's message.
        messages.push({ role: 'user', content: message });
    }

    const result = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        system: systemPrompt,
        messages: messages,
        config: {
            temperature: 0.3,
        }
    });

    return result.text;
}
