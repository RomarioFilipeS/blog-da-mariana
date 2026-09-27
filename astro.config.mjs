import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://romariofilipes.github.io',
  base: '/blog-da-mariana',
  output: 'static',
  build: { format: 'file' },
});
