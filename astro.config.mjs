import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import contact from './src/data/contact.json' with { type: 'json' };
export default defineConfig({ site: 'https://littlehomeideas.com', trailingSlash: 'always', integrations: [sitemap({filter: (page) => !page.endsWith('/404/') && (contact.enabled || !page.endsWith('/contact/'))})] });
