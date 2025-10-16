
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

  const { control, handleSubmit, reset, formState: { errors }, watch } = form;

  useEffect(() => {
    // This ensures the form is updated if the context data changes from another source,
    // but it won't reset the form after a successful submission within this component.
    reset(formData);
  }, [formData, reset]);

  
  const onSubmit = (data: EvaporationData) => {
    try {
      // The `data` object is already validated and parsed by zodResolver.
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
              <Label htmlFor="temperaturaCaldo">Temperatura caldo entrada do evaporador (°C)</Label>
               <Controller
                name="temperaturaCaldo"
                control={control}
                render={({ field }) => <Input id="temperaturaCaldo" type="text" inputMode='decimal' placeholder="ex: 105" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
              />
              {errors.temperaturaCaldo && <p className="text-destructive text-xs">{errors.temperaturaCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pressaoVapor">Pressão Vapor de Escape (kgf/cm²)</Label>
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
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito1">Efeito 1</Label>
                    <Controller
                        name="brixEfeito1"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito1" type="text" inputMode='decimal' placeholder="ex: 18" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.brixEfeito1 && <p className="text-destructive text-xs">{errors.brixEfeito1.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito2">Efeito 2</Label>
                    <Controller
                        name="brixEfeito2"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito2" type="text" inputMode='decimal' placeholder="ex: 22.5" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.brixEfeito2 && <p className="text-destructive text-xs">{errors.brixEfeito2.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="brixEfeito3">Efeito 3</Label>
                    <Controller
                        name="brixEfeito3"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito3" type="text" inputMode='decimal' placeholder="ex: 28.5" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.brixEfeito3 && <p className="text-destructive text-xs">{errors.brixEfeito3.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito4">Efeito 4</Label>
                    <Controller
                        name="brixEfeito4"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito4" type="text" inputMode='decimal' placeholder="ex: 37.5" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.brixEfeito4 && <p className="text-destructive text-xs">{errors.brixEfeito4.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito5">Efeito 5</Label>
                    <Controller
                        name="brixEfeito5"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito5" type="text" inputMode='decimal' placeholder="ex: 65" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.brixEfeito5 && <p className="text-destructive text-xs">{errors.brixEfeito5.message}</p>}
                </div>
             </div>
          </div>

          <Separator />

           <div className="space-y-4">
            <h3 className="text-lg font-medium">Área de Troca Térmica por Efeito (m²)</h3>
             <div className="grid grid-cols-1 md-grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="areaEfeito1">Efeito 1</Label>
                    <Controller
                        name="areaEfeito1"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito1" type="text" inputMode='decimal' placeholder="ex: 1000" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.areaEfeito1 && <p className="text-destructive text-xs">{errors.areaEfeito1.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="areaEfeito2">Efeito 2</Label>
                    <Controller
                        name="areaEfeito2"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito2" type="text" inputMode='decimal' placeholder="ex: 1000" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.areaEfeito2 && <p className="text-destructive text-xs">{errors.areaEfeito2.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="areaEfeito3">Efeito 3</Label>
                    <Controller
                        name="areaEfeito3"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito3" type="text" inputMode='decimal' placeholder="ex: 1000" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.areaEfeito3 && <p className="text-destructive text-xs">{errors.areaEfeito3.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="areaEfeito4">Efeito 4</Label>
                    <Controller
                        name="areaEfeito4"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito4" type="text" inputMode='decimal' placeholder="ex: 800" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.areaEfeito4 && <p className="text-destructive text-xs">{errors.areaEfeito4.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="areaEfeito5">Efeito 5</Label>
                    <Controller
                        name="areaEfeito5"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito5" type="text" inputMode='decimal' placeholder="ex: 800" {...field} onChange={e => field.onChange(e.target.value)} value={field.value ?? ''} />}
                    />
                    {errors.areaEfeito5 && <p className="text-destructive text-xs">{errors.areaEfeito5.message}</p>}
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
