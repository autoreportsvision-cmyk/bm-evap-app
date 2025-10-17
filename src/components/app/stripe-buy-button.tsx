
'use client';

import React from 'react';

// Define a interface para as props do nosso componente,
// que corresponderão aos atributos do custom element <stripe-buy-button>.
interface StripeBuyButtonProps {
  'buy-button-id': string;
  'publishable-key': string;
  'client-reference-id'?: string;
  'customer-email'?: string;
}

// Declaração de tipo para informar ao TypeScript sobre o custom element do Stripe.
// Isso evita erros de tipo ao usar <stripe-buy-button> no JSX.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'stripe-buy-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & StripeBuyButtonProps, HTMLElement>;
    }
  }
}

/**
 * Componente React wrapper para o Web Component <stripe-buy-button>.
 * Ele pega as props e as passa como atributos para o custom element.
 * Os atributos com hífens são perfeitamente válidos em JSX.
 */
const StripeBuyButton: React.FC<StripeBuyButtonProps> = (props) => {
  // A verificação de `client-reference-id` e `customer-email` é importante.
  // Se o usuário não estiver logado, esses valores serão undefined e não devem ser passados.
  const conditionalProps: Partial<StripeBuyButtonProps> = {};
  if (props['client-reference-id']) {
    conditionalProps['client-reference-id'] = props['client-reference-id'];
  }
  if (props['customer-email']) {
    conditionalProps['customer-email'] = props['customer-email'];
  }

  return (
    <stripe-buy-button
      buy-button-id={props['buy-button-id']}
      publishable-key={props['publishable-key']}
      {...conditionalProps}
      // Adicionando um estilo simples para garantir que o botão ocupe o espaço.
      style={{ width: '100%' }}
    />
  );
};

export default StripeBuyButton;
