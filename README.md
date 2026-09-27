# Blog da Mariana — Astro

Blog pessoal sobre Medicina Veterinária na UnB, com Astro, CSS, JavaScript e Supabase.

## Executar

Requer Node.js 22.12 ou superior (recomendado: Node 24).

```sh
npm install
npm run dev
```

Abra http://localhost:4321/blog-da-mariana/ ou o endereço indicado no terminal.
Use o servidor do Astro no lugar do Live Server.

## Aprender e editar

Comece pelo [guia Aprendendo Astro](APRENDENDO-ASTRO.md), com explicações e exercícios.

- `src/pages/`: páginas inicial, artigo e painel.
- `src/components/`: cabeçalho e rodapé compartilhados.
- `src/layouts/Layout.astro`: estrutura geral das páginas.
- `src/styles/global.css`: visual rosa e verde e responsividade.
- `src/scripts/`: interações no navegador e Supabase.
- `public/assets/`: imagens do projeto.

O painel mantém login, rascunhos, publicação, edição, exclusão e imagens.
Os artigos continuam vindo do Supabase pelo navegador: publicar um texto não
exige push nem novo build. O conteúdo dos artigos ainda depende de JavaScript.

## Supabase

A configuração publicável está em `src/scripts/config.js`. Nunca coloque senhas
ou chaves secretas nesse arquivo. As regras RLS restringem edições à autora.
As imagens do bucket `blog-images` são públicas por URL.
Para um novo banco, siga o [guia de configuração](GUIA-DE-CONFIGURACAO.md).
A migração para Astro usa o banco existente e não exige executar SQL novamente.

## Verificar e publicar

```sh
npm run check
npm run build
npm run preview
```

No GitHub, selecione **Settings → Pages → Source → GitHub Actions**.
Depois faça commit e push para `main`. O workflow em `.github/workflows/deploy.yml`
verifica, gera e publica a pasta `dist`. Não publique diretamente a raiz como
na versão HTML antiga. `node_modules`, `.astro` e `dist` não devem ir para o Git.

Os endereços `index.html`, `admin.html` e `artigo.html?slug=...` foram preservados.
Confira login, publicação, imagem, edição e exclusão após a migração.

[Site](https://romariofilipes.github.io/blog-da-mariana/index.html) ·
[Repositório](https://github.com/RomarioFilipeS/blog-da-mariana) ·
[Documentação Astro](https://docs.astro.build/)

Desenvolvido por Romário Filipe, estudante de Análise e Desenvolvimento de Sistemas.