
'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calculator } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useAppContext } from '@/context/app-context';
import { EvaporationData, formSchema } from '@/lib/types';
import { performCalculations } from '@/lib/calculations';
import { useToast } from '@/hooks/use-toast';

type FormTabProps = {
  onCalculate: () => void;
};


export default function FormTab({ onCalculate }: FormTabProps) {
  const { formData, setFormData, setCalculatedData, setIsCalculated } = useAppContext();
  const { toast } = useToast();

  const form = useForm<EvaporationData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
    mode: 'onBlur',
  });

  const { control, handleSubmit, reset, formState: { errors }, watch, setValue } = form;

  const numberOfEffects = watch('numberOfEffects');

  useEffect(() => {
    reset(formData);
  }, [formData, reset]);

  
  const onSubmit = (data: EvaporationData) => {
    try {
      setFormData(data);
      const results = performCalculations(data);
      setCalculatedData(results);
      setIsCalculated(true);
      onCalculate();
      toast({
        title: "Sucesso!",
        description: "Cálculos realizados. Verifique a aba Dashboard.",
      });
    } catch(e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro no Cálculo",
        description: "Ocorreu um erro ao realizar os cálculos. Por favor, verifique os dados de entrada.",
      });
    }
  };

  const renderEffectFields = () => {
    const fields = [];
    for (let i = 1; i <= numberOfEffects; i++) {
        fields.push(
            <div key={`effect-${i}`} className="space-y-2">
                <Label htmlFor={`brixEfeito${i}`}>Efeito {i}</Label>
                <Controller
                    name={`brixEfeito${i}` as keyof EvaporationData}
                    control={control}
                    render={({ field }) => (
                        <Input
                            id={`brixEfeito${i}`}
                            type="text"
                            inputMode="decimal"
                            placeholder={`Brix do Efeito ${i}`}
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                            value={field.value ?? ''}
                        />
                    )}
                />
                {errors[`brixEfeito${i}` as keyof EvaporationData] && <p className="text-destructive text-xs">{errors[`brixEfeito${i}` as keyof EvaporationData]?.message}</p>}
            </div>
        );
    }
    return fields;
  };
  
  const renderAreaFields = () => {
    const fields = [];
    for (let i = 1; i <= numberOfEffects; i++) {
        fields.push(
            <div key={`area-${i}`} className="space-y-2">
                <Label htmlFor={`areaEfeito${i}`}>Efeito {i}</Label>
                <Controller
                    name={`areaEfeito${i}` as keyof EvaporationData}
                    control={control}
                    render={({ field }) => (
                        <Input
                            id={`areaEfeito${i}`}
                            type="text"
                            inputMode="decimal"
                            placeholder={`Área do Efeito ${i}`}
                            {...field}
                            onChange={e => field.onChange(e.target.value)}
                            value={field.value ?? ''}
                        />
                    )}
                />
                {errors[`areaEfeito${i}` as keyof EvaporationData] && <p className="text-destructive text-xs">{errors[`areaEfeito${i}` as keyof EvaporationData]?.message}</p>}
            </div>
        );
    }
    return fields;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulário de Entrada</CardTitle>
        <CardDescription>Insira os dados do processo para calcular o desempenho da evaporação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
             <div className="space-y-2 lg:col-span-1">
                <Label htmlFor="numberOfEffects">Nº de Efeitos</Label>
                <Controller
                    name="numberOfEffects"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={(value) => field.onChange(parseInt(value))} value={String(field.value)}>
                            <SelectTrigger id="numberOfEffects">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5].map(num => (
                                    <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                />
                {errors.numberOfEffects && <p className="text-destructive text-xs">{errors.numberOfEffects.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="vazaoCaldo">Vazão Caldo (m³/h)</Label>
              <Controller
                name="vazaoCaldo"
                control={control}
                render={({ field }) => <Input id="vazaoCaldo" type="text" inputMode='decimal' placeholder="ex: 750" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''}/>}
              />
              {errors.vazaoCaldo && <p className="text-destructive text-xs">{errors.vazaoCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brixCaldo">Brix do Caldo (%)</Label>
               <Controller
                name="brixCaldo"
                control={control}
                render={({ field }) => <Input id="brixCaldo" type="text" inputMode='decimal' placeholder="ex: 15" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''}/>}
              />
              {errors.brixCaldo && <p className="text-destructive text-xs">{errors.brixCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperaturaCaldo">Temperatura caldo (°C)</Label>
               <Controller
                name="temperaturaCaldo"
                control={control}
                render={({ field }) => <Input id="temperaturaCaldo" type="text" inputMode='decimal' placeholder="ex: 105" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
              />
              {errors.temperaturaCaldo && <p className="text-destructive text-xs">{errors.temperaturaCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pressaoVapor">Pressão Vapor (kgf/cm²)</Label>
               <Controller
                name="pressaoVapor"
                control={control}
                render={({ field }) => <Input id="pressaoVapor" type="text" inputMode='decimal' placeholder="ex: 2.5" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
              />
              {errors.pressaoVapor && <p className="text-destructive text-xs">{errors.pressaoVapor.message}</p>}
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Brix por Efeito (%)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {renderEffectFields()}
             </div>
          </div>

          <Separator />

           <div className="space-y-4">
            <h3 className="text-lg font-medium">Área de Troca Térmica por Efeito (m²)</h3>
             <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-5 gap-4">
                {renderAreaFields()}
             </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-end">
            <Button type="submit">
                <Calculator className="mr-2 h-4 w-4" />
                Calcular
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
