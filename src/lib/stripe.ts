
import Stripe from 'stripe';

const stripeApiKey = process.env.STRIPE_API_KEY;

if (!stripeApiKey) {
  // Isso garante que o servidor falhe de forma explícita durante a inicialização
  // se a chave da API não estiver definida, em vez de causar um erro silencioso
  // que resulta em uma página em branco.
  throw new Error("FATAL: A variável de ambiente STRIPE_API_KEY não está definida. O servidor não pode iniciar.");
}

export const stripe = new Stripe(stripeApiKey, {
  apiVersion: '2024-06-20',
  typescript: true,
});
