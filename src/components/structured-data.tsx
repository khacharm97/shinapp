import { Helmet } from 'react-helmet-async'

const SITE_URL = 'https://www.shinapp.am'

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ShinApp',
  alternateName: 'Shin',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Find the best construction (shin) masters, builders, and specialists in Armenia.',
  areaServed: {
    '@type': 'Country',
    name: 'Armenia',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+374-93-23-34-02',
    email: 'shinapp.support@gmail.com',
    contactType: 'customer service',
  },
}

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ShinApp',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
}

export function StructuredData() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
      <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
    </Helmet>
  )
}
