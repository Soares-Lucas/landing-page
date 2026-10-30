# Documentação da Landing Page

Landing page profissional de **Lucas Soares**, desenvolvedor Full Stack. É uma página única (single page), estática, com dois temas visuais (**Espacial** escuro e **Clássico** claro) e um pequeno script para as interações. É servida por um **Cloudflare Worker**.

O layout foi portado do projeto React `new-landing-page` para um único `index.html`, sem React nem etapa de build.

---

## 1. Estrutura do projeto

```
landing-page/
├── index.html      # A página inteira: HTML + CSS (<style>) + JS (<script>) + ícones SVG
├── index.js        # Worker da Cloudflare que entrega o index.html e a foto de perfil
├── wrangler.toml   # Configuração do Wrangler (deploy na Cloudflare)
├── assets/
│   └── img/
│       ├── perfil.jpg           # Foto de perfil otimizada, usada na página (320×320, ~16 KB)
│       └── perfil-original.jpg  # Foto original (828×1095), guardada como fonte para novos recortes
├── package.json    # Scripts dev/deploy e dependência do Wrangler
└── README.md       # Apresentação do projeto
```

Arquivos e pastas apenas locais (não versionados):

| Item | Para que serve |
|---|---|
| `index.local.js` + `wrangler.local.toml` | Worker de teste que serve o `index.html` sem cache (`cache-control: no-store`) |
| `.claude/launch.json` | Atalho para subir o servidor local de teste na porta 8788 |
| `index-new.html`, `layout-new/` | Versões anteriores de layout, mantidas como referência |
| `node_modules/`, `.wrangler/`, `package-lock.json` | Gerados pelo `npm install` e pelo Wrangler |

### 1.1 `index.js` — o servidor

Worker no formato ES Module. O `index.html` é importado como texto e a foto `assets/img/perfil.jpg` como binário:

| Requisição | Resposta |
|---|---|
| `GET /` | `200` com o HTML, `content-type: text/html; charset=utf-8` e `cache-control: public, max-age=300` (cache de 5 minutos) |
| `GET /assets/img/perfil.jpg` | `200` com a foto, `content-type: image/jpeg` e `cache-control: public, max-age=86400` (cache de 1 dia) |
| Qualquer outro caminho | `404 Not found` |

> O Worker só atende as rotas acima. Qualquer outra imagem, favicon ou arquivo adicionado ao projeto precisa de um `import` e de uma rota nova no `index.js` (e no `index.local.js`, para testes). Por isso os ícones estão embutidos no próprio HTML.

### 1.2 `wrangler.toml` — configuração

- `name = "lucas-soares-site"` — nome do Worker na Cloudflare.
- `main = "index.js"` — ponto de entrada.
- Regra `[[rules]] type = "Text"` para `**/*.html` — é o que permite fazer `import page from "./index.html"` como string.
- Regra `[[rules]] type = "Data"` para `**/*.jpg` — permite importar a foto como `ArrayBuffer`. A mesma regra foi adicionada ao `wrangler.local.toml`.

### 1.3 Comandos

```bash
npm install
```

```bash
npm run dev
```

```bash
npx wrangler dev -c wrangler.local.toml --port 8788
```

```bash
npm run deploy
```

- `dev` sobe o Worker de produção localmente (normalmente em `http://localhost:8787`, com cache de 5 minutos).
- O comando com `-c wrangler.local.toml` sobe o Worker de teste em `http://localhost:8788`, sem cache — melhor para revisar alterações.
- `deploy` publica na Cloudflare (requer login com `npx wrangler login`).

---

## 2. Estrutura da página (`index.html`)

O arquivo é organizado nesta ordem:

```
<head>
├── meta tags (description, Open Graph)
├── Google Fonts (Inter + JetBrains Mono)
├── <script> que aplica o tema salvo antes da página aparecer
└── <style> com tokens de tema, componentes e breakpoints
<body>
├── <svg> sprite de ícones (estilo Lucide), invisível
├── header.nav#nav ............ Barra fixa (logo, links, tema, menu mobile)
├── main#top
│   ├── section#hero ............ Apresentação + terminal interativo
│   ├── section#especialidades .. 3 cards de capacidades
│   ├── section#projetos ........ 2 cases com botão de arquitetura
│   ├── section#experiencia ..... Linha do tempo vertical
│   └── section#contato ......... Painel de contato
├── footer .................... Copyright + link "Topo"
├── dialog#modal-lumus ........ Arquitetura do Lumus Data Engine
├── dialog#modal-payments ..... Arquitetura das Integrações de pagamento
└── <script> .................. Interações da página
```

### 2.1 Cabeçalho / navegação (`header.nav`)

- Fixo no topo ao rolar (`position: sticky`), com fundo translúcido e desfoque.
- **Logo:** selo "LS" + "Lucas Soares" e a legenda "Full Stack Dev", link para `#top`.
- **Links:** Especialidades, Projetos, Experiência e Contato (rolagem suave).
- **Botão de tema** (`#theme-toggle`): alterna entre "Modo Espacial" e "Modo Clássico".
- **Menu mobile** (`#menu-btn` / `#mobile-menu`): até 900px os links somem e aparece o botão hambúrguer, que abre a lista; clicar em um link fecha o menu.

### 2.2 Hero (`#hero`)

Grid de duas colunas (texto à esquerda, terminal à direita); vira uma coluna abaixo de 1024px. Fundo com grade de linhas e dois brilhos (`.glow`).

**Coluna de texto**
- **Cartão de identidade** (`.identity`): foto de perfil redonda com indicador verde, nome "Lucas Soares", cargo "Desenvolvedor Full Stack" e selo "Disponível para projetos". Substituiu o antigo selo (eyebrow) que mostrava só o cargo. Ver seção 3.7.
- Título (`h1`): **"Software para operação real."** — com texto em degradê no modo Espacial.
- Texto de apoio sobre sistemas corporativos, integrações, ERP, dados e automações.
- Botões:
  - **Falar sobre um projeto** (primário) → WhatsApp (`https://wa.me/qr/QWVIBVNIY3G7M1`), nova aba.
  - **Ver trabalhos** (secundário) → `#projetos`.
- Métricas (3 cards):
  | Destaque | Descrição |
  |---|---|
  | 6+ | anos criando e mantendo sistemas |
  | ERP | rotinas administrativas, financeiras e operacionais |
  | APIs | integrações, webhooks e dados consistentes |

**HUD de coordenadas** (`.hud`): indicador "COORD X / Y / Z" no canto, visível apenas no modo Espacial em telas a partir de 1024px.

**Terminal interativo** (`#terminal-wrap` → `aside.terminal`)
- Barra com o título "lucas-soares / workspace" e três abas (`role="tablist"`, navegáveis com ← →):

  | Aba | Conteúdo | Mensagem ao executar |
  |---|---|---|
  | `perfil.dev` | Objeto JS com nome, foco, stack e entrega | ✓ Operação real validada… |
  | `arquitetura.json` | Paradigma, bancos, mensageria, idempotência, disponibilidade | ✓ Infraestrutura validada… |
  | `stack.ts` | Classe TypeScript `OperacaoReal` | ✓ Lote processado com integridade referencial. |

- **Executar** (`#run-btn`): após 450 ms mostra a mensagem do atributo `data-output` da aba ativa.
- **Copiar** (`#copy-code`): copia o código da aba ativa.
- Rodapé "Stack:" com tags: PHP, Laravel, CodeIgniter, JavaScript, MySQL, Docker, REST APIs, Webhooks, PostgreSQL.
- No modo Espacial, com mouse, o terminal inclina em 3D acompanhando o cursor (desativado em telas de toque e com "reduzir movimento").

### 2.3 Especialidades (`#especialidades`)

Rótulo "Capacidades & Domínio", título **"Onde gero valor"**. Três cards, cada um com ícone, descrição, lista de 4 itens e rodapé "Módulo de Operação · Estabilidade Total":

| Card | Descrição | Itens da lista |
|---|---|---|
| Sistemas corporativos e ERP | Rotinas administrativas, financeiras e operacionais | Módulos fiscais; estoque e expedição; refatoração de legados; backup e failover |
| Integrações e webhooks | APIs REST, gateways, sincronização, idempotência | Filas com retry e dead-letter; HMAC; reconciliação financeira; chaves de idempotência |
| Dados e relatórios | SQL, modelagem, extrações, troubleshooting | Otimização de queries; modelagem relacional; extração assíncrona; dashboards |

### 2.4 Projetos em destaque (`#projetos`)

Rótulo "Cases Selecionados". Dois cards com ícone, descrição, bloco de **Impacto Operacional**, tags e dois botões ("Ver Arquitetura" e "Detalhes técnicos →") que abrem o modal correspondente:

| Projeto | Impacto | Tags | Modal |
|---|---|---|---|
| **Lumus Data Engine** | Redução de 74% no tempo de geração de balanços | Python, Docker, Relatórios, FastAPI, Pandas | `#modal-lumus` |
| **Integrações de pagamento** | 99.98% de consistência em eventos, zero perdas | APIs, Webhooks, Segurança, Idempotência, Fintech | `#modal-payments` |

**Modais** (`<dialog>`): Visão Geral, Fluxo Arquitetural (Origem → Processamento → Destino), Padrões Técnicos com 4 itens e Métrica de Sucesso. Fecham pelo X, pelo botão "Fechar", clicando fora ou com Esc.

| Modal | Origem | Processamento | Destino |
|---|---|---|---|
| Lumus | PHP / Monolito | Python Engine (Docker) | Export CSV / XLSX / PDF |
| Pagamentos | Webhook Externo | Idempotent Buffer | ERP Database Commit |

### 2.5 Experiência (`#experiencia`)

Rótulo "Histórico & Consistência", título **"Trajetória profissional"**. Linha do tempo vertical com marcadores; no desktop o período fica à esquerda da linha. O item atual tem destaque (`.is-current`).

| Período | Cargo / Tópico | Tags |
|---|---|---|
| Atual | Analista Desenvolvedor / Full Stack | Sistemas Críticos, Arquitetura de Soluções, APIs REST, Liderança Técnica |
| 2019 – 2024 | Desenvolvedor Full Stack – ERP | PHP, Laravel, CodeIgniter, MySQL, jQuery, Automações |
| Base técnica | Stack principal & Metodologia | Git, Docker, PostgreSQL, Linux, Scrum, Modelagem SQL |

### 2.6 Contato (`#contato`)

Rótulo "Conexão Direta", título **"Vamos conversar?"** e painel com:
- Foto de perfil (`.contact-avatar`, 88px) acima do nome, com o mesmo indicador verde de disponibilidade.
- Lucas Soares da Silva — Rio de Janeiro, Brasil · Desenvolvedor Full Stack.
- **E-mail** `soares-lucas94@hotmail.com` (link `mailto:`) com botão de copiar (`#copy-email`).
- **LinkedIn** → `linkedin.com/in/lucas-soares-4a01a631b`, nova aba.
- Botão **Enviar mensagem via WhatsApp** → mesmo link do hero.

### 2.7 Rodapé (`footer`)

"© 2026 Lucas Soares. Landing page profissional criada para apresentação de software, integrações e sistemas corporativos." + link **Topo** (`#top`).

---

## 3. Estilo visual (CSS)

Todo o CSS está no `<style>` dentro do `<head>`.

### 3.1 Temas

O tema é definido pelo atributo `data-theme` no `<html>`:

| Tema | Valor | Aparência |
|---|---|---|
| Espacial (padrão) | `spatial` | Fundo azul-escuro, destaques ciano, vidro translúcido, brilhos, título em degradê, HUD e inclinação 3D |
| Clássico | `classic` | Fundo claro, verde-petróleo e azul, visual sóbrio |

A escolha fica salva no navegador (`localStorage`, chave `theme`) e é aplicada no `<head>` antes da página aparecer, para não piscar.

### 3.2 Tokens principais

Cada tema define as mesmas variáveis em `:root[data-theme="…"]`:

| Variável | Clássico | Espacial | Uso |
|---|---|---|---|
| `--bg` | `#f7f8f6` | `#090e13` | Fundo da página |
| `--surface` | `#ffffff` | vidro escuro translúcido | Cards |
| `--ink` | `#141a18` | `#eef5f4` | Texto principal |
| `--muted` | `#53615b` | `#cbd5e1` | Texto secundário |
| `--line` | `#dce3dd` | ciano translúcido | Bordas |
| `--accent` | `#0f6b5f` | `#22d3ee` | Destaque principal |
| `--accent-2` | `#154b70` | `#38bdf8` | Destaque secundário |

Há também tokens específicos para botões (`--btn-*`), chips (`--chip-*`), logo (`--logo-*`), contato (`--contact-*`), rodapé (`--footer-*`), grade do hero (`--grid-*`) e brilhos (`--glow-*`). Ajustes que só valem num tema usam o seletor `:root[data-theme="spatial"] .classe`.

### 3.3 Tipografia

- Texto: **Inter** (Google Fonts), com fallback para a fonte do sistema.
- Código, rótulos e números: **JetBrains Mono** (classe `.mono`).
- Tamanhos fluidos com `clamp()`.

### 3.4 Ícones

Ficam num sprite `<svg>` no início do `<body>`, um `<symbol id="i-…">` por ícone (estilo Lucide). Para usar:

```html
<svg class="icon"><use href="#i-mail"/></svg>
```

Ícones disponíveis: sparkles, message, arrow-up-right, arrow-right, arrow-up, layers, network, database, check-circle, check, sheet, lock, activity, cpu, mail, linkedin, pin, copy, terminal, play, menu, x.

### 3.5 Componentes reutilizáveis

| Classe | Descrição |
|---|---|
| `.btn`, `.btn-primary`, `.btn-secondary` | Botões de ação do hero |
| `.section`, `.section-alt`, `.section-head`, `.kicker` | Seções, cabeçalho e rótulo acima do título |
| `.card`, `.card-icon`, `.checklist`, `.card-foot` | Cards de especialidade |
| `.card.project`, `.impact`, `.ghost-btn`, `.link-btn` | Cards de projeto |
| `.chip`, `.chip-list` | Tags de tecnologia |
| `.metric-card` | Métricas do hero |
| `.terminal`, `.terminal-tab`, `.terminal-panel`, `.stack-tag` | Terminal |
| `.timeline`, `.timeline-item`, `.is-current` | Linha do tempo |
| `.identity`, `.identity-name`, `.identity-role`, `.identity-status` | Cartão de identidade do hero |
| `.avatar`, `.status-dot`, `.contact-avatar` | Foto de perfil redonda com indicador de disponibilidade |
| `.contact-panel`, `.contact-item`, `.contact-cta` | Contato |
| `.modal`, `.flow`, `.flow-step`, `.success` | Modais de arquitetura |
| `.icon-btn` (+ `.copied`) | Botões de copiar, com confirmação por 2 s |

### 3.6 Responsividade

| Breakpoint | Mudanças |
|---|---|
| até 1023px | Hero e projetos em 1 coluna; HUD oculto |
| até 900px | Links do menu dão lugar ao menu hambúrguer; especialidades em 1 coluna; períodos da linha do tempo acima do card |
| até 640px | Selo "Disponível para projetos" do cartão de identidade oculto (o ponto verde na foto continua); margens menores; botões e métricas empilhados; rótulos "Modo …" e "Executar" ocultos; fonte do terminal menor; fluxo dos modais na vertical; rodapé centralizado |
| `prefers-reduced-motion` | Desliga animações, transições, rolagem suave e inclinação 3D |

### 3.7 Foto de perfil — decisões de UX/UI

A foto aparece em dois pontos: no **topo do hero**, onde o visitante decide se continua lendo, e no **contato**, ao lado do nome e logo antes dos botões de ação. O padrão segue páginas de perfil de produtos como Linear, Vercel, Stripe e Read.cv: um cartão compacto com avatar, nome e status, em vez de uma foto grande que compete com o título.

| Heurística de Nielsen | Como foi aplicada |
|---|---|
| 1. Visibilidade do status do sistema | O ponto verde na foto e o selo "Disponível para projetos" mostram na hora que o desenvolvedor está aceitando trabalhos |
| 2. Correspondência com o mundo real | Avatar redondo com ponto de status, padrão conhecido de Slack, LinkedIn e GitHub |
| 4. Consistência e padrões | O mesmo componente `.avatar` aparece no hero e no contato, com as cores de cada tema (anel ciano no Espacial, verde-petróleo no Clássico) |
| 6. Reconhecer em vez de lembrar | Rosto e nome aparecem juntos, então o visitante associa a pessoa ao trabalho sem precisar ler o terminal |
| 8. Estética e design minimalista | Foto pequena (56px no hero), que identifica sem tirar o foco do título e dos botões. O cargo saiu do selo antigo e passou para o cartão, sem repetir informação |

Outros cuidados:
- **Confiança perto da ação:** um rosto junto ao CTA de contato aumenta a credibilidade de quem vai mandar mensagem.
- **Desempenho:** a foto foi recortada em quadrado e reduzida para 320×320 (cerca de 16 KB, nítida em telas 2× e 3×). Tem `width`/`height` fixos para evitar que o layout pule ao carregar. A do hero usa `fetchpriority="high"` e a do contato usa `loading="lazy"`.
- **Acessibilidade:** a foto do hero tem `alt="Foto de perfil de Lucas Soares"`. A do contato tem `alt=""`, porque o nome está logo abaixo e o leitor de tela repetiria a informação. O ponto verde é `aria-hidden`, e o status já está escrito no selo.
- **Trocar a foto:** substitua `assets/img/perfil.jpg` por outra imagem quadrada de cerca de 320×320 com o mesmo nome. Não é preciso mudar nada no HTML nem no Worker. Guarde o original em `assets/img/`.

---

## 4. Interações (JavaScript)

Script no fim do `<body>`, sem bibliotecas:

| Função | Elementos |
|---|---|
| Alternar tema e salvar a escolha | `#theme-toggle` |
| Abrir/fechar menu mobile | `#menu-btn`, `#mobile-menu` |
| Inclinação 3D do terminal + HUD (Espacial, mouse) | `#hero`, `#terminal-wrap`, `#hud-coords` |
| Copiar e-mail / código (Clipboard API, com alternativa para HTTP) | `#copy-email`, `#copy-code` |
| Trocar abas do terminal (clique e setas) | `.terminal-tab` |
| Executar simulação | `#run-btn`, `#terminal-output` |
| Abrir/fechar modais | `[data-modal]`, `[data-close]`, `dialog.modal` |

Sem JavaScript, o conteúdo continua legível; perdem-se apenas as interações.

---

## 5. Acessibilidade e SEO

- `lang="pt-BR"`, `meta viewport`, `meta description` e tags Open Graph (`og:title`, `og:description`, `og:type`).
- Título da aba: "Lucas Soares | Desenvolvedor Full Stack".
- Seções com `aria-labelledby`; navegação com `aria-label`.
- Abas do terminal com `role="tablist"`/`tab`/`tabpanel`, `aria-selected` e navegação por teclado.
- Resultado do "Executar" em `role="status"` (anunciado por leitores de tela).
- Menu mobile com `aria-expanded`/`aria-controls`; botão de tema com `aria-pressed`.
- Modais em `<dialog>` nativo (foco preso e Esc para fechar).
- Elementos decorativos (brilhos, HUD, marcadores, ponto de status) com `aria-hidden="true"`.
- Foto de perfil com texto alternativo no hero e `alt=""` no contato (ver seção 3.7).

---

## 6. Como editar o conteúdo

Todo o conteúdo está em `index.html`:

| O que | Onde procurar |
|---|---|
| Link do WhatsApp | `https://wa.me/...` (2 vezes: hero e contato) |
| Métricas do hero | `div.metrics` |
| Código das abas do terminal | `pre.terminal-panel` (`#panel-perfil`, `#panel-arquitetura`, `#panel-stack`) |
| Mensagem do "Executar" | atributo `data-output` de cada `pre.terminal-panel` |
| Tags de stack do terminal | `div.terminal-stack` |
| Especialidades | `section#especialidades` → `article.card` |
| Projetos | `section#projetos` → `article.card.project` |
| Detalhes de arquitetura | `dialog#modal-lumus` e `dialog#modal-payments` |
| Experiência | `section#experiencia` → `article.timeline-item` |
| E-mail | `section#contato` — no `href="mailto:…"`, no texto e no `data-copy` do `#copy-email` |
| LinkedIn | `section#contato` → `a.contact-item.linkedin` |
| Foto de perfil | arquivo `assets/img/perfil.jpg` (ver seção 3.7) |
| Nome, cargo e status do hero | `div.identity` |
| Cores | Variáveis em `:root[data-theme="classic"]` e `:root[data-theme="spatial"]` |
| Tema padrão | atributo `data-theme` na tag `<html>` |

**Novo projeto:** copie um `article.card.project`, copie um `dialog.modal` com um novo `id` e aponte os botões `data-modal="…"` para esse `id`.

Depois de editar, teste localmente (seção 1.3) e publique com `npm run deploy`.

---

## 7. Pontos de atenção

- **Números de impacto:** "Redução de 74%", "99.98% de consistência" e "SLA 99.95%" vieram dos dados do modelo `new-landing-page`. Confirme que refletem resultados reais.
- **Fontes externas:** a página depende do Google Fonts; sem conexão com ele, usa as fontes do sistema.
- **Ano do rodapé** é fixo (2026) e precisa ser atualizado manualmente.
- **Sem favicon nem imagem de compartilhamento** (`og:image`). A foto já é servida em `/assets/img/perfil.jpg` e pode virar `og:image`, mas a tag exige a URL completa do domínio publicado.
- **Selo "Disponível para projetos"** é texto fixo. Remova ou troque o `span.identity-status` quando não estiver aceitando projetos.
- **README** cita PHP e jQuery como tecnologias do projeto; elas se referem ao perfil profissional, não à página.
- Não há `.gitignore`: `node_modules/`, `.wrangler/` e os arquivos locais aparecem como não rastreados no git.

---

## 8. Histórico de modificações

| Data | Mudança | Arquivos |
|---|---|---|
| 29/10/2026 | Foto de perfil adicionada ao hero (cartão de identidade com status) e ao contato. O selo "Desenvolvedor Full Stack" do hero foi substituído pelo cartão e o CSS `.eyebrow`, que ficou sem uso, foi removido | `index.html` |
| 29/10/2026 | Pasta `assets/img/` criada com a foto original e a versão otimizada | `assets/img/perfil-original.jpg`, `assets/img/perfil.jpg` |
| 29/10/2026 | Worker passou a servir `/assets/img/perfil.jpg`, com regra `Data` para `.jpg` no Wrangler | `index.js`, `wrangler.toml`, `index.local.js`, `wrangler.local.toml` |
| 29/10/2026 | Documentação atualizada para o novo layout espacial | `DOCUMENTACAO.md` |
| 29/10/2026 | Nova versão espacial do layout | `index.html` |
