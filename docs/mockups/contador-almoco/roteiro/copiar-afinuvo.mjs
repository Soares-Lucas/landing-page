// Copia o app do Afinuvo como está hoje (o build de c:/pifhos/dist) para projetos/afinuvo-dev/ deste mockup.
// É a área de desenvolvimento (com as abas de Heurísticas, Benchmark e Híbrido | Desktop | Mobile), só para
// comparar: o "Ver mais" abre a landing page final, em projetos/afinuvo/, que é feita à mão no mockup.
// Uso (da raiz do repositório): node docs/mockups/contador-almoco/roteiro/copiar-afinuvo.mjs
// Antes, se o código do Afinuvo mudou: cd c:/pifhos && npm run build
//
// A cópia abre por duplo clique: o bundle do Vite não tem import/export, então roda como script comum
// (type="module" não carrega em file://), com caminhos relativos. Por cima, só uma barra que diz o que é.
// Não edite os arquivos de projetos/afinuvo-dev/ à mão.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ORIGEM = process.env.AFINUVO_DIST || 'c:/pifhos/dist';
const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destino = path.join(pasta, 'projetos', 'afinuvo-dev');

const html = readFileSync(path.join(ORIGEM, 'index.html'), 'utf8');
const js = html.match(/<script type="module" crossorigin src="\/assets\/([^"]+\.js)"><\/script>/);
const css = html.match(/<link rel="stylesheet" crossorigin href="\/assets\/([^"]+\.css)">/);
if (!js || !css) throw new Error('index.html do Afinuvo mudou de formato: não achei o script ou o CSS em /assets/');

const bundle = readFileSync(path.join(ORIGEM, 'assets', js[1]), 'utf8');
if (/(^|[;\n])\s*(import|export)[\s{*]/.test(bundle) || bundle.includes('import.meta')) {
  throw new Error('O bundle do Afinuvo usa módulos ES: não roda como script comum em file://');
}

const barra = `
    <nav class="mk-voltar" aria-label="Área de desenvolvimento">
      <a href="../../index.html" data-voltar>
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Voltar ao mockup
      </a>
      <span>Afinuvo hoje (no código, ainda Disciple) · área de desenvolvimento, fora do site</span>
    </nav>
    <style>
      .mk-voltar{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.5rem max(1rem,calc((100vw - 80rem)/2 + 2rem));background:#422006;border-bottom:1px solid #1e293b;font:500 .8125rem/1.2 'Plus Jakarta Sans',system-ui,sans-serif}
      .mk-voltar a{display:inline-flex;align-items:center;gap:.5rem;min-height:2.75rem;color:#fde68a;text-decoration:none;border-radius:.5rem;padding:0 .5rem;margin-left:-.5rem}
      .mk-voltar a:hover{color:#fff;text-decoration:underline;text-underline-offset:4px}
      .mk-voltar a:focus-visible{outline:2px solid #fbbf24;outline-offset:2px}
      .mk-voltar span{color:#fcd34d}
      @media (max-width:480px){.mk-voltar span{display:none}}
    </style>
    <script>
      // Volta para onde estava (as notas do mockup), e não sempre para o começo.
      document.querySelector('[data-voltar]').addEventListener('click', function (ev) {
        if (history.length > 1 && document.referrer) { ev.preventDefault(); history.back(); }
      });
    </script>`;

let saida = html
  .replace(js[0], '')
  .replace(css[0], `<link rel="stylesheet" href="./assets/${css[1]}">`)
  .replace('<div id="root"></div>', `${barra.trim()}\n    <div id="root"></div>\n    <script defer src="./assets/${js[1]}"></script>`)
  .replace('<head>', `<head>\n    <!-- Cópia gerada por roteiro/copiar-afinuvo.mjs a partir de ${ORIGEM}. Não edite à mão. -->`);

rmSync(destino, { recursive: true, force: true });
mkdirSync(path.join(destino, 'assets'), { recursive: true });
writeFileSync(path.join(destino, 'index.html'), saida);
writeFileSync(path.join(destino, 'assets', js[1]), bundle);
writeFileSync(path.join(destino, 'assets', css[1]), readFileSync(path.join(ORIGEM, 'assets', css[1])));
console.log(`Afinuvo copiado para ${path.relative(process.cwd(), destino)}: ${readdirSync(path.join(destino, 'assets')).join(', ')}`);
