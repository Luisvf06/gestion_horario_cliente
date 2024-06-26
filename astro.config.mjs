import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import auth from 'auth-astro';
import vue from "@astrojs/vue";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  site: import.meta.VITE_BASE_URL,
  integrations: [tailwind(), vue(), auth()],
  adapter: netlify()
});
