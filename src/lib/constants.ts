
import type { EvaporationData } from './types';

// Using empty strings for number inputs that will be parsed
// to prevent "uncontrolled to controlled" React error.
export const INITIAL_FORM_DATA: EvaporationData = {
  vazaoCaldo: '' as any,
  brixCaldo: '' as any,
  temperaturaCaldo: '' as any,
  pressaoVapor: '' as any,
  brixEfeito1: '' as any,
  brixEfeito2: '' as any,
  brixEfeito3: '' as any,
  brixEfeito4: '' as any,
  brixEfeito5: '' as any,
  areaEfeito1: '' as any,
  areaEfeito2: '' as any,
  areaEfeito3: '' as any,
  areaEfeito4: '' as any,
  areaEfeito5: '' as any,
};
