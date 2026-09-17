// Run this LOCALLY (not on Vercel - its build containers lack the shared
// libraries headless Chrome needs to launch) after `yarn build`, to refresh
// the static HTML snapshots committed under prerendered-snapshots/. Those
// snapshots get copied into dist/ by scripts/seo-build.mjs on every build
// (including Vercel's, no browser required) so crawlers see real content
// instead of an empty <div id="root"> shell.
//
// Usage: yarn build && yarn seo:snapshot
import { createServer } from 'node:http'
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { collectRoutes } from './lib/routes.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, '..', 'dist')
const snapshotsDir = path.join(__dirname, '..', 'prerendered-snapshots')

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

// react-helmet-async inserts a new <title>/<meta name="description">/
// <link rel="canonical"> node each time the page's data-dependent queries
// resolve and re-render <SEO>, instead of replacing the previous one in
// place, so the DOM accumulates stale nodes (starting with the static
// fallback from index.html) until it settles on the final, correct value
// last. waitForHeadToSettle() below waits out that churn; this is a safety
// net that keeps only the last (final, correct) copy of each.
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

async function snapshotRoutes(routes, port) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()

  for (const route of routes) {
    const url = `http://127.0.0.1:${port}${route.path}`
    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 })
      await waitForHeadToSettle(page)
      await dedupeHeadInPage(page)
      const html = cleanPrerenderedHtml(await page.content())

      const outDir = route.path === '/' ? snapshotsDir : path.join(snapshotsDir, route.path)
      await mkdir(outDir, { recursive: true })
      await writeFile(path.join(outDir, 'index.html'), html, 'utf-8')
      console.log(`[generate-snapshots] Captured ${route.path}`)
    } catch (err) {
      console.warn(`[generate-snapshots] Failed to capture ${route.path}: ${err.message}`)
    }
  }

  await browser.close()
}

async function main() {
  const distIndex = await stat(path.join(distDir, 'index.html')).catch(() => null)
  if (!distIndex) {
    console.error('[generate-snapshots] dist/index.html not found. Run `yarn build` first.')
    process.exitCode = 1
    return
  }

  const routes = await collectRoutes()
  const server = await startStaticServer()
  const port = server.address().port
  try {
    await snapshotRoutes(routes, port)
  } finally {
    server.close()
  }
  console.log(`[generate-snapshots] Done. Commit the prerendered-snapshots/ changes.`)
}

main().catch((err) => {
  console.error('[generate-snapshots] Failed:', err)
  process.exitCode = 1
})
