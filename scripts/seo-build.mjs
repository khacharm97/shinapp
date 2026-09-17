// Post-build step: fetches published content, writes sitemap.xml, and
// prerenders static HTML snapshots of each public route into dist/ so
// search engines and link-preview bots see real content instead of an
// empty <div id="root"> shell.
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const siteUrl = 'https://www.shinapp.am'
const backendUrl = (process.env.VITE_BACK_URL || 'https://shinapp-backend-production-769a.up.railway.app').replace(/\/$/, '')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

async function fetchJson(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return await res.json()
  } catch (err) {
    console.warn(`[seo-build] Failed to fetch ${url}: ${err.message}. Skipping.`)
    return null
  }
}

async function fetchAllIds(url, key = 'items') {
  const data = await fetchJson(`${url}${url.includes('?') ? '&' : '?'}limit=100`)
  if (!data || !Array.isArray(data[key])) return []
  return data[key].map((item) => item.id).filter(Boolean)
}

async function collectRoutes() {
  const [masterIds, announcementIds, techniqueIds] = await Promise.all([
    fetchAllIds(`${backendUrl}/auth/masters`),
    fetchAllIds(`${backendUrl}/announcements`),
    fetchAllIds(`${backendUrl}/auth/techniques`),
  ])

  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/masters', priority: '0.9', changefreq: 'daily' },
    { path: '/announcements', priority: '0.8', changefreq: 'daily' },
    { path: '/technique', priority: '0.7', changefreq: 'daily' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.6', changefreq: 'monthly' },
    { path: '/calculator', priority: '0.5', changefreq: 'monthly' },
    { path: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  ]

  const dynamicRoutes = [
    ...masterIds.map((id) => ({ path: `/masters/${id}`, priority: '0.6', changefreq: 'weekly' })),
    ...announcementIds.map((id) => ({ path: `/announcements/${id}`, priority: '0.6', changefreq: 'weekly' })),
    ...techniqueIds.map((id) => ({ path: `/technique/${id}`, priority: '0.5', changefreq: 'weekly' })),
  ]

  return [...staticRoutes, ...dynamicRoutes]
}

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

// react-helmet-async inserts a new <title>/<meta name="description">/
// <link rel="canonical"> node each time the page's data-dependent queries
// resolve and re-render <SEO>, instead of replacing the previous one in
// place, so the DOM accumulates stale nodes (starting with the static
// fallback from index.html) until it settles on the final, correct value
// last. waitForStableHead() below waits out that churn; this keeps only the
// last (final, correct) copy of each as a safety net.
function dedupeSingletonTags(html, regex) {
  const matches = [...html.matchAll(regex)]
  if (matches.length <= 1) return html
  let result = ''
  let cursor = 0
  for (const match of matches.slice(0, -1)) {
    result += html.slice(cursor, match.index)
    cursor = match.index + match[0].length
  }
  result += html.slice(cursor)
  return result
}

function cleanPrerenderedHtml(html) {
  html = dedupeSingletonTags(html, /<title>.*?<\/title>/gs)
  html = dedupeSingletonTags(html, /<meta name="description"[^>]*>/g)
  return html
}

function startStaticServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        const urlPath = decodeURIComponent(req.url.split('?')[0])
        let filePath = path.join(distDir, urlPath)
        let fileStat = await stat(filePath).catch(() => null)

        if (fileStat?.isDirectory()) {
          filePath = path.join(filePath, 'index.html')
          fileStat = await stat(filePath).catch(() => null)
        }

        // SPA fallback: unknown extensionless routes get the app shell.
        if (!fileStat && !path.extname(urlPath)) {
          filePath = path.join(distDir, 'index.html')
          fileStat = await stat(filePath).catch(() => null)
        }

        if (!fileStat) {
          res.writeHead(404)
          res.end('Not found')
          return
        }

        const ext = path.extname(filePath)
        const body = await readFile(filePath)
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
        res.end(body)
      } catch (err) {
        res.writeHead(500)
        res.end(String(err))
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
}

// Detail pages fire several independent RTK Query requests (the entity
// itself, plus skills/reviews/busy-dates, ...) that each resolve at a
// different time and re-render <SEO>, so document.title/canonical keep
// changing for a bit after the network goes idle. Poll until they hold
// still instead of guessing a fixed delay.
async function waitForHeadToSettle(page, { intervalMs = 250, stableChecks = 6, maxWaitMs = 8000 } = {}) {
  const start = Date.now()
  let lastSignature = null
  let stableCount = 0

  while (Date.now() - start < maxWaitMs) {
    const signature = await page.evaluate(() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || ''
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      return `${document.title}|${canonical}|${description}`
    })
    if (signature === lastSignature) {
      stableCount += 1
      if (stableCount >= stableChecks) return
    } else {
      stableCount = 0
      lastSignature = signature
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
}

// Keep only the last (final, correct) node for each Helmet-managed singleton
// tag, removing the stale ones left behind by earlier re-renders.
async function dedupeHeadInPage(page) {
  await page.evaluate(() => {
    // <title> is a special case: the HTML spec defines document.title to
    // read from the *first* title element in tree order, and Helmet's
    // correct, page-specific node always ends up first (with a stale
    // leftover from index.html's static fallback trailing after it) - the
    // opposite order from every other tag below. Trust the spec-defined
    // getter rather than guessing a DOM position.
    const correctTitle = document.title
    document.head.querySelectorAll('title').forEach((el) => el.remove())
    const titleEl = document.createElement('title')
    titleEl.textContent = correctTitle
    document.head.prepend(titleEl)

    const dropAllButLast = (selector) => {
      const els = [...document.head.querySelectorAll(selector)]
      els.slice(0, -1).forEach((el) => el.remove())
    }
    dropAllButLast('meta[name="description"]')
    dropAllButLast('meta[name="keywords"]')
    dropAllButLast('link[rel="canonical"]')

    const groupAndDedupe = (selector, attr) => {
      const els = [...document.head.querySelectorAll(selector)]
      const seen = new Map()
      for (const el of els) {
        const key = el.getAttribute(attr)
        if (seen.has(key)) seen.get(key).remove()
        seen.set(key, el)
      }
    }
    groupAndDedupe('meta[property^="og:"]', 'property')
    groupAndDedupe('meta[name^="twitter:"]', 'name')
  })
}

async function prerenderRoutes(routes, port) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  for (const route of routes) {
    const url = `http://127.0.0.1:${port}${route.path}`
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
      await waitForHeadToSettle(page)
      await dedupeHeadInPage(page)
      const html = cleanPrerenderedHtml(await page.content())

      const outDir = route.path === '/' ? distDir : path.join(distDir, route.path)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, 'index.html'), html, 'utf-8')
      console.log(`[seo-build] Prerendered ${route.path}`)
    } catch (err) {
      console.warn(`[seo-build] Failed to prerender ${route.path}: ${err.message}`)
    }
  }

  await browser.close()
}

async function main() {
  const routes = await collectRoutes()
  await writeSitemap(routes)

  const server = await startStaticServer()
  const port = server.address().port
  try {
    await prerenderRoutes(routes, port)
  } finally {
    server.close()
  }
}

main().catch((err) => {
  console.error('[seo-build] Failed:', err)
  process.exitCode = 1
})
