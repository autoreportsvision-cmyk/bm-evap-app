# Blueprint: Sistema de Gerenciamento de Usuários (Admin)

Este documento descreve os componentes e a lógica necessários para implementar um painel de administração de usuários, permitindo que um administrador busque usuários e modifique suas permissões (roles).

## Funcionalidades

-   Um administrador pode buscar usuários por nome.
-   Exibe os resultados da busca em uma tabela com nome, email e permissão atual.
-   Permite que o administrador altere a permissão de um usuário (ex: de 'basic' para 'premium').
-   Impede que administradores alterem sua própria permissão ou a de outros administradores.

## Arquivos e Lógica Essenciais

### 1. `src/components/app/admin-tab.tsx`

Este é o coração da funcionalidade. Contém a interface do usuário e toda a lógica do lado do cliente.

-   **UI:** Utiliza componentes ShadCN como `Card`, `Input`, `Button`, e `Table` para criar o layout.
-   **Busca de Usuários:**
    -   Usa a função `getDocs` do Firestore com uma `query` para buscar na coleção `users`.
    -   A query filtra os usuários onde o `displayName` corresponde à busca.
    -   `const q = query(usersRef, where('displayName', '>=', searchQuery), where('displayName', '<=', searchQuery + '\uf8ff'));`
-   **Alteração de Permissão:**
    -   Usa a função `updateDoc` do Firestore para atualizar o campo `role` de um documento de usuário específico.
    -   `const userRef = doc(firestore, 'users', userId);`
    -   `await updateDoc(userRef, { role: newRole });`
-   **Controle de Acesso:** A aba só é renderizada se o `role` do usuário logado for `admin`, verificado em `src/components/app/main-tabs.tsx`.

### 2. `src/lib/types.ts` (Definição do `UserProfile`)

Define a estrutura de dados de um usuário no Firestore. É crucial para a consistência dos dados.

```typescript
export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'basic' | 'premium';
  createdAt: { ... };
  accessExpiration?: { ... } | Date;
}
```

### 3. `firestore.rules` (Regras de Segurança - Não visível no código, mas fundamental)

As regras do Firestore no backend garantem que apenas administradores possam realizar as operações de busca e alteração de permissão.

Exemplo de regra:
```
match /users/{userId} {
  // Permite que qualquer usuário autenticado leia seu próprio perfil.
  allow read: if request.auth.uid == userId;
  
  // Permite que um admin leia qualquer perfil ou atualize o 'role' de qualquer usuário.
  allow read, update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```
*Esta regra é um exemplo conceitual. A implementação exata pode variar.*

## Para Reutilizar

1.  Copie o componente `src/components/app/admin-tab.tsx`.
2.  Garanta que a definição do tipo `UserProfile` em seu `types.ts` inclua o campo `role`.
3.  Adapte o componente que controla a visibilidade da aba de admin (como `main-tabs.tsx`) para verificar o `role` do usuário.
4.  Configure as regras de segurança do Firestore para permitir que apenas administradores leiam a coleção de usuários e atualizem o campo `role`.
