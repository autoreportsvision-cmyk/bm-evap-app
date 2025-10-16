'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AppHeader from '@/components/app/header';
import MainTabs from '@/components/app/main-tabs';
import { AppProvider } from '@/context/app-context';
import { Loader } from 'lucide-react';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <AppProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <MainTabs />
        </main>
      </div>
    </AppProvider>
  );
}
