import { defineConfig } from 'vite';

// GitHub Pages serves project sites from /<repository-name>/, not the domain root.
export default defineConfig({
  base: './',
});
