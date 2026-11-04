// Cria um mockup novo a partir do _modelo e já gera o dados.js.
// Uso (da raiz do repositório):
//   node docs/mockups/_ferramentas/novo.mjs <assunto> "A proposta numa frase"

import { cpSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const [assunto, frase] = process.argv.slice(2);
if (!assunto || !frase || !/^[a-z0-9-]+$/.test(assunto)) {
  console.error('Uso: node docs/mockups/_ferramentas/novo.mjs <assunto-em-kebab-case> "A proposta numa frase"');
  process.exit(2);
}

const mockups = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destino = path.join(mockups, assunto);
if (existsSync(destino)) {
  console.error(`Já existe ${path.relative(process.cwd(), destino)}.`);
  process.exit(2);
}

cpSync(path.join(mockups, '_modelo'), destino, {
  recursive: true,
  filter: (origem) => !/[\\/](dados\.js|fotos)$/.test(origem),
});

const data = new Date().toISOString().slice(0, 10);
for (const arquivo of ['index.html', 'README.md']) {
  const caminho = path.join(destino, arquivo);
  writeFileSync(caminho, readFileSync(caminho, 'utf8')
    .replaceAll('{{FRASE}}', frase)
    .replaceAll('{{ASSUNTO}}', assunto)
    .replaceAll('{{DATA}}', data));
}

execFileSync(process.execPath, [path.join(destino, 'roteiro', 'gerar.mjs')], { stdio: 'inherit' });
console.log(`\nMockup criado em ${path.relative(process.cwd(), destino)}. Próximos passos:
  1. Ajuste o CONFIG do roteiro/gerar.mjs (foco, ir, estados) e rode-o de novo.
  2. Escreva a proposta em proposta.css e proposta.js.
  3. node docs/mockups/_ferramentas/fotos.mjs ${path.relative(process.cwd(), destino).replaceAll('\\', '/')}
  4. Escreva as notas no index.html e o README.md.`);
