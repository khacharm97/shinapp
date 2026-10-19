import { getImageUrl } from '@/utils'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { BadgeCheck, Image as ImageIcon, Loader2 } from 'lucide-react'
import { InfiniteSliderSection } from './infinite-slider-section'
import { useGetAnnouncementsQuery } from '@/store/api/publicApi'

interface HomeAnnouncement {
  id: string
  title: string
  sphere: string
  urgent: boolean
  imageUrls?: string[]
  company?: { name?: string | null; verifiedAt?: string | null }
}

// The public endpoint already returns urgent announcements first, then newest.
export function TopAnnouncementsSection() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetAnnouncementsQuery({ page: 1, limit: 6 })

  if (isLoading) {
    return (
      <section className="w-full max-w-[1740px] mx-auto px-4 md:px-20 py-8 md:py-16 text-start flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </section>
    )
  }

  const announcements: HomeAnnouncement[] = data?.items || []

  if (announcements.length === 0) {
    return null
  }

  return (
    <InfiniteSliderSection
      title={t('top_announcements', 'Top announcements')}
      items={announcements}
      exploreLink="/announcements"
      exploreText={t('explore_more')}
      renderItem={(announcement: HomeAnnouncement, index: number) => (
        <Link
          to={`/announcements/${announcement.id}`}
          key={`${announcement.id}-${index}`}
          className="w-[200px] md:w-[240px] flex-shrink-0 snap-start bg-background flex flex-col group cursor-pointer"
        >
          <div className="relative overflow-hidden rounded-lg mb-2 bg-gray-100 dark:bg-gray-800">
            {announcement.imageUrls?.[0] ? (
              <img
                src={getImageUrl(announcement.imageUrls[0]) || ''}
                alt={announcement.title}
                className="w-full h-[240px] md:h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-[240px] md:h-[300px] flex items-center justify-center text-gray-300 dark:text-zinc-600">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
            {announcement.urgent && (
              <span className="absolute top-2 start-2 rounded-full bg-red-500 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">
                {t('urgent', 'URGENT')}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="font-semibold text-base truncate group-hover:text-brand transition-colors" title={announcement.title}>
              {announcement.title}
            </h3>
            <div className="flex items-center text-xs text-foreground/70 gap-2 min-w-0">
              <span className="truncate">{announcement.company?.name || announcement.sphere}</span>
              {announcement.company?.verifiedAt && <BadgeCheck className="w-4 h-4 text-brand shrink-0" />}
            </div>
          </div>
        </Link>
      )}
    />
  )
}
