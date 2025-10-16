'use client';

import Logo from '@/components/app/logo';
import { Button } from '@/components/ui/button';
import { useAuth, useUser } from '@/firebase';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AppHeader() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/login');
  };

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
          <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      )}
    </header>
  );
}
