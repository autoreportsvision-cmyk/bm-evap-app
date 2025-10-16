
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppContext } from '@/context/app-context';
import { Bot, Loader, Share2 } from 'lucide-react';
import { getAiEvaluations, getSharedEvaluation } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import WhatsAppIcon from '@/components/icons/whatsapp-icon';
import { Textarea } from '../ui/textarea';

export default function EvaluationsTab() {
  const { calculatedData, aiEvaluations, setAiEvaluations, isCalculated } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateEvaluations = async () => {
    if (!calculatedData) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Dados calculados não estão disponíveis. Por favor, preencha o formulário primeiro.",
      });
      return;
    }
    setLoading(true);

    const effectsPayload = calculatedData.effectsSummary.reduce((acc, effect, index) => {
        const effectKey = `effect${index + 1}` as keyof typeof acc;
        acc[effectKey] = {
            "Brix Entrada (%)": effect.brixIn,
            "Brix Saída (%)": effect.brixOut,
            "Vapor Gerado (t/h)": effect.vaporGerado,
            "Taxa Evaporação (t/h)": effect.taxaEvaporacao,
            "Eficiência (%)": effect.eficiencia,
        };
        return acc;
    }, {} as {
        effect1: any, effect2: any, effect3: any, effect4: any, effect5: any
    });


    const result = await getAiEvaluations({
      ...effectsPayload,
      overallSummary: calculatedData.overallSummary,
    });
    setLoading(false);

    if (result.success && result.data) {
      setAiEvaluations(result.data);
      toast({
        title: "Sucesso",
        description: "Avaliação geral gerada com IA.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro de IA",
        description: result.error,
      });
    }
  };
  
  const handleShare = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };
  
  const handleShareCombined = async () => {
    if (!calculatedData) return;
    setShareLoading(true);
    const result = await getSharedEvaluation({
      clarifiedJuice: calculatedData.caldoClarificado.summary,
      firstEffectPerformance: calculatedData.desempenhoPrimeiroEfeito.summary,
    });
    setShareLoading(false);

    if (result.success && result.data) {
      handleShare(result.data.combinedEvaluationText);
    } else {
       toast({
        variant: "destructive",
        title: "Erro ao compartilhar",
        description: result.error,
      });
    }
  }

  const generalEvaluation = aiEvaluations?.generalEvaluation;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <CardTitle>Avaliação Geral do Processo (IA)</CardTitle>
                <CardDescription>Análise consolidada do desempenho do sistema de evaporação gerada por IA.</CardDescription>
            </div>
            <div className="flex flex-shrink-0 gap-2">
                 <Button onClick={handleShareCombined} disabled={!isCalculated || shareLoading}>
                    {shareLoading ? <Loader className="animate-spin" /> : <Share2 />}
                    <span>Compartilhar Resumo</span>
                </Button>
                <Button onClick={handleGenerateEvaluations} disabled={!isCalculated || loading}>
                    {loading ? <Loader className="animate-spin" /> : <Bot />}
                    <span>{aiEvaluations ? 'Regerar' : 'Gerar Avaliação'}</span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isCalculated ? (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Preencha o formulário para gerar a avaliação.
          </div>
        ) : loading ? (
           <div className="flex items-center justify-center h-48">
             <Loader className="h-8 w-8 animate-spin text-primary" />
           </div>
        ) : generalEvaluation ? (
           <div className="space-y-4">
            <Textarea
              readOnly
              value={generalEvaluation}
              className="h-96 text-base"
            />
             <Button variant="outline" size="sm" onClick={() => handleShare(`Avaliação Geral do Processo:\n\n${generalEvaluation}`)}>
              <WhatsAppIcon className="h-4 w-4 mr-2" />
              Compartilhar no WhatsApp
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            Clique em "Gerar Avaliação" para ver a análise da IA.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
