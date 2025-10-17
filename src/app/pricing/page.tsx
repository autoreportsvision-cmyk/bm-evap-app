
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Gem, Star, Loader } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createStripeRedirect } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

export default function PricingPage() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();
    const [isRedirecting, setIsRedirecting] = useState<string | null>(null);
    const { toast } = useToast();

    const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
        setIsRedirecting(plan);

        if (!user && !isUserLoading) {
            router.push('/login?redirect=/pricing');
            return;
        }

        if (user) {
            try {
                // This server action will handle the redirect.
                // It will throw an error if something goes wrong on the server,
                // which we can catch here.
                await createStripeRedirect(plan);
            } catch (error: any) {
                console.error("Stripe Redirect Error:", error);
                toast({
                    variant: 'destructive',
                    title: 'Erro no Pagamento',
                    description: error.message || 'Não foi possível redirecionar para o pagamento. Verifique a configuração.',
                });
                setIsRedirecting(null);
            }
        }
        // No need for an else, the function will just wait for the user to be loaded
        // and the user can click again.
    };

    const features = [
        "Acesso a todos os Dashboards.",
        "Aba de Resumo Detalhado.",
        "Geração de Avaliações com IA.",
        "Chat interativo com IA sobre os dados.",
        "Suporte prioritário."
    ];
    
    const isLoading = isUserLoading || !!isRedirecting;

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
                                disabled={isLoading}>
                                {isRedirecting === 'monthly' ? <Loader className="animate-spin" /> : 'Comprar Acesso Mensal'}
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
                                disabled={isLoading}>
                                 {isRedirecting === 'yearly' ? <Loader className="animate-spin" /> : 'Comprar Acesso Anual'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
