// Runs automatically after every `vite build` (including on Vercel).
// Does two things, neither of which needs a browser:
//  1. Writes dist/sitemap.xml from live backend data.
//  2. Copies the prerendered-snapshots/ directory (generated locally via
//     `yarn seo:snapshot`, committed to git) on top of dist/, so search
//     engines get real static HTML instead of an empty <div id="root">
//     shell - without ever launching Chrome in Vercel's build container.
import { cp, writeFile, stat, readdir, readFile } from 'node:fs/promises'
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

// Vite names built assets "<name>-<8-char-hash>.<ext>", and the hash changes
// on every build even when the file's content doesn't. The committed
// prerendered-snapshots/ HTML was captured against whatever hashes existed
// when someone last ran `yarn seo:snapshot`, so by the time the *next*
// build runs, those references point at files that no longer exist in
// dist/assets/ - and Vercel's SPA rewrite then serves index.html (as HTML)
// for the missing .js request, which the browser rejects as an invalid
// module MIME type. Rather than relying on snapshots always being
// regenerated before every deploy, rewrite any stale /assets/ reference in
// the copied-in HTML to match this build's real output, using the
// name-before-the-hash as the stable key.
function assetKey(filename) {
  const ext = path.extname(filename)
  const stem = filename.slice(0, -ext.length)
  if (stem.length <= 9) return null // no room for "-" + 8-char hash
  return `${stem.slice(0, -9)}${ext}`
}

async function buildCurrentAssetMap() {
  const assetsDir = path.join(distDir, 'assets')
  const entries = await readdir(assetsDir).catch(() => [])
  const map = new Map()
  for (const file of entries) {
    if (!file.endsWith('.js') && !file.endsWith('.css')) continue
    const key = assetKey(file)
    if (key) map.set(key, file)
  }
  return map
}

async function findHtmlFiles(dir) {
  const results = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) results.push(...(await findHtmlFiles(full)))
    else if (entry.name.endsWith('.html')) results.push(full)
  }
  return results
}

async function fixStaleAssetReferences() {
  const assetMap = await buildCurrentAssetMap()
  if (assetMap.size === 0) return

  const assetTagRe = /((?:src|href)=")\/assets\/([^"]+\.(?:js|css))(")/g
  const htmlFiles = await findHtmlFiles(distDir)
  let fixedFiles = 0

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf-8')
    let changed = false
    const updated = html.replace(assetTagRe, (match, prefix, assetName, suffix) => {
      const key = assetKey(assetName)
      const current = key && assetMap.get(key)
      if (current && current !== assetName) {
        changed = true
        return `${prefix}/assets/${current}${suffix}`
      }
      return match
    })
    if (changed) {
      await writeFile(file, updated, 'utf-8')
      fixedFiles++
    }
  }

  if (fixedFiles) {
    console.log(`[seo-build] Rewrote stale /assets/ references in ${fixedFiles} HTML file(s) to match this build's hashes.`)
  }
}

async function main() {
  const routes = await collectRoutes()
  await writeSitemap(routes)
  await copySnapshots()
  await fixStaleAssetReferences()
}

main().catch((err) => {
  console.error('[seo-build] Failed:', err)
  process.exitCode = 1
})
