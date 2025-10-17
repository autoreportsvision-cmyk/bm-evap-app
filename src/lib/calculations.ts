
import type { EvaporationData, CalculatedData, EffectSummaryData } from './types';

export function performCalculations(data: EvaporationData): CalculatedData {
  const { 
    numberOfEffects,
    vazaoCaldo, 
    brixCaldo, 
    temperaturaCaldo, 
    pressaoVapor,
   } = data;

  const brixEfeitos: number[] = [];
  const areaEfeitos: number[] = [];
  for (let i = 1; i <= numberOfEffects; i++) {
    brixEfeitos.push(data[`brixEfeito${i}` as keyof EvaporationData] as number);
    areaEfeitos.push(data[`areaEfeito${i}` as keyof EvaporationData] as number);
  }

  const densidadeCaldo = 1000 + (4.86 * brixCaldo) - (0.09 * Math.pow(brixCaldo, 2));

  const tempEbulicaoPrimeiroEfeito = 100 + 13.5 * Math.log(pressaoVapor + 1);

  const calorEspecificoCaldo = 4.187 * (1 - (0.006 * brixCaldo)); // kJ/kg°C
  const calorLatenteVapor = 2257; // kJ/kg (aproximado)
  const vazaoMassaCaldo = (vazaoCaldo * densidadeCaldo) / 1000; // t/h
  const tempEntrada = temperaturaCaldo && !isNaN(temperaturaCaldo) ? temperaturaCaldo : 105;

  let vaporParaAquecimento = 0;
  if (tempEntrada < tempEbulicaoPrimeiroEfeito) {
      vaporParaAquecimento = (vazaoMassaCaldo * calorEspecificoCaldo * (tempEbulicaoPrimeiroEfeito - tempEntrada)) / calorLatenteVapor;
  }

  const brixValues = [brixCaldo, ...brixEfeitos];
  
  const vazoesSaida: number[] = [];
  const evaporationRatesTons: number[] = [];
  let vazaoEntradaAtual = vazaoMassaCaldo;
  
  for (let i = 0; i < numberOfEffects; i++) {
    const brixIn = brixValues[i];
    const brixOut = brixValues[i+1];
    
    const vazaoSaida = vazaoEntradaAtual * (brixIn / brixOut);
    vazoesSaida.push(vazaoSaida);
    
    const rateInTons = vazaoEntradaAtual - vazaoSaida;
    evaporationRatesTons.push(rateInTons);
    
    vazaoEntradaAtual = vazaoSaida;
  }

  const consumoVaporPrimeiroEfeito = vaporParaAquecimento + evaporationRatesTons[0];

  const evaporationRatePercent: { name: string; rate: number }[] = [];
  for (let i = 0; i < numberOfEffects; i++) {
      const brixIn = brixValues[i];
      const brixOut = brixValues[i+1];
      const rate = (1 - (brixIn / brixOut)) * 100;
      evaporationRatePercent.push({
          name: `Efeito ${i + 1}`,
          rate: parseFloat(rate.toFixed(1))
      });
  }

  const brixEvolution = brixEfeitos.map((brix, index) => ({
    name: `Efeito ${index + 1}`,
    brix: parseFloat(brix.toFixed(1))
  }));

  const effectEfficiency = brixEfeitos.map((_, index) => ({
    name: `Efeito ${index + 1}`,
    efficiency: 85 + Math.random() * 15 // Placeholder
  })).map(d => ({ ...d, efficiency: parseFloat(d.efficiency.toFixed(1)) }));
  
  const vaporGeneration = brixEfeitos.map((_, index) => ({
      name: `Efeito ${index + 1}`,
      generation: evaporationRatesTons[index]
  })).map(d => ({...d, generation: parseFloat(d.generation.toFixed(1))}));

  const kgVaporPorM2 = vaporGeneration.map((item, index) => ({
      name: item.name,
      value: (item.generation * 1000) / areaEfeitos[index],
  })).map(d => ({...d, value: parseFloat(d.value.toFixed(2))}));

  const caldoClarificado = {
    'Vazão (m³/h)': vazaoCaldo.toFixed(2),
    'Brix (%)': brixCaldo.toFixed(2),
    'Temperatura (°C)': tempEntrada.toFixed(2),
    'Densidade (kg/m³)': densidadeCaldo.toFixed(2),
    summary: 'Análise dos parâmetros de entrada do caldo clarificado.'
  };

  const desempenhoPrimeiroEfeito = {
    'Taxa Evaporação (t/h)': evaporationRatesTons[0].toFixed(2),
    'Eficiência (%)': effectEfficiency[0].efficiency.toFixed(2),
    'Vapor Gerado (t/h)': vaporGeneration[0].generation.toFixed(2),
    'kg vapor/m²': kgVaporPorM2[0].value.toFixed(2),
    summary: 'Indicadores chave de performance para o primeiro efeito.'
  };

  const effects: Record<string, any> = {};
  for (let i = 0; i < numberOfEffects; i++) {
    effects[`effect${i + 1}`] = {
      vazao: vazoesSaida[i],
      brix: brixEvolution[i].brix,
      eficiencia: effectEfficiency[i].efficiency,
      taxa_evaporacao: evaporationRatesTons[i],
      area: areaEfeitos[i],
      kg_vapor_m2: kgVaporPorM2[i].value
    };
  }

  const overallSummary = `Processo com vazão de ${vazaoCaldo} m³/h e brix de ${brixCaldo}%. O consumo total de vapor no primeiro efeito é de ${consumoVaporPrimeiroEfeito.toFixed(2)} t/h, sendo ${vaporParaAquecimento.toFixed(2)} t/h para aquecimento do caldo e ${evaporationRatesTons[0].toFixed(2)} t/h para evaporação.`;

  const effectsSummary: EffectSummaryData[] = brixEvolution.map((effect, index) => {
    const brixIn = brixValues[index];
    const brixOut = brixValues[index + 1];
    
    const taxaEvaporacaoPercent = (1 - (brixIn / brixOut)) * 100;
    
    return {
        name: `Efeito ${index + 1}`,
        brixIn: parseFloat(brixIn.toFixed(2)),
        brixOut: parseFloat(brixOut.toFixed(2)),
        vazaoCaldo: parseFloat(vazoesSaida[index].toFixed(2)),
        vaporGerado: parseFloat(vaporGeneration[index].generation.toFixed(2)),
        taxaEvaporacao: parseFloat(taxaEvaporacaoPercent.toFixed(2)),
        eficiencia: parseFloat(effectEfficiency[index].efficiency.toFixed(2)),
        kgVaporM2: parseFloat(kgVaporPorM2[index].value.toFixed(2)),
        area: areaEfeitos[index],
    }
  });


  return {
    densidadeCaldo,
    consumoVaporTotal: consumoVaporPrimeiroEfeito,
    brixEvolution,
    effectEfficiency,
    evaporationRate: evaporationRatePercent,
    vaporGeneration,
    kgVaporPorM2,
    caldoClarificado,
    desempenhoPrimeiroEfeito,
    effects,
    overallSummary,
    effectsSummary,
  };
}
