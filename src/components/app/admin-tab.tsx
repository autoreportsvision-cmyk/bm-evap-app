
'use client';

import { useFirestore } from '@/firebase';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setDoc, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminTab() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const usersCollectionRef = useMemoFirebase(() => {
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading } = useCollection<UserProfile>(usersCollectionRef);

  const handleRoleChange = async (userId: string, role: 'admin' | 'basic') => {
    const userRef = doc(firestore, 'users', userId);
    try {
      await setDoc(userRef, { role }, { merge: true });
      toast({
        title: 'Sucesso',
        description: 'A função do usuário foi atualizada.',
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar a função do usuário.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>Visualize e gerencie as permissões dos usuários da plataforma.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Permissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={3} className="text-center">Carregando usuários...</TableCell>
              </TableRow>
            )}
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'basic')}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Definir permissão" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
