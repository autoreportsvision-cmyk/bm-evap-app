'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader, Search, MoreHorizontal, ShieldCheck, UserCog } from 'lucide-react';

export default function AdminTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({
        variant: 'destructive',
        title: 'Busca inválida',
        description: 'Por favor, insira um nome para buscar.',
      });
      return;
    }
    setIsLoading(true);
    setSearchResults([]);
    try {
      const usersRef = collection(firestore, 'users');
      // Firestore does not support case-insensitive queries directly on the server.
      // A common workaround is to store a searchable, lowercased version of the name.
      // For a better UX, one might query >= searchQuery and < searchQuery + '\uf8ff' to get prefix matches.
      const q = query(usersRef, where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'));
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as UserProfile);
      });
      setSearchResults(users);
      if (users.length === 0) {
        toast({
          title: 'Nenhum resultado',
          description: 'Nenhum usuário encontrado com esse nome.',
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        variant: 'destructive',
        title: 'Erro na Busca',
        description: 'Ocorreu um erro ao buscar usuários. Verifique as permissões do Firestore.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'basic' | 'premium') => {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      toast({
        title: 'Sucesso!',
        description: `A permissão do usuário foi alterada para ${newRole}.`,
      });
    } catch (error: any) {
      console.error('Erro ao alterar permissão:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar permissão',
        description: error.message,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Busque por um usuário pelo nome e altere sua permissão entre Básico e Premium.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Label htmlFor="search" className="sr-only">
            Buscar Usuário
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Digite o nome do usuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader className="animate-spin" /> : <Search />}
            <span>Buscar</span>
          </Button>
        </form>

        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader className="animate-spin" />
          </div>
        )}

        {!isLoading && searchResults.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Permissão Atual</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {searchResults.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-center">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-500 text-white' : user.role === 'premium' ? 'bg-yellow-500 text-black' : 'bg-gray-500 text-white'}`}>
                        {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role === 'admin' ? (
                      <div className="flex items-center justify-end gap-2 text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    ) : (
                      user.id !== currentUser?.uid && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'basic')}>
                              Tornar Básico
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'premium')}>
                              Tornar Premium
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )
                    )}
                     {user.id === currentUser?.uid && user.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-2 text-muted-foreground">
                            <UserCog className="h-4 w-4" />
                            <span>Você</span>
                        </div>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
