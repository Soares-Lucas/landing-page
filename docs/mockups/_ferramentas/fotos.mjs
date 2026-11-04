// Fotografa e confere um mockup num navegador sem janela (Edge ou Chrome, pelo CDP).
// Node 22+, sem dependências.
//
// Uso (da raiz do repositório):
//   node docs/mockups/_ferramentas/fotos.mjs docs/mockups/<assunto>
//   node docs/mockups/_ferramentas/fotos.mjs docs/mockups/<assunto> --janelas=computador,celular --estados=padrao
//
// Opções: --janelas=  computador,grande,celular,estreito,deitado (padrão: todas)
//         --versoes=  hoje,proposta   --temas= claro,escuro   --estados= (padrão: todos)
//         --ir=<id>   (rola até outro elemento; as fotos ganham o sufixo -<id> e o index.html não é fotografado)
//         --sem-index (não fotografa o index.html)
// Variável NAVEGADOR: caminho do executável, se não for achado sozinho.
//
// Grava fotos/*.png, fotos/conferencia.json e fotos/medidas.js (que o index.html mostra).
// Sai com código 1 se sobrar, na proposta, texto cortado, rolagem para o lado, contraste baixo,
// botão sem foco visível no foco ou erro de JavaScript.

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as esperar } from 'node:timers/promises';

const JANELAS = {
  computador: { w: 1280, h: 860, mobile: false },
  grande: { w: 1920, h: 1080, mobile: false },
  celular: { w: 390, h: 844, mobile: true },
  estreito: { w: 360, h: 800, mobile: true },
  deitado: { w: 844, h: 390, mobile: true },
};

const args = process.argv.slice(2);
const pasta = path.resolve(args.find((a) => !a.startsWith('--')) || '');
const opcao = (nome, padrao) => {
  const a = args.find((x) => x.startsWith(`--${nome}=`));
  return a ? a.split('=')[1].split(',').filter(Boolean) : padrao;
};
if (!existsSync(path.join(pasta, 'quadro.html')) || !existsSync(path.join(pasta, 'dados.js'))) {
  console.error(`Não achei quadro.html e dados.js em ${pasta}. Rode antes o roteiro/gerar.mjs.`);
  process.exit(2);
}

const dados = (() => {
  const texto = readFileSync(path.join(pasta, 'dados.js'), 'utf8');
  return JSON.parse(texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1));
})();
const janelas = opcao('janelas', Object.keys(JANELAS));
const versoes = opcao('versoes', ['hoje', 'proposta']);
const temas = opcao('temas', ['claro', 'escuro']);
const estados = opcao('estados', Object.keys(dados.estados));
const ir = opcao('ir', [])[0];
for (const j of janelas) if (!JANELAS[j]) throw new Error(`janela desconhecida: ${j}`);
for (const e of estados) if (!dados.estados[e]) throw new Error(`estado desconhecido: ${e}`);

function acharNavegador() {
  const candidatos = [
    process.env.NAVEGADOR,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/microsoft-edge', '/usr/bin/google-chrome', '/usr/bin/chromium',
  ].filter(Boolean);
  const achado = candidatos.find((c) => existsSync(c));
  if (!achado) throw new Error('Não achei Edge nem Chrome. Defina NAVEGADOR=<caminho do executável>.');
  return achado;
}

class CDP {
  constructor(ws) {
    this.ws = ws; this.id = 0; this.pendentes = new Map();
    ws.addEventListener('message', (ev) => {
      const m = JSON.parse(ev.data);
      const p = m.id && this.pendentes.get(m.id);
      if (!p) return;
      this.pendentes.delete(m.id);
      m.error ? p.rej(new Error(`${p.metodo}: ${m.error.message}`)) : p.res(m.result);
    });
  }
  enviar(metodo, params = {}, sessionId) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method: metodo, params, sessionId }));
    return new Promise((res, rej) => this.pendentes.set(id, { res, rej, metodo }));
  }
}

async function abrirNavegador() {
  const perfil = mkdtempSync(path.join(os.tmpdir(), 'mockup-cdp-'));
  const proc = spawn(acharNavegador(), [
    '--headless=new', '--remote-debugging-port=0', `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--disable-gpu',
    '--allow-file-access-from-files', 'about:blank',
  ], { stdio: 'ignore' });
  const arquivoPorta = path.join(perfil, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(arquivoPorta); i++) await esperar(100);
  if (!existsSync(arquivoPorta)) throw new Error('O navegador não abriu a porta de depuração.');
  await esperar(100);
  const [porta, caminho] = readFileSync(arquivoPorta, 'utf8').trim().split('\n');
  const ws = new WebSocket(`ws://127.0.0.1:${porta}${caminho}`);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  const cdp = new CDP(ws);
  const fechar = async () => {
    try { await cdp.enviar('Browser.close'); } catch {}
    ws.close(); proc.kill();
    await esperar(300);
    try { rmSync(perfil, { recursive: true, force: true }); } catch {}
  };
  return { cdp, fechar };
}

async function novaAba(cdp) {
  const { targetId } = await cdp.enviar('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.enviar('Target.attachToTarget', { targetId, flatten: true });
  const s = (m, p) => cdp.enviar(m, p, sessionId);
  await s('Page.enable'); await s('Runtime.enable');
  return s;
}

async function avaliar(s, expr) {
  const r = await s('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}

// Sem isso, logo depois de navegar ainda se lê o "pronto" da página anterior.
async function zerarSinais(s) {
  await avaliar(s, 'window.__mockupPronto = false; window.__indexPronto = false');
}

async function esperarPronto(s, sinal) {
  for (let i = 0; i < 200; i++) {
    if (await avaliar(s, `window.${sinal} === true`)) return;
    await esperar(75);
  }
  throw new Error(`a página não ficou pronta (${sinal})`);
}

// Roda dentro do quadro. Devolve as medidas e os problemas achados.
const CONFERIR = `(() => {
  const vw = innerWidth, vh = innerHeight, problemas = [];
  const descrever = (el) => {
    let s = el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.classList.length ? '.' + [...el.classList].slice(0, 2).join('.') : '');
    const t = (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 50);
    return t ? s + ' "' + t + '"' : s;
  };
  const visivel = (el) => {
    if (el.closest('.mk-neutro, [hidden], dialog:not([open])')) return false;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return false;
    for (let a = el; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    }
    return true;
  };

  if (document.documentElement.scrollWidth > vw + 1) {
    const largos = [...document.querySelectorAll('body *')].filter((el) => visivel(el) && el.getBoundingClientRect().right > vw + 1).slice(0, 3).map(descrever);
    problemas.push({ tipo: 'rolagem para o lado', detalhe: 'página com ' + document.documentElement.scrollWidth + ' px em ' + vw + ' px: ' + largos.join('; ') });
  }

  const textos = [...document.querySelectorAll('body *')].filter((el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visivel(el));

  for (const el of textos) {
    const cs = getComputedStyle(el);
    const corta = cs.overflowX !== 'visible' || cs.textOverflow === 'ellipsis';
    if (corta && el.scrollWidth > el.clientWidth + 1) problemas.push({ tipo: 'texto cortado', detalhe: descrever(el) });
  }

  // Texto que passa da borda da janela, mesmo quando um overflow: hidden esconde a rolagem.
  for (const el of textos) {
    if (el.closest('[style*="position:absolute"], [aria-hidden="true"]')) continue;
    const r = el.getBoundingClientRect();
    if (r.right > vw + 1 || r.left < -1) problemas.push({ tipo: 'texto fora da janela', detalhe: descrever(el) + ' vai de ' + Math.round(r.left) + ' a ' + Math.round(r.right) + ' px em ' + vw + ' px' });
  }

  const rgba = (c) => { const m = c.match(/[\\d.]+/g); return m ? m.map(Number).concat(m.length === 3 ? [1] : []) : null; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const fundoDe = (el) => {
    for (let a = el; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.backgroundImage !== 'none') return null;
      const c = rgba(cs.backgroundColor);
      if (c && c[3] >= .99) return c;
      if (c && c[3] > 0) return null;
    }
    return rgba(getComputedStyle(document.body).backgroundColor);
  };
  const foco = (window.MOCKUP.foco || []).map((id) => id === 'rodape' ? document.querySelector('body > footer') : document.getElementById(id)).filter(Boolean);
  const noFoco = (el) => foco.some((f) => f.contains(el));
  for (const el of textos.filter(noFoco)) {
    const cs = getComputedStyle(el);
    const cor = rgba(cs.color), fundo = fundoDe(el);
    if (!cor || !fundo || cor[3] < .99 || cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)') continue;
    const [a, b] = [lum(cor), lum(fundo)].sort((x, y) => y - x);
    const razao = (a + .05) / (b + .05);
    const grande = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
    if (razao < (grande ? 3 : 4.5)) problemas.push({ tipo: 'contraste baixo', detalhe: descrever(el) + ' ' + razao.toFixed(2) + ':1' });
  }

  for (const el of [...document.querySelectorAll('a[href], button, [tabindex="0"]')].filter((e) => noFoco(e) && visivel(e))) {
    const antes = getComputedStyle(el);
    const outlineAntes = antes.outlineStyle + antes.outlineWidth, sombraAntes = antes.boxShadow, borda = antes.borderColor, fundo = antes.backgroundColor;
    el.focus({ preventScroll: true, focusVisible: true });
    const cs = getComputedStyle(el);
    const muda = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0) || cs.boxShadow !== sombraAntes || cs.borderColor !== borda || cs.backgroundColor !== fundo || (cs.outlineStyle + cs.outlineWidth) !== outlineAntes;
    el.blur();
    if (!muda) problemas.push({ tipo: 'sem foco visível', detalhe: descrever(el) });
  }

  const medidas = {};
  for (const el of document.querySelectorAll('body > header, main > section, body > footer')) {
    const nome = el.tagName === 'FOOTER' ? 'rodape' : (el.id || el.tagName.toLowerCase());
    const h = el.getBoundingClientRect().height;
    medidas[nome] = { altura: Math.round(h), pct: Math.round(h / vh * 100) };
  }
  for (const e of window.__mockupErros || []) problemas.push({ tipo: 'erro de JavaScript', detalhe: e });
  return { problemas, medidas };
})()`;

async function main() {
  const { cdp, fechar } = await abrirNavegador();
  const saida = path.join(pasta, 'fotos');
  mkdirSync(saida, { recursive: true });
  const quadro = pathToFileURL(path.join(pasta, 'quadro.html')).href;
  const resultados = [];
  let falhas = 0, problemasHoje = 0;

  try {
    const s = await novaAba(cdp);
    for (const janela of janelas) {
      const J = JANELAS[janela];
      await s('Emulation.setDeviceMetricsOverride', { width: J.w, height: J.h, deviceScaleFactor: 1, mobile: J.mobile });
      for (const tema of temas) for (const versao of versoes) for (const estado of estados) {
        // parado=1: sem transições, a foto e a conferência veem o estado final, não o meio de uma animação.
        const url = `${quadro}?${new URLSearchParams({ v: versao, t: tema, e: estado, parado: 1, ...(ir ? { ir } : {}) })}`;
        await zerarSinais(s);
        await s('Page.navigate', { url });
        await esperar(50);
        await esperarPronto(s, '__mockupPronto');
        const r = await avaliar(s, CONFERIR);
        const nome = `${versao}-${tema}-${janela}-${estado}${ir ? '-' + ir : ''}.png`;
        const foto = await s('Page.captureScreenshot', { format: 'png' });
        writeFileSync(path.join(saida, nome), Buffer.from(foto.data, 'base64'));
        resultados.push({ janela, largura: J.w, altura: J.h, tema, versao, estado, foto: nome, ...r });
        // Os problemas de hoje são medida, não falha: só a proposta precisa sair limpa.
        if (versao === 'proposta') falhas += r.problemas.length; else problemasHoje += r.problemas.length;
        const marca = r.problemas.length ? `✗ ${r.problemas.length} problema(s)` : '✓';
        console.log(`${marca}  ${nome}`);
        for (const p of r.problemas) console.log(`     ${p.tipo}: ${p.detalhe}`);
      }
    }

    if (ir) {
      console.log(`
${resultados.length} foto(s); ${falhas ? falhas + ' problema(s) na proposta' : 'nenhum problema na proposta'}${problemasHoje ? `; ${problemasHoje} hoje` : ''}.`);
      process.exitCode = falhas ? 1 : 0;
      return;
    }

    // As medidas que o index.html mostra: estado e tema principais, todas as janelas.
    const estado0 = estados[0], tema0 = temas.includes('escuro') ? 'escuro' : temas[0];
    const linhas = resultados.filter((r) => r.estado === estado0 && r.tema === tema0)
      .map((r) => ({ janela: `${r.janela} ${r.largura}×${r.altura}`, versao: r.versao, medidas: r.medidas }));
    const partes = [...new Set(linhas.flatMap((l) => Object.keys(l.medidas)))].filter((p) => dados.foco.includes(p));
    const data = new Date().toISOString().slice(0, 10);
    writeFileSync(path.join(saida, 'conferencia.json'), JSON.stringify({ data, sha: dados.sha, resultados }, null, 2));
    writeFileSync(path.join(saida, 'medidas.js'),
      `// Gerado pelo fotos.mjs. Não edite à mão.\nwindow.MOCKUP_MEDIDAS = ${JSON.stringify({ data, estado: estado0, tema: tema0, partes, linhas })};\n`);

    if (!args.includes('--sem-index')) {
      const indice = pathToFileURL(path.join(pasta, 'index.html')).href;
      await s('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
      for (const tema of ['claro', 'escuro']) {
        await s('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }, { name: 'prefers-color-scheme', value: tema === 'claro' ? 'light' : 'dark' }] });
        await zerarSinais(s);
        await s('Page.navigate', { url: `${indice}#t=${tema}` });
        await esperar(50);
        await esperarPronto(s, '__indexPronto');
        await esperar(150);
        const altura = await avaliar(s, 'Math.ceil(document.documentElement.scrollHeight)');
        const foto = await s('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 1440, height: altura, scale: 1 } });
        writeFileSync(path.join(saida, `index-${tema}.png`), Buffer.from(foto.data, 'base64'));
        console.log(`·  index-${tema}.png`);
      }
    }
  } finally {
    await fechar();
  }

  console.log(`\n${resultados.length} foto(s) em ${path.relative(process.cwd(), saida)}; ${falhas ? falhas + ' problema(s) na proposta' : 'nenhum problema na proposta'}${problemasHoje ? `; ${problemasHoje} hoje` : ''}.`);
  process.exit(falhas ? 1 : 0);
}

main().catch((e) => { console.error(e.message || e); process.exit(2); });
