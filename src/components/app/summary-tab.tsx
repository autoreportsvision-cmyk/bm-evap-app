
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAppContext } from '@/context/app-context';

export default function SummaryTab() {
  const { calculatedData, isCalculated } = useAppContext();

  if (!isCalculated || !calculatedData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Preencha o formulário para ver o resumo.
      </div>
    );
  }

  const { overallSummary, effectsSummary } = calculatedData;
  

  return (
    <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Resumo Geral da Evaporação</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">{overallSummary}</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Resumo Detalhado por Efeito</CardTitle>
            <CardDescription>Dados de entrada e saída para cada efeito do sistema de evaporação.</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                  <TableRow>
                      <TableHead>Efeito</TableHead>
                      <TableHead className="text-right">Brix Entrada (%)</TableHead>
                      <TableHead className="text-right">Brix Saída (%)</TableHead>
                      <TableHead className="text-right">Vapor Gerado (t/h)</TableHead>
                      <TableHead className="text-right">Taxa Evaporação (t/h)</TableHead>
                      <TableHead className="text-right">Eficiência (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {effectsSummary.map((effect) => (
                    <TableRow key={effect.name}>
                        <TableCell className="font-medium">{effect.name}</TableCell>
                        <TableCell className="text-right">{effect.brixIn}</TableCell>
                        <TableCell className="text-right">{effect.brixOut}</TableCell>
                        <TableCell className="text-right">{effect.vaporGerado}</TableCell>
                        <TableCell className="text-right">{effect.taxaEvaporacao}</TableCell>
                        <TableCell className="text-right">{effect.eficiencia}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}
