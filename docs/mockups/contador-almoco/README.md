# Mockup · contador-almoco

O Contador de Almoço e o Afinuvo entram nos projetos num card compacto com abas, as demos abrem num modal com troca entre elas e todo projeto ganha o Ver mais e o Baixar

Criado em 2026-11-04. Segue o padrão de [docs/mockups/README.md](../README.md).

**Implementado em 2026-11-04**, com as recomendações de D1 a D16 e o nome Afinuvo. O card, os modais e as demos estão no `index.html`; a página do Afinuvo, só com o modo teste, em `projetos/afinuvo/index.html`, servida pelo `index.js` em `/projetos/afinuvo`. As decisões estão no `DOCUMENTACAO.md` (seção 2.4.2). Daqui em diante, o "Hoje" deste mockup (o `dados.js`, se gerado de novo) já mostra a página implementada.

## A proposta

Um card largo "Teste ao vivo", com o título "Alguns projetos disponíveis para teste", na seção Projetos, depois dos dois de hoje, com duas abas: **Contador de Almoço** e **Afinuvo** (o app em `c:/pifhos`). Cada aba tem o texto do projeto (no formato dos outros, com modal de arquitetura) e uma vitrine com a prévia da demo e o botão "Testar a demo", que abre a demo num modal. A demo roda no navegador, sem cadastro e sem servidor, com o tempo acelerado a 60× (ou 1×).

- Contador: Iniciar → Acompanhar → Retornar, com PIN e a dica "PIN versão de teste: 123456".
- Afinuvo: Executar (sessão de foco de 25 min) → Refletir (o que dificultou) → Ajustar (hipótese com antes → depois e Aplicar ajuste), ou Concluí → resumo.
- O outro projeto fica sempre à vista: o selo "Teste também" na aba fechada, a linha "Também dá para testar" no pé do card e o "Agora teste o…" no fim de cada demo.
- No topo do modal, o seletor Contador | Afinuvo troca de demo sem fechar.
- Todo projeto tem "Ver mais sobre o projeto →" depois da descrição, que leva à landing page dele (`/projetos/<slug>`). Enquanto as páginas não existem, o clique avisa "página em breve".
- Todo projeto (Lumus, Integrações de pagamento, Contador e Afinuvo) tem o botão "Baixar · em breve". Por enquanto não baixa: abre um aviso ("download em breve, em APK e na Google Play") com Fechar e, nos projetos com demo, "Testar a demo".

Decisões de 2026-11-04 (rodada 1): D1 demos em modal; D2 card com abas, o outro projeto à vista; D3 sem lado, por causa do modal; D4 60×; D5 PIN com "PIN versão de teste"; D6 sem links por enquanto (links e downloads no futuro). Rodada 2 (pedido): aproveitar melhor a tela, navegação fluida entre os testes e Baixar em todo projeto. Rodada 3 (pedido): título sem a contagem e o "Ver mais" para a página de cada projeto. Rodada 4 (pedido): o "Ver mais" do Afinuvo abre a página dele. Rodada 5 (pedido): essa página é uma landing page final para o cliente (`projetos/afinuvo/`, feita à mão): sem nomes de concorrentes, sem Nielsen, sem o detalhe das 5 dimensões e sem as abas de teste, sempre levando ao teste, que abre ali mesmo num modal só do Afinuvo (`#testar`), sem citar os outros projetos (o seletor Contador | Afinuvo e o "Agora teste o…" ficam só na página principal). O app de hoje vira a área de desenvolvimento, fora do site (`projetos/afinuvo-dev/`, copiada pelo `roteiro/copiar-afinuvo.mjs`). O que mudar no Afinuvo está em `c:/pifhos/docs/landing-page-cliente.md`. Rodada 7 (pedido): o nome oficial do app passa a ser **Afinuvo** (antes Disciple), no mockup inteiro, com a página em `projetos/afinuvo/` e a marca "A"; no código de `c:/pifhos` o nome ainda é Disciple. Em aberto: D7 a D16, nas notas do `index.html`.

Estados do mockup (pelo `ACOES` do `quadro.html`, com o tempo parado em 04/11/2026): card na aba Contador e na aba Afinuvo; aviso do Baixar; aviso do Ver mais (Contador); Contador prepare-se, PIN de teste, PIN errado e retorno; Afinuvo em foco, hipótese e concluído. No Hoje, os estados são iguais, porque nada disso existe.

Fora das fotos (sem o `parado=1`), as demos funcionam de verdade: o `proposta.js` só para o relógio quando o `fotos.mjs` fotografa.

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
node docs/mockups/contador-almoco/roteiro/gerar.mjs
```

```bash
node docs/mockups/_ferramentas/fotos.mjs docs/mockups/contador-almoco
```

```bash
node docs/mockups/contador-almoco/roteiro/copiar-afinuvo.mjs
```

O último copia o app do Afinuvo como está hoje (`c:/pifhos/dist`, depois de um `npm run build` lá) para `projetos/afinuvo-dev/`, a área de desenvolvimento, só para comparar. Não edite essa pasta à mão. A landing page final, `projetos/afinuvo/index.html`, é feita à mão.
