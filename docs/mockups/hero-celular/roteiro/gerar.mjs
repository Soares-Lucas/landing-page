// Gera o dados.js deste mockup a partir do index.html de verdade.
// Uso (da raiz do repositório): node docs/mockups/<assunto>/roteiro/gerar.mjs

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { lerPagina, trocar, conferirIds } from '../../_ferramentas/pagina.mjs';

// --- O que este mockup mostra ------------------------------------------------
// foco: as partes que são o assunto (ids de <header>/<section>, ou "rodape").
//       As outras viram bloco neutro, com a mesma altura.
// ir:   para onde a janela rola ao abrir.
// estados: cada um é o corpo da página com trocas de texto exatas. Use dados
//       fictícios e os casos difíceis (nome longo, lista que cresce, vazio).
const CONFIG = {
  foco: ['hero'],
  ir: 'hero',
  estados: {
    padrao: { nome: 'Padrão', trocas: [] },
    // A aba com as linhas de código mais longas; a troca de aba é feita no ACOES do quadro.html.
    'aba-arquitetura': { nome: 'Aba arquitetura.json', trocas: [] },
    // O mouse sobre o hero; a inclinação é feita no ACOES do quadro.html.
    'terminal-inclinado': { nome: 'Terminal inclinado', trocas: [] },
    'texto-longo': {
      nome: 'Nome longo',
      trocas: [
        [
          '<span class="identity-name">Lucas Soares</span>',
          '<span class="identity-name">Lucas Soares de Albuquerque Figueiredo</span>',
        ],
      ],
    },
  },
};
// -----------------------------------------------------------------------------

const pasta = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagina = lerPagina('index.html');
conferirIds(pagina, [...CONFIG.foco, CONFIG.ir]);

const estados = {};
for (const [chave, estado] of Object.entries(CONFIG.estados)) {
  let corpo = pagina.corpo;
  for (const [de, para] of estado.trocas) corpo = trocar(pagina, corpo, de, para);
  estados[chave] = { nome: estado.nome, corpo };
}

const dados = {
  origem: pagina.arquivo,
  sha: pagina.sha,
  temaPadrao: pagina.temaPadrao,
  foco: CONFIG.foco,
  ir: CONFIG.ir,
  fontes: pagina.fontes,
  css: pagina.css,
  script: pagina.script,
  estados,
};

writeFileSync(
  path.join(pasta, 'dados.js'),
  `// Gerado por roteiro/gerar.mjs a partir de ${pagina.arquivo} (sha ${pagina.sha}). Não edite à mão.\n` +
    `window.MOCKUP = ${JSON.stringify(dados)};\n`,
);
console.log(`dados.js gerado: ${Object.keys(estados).length} estado(s), ${pagina.arquivo} sha ${pagina.sha}`);
