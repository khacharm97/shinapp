import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ArrowRight, BadgeCheck, ChevronDown, ChevronUp, Image as ImageIcon, Loader2, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGetAnnouncementsQuery } from '@/store/api/publicApi'
import { armeniaRegions } from '@/lib/armenia-regions'
import { getDateLocale, getImageUrl, getLocalizedName } from '@/utils'

interface HomeAnnouncement {
  id: string
  title: string
  sphere: string
  urgent: boolean
  createdAt: string
  imageUrls?: string[]
  company?: {
    name?: string | null
    avatarUrl?: string | null
    verifiedAt?: string | null
    userInfo?: { regionId?: string | null; cityId?: string | null } | null
  }
}

// How many cards fit in the scroll area. A fractional value shows a peek of the next card.
const VISIBLE = 2.5
const MAX_ITEMS = 10
const AUTO_SCROLL_MS = 4000
// After the user scrolls or touches the list, wait this long before auto-scrolling again.
const RESUME_AFTER_MS = 6000

// The public endpoint already returns urgent announcements first, then newest.
export function TopAnnouncementsSection() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { data, isLoading } = useGetAnnouncementsQuery({ page: 1, limit: MAX_ITEMS })

  const announcements: HomeAnnouncement[] = (data?.items || []).slice(0, MAX_ITEMS)
  const canScroll = announcements.length > VISIBLE

  const scrollRef = useRef<HTMLDivElement>(null)
  const [atTop, setAtTop] = useState(true)
  const [atBottom, setAtBottom] = useState(false)

  const updateEdges = () => {
    const el = scrollRef.current
    if (!el) return
    setAtTop(el.scrollTop <= 1)
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1)
  }

  // Arrows move by exactly one card (card height + gap).
  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const cards = el.firstElementChild?.children
    const first = cards?.[0] as HTMLElement | undefined
    const second = cards?.[1] as HTMLElement | undefined
    const step = first && second ? second.offsetTop - first.offsetTop : el.clientHeight
    el.scrollBy({ top: dir * step, behavior: 'smooth' })
  }

  useEffect(() => {
    updateEdges()
  }, [announcements.length])

  // Auto-scroll: pauses while hovered, and for a while after the user scrolls or touches it.
  const isHovered = useRef(false)
  const lastInteraction = useRef(0)
  const markInteraction = () => {
    lastInteraction.current = Date.now()
  }

  // When the list is at its top/bottom edge, hand the wheel scroll straight to the page
  // (browsers otherwise wait for a new gesture before scrolling the page).
  // Native listener because React's onWheel is passive and can't preventDefault.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      markInteraction()
      if (e.ctrlKey || e.deltaY === 0) return
      const atStart = el.scrollTop <= 1
      const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
      if ((e.deltaY > 0 && atEnd) || (e.deltaY < 0 && atStart)) {
        e.preventDefault()
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
        window.scrollBy({ top: e.deltaY * unit })
      }
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [announcements.length])

  useEffect(() => {
    if (!canScroll) return
    const id = setInterval(() => {
      const el = scrollRef.current
      if (!el || isHovered.current || document.visibilityState !== 'visible') return
      if (Date.now() - lastInteraction.current < RESUME_AFTER_MS) return
      // At the end, go back to the first card.
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 1) {
        el.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        scrollByCard(1)
      }
    }, AUTO_SCROLL_MS)
    return () => clearInterval(id)
  }, [canScroll])

  const getLocalizedLocation = (rId?: string | null, cId?: string | null) => {
    if (!rId) return ''
    const region = armeniaRegions.find((r) => r.id === rId)
    if (!region) return ''
    let loc = getLocalizedName(region, i18n.language)
    if (cId) {
      const city = region.cities.find((c) => c.id === cId)
      if (city) loc = `${getLocalizedName(city, i18n.language)}, ${loc}`
    }
    return loc
  }

  if (isLoading) {
    return (
      <section className="w-full max-w-[1740px] mx-auto px-4 md:px-20 py-8 md:py-16 text-start flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </section>
    )
  }

  if (announcements.length === 0) {
    return null
  }

  const visibleRows = Math.min(VISIBLE, announcements.length)
  // Gaps between the cards in view (the half card still sits after a gap).
  const visibleGaps = Math.ceil(visibleRows) - 1

  return (
    <section className="w-full max-w-[1740px] mx-auto px-4 md:px-20 py-8 md:py-16 text-start">
      <h2 className="text-2xl md:text-4xl font-bold text-brand mb-8">
        {t('top_announcements', 'Top announcements')}
      </h2>

      <Card className="border-none shadow-[0_0_25px_rgba(0,0,0,0.08)] p-4 md:p-6 rounded-2xl relative bg-background">
        {/* Card height and gap are CSS variables so the scroll area always fits 2.5 cards */}
        <div
          ref={scrollRef}
          onScroll={updateEdges}
          onTouchStart={markInteraction}
          onTouchMove={markInteraction}
          onPointerDown={markInteraction}
          onKeyDown={markInteraction}
          onMouseEnter={() => (isHovered.current = true)}
          onMouseLeave={() => (isHovered.current = false)}
          className="overflow-y-auto snap-y snap-mandatory [--card-h:150px] sm:[--card-h:164px] [--gap:16px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ height: `calc(${visibleRows} * var(--card-h) + ${visibleGaps} * var(--gap))` }}
        >
          <div className="flex flex-col gap-[var(--gap)]">
            {announcements.map((announcement, i) => {
              const companyName = announcement.company?.name || t('unknown_company', 'Unknown Company')
              const isVerified = !!announcement.company?.verifiedAt
              const location = getLocalizedLocation(
                announcement.company?.userInfo?.regionId,
                announcement.company?.userInfo?.cityId,
              )
              const posted = announcement.createdAt
                ? formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true, locale: getDateLocale(i18n.language) })
                : ''

              return (
                <Link
                  to={`/announcements/${announcement.id}`}
                  key={`${announcement.id}-${i}`}
                  className="group h-[var(--card-h)] shrink-0 snap-startbg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 hover:shadow-lg hover:border-brand/20 transition-[box-shadow,border-color] duration-300 overflow-hidden flex flex-row gap-4 sm:gap-5 p-3 sm:p-5"
                >
                  <div className="w-24 sm:w-40 h-full sm:h-28 self-center rounded-xl overflow-hidden bg-slate-100 dark:bg-zinc-800 shrink-0 relative">
                    {announcement.imageUrls && announcement.imageUrls.length > 0 ? (
                      <img
                        src={getImageUrl(announcement.imageUrls[0])}
                        alt={announcement.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    {announcement.urgent && (
                      <span className="sm:hidden absolute top-1.5 start-1.5 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {t('urgent', 'URGENT')}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 min-w-0">
                      <span className="truncate">{announcement.sphere}</span>
                      {isVerified && (
                        <span className="flex items-center gap-1 text-brand font-semibold shrink-0">
                          <BadgeCheck className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('verified', 'Verified')}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground group-hover:text-brand transition-colors line-clamp-1">
                      {announcement.title}
                    </h3>

                    <div className="flex items-center gap-x-3 text-sm text-slate-500 dark:text-gray-400 min-w-0">
                      {location && (
                        <span className="flex items-center gap-1 min-w-0">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{location}</span>
                        </span>
                      )}
                      {/* On phones there's room for one: show location, or the date if there's no location */}
                      {location && posted && <span className="hidden sm:inline">&middot;</span>}
                      {posted && (
                        <span className={`truncate shrink-0 ${location ? 'hidden sm:inline' : ''}`}>
                          {t('posted', 'Posted')} {posted}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-brand/10 text-brand font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                        {announcement.company?.avatarUrl ? (
                          <img
                            src={getImageUrl(announcement.company.avatarUrl)}
                            alt={companyName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          companyName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm text-slate-600 dark:text-gray-300 truncate">{companyName}</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end justify-center gap-2 shrink-0 border-l border-slate-100 dark:border-zinc-800 pl-5">
                    {announcement.urgent && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 whitespace-nowrap">
                        {t('urgent', 'URGENT')}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-brand font-semibold text-sm group-hover:gap-2 transition-all shrink-0 whitespace-nowrap">
                      {t('view_details', 'View details')}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={() => navigate('/announcements')}
            className="bg-brand hover:bg-brand/90 text-white rounded-lg px-6 font-bold text-[16px]"
          >
            {t('explore_more')}
          </Button>

          {canScroll && (
            <div className="flex gap-2">
              <Button
                size="icon"
                aria-label="Previous"
                onClick={() => {
                  markInteraction()
                  scrollByCard(-1)
                }}
                disabled={atTop}
                className="bg-brand text-white hover:bg-brand/90 w-10 h-10 rounded-lg"
              >
                <ChevronUp className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                aria-label="Next"
                onClick={() => {
                  markInteraction()
                  scrollByCard(1)
                }}
                disabled={atBottom}
                className="bg-brand text-white hover:bg-brand/90 w-10 h-10 rounded-lg"
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </section>
  )
}
