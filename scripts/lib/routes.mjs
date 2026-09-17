// Shared route list for sitemap generation and prerendered-snapshot
// generation: static marketing pages plus every published master,
// announcement, and technique detail page, fetched live from the backend.
export const siteUrl = 'https://www.shinapp.am'
export const backendUrl = (process.env.VITE_BACK_URL || 'https://shinapp-backend-production-769a.up.railway.app').replace(/\/$/, '')

async function fetchJson(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
    return await res.json()
  } catch (err) {
    console.warn(`[routes] Failed to fetch ${url}: ${err.message}. Skipping.`)
    return null
  }
}

async function fetchAllIds(url, key = 'items') {
  const data = await fetchJson(`${url}${url.includes('?') ? '&' : '?'}limit=100`)
  if (!data || !Array.isArray(data[key])) return []
  return data[key].map((item) => item.id).filter(Boolean)
}

export async function collectRoutes() {
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
