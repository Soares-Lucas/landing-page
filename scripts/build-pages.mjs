// Monta a pasta publicar/ para o Cloudflare Pages (lucassoares.caslux.com.br).
// O Pages publica tudo o que estiver nela, por isso entram só os arquivos do site,
// copiados dos originais. Rodado pelo Pages a cada push na main
// (comando de build: npm run build:pages, pasta de saída: publicar).
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const saida = join(raiz, "publicar");

// Os mesmos arquivos que o Worker (index.js) serve.
const arquivos = [
  "index.html",
  "assets/img/perfil.jpg",
  "projetos/afinuvo/index.html",
];

// O mesmo cache do Worker: 5 minutos para as páginas, 1 dia para a foto.
const headers = `/
  Cache-Control: public, max-age=300

/projetos/afinuvo/
  Cache-Control: public, max-age=300

/assets/img/perfil.jpg
  Cache-Control: public, max-age=86400
`;

// Sem um 404.html, o Pages devolveria a página inicial para qualquer endereço.
// Com ele, endereço inexistente responde 404, como no Worker.
const naoEncontrado = `<!doctype html>
<html lang="pt-BR">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Página não encontrada</title>
<p>Página não encontrada. <a href="/">Voltar ao início</a></p>
</html>
`;

rmSync(saida, { recursive: true, force: true });
for (const arquivo of arquivos) {
  const destino = join(saida, arquivo);
  mkdirSync(dirname(destino), { recursive: true });
  cpSync(join(raiz, arquivo), destino);
}
writeFileSync(join(saida, "_headers"), headers);
writeFileSync(join(saida, "404.html"), naoEncontrado);

console.log(`publicar/ pronta: ${arquivos.length} arquivos + _headers + 404.html`);
