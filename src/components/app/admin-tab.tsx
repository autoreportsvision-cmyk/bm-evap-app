
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

export default function AdminTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Gerencie as permissões dos usuários do aplicativo.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center h-48 text-center bg-muted/50 rounded-lg p-6">
            <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-muted-foreground">Funcionalidade em Manutenção</h3>
            <p className="text-muted-foreground mt-2">
                A funcionalidade de gerenciamento de usuários está temporariamente indisponível para garantir a segurança e a estabilidade do sistema.
            </p>
        </div>
      </CardContent>
    </Card>
  );
}
