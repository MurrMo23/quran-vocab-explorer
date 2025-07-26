import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const toAbsolute = (p) => path.resolve(__dirname, p)

const template = fs.readFileSync(toAbsolute('dist/index.html'), 'utf-8')
const { render } = await import('./dist/server/entry-server.js')

// Define static routes that match the actual routing table in App.tsx
const routesToPrerender = [
  '/',
  '/auth',
  '/dashboard',
  '/collections',
  '/practice',
  '/quiz',
  '/enhanced-quiz',
  '/admin',
  '/analytics',
  '/settings',
  '/notebook',
  '/custom-learning',
  '/community',
  '/community-hub',
  '/audio-practice',
  '/blog',
  '/mobile-flashcards',
  '/help',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service'
]

;(async () => {
  try {
    for (const url of routesToPrerender) {
      try {
        const appHtml = render(url);
        const html = template.replace(`<!--app-html-->`, appHtml)

        const filePath = `dist${url === '/' ? '/index' : url}.html`
        fs.writeFileSync(toAbsolute(filePath), html)
        console.log('pre-rendered:', filePath)
      } catch (error) {
        console.error(`Failed to pre-render ${url}:`, error.message)
        // Continue with other routes instead of failing completely
      }
    }
  } catch (error) {
    console.error('Pre-rendering failed:', error)
    process.exit(1)
  }
})()