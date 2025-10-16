'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { EvaporationData, CalculatedData, AIEvaluations } from '@/lib/types';
import { INITIAL_FORM_DATA } from '@/lib/constants';

interface AppContextType {
  formData: EvaporationData;
  setFormData: (data: EvaporationData) => void;
  calculatedData: CalculatedData | null;
  setCalculatedData: (data: CalculatedData | null) => void;
  aiEvaluations: AIEvaluations | null;
  setAiEvaluations: (evaluations: AIEvaluations | null) => void;
  isCalculated: boolean;
  setIsCalculated: (isCalculated: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<EvaporationData>(INITIAL_FORM_DATA);
  const [calculatedData, setCalculatedData] = useState<CalculatedData | null>(null);
  const [aiEvaluations, setAiEvaluations] = useState<AIEvaluations | null>(null);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);

  const value = {
    formData,
    setFormData,
    calculatedData,
    setCalculatedData,
    aiEvaluations,
    setAiEvaluations,
    isCalculated,
    setIsCalculated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
