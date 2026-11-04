// Lê o index.html de verdade e devolve as peças que o quadro.html junta:
// o CSS do <style>, as fontes, o corpo sem os <script> e o script de comportamento.
// Tudo o que não bate com o esperado vira erro com o arquivo e a linha.

import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function linhaDe(texto, indice) {
  return texto.slice(0, indice).split('\n').length;
}

export function lerPagina(arquivo = 'index.html') {
  const texto = readFileSync(path.join(RAIZ, arquivo), 'utf8').replace(/^﻿/, '');

  const pedaco = (re, nome) => {
    const m = texto.match(re);
    if (!m) throw new Error(`${arquivo}: não achei ${nome}`);
    return m[1];
  };

  const css = pedaco(/<style>([\s\S]*?)<\/style>/, 'o <style>');
  const fontes = [...texto.matchAll(/<link[^>]+href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/g)].map((m) => m[1]);
  const temaPadrao = pedaco(/<html[^>]*data-theme="([^"]+)"/, 'o data-theme do <html>');
  const corpoTodo = pedaco(/<body>([\s\S]*)<\/body>/, 'o <body>');

  const script = [...corpoTodo.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).join('\n;\n');
  if (!script.trim()) throw new Error(`${arquivo}: não achei o <script> do comportamento no <body>`);

  // O quadro abre por file://, então "/assets/..." apontaria para a raiz do disco.
  const corpo = corpoTodo
    .replace(/<script>[\s\S]*?<\/script>/g, '')
    .replace(/(src|href)="\/(?!\/)/g, '$1="../../../');

  return {
    arquivo,
    sha: createHash('sha256').update(texto).digest('hex').slice(0, 12),
    texto,
    css,
    fontes,
    temaPadrao,
    corpo,
    script,
  };
}

// Troca um trecho exato da marcação. Se o trecho não existe ou aparece mais de uma vez,
// para com erro: melhor não gerar do que gerar uma tela errada.
export function trocar(pagina, html, de, para) {
  const primeiro = html.indexOf(de);
  if (primeiro < 0) {
    throw new Error(`${pagina.arquivo}: o trecho não existe mais (a página mudou?):\n  ${de.slice(0, 120)}`);
  }
  const segundo = html.indexOf(de, primeiro + de.length);
  if (segundo >= 0) {
    const linhas = [primeiro, segundo].map((i) => linhaDe(pagina.texto, pagina.texto.indexOf(html.slice(i, i + 40))));
    throw new Error(`${pagina.arquivo}: o trecho aparece mais de uma vez (linhas ${linhas.join(', ')}); use um trecho maior:\n  ${de.slice(0, 120)}`);
  }
  return html.slice(0, primeiro) + para + html.slice(primeiro + de.length);
}

// Confere que cada id pedido existe na página, para o foco não apontar para o nada.
export function conferirIds(pagina, ids) {
  for (const id of ids) {
    if (id === 'rodape') continue;
    const i = pagina.texto.indexOf(`id="${id}"`);
    if (i < 0) throw new Error(`${pagina.arquivo}: não existe elemento com id="${id}"`);
  }
}
