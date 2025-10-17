# Blueprint: Sistema de Pagamentos com Stripe e Webhooks

Este documento descreve a arquitetura e os arquivos necessários para implementar um sistema de pagamentos usando o Stripe (com Buy Buttons) para gerenciar assinaturas e permissões de usuários no Firebase.

## Funcionalidades

-   Exibe uma página de preços com diferentes planos (ex: Mensal, Anual).
-   Utiliza o `StripeBuyButton` para redirecionar o usuário a uma página de checkout hospedada pelo Stripe.
-   Passa o ID e o email do usuário para o Stripe, associando a compra ao usuário correto.
-   Utiliza um Webhook para receber a confirmação de pagamento do Stripe.
-   Atualiza a permissão (`role`) e a data de expiração (`accessExpiration`) do usuário no Firestore após um pagamento bem-sucedido.

## Arquivos e Lógica Essenciais

### 1. Página de Preços (Frontend) - `src/app/pricing/page.tsx`

Este arquivo renderiza a interface da página de preços e os botões de compra.

-   **Busca de Dados do Usuário:** Usa o hook `useUser()` para obter o ID (`userId`) e o email (`userEmail`) do usuário logado.
-   **Leitura das Variáveis de Ambiente:** Carrega as chaves públicas do Stripe e os IDs dos "Buy Buttons" do arquivo `.env` (ex: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
-   **Renderização do Botão:** Utiliza o componente `StripeBuyButton` para renderizar o botão de pagamento, passando as propriedades `buy-button-id`, `publishable-key`, `client-reference-id={userId}`, and `customer-email={userEmail}`.

### 2. Componente Wrapper do Botão - `src/components/app/stripe-buy-button.tsx`

Um componente React simples que envolve o web component `<stripe-buy-button>` do Stripe. Isso é necessário para que ele funcione corretamente em um ambiente React/Next.js.

### 3. Endpoint do Webhook (Backend) - `src/app/api/stripe/webhook/route.ts`

Este é o arquivo mais crítico do backend. É uma "Route Handler" do Next.js que funciona como um endpoint de API.

-   **Recebimento do Evento:** A função `POST` recebe o evento do Stripe.
-   **Verificação de Assinatura:** Utiliza `stripe.webhooks.constructEvent` com o `STRIPE_WEBHOOK_SECRET` para garantir que o evento é legítimo e veio do Stripe.
-   **Processamento do Evento:**
    -   Escuta especificamente pelo evento `checkout.session.completed`.
    -   Quando o `payment_status` é `paid`, a função `grantAccessAfterCheckout` é chamada.
-   **Lógica de `grantAccessAfterCheckout`:**
    -   Extrai o `client_reference_id` (que é o nosso `userId`) da sessão do Stripe.
    -   Usa o SDK do **Firebase Admin** (`getFirestoreAdmin`) para se conectar ao Firestore com privilégios de administrador.
    -   Busca o documento do usuário pelo ID.
    -   Determina qual plano foi comprado comparando o `payment_link_id` do evento com os IDs dos links de pagamento salvos no `.env`.
    -   Atualiza o documento do usuário no Firestore, alterando o `role` para `premium` e definindo a `accessExpiration` (data de expiração do acesso).

### 4. Configuração do Firebase Admin - `src/firebase/admin.ts`

Inicializa o SDK do Firebase Admin, que é necessário para que o backend (nosso webhook) possa modificar dados no Firestore sem as restrições das regras de segurança do cliente.

### 5. Configuração das Variáveis de Ambiente - `.env`

Centraliza todas as chaves e IDs necessários para os ambientes de teste e produção. É crucial para a segurança e flexibilidade do sistema.

```env
# Chaves Públicas (acessíveis no frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_STRIPE_MONTHLY_BUY_BUTTON_ID=buy_btn_...
NEXT_PUBLIC_STRIPE_YEARLY_BUY_BUTTON_ID=buy_btn_...

# Chaves Secretas (apenas para o backend)
STRIPE_API_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PAYMENT_LINK_ID=pl_...
STRIPE_YEARLY_PAYMENT_LINK_ID=pl_...
```

## Para Reutilizar

1.  Copie os arquivos mencionados acima para o seu novo projeto.
2.  Instale as dependências necessárias: `stripe`, `firebase`, `firebase-admin`.
3.  Configure uma nova conta no Stripe, crie seus produtos e obtenha suas chaves de API e IDs de "Buy Button".
4.  Preencha o arquivo `.env` com suas novas chaves.
5.  Configure o endpoint de webhook no painel do Stripe para apontar para `[sua-url]/api/stripe/webhook`.
6.  Adapte a lógica de verificação de permissão no seu frontend (ex: `main-tabs.tsx`) para verificar o `role` e a `accessExpiration` do usuário.
