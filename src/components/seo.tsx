import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title?: string
  description?: string
  type?: string
  image?: string
}

export function SEO({
  title,
  description,
  type = 'website',
  image,
}: SEOProps) {
  const { t, i18n } = useTranslation()
  const location = useLocation()

  const siteUrl = 'https://www.shinapp.am'
  const currentUrl = `${siteUrl}${location.pathname}`

  const defaultTitle = t('seo_default_title', 'ShinApp | Shin & Construction Masters in Armenia');
  const defaultDescription = t('seo_default_desc', 'Find the best construction (shin) masters, builders, and specialists in Armenia. Շինարարություն և վերանորոգում ShinApp-ի հետ:');

  const seo = {
    title: title ? `${title} | ShinApp` : defaultTitle,
    description: description || defaultDescription,
    keywords: t('seo_keywords', 'shin, shinapp, շին, շինարարություն, masters, armenia, construction, builders, վերանորոգում'),
    url: currentUrl,
    image: image || `${siteUrl}/logo.png`,
  }

  return (
    <Helmet>
      <html lang={i18n.language || 'hy'} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <link rel="canonical" href={seo.url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content="ShinApp" />
      <meta property="og:url" content={seo.url} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:locale" content={i18n.language === 'hy' ? 'hy_AM' : 'en_US'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:image" content={seo.image} />
    </Helmet>
  )
}
