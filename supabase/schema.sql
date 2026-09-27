-- 1. Antes de executar, crie a conta da autora em Authentication > Users.
-- 2. Substitua TODAS as ocorrências de bfe87400-5070-4ded-9533-8bd6681f7c56
--    pelo ID (UUID) da conta dela. Há duas ocorrências funcionais abaixo.

do $$
begin
  if not exists (
    select 1 from auth.users
    where id = 'bfe87400-5070-4ded-9533-8bd6681f7c56'::uuid
  ) then
    raise exception 'Conta da autora não encontrada. Substitua o UUID de exemplo antes de executar.';
  end if;
end $$;

-- Apenas esta conta pode editar. A função é conferida pelo banco, não pelo HTML.
create or replace function public.is_blog_editor()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select (select auth.uid()) = 'bfe87400-5070-4ded-9533-8bd6681f7c56'::uuid;
$$;

revoke all on function public.is_blog_editor() from public, anon;
grant execute on function public.is_blog_editor() to authenticated;

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 3 and 150),
  summary text not null check (char_length(summary) between 10 and 500),
  body text not null check (char_length(body) >= 30),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_pages (
  page_key text primary key check (page_key = 'sobre'),
  content text not null,
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;
alter table public.site_pages enable row level security;

-- Primeiro retira os privilégios padrão e depois concede somente o necessário.
revoke all on table public.posts, public.site_pages from anon, authenticated;
grant select on table public.posts, public.site_pages to anon;
grant select, insert, update, delete on table public.posts to authenticated;
grant select, update on table public.site_pages to authenticated;

drop policy if exists "Visitantes leem artigos publicados" on public.posts;
drop policy if exists "Autora le todos os artigos" on public.posts;
drop policy if exists "Autora cria artigos" on public.posts;
drop policy if exists "Autora altera artigos" on public.posts;
drop policy if exists "Autora exclui artigos" on public.posts;
drop policy if exists "Visitantes leem apresentacao" on public.site_pages;
drop policy if exists "Autora altera apresentacao" on public.site_pages;

create policy "Visitantes leem artigos publicados"
on public.posts for select to anon, authenticated
using (published_at is not null);

create policy "Autora le todos os artigos"
on public.posts for select to authenticated
using (public.is_blog_editor());

create policy "Autora cria artigos"
on public.posts for insert to authenticated
with check (public.is_blog_editor());

create policy "Autora altera artigos"
on public.posts for update to authenticated
using (public.is_blog_editor())
with check (public.is_blog_editor());

create policy "Autora exclui artigos"
on public.posts for delete to authenticated
using (public.is_blog_editor());

create policy "Visitantes leem apresentacao"
on public.site_pages for select to anon, authenticated
using (true);

create policy "Autora altera apresentacao"
on public.site_pages for update to authenticated
using (public.is_blog_editor())
with check (public.is_blog_editor());

-- Primeiros textos, incluídos uma única vez. A autora pode alterá-los pelo painel.
insert into public.site_pages (page_key, content)
values ('sobre', $sobre$
Oi! Sou a Mariana: morena, baixinha, cacheada e apaixonada por cachorros. Fazer Medicina Veterinária sempre foi um sonho meu, e passar na Universidade de Brasília (UnB) foi uma conquista muito especial.

Terminei o ensino médio em 2024 e comecei a faculdade em 2025. Hoje estou no terceiro semestre, caminhando para o quarto. Entre aulas, estudos e semanas de provas, sigo aprendendo sobre a profissão que escolhi.

Minha fé também faz parte de quem eu sou: vou à igreja toda semana. Criei este espaço para compartilhar minha rotina, os desafios da faculdade e meu amor pelos animais.
$sobre$)
on conflict (page_key) do nothing;

insert into public.posts (slug, title, summary, body, published_at)
values (
  'meu-caminho-na-veterinaria',
  'Meu caminho até a Medicina Veterinária',
  'Do fim do ensino médio à realização do sonho de estudar na UnB: um pouco da minha trajetória.',
  $artigo$Medicina Veterinária sempre foi um sonho para mim. Gosto muito de cachorros, e estar perto dos animais é uma parte importante de quem eu sou.

Concluí o ensino médio em 2024. Em 2025, comecei a cursar Medicina Veterinária na Universidade de Brasília (UnB). Passar para a UnB foi uma conquista muito especial nessa caminhada.

Hoje estou no terceiro semestre, indo para o quarto. A faculdade tem aulas, estudos e semanas de provas difíceis. Aqui no blog, quero compartilhar um pouco dessa rotina, do que aprendo e dos desafios que aparecem pelo caminho.

Esta é só a primeira publicação. Ainda tenho muita coisa para aprender e histórias para contar. 🐾$artigo$,
  now()
)
on conflict (slug) do nothing;

-- Imagens públicas dos artigos; somente a autora pode enviar ou excluir.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Autora consulta imagens" on storage.objects;
drop policy if exists "Autora envia imagens" on storage.objects;
drop policy if exists "Autora exclui imagens" on storage.objects;

create policy "Autora consulta imagens"
on storage.objects for select to authenticated
using (bucket_id = 'blog-images' and public.is_blog_editor());

create policy "Autora envia imagens"
on storage.objects for insert to authenticated
with check (bucket_id = 'blog-images' and public.is_blog_editor());

create policy "Autora exclui imagens"
on storage.objects for delete to authenticated
using (bucket_id = 'blog-images' and public.is_blog_editor());
