# CLAUDE.md

Landing page de página única: tudo (HTML, CSS, JS e ícones) está no `index.html`, servido pelo Worker `index.js`. A documentação completa está em `DOCUMENTACAO.md`.

## Mockups

Antes de mudar a página de forma visível (layout, seção ou componente novo, texto que muda de lugar), faça um mockup e espere a aprovação. Correção pequena não precisa. O padrão completo está em `docs/mockups/README.md`.

- Criar: `node docs/mockups/_ferramentas/novo.mjs <assunto> "A proposta numa frase"`. Abre por duplo clique, sem servidor e sem build.
- `roteiro/gerar.mjs` lê o `index.html` de verdade (o CSS do `<style>`, o `<body>` e o `<script>`) e grava o `dados.js`. Nunca edite o `dados.js` à mão. No `CONFIG`: o `foco` (as seções que são o assunto; as outras viram bloco neutro), o `ir` e os estados (trocas de texto exatas, com dados fictícios e os casos difíceis).
- `proposta.css` e `proposta.js`: só o novo, por cima do quadro, nos dois temas (`classic` claro, `spatial` escuro). "Hoje" é o quadro sem eles.
- Conferência: `node docs/mockups/_ferramentas/fotos.mjs docs/mockups/<assunto>` (Edge sem janela, pelo CDP) em 1280, 1920, 390, 360 e 844×390, nos dois temas. Precisa sair sem problema: nada de texto cortado ou fora da janela, rolagem para o lado, contraste baixo, foco invisível ou erro de JS.
- Notas no `index.html`, nesta ordem: No computador e No celular (com as medidas em px e %), O que fica igual, Como entra no código (arquivo por arquivo), Para decidir (D1, D2…: a proposta primeiro como recomendação, a alternativa e o custo em número, a heurística de Nielsen quando for usabilidade).
- Entrega: o caminho do `index.html`, a proposta em duas ou três linhas e as decisões. Não implementar antes do sim. Depois: registrar as decisões no `DOCUMENTACAO.md`, levar a proposta para o `index.html`, conferir a página real pelo servidor local nas mesmas larguras e temas e anotar "Implementado em <data>" no README do mockup.
