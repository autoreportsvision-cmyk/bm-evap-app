'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Calculator } from 'lucide-react';

import { useAppContext } from '@/context/app-context';
import { EvaporationData, formSchema } from '@/lib/types';
import { performCalculations } from '@/lib/calculations';

export default function FormTab() {
  const { formData, setFormData, setCalculatedData, setIsCalculated } = useAppContext();

  const form = useForm<EvaporationData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
    mode: 'onBlur',
  });

  const { control, handleSubmit, watch, formState: { errors } } = form;

  const preAquecimento = watch('preAquecimento');
  
  const onSubmit = (data: EvaporationData) => {
    setFormData(data);
    const results = performCalculations(data);
    setCalculatedData(results);
    setIsCalculated(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulário de Entrada</CardTitle>
        <CardDescription>Insira os dados do processo para calcular o desempenho da evaporação.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vazaoCaldo">Vazão Caldo (m³/h)</Label>
              <Controller
                name="vazaoCaldo"
                control={control}
                render={({ field }) => <Input id="vazaoCaldo" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
              />
              {errors.vazaoCaldo && <p className="text-destructive text-xs">{errors.vazaoCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brixCaldo">Brix do Caldo (%)</Label>
               <Controller
                name="brixCaldo"
                control={control}
                render={({ field }) => <Input id="brixCaldo" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
              />
              {errors.brixCaldo && <p className="text-destructive text-xs">{errors.brixCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperaturaCaldo">Temperatura Caldo (°C)</Label>
               <Controller
                name="temperaturaCaldo"
                control={control}
                render={({ field }) => <Input id="temperaturaCaldo" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
              />
              {errors.temperaturaCaldo && <p className="text-destructive text-xs">{errors.temperaturaCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pressaoVapor">Pressão Vapor (kgf/cm²)</Label>
               <Controller
                name="pressaoVapor"
                control={control}
                render={({ field }) => <Input id="pressaoVapor" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
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
                            render={({ field }) => <Input id="tempEntradaAquec" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
                        />
                         {errors.tempEntradaAquec && <p className="text-destructive text-xs">{errors.tempEntradaAquec.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tempSaidaAquec">Temp. Saída Aquecedor (°C)</Label>
                        <Controller
                            name="tempSaidaAquec"
                            control={control}
                            render={({ field }) => <Input id="tempSaidaAquec" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
                        />
                         {errors.tempSaidaAquec && <p className="text-destructive text-xs">{errors.tempSaidaAquec.message}</p>}
                    </div>
                </div>
            )}
          </div>
          
          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Brix por Efeito (%)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito1">Efeito 1</Label>
                    <Controller
                        name="brixEfeito1"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito1" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
                    />
                    {errors.brixEfeito1 && <p className="text-destructive text-xs">{errors.brixEfeito1.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito2">Efeito 2</Label>
                    <Controller
                        name="brixEfeito2"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito2" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
                    />
                    {errors.brixEfeito2 && <p className="text-destructive text-xs">{errors.brixEfeito2.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="brixEfeito3">Efeito 3</Label>
                    <Controller
                        name="brixEfeito3"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito3" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
                    />
                    {errors.brixEfeito3 && <p className="text-destructive text-xs">{errors.brixEfeito3.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito4">Efeito 4</Label>
                    <Controller
                        name="brixEfeito4"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito4" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
                    />
                    {errors.brixEfeito4 && <p className="text-destructive text-xs">{errors.brixEfeito4.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito5">Efeito 5</Label>
                    <Controller
                        name="brixEfeito5"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito5" type="number" step="any" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} />}
                    />
                    {errors.brixEfeito5 && <p className="text-destructive text-xs">{errors.brixEfeito5.message}</p>}
                </div>
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
