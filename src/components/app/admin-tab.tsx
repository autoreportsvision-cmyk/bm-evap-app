
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Loader, Search, MoreHorizontal, ShieldCheck, UserCog, Crown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user: currentUser } = useUser();

  const fetchUsers = async (q: any) => {
    setIsLoading(true);
    setSearchResults([]);
    try {
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() } as UserProfile);
      });
      setSearchResults(users);
      if (users.length === 0) {
        toast({
          title: 'Nenhum resultado',
          description: 'Nenhum usuário encontrado com os critérios fornecidos.',
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
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'));
    fetchUsers(q);
  };
  
  const handleListPremium = async () => {
    setSearchQuery('');
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('role', '==', 'premium'));
    fetchUsers(q);
  };


  const handleRoleChange = async (userId: string, newRole: 'basic' | 'premium') => {
    try {
      const userRef = doc(firestore, 'users', userId);
      
      const updateData: { role: 'basic' | 'premium', accessExpiration?: Date, planType?: 'manual' | 'basic' } = { role: newRole };
      
      if (newRole === 'premium') {
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 10); // Concede acesso por 10 anos
        updateData.accessExpiration = expirationDate;
        updateData.planType = 'manual';
      } else {
        // Ao rebaixar para 'basic', remove a expiração e o tipo de plano
        updateData.accessExpiration = undefined;
        updateData.planType = undefined;
      }
      
      await updateDoc(userRef, updateData);

      setSearchResults(prevResults =>
        prevResults.map(user =>
          user.id === userId ? { ...user, role: newRole, accessExpiration: updateData.accessExpiration, planType: updateData.planType } : user
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
        description: 'Você não tem permissão para realizar esta ação.',
      });
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    
    let d: Date;
    if (date.seconds) { // Firebase Timestamp
      d = new Date(date.seconds * 1000);
    } else if (date instanceof Date) {
      d = date;
    } else {
      return 'Data inválida';
    }

    try {
      return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  }

  const getPlanLabel = (planType?: 'monthly' | 'yearly' | 'manual') => {
    switch(planType) {
        case 'monthly': return 'Mensal';
        case 'yearly': return 'Anual';
        case 'manual': return 'Manual';
        default: return 'N/D';
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Usuários</CardTitle>
        <CardDescription>
          Busque usuários pelo nome, liste todos os compradores com acesso Premium ou altere permissões.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2 flex-grow">
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
            <Button onClick={handleListPremium} disabled={isLoading} variant="outline">
                {isLoading ? <Loader className="animate-spin" /> : <Crown />}
                <span>Buscar Compradores (Premium)</span>
            </Button>
        </div>

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
                <TableHead className="text-center">Permissão</TableHead>
                <TableHead className="text-center">Plano</TableHead>
                <TableHead className="text-center">Acesso Expira em</TableHead>
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
                  <TableCell className="text-center text-xs font-medium">
                    {getPlanLabel(user.planType)}
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    {formatDate(user.accessExpiration)}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role === 'admin' ? (
                      <div className="flex items-center justify-end gap-2 text-muted-foreground">
                        <ShieldCheck className="h-4 w-4" />
                        <span>Admin</span>
                      </div>
                    ) : (
                      currentUser?.uid !== user.id && (
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
                     {user.id === currentUser?.uid && (
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
