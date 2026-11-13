import page from "./index.html";
import profilePhoto from "./assets/img/perfil.jpg";
import afinuvoPage from "./projetos/afinuvo/index.html";

// No servidor local (npm run dev), nada fica em cache, para cada alteração
// aparecer no próximo carregamento. Em produção, o cache normal.
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export default {
  async fetch(request, env, ctx) {
    void env;
    void ctx;

    const url = new URL(request.url);
    const local = LOCAL_HOSTS.has(url.hostname);
    const cache = (seconds) =>
      local ? "no-store" : `public, max-age=${seconds}`;

    if (url.pathname === "/assets/img/perfil.jpg") {
      return new Response(profilePhoto, {
        headers: {
          "content-type": "image/jpeg",
          "cache-control": cache(86400),
        },
      });
    }

    // Landing page do Afinuvo (só o modo teste, por enquanto)
    if (url.pathname === "/projetos/afinuvo/") {
      return Response.redirect(new URL("/projetos/afinuvo", url), 301);
    }
    if (url.pathname === "/projetos/afinuvo") {
      return new Response(afinuvoPage, {
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": cache(300),
        },
      });
    }

    if (url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }

    return new Response(page, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": cache(300),
      },
    });
  },
};
