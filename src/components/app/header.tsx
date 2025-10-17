
'use client';

import Logo from '@/components/app/logo';
import { Button } from '@/components/ui/button';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { LogOut, Gem } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemoFirebase } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { UserProfile } from '@/lib/types';


export default function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);

  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isPremium = useMemoFirebase(() => {
    if (!userProfile) return false;
    if (userProfile.role === 'admin') return true;

    if (userProfile.role === 'premium') {
      if (!userProfile.accessExpiration) {
        return true;
      }
      
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

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const handleGoToPricing = () => {
    router.push('/pricing');
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Logo />
        <h1 className="text-lg font-semibold tracking-wider font-headline">
          BM_EVAPORAÇÃO
        </h1>
      </div>
      {user && (
         <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            Olá {user.displayName}, seja bem vindo ao novo conceito de aprendizagem.
          </span>
          {userProfile?.role === 'basic' && !isPremium && (
            <Button variant="outline" size="sm" onClick={handleGoToPricing}>
                <Gem className="mr-2 h-4 w-4 text-yellow-500" />
                Seja Premium
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      )}
    </header>
  );
}
