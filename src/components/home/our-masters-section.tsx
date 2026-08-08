import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { CheckCircle2, Loader2 } from 'lucide-react'
import masterImg from '@/assets/master.png'
import { InfiniteSliderSection } from './infinite-slider-section'
import { useGetHomeMastersQuery } from '@/store/api/authApi'
import type { Master } from '@/types'

export function OurMastersSection() {
  const { t } = useTranslation()
  const { data, isLoading } = useGetHomeMastersQuery({ limit: 6 })

  const getLocalizedSkills = (skills?: string[] | null) => {
    if (!skills || skills.length === 0) return t('master');
    return skills.map(skill => {
      switch(skill) {
        case "shinarar": return t("profile_skill_shinarar", "Shinarar");
        case "nerkarar": return t("profile_skill_nerkarar", "Nerkarar");
        case "plumber": return t("calc_plumbing", "Plumber");
        case "electrician": return t("calc_electricity", "Electrician");
        default: return skill;
      }
    }).join(" | ");
  };

  if (isLoading) {
    return (
      <section className="w-full max-w-[1740px] mx-auto px-4 md:px-20 py-8 md:py-16 text-start flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </section>
    )
  }

  const masters: Master[] = data?.items || []

  if (masters.length === 0) {
    return null;
  }

  return (
    <InfiniteSliderSection
      title={t('our_masters')}
      items={masters}
      exploreLink="/masters"
      exploreText={t('explore_more')}
      renderItem={(master: Master, index: number) => (
        <Link 
          to={`/masters/${master.id}`} 
          key={`${master.id}-${index}`} 
          className="w-[200px] md:w-[240px] max-w-[200px] md:max-w-[240px] flex-shrink-0 snap-start bg-background flex flex-col group cursor-pointer block"
        >
          <div className="overflow-hidden rounded-md mb-2">
            <img 
              src={master.avatarUrl ? `${import.meta.env.VITE_BACK_URL || 'http://localhost:3000'}${master.avatarUrl}` : masterImg} 
              alt={master.name || "Master"} 
              className="w-full h-[240px] md:h-[300px] object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = masterImg;
              }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-base group-hover:text-brand transition-colors">{master.name || "Unnamed Master"}</h3>
            <div className="flex items-center text-xs text-foreground/70 gap-2 truncate">
              <span className="truncate max-w-[150px]">
                {getLocalizedSkills(master.userInfo?.skills)}
              </span>
              <span>-</span>
              <span className="flex items-center gap-1 text-green-500 shrink-0">
                <CheckCircle2 className="w-4 h-4" /> {t('available_now')}
              </span>
            </div>
          </div>
        </Link>
      )}
    />
  )
}
