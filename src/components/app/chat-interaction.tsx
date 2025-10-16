
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader, Send } from 'lucide-react';
import { useAppContext } from '@/context/app-context';
import { getChatResponse } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { ChatInput } from '@/lib/types';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function ChatInteraction() {
  const { calculatedData, isCalculated } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !calculatedData) {
        if (!calculatedData) {
            toast({
                variant: 'destructive',
                title: 'Dados não encontrados',
                description: 'Por favor, calcule os dados no formulário primeiro.'
            });
        }
        return;
    }

    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const chatInput: ChatInput = {
      history: newMessages.slice(0, -1),
      message: input,
      processData: JSON.stringify(calculatedData, null, 2),
    };

    const result = await getChatResponse(chatInput);

    setLoading(false);

    if (result.success && result.data) {
      setMessages([...newMessages, { role: 'model', content: result.data }]);
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro na IA',
        description: result.error || 'Não foi possível obter uma resposta.',
      });
       // remove the user message if the call fails
       setMessages(messages);
    }
  };

  if (!isCalculated) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    Preencha o formulário e clique em "Calcular" para iniciar o chat com a IA.
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[60vh]">
      <CardHeader>
        <CardTitle>Chat com IA</CardTitle>
        <CardDescription>Faça perguntas sobre os dados do processo de evaporação.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'model' && <Bot className="h-6 w-6 flex-shrink-0" />}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
             {loading && (
              <div className="flex justify-start gap-2">
                <Bot className="h-6 w-6 flex-shrink-0" />
                <div className="rounded-lg px-4 py-2 bg-muted flex items-center">
                    <Loader className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-4 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Qual a sua dúvida sobre o processo?"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send />
            <span className="sr-only">Enviar</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
