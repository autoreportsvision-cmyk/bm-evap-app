'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Gem, Loader, Star } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getStripe } from '@/lib/stripe-client';
import { createCheckoutSession } from '../actions';
import Link from 'next/link';

export default function PricingPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'yearly' | null>(null);

    const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
        if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
            toast({
                variant: 'destructive',
                title: 'Erro de Configuração',
                description: 'A chave publicável do Stripe não está configurada. Verifique as variáveis de ambiente.',
            });
            return;
        }

        if (!user) {
            router.push('/login?redirect=/pricing');
            return;
        }

        const priceId = plan === 'monthly' 
            ? process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID 
            : process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID;

        if (!priceId) {
             toast({
                variant: 'destructive',
                title: 'Erro de Configuração',
                description: `O ID de preço para o plano ${plan === 'monthly' ? 'mensal' : 'anual'} não está configurado.`,
            });
            return;
        }

        setLoadingPlan(plan);
        
        const { success, sessionId, error } = await createCheckoutSession(user.uid, priceId, plan);

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
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Erro de Configuração',
                    description: 'Não foi possível carregar o Stripe. Tente novamente.',
                });
            }
        } else {
             toast({
                variant: 'destructive',
                title: 'Erro ao Assinar',
                description: error,
            });
        }
        setLoadingPlan(null);
    };

  const features = [
      "Acesso a todos os Dashboards.",
      "Aba de Resumo Detalhado.",
      "Geração de Avaliações com IA.",
      "Chat interativo com IA sobre os dados.",
      "Suporte prioritário."
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4">
            <Link href="/">
                <Button variant="outline">Voltar ao Painel</Button>
            </Link>
        </div>
      <div className="w-full max-w-4xl mx-auto">
        <div className='text-center mb-10'>
            <h1 className="text-4xl font-bold">Planos e Preços</h1>
            <p className="text-muted-foreground mt-2">Escolha o plano que melhor se adapta às suas necessidades.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Monthly Plan */}
            <Card>
                <CardHeader className="items-center text-center">
                    <Star className="h-12 w-12 text-yellow-400" />
                    <CardTitle className="text-3xl">Plano Mensal</CardTitle>
                    <CardDescription>Acesso completo por um mês.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2 text-center">
                        <p className="text-4xl font-bold">R$ 12,90</p>
                        <p className="text-xs text-muted-foreground">Pagamento único. Acesso por 30 dias.</p>
                    </div>
                    <ul className="space-y-3 text-sm">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe('monthly')} 
                        disabled={isUserLoading || loadingPlan === 'monthly'}>
                        {loadingPlan === 'monthly' ? <Loader className="animate-spin" /> : 'Comprar Acesso Mensal'}
                    </Button>
                </CardFooter>
            </Card>

            {/* Yearly Plan */}
            <Card className="border-primary">
                 <CardHeader className="items-center text-center">
                    <Gem className="h-12 w-12 text-yellow-500" />
                    <CardTitle className="text-3xl">Plano Anual</CardTitle>
                    <CardDescription>O melhor custo-benefício para análise contínua.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2 text-center">
                        <p className="text-4xl font-bold">R$ 39,90</p>
                        <p className="text-xs text-muted-foreground">Pagamento único. Acesso por 1 ano.</p>
                    </div>
                    <ul className="space-y-3 text-sm">
                        {features.map((feature, index) => (
                             <li key={index} className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-500" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        onClick={() => handleSubscribe('yearly')} 
                        disabled={isUserLoading || loadingPlan === 'yearly'}>
                        {loadingPlan === 'yearly' ? <Loader className="animate-spin" /> : 'Comprar Acesso Anual'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
