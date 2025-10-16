'use client';

import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AdminTab() {
  const { toast } = useToast();

  // TODO: Re-implement user listing using a secure method, such as a Cloud Function,
  // because Firestore security rules do not allow listing documents based on a check
  // in another document (e.g., checking for an admin role).

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Visualize e gerencie as permissões dos usuários da plataforma.
          <br />
          <strong className='mt-2 block'>Nota: A listagem de usuários está temporariamente desativada para corrigir um problema de permissão. Uma solução mais segura será implementada.</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
            A funcionalidade de gerenciamento de usuários será reativada em breve.
        </div>
      </CardContent>
    </Card>
  );
}
