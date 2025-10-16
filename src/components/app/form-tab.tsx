'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

import { useAppContext } from '@/context/app-context';
import { EvaporationData, formSchema } from '@/lib/types';
import { INITIAL_FORM_DATA } from '@/lib/constants';
import { performCalculations } from '@/lib/calculations';

export default function FormTab() {
  const { setFormData, setCalculatedData, setIsCalculated } = useAppContext();

  const form = useForm<EvaporationData>({
    resolver: zodResolver(formSchema),
    defaultValues: INITIAL_FORM_DATA,
    mode: 'onChange',
  });

  const { watch, control, formState: { errors } } = form;

  const watchedValues = watch();
  const preAquecimento = watch('preAquecimento');
  
  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === 'change') {
        const parsedData = formSchema.safeParse(value);
        if (parsedData.success) {
          setFormData(parsedData.data);
          const results = performCalculations(parsedData.data);
          setCalculatedData(results);
          setIsCalculated(true);
        } else {
          setIsCalculated(false);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setFormData, setCalculatedData, setIsCalculated]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulário de Entrada</CardTitle>
        <CardDescription>Insira os dados do processo para calcular o desempenho da evaporação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vazaoCaldo">Vazão Caldo (m³/h)</Label>
              <Controller
                name="vazaoCaldo"
                control={control}
                render={({ field }) => <Input id="vazaoCaldo" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
              />
              {errors.vazaoCaldo && <p className="text-destructive text-xs">{errors.vazaoCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brixCaldo">Brix do Caldo (%)</Label>
               <Controller
                name="brixCaldo"
                control={control}
                render={({ field }) => <Input id="brixCaldo" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
              />
              {errors.brixCaldo && <p className="text-destructive text-xs">{errors.brixCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperaturaCaldo">Temperatura Caldo (°C)</Label>
               <Controller
                name="temperaturaCaldo"
                control={control}
                render={({ field }) => <Input id="temperaturaCaldo" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
              />
              {errors.temperaturaCaldo && <p className="text-destructive text-xs">{errors.temperaturaCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pressaoVapor">Pressão Vapor (kgf/cm²)</Label>
               <Controller
                name="pressaoVapor"
                control={control}
                render={({ field }) => <Input id="pressaoVapor" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
              />
              {errors.pressaoVapor && <p className="text-destructive text-xs">{errors.pressaoVapor.message}</p>}
            </div>
          </div>
          
          <Separator />

          <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Controller
                    name="preAquecimento"
                    control={control}
                    render={({ field }) => (
                        <Checkbox id="preAquecimento" checked={field.value} onCheckedChange={field.onChange} />
                    )}
                />
                <label htmlFor="preAquecimento" className="text-sm font-medium leading-none">
                Habilitar Pré-aquecimento
                </label>
            </div>
            {preAquecimento && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-md bg-muted/50">
                    <div className="space-y-2">
                        <Label htmlFor="tempEntradaAquec">Temp. Entrada Aquecedor (°C)</Label>
                        <Controller
                            name="tempEntradaAquec"
                            control={control}
                            render={({ field }) => <Input id="tempEntradaAquec" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                        />
                         {errors.tempEntradaAquec && <p className="text-destructive text-xs">{errors.tempEntradaAquec.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tempSaidaAquec">Temp. Saída Aquecedor (°C)</Label>
                        <Controller
                            name="tempSaidaAquec"
                            control={control}
                            render={({ field }) => <Input id="tempSaidaAquec" type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />}
                        />
                         {errors.tempSaidaAquec && <p className="text-destructive text-xs">{errors.tempSaidaAquec.message}</p>}
                    </div>
                </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Resultados Calculados</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label>Densidade do Caldo (kg/m³)</Label>
                    <Input value={performCalculations(watchedValues).densidadeCaldo.toFixed(2)} readOnly className="font-semibold" />
                </div>
                 <div className="space-y-2">
                    <Label>Consumo de Vapor Total (t/h)</Label>
                    <Input value={performCalculations(watchedValues).consumoVaporTotal.toFixed(2)} readOnly className="font-semibold" />
                </div>
             </div>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
