# Descrição: Componente do Logotipo (`logo.tsx`)

Este documento detalha o logotipo do aplicativo, que é implementado como um componente React (`Logo`) retornando um SVG embutido. Essa abordagem é altamente performática e flexível.

## Estrutura do Componente

O arquivo `src/components/app/logo.tsx` exporta um único componente funcional.

*   **Tipo:** Componente React sem props.
*   **Conteúdo:** Retorna um elemento `<svg>` diretamente no JSX.

## Detalhes do SVG

O logotipo é composto por formas geométricas e texto, todos estilizados via `currentColor`, o que o torna dinâmico e adaptável ao tema do aplicativo.

1.  **Forma Principal (Hexágono):**
    *   `<path d="M16 2L2 9.5V22.5L16 30L30 22.5V9.5L16 2Z" />`
    *   Esta `path` desenha a forma de um hexágono visto em perspectiva isométrica, dando uma sensação de profundidade e estrutura. É a borda externa do logo.

2.  **Linhas Internas:**
    *   `<path d="M23 7.5L9 14.5" />` e `<path d="M16 30V16" />`
    *   Estas linhas criam divisões internas, reforçando a ideia de um objeto 3D ou de um diagrama técnico.

3.  **Texto Embutido:**
    *   `<text x="16" y="19" ...>ISCAAL</text>`
    *   Um elemento `<text>` SVG é posicionado no centro do logotipo.
    *   `text-anchor="middle"` garante que o texto fique perfeitamente centralizado horizontalmente.
    *   O conteúdo do texto é "ISCAAL", que pode ser uma sigla ou nome relacionado ao projeto.

## Vantagens e Flexibilidade

*   **Cor Dinâmica:** O atributo `stroke="currentColor"` e `fill="currentColor"` em todos os elementos do SVG significa que a cor do logotipo será herdada da cor do texto do seu elemento pai. No projeto atual, a classe `text-primary` é aplicada, fazendo com que o logo assuma a cor primária do tema (`--primary`). Se você colocar o logo em um `div` com `className="text-red-500"`, ele se tornará vermelho.
*   **Escalabilidade:** Como é um SVG, o logotipo é infinitamente escalável sem perda de qualidade. Você pode controlar seu tamanho usando as props `width` e `height` do SVG ou através de classes de tamanho do Tailwind.
*   **Performance:** Por ser embutido diretamente no HTML (inline SVG), não há necessidade de uma requisição HTTP extra para carregar um arquivo de imagem, o que é ótimo para a performance.
*   **Leveza:** O código do SVG é extremamente leve em termos de bytes.

## Como Reutilizar ou Modificar

1.  **Copiar o Componente:** Simplesmente copie o arquivo `src/components/app/logo.tsx` para o seu novo projeto.
2.  **Mudar o Texto:** Altere o conteúdo dentro do elemento `<text>` para o nome desejado.
3.  **Mudar o Estilo:**
    *   Para alterar as formas, modifique os atributos `d` das tags `<path>`.
    *   Para alterar a fonte, modifique o `font-family` no elemento `<text>`.
4.  **Uso:** Importe e use o componente `<Logo />` em qualquer lugar do seu aplicativo. Para estilizá-lo, envolva-o em um `div` e aplique as classes de cor e tamanho do Tailwind.

**Exemplo de Uso:**
```jsx
import Logo from '@/components/app/logo';

function Header() {
  return (
    <div className="flex items-center gap-2 text-blue-500">
      <Logo /> {/* O logo será azul */}
      <h1 className="text-xl">Meu Novo App</h1>
    </div>
  );
}
```