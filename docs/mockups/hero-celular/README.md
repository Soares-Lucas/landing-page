# Mockup · hero-celular

O hero cabe inteiro no celular, de 360 px para cima

Criado em 2026-11-03. Segue o padrão de [docs/mockups/README.md](../README.md).

**Implementado em 2026-11-03**, com D1 a D4 como recomendados. Conferido na página real (`wrangler dev`, porta 8788) em 1280, 1920, 390, 360 e 844×390, nos dois temas: sem rolagem para o lado nem texto fora da janela; hero de 1516 px em 390 e 1615 px em 360, como no mockup; Executar com 5,5:1 no Clássico; o terminal inclina nos dois temas. O `dados.js` continua no sha de antes da mudança, para o "Hoje" mostrar como era.

## A proposta

No celular, a coluna do hero ficava com cerca de 385 px, a largura do código do terminal, e cortava o título, o texto, os botões e as métricas. A proposta deixa a coluna encolher (`min-width: 0`). Abaixo de 640 px, o código quebra linha e as abas do terminal descem de linha. Também escurece o botão Executar no tema Clássico, que tinha contraste de 3,8:1. E leva para o terminal do Clássico o efeito do Espacial: a inclinação 3D, o brilho e a sombra, em verde.

Estados: **Padrão**, **Aba arquitetura.json** (as linhas de código mais longas, aberta pelo `ACOES` do `quadro.html`), **Terminal inclinado** (um `mousemove` simulado no hero) e **Nome longo** (nome fictício no cartão de identidade).

Para fotografar o terminal no celular:

```bash
node docs/mockups/_ferramentas/fotos.mjs docs/mockups/hero-celular --ir=terminal-wrap --janelas=celular,estreito --estados=aba-arquitetura
```

## Como abrir

Abra o `index.html` com duplo clique. Não precisa de servidor nem de build.
O painel de navegador do app do Claude não abre `file://` com os arquivos ao lado: use o navegador da máquina.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html` | A página do mockup: a proposta numa frase, os controles, os quadros no computador e no celular e as notas |
| `quadro.html` | Uma tela por vez, no tamanho real (`?v=hoje\|proposta&t=claro\|escuro&e=<estado>&c=neutro\|real`) |
| `dados.js` | O CSS, o corpo e o script do `index.html` da raiz, por estado. Gerado, não se edita |
| `proposta.css`, `proposta.js` | Só o novo, ligado por cima no quadro |
| `roteiro/gerar.mjs` | Lê o `index.html` de verdade e grava o `dados.js`; o `CONFIG` diz o foco e os estados |
| `fotos/` | As fotos, a `conferencia.json` e as `medidas.js`. Gerado pelo `fotos.mjs` |

## De onde vêm os dados

Do `index.html` da raiz, no sha que o `dados.js` registra. Os estados trocam trechos exatos de texto por dados fictícios; se um trecho deixa de existir, o roteiro para com erro.

## Gerar de novo

```bash
node docs/mockups/hero-celular/roteiro/gerar.mjs
```

```bash
node docs/mockups/_ferramentas/fotos.mjs docs/mockups/hero-celular
```
