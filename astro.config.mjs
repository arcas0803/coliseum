import { defineConfig } from 'astro/config';

// The development server keeps its root URL; production runs under the repository path.
export default defineConfig({
  output: 'static',
  site: 'https://arcas0803.github.io',
  base: process.env.GITHUB_ACTIONS === 'true' ? '/coliseum' : '/',
  devToolbar: { enabled: false },
});
