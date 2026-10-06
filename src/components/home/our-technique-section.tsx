import { getImageUrl } from '@/utils'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import techniqueImg from '@/assets/technique.webp'
import { InfiniteSliderSection } from './infinite-slider-section'
import { useGetHomeTechniquesQuery } from '@/store/api/authApi'
import type { Technique } from '@/types'

export function OurTechniqueSection() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetHomeTechniquesQuery({ limit: 6 })

  if (isLoading) {
    return (
      <section className="w-full max-w-[1740px] mx-auto px-4 md:px-20 py-8 md:py-16 text-start flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </section>
    )
  }

  const techniques: Technique[] = data?.items || []

  if (techniques.length === 0) {
    return null;
  }

  return (
    <InfiniteSliderSection
      title={t('our_technique')}
      items={techniques}
      exploreLink="/technique"
      exploreText={t('explore_more')}
      renderItem={(technique: Technique, index: number) => (
        <Link
          to={`/technique/${technique.id}`}
          key={`${technique.id}-${index}`}
          className="w-[200px] md:w-[240px] flex-shrink-0 snap-start bg-background flex flex-col group cursor-pointer"
        >
          <div className="overflow-hidden rounded-lg mb-2">
            <img
              src={technique.imageUrls?.[0] ? getImageUrl(technique.imageUrls[0]) || "" : techniqueImg}
              alt={technique.name}
              className="w-full h-[240px] md:h-[300px] object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = techniqueImg;
              }}
            />
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="font-semibold text-base truncate group-hover:text-brand transition-colors" title={technique.name}>{technique.name}</h3>
            <span className="text-xs text-foreground/70">
              {technique.price.toLocaleString()} ֏{technique.priceType === 'HOURLY' ? ` / ${t('technique_price_per_hour', 'hr')}` : ''}
            </span>
          </div>
        </Link>
      )}
    />
  )
}
