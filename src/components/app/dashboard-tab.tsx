'use client';

import { Bar, BarChart, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAppContext } from '@/context/app-context';

const chartConfig = {
  value: {
    label: "Valor",
  },
} as const;


export default function DashboardTab() {
  const { calculatedData, isCalculated } = useAppContext();

  if (!isCalculated || !calculatedData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Preencha o formulário e clique em "Calcular" para ver o painel.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
       <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Evolução do Brix</CardTitle>
          <CardDescription>Brix em cada efeito de evaporação.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={calculatedData.brixEvolution} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="brix" fill="hsl(var(--primary))" name="Brix (%)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Eficiência do Efeito</CardTitle>
          <CardDescription>Eficiência de evaporação por efeito.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={calculatedData.effectEfficiency} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="efficiency" fill="hsl(var(--primary))" name="Eficiência (%)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Taxa de Evaporação</CardTitle>
          <CardDescription>Taxa de evaporação por efeito.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={calculatedData.evaporationRate} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" name="Taxa (t/h)" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Geração de Vapor</CardTitle>
          <CardDescription>Geração de vapor por efeito.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={calculatedData.vaporGeneration} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="generation" fill="hsl(var(--primary))" name="Vapor (t/h)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
       <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Kg Vapor / m²</CardTitle>
          <CardDescription>Relação de kg de vapor por m².</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={calculatedData.kgVaporPorM2} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--primary))" name="kg/m²" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
