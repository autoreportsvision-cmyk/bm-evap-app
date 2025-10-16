'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, LayoutDashboard, Bot, FileSignature } from 'lucide-react';
import FormTab from './form-tab';
import DashboardTab from './dashboard-tab';
import SummaryTab from './summary-tab';
import EvaluationsTab from './evaluations-tab';

export default function MainTabs() {
  const [activeTab, setActiveTab] = useState('form');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="form">
          <FileSignature className="mr-2 h-4 w-4" />
          Formulário
        </TabsTrigger>
        <TabsTrigger value="dashboard">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="summary">
          <FileText className="mr-2 h-4 w-4" />
          Resumo
        </TabsTrigger>
        <TabsTrigger value="evaluations">
          <Bot className="mr-2 h-4 w-4" />
          Avaliações (IA)
        </TabsTrigger>
      </TabsList>
      <TabsContent value="form">
        <FormTab onCalculate={() => setActiveTab('dashboard')} />
      </TabsContent>
      <TabsContent value="dashboard">
        <DashboardTab />
      </TabsContent>
      <TabsContent value="summary">
        <SummaryTab />
      </TabsContent>
      <TabsContent value="evaluations">
        <EvaluationsTab />
      </TabsContent>
    </Tabs>
  );
}
