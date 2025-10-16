
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Gem, Loader } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getStripe } from '@/lib/stripe-client';
import { createCheckoutSession } from '../actions';
import Logo from '@/components/app/logo';
import Link from 'next/link';

export default function PricingPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }

        setLoading(true);
        
        const { success, sessionId, error } = await createCheckoutSession(user.uid);

        if (success && sessionId) {
            const stripe = await getStripe();
            if (stripe) {
                const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
                if (stripeError) {
                    toast({
                        variant: 'destructive',
                        title: 'Erro de Redirecionamento',
                        description: stripeError.message,
                    });
                     setLoading(false);
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Erro de Configuração',
                    description: 'Não foi possível carregar o Stripe. Tente novamente.',
                });
                setLoading(false);
            }
        } else {
             toast({
                variant: 'destructive',
                title: 'Erro ao Assinar',
                description: error,
            });
            setLoading(false);
        }

    };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4">
            <Link href="/">
                <Button variant="outline">Voltar ao Painel</Button>
            </Link>
        </div>
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
            <Gem className="h-12 w-12 text-yellow-500" />
            <CardTitle className="text-3xl">Plano Premium</CardTitle>
            <CardDescription>Desbloqueie todo o potencial da sua análise de processos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
                <p className="text-4xl font-bold">R$ 49,90<span className="text-lg font-normal text-muted-foreground">/mês</span></p>
                <p className="text-xs text-muted-foreground">Cancele a qualquer momento.</p>
            </div>
            <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Acesso a todos os Dashboards.</span>
                </li>
                 <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Aba de Resumo Detalhado.</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Geração de Avaliações com IA.</span>
                </li>
                <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Chat interativo com IA sobre os dados.</span>
                </li>
                 <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Suporte prioritário.</span>
                </li>
            </ul>
        </CardContent>
        <CardFooter>
            <Button className="w-full" onClick={handleSubscribe} disabled={isUserLoading || loading}>
                {loading ? <Loader className="animate-spin" /> : 'Assinar Agora'}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
