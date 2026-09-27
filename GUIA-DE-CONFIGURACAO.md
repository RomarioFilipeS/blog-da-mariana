# Blog da Mariana — painel de publicação

Depois da configuração inicial, a Mariana escreve e edita artigos em `admin.html` no navegador.
Os posts e o texto “Sobre mim” ficam no Supabase e aparecem no site após salvar;
não há commits para atualizar conteúdo. O GitHub continua hospedando os arquivos
do site, caso você use GitHub Pages.

## Configure uma vez

1. Crie um projeto em https://supabase.com/dashboard.
2. Em **Authentication > Users**, adicione a conta da Mariana, com e-mail e
   senha escolhidos por ela. Copie o **User ID** (UUID) da conta. A senha não
   deve ser colocada nos arquivos do site. Se o projeto for só para ela,
   desligue **Allow new users to sign up** nas configurações de Auth depois
   de criar a conta.
3. Abra `supabase/schema.sql`. Substitua o UUID
   `bfe87400-5070-4ded-9533-8bd6681f7c56` pelo User ID da Mariana (use
   “Substituir tudo”). No painel do Supabase, abra **SQL Editor**, cole o
   conteúdo do arquivo e execute. O script cria as tabelas, protege o acesso
   e cadastra o artigo e a apresentação iniciais. Ele para com uma mensagem
   clara se o ID da autora não existir.
4. Em **Settings > API Keys** (ou no botão **Connect**), copie a URL do
   projeto e a **publishable key** que começa com `sb_publishable_`.
   Preencha esses dois campos em `src/scripts/config.js`. **Não use secret key nem
   service_role** nesse arquivo; ele será público.
5. Abra a pasta no VS Code e execute o servidor Astro com `npm run dev`. Acesse
   o link Painel da autora, entre com a conta criada e experimente salvar um rascunho,
   publicar e editar o texto “Sobre mim”. Recarregue a página inicial para ver
   as mudanças.
6. Para colocar esta versão no GitHub Pages, envie os arquivos do projeto
   uma vez. A partir daí, as alterações dos textos feitas no painel aparecem
   sem novos commits.

## Como funciona

| Arquivo | Papel |
| --- | --- |
| `index.html` | Página inicial, apresentação e lista de posts publicados. |
| `artigo.html?slug=...` | Página que abre o artigo escolhido. |
| `src/pages/admin.astro` | Login, edição do “Sobre mim”, criação e edição de posts. |
| `src/scripts/config.js` | URL e chave publicável do projeto Supabase. |
| `supabase/schema.sql` | Banco, regras de acesso e textos iniciais. |

Um novo post pode ser **Rascunho** (visível só no painel) ou **Publicado**
(visível para visitantes). O editor aceita texto simples; separe parágrafos
com uma linha em branco. O endereço do artigo (slug) é definido na criação e
fica fixo depois, para os links publicados continuarem funcionando.

## Se algo não carregar

- **“Novas publicações em breve”**: confira os dois valores em `src/scripts/config.js`
  e confirme que executou o SQL. O artigo inicial só vai aparecer após isso.
- **Login entra, mas não abre o painel**: confira se substituiu o UUID da
  autora em `supabase/schema.sql` pelo mesmo User ID da conta usada no login.
- **Não salva artigo**: confira se a chave é **publishable**, se o SQL rodou
  inteiro e se está usando a conta autorizada. Dois artigos não podem ter
  o mesmo endereço.
- **Mudança não aparece**: confirme que marcou o artigo como **Publicado**
  e recarregue o blog.

Os textos iniciais foram escritos com base nas informações enviadas por
Romário. A Mariana deve revisá-los antes de divulgar o site.

Documentação oficial: [biblioteca JavaScript](https://supabase.com/docs/reference/javascript/installing),
[Auth](https://supabase.com/docs/guides/auth),
[permissões do banco](https://supabase.com/docs/guides/database/postgres/row-level-security)
e [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).

## Atualizar uma instalação existente

Confira se o UUID em `supabase/schema.sql` continua sendo o da autora.
Execute o arquivo completo no SQL Editor do seu projeto Supabase. Ele atualiza
as permissões de exclusão e configura o bucket `blog-images`, sem sobrescrever
artigos e apresentação já existentes. Depois, publique os arquivos atualizados
no GitHub Pages.

O bucket aceita JPG, PNG e WebP de até 5 MB por arquivo. As imagens são públicas
por URL, inclusive quando inseridas em rascunhos. Apenas a autora pode enviá-las
ou excluí-las. No painel, envie a imagem e depois salve o artigo.
Uploads de artigos cancelados podem permanecer no armazenamento.

Para conferir a atualização, crie um artigo de teste como rascunho, envie uma
imagem, salve, publique e abra o artigo no blog. Exclua esse artigo de teste e
confirme que ele desaparece da lista. Use uma janela anônima para conferir que
rascunhos não aparecem para visitantes.

- **Não exclui artigo**: execute o SQL atualizado para instalar a permissão e a regra de exclusão.
- **Não envia imagem**: confira o bucket `blog-images`, execute o SQL atualizado e use um dos formatos permitidos até 5 MB.


## Migração para Astro

Para iniciar, execute npm install e npm run dev. No GitHub, configure Settings → Pages → Source como GitHub Actions antes do push. Consulte APRENDENDO-ASTRO.md. Se o banco já está configurado, a migração não exige executar SQL novamente.
