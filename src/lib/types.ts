import { z } from 'zod';

const numberOrEmptyString = z.union([
    z.number(),
    z.literal('')
]).pipe(
    z.coerce.number({ invalid_type_error: "Valor inválido." })
);

export const formSchema = z.object({
  vazaoCaldo: numberOrEmptyString.refine(val => val > 0, { message: 'Vazão é obrigatória.' }),
  brixCaldo: numberOrEmptyString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  temperaturaCaldo: numberOrEmptyString.refine(val => val !== undefined && val !== null, { message: 'Temperatura é obrigatória.' }),
  pressaoVapor: numberOrEmptyString.refine(val => val > 0, { message: 'Pressão é obrigatória.' }),
  preAquecimento: z.boolean(),
  tempEntradaAquec: z.optional(numberOrEmptyString),
  tempSaidaAquec: z.optional(numberOrEmptyString),
  brixEfeito1: numberOrEmptyString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito2: numberOrEmptyString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito3: numberOrEmptyString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito4: numberOrEmptyString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito5: numberOrEmptyString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  areaEfeito1: numberOrEmptyString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito2: numberOrEmptyString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito3: numberOrEmptyString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito4: numberOrEmptyString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito5: numberOrEmptyString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
}).refine(data => {
    if (data.preAquecimento) {
        return data.tempEntradaAquec !== undefined && data.tempEntradaAquec !== '' && data.tempSaidaAquec !== undefined && data.tempSaidaAquec !== '';
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
  kgVaporPorM2: { name: string; value: number }[];
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
