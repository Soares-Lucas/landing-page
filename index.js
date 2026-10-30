import page from "./index.html";
import profilePhoto from "./assets/img/perfil.jpg";

export default {
  async fetch(request, env, ctx) {
    void env;
    void ctx;

    const url = new URL(request.url);

    if (url.pathname === "/assets/img/perfil.jpg") {
      return new Response(profilePhoto, {
        headers: {
          "content-type": "image/jpeg",
          "cache-control": "public, max-age=86400",
        },
      });
    }

    if (url.pathname !== "/") {
      return new Response("Not found", { status: 404 });
    }

    return new Response(page, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "public, max-age=300",
      },
    });
  },
};
