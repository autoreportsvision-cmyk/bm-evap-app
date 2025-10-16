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

  const { caldoClarificado, desempenhoPrimeiroEfeito, overallSummary } = calculatedData;
  
  const caldoClarificadoData = Object.entries(caldoClarificado).filter(([key]) => key !== 'summary');
  const desempenhoData = Object.entries(desempenhoPrimeiroEfeito).filter(([key]) => key !== 'summary');


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            <CardTitle>Resumo do Caldo Clarificado</CardTitle>
            <CardDescription>{caldoClarificado.summary}</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {caldoClarificadoData.map(([key, value]) => (
                    <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell className="text-right">{value}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
            <CardTitle>Resumo do Desempenho 1° Efeito</CardTitle>
            <CardDescription>{desempenhoPrimeiroEfeito.summary}</CardDescription>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Métrica</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {desempenhoData.map(([key, value]) => (
                    <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell className="text-right">{value}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}
