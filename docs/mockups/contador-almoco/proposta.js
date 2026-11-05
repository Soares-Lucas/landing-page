// Só o JavaScript novo da proposta. Roda depois do script do index.html.
// Na implementação: o HTML abaixo (card, modais e ícones) vai direto para o <body> do index.html,
// e as funções das abas e das demos vão para o <script> do fim, depois dos modais.
//
// O desenho, pelas decisões de 2026-11-04:
// D1 as demos abrem num modal; D2 um card só, com abas, e o outro projeto sempre à vista;
// D4 o tempo a 60×; D5 o PIN entra na demo, com o "PIN versão de teste" sugerido; D6 sem links por enquanto.
// Rodada 2: card mais baixo (D8, D13), seletor de demo no modal (D12) e Baixar em todo projeto, ainda sem baixar (D11).

(function () {
  var PARADO = !!(window.MOCKUP_PARAMS && window.MOCKUP_PARAMS.parado);

  // --- 1. Ícones novos (no index.html, entram no sprite) -------------------------------------
  document.querySelector('body > svg').insertAdjacentHTML('beforeend',
    '<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></symbol>' +
    '<symbol id="i-rotate" viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></symbol>' +
    '<symbol id="i-alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></symbol>' +
    '<symbol id="i-utensils" viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></symbol>' +
    '<symbol id="i-key" viewBox="0 0 24 24"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/></symbol>' +
    '<symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol>' +
    '<symbol id="i-pause" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></symbol>' +
    '<symbol id="i-help" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/></symbol>' +
    '<symbol id="i-battery" viewBox="0 0 24 24"><rect x="2" y="7" width="16" height="10" rx="2"/><path d="M22 11v2M6 11v2"/></symbol>' +
    '<symbol id="i-maximize" viewBox="0 0 24 24"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></symbol>' +
    '<symbol id="i-bell-off" viewBox="0 0 24 24"><path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7M10.3 21a1.94 1.94 0 0 0 3.4 0M2 2l20 20"/></symbol>' +
    '<symbol id="i-compass" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/></symbol>' +
    '<symbol id="i-download" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></symbol>');

  // --- 1b. Botão Baixar (D11): todo projeto tem um. Por enquanto não baixa: avisa que vem em breve
  // (APK e Google Play) e, quando o projeto tem demo, oferece testar a demo no lugar.
  function baixar(nome, demo) {
    return '<button class="dl-btn" type="button" aria-disabled="true" data-baixar="' + nome + '"' + (demo ? ' data-baixar-demo="' + demo + '"' : '') + '>' +
        '<svg class="icon"><use href="#i-download"/></svg><span>Baixar</span><span class="dl-breve mono">em breve</span>' +
      '</button>';
  }
  // "Ver mais sobre o projeto" (D14): leva à landing page de cada projeto, em /projetos/<slug>.
  // Enquanto a página não existe, o clique avisa que vem em breve (como o Baixar) e não sai daqui.
  // O Afinuvo já tem a página (a tela inicial do app em c:/pifhos), copiada para projetos/afinuvo/
  // pelo roteiro/copiar-afinuvo.mjs: o link abre de verdade. No site, o endereço é /projetos/afinuvo.
  // Dentro do quadro do mockup (iframe), abre na janela inteira, como abriria no site.
  var PAGINAS = { afinuvo: 'projetos/afinuvo/index.html' };
  function verMais(nome, slug, demo) {
    var alvo = window.top !== window ? ' target="_top"' : '';
    if (PAGINAS[slug]) {
      return '<a class="ver-mais" href="' + PAGINAS[slug] + '" data-endereco="/projetos/' + slug + '"' + alvo + '>' +
          'Ver mais sobre o projeto<svg class="icon"><use href="#i-arrow-right"/></svg></a>';
    }
    return '<a class="ver-mais" href="/projetos/' + slug + '" data-pagina="' + nome + '"' + (demo ? ' data-pagina-demo="' + demo + '"' : '') + '>' +
        'Ver mais sobre o projeto<svg class="icon"><use href="#i-arrow-right"/></svg></a>';
  }
  var SLUGS = { 'Lumus Data Engine': 'lumus', 'Integrações de pagamento': 'integracoes-pagamento' };
  // Os dois cards de hoje ganham o "Ver mais" depois da descrição e o Baixar ao lado de
  // "Detalhes técnicos" (no index.html, direto no HTML).
  document.querySelectorAll('#projetos .projects-grid > .card.project').forEach(function (card) {
    var pe = card.querySelector('.project-foot'), link = pe.querySelector('.link-btn'), nome = card.querySelector('h3').textContent;
    card.querySelector('.card-desc').insertAdjacentHTML('afterend', verMais(nome, SLUGS[nome]));
    var grupo = document.createElement('div'); grupo.className = 'pf-acoes';
    grupo.innerHTML = baixar(nome); pe.appendChild(grupo); grupo.appendChild(link);
  });

  // --- 2. O card "Teste ao vivo": um card largo, duas abas -----------------------------------
  function info(o) {
    // Sem a linha do ícone e do "Ver Arquitetura" (D13): a aba já mostra o ícone, e o
    // "Detalhes técnicos" do rodapé abre o mesmo modal.
    return '<div class="sc-info">' +
        '<h3 id="' + o.id + '-title">' + o.nome + '</h3>' +
        '<p class="card-desc">' + o.desc + '</p>' +
        verMais(o.nome, o.slug, 'modal-demo-' + o.id) +
        '<div class="impact mono">' +
          '<div class="impact-label"><svg class="icon"><use href="#i-activity"/></svg><span>Status do Projeto:</span></div>' +
          '<div>' + o.status + '</div>' +
        '</div>' +
        '<div class="project-foot">' +
          '<div class="chip-list mono">' + o.chips.map(function (c) { return '<span class="chip">' + c + '</span>'; }).join('') + '</div>' +
          '<button class="link-btn" type="button" data-modal="modal-' + o.id + '">Detalhes técnicos →</button>' +
        '</div>' +
      '</div>';
  }
  // A vitrine: uma prévia parada da demo (só imagem) e o botão que abre o modal.
  function vitrine(o) {
    return '<div class="sc-vitrine">' +
        '<div class="demo sc-poster' + (o.id === 'afinuvo' ? ' demo-afinuvo' : '') + '" data-tom="' + o.tom + '" aria-hidden="true" data-demo="modal-demo-' + o.id + '">' + o.poster + '</div>' +
        '<div class="sc-acoes">' +
          '<button class="sc-testar" type="button" data-demo="modal-demo-' + o.id + '"><svg class="icon"><use href="#i-play"/></svg>Testar a demo<span class="sc-tempo mono">· 1 min</span></button>' +
          baixar(o.nome, 'modal-demo-' + o.id) +
        '</div>' +
        '<p class="sc-passos mono">' + o.passos + '</p>' +
      '</div>';
  }
  // O convite para o outro projeto (D8) numa linha só: menos altura, a mesma curiosidade.
  // Sem contagem ("1 de 2"): o card fala em "alguns projetos" e pode crescer sem mudar o texto.
  function proximo(o, outro) {
    return '<div class="sc-next">' +
        '<button class="sc-outro" type="button" data-aba="' + outro.id + '">' +
          '<span class="sc-outro-txt"><small class="mono">Também dá para testar</small> <strong>' + outro.nome + '</strong> <span>' + outro.isca + '</span></span>' +
          '<svg class="icon sc-seta"><use href="#i-arrow-right"/></svg>' +
        '</button>' +
      '</div>';
  }

  var P = {
    contador: {
      id: 'contador', slug: 'contador-almoco', nome: 'Contador de Almoço', curto: 'Contador', icone: 'i-clock', tom: 'prepare',
      aba: 'Pontualidade no intervalo',
      isca: 'Quanto você passa do horário de almoço? Descubra em 1 minuto.',
      desc: 'Aplicação web pessoal para registrar o início e o retorno do intervalo, com contador regressivo e histórico confiável de pontualidade. O servidor é a fonte oficial dos horários.',
      status: 'MVP funcionando: iniciar, acompanhar e registrar o retorno com PIN (fase 4 de 6)',
      chips: ['Laravel 13', 'Livewire 4', 'Alpine.js', 'Tailwind', 'MySQL', 'Docker'],
      passos: 'Iniciar → Acompanhar → Retornar com PIN',
      poster:
        '<p class="demo-label mono">Retorno previsto</p><p class="demo-clock mono">13:17:00</p>' +
        '<p class="demo-count mono">00:04:12</p>' +
        '<p class="demo-chip"><svg class="icon"><use href="#i-alert"/></svg>Prepare-se para retornar</p>' +
        '<div class="demo-progress"><span style="width:93%"></span></div>',
    },
    afinuvo: {
      id: 'afinuvo', slug: 'afinuvo', nome: 'Afinuvo', curto: 'Afinuvo', icone: 'i-target', tom: 'ok',
      aba: 'Hábitos sem culpa',
      isca: 'E se faltar a um hábito virasse um ajuste no plano, e não culpa?',
      desc: 'App de hábitos que trata a falta como dado, não como fracasso. Cada hábito tem propósito, plano e sessão de foco; quando algo não sai, uma reflexão sem culpa vira hipótese e ajuste no plano.',
      status: 'Protótipo funcionando: as 5 dimensões (Propósito, Planejamento, Execução, Reflexão e Aprendizado), com dados no navegador',
      chips: ['React 19', 'TypeScript', 'Vite', 'Tailwind 4', 'Motion'],
      passos: 'Executar → Refletir → Ajustar o plano',
      poster:
        '<p class="demo-label mono">Hábito de hoje</p><p class="dd-titulo">Estudar Laravel</p>' +
        '<div class="dd-anel"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="dd-trilho"/><circle cx="60" cy="60" r="52" class="dd-progresso" style="stroke-dashoffset:162"/></svg>' +
          '<div class="dd-anel-txt"><span class="dd-tempo mono">12:36</span><span class="demo-label mono">Em foco</span></div></div>',
    },
  };

  function aba(o, ativa) {
    return '<button class="sc-tab" type="button" role="tab" id="aba-' + o.id + '" aria-controls="painel-' + o.id + '" aria-selected="' + ativa + '" tabindex="' + (ativa ? 0 : -1) + '" data-aba="' + o.id + '">' +
        '<span class="sc-tab-ico"><svg class="icon"><use href="#' + o.icone + '"/></svg></span>' +
        '<span class="sc-tab-txt"><strong>' + o.nome + '</strong><small>' + o.aba + '</small></span>' +
        '<span class="sc-novo mono" aria-hidden="true"><span class="cw-dot"></span>teste também</span>' +
      '</button>';
  }
  function painel(o, outro, ativa) {
    return '<div class="sc-painel" role="tabpanel" id="painel-' + o.id + '" aria-labelledby="aba-' + o.id + '"' + (ativa ? '' : ' hidden') + '>' +
        '<div class="sc-grid">' + info(o) + vitrine(o) + '</div>' + proximo(o, outro) +
      '</div>';
  }

  var card =
    '<article class="card project project-wide showcase" id="projeto-demos" aria-labelledby="demos-title">' +
      '<div class="sc-head">' +
        '<div><p class="cw-badge mono"><span class="cw-dot" aria-hidden="true"></span>Teste ao vivo · sem cadastro</p>' +
        '<h3 class="sc-title" id="demos-title">Alguns projetos disponíveis para teste</h3></div>' +
        '<div class="sc-tabs" role="tablist" aria-label="Projetos com demo">' + aba(P.contador, true) + aba(P.afinuvo, false) + '</div>' +
      '</div>' +
      painel(P.contador, P.afinuvo, true) + painel(P.afinuvo, P.contador, false) +
    '</article>';
  document.querySelector('#projetos .projects-grid').insertAdjacentHTML('beforeend', card);

  // --- 3. Modais de arquitetura (mesmo desenho dos de hoje) ----------------------------------
  function arquitetura(id, nome, visao, fluxo, padroes, itens, status) {
    return '<dialog class="modal" id="modal-' + id + '" aria-labelledby="modal-' + id + '-title">' +
      '<div class="modal-head"><div class="modal-title"><span class="modal-badge"><svg class="icon"><use href="#i-cpu"/></svg></span>' +
        '<div><h3 id="modal-' + id + '-title">' + nome + '</h3><p class="mono">Arquitetura de Engenharia</p></div></div>' +
        '<button class="modal-close" type="button" data-close aria-label="Fechar"><svg class="icon"><use href="#i-x"/></svg></button></div>' +
      '<div class="modal-body">' +
        '<div><h4 class="mono">Visão Geral</h4><p>' + visao + '</p></div>' +
        '<div class="flow mono"><div class="flow-label">Fluxo Arquitetural</div><div class="flow-steps">' +
          '<div class="flow-step"><small>' + fluxo[0][0] + '</small><strong>' + fluxo[0][1] + '</strong></div><svg class="icon"><use href="#i-arrow-right"/></svg>' +
          '<div class="flow-step mid"><small>' + fluxo[1][0] + '</small><strong>' + fluxo[1][1] + '</strong></div><svg class="icon"><use href="#i-arrow-right"/></svg>' +
          '<div class="flow-step end"><small>' + fluxo[2][0] + '</small><strong>' + fluxo[2][1] + '</strong></div></div></div>' +
        '<div><h4 class="mono">Padrões Técnicos</h4><p>' + padroes + '</p><ul class="checklist">' +
          itens.map(function (t) { return '<li><svg class="icon"><use href="#i-check-circle"/></svg><span>' + t + '</span></li>'; }).join('') +
        '</ul></div>' +
        '<div class="success"><svg class="icon"><use href="#i-activity"/></svg><div><small class="mono">Status do Projeto</small><strong>' + status + '</strong></div></div>' +
      '</div>' +
      '<div class="modal-foot"><button class="modal-ok" type="button" data-close>Fechar</button></div>' +
    '</dialog>';
  }

  // --- 4. Modais das demos: a moldura .demo é o próprio modal --------------------------------
  function moldura(o, passos, telas) {
    // No topo, a troca de demo (D12): passar de um projeto ao outro sem fechar o modal.
    return '<dialog class="modal modal-demo" id="modal-demo-' + o.id + '" aria-label="Demo do ' + o.nome + '">' +
      '<div class="demo' + (o.id === 'afinuvo' ? ' demo-afinuvo' : '') + '" data-tom="ok">' +
        '<div class="demo-bar">' +
          '<div class="demo-seg demo-troca" role="group" aria-label="Escolher a demo">' +
            [P.contador, P.afinuvo].map(function (x) {
              return '<button type="button" data-trocar="' + x.id + '" aria-pressed="' + (x.id === o.id) + '"><svg class="icon"><use href="#' + x.icone + '"/></svg>' + x.curto + '</button>';
            }).join('') +
          '</div>' +
          '<div class="demo-tools">' +
            '<div class="demo-seg" role="group" aria-label="Velocidade do tempo">' +
              '<button type="button" data-vel="1" aria-pressed="false" title="Tempo real">1×</button>' +
              '<button type="button" data-vel="60" aria-pressed="true" title="1 minuto por segundo">60×</button>' +
            '</div>' +
            '<button class="demo-reset" type="button" data-acao="reiniciar" aria-label="Reiniciar a demonstração" title="Reiniciar"><svg class="icon"><use href="#i-rotate"/></svg></button>' +
            '<button class="demo-reset" type="button" data-close aria-label="Fechar a demonstração" title="Fechar"><svg class="icon"><use href="#i-x"/></svg></button>' +
          '</div>' +
        '</div>' +
        '<ol class="demo-steps mono" aria-label="Etapas">' + passos.map(function (p, i) { return '<li data-passo="' + p[0] + '"><span>' + (i + 1) + '</span>' + p[1] + '</li>'; }).join('') + '</ol>' +
        '<div class="demo-screen">' + telas + '</div>' +
        '<p class="demo-privacy">Nada é enviado nem salvo: ao sair da página, a demo recomeça.</p>' +
      '</div>' +
    '</dialog>';
  }
  function fim(outro) {
    return '<div class="demo-fim">' +
        '<button class="demo-cta demo-cta-2" type="button" data-acao="reiniciar"><svg class="icon"><use href="#i-rotate"/></svg>Testar de novo</button>' +
        '<button class="demo-cruzar" type="button" data-trocar="' + outro.id + '"><svg class="icon"><use href="#' + outro.icone + '"/></svg><span>Agora teste o <strong>' + outro.nome + '</strong></span><svg class="icon"><use href="#i-arrow-right"/></svg></button>' +
        '<a class="link-btn" href="#contato" data-close>Quero algo assim no meu time →</a>' +
      '</div>';
  }

  var telasContador =
    '<div class="demo-view" data-view="inicio">' +
      '<p class="demo-label mono">Agora</p>' +
      '<p class="demo-clock mono" data-campo="agora">12:17:00</p>' +
      '<div class="demo-dur">' +
        '<span class="demo-label mono" id="demo-dur-rot">Duração</span>' +
        '<div class="demo-seg" role="group" aria-labelledby="demo-dur-rot">' +
          '<button type="button" data-dur="30" aria-pressed="false">30 min</button>' +
          '<button type="button" data-dur="45" aria-pressed="false">45 min</button>' +
          '<button type="button" data-dur="60" aria-pressed="true">60 min</button>' +
        '</div>' +
      '</div>' +
      '<p class="demo-prev">Se iniciar agora, retorno às <strong class="mono" data-campo="previa">13:17</strong></p>' +
      '<button class="demo-cta" type="button" data-acao="iniciar"><svg class="icon"><use href="#i-utensils"/></svg>Iniciar almoço</button>' +
    '</div>' +
    '<div class="demo-view" data-view="almoco" hidden>' +
      '<p class="demo-label mono">Retorno previsto</p>' +
      '<p class="demo-clock mono" data-campo="previsto">13:17:00</p>' +
      '<p class="demo-count mono" data-campo="contador" aria-live="off">00:42:36</p>' +
      '<p class="demo-chip" role="status"><svg class="icon" data-campo="chip-icone"><use href="#i-check-circle"/></svg><span data-campo="chip">No intervalo · tempo restante</span></p>' +
      '<div class="demo-progress" aria-hidden="true"><span data-campo="barra"></span></div>' +
      '<button class="demo-cta" type="button" data-acao="retornar"><svg class="icon"><use href="#i-check"/></svg>Registrar retorno</button>' +
    '</div>' +
    '<div class="demo-view" data-view="pin" hidden>' +
      '<p class="demo-label mono">Confirme o retorno</p>' +
      '<p class="demo-clock mono" data-campo="pin-agora">13:20:12</p>' +
      '<label class="dp-rot" for="demo-pin">PIN de 6 dígitos</label>' +
      '<input class="dp-campo mono" id="demo-pin" type="text" inputmode="numeric" autocomplete="off" maxlength="6" pattern="[0-9]*" aria-describedby="dp-dica dp-erro" placeholder="••••••">' +
      '<p class="dp-erro" id="dp-erro" role="alert" data-campo="pin-erro"></p>' +
      '<div class="dp-dica" id="dp-dica"><svg class="icon"><use href="#i-key"/></svg><span>PIN versão de teste: <strong class="mono">123456</strong></span><button type="button" data-acao="usar-pin">Usar</button></div>' +
      '<button class="demo-cta" type="button" data-acao="confirmar"><svg class="icon"><use href="#i-check"/></svg>Confirmar retorno</button>' +
      '<button class="link-btn dd-voltar" type="button" data-acao="voltar">← Voltar ao contador</button>' +
    '</div>' +
    '<div class="demo-view" data-view="retorno" hidden>' +
      '<p class="demo-result" data-campo="resultado"><svg class="icon"><use href="#i-check-circle"/></svg><span>Dentro do horário</span></p>' +
      '<dl class="demo-dados mono">' +
        '<div><dt>Início</dt><dd data-campo="r-inicio">12:17:00</dd></div>' +
        '<div><dt>Previsto</dt><dd data-campo="r-previsto">13:17:00</dd></div>' +
        '<div><dt>Retorno</dt><dd data-campo="r-retorno">13:20:12</dd></div>' +
        '<div><dt>Duração</dt><dd data-campo="r-duracao">63m 12s</dd></div>' +
        '<div class="demo-dif"><dt>Diferença</dt><dd data-campo="r-dif">+3m 12s</dd></div>' +
      '</dl>' +
      fim(P.afinuvo) +
    '</div>';

  var BARREIRAS = [
    ['fatigue', 'i-battery', 'Cansaço / pouca energia'],
    ['oversized', 'i-maximize', 'Meta grande demais'],
    ['forgot', 'i-bell-off', 'Esqueci / sem gatilho'],
    ['friction', 'i-compass', 'Não sabia por onde ir'],
  ];
  var telasAfinuvo =
    '<div class="demo-view" data-view="executar">' +
      '<div class="dd-habito"><p class="demo-label mono">Hábito de hoje</p><p class="dd-titulo">Estudar Laravel</p><p class="dd-plano mono" data-campo="plano">25 min · depois do jantar</p></div>' +
      '<div class="dd-anel"><svg aria-hidden="true" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" class="dd-trilho"/><circle cx="60" cy="60" r="52" class="dd-progresso" data-campo="anel"/></svg>' +
        '<div class="dd-anel-txt"><span class="dd-tempo mono" data-campo="tempo">25:00</span><span class="demo-label mono" data-campo="estado" aria-live="polite">Pronto</span></div></div>' +
      '<button class="demo-cta" type="button" data-acao="foco"><svg class="icon" data-campo="foco-icone"><use href="#i-play"/></svg><span data-campo="foco-txt">Iniciar foco</span></button>' +
      '<div class="dd-duplo">' +
        '<button class="dd-sec dd-ok" type="button" data-acao="concluir"><svg class="icon"><use href="#i-check-circle"/></svg>Concluí</button>' +
        '<button class="dd-sec dd-dif" type="button" data-acao="dificuldade"><svg class="icon"><use href="#i-help"/></svg>Tive dificuldade</button>' +
      '</div>' +
    '</div>' +
    '<div class="demo-view" data-view="refletir" hidden>' +
      '<p class="demo-label mono">Reflexão sem culpa</p>' +
      '<p class="dd-pergunta" id="dd-pergunta">O que dificultou hoje?</p>' +
      '<p class="demo-hint">Não é falta de caráter: o plano encontrou uma barreira.</p>' +
      '<div class="dd-opcoes" role="group" aria-labelledby="dd-pergunta">' +
        BARREIRAS.map(function (b) { return '<button type="button" data-barreira="' + b[0] + '"><svg class="icon"><use href="#' + b[1] + '"/></svg><span>' + b[2] + '</span></button>'; }).join('') +
      '</div>' +
      '<button class="link-btn dd-voltar" type="button" data-acao="voltar">← Voltar ao foco</button>' +
    '</div>' +
    '<div class="demo-view" data-view="ajustar" hidden>' +
      '<p class="demo-chip"><svg class="icon"><use href="#i-sparkles"/></svg><span data-campo="h-conf">Hipótese · 94% de confiança</span></p>' +
      '<p class="dd-pergunta" data-campo="h-titulo">Meta grande demais</p>' +
      '<p class="dd-obs" data-campo="h-obs"></p>' +
      '<div class="dd-troca mono"><div><small>Antes</small><span data-campo="h-antes"></span></div><svg class="icon" aria-hidden="true"><use href="#i-arrow-right"/></svg><div class="dd-depois"><small>Depois</small><span data-campo="h-depois"></span></div></div>' +
      '<button class="demo-cta" type="button" data-acao="aplicar"><svg class="icon"><use href="#i-check"/></svg>Aplicar ajuste</button>' +
      '<div data-campo="aplicado" hidden><p class="demo-result" role="status"><svg class="icon"><use href="#i-check-circle"/></svg><span>Plano atualizado</span></p>' + fim(P.contador) + '</div>' +
    '</div>' +
    '<div class="demo-view" data-view="concluido" hidden>' +
      '<p class="demo-result"><svg class="icon"><use href="#i-check-circle"/></svg><span>Sessão concluída</span></p>' +
      '<dl class="demo-dados mono">' +
        '<div><dt>Hábito</dt><dd>Estudar Laravel</dd></div>' +
        '<div><dt>Foco</dt><dd data-campo="c-foco">25 min</dd></div>' +
        '<div><dt>Sequência</dt><dd>4 dias</dd></div>' +
        '<div><dt>Próxima</dt><dd>Amanhã</dd></div>' +
      '</dl>' +
      fim(P.contador) +
    '</div>';

  document.querySelector('dialog.modal:last-of-type').insertAdjacentHTML('afterend',
    arquitetura('contador', 'Contador de Almoço',
      'Registro pessoal do intervalo de almoço que responde, com horários do servidor: a que horas saí, a que horas voltei e quanto passei do combinado.',
      [['Navegador', 'Alpine.js (contador)'], ['Aplicação', 'Laravel 13 + Livewire 4'], ['Registro', 'MySQL 8.4']],
      'Monólito Laravel em Docker. O contador roda no navegador sem requisição por segundo; o horário oficial de início e de retorno é sempre o do servidor.',
      ['Correção da diferença entre o relógio do servidor e o do aparelho', 'Retorno confirmado por PIN guardado como hash, com limite de tentativas', 'Estados por cor, texto e ícone: nunca só a cor', 'Ambiente Docker Compose com containers Debian'],
      'Fase 4 de 6 concluída: o fluxo principal funciona; histórico e relatórios a seguir') +
    arquitetura('afinuvo', 'Afinuvo',
      'Sistema de autorregulação em cinco dimensões: Propósito (por que o hábito importa), Planejamento (se-então), Execução (sessão de foco), Reflexão (o que dificultou, sem culpa) e Aprendizado (hipóteses que recalibram o plano).',
      [['Interface', 'React 19 + Tailwind 4'], ['Estado', 'Hooks + regras do ciclo'], ['Dados', 'localStorage']],
      'SPA em TypeScript com Vite, sem backend nem login. Os tipos descrevem o ciclo inteiro (hábito, sessão, reflexão e hipótese), e aplicar uma hipótese muda o plano do hábito.',
      ['Linguagem sem punição: a falta abre uma investigação, não um alerta vermelho', 'Visão híbrida: painel no computador e simulador de celular lado a lado', 'Alvos de toque de 44 px e estados com texto, não só cor', 'Tipagem estrita conferida no build (tsc --noEmit)'],
      'Protótipo navegável das 5 dimensões; contas e sincronização a seguir') +
    moldura(P.contador, [['inicio', 'Iniciar'], ['almoco', 'Acompanhar'], ['retorno', 'Retornar']], telasContador) +
    moldura(P.afinuvo, [['executar', 'Executar'], ['refletir', 'Refletir'], ['ajustar', 'Ajustar']], telasAfinuvo));

  // No index.html o código de hoje já liga todo [data-modal] e [data-close]; aqui o HTML chegou
  // depois, então os ouvintes são repetidos só para o que é novo.
  ['modal-contador', 'modal-afinuvo', 'modal-demo-contador', 'modal-demo-afinuvo'].forEach(function (id) {
    var dlg = document.getElementById(id);
    dlg.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { dlg.close(); }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  });
  document.querySelectorAll('#projeto-demos [data-modal]').forEach(function (b) {
    b.addEventListener('click', function () { document.getElementById(b.dataset.modal).showModal(); });
  });

  // --- 5. Abas e botões que abrem as demos (vai para o <script> do index.html) ---------------
  var cardEl = document.getElementById('projeto-demos');
  var tabs = [].slice.call(cardEl.querySelectorAll('.sc-tab'));
  function mostrarAba(id, focar) {
    tabs.forEach(function (t) {
      var on = t.dataset.aba === id;
      t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      if (on && focar) t.focus();
    });
  }
  cardEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-aba]'); if (b) return mostrarAba(b.dataset.aba, b.classList.contains('sc-outro'));
    var d = e.target.closest('[data-demo]'); if (d) document.getElementById(d.dataset.demo).showModal();
  });
  cardEl.querySelector('.sc-tabs').addEventListener('keydown', function (e) {
    var i = tabs.indexOf(document.activeElement); if (i < 0) return;
    var j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
    if (j === null) return;
    e.preventDefault(); mostrarAba(tabs[(j + tabs.length) % tabs.length].dataset.aba, true);
  });
  // "Agora teste o …": fecha esta demo, mostra a aba do outro projeto e abre a demo dele.
  // A troca do topo do modal faz o mesmo; o foco vai para a troca do modal novo, no projeto aberto.
  function trocarDemo(id) {
    var aberto = document.querySelector('dialog.modal-demo[open]'); if (aberto) aberto.close();
    mostrarAba(id);
    var dlg = document.getElementById('modal-demo-' + id); dlg.showModal();
    dlg.querySelector('.demo-troca [aria-pressed="true"]').focus();
  }
  document.querySelectorAll('[data-trocar]').forEach(function (b) {
    b.addEventListener('click', function () { if (b.getAttribute('aria-pressed') !== 'true') trocarDemo(b.dataset.trocar); });
  });

  // --- 5b. Aviso do Baixar (vai para o <script> do index.html) -------------------------------
  // Um aviso no pé da tela, com Fechar, que some sozinho em 6 s. Nada é baixado.
  document.body.insertAdjacentHTML('beforeend',
    '<div class="dl-aviso" id="dl-aviso" role="status" hidden>' +
      '<span class="dl-aviso-ico"><svg class="icon"><use href="#i-download" data-campo="dl-icone"/></svg></span>' +
      '<p><strong data-campo="dl-titulo">Download em breve</strong><span data-campo="dl-texto">O app vai sair em APK e na Google Play.</span></p>' +
      '<button class="dl-aviso-demo" type="button" hidden>Testar a demo</button>' +
      '<button class="dl-aviso-x" type="button" aria-label="Fechar o aviso"><svg class="icon"><use href="#i-x"/></svg></button>' +
    '</div>');
  var aviso = document.getElementById('dl-aviso'), avisoDemo = aviso.querySelector('.dl-aviso-demo'), avisoTempo = 0, avisoDe = null;
  // O mesmo aviso serve ao Baixar e ao "Ver mais" enquanto a página do projeto não existe.
  function avisar(b) {
    avisoDe = b;
    var pagina = 'pagina' in b.dataset, demo = pagina ? b.dataset.paginaDemo : b.dataset.baixarDemo;
    aviso.querySelector('[data-campo="dl-icone"]').setAttribute('href', pagina ? '#i-arrow-up-right' : '#i-download');
    aviso.querySelector('[data-campo="dl-titulo"]').textContent = pagina ? b.dataset.pagina + ': página em breve' : b.dataset.baixar + ': download em breve';
    aviso.querySelector('[data-campo="dl-texto"]').textContent = pagina ? 'A página do projeto, com mais detalhes, está sendo preparada.' : 'O app vai sair em APK e na Google Play.';
    avisoDemo.hidden = !demo; avisoDemo.dataset.demo = demo || '';
    aviso.hidden = false;
    clearTimeout(avisoTempo); if (!PARADO) avisoTempo = setTimeout(fecharAviso, 6000);
  }
  function fecharAviso(devolver) { aviso.hidden = true; if (devolver && avisoDe) avisoDe.focus(); }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-baixar], [data-pagina]'); if (!b) return;
    if (b.dataset.pagina) e.preventDefault(); // no mockup, a página ainda não existe
    avisar(b);
  });
  aviso.querySelector('.dl-aviso-x').addEventListener('click', function () { fecharAviso(true); });
  avisoDemo.addEventListener('click', function () { fecharAviso(); document.getElementById(avisoDemo.dataset.demo).showModal(); });
  aviso.addEventListener('mouseenter', function () { clearTimeout(avisoTempo); });
  aviso.addEventListener('focusin', function () { clearTimeout(avisoTempo); });

  // --- 6. Relógio simulado, comum às duas demos: avança "vel" vezes mais rápido que o real ---
  function relogio() {
    var r = { vel: 60, base: { real: Date.now(), sim: Date.now() } };
    r.agora = function () { return r.base.sim + (Date.now() - r.base.real) * (PARADO ? 0 : r.vel); };
    r.rebase = function (sim) { r.base = { real: Date.now(), sim: sim == null ? r.agora() : sim }; };
    return r;
  }
  function dois(n) { return String(n).padStart(2, '0'); }
  function ligarVel(raiz, rel, depois) {
    raiz.querySelectorAll('[data-vel]').forEach(function (b) {
      b.addEventListener('click', function () { rel.rebase(); rel.vel = +b.dataset.vel; if (depois) depois(); desenhar(); });
    });
    function desenhar() { raiz.querySelectorAll('[data-vel]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.vel === rel.vel)); }); }
    desenhar();
  }
  function passos(raiz, ordem, i, tudoFeito) {
    raiz.querySelectorAll('[data-passo]').forEach(function (li, k) {
      li.classList.toggle('feito', k < i || tudoFeito);
      if (k === i && !tudoFeito) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }

  // --- 7. Demo do Contador --------------------------------------------------------------------
  (function () {
    var dlg = document.getElementById('modal-demo-contador');
    var raiz = dlg.querySelector('.demo');
    var $ = function (c) { return raiz.querySelector('[data-campo="' + c + '"]'); };
    var rel = relogio(), agora = rel.agora;
    var PIN = '123456';
    var s = { fase: 'inicio', dur: 60, inicio: 0, retorno: 0 };
    var ultimoTom = '';
    var campo = raiz.querySelector('#demo-pin');

    function hora(t, seg) { var d = new Date(t); return dois(d.getHours()) + ':' + dois(d.getMinutes()) + (seg === false ? '' : ':' + dois(d.getSeconds())); }
    function hms(ms) { var x = Math.floor(Math.abs(ms) / 1000); return dois(Math.floor(x / 3600)) + ':' + dois(Math.floor(x / 60) % 60) + ':' + dois(x % 60); }
    function curto(ms) { var x = Math.round(Math.abs(ms) / 1000); return Math.floor(x / 60) + 'm ' + dois(x % 60) + 's'; }
    function extenso(ms) { var x = Math.round(Math.abs(ms) / 1000), m = Math.floor(x / 60), sg = x % 60; return (m ? m + ' min' : '') + (m && sg ? ' ' : '') + (sg || !m ? sg + ' s' : ''); }
    var TONS = {
      ok: ['i-check-circle', 'No intervalo · tempo restante'],
      breve: ['i-clock', 'Retorno em breve'],
      prepare: ['i-alert', 'Prepare-se para retornar'],
      excedido: ['i-alert', 'Prazo atingido · tempo acima'],
    };

    function desenhar() {
      var t = agora();
      raiz.querySelectorAll('[data-view]').forEach(function (v) { v.hidden = v.dataset.view !== s.fase; });
      passos(raiz, null, { inicio: 0, almoco: 1, pin: 2, retorno: 2 }[s.fase], false);
      raiz.querySelectorAll('[data-dur]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.dur === s.dur)); });
      var tom = 'ok', prev = s.inicio + s.dur * 60000;
      if (s.fase === 'inicio') {
        $('agora').textContent = hora(t);
        $('previa').textContent = hora(t + s.dur * 60000, false);
      } else if (s.fase === 'almoco' || s.fase === 'pin') {
        var resta = prev - t;
        tom = resta <= 0 ? 'excedido' : resta < 5 * 60000 ? 'prepare' : resta < 10 * 60000 ? 'breve' : 'ok';
        $('previsto').textContent = hora(prev);
        $('contador').textContent = (resta < 0 ? '+' : '') + hms(resta);
        $('barra').style.width = Math.min(100, Math.max(0, (t - s.inicio) / (s.dur * 600))) + '%';
        $('pin-agora').textContent = hora(t);
        if (tom !== ultimoTom) {
          $('chip-icone').querySelector('use').setAttribute('href', '#' + TONS[tom][0]);
          $('chip').textContent = TONS[tom][1];
        }
      } else {
        var dif = s.retorno - prev, acima = dif > 0;
        tom = acima ? 'excedido' : 'ok';
        $('r-inicio').textContent = hora(s.inicio);
        $('r-previsto').textContent = hora(prev);
        $('r-retorno').textContent = hora(s.retorno);
        $('r-duracao').textContent = curto(s.retorno - s.inicio);
        $('r-dif').textContent = (acima ? '+' : '−') + curto(dif);
        var r = $('resultado');
        r.querySelector('use').setAttribute('href', acima ? '#i-alert' : '#i-check-circle');
        r.querySelector('span').textContent = acima ? extenso(dif) + ' acima do limite' : 'Dentro do horário';
      }
      raiz.dataset.tom = tom;
      ultimoTom = tom;
    }
    function focar(sel) { var b = raiz.querySelector('[data-view="' + s.fase + '"] ' + sel); if (b) b.focus({ preventScroll: true }); }
    function erro(msg) { $('pin-erro').textContent = msg; campo.setAttribute('aria-invalid', msg ? 'true' : 'false'); }

    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.dataset.vel) return;
      var a = b.dataset.acao;
      if (b.dataset.dur) { s.dur = +b.dataset.dur; }
      else if (a === 'iniciar') { s.fase = 'almoco'; s.inicio = agora(); ultimoTom = ''; desenhar(); return focar('[data-acao="retornar"]'); }
      else if (a === 'retornar') { s.fase = 'pin'; campo.value = ''; erro(''); desenhar(); return focar('#demo-pin'); }
      else if (a === 'usar-pin') { campo.value = PIN; erro(''); return focar('[data-acao="confirmar"]'); }
      else if (a === 'confirmar') {
        var v = campo.value.trim();
        if (v.length !== 6) { erro('Digite os 6 dígitos do PIN.'); return campo.focus(); }
        if (v !== PIN) { erro('PIN incorreto. Na versão de teste, use 123456.'); campo.select(); return; }
        s.fase = 'retorno'; s.retorno = agora(); desenhar(); return focar('[data-acao="reiniciar"]');
      }
      else if (a === 'voltar') { s.fase = 'almoco'; desenhar(); return focar('[data-acao="retornar"]'); }
      else if (a === 'reiniciar') { s.fase = 'inicio'; ultimoTom = ''; desenhar(); return focar('[data-acao="iniciar"]'); }
      desenhar();
    });
    campo.addEventListener('input', function () { campo.value = campo.value.replace(/\D/g, '').slice(0, 6); if ($('pin-erro').textContent) erro(''); });
    campo.addEventListener('keydown', function (e) { if (e.key === 'Enter') raiz.querySelector('[data-acao="confirmar"]').click(); });
    ligarVel(raiz, rel);

    // Só conta com o modal aberto.
    if (!PARADO) setInterval(function () { if (dlg.open && !document.hidden) desenhar(); }, 250);
    dlg.addEventListener('close', function () { if (s.fase === 'inicio') rel.rebase(Date.now()); });

    // Para o quadro do mockup: põe a demo num estado exato, com o relógio fixo, e abre o modal.
    // ex.: contadorDemo.ir({ fase: 'almoco', inicio: '12:17:00', agora: '13:12:48' })
    function hoje(x) { var p = x.split(':'); return new Date(2026, 10, 4, +p[0], +p[1], +(p[2] || 0)).getTime(); }
    window.contadorDemo = {
      ir: function (o, abrir) {
        s.fase = o.fase || 'inicio'; s.dur = o.dur || 60;
        if (o.inicio) s.inicio = hoje(o.inicio);
        if (o.retorno) s.retorno = hoje(o.retorno);
        rel.rebase(hoje(o.agora || o.retorno || '12:17:00'));
        campo.value = o.pin || ''; erro(o.erro || '');
        ultimoTom = ''; desenhar();
        if (abrir) dlg.showModal();
      },
    };
    window.contadorDemo.ir({ fase: 'inicio', agora: PARADO ? '12:17:00' : hora(Date.now()) });
    if (!PARADO) rel.rebase(Date.now());
  })();

  // --- 8. Demo do Afinuvo --------------------------------------------------------------------
  (function () {
    var dlg = document.getElementById('modal-demo-afinuvo');
    var raiz = dlg.querySelector('.demo');
    var $ = function (c) { return raiz.querySelector('[data-campo="' + c + '"]'); };
    var rel = relogio(), agora = rel.agora;
    var DUR = 25 * 60000, CIRC = 2 * Math.PI * 52;
    var PLANO = '25 min · depois do jantar';
    // Hipóteses no tom do app (src/data/initialData.ts), uma por barreira:
    // [confiança, título, observação, antes, depois, plano depois de aplicar]
    var HIP = {
      fatigue: [89, 'Energia baixa à noite', 'Você cumpre 92% dos hábitos feitos de manhã e 33% dos feitos depois das 20h30.', 'Depois do jantar', 'Às 18h30', '25 min · às 18h30'],
      oversized: [94, 'Meta grande demais', 'Você mantém 88% de adesão em blocos curtos e falta a 75% das sessões longas.', '25 min', '15 min', '15 min · depois do jantar'],
      forgot: [81, 'Gatilho que não acontece', 'Nos dias de falta, o jantar não teve horário fixo e o gatilho não disparou.', 'Depois do jantar', 'Ao fechar o notebook', '25 min · ao fechar o notebook'],
      friction: [86, 'Começo sem passo claro', 'Você começa mais vezes quando o primeiro passo já está escrito no plano.', 'Abrir o curso', 'Rodar os testes (2 min)', '25 min · começa pelos testes'],
    };
    function novo() { return { fase: 'executar', rodando: false, resta: DUR, ult: 0, barreira: 'oversized', aplicado: false }; }
    var s = novo();
    function mmss(ms) { var x = Math.ceil(Math.max(0, ms) / 1000); return dois(Math.floor(x / 60)) + ':' + dois(x % 60); }

    function desenhar() {
      if (s.rodando) {
        var t = agora(); s.resta -= t - s.ult; s.ult = t;
        if (s.resta <= 0) { s.resta = 0; s.rodando = false; s.fase = 'concluido'; }
      }
      raiz.querySelectorAll('[data-view]').forEach(function (v) { v.hidden = v.dataset.view !== s.fase; });
      passos(raiz, null, s.fase === 'concluido' ? 3 : ['executar', 'refletir', 'ajustar'].indexOf(s.fase), s.fase === 'concluido' || (s.fase === 'ajustar' && s.aplicado));
      $('plano').textContent = s.aplicado ? HIP[s.barreira][5] : PLANO;
      var tom = 'ok';
      if (s.fase === 'executar') {
        var meio = s.resta < DUR;
        $('tempo').textContent = mmss(s.resta);
        $('estado').textContent = s.rodando ? 'Em foco' : meio ? 'Pausado' : 'Pronto';
        $('anel').style.strokeDashoffset = String(CIRC * (1 - s.resta / DUR));
        $('foco-icone').querySelector('use').setAttribute('href', s.rodando ? '#i-pause' : '#i-play');
        $('foco-txt').textContent = s.rodando ? 'Pausar' : meio ? 'Retomar foco' : 'Iniciar foco';
      } else if (s.fase === 'refletir') {
        tom = 'refletir';
      } else if (s.fase === 'ajustar') {
        var h = HIP[s.barreira];
        $('h-conf').textContent = 'Hipótese · ' + h[0] + '% de confiança';
        $('h-titulo').textContent = h[1];
        $('h-obs').textContent = h[2];
        $('h-antes').textContent = h[3];
        $('h-depois').textContent = h[4];
        raiz.querySelector('[data-acao="aplicar"]').hidden = s.aplicado;
        $('aplicado').hidden = !s.aplicado;
        tom = s.aplicado ? 'feito' : 'refletir';
      } else {
        $('c-foco').textContent = Math.max(1, Math.round((DUR - s.resta) / 60000)) + ' min';
        tom = 'feito';
      }
      raiz.dataset.tom = tom;
    }
    function focar(sel) { var b = raiz.querySelector('[data-view="' + s.fase + '"] ' + sel); if (b) b.focus({ preventScroll: true }); }

    raiz.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || b.dataset.vel) return;
      var a = b.dataset.acao;
      if (b.dataset.barreira) { s.barreira = b.dataset.barreira; s.aplicado = false; s.fase = 'ajustar'; desenhar(); return focar('[data-acao="aplicar"]'); }
      else if (a === 'foco') { s.rodando = !s.rodando; s.ult = agora(); }
      else if (a === 'concluir') { s.rodando = false; if (s.resta === DUR) s.resta = 0; s.fase = 'concluido'; desenhar(); return focar('[data-acao="reiniciar"]'); }
      else if (a === 'dificuldade') { s.rodando = false; s.fase = 'refletir'; desenhar(); return focar('[data-barreira]'); }
      else if (a === 'voltar') { s.fase = 'executar'; desenhar(); return focar('[data-acao="foco"]'); }
      else if (a === 'aplicar') { s.aplicado = true; desenhar(); return focar('[data-acao="reiniciar"]'); }
      else if (a === 'reiniciar') { s = novo(); desenhar(); return focar('[data-acao="foco"]'); }
      desenhar();
    });
    ligarVel(raiz, rel, function () { s.ult = agora(); });

    // Só conta com o modal aberto; fechar pausa o foco.
    if (!PARADO) setInterval(function () { if (s.rodando && dlg.open && !document.hidden) desenhar(); }, 250);
    dlg.addEventListener('close', function () { if (s.rodando) { s.rodando = false; desenhar(); } });

    // Para o quadro do mockup: um estado exato, com o tempo parado, e o modal aberto.
    // ex.: afinuvoDemo.ir({ fase: 'executar', resta: '12:36', rodando: true }, true)
    window.afinuvoDemo = {
      ir: function (o, abrir) {
        var p = (o.resta || '25:00').split(':');
        s = novo();
        s.fase = o.fase || 'executar'; s.resta = (+p[0] * 60 + +p[1]) * 1000; s.ult = agora();
        s.barreira = o.barreira || 'oversized'; s.aplicado = !!o.aplicado; s.rodando = !!o.rodando;
        desenhar();
        if (abrir) dlg.showModal();
      },
    };
    desenhar();
  })();

  window.demosCard = {
    aba: function (id) { mostrarAba(id); },
    baixar: function (id) { avisar(document.querySelector('#painel-' + id + ' [data-baixar]')); },
    verMais: function (id) { avisar(document.querySelector('#painel-' + id + ' [data-pagina]')); },
  };
})();
