
'use server';

import { generateEffectEvaluations } from '@/ai/flows/generate-effect-evaluations';
import type { GenerateEffectEvaluationsInput, GenerateEffectEvaluationsOutput } from '@/ai/flows/generate-effect-evaluations';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-flow';
import { redirect } from 'next/navigation';
import { authAdmin } from '@/firebase/admin';
import { headers } from 'next/headers';

export async function getAiEvaluations(input: GenerateEffectEvaluationsInput): Promise<{ success: boolean; data?: GenerateEffectEvaluationsOutput; error?: string }> {
  try {
    const evaluations = await generateEffectEvaluations(input);
    return { success: true, data: evaluations };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Falha ao gerar avaliações de IA.' };
  }
}

export async function getChatResponse(input: ChatInput): Promise<{ success: boolean; data?: string; error?: string; }> {
    try {
        const response = await chat(input);
        return { success: true, data: response };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Falha ao obter resposta do chat.' };
    }
}

export async function createStripeRedirect(plan: 'monthly' | 'yearly'): Promise<void> {
  const sessionCookie = headers().get('cookie')?.split('; ').find(c => c.startsWith('__session='));
  if (!sessionCookie) {
    return redirect('/login?redirect=/pricing');
  }
  const session = sessionCookie.split('=')[1];

  let decodedToken;
  try {
      decodedToken = await authAdmin.verifySessionCookie(session, true);
  } catch (error) {
      console.error("Error verifying session cookie:", error);
      return redirect('/login?redirect=/pricing');
  }

  const userId = decodedToken.uid;
  if (!userId) {
      console.error("Could not get user from session.");
      // Redirecting to login is safer here as well.
      return redirect('/login?redirect=/pricing');
  }

  // Use STRIPE_... instead of NEXT_PUBLIC_... because this now runs only on the server.
  const monthlyLink = process.env.STRIPE_MONTHLY_PAYMENT_LINK;
  const yearlyLink = process.env.STRIPE_YEARLY_PAYMENT_LINK;

  const paymentLink = plan === 'monthly' ? monthlyLink : yearlyLink;

  if (!paymentLink) {
    // This will be caught by the global error handler if it happens.
    throw new Error(`Stripe payment link for "${plan}" plan is not configured in environment variables.`);
  }

  const urlWithUser = new URL(paymentLink);
  urlWithUser.searchParams.append('client_reference_id', userId);

  // The redirect call must happen outside of a try/catch block.
  redirect(urlWithUser.toString());
}
