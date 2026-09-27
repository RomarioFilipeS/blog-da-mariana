# Aprendendo Astro com o Blog da Mariana

## 1. Abrir o projeto

Abra esta pasta no VS Code. No terminal, execute:

```sh
npm install
npm run dev
```

Abra o endereço exibido no terminal, normalmente http://localhost:4321/blog-da-mariana/.
Agora usamos o servidor do Astro no lugar do Live Server. Ao salvar um arquivo,
o navegador atualiza a página automaticamente.

## 2. Entender a organização

| Arquivo ou pasta | O que você altera aqui |
| --- | --- |
| `src/pages/index.astro` | A página inicial. |
| `src/pages/artigo.astro` | A estrutura de leitura de um artigo. |
| `src/pages/admin.astro` | Os formulários do painel. |
| `src/components/Cabecalho.astro` | O cabeçalho compartilhado entre as páginas. |
| `src/components/Rodape.astro` | O rodapé compartilhado. |
| `src/layouts/Layout.astro` | HTML geral, título, metadados, CSS e componentes. |
| `src/styles/global.css` | As cores, fontes e adaptação para celular. |
| `src/scripts/` | JavaScript executado no navegador, incluindo Supabase. |
| `public/assets/` | Imagens copiadas para o site publicado. |
| `astro.config.mjs` | Endereço do site e configuração da geração. |
| `dist/` | Resultado gerado automaticamente por `npm run build`. Não edite. |

## 3. Ler um componente Astro

```astro
---
const { nome = 'Mariana' } = Astro.props;
---
<p>Olá, {nome}!</p>
```

A parte entre `---` prepara dados durante a geração da página. O HTML abaixo
usa esses dados. `Astro.props` recebe informações de quem usa o componente.
No projeto, cada página passa `titulo` para o Layout. O `<slot />` do Layout
é o lugar onde o conteúdo da página entra.

Um `<script>` contém código para o navegador. É ali que o blog carrega dados
do Supabase e responde a cliques. Os scripts importados são empacotados pelo
Astro; não precisamos mais carregar a biblioteca do Supabase por CDN.

## 4. Seu primeiro exercício

1. Abra `src/pages/index.astro`.
2. Localize “Entre patas, aulas e sonhos.” e experimente outro título.
3. Salve e observe a mudança no navegador.
4. Abra `src/styles/global.css` e encontre `--fundo` no começo do arquivo.
5. Experimente outro rosa. Salve e compare.
6. Altere uma palavra no rodapé e confira como ela muda nas duas páginas públicas.

## 5. Conferir antes de publicar

```sh
npm run check
npm run build
npm run preview
```

`check` verifica os componentes Astro. `build` gera os arquivos finais em `dist`.
`preview` permite conferir esse resultado localmente. Teste também o painel:
login, rascunho, publicação, imagem, edição, exclusão e saída.

Os endereços `index.html`, `artigo.html?slug=...` e `admin.html` foram mantidos.
O prefixo `/blog-da-mariana` está na configuração porque o site usa um
repositório do GitHub Pages. `import.meta.env.BASE_URL` acrescenta esse prefixo
aos links e imagens.

## 6. Publicar no GitHub Pages

No repositório, abra **Settings → Pages → Build and deployment → Source** e
selecione **GitHub Actions**. Depois faça commit e push para `main`.
O arquivo `.github/workflows/deploy.yml` instala as dependências, verifica o
projeto, gera `dist` e publica o resultado. Acompanhe a execução em **Actions**.
Não envie `node_modules` nem `dist`: o `.gitignore` já os exclui.

## 7. Como os artigos continuam funcionando

O Astro gera a estrutura das páginas; o navegador busca os artigos no Supabase.
Assim, salvar um artigo no painel continua atualizando o conteúdo sem novo build
ou push. O login e as permissões existentes continuam no Supabase.
Esta migração não exige executar SQL novamente.

Os textos dos artigos ainda dependem de JavaScript e não vêm no HTML inicial.
Gerar cada artigo como HTML pode ser uma etapa futura para melhorar indexação,
mas exigirá uma estratégia para atualizar o site quando houver publicações.

A URL e a chave publicável estão em `src/scripts/config.js`. Nunca coloque uma
chave secreta ou `service_role` nesse arquivo. As regras RLS protegem o banco.

Referências: [tutorial de blog](https://docs.astro.build/en/tutorial/0-introduction/),
[scripts](https://docs.astro.build/en/guides/client-side-scripts/) e
[GitHub Pages](https://docs.astro.build/en/guides/deploy/github/).
