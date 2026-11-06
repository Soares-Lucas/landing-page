// Só o JavaScript novo da proposta. Roda depois do script do index.html.
// Na implementação, vai para o <script> do fim do index.html, antes do "})();".
//
// Vem do commit 91e175e do new-landing-page (Starfield.tsx e os useScroll/useTransform
// do Hero, Projects e Contact), sem React nem a biblioteca motion.
(function () {
  var root = document.documentElement;
  var hero = document.getElementById('hero');
  // No mockup, ?parado=1 (o fotos.mjs) quer o estado final: estrelas paradas e seções já à vista.
  var parado = !!(window.MOCKUP_PARAMS && window.MOCKUP_PARAMS.parado);
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var anima = !parado && !reduzido;

  // ---------------------------------------------------------------- Estrelas
  // Um canvas dentro do hero (e não na janela inteira, como no new-landing-page):
  // só desenha enquanto o hero está à vista e só no Espacial.
  var canvas = document.createElement('canvas');
  canvas.className = 'starfield';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);
  var ctx = canvas.getContext('2d');
  var CORES = ['#ffffff', '#e0f2fe', '#bae6fd', '#a5f3fc', '#2dd4bf', '#38bdf8'];
  var FUNDO = 1000, VELOCIDADE = 2.4, FOCAL = 280;
  var estrelas = [], w = 0, h = 0, dpr = 1, quadro = 0, heroVisivel = true;

  // Sorteio com semente fixa: a mesma página dá as mesmas estrelas (e as mesmas fotos).
  var semente = 20261104;
  function sorteio() { semente = (semente * 1664525 + 1013904223) >>> 0; return semente / 4294967296; }

  function medir() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // 220 estrelas numa tela de 1280 × 860; no celular, proporcional à área (cerca de 90 em 390 px).
    var total = Math.max(60, Math.min(220, Math.round(w * h / 5000)));
    semente = 20261104; estrelas = [];
    for (var i = 0; i < total; i++) estrelas.push(nova(sorteio() * FUNDO));
  }
  function nova(z) {
    var s = { x: (sorteio() - .5) * w * 2, y: (sorteio() - .5) * h * 2, z: z, pz: z, tam: sorteio() * 1.5 + .6, cor: CORES[Math.floor(sorteio() * CORES.length)] };
    return s;
  }
  function desenhar(mover) {
    ctx.clearRect(0, 0, w, h);
    var cx = w / 2, cy = h / 2;
    for (var i = 0; i < estrelas.length; i++) {
      var s = estrelas[i];
      if (mover) {
        s.pz = s.z; s.z -= VELOCIDADE;
        if (s.z <= 0) { var n = nova(FUNDO); s.x = n.x; s.y = n.y; s.z = s.pz = FUNDO; }
      }
      var k = FOCAL / s.z, px = s.x * k + cx, py = s.y * k + cy;
      if (px < 0 || px > w || py < 0 || py > h) continue;
      var perto = 1 - s.z / FUNDO;
      var alfa = Math.min(1, Math.max(.1, perto * 1.2));
      var raio = Math.max(.6, s.tam * perto * 2.2);
      if (mover) {
        var pk = FOCAL / s.pz;
        ctx.beginPath(); ctx.moveTo(s.x * pk + cx, s.y * pk + cy); ctx.lineTo(px, py);
        ctx.strokeStyle = s.cor; ctx.globalAlpha = alfa * .75; ctx.lineWidth = raio * .85; ctx.lineCap = 'round'; ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(px, py, raio, 0, Math.PI * 2);
      ctx.fillStyle = s.cor; ctx.globalAlpha = alfa; ctx.fill();
      if (raio > 1.8) {
        ctx.beginPath(); ctx.arc(px, py, raio * 2, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8'; ctx.globalAlpha = alfa * .25; ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  function espacial() { return root.getAttribute('data-theme') === 'spatial'; }
  function laco() {
    quadro = 0;
    if (!anima || !heroVisivel || !espacial() || document.hidden) return;
    desenhar(true);
    quadro = requestAnimationFrame(laco);
  }
  function ligar() {
    if (!espacial()) { cancelAnimationFrame(quadro); quadro = 0; return; }
    if (!anima) { desenhar(false); return; } // movimento reduzido: um céu parado
    if (!quadro) quadro = requestAnimationFrame(laco);
  }
  medir(); ligar();
  new ResizeObserver(function () { medir(); if (!anima) ligar(); }).observe(hero);
  new IntersectionObserver(function (e) { heroVisivel = e[0].isIntersecting; ligar(); }).observe(hero);
  new MutationObserver(ligar).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('visibilitychange', ligar);

  // ---------------------------------------------------------------- Parallax
  // Cada peça anda de "de" a "ate" px enquanto a seção atravessa a janela, como os useTransform.
  var projetos = document.getElementById('projetos');
  var nebula = document.createElement('div');
  nebula.className = 'projects-nebula';
  nebula.setAttribute('aria-hidden', 'true');
  projetos.insertBefore(nebula, projetos.firstChild);
  var cartoes = projetos.querySelectorAll('.projects-grid > .project');
  var contato = document.getElementById('contato');

  // modo "topo": de quando o topo da seção encosta no topo da janela até ela sair por cima (o hero).
  // modo "passa": de quando a seção aparece embaixo até sumir em cima (as outras).
  var PECAS = [
    { secao: hero, modo: 'topo', el: hero.querySelector('.glow-1'), de: 0, ate: 120 },
    { secao: hero, modo: 'topo', el: hero.querySelector('.glow-2'), de: 0, ate: 180 },
    { secao: hero, modo: 'topo', el: document.getElementById('terminal-wrap'), de: 0, ate: -35, largo: true },
    { secao: projetos, modo: 'passa', el: nebula, de: -40, ate: 60 },
    // Os dois cartões em sentidos opostos, só com duas colunas: empilhados, se encostariam.
    { secao: projetos, modo: 'passa', el: cartoes[0], de: 30, ate: -30, largo: true },
    { secao: projetos, modo: 'passa', el: cartoes[1], de: -20, ate: 20, largo: true },
    { secao: contato, modo: 'passa', el: contato.querySelector('.contact-glow'), de: -80, ate: 80 },
    { secao: contato, modo: 'passa', el: contato.querySelector('.contact-panel'), de: 30, ate: -15 },
  ];
  var duasColunas = window.matchMedia('(min-width: 1024px)');
  var pendente = false;
  function atualizar() {
    pendente = false;
    var vh = window.innerHeight;
    PECAS.forEach(function (p) {
      if (!p.el) return;
      if (reduzido || (p.largo && !duasColunas.matches)) { p.el.style.removeProperty('--py'); return; }
      var r = p.secao.getBoundingClientRect();
      var t = p.modo === 'topo' ? -r.top / r.height : (vh - r.top) / (vh + r.height);
      t = Math.min(1, Math.max(0, t));
      p.el.style.setProperty('--py', (p.de + (p.ate - p.de) * t).toFixed(1) + 'px');
    });
  }
  function pedir() {
    if (parado) { atualizar(); return; } // a foto sai logo depois da rolagem: sem esperar o próximo quadro
    if (!pendente) { pendente = true; requestAnimationFrame(atualizar); }
  }
  window.addEventListener('scroll', pedir, { passive: true });
  window.addEventListener('resize', pedir);
  atualizar();

  // ---------------------------------------------------------------- Seções que surgem
  // As seções depois do hero sobem 48 px e aparecem uma vez, quando passam 60 px da borda de baixo. Sem limite em %: com a janela baixa (844 × 390), 15% de uma seção alta (os projetos têm 2326 px) nunca cabe na tela e ela ficaria invisível.
  var secoes = document.querySelectorAll('main > section:not(#hero)');
  if (anima && 'IntersectionObserver' in window) {
    var vigia = new IntersectionObserver(function (itens) {
      itens.forEach(function (it) {
        if (!it.isIntersecting) return;
        it.target.classList.add('visivel');
        vigia.unobserve(it.target);
      });
    }, { rootMargin: '0px 0px -60px 0px' });
    Array.prototype.forEach.call(secoes, function (s) {
      // O que já está na janela ao abrir (um link #contato, por exemplo) não some e volta.
      var r = s.getBoundingClientRect();
      if (r.top < window.innerHeight - 60 && r.bottom > 0) return;
      s.classList.add('revela');
      vigia.observe(s);
    });
  }
})();

// De carona (D5): um ponto de quebra depois do @ do e-mail do contato.
// No index.html: <span><span class="junto">soares-lucas94@</span><wbr>hotmail.com</span>; aqui o JS faz a troca.
(function () {
  var span = document.querySelector('#contato .contact-link span:not(.contact-icon)');
  if (span && span.textContent.indexOf('@') > 0 && !span.querySelector('wbr')) {
    var partes = span.textContent.split('@');
    span.textContent = '';
    var junto = document.createElement('span'); junto.className = 'junto'; junto.textContent = partes[0] + '@';
    span.appendChild(junto);
    span.appendChild(document.createElement('wbr'));
    span.appendChild(document.createTextNode(partes[1]));
  }
})();

// Glitch nos títulos (commit b915b92): a classe e o data-text com o próprio texto.
// No index.html, entram direto no <h1> do hero e nos <h2> das cinco seções.
(function () {
  document.querySelectorAll('#hero-title, main > section h2[id$="-title"]').forEach(function (h) {
    h.classList.add('glitch');
    h.setAttribute('data-text', h.textContent.trim());
  });
})();
