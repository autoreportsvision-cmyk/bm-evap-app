import { z } from 'zod';

export const formSchema = z.object({
  vazaoCaldo: z.number({ required_error: 'Vazão é obrigatória.' }).min(0, 'Vazão não pode ser negativa.'),
  brixCaldo: z.number({ required_error: 'Brix é obrigatório.' }).min(0, 'Brix não pode ser negativo.'),
  temperaturaCaldo: z.number({ required_error: 'Temperatura é obrigatória.' }),
  pressaoVapor: z.number({ required_error: 'Pressão é obrigatória.' }).min(0, 'Pressão não pode ser negativa.'),
  preAquecimento: z.boolean(),
  tempEntradaAquec: z.number().optional(),
  tempSaidaAquec: z.number().optional(),
}).refine(data => {
    if (data.preAquecimento) {
        return data.tempEntradaAquec !== undefined && data.tempSaidaAquec !== undefined;
    }
    return true;
}, {
    message: "Temperaturas do aquecedor são obrigatórias com pré-aquecimento.",
    path: ["tempEntradaAquec"],
});

export type EvaporationData = z.infer<typeof formSchema>;

export type CalculatedData = {
  densidadeCaldo: number;
  consumoVaporTotal: number;
  brixEvolution: { name: string; brix: number }[];
  effectEfficiency: { name: string; efficiency: number }[];
  evaporationRate: { name: string; rate: number }[];
  vaporGeneration: { name: string; generation: number }[];
  caldoClarificado: Record<string, any>;
  desempenhoPrimeiroEfeito: Record<string, any>;
  effects: {
    effect1: Record<string, any>;
    effect2: Record<string, any>;
    effect3: Record<string, any>;
    effect4: Record<string, any>;
    effect5: Record<string, any>;
  };
  overallSummary: string;
};

export type AIEvaluations = {
  effect1Evaluation: string;
  effect2Evaluation: string;
  effect3Evaluation: string;
  effect4Evaluation: string;
  effect5Evaluation: string;
};
