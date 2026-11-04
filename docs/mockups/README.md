# Mockups

O mockup é a tela proposta funcionando antes do código: uma página HTML que abre com duplo clique e mostra **hoje** e a **proposta** lado a lado, no computador e no celular, no tema Clássico (claro) e no Espacial (escuro). No fim, traz o que falta decidir. A pessoa aprova olhando a tela; depois, o código segue o mockup, e o CSS novo já está pronto nele.

Este padrão adapta [como-gerar-mockups.md](../../como-gerar-mockups.md) a esta landing page.

**Quando fazer:** antes de toda mudança visível (layout, seção ou componente novo, texto que muda de lugar), antes de cada etapa de um plano grande que mexe em telas, e quando há duas ou três saídas para escolher.
**Quando não fazer:** correção pequena, defeito com uma saída só, mudança que não aparece na tela.

## Como esta página muda o método

| Peça | Neste projeto |
| --- | --- |
| CSS do sistema | O `<style>` do `index.html` da raiz, com os temas `classic` e `spatial` |
| Marcação real | O próprio `<body>` do `index.html`: não há servidor que renderize. O `roteiro/gerar.mjs` lê o arquivo e grava o `dados.js` |
| JS real | O `<script>` do fim do `index.html`, rodado no quadro como na página |
| Ambiente | `node` (22 ou mais novo), da raiz do repositório |
| Fotos | Edge sem janela, pelo CDP, no `_ferramentas/fotos.mjs` (sem dependências) |

Como o CSS e o JS moram dentro do `index.html`, o quadro não aponta para eles por caminho relativo: o roteiro os extrai a cada geração. Se a página mudar, rode o `gerar.mjs` de novo e o mockup acompanha. O `dados.js` registra o sha do `index.html` de onde saiu.

## Arquivos

```
docs/mockups/
├── README.md            # este padrão
├── _ferramentas/
│   ├── pagina.mjs       # lê o index.html; trocar() e conferirIds() param com erro em vez de gerar tela errada
│   ├── novo.mjs         # cria um mockup a partir do _modelo
│   └── fotos.mjs        # fotografa e confere no Edge sem janela
├── _modelo/             # o que o novo.mjs copia
└── <assunto>/
    ├── index.html       # título = a proposta numa frase; controles; quadros; notas
    ├── quadro.html      # uma tela por vez: ?v=hoje|proposta&t=claro|escuro&e=<estado>&c=neutro|real
    ├── dados.js         # gerado pelo roteiro; não se edita
    ├── proposta.css     # só o CSS novo
    ├── proposta.js      # só o JS novo, quando há comportamento
    ├── roteiro/gerar.mjs  # CONFIG: foco, ir, estados (trocas de texto exatas)
    ├── fotos/           # gerado pelo fotos.mjs: PNGs, conferencia.json, medidas.js
    └── README.md        # como abrir, arquivos, origem dos dados, comando para gerar de novo
```

O "Hoje" é o quadro sem o `proposta.css` e o `proposta.js`; a "Proposta" é o mesmo quadro com eles ligados por cima.
As seções que não são o assunto (`foco`) viram **blocos neutros com a mesma altura**: o olho vai ao que muda e o contexto continua no lugar. O controle "Em volta: Real" mostra a página inteira.

## Passo a passo

Nenhum código do produto muda antes da aprovação do passo 11.

1. **Ler o que existe.** O pedido, a seção do `DOCUMENTACAO.md`, o HTML, o CSS e o JS da seção no `index.html` e os mockups anteriores do mesmo assunto.
2. **Criar a pasta.**
   ```bash
   node docs/mockups/_ferramentas/novo.mjs <assunto> "A proposta numa frase"
   ```
   A frase é o título: "As métricas do hero cabem no celular de 360 px", e não "Mockup do hero".
3. **Ajustar o `CONFIG`** do `roteiro/gerar.mjs`: `foco` (ids de `nav`, `hero`, `especialidades`, `projetos`, `experiencia`, `contato` ou `rodape`), `ir` e os estados. Rodar de novo.
4. **Medir a tela de hoje.** `fotos.mjs` com o `proposta.css` vazio: as medidas e os problemas de hoje vão para as notas.
5. **Escrever a proposta** no `proposta.css` (os dois temas) e no `proposta.js`. Estado que é interação (menu aberto, modal aberto) entra no `ACOES` do `quadro.html`.
6. **Conferir as fotos** até não sobrar problema (ver abaixo).
7. **Escrever as notas** no `index.html` e o `README.md` do mockup.
8. **Entregar e esperar:** o caminho do `index.html`, a proposta em duas ou três linhas e as decisões com a recomendação.

Se a pessoa pedir mudança, volte ao passo 5 e refaça as fotos e as notas.

## Dados

O conteúdo de hoje é o do `index.html`, que já é público. Os casos difíceis entram como estados, com trocas de texto exatas no `CONFIG`: o nome longo, o projeto com descrição comprida, a lista de tags que cresce, a seção vazia. Use texto fictício e plausível, nunca dado de cliente. Se um trecho trocado deixa de existir ou aparece duas vezes, o `gerar.mjs` para e diz o motivo.

A página de hoje não tem relógio nem sorteio. Se algum dia tiver, fixe a data e a semente no roteiro.

## As fotos e a conferência

```bash
node docs/mockups/_ferramentas/fotos.mjs docs/mockups/<assunto>
```

| Janela | Tamanho (px) | Para quê |
| --- | --- | --- |
| `computador` | 1280 × 860 | A janela principal das fotos e das medidas |
| `grande` | 1920 × 1080 | Quando a proposta mexe na largura |
| `celular` | 390 × 844 | A janela do celular no `index.html` |
| `estreito` | 360 × 800 | Onde o texto quebra primeiro |
| `deitado` | 844 × 390 | Celular deitado: o `nav` fixo no alto ocupa mais |

Cada janela sai nos dois temas, em Hoje e Proposta, em cada estado. O script sai com código 1 se encontrar:

- **texto cortado** (com `overflow` ou reticências) ou **texto fora da janela**, mesmo quando um `overflow: hidden` esconde a rolagem;
- **rolagem para o lado** na página;
- **contraste baixo** no foco (menos de 4,5:1, ou 3:1 em texto grande), nos dois temas;
- **link ou botão sem foco visível** no foco;
- **erro de JavaScript** no quadro.

Ele grava `fotos/medidas.js`, e o `index.html` mostra a tabela com a altura de cada parte do foco em px e em % da janela. Também fotografa o próprio `index.html` nos dois temas (`fotos/index-claro.png`, `fotos/index-escuro.png`), que é a imagem para a entrega.

O painel de navegador do app do Claude não abre `file://` com os arquivos ao lado. Para olhar, use o navegador da máquina ou as fotos.

## Notas e decisões

As notas do `index.html` seguem esta ordem: **No computador** e **No celular** (com as medidas: "a seção tem 640 px de 860 px (74%)"), **O que fica igual**, **Como entra no código** (arquivo por arquivo: o `<style>` e o `<script>` do `index.html`, o `index.js` se houver rota nova, o `DOCUMENTACAO.md`) e **Para decidir**.

Cada decisão (D1, D2…) tem um nome curto em negrito, a proposta primeiro (é a recomendação), a alternativa e o custo dela em número. Quando a escolha é de usabilidade, ela cita a heurística de Nielsen que atende.

## Depois do sim

1. Registrar as decisões no `DOCUMENTACAO.md`, com a data e o caminho do mockup. O que foi liberado sem escolha entra como "decidido sem perguntar, pela recomendação".
2. Levar o `proposta.css` para o `<style>` e o `proposta.js` para o `<script>` do `index.html`.
3. Conferir a página real nas mesmas larguras e temas, pelo servidor local (`npx wrangler dev -c wrangler.local.toml --port 8788`). O mockup é o desenho, não o teste.
4. Acrescentar "Implementado em <data>" ao `README.md` do mockup.
5. Um commit por etapa, com a documentação em dia no mesmo commit.
