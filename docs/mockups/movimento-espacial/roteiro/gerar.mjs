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
  // O movimento passa pela página inteira: o hero, as três seções que surgem ao rolar e o contato.
  foco: ['hero', 'especialidades', 'projetos', 'experiencia', 'contato'],
  ir: 'hero',
  estados: {
    padrao: { nome: 'Padrão', trocas: [] },
    // A janela no meio dos projetos, onde o parallax desencontra os dois cartões; a rolagem é feita no ACOES do quadro.html.
    projetos: { nome: 'Rolando em projetos', trocas: [] },
    // O contato, onde o painel e o brilho andam em velocidades diferentes.
    contato: { nome: 'Rolando no contato', trocas: [] },
    // O quadro do glitch nos títulos, congelado no meio (95% dos 7,5 s); o congelamento é feito no ACOES do quadro.html.
    glitch: { nome: 'Glitch nos títulos', trocas: [] },
    // Um projeto com descrição bem maior que o outro: os cartões ficam com alturas diferentes e o desencontro não pode encostar em nada.
    'projeto-longo': {
      nome: 'Projeto longo',
      trocas: [
        [
          '<p class="card-desc">Arquitetura de webhooks, consistência de eventos, segurança, reprocessamento e múltiplos provedores.</p>',
          '<p class="card-desc">Arquitetura de webhooks, consistência de eventos, segurança, reprocessamento e múltiplos provedores, com conciliação diária entre adquirentes, filas de reprocessamento por prioridade, painéis de auditoria por transação e alertas para quando um provedor responde fora do prazo combinado.</p>',
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
