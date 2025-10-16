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
import { Calculator } from 'lucide-react';

import { useAppContext } from '@/context/app-context';
import { EvaporationData, formSchema } from '@/lib/types';
import { performCalculations } from '@/lib/calculations';
import { INITIAL_FORM_DATA } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

type FormTabProps = {
  onCalculate: () => void;
};


export default function FormTab({ onCalculate }: FormTabProps) {
  const { formData, setFormData, setCalculatedData, setIsCalculated, isCalculated } = useAppContext();
  const { toast } = useToast();

  const form = useForm<EvaporationData>({
    resolver: zodResolver(formSchema),
    defaultValues: isCalculated ? formData : INITIAL_FORM_DATA,
    mode: 'onBlur',
  });

  const { control, handleSubmit, watch, reset, formState: { errors } } = form;

  useEffect(() => {
    if (isCalculated) {
      reset(formData);
    } else {
      reset(INITIAL_FORM_DATA);
    }
  }, [isCalculated, formData, reset]);


  const preAquecimento = watch('preAquecimento');
  
  const onSubmit = (data: EvaporationData) => {
    try {
      const parsedData = formSchema.parse(data);
      setFormData(parsedData);
      const results = performCalculations(parsedData);
      setCalculatedData(results);
      setIsCalculated(true);
      onCalculate();
    } catch(e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Erro de Validação",
        description: "Por favor, verifique os campos do formulário.",
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
                render={({ field }) => <Input id="vazaoCaldo" type="number" placeholder="ex: 750" step="any" {...field} />}
              />
              {errors.vazaoCaldo && <p className="text-destructive text-xs">{errors.vazaoCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="brixCaldo">Brix do Caldo (%)</Label>
               <Controller
                name="brixCaldo"
                control={control}
                render={({ field }) => <Input id="brixCaldo" type="number" placeholder="ex: 15" step="any" {...field} />}
              />
              {errors.brixCaldo && <p className="text-destructive text-xs">{errors.brixCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperaturaCaldo">Temperatura Caldo (°C)</Label>
               <Controller
                name="temperaturaCaldo"
                control={control}
                render={({ field }) => <Input id="temperaturaCaldo" type="number" placeholder="ex: 105" step="any" {...field} />}
              />
              {errors.temperaturaCaldo && <p className="text-destructive text-xs">{errors.temperaturaCaldo.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pressaoVapor">Pressão Vapor (kgf/cm²)</Label>
               <Controller
                name="pressaoVapor"
                control={control}
                render={({ field }) => <Input id="pressaoVapor" type="number" placeholder="ex: 2.5" step="any" {...field} />}
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
                            render={({ field }) => <Input id="tempEntradaAquec" type="number" placeholder="ex: 90" step="any" {...field} />}
                        />
                         {errors.tempEntradaAquec && <p className="text-destructive text-xs">{errors.tempEntradaAquec.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="tempSaidaAquec">Temp. Saída Aquecedor (°C)</Label>
                        <Controller
                            name="tempSaidaAquec"
                            control={control}
                            render={({ field }) => <Input id="tempSaidaAquec" type="number" placeholder="ex: 115" step="any" {...field} />}
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
                        render={({ field }) => <Input id="brixEfeito1" type="number" placeholder="ex: 18" step="any" {...field} />}
                    />
                    {errors.brixEfeito1 && <p className="text-destructive text-xs">{errors.brixEfeito1.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito2">Efeito 2</Label>
                    <Controller
                        name="brixEfeito2"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito2" type="number" placeholder="ex: 22.5" step="any" {...field} />}
                    />
                    {errors.brixEfeito2 && <p className="text-destructive text-xs">{errors.brixEfeito2.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="brixEfeito3">Efeito 3</Label>
                    <Controller
                        name="brixEfeito3"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito3" type="number" placeholder="ex: 28.5" step="any" {...field} />}
                    />
                    {errors.brixEfeito3 && <p className="text-destructive text-xs">{errors.brixEfeito3.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito4">Efeito 4</Label>
                    <Controller
                        name="brixEfeito4"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito4" type="number" placeholder="ex: 37.5" step="any" {...field} />}
                    />
                    {errors.brixEfeito4 && <p className="text-destructive text-xs">{errors.brixEfeito4.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="brixEfeito5">Efeito 5</Label>
                    <Controller
                        name="brixEfeito5"
                        control={control}
                        render={({ field }) => <Input id="brixEfeito5" type="number" placeholder="ex: 65" step="any" {...field} />}
                    />
                    {errors.brixEfeito5 && <p className="text-destructive text-xs">{errors.brixEfeito5.message}</p>}
                </div>
             </div>
          </div>

          <Separator />

           <div className="space-y-4">
            <h3 className="text-lg font-medium">Área de Troca Térmica por Efeito (m²)</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="areaEfeito1">Efeito 1</Label>
                    <Controller
                        name="areaEfeito1"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito1" type="number" placeholder="ex: 1000" step="any" {...field} />}
                    />
                    {errors.areaEfeito1 && <p className="text-destructive text-xs">{errors.areaEfeito1.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="areaEfeito2">Efeito 2</Label>
                    <Controller
                        name="areaEfeito2"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito2" type="number" placeholder="ex: 1000" step="any" {...field} />}
                    />
                    {errors.areaEfeito2 && <p className="text-destructive text-xs">{errors.areaEfeito2.message}</p>}
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="areaEfeito3">Efeito 3</Label>
                    <Controller
                        name="areaEfeito3"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito3" type="number" placeholder="ex: 1000" step="any" {...field} />}
                    />
                    {errors.areaEfeito3 && <p className="text-destructive text-xs">{errors.areaEfeito3.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="areaEfeito4">Efeito 4</Label>
                    <Controller
                        name="areaEfeito4"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito4" type="number" placeholder="ex: 800" step="any" {...field} />}
                    />
                    {errors.areaEfeito4 && <p className="text-destructive text-xs">{errors.areaEfeito4.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="areaEfeito5">Efeito 5</Label>
                    <Controller
                        name="areaEfeito5"
                        control={control}
                        render={({ field }) => <Input id="areaEfeito5" type="number" placeholder="ex: 800" step="any" {...field} />}
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
