# Descrição: Tela de Login e Cadastro (`login/page.tsx`)

Este documento detalha a estrutura e o funcionamento do componente `LoginPage`, construído com Next.js, React, ShadCN UI e Firebase Authentication.

## Funcionalidades

1.  **Modo Duplo:** Alterna entre "Entrar" (Login) e "Registrar" (Sign Up) em uma única interface, controlado pelo estado `isSigningUp`.
2.  **Autenticação com E-mail/Senha:**
    *   **Cadastro:** Utiliza `createUserWithEmailAndPassword` do Firebase. Valida se o nome foi preenchido e se as senhas coincidem. Após o sucesso, atualiza o perfil do usuário com `updateProfile` (para adicionar o `displayName`) e cria um documento correspondente na coleção `users` do Firestore com um `role` padrão ('basic').
    *   **Login:** Utiliza `signInWithEmailAndPassword` do Firebase.
3.  **Feedback ao Usuário:** Emprega `useToast` (do ShadCN) para exibir notificações de sucesso e, mais importante, mensagens de erro claras e específicas para diferentes cenários (ex: e-mail já em uso, senha fraca, credenciais inválidas).
4.  **Redefinição de Senha:** Inclui um fluxo completo para recuperação de senha. Um `AlertDialog` é aberto para o usuário inserir seu e-mail, e a função `sendPasswordResetEmail` do Firebase é chamada.
5.  **Redirecionamento:** Após login ou cadastro bem-sucedido, o usuário é redirecionado para a página principal (`/`) usando o `useRouter` do Next.js.
6.  **Layout Responsivo:** Utiliza um `Card` do ShadCN UI centralizado na tela, garantindo uma boa visualização tanto em desktops quanto em dispositivos móveis.

## Componentes Utilizados (ShadCN UI)

*   `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`: Para estruturar a interface.
*   `Input` e `Label`: Para os campos do formulário.
*   `Button`: Para as ações de submit e alternância entre modos.
*   `AlertDialog`, `AlertDialogTrigger`, etc.: Para o modal de redefinição de senha.
*   `useToast`: Para as notificações.

## Estrutura do Código

*   **Estado:** Gerenciado com o hook `useState` do React para controlar os campos do formulário (email, senha, nome), o modo de autenticação (`isSigningUp`) e a visibilidade do diálogo de reset.
*   **Hooks do Firebase:** Utiliza `useAuth()` e `useFirestore()` de um provedor customizado (`@/firebase`) para obter as instâncias dos serviços do Firebase.
*   **Função `handleAuth`:** Uma única função assíncrona que lida com a lógica de cadastro ou login, dependendo do estado `isSigningUp`.
*   **Função `handlePasswordReset`:** Função assíncrona para o fluxo de recuperação de senha.

## Para Reutilizar

1.  Copie o componente `src/app/login/page.tsx`.
2.  Garanta que os componentes do ShadCN (`Card`, `Input`, `Button`, `AlertDialog`, `Toast`) estejam instalados e configurados.
3.  Adapte os hooks `useAuth` e `useFirestore` para corresponderem à sua implementação do Firebase.
4.  Verifique a lógica de criação de documento no Firestore para que corresponda ao `schema` do seu projeto.
5.  Adapte a rota de redirecionamento (`router.push('/')`) para a página desejada após o login.