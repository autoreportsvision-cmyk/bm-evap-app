
import { z } from 'zod';

const numberFromEmptyString = z.literal('').transform(() => NaN);

const numberFromString = z.string().transform((val, ctx) => {
    if (val.trim() === '') return NaN;
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

const numberFromStringOrNumber = z.union([
    z.number(),
    z.string().refine(s => s.trim() !== '', { message: "Campo obrigatório." }).transform(val => parseFloat(val.replace(',', '.')))
]).refine(val => !isNaN(val), { message: "Valor inválido." });


const optionalNumberFromString = z.union([
    numberFromEmptyString,
    numberFromString,
    z.number(),
    z.nan(),
    z.undefined()
]);


export const formSchema = z.object({
  vazaoCaldo: numberFromStringOrNumber.refine(val => val > 0, { message: 'Vazão é obrigatória.' }),
  brixCaldo: numberFromStringOrNumber.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  temperaturaCaldo: optionalNumberFromString,
  pressaoVapor: numberFromStringOrNumber.refine(val => !isNaN(val), { message: 'Pressão é obrigatória.' }),
  preAquecimento: z.boolean(),
  tempEntradaAquec: optionalNumberFromString,
  tempSaidaAquec: optionalNumberFromString,
  brixEfeito1: numberFromStringOrNumber.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito2: numberFromStringOrNumber.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito3: numberFromStringOrNumber.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito4: numberFromStringOrNumber.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  brixEfeito5: numberFromStringOrNumber.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  areaEfeito1: numberFromStringOrNumber.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito2: numberFromStringOrNumber.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito3: numberFromStringOrNumber.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito4: numberFromStringOrNumber.refine(val => val > 0, { message: 'Área é obrigatória.' }),
  areaEfeito5: numberFromStringOrNumber.refine(val => val > 0, { message: 'Área é obrigatória.' }),
}).refine(data => {
    if (data.preAquecimento) {
        const tempEntrada = data.tempEntradaAquec;
        const tempSaida = data.tempSaidaAquec;
        const entradaValida = tempEntrada !== undefined && !isNaN(tempEntrada) && tempEntrada > 0;
        const saidaValida = tempSaida !== undefined && !isNaN(tempSaida) && tempSaida > 0;
        return entradaValida && saidaValida;
    }
    return true;
}, {
    message: "Temperaturas do aquecedor são obrigatórias e devem ser maiores que zero quando o pré-aquecimento está habilitado.",
    path: ["tempEntradaAquec"],
});

export type EvaporationData = z.infer<typeof formSchema>;

export type EffectSummaryData = {
  name: string;
  brixIn: number;
  brixOut: number;
  vazaoCaldo: number;
  vaporGerado: number;
  taxaEvaporacao: number;
  eficiencia: number;
};


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
  effectsSummary: EffectSummaryData[];
};

export type AIEvaluations = {
  generalEvaluation: string;
};
