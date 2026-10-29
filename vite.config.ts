/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import { baliseAudience } from './src/lib/audience'

/** Ajoute le script de mesure d'audience dans index.html, seulement s'il est configuré. */
function audience(idSite: string | undefined, site: string | undefined): Plugin {
  return {
    name: 'aboclair-audience',
    transformIndexHtml: (html) => html.replace('</head>', `${baliseAudience(idSite, site)}\n  </head>`),
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  return {
    base: '/aboclair/',
    plugins: [react(), tailwindcss(), audience(env.VITE_UMAMI_WEBSITE_ID, env.VITE_SITE_URL)],
    test: {
      include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    },
  }
})
