import { z } from 'zod';

const numberFromString = z.string().transform((val, ctx) => {
    if (val === null || val === '') {
        // Permite campos vazios inicialmente, que podem ser opcionais.
        return NaN;
    }
    const parsed = parseFloat(val.replace(',', '.'));
    if (isNaN(parsed)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Deve ser um número.",
        });
        return z.NEVER;
    }
    return parsed;
});

export const formSchema = z.object({
  vazaoCaldo: numberFromString.refine(val => val > 0, { message: 'Vazão é obrigatória.' }),
  brixCaldo: numberFromString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  temperaturaCaldo: numberFromString.optional(),
  pressaoVapor: numberFromString.refine(val => !isNaN(val) && val > 0, { message: 'Pressão é obrigatória e deve ser maior que zero.' }),
  preAquecimento: z.boolean(),
  tempEntradaAquec: z.optional(numberFromString),
  tempSaidaAquec: z.optional(numberFromString),
  brixEfeito1: numberFromString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito2: numberFromString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito3: numberFromString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito4: numberFromString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito5: numberFromString.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  areaEfeito1: numberFromString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito2: numberFromString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito3: numberFromString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito4: numberFromString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito5: numberFromString.refine(val => val > 0, { message: 'Área é obrigatória.' }),
}).refine(data => {
    if (data.preAquecimento) {
        const tempEntrada = data.tempEntradaAquec;
        const tempSaida = data.tempSaidaAquec;
        return tempEntrada !== undefined && !isNaN(tempEntrada) && tempEntrada > 0 && tempSaida !== undefined && !isNaN(tempSaida) && tempSaida > 0;
    }
    return true;
}, {
    message: "Temperaturas do aquecedor são obrigatórias e devem ser maiores que zero.",
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
