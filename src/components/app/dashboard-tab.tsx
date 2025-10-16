'use client';

import { Bar, BarChart, Cell, Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAppContext } from '@/context/app-context';

const chartConfig = {
  value: {
    label: "Valor",
  },
  rate: {
    label: "Taxa (%)",
  },
} as const;

// HSL Colors
const COLORS = {
  green: 'hsl(142.1 76.2% 36.3%)', // green-600
  yellow: 'hsl(47.9 95.8% 53.1%)', // yellow-500
  red: 'hsl(0 84.2% 60.2%)', // red-500
};

const getBrixColor = (brix: number, index: number) => {
  const targetBrix = [18, 22.5, 28.5, 37.5, 65];
  const b = targetBrix[index];
  if (brix > b * 1.1) return COLORS.red; // Critical
  if (brix < b * 0.9) return COLORS.yellow; // Attention
  return COLORS.green; // Good
};

const getEfficiencyColor = (efficiency: number) => {
  if (efficiency < 85) return COLORS.red;
  if (efficiency < 90) return COLORS.yellow;
  return COLORS.green;
};

const getKgVaporM2Color = (value: number) => {
    if (value < 25) return COLORS.yellow;
    if (value > 30) return COLORS.red;
    return COLORS.green;
}

export default function DashboardTab() {
  const { calculatedData, isCalculated } = useAppContext();

  if (!isCalculated || !calculatedData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Preencha o formulário e clique em "Calcular" para ver o painel.
      </div>
    );
  }

  const brixData = calculatedData.brixEvolution.map((item, index) => ({
    ...item,
    fill: getBrixColor(item.brix, index)
  }));
  
  const efficiencyData = calculatedData.effectEfficiency.map((item) => ({
    ...item,
    fill: getEfficiencyColor(item.efficiency)
  }));
  
  const kgVaporM2Data = calculatedData.kgVaporPorM2.map((item) => ({
      ...item,
      fill: getKgVaporM2Color(item.value)
  }));


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
       <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Evolução do Brix</CardTitle>
          <CardDescription>Brix em cada efeito de evaporação.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={brixData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="brix" name="Brix (%)">
                {brixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
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
            <BarChart data={efficiencyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="efficiency" name="Eficiência (%)" >
                 {efficiencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="xl:col-span-1">
        <CardHeader>
          <CardTitle>Taxa de Evaporação (%)</CardTitle>
          <CardDescription>Percentual de evaporação por efeito.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <LineChart data={calculatedData.evaporationRate} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" name="Taxa (%)" />
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
            <BarChart data={kgVaporM2Data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="value" name="kg/m²">
                {kgVaporM2Data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
