import Logo from '@/components/app/logo';

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Logo />
        <h1 className="text-lg font-semibold tracking-wider font-headline">
          BM_EVAPORAÇÃO
        </h1>
      </div>
    </header>
  );
}
