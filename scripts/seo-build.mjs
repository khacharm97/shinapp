// Runs automatically after every `vite build` (including on Vercel).
// Does two things, neither of which needs a browser:
//  1. Writes dist/sitemap.xml from live backend data.
//  2. Copies the prerendered-snapshots/ directory (generated locally via
//     `yarn seo:snapshot`, committed to git) on top of dist/, so search
//     engines get real static HTML instead of an empty <div id="root">
//     shell - without ever launching Chrome in Vercel's build container.
import { cp, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { collectRoutes, siteUrl } from './lib/routes.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const snapshotsDir = path.join(__dirname, '..', 'prerendered-snapshots')

async function writeSitemap(routes) {
  const today = new Date().toISOString().split('T')[0]
  const urlEntries = routes
    .map(
      (r) => `  <url>
    <loc>${siteUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`
  await writeFile(path.join(distDir, 'sitemap.xml'), xml, 'utf-8')
  console.log(`[seo-build] Wrote sitemap.xml with ${routes.length} URLs.`)
}

async function copySnapshots() {
  const exists = await stat(snapshotsDir).catch(() => null)
  if (!exists) {
    console.log('[seo-build] No prerendered-snapshots/ yet - run `yarn build && yarn seo:snapshot` locally to generate one. Skipping.')
    return
  }
  await cp(snapshotsDir, distDir, { recursive: true })
  console.log('[seo-build] Copied prerendered-snapshots/ into dist/.')
}

async function main() {
  const routes = await collectRoutes()
  await writeSitemap(routes)
  await copySnapshots()
}

main().catch((err) => {
  console.error('[seo-build] Failed:', err)
  process.exitCode = 1
})
