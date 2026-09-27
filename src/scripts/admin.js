import './comum.js';

(function () {
  const banco = window.getBlogClient();
  const login = document.getElementById("secao-login");
  const painel = document.getElementById("area-editor");
  const avisoGeral = document.getElementById("status-geral");
  const formLogin = document.getElementById("form-login");
  const formSobre = document.getElementById("form-sobre");
  const formArtigo = document.getElementById("form-artigo");
  const tituloFormulario = document.getElementById("titulo-form-artigo");
  const campoTitulo = document.getElementById("post-titulo");
  const campoSlug = document.getElementById("post-slug");
  const campoResumo = document.getElementById("post-resumo");
  const campoConteudo = document.getElementById("post-conteudo");
  const campoImagens = document.getElementById("post-imagens");
  const botaoImagens = document.getElementById("inserir-imagens");
  const statusImagens = document.getElementById("status-imagens");
  const campoStatus = document.getElementById("post-status");
  const statusForm = document.getElementById("status-form");
  const lista = document.getElementById("lista-admin");
  const statusLista = document.getElementById("status-lista");
  const cancelarEdicao = document.getElementById("cancelar-edicao");
  let artigoEmEdicao = null;
  let slugFoiAlterado = false;
  
  if (!banco) {
    avisoGeral.textContent = "Configure o Supabase em src/scripts/config.js antes de entrar. As instruções estão no guia incluído no projeto.";
    formLogin.querySelector("button").disabled = true;
    return;
  }

  function gerarSlug(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function limparFormulario() {
    formArtigo.reset();
    artigoEmEdicao = null;
    slugFoiAlterado = false;
    campoSlug.readOnly = false;
    tituloFormulario.textContent = "Novo artigo";
    cancelarEdicao.hidden = true;
    statusForm.textContent = "";
  }

  function editarArtigo(post) {
    artigoEmEdicao = post;
    campoTitulo.value = post.title;
    campoSlug.value = post.slug;
    campoSlug.readOnly = true;
    campoResumo.value = post.summary;
    campoConteudo.value = post.body;
    campoStatus.value = post.published_at ? "published" : "draft";
    tituloFormulario.textContent = "Editar artigo";
    cancelarEdicao.hidden = false;
    statusForm.textContent = "";
    formArtigo.scrollIntoView({ behavior: "smooth", block: "start" });
    campoTitulo.focus({ preventScroll: true });
  }

  async function carregarSobre() {
    const { data, error } = await banco.from("site_pages")
      .select("content").eq("page_key", "sobre").maybeSingle();
    if (error || !data) throw error || new Error("Página 'Sobre mim' não encontrada. Execute o SQL do guia.");
    document.getElementById("sobre-conteudo").value = data.content;
  }

  async function carregarArtigos() {
    statusLista.textContent = "Carregando...";
    const { data, error } = await banco.from("posts")
      .select("id, slug, title, summary, body, published_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;

    lista.replaceChildren();
    statusLista.textContent = data.length ? "" : "Ainda não há artigos. Crie o primeiro abaixo.";
    for (const post of data) {
      const item = document.createElement("div");
      item.className = "item-admin";
      const texto = document.createElement("div");
      const nome = document.createElement("strong");
      nome.textContent = post.title;
      const situacao = document.createElement("p");
      situacao.className = "ajuda";
      situacao.textContent = post.published_at ? "Publicado" : "Rascunho";
      texto.append(nome, situacao);
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "botao-secundario";
      botao.textContent = "Editar";
      botao.setAttribute("aria-label", "Editar " + post.title);
      botao.addEventListener("click", () => editarArtigo(post));
      const botaoExcluir = document.createElement("button");
botaoExcluir.type = "button";
botaoExcluir.className = "botao-secundario";
botaoExcluir.textContent = "Excluir";
botaoExcluir.setAttribute("aria-label", "Excluir " + post.title);

botaoExcluir.addEventListener("click", async () => {
  if (!window.confirm(`Excluir o artigo "${post.title}" permanentemente?`)) {
    return;
  }

  botaoExcluir.disabled = true;
  statusLista.textContent = "Excluindo artigo...";

  try {
    const { data: excluido, error } = await banco.from("posts")
      .delete()
      .eq("id", post.id)
      .select("id")
      .maybeSingle();

    if (error || !excluido) {
      throw error || new Error("Sem permissão para excluir.");
    }

    if (artigoEmEdicao?.id === post.id) limparFormulario();

    const imagens = [...new Set([...post.body.matchAll(
      /\[imagem:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(?:jpg|png|webp))\|/gi
    )].map(([, caminho]) => caminho))].filter(caminho =>
      !data.some(outro =>
        outro.id !== post.id &&
        outro.body.includes(`[imagem:${caminho}|`)
      )
    );

    let mensagem = "Artigo excluído.";

    if (imagens.length) {
      const { error: erroImagens } = await banco.storage
        .from("blog-images")
        .remove(imagens);

      mensagem = erroImagens
        ? "Artigo excluído, mas não foi possível apagar suas imagens: " +
          erroImagens.message
        : "Artigo e imagens excluídos.";
    }

    try {
      await carregarArtigos();
    } catch {
      mensagem += " Atualize a página para atualizar a lista.";
    }

    statusLista.textContent = mensagem;
  } catch (falha) {
    statusLista.textContent =
      "Não foi possível concluir a exclusão: " + falha.message;
    botaoExcluir.disabled = false;
  }
});

const acoes = document.createElement("div");
acoes.className = "acoes";
acoes.append(botao, botaoExcluir);
item.append(texto, acoes);
      lista.append(item);
    }
  }

  async function entrarNoPainel(usuario) {
    const { data: autorizado, error } = await banco.rpc("is_blog_editor");
    if (error || !autorizado) {
      await banco.auth.signOut();
      avisoGeral.textContent = "Esta conta não tem permissão para editar o blog. Confira o ID da autora no SQL.";
      return;
    }
    avisoGeral.textContent = "";
    document.getElementById("email-editor").textContent = usuario.email || "autora";
    login.hidden = true;
    painel.hidden = false;
    try {
      await Promise.all([carregarSobre(), carregarArtigos()]);
    } catch (falha) {
      avisoGeral.textContent = falha.message || "Não foi possível carregar o painel.";
    }
  }

  formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    avisoGeral.textContent = "Entrando...";
    const botao = formLogin.querySelector("button");
    botao.disabled = true;
    try {
      const { data, error } = await banco.auth.signInWithPassword({
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("senha").value
      });
      if (error) throw error;
      formLogin.reset();
      await entrarNoPainel(data.user);
    } catch (falha) {
      avisoGeral.textContent = "Não foi possível entrar. Confira o e-mail, a senha e a configuração do projeto.";
    } finally {
      botao.disabled = false;
    }
  });

  document.getElementById("sair").addEventListener("click", async () => {
    await banco.auth.signOut();
    painel.hidden = true;
    login.hidden = false;
    lista.replaceChildren();
    limparFormulario();
    avisoGeral.textContent = "Você saiu do painel.";
  });

  formSobre.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const botao = formSobre.querySelector("button");
    const status = document.getElementById("status-sobre");
    botao.disabled = true;
    status.textContent = "Salvando...";
    try {
      const { data, error } = await banco.from("site_pages")
        .update({ content: document.getElementById("sobre-conteudo").value.trim(), updated_at: new Date().toISOString() })
        .eq("page_key", "sobre").select("page_key").maybeSingle();
      if (error || !data) throw error || new Error("Sem permissão para salvar.");
      status.textContent = "Apresentação salva. Atualize a página inicial para conferir.";
    } catch (falha) {
      status.textContent = "Não foi possível salvar a apresentação: " + falha.message;
    } finally {
      botao.disabled = false;
    }
  });

  campoTitulo.addEventListener("input", () => {
    if (!artigoEmEdicao && !slugFoiAlterado) campoSlug.value = gerarSlug(campoTitulo.value);
  });
  campoSlug.addEventListener("input", () => { slugFoiAlterado = true; });
  document.getElementById("novo-artigo").addEventListener("click", () => {
    limparFormulario();
    campoTitulo.focus();
  });
  cancelarEdicao.addEventListener("click", limparFormulario);
  botaoImagens.addEventListener("click", async () => {
  const arquivos = [...campoImagens.files];

  if (!arquivos.length) {
    statusImagens.textContent = "Escolha uma imagem primeiro.";
    return;
  }

  let posicao = campoConteudo.selectionStart;
  botaoImagens.disabled = true;
  campoConteudo.readOnly = true;
  document.getElementById("salvar-artigo").disabled = true;

  try {
    for (const [indice, arquivo] of arquivos.entries()) {
      const extensoes = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp"
      };
      const extensao = extensoes[arquivo.type];

      if (!extensao || arquivo.size === 0 ||
          arquivo.size > 5 * 1024 * 1024) {
        throw new Error("Use JPG, PNG ou WebP de até 5 MB.");
      }

      statusImagens.textContent =
        `Enviando imagem ${indice + 1} de ${arquivos.length}...`;

      const nome = `${crypto.randomUUID()}.${extensao}`;
      const { error } = await banco.storage
        .from("blog-images")
        .upload(nome, arquivo, {
          contentType: arquivo.type,
          upsert: false
        });

      if (error) throw error;

      const descricao = arquivo.name.replace(/\.[^.]+$/, "")
        .replace(/[\]\|\r\n]/g, " ")
        .replace(/[_-]+/g, " ")
        .trim().slice(0, 140) || "Imagem do artigo";

      const marcador = `\n\n[imagem:${nome}|${descricao}]\n\n`;
      campoConteudo.setRangeText(marcador, posicao, posicao, "end");
      posicao = campoConteudo.selectionStart;
    }

    campoImagens.value = "";
    statusImagens.textContent =
      "Imagem inserida! Agora salve o artigo.";
    campoConteudo.focus();
  } catch (falha) {
    statusImagens.textContent =
      "Não foi possível enviar: " + falha.message;
  } finally {
    botaoImagens.disabled = false;
    campoConteudo.readOnly = false;
    document.getElementById("salvar-artigo").disabled = false;
  }
});

  formArtigo.addEventListener("submit", async (evento) => {
    evento.preventDefault();
    const botao = document.getElementById("salvar-artigo");
    botao.disabled = true;
    statusForm.textContent = "Salvando...";
    try {
      const publicado = campoStatus.value === "published";
      const post = {
        title: campoTitulo.value.trim(),
        summary: campoResumo.value.trim(),
        body: campoConteudo.value.trim(),
        published_at: publicado ? (artigoEmEdicao?.published_at || new Date().toISOString()) : null,
        updated_at: new Date().toISOString()
      };
      let resultado;
      if (artigoEmEdicao) {
        resultado = await banco.from("posts").update(post)
          .eq("id", artigoEmEdicao.id).select("id").maybeSingle();
      } else {
        post.slug = campoSlug.value.trim();
        resultado = await banco.from("posts").insert(post).select("id").single();
      }
      if (resultado.error || !resultado.data) {
        throw resultado.error || new Error("Sem permissão para salvar.");
      }
      limparFormulario();
      statusForm.textContent = publicado ? "Artigo publicado! Atualize o blog para vê-lo." : "Rascunho salvo.";
      try {
        await carregarArtigos();
      } catch (falhaLista) {
        statusLista.textContent = "O artigo foi salvo, mas a lista não atualizou. Recarregue o painel.";
      }
    } catch (falha) {
      statusForm.textContent = falha.code === "23505"
        ? "Esse endereço já existe. Escolha outro para o novo artigo."
        : "Não foi possível salvar o artigo: " + falha.message;
    } finally {
      botao.disabled = false;
    }
  });

  (async () => {
    try {
      const { data, error } = await banco.auth.getUser();
      if (error) throw error;
      if (data.user) await entrarNoPainel(data.user);
    } catch (falha) {
      avisoGeral.textContent = "Faça login para acessar o painel.";
    }
  })();
})();
