
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import {
  collection,
  doc,
  updateDoc,
  query,
  where,
  getDocs,
  limit,
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

export default function AdminTab() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [foundUser, setFoundUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        variant: 'destructive',
        title: 'Busca inválida',
        description: 'Por favor, insira o nome do usuário a ser buscado.',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setFoundUser(null);

    try {
      const usersRef = collection(firestore, 'users');
      // Case-sensitive search for simplicity. For case-insensitive, more complex setup is needed.
      const q = query(
        usersRef,
        where('displayName', '==', searchQuery.trim()),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setFoundUser(null);
      } else {
        const userDoc = querySnapshot.docs[0];
        setFoundUser({ ...userDoc.data(), id: userDoc.id } as UserProfile);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Busca',
        description: 'Não foi possível buscar o usuário. Verifique as regras de segurança do Firestore.',
      });
      setFoundUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (newRole: 'basic' | 'premium') => {
    if (!foundUser || foundUser.role === 'admin') {
      toast({
        variant: 'destructive',
        title: 'Ação não permitida',
        description: 'A permissão de administradores não pode ser alterada.',
      });
      return;
    }

    try {
      const userDocRef = doc(firestore, 'users', foundUser.id);
      await updateDoc(userDocRef, { role: newRole });
      
      // Update local state to reflect the change
      setFoundUser(prev => prev ? { ...prev, role: newRole } : null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Busque um usuário pelo nome para gerenciar suas permissões.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            id="search"
            type="text"
            placeholder="Digite o nome do usuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              <Search />
            )}
            <span>Buscar</span>
          </Button>
        </form>

        <Separator />

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin" />
          </div>
        ) : foundUser ? (
          <div className="p-4 border rounded-lg space-y-4">
            <div className='flex items-center gap-3'>
                 <UserIcon className="w-8 h-8 text-muted-foreground"/>
                 <div>
                    <p className="font-semibold">{foundUser.displayName}</p>
                    <p className="text-sm text-muted-foreground">{foundUser.email}</p>
                 </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-select">Permissão do Usuário</Label>
              <div className="flex items-center gap-2">
                <Select
                  value={foundUser.role}
                  onValueChange={(value) => handleRoleChange(value as 'basic' | 'premium')}
                  disabled={foundUser.role === 'admin'}
                >
                  <SelectTrigger id="role-select" className="w-[180px]">
                    <SelectValue placeholder="Selecione a permissão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                 {foundUser.role === 'admin' && (
                    <p className="text-sm text-muted-foreground">(Permissão de Admin não pode ser alterada)</p>
                )}
              </div>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="text-center text-muted-foreground py-8">
            Nenhum usuário encontrado com este nome. Verifique o nome e tente novamente.
          </div>
        ) : (
             <div className="text-center text-muted-foreground py-8">
                Insira o nome de um usuário para começar.
            </div>
        )}
      </CardContent>
    </Card>
  );
}
