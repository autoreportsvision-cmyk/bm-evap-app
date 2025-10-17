
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, LayoutDashboard, Bot, FileSignature, Shield, Lock } from 'lucide-react';
import FormTab from './form-tab';
import DashboardTab from './dashboard-tab';
import SummaryTab from './summary-tab';
import EvaluationsTab from './evaluations-tab';
import { useUser } from '@/firebase';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useMemoFirebase } from '@/firebase/provider';
import { useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import AdminTab from './admin-tab';


export default function MainTabs() {
  const [activeTab, setActiveTab] = useState('form');
  const { user } = useUser();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isAdmin = userProfile?.role === 'admin';
  
  const isPremium = useMemoFirebase(() => {
    if (!userProfile) return false;
    if (userProfile.role === 'admin') return true;

    if (userProfile.role === 'premium') {
      // Se não houver data de expiração, o acesso é permanente (concedido manualmente).
      if (!userProfile.accessExpiration) {
        return true;
      }
      
      // Se houver data de expiração, verifique se ainda não expirou.
      const expirationDate = (userProfile.accessExpiration as any).seconds
        ? new Date((userProfile.accessExpiration as any).seconds * 1000)
        : userProfile.accessExpiration instanceof Date
        ? userProfile.accessExpiration
        : null;
      
      if (expirationDate) {
        return expirationDate > new Date();
      }
    }
    
    return false;
  }, [userProfile]);


  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
        <TabsTrigger value="form">
          <FileSignature className="mr-2 h-4 w-4" />
          Formulário
        </TabsTrigger>
        <TabsTrigger value="dashboard">
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </TabsTrigger>
        <TabsTrigger value="summary" disabled={!isPremium}>
          {!isPremium && <Lock className="mr-2 h-4 w-4" />}
          {isPremium && <FileText className="mr-2 h-4 w-4" />}
          Resumo
        </TabsTrigger>
        <TabsTrigger value="evaluations" disabled={!isPremium}>
          {!isPremium && <Lock className="mr-2 h-4 w-4" />}
          {isPremium && <Bot className="mr-2 h-4 w-4" />}
          Avaliações (IA)
        </TabsTrigger>
        {isAdmin && (
          <TabsTrigger value="admin">
            <Shield className="mr-2 h-4 w-4" />
            Admin
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="form">
        <FormTab onCalculate={() => setActiveTab('dashboard')} />
      </TabsContent>
      <TabsContent value="dashboard">
        <DashboardTab />
      </TabsContent>
        {isPremium && (
            <>
                <TabsContent value="summary">
                    <SummaryTab />
                </TabsContent>
                <TabsContent value="evaluations">
                    <EvaluationsTab />
                </TabsContent>
            </>
        )}
      {isAdmin && (
        <TabsContent value="admin">
          <AdminTab />
        </TabsContent>
      )}
    </Tabs>
  );
}
