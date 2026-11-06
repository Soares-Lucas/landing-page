# Mockup · movimento-espacial

A página ganha profundidade: estrelas no hero, parallax, seções que surgem ao rolar e glitch nos títulos

Criado em 2026-11-04. Segue o padrão de [docs/mockups/README.md](../README.md).

**Implementado em 2026-11-05**, com D1 a D5 como recomendados, sobre o `index.html` que já tinha o card "Teste ao vivo" (commit `dd331d7`, posterior ao sha do `dados.js`). Conferido na página real (`wrangler dev`, porta 8788, Edge sem janela) em 1280, 1920, 390, 360 e 844×390, nos dois temas: sem rolagem para o lado, texto cortado ou fora da janela, contraste baixo, foco invisível ou erro de JS. Alturas como no mockup, exceto projetos, que cresceram com o card novo (1665 px em 1280). Com o card "Teste ao vivo" logo abaixo, o desencontro dos dois projetos deixa no mínimo 12 px até ele. Uma mudança da conferência: as seções surgem quando passam 60 px da borda de baixo, sem o limite de 15% (com 844×390, os projetos nunca chegavam a 15% na tela e ficavam invisíveis). O `proposta.js` foi corrigido igual. O `dados.js` continua no sha de antes, para o "Hoje" mostrar como era.

## A proposta

Traz para esta página os commits **91e175e** (parallax e campo de estrelas) e **b915b92** (glitch nos títulos e entrada das seções) do `C:\new-landing-page`, que lá são React com a biblioteca motion. Aqui ficam em CSS e JS puros, sem dependência nova. Estrelas no hero (só no Espacial), parallax nos brilhos, no terminal, nos projetos e no contato, seções que surgem ao rolar, glitch no h1 e nos h2 (só no Espacial) e hover com brilho nos cartões do Espacial. De carona, o e-mail do contato, que hoje sai cortado em 1280, 1920, 844 e 360 px, passa a quebrar depois do @.

Estados: **Padrão**, **Rolando em projetos** e **Rolando no contato** (o `ACOES` do `quadro.html` só muda para onde a janela rola), **Glitch nos títulos** (a animação congelada em 94,5% do ciclo) e **Projeto longo** (descrição fictícia bem maior num dos projetos). Nas fotos (`parado=1`), as estrelas saem num quadro parado com semente fixa e as seções já aparecem à vista. O parallax depende só da posição da rolagem, por isso aparece nas fotos.

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
node docs/mockups/movimento-espacial/roteiro/gerar.mjs
```

```bash
node docs/mockups/_ferramentas/fotos.mjs docs/mockups/movimento-espacial
```
