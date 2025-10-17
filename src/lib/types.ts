
import { z } from 'zod';

const numberFromString = z.string().transform((val, ctx) => {
    if (val.trim() === '') return NaN; // Keep this for required fields that are empty strings
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

// For required fields
const numberFromStringOrNumber = z.union([
    z.number(),
    z.string().refine(s => s.trim() !== '', { message: "Campo obrigatório." }).transform(val => parseFloat(val.replace(',', '.')))
]).refine(val => !isNaN(val), { message: "Valor inválido." });


// For optional fields
const optionalNumberFromString = z.union([
  z.literal(''),
  z.string().transform(v => v.trim() === '' ? undefined : parseFloat(v.replace(',', '.')))
]).refine(v => v === undefined || !isNaN(v), {
  message: 'Deve ser um número válido.',
}).optional().default(undefined);


export const formSchema = z.object({
  numberOfEffects: z.number().min(1).max(5),
  vazaoCaldo: numberFromStringOrNumber.refine(val => val > 0, { message: 'Vazão é obrigatória.' }),
  brixCaldo: numberFromStringOrNumber.refine(val => val > 0, { message: 'Brix é obrigatório.' }),
  temperaturaCaldo: optionalNumberFromString,
  pressaoVapor: numberFromStringOrNumber.refine(val => !isNaN(val), { message: 'Pressão é obrigatória.' }),
  
  // Effects data will be validated with a superRefine
  brixEfeito1: optionalNumberFromString,
  brixEfeito2: optionalNumberFromString,
  brixEfeito3: optionalNumberFromString,
  brixEfeito4: optionalNumberFromString,
  brixEfeito5: optionalNumberFromString,

  areaEfeito1: optionalNumberFromString,
  areaEfeito2: optionalNumberFromString,
  areaEfeito3: optionalNumberFromString,
  areaEfeito4: optionalNumberFromString,
  areaEfeito5: optionalNumberFromString,
}).superRefine((data, ctx) => {
    for (let i = 1; i <= data.numberOfEffects; i++) {
        const brixKey = `brixEfeito${i}` as keyof typeof data;
        const areaKey = `areaEfeito${i}` as keyof typeof data;

        if (data[brixKey] === undefined || data[brixKey] === null || isNaN(data[brixKey] as number) || (data[brixKey] as number) <= 0) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Brix é obrigatório.",
                path: [brixKey],
            });
        }
        if (data[areaKey] === undefined || data[areaKey] === null || isNaN(data[areaKey] as number) || (data[areaKey] as number) <= 0) {
             ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Área é obrigatória.",
                path: [areaKey],
            });
        }
    }
});


export type EvaporationData = z.infer<typeof formSchema>;

export type EffectSummaryData = {
  name: string;
  brixIn: number;
  brixOut: number;
  vazaoCaldo: number;
  vaporGerado: number;
  taxaEvaporacao: number; // This is in % for the summary table
  eficiencia: number;
  kgVaporM2: number;
  area: number;
};


export type CalculatedData = {
  densidadeCaldo: number;
  consumoVaporTotal: number;
  brixEvolution: { name: string; brix: number }[];
  effectEfficiency: { name: string; efficiency: number }[];
  evaporationRate: { name: string; rate: number }[]; // This is in % for the chart
  vaporGeneration: { name: string; generation: number }[];
  kgVaporPorM2: { name: string; value: number }[];
  caldoClarificado: Record<string, any>;
  desempenhoPrimeiroEfeito: Record<string, any>;
  effects: Record<string, any>; // Now a flexible record
  overallSummary: string;
  effectsSummary: EffectSummaryData[];
};

export type AIEvaluations = {
  generalEvaluation: string;
};

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'basic' | 'premium';
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  accessExpiration?: { // Added optional accessExpiration field
    seconds: number;
    nanoseconds: number;
  } | Date;
}

export type Message = {
    role: 'user' | 'model';
    content: string;
};
