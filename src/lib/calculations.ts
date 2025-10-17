
import type { EvaporationData, CalculatedData, EffectSummaryData } from './types';

// NOTE: These are placeholder calculations. Replace with real formulas.
export function performCalculations(data: EvaporationData): CalculatedData {
  const { 
    vazaoCaldo, 
    brixCaldo, 
    temperaturaCaldo, 
    pressaoVapor,
    brixEfeito1,
    brixEfeito2,
    brixEfeito3,
    brixEfeito4,
    brixEfeito5,
    areaEfeito1,
    areaEfeito2,
    areaEfeito3,
    areaEfeito4,
    areaEfeito5,
   } = data;

  const densidadeCaldo = 1000 + (4.86 * brixCaldo) - (0.09 * Math.pow(brixCaldo, 2)); // Fórmula mais precisa

  // Temperatura de ebulição da água na pressão de escape (aproximação)
  const tempEbulicaoPrimeiroEfeito = 100 + 13.5 * Math.log(pressaoVapor + 1); // Aprox. para kgf/cm²

  const calorEspecificoCaldo = 4.187 * (1 - (0.006 * brixCaldo)); // kJ/kg°C
  const calorLatenteVapor = 2257; // kJ/kg (aproximado)
  const vazaoMassaCaldo = (vazaoCaldo * densidadeCaldo) / 1000; // t/h
  const tempEntrada = temperaturaCaldo && !isNaN(temperaturaCaldo) ? temperaturaCaldo : 105;

  // 1. Cálculo do Vapor SOMENTE para Aquecimento
  let vaporParaAquecimento = 0;
  if (tempEntrada < tempEbulicaoPrimeiroEfeito) {
      vaporParaAquecimento = (vazaoMassaCaldo * calorEspecificoCaldo * (tempEbulicaoPrimeiroEfeito - tempEntrada)) / calorLatenteVapor;
  }

  const brixValues = [brixCaldo, brixEfeito1, brixEfeito2, brixEfeito3, brixEfeito4, brixEfeito5];
  
  const vazoesSaida: number[] = [];
  const evaporationRatesTons: number[] = [];
  let vazaoEntradaAtual = vazaoMassaCaldo;
  
  // 2. Balanço de massa para calcular taxas de evaporação em t/h
  for (let i = 0; i < 5; i++) {
    const brixIn = brixValues[i];
    const brixOut = brixValues[i+1];
    
    const vazaoSaida = vazaoEntradaAtual * (brixIn / brixOut);
    vazoesSaida.push(vazaoSaida);
    
    const rateInTons = vazaoEntradaAtual - vazaoSaida;
    evaporationRatesTons.push(rateInTons);
    
    vazaoEntradaAtual = vazaoSaida;
  }

  // 3. Cálculo do Consumo Total de Vapor no Primeiro Efeito
  const consumoVaporPrimeiroEfeito = vaporParaAquecimento + evaporationRatesTons[0];

  // Cálculo da taxa de evaporação em PERCENTAGEM, conforme solicitado
  const evaporationRatePercent: { name: string; rate: number }[] = [];
  for (let i = 0; i < 5; i++) {
      const brixIn = brixValues[i];
      const brixOut = brixValues[i+1];
      const rate = (1 - (brixIn / brixOut)) * 100;
      evaporationRatePercent.push({
          name: `Efeito ${i + 1}`,
          rate: parseFloat(rate.toFixed(1))
      });
  }


  const brixEvolution = [
    { name: 'Efeito 1', brix: brixEfeito1 },
    { name: 'Efeito 2', brix: brixEfeito2 },
    { name: 'Efeito 3', brix: brixEfeito3 },
    { name: 'Efeito 4', brix: brixEfeito4 },
    { name: 'Efeito 5', brix: brixEfeito5 },
  ].map(d => ({...d, brix: parseFloat(d.brix.toFixed(1))}));

  const effectEfficiency = [
    { name: 'Efeito 1', efficiency: 85 + Math.random() * 10 },
    { name: 'Efeito 2', efficiency: 88 + Math.random() * 10 },
    { name: 'Efeito 3', efficiency: 90 + Math.random() * 8 },
    { name: 'Efeito 4', efficiency: 92 + Math.random() * 5 },
    { name: 'Efeito 5', efficiency: 95 + Math.random() * 4 },
  ].map(d => ({...d, efficiency: parseFloat(d.efficiency.toFixed(1))}));
  
  const vaporGeneration = brixEvolution.map((item, index) => ({
      name: item.name,
      // O vapor gerado é a própria taxa de evaporação do efeito em toneladas
      generation: evaporationRatesTons[index]
  })).map(d => ({...d, generation: parseFloat(d.generation.toFixed(1))}));

  const areas = [areaEfeito1, areaEfeito2, areaEfeito3, areaEfeito4, areaEfeito5];
  const kgVaporPorM2 = vaporGeneration.map((item, index) => ({
      name: item.name,
      value: (item.generation * 1000) / areas[index],
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

  const effects = {
    effect1: { vazao: vazaoCaldo, brix: brixEvolution[0].brix, eficiencia: effectEfficiency[0].efficiency, taxa_evaporacao: evaporationRatesTons[0], area: areaEfeito1, kg_vapor_m2: kgVaporPorM2[0].value },
    effect2: { brix: brixEvolution[1].brix, eficiencia: effectEfficiency[1].efficiency, taxa_evaporacao: evaporationRatesTons[1], area: areaEfeito2, kg_vapor_m2: kgVaporPorM2[1].value },
    effect3: { brix: brixEvolution[2].brix, eficiencia: effectEfficiency[2].efficiency, taxa_evaporacao: evaporationRatesTons[2], area: areaEfeito3, kg_vapor_m2: kgVaporPorM2[2].value },
    effect4: { brix: brixEvolution[3].brix, eficiencia: effectEfficiency[3].efficiency, taxa_evaporacao: evaporationRatesTons[3], area: areaEfeito4, kg_vapor_m2: kgVaporPorM2[3].value },
    effect5: { brix: brixEvolution[4].brix, eficiencia: effectEfficiency[4].efficiency, taxa_evaporacao: evaporationRatesTons[4], area: areaEfeito5, kg_vapor_m2: kgVaporPorM2[4].value },
  };

  const overallSummary = `Processo com vazão de ${vazaoCaldo} m³/h e brix de ${brixCaldo}%. O consumo total de vapor no primeiro efeito é de ${consumoVaporPrimeiroEfeito.toFixed(2)} t/h, sendo ${vaporParaAquecimento.toFixed(2)} t/h para aquecimento do caldo e ${evaporationRatesTons[0].toFixed(2)} t/h para evaporação.`;

  const effectsSummary: EffectSummaryData[] = brixEvolution.map((effect, index) => {
    const brixIn = brixValues[index];
    const brixOut = brixValues[index + 1];
    
    // Calcula a taxa de evaporação em porcentagem
    const taxaEvaporacaoPercent = (1 - (brixIn / brixOut)) * 100;
    
    return {
        name: `Efeito ${index + 1}`,
        brixIn: parseFloat(brixIn.toFixed(2)),
        brixOut: parseFloat(brixOut.toFixed(2)),
        vazaoCaldo: parseFloat(vazaoCaldo.toFixed(2)), // This should be calculated per effect
        vaporGerado: parseFloat(vaporGeneration[index].generation.toFixed(2)),
        taxaEvaporacao: parseFloat(taxaEvaporacaoPercent.toFixed(2)), // Usa o valor em porcentagem
        eficiencia: parseFloat(effectEfficiency[index].efficiency.toFixed(2)),
    }
  });


  return {
    densidadeCaldo,
    consumoVaporTotal: consumoVaporPrimeiroEfeito, // Agora o nome antigo armazena o valor correto
    brixEvolution,
    effectEfficiency,
    evaporationRate: evaporationRatePercent, // Exportando a taxa em porcentagem para o gráfico
    vaporGeneration,
    kgVaporPorM2,
    caldoClarificado,
    desempenhoPrimeiroEfeito,
    effects,
    overallSummary,
    effectsSummary,
  };
}
