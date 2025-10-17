
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Gem, Star } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { useUser } from '@/firebase';
import { Button } from '@/components/ui/button';
import StripeBuyButton from '@/components/app/stripe-buy-button';


export default function PricingPage() {
    const { user } = useUser();
    const userEmail = user?.email || undefined;
    const userId = user?.uid || undefined;

    // Lendo as variáveis de ambiente no escopo do componente para garantir o acesso no lado do cliente
    const monthlyBuyButtonId = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_BUY_BUTTON_ID;
    const yearlyBuyButtonId = process.env.NEXT_PUBLIC_STRIPE_YEARLY_BUY_BUTTON_ID;
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;


    const features = [
        "Acesso a todos os Dashboards.",
        "Aba de Resumo Detalhado.",
        "Geração de Avaliações com IA.",
        "Chat interativo com IA sobre os dados.",
        "Suporte prioritário."
    ];
    
    return (
        <>
            {/* Carrega o script do Stripe Buy Button */}
            <Script async src="https://js.stripe.com/v3/buy-button.js"></Script>
            
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
                                    <p className="text-xs text-muted-foreground">Pagamento único. Cartão de Crédito ou Pix.</p>
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
                                {monthlyBuyButtonId && publishableKey ? (
                                    <StripeBuyButton 
                                        buy-button-id={monthlyBuyButtonId}
                                        publishable-key={publishableKey}
                                        client-reference-id={userId}
                                        customer-email={userEmail}
                                    />
                                ) : (
                                    <Button className="w-full" disabled>Indisponível</Button>
                                )}
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
                                    <p className="text-xs text-muted-foreground">Pagamento único. Cartão de Crédito ou Pix.</p>
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
                               {yearlyBuyButtonId && publishableKey ? (
                                    <StripeBuyButton
                                        buy-button-id={yearlyBuyButtonId}
                                        publishable-key={publishableKey}
                                        client-reference-id={userId}
                                        customer-email={userEmail}
                                    />
                                ) : (
                                    <Button className="w-full" disabled>Indisponível</Button>
                                )}
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}
