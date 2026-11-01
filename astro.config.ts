import { defineConfig } from 'astro/config';
import { site } from './src/config/site';

export default defineConfig({
  output: 'static',
  site: site.origin,
  base: site.base,
  trailingSlash: 'always',
});
