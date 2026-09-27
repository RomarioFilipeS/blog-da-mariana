(function () {
  let client;

  window.getBlogClient = function () {
    const config = window.BLOG_CONFIG;
    if (!config || !config.url.startsWith("https://") ||
        !config.publishableKey.startsWith("sb_publishable_") ||
        !window.supabase || !window.supabase.createClient) {
      return null;
    }

    if (!client) {
      client = window.supabase.createClient(config.url, config.publishableKey);
    }
    return client;
  };

  // textContent mostra o texto sem interpretar HTML digitado no painel.
  window.mostrarParagrafos = function (elemento, texto) {
    const paragrafos = texto.trim().split(/\n\s*\n/).filter(Boolean);
    elemento.replaceChildren();
    for (const trecho of paragrafos) {
      const p = document.createElement("p");
      p.textContent = trecho.trim();
      elemento.append(p);
    }
  };

  window.dataBrasileira = function (data) {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric", month: "long", year: "numeric"
    }).format(new Date(data));
  };
})();
