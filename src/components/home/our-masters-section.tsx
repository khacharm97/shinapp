import { useTranslation } from 'react-i18next'
import { CheckCircle2, XCircle } from 'lucide-react'
import masterImg from '@/assets/master.png'
import { InfiniteSliderSection } from './infinite-slider-section'

const mockMasters = [
  { id: 1, name: 'Gurgen Nersisyan', role: 'master_role_painter', status: 'available' },
  { id: 2, name: 'Gurgen Nersisyan', role: 'master_role_painter', status: 'busy' },
  { id: 3, name: 'Gurgen Nersisyan', role: 'master_role_painter', status: 'available' },
  { id: 4, name: 'Gurgen Nersisyan', role: 'master_role_painter', status: 'busy' },
]

export function OurMastersSection() {
  const { t } = useTranslation()

  return (
    <InfiniteSliderSection
      title={t('our_masters')}
      items={mockMasters}
      exploreLink="/masters"
      exploreText={t('explore_more')}
      renderItem={(master, index) => (
        <div key={`${master.id}-${index}`} className="min-w-[200px] md:min-w-[240px] flex-shrink-0 snap-start bg-background flex flex-col">
          <img 
            src={masterImg} 
            alt={master.name} 
            className="w-full h-[240px] md:h-[300px] object-cover rounded-lg mb-2 bg-gray-100 dark:bg-gray-800"
          />
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-base">{master.name}</h3>
            <div className="flex items-center text-xs text-foreground/70 gap-2">
              <span>{t(master.role)}</span>
              <span>-</span>
              {master.status === 'available' ? (
                <span className="flex items-center gap-1 text-green-500">
                  <CheckCircle2 className="w-4 h-4" /> {t('available_now')}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500">
                  <XCircle className="w-4 h-4" /> {t('busy')}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    />
  )
}
