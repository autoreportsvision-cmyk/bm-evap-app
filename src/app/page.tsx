import AppHeader from '@/components/app/header';
import MainTabs from '@/components/app/main-tabs';
import { AppProvider } from '@/context/app-context';

export default function Home() {
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
