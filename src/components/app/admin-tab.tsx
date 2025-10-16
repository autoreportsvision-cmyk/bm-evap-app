
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useUser } from '@/firebase';
import {
  collection,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader, Search, User as UserIcon } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '../ui/separator';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useMemoFirebase } from '@/firebase/provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export default function AdminTab() {
  const firestore = useFirestore();
  const { user: adminUser } = useUser();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const usersCollectionRef = useMemoFirebase(() => {
    return collection(firestore, 'users');
  }, [firestore]);

  const { data: users, isLoading, error } = useCollection<UserProfile>(usersCollectionRef);

  const handleRoleChange = async (userId: string, newRole: 'basic' | 'premium' | 'admin') => {
    if (userId === adminUser?.uid) {
      toast({
        variant: 'destructive',
        title: 'Ação não permitida',
        description: 'Você não pode alterar sua própria permissão.',
      });
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', userId);
      await updateDoc(userDocRef, { role: newRole });

      toast({
        title: 'Sucesso!',
        description: `A permissão do usuário foi alterada para ${newRole}.`,
      });
    } catch (error) {
      console.error('Erro ao alterar permissão:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível alterar a permissão do usuário.',
      });
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Busque um usuário pelo nome ou e-mail para gerenciar suas permissões.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
                id="search"
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
            />
        </div>

        <Separator />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
            <div className="text-center text-destructive py-8">
                <p>Erro ao carregar usuários.</p>
                <p className="text-xs text-muted-foreground">{error.message}</p>
                 <p className="text-xs text-muted-foreground mt-2">Verifique se você tem permissão de administrador e se as regras do Firestore estão configuradas corretamente para permitir a listagem de usuários.</p>
            </div>
        ) : filteredUsers.length > 0 ? (
          <div className="border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Permissão</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredUsers.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className='flex items-center gap-3'>
                                    <UserIcon className="w-8 h-8 text-muted-foreground"/>
                                    <div>
                                        <p className="font-semibold">{user.displayName || 'Nome não definido'}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                <Select
                                  value={user.role}
                                  onValueChange={(value) => handleRoleChange(user.id, value as 'basic' | 'premium' | 'admin')}
                                  disabled={user.id === adminUser?.uid || user.role === 'admin'}
                                >
                                  <SelectTrigger id={`role-select-${user.id}`} className="w-[180px]">
                                    <SelectValue placeholder="Selecione a permissão" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="basic">Básico</SelectItem>
                                    <SelectItem value="premium">Premium</SelectItem>
                                    <SelectItem value="admin" disabled>Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                 {(user.id === adminUser?.uid || user.role === 'admin') && (
                                    <p className="text-sm text-muted-foreground">(Não pode ser alterado)</p>
                                )}
                              </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            Nenhum usuário encontrado.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
