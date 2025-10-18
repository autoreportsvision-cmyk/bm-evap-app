
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/app/logo';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import UsersIcon from '@/components/icons/users-icon';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSigningUp) {
        if (!displayName) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'Por favor, insira seu nome.',
            });
            return;
        }
        if (password !== confirmPassword) {
            toast({
                variant: 'destructive',
                title: 'Erro',
                description: 'As senhas não coincidem. Por favor, verifique.',
            });
            return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update Firebase Auth profile
        await updateProfile(user, { displayName });
        
        // Create user document in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        await setDoc(userRef, {
          id: user.uid,
          email: user.email,
          displayName: displayName,
          role: 'basic',
          createdAt: serverTimestamp(),
        });

        toast({ title: 'Sucesso', description: 'Conta criada com sucesso! Você será redirecionado.' });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({ title: 'Sucesso', description: 'Login realizado com sucesso! Você será redirecionado.' });
      }
      router.push('/');
    } catch (error: any) {
      let description = 'Ocorreu um erro desconhecido. Tente novamente.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          description = 'Este e-mail já está em uso. Tente fazer login ou use um e-mail diferente.';
          break;
        case 'auth/invalid-credential':
        case 'auth/wrong-password': // Legacy
        case 'auth/user-not-found': // Legacy
          description = 'E-mail ou senha incorretos. Por favor, verifique suas credenciais.';
          break;
        case 'auth/weak-password':
          description = 'A senha é muito fraca. Ela deve ter no mínimo 6 caracteres.';
          break;
        case 'auth/invalid-email':
            description = 'O formato do e-mail é inválido.';
            break;
        default:
          description = error.message || 'Ocorreu um erro desconhecido. Tente novamente.';
          break;
      }
      
      toast({
        variant: 'destructive',
        title: 'Erro de Autenticação',
        description: description,
      });
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Por favor, insira seu e-mail.',
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      toast({
        title: 'E-mail enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
      setShowResetDialog(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar e-mail',
        description: error.message,
      });
    }
  };

  return (
    <>
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
               {isSigningUp && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome</Label>
                  <Input
                    id="displayName"
                    type="text"
                    placeholder="Seu nome"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              )}
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
              {isSigningUp && (
                <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Senha</Label>
                    <Input
                    id="confirm-password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                )}
              <Button type="submit" className="w-full">
                {isSigningUp ? 'Registrar' : 'Entrar'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              {isSigningUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              <button
                onClick={() => {
                    setIsSigningUp(!isSigningUp);
                    // Limpar campos de senha ao alternar
                    setPassword('');
                    setConfirmPassword('');
                }}
                className="ml-1 underline"
              >
                {isSigningUp ? 'Entrar' : 'Registrar'}
              </button>
            </div>
            <div className="mt-2 text-center text-sm">
              <button
                onClick={() => setShowResetDialog(true)}
                className="underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </CardContent>
          <Separator className='my-4' />
           <CardFooter className="flex-col gap-2 text-center">
             <p className="text-xs text-muted-foreground">Participe da nossa comunidade de profissionais da evaporação no WhatsApp!</p>
             <a href="https://chat.whatsapp.com/CkILL21UzWMGuCk5W0PLIg?mode=wwc" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                    <UsersIcon className="h-5 w-5" />
                    Entrar no Grupo
                </Button>
             </a>
          </CardFooter>
        </Card>
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redefinir Senha</AlertDialogTitle>
            <AlertDialogDescription>
              Insira seu endereço de e-mail abaixo. Se uma conta estiver associada a ele, enviaremos um link para redefinir sua senha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="seu-email@exemplo.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handlePasswordReset}>Enviar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
