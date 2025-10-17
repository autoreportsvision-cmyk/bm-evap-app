# Descrição: Paleta de Cores e Tema (`globals.css`)

Este documento descreve a paleta de cores e o sistema de temas do aplicativo, implementado via variáveis CSS HSL no arquivo `src/app/globals.css`, seguindo o padrão do ShadCN UI.

## Conceito

O sistema utiliza variáveis CSS para definir uma paleta de cores semântica, permitindo a fácil troca entre temas (claro e escuro) e a manutenção da consistência visual. As cores são definidas usando o formato HSL (`hue`, `saturation`, `lightness`), o que facilita o ajuste fino da paleta.

## Estrutura do CSS

O tema é definido dentro de uma camada `@layer base`, usando os seletores `:root` para o tema claro (padrão) e `.dark` para o tema escuro.

### Variáveis Principais (Cores Semânticas)

*   `--background`: Cor de fundo principal da aplicação.
*   `--foreground`: Cor do texto principal, contrastando com o fundo.
*   `--primary`: Cor primária, usada para elementos principais como botões e links. É a cor de destaque da marca.
*   `--primary-foreground`: Cor do texto para ser usada sobre a cor primária, garantindo legibilidade.
*   `--secondary`: Cor secundária, para elementos de menor destaque.
*   `--accent`: Cor de "acento", usada para estados de *hover* e foco.
*   `--destructive`: Cor para ações perigosas ou mensagens de erro (geralmente um tom de vermelho).
*   `--card`: Cor de fundo para componentes como `Card`.
*   `--border`: Cor para bordas de componentes.
*   `--input`: Cor da borda para campos de `Input`.
*   `--ring`: Cor para anéis de foco (`focus-visible`).

### Paleta Atual (BM_EVAPORAÇÃO)

#### Tema Escuro (`.dark`)

*   **Fundo (`--background`):** `0 0% 3.9%` (Preto quase puro) - Cria um ambiente focado e com alto contraste.
*   **Texto (`--foreground`):** `0 0% 98%` (Branco quase puro).
*   **Primária (`--primary`):** `51 100% 50%` (Amarelo/Dourado vibrante) - Cor de destaque principal, que remete a energia e atenção.
*   **Primária Texto (`--primary-foreground`):** `51 100% 10%` (Marrom escuro) - Garante contraste sobre o amarelo.
*   **Acento (`--accent`):** `0 0% 14.9%` (Cinza escuro) - Usado para hovers sutis.

#### Tema Claro (`:root`)

*   **Fundo (`--background`):** `0 0% 100%` (Branco).
*   **Texto (`--foreground`):** `222.2 84% 4.9%` (Azul muito escuro).
*   **Primária (`--primary`):** `222.2 47.4% 11.2%` (Azul escuro) - Cor sóbria e corporativa.
*   **Acento (`--accent`):** `210 40% 96.1%` (Cinza muito claro).

## Como Reutilizar ou Modificar

1.  **Copie o Bloco de Código:** Copie toda a seção `@layer base` do arquivo `src/app/globals.css`.
2.  **Ajuste os Valores HSL:** Para criar um novo tema, simplesmente altere os valores de `hue`, `saturation` e `lightness` das variáveis.
    *   **Mudar a Cor Primária:** Altere o `hue` (primeiro valor) de `--primary`. Por exemplo, para um tom de verde, use um `hue` em torno de `140`.
    *   **Ajustar Contraste:** Modifique o `lightness` (terceiro valor) para tornar as cores mais claras ou escuras.
3.  **Consistência:** A grande vantagem é que, ao ajustar essas variáveis centrais, todos os componentes do ShadCN UI que as utilizam serão atualizados automaticamente, mantendo a consistência visual em todo o aplicativo.