import './comum.js';

(function () {
  const banco = window.getBlogClient();
  const aviso = document.getElementById("status-artigos");
  const lista = document.getElementById("lista-artigos");

  if (!banco) {
    aviso.textContent = "Novas publicações em breve.";
    return;
  }

  async function carregarSobre() {
    const { data, error } = await banco.from("site_pages")
      .select("content")
      .eq("page_key", "sobre")
      .maybeSingle();

    if (error) throw error;
    if (data && data.content) {
      window.mostrarParagrafos(document.getElementById("sobre-texto"), data.content);
    }
  }

  async function carregarArtigos() {
    const { data, error } = await banco.from("posts")
      .select("slug, title, summary, published_at")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(30);

    if (error) throw error;
    lista.replaceChildren();

    if (!data.length) {
      aviso.textContent = "Novas publicações em breve.";
      return;
    }

    aviso.hidden = true;
    for (const post of data) {
      const destino = `${import.meta.env.BASE_URL}/artigo.html?slug=` + encodeURIComponent(post.slug);
      const card = document.createElement("article");
      card.className = "cartao-artigo";

      const dataPublicacao = document.createElement("p");
      dataPublicacao.className = "categoria";
      dataPublicacao.textContent = window.dataBrasileira(post.published_at);

      const titulo = document.createElement("h3");
      const linkTitulo = document.createElement("a");
      linkTitulo.href = destino;
      linkTitulo.textContent = post.title;
      titulo.append(linkTitulo);

      const resumo = document.createElement("p");
      resumo.textContent = post.summary;

      const ler = document.createElement("a");
      ler.href = destino;
      ler.className = "ler-mais";
      ler.textContent = "Ler artigo →";

      card.append(dataPublicacao, titulo, resumo, ler);
      lista.append(card);
    }
  }

  carregarSobre().catch(() => {
    // O texto de apresentação incluído no HTML continua visível.
  });
  carregarArtigos().catch(() => {
    aviso.textContent = "Não foi possível carregar os artigos agora. Tente novamente mais tarde.";
  });
})();
