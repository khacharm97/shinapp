import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'

interface SEOProps {
  title?: string
  description?: string
  type?: string
}

export function SEO({ 
  title, 
  description, 
  type = 'website' 
}: SEOProps) {
  const { i18n } = useTranslation()
  const location = useLocation()
  
  const siteUrl = 'https://www.shinapp.am'
  const currentUrl = `${siteUrl}${location.pathname}`
  
  const defaultTitle = 'ShinApp - Find the best masters in Armenia'
  const defaultDescription = 'Research and brainstorm. Think about your background, education, awards, skills and other attributes that you developed or earned throughout your career or education.'

  const seo = {
    title: title ? `${title} | ShinApp` : defaultTitle,
    description: description || defaultDescription,
    url: currentUrl,
  }

  return (
    <Helmet>
      <html lang={i18n.language || 'hy'} />
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <link rel="canonical" href={seo.url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:site_name" content="ShinApp" />
      <meta property="og:url" content={seo.url} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:url" content={seo.url} />
    </Helmet>
  )
}
