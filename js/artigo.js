(async function () {
  const aviso = document.getElementById("status-artigo");
  const slug = new URLSearchParams(window.location.search).get("slug");
  if (!slug) {
    aviso.textContent = "Selecione um artigo na página inicial.";
    return;
  }

  const banco = window.getBlogClient();
  if (!banco) {
    aviso.textContent = "Artigo indisponível no momento.";
    return;
  }

  try {
    const { data: post, error } = await banco.from("posts")
      .select("title, body, published_at")
      .eq("slug", slug)
      .not("published_at", "is", null)
      .maybeSingle();

    if (error) throw error;
    if (!post) {
      aviso.textContent = "Artigo não encontrado.";
      return;
    }

    document.title = post.title + " | Blog da Mariana";
    document.getElementById("artigo-titulo").textContent = post.title;
    document.getElementById("artigo-data").textContent = "Publicado em " + window.dataBrasileira(post.published_at);
    window.mostrarParagrafos(document.getElementById("artigo-conteudo"), post.body);
    const conteudo = document.getElementById("artigo-conteudo");
conteudo.replaceChildren();

const marcador =
  /^\[imagem:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp))\|([^\]\n]{1,140})\]$/i;

for (const parte of post.body.split(/\n\s*\n/).filter(Boolean)) {
  const imagem = parte.trim().match(marcador);

  if (imagem) {
    const foto = document.createElement("img");
    foto.src = banco.storage
      .from("blog-images")
      .getPublicUrl(imagem[1]).data.publicUrl;
    foto.alt = imagem[2];
    foto.loading = "lazy";
    foto.style.cssText =
      "display:block;width:100%;height:auto;border-radius:16px;margin:28px auto";
    conteudo.append(foto);
  } else {
    const paragrafo = document.createElement("p");
    paragrafo.textContent = parte.trim();
    conteudo.append(paragrafo);
  }
}
    aviso.hidden = true;
    document.getElementById("artigo").hidden = false;
  } catch (error) {
    aviso.textContent = "Não foi possível carregar o artigo agora. Tente novamente mais tarde.";
  }
})();
