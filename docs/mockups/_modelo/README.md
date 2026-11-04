# Mockup · {{ASSUNTO}}

{{FRASE}}

Criado em {{DATA}}. Segue o padrão de [docs/mockups/README.md](../README.md).

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
node docs/mockups/{{ASSUNTO}}/roteiro/gerar.mjs
```

```bash
node docs/mockups/_ferramentas/fotos.mjs docs/mockups/{{ASSUNTO}}
```
