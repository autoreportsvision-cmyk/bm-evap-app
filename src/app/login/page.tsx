'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/app/logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSigningUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({ title: 'Sucesso', description: 'Conta criada com sucesso! Você será redirecionado.' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Sucesso', description: 'Login realizado com sucesso! Você será redirecionado.' });
      }
      router.push('/');
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erro de autenticação',
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
            <Logo />
            <CardTitle className="text-2xl">BM_EVAPORAÇÃO</CardTitle>
            <CardDescription>
                {isSigningUp ? 'Crie sua conta para continuar' : 'Entre na sua conta para continuar'}
            </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              {isSigningUp ? 'Registrar' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSigningUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
            <button
              onClick={() => setIsSigningUp(!isSigningUp)}
              className="ml-1 underline"
            >
              {isSigningUp ? 'Entrar' : 'Registrar'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
