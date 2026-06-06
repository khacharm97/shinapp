import { useTranslation } from 'react-i18next'
import techniqueImg from '@/assets/technique.png'
import { InfiniteSliderSection } from './infinite-slider-section'

const mockTechnique = [
  { id: 1, name: 'Perferator', category: 'Sarqavorum' },
  { id: 2, name: 'Perferator', category: 'Sarqavorum' },
  { id: 3, name: 'Perferator', category: 'Sarqavorum' },
  { id: 4, name: 'Perferator', category: 'Sarqavorum' },
]

export function OurTechniqueSection() {
  const { t } = useTranslation()

  return (
    <InfiniteSliderSection
      title={t('our_technique')}
      items={mockTechnique}
      exploreLink="/technique"
      exploreText={t('explore_more')}
      renderItem={(item, index) => (
        <div key={`${item.id}-${index}`} className="min-w-[260px] md:min-w-[300px] flex-shrink-0 snap-start bg-background flex flex-col">
          <img 
            src={techniqueImg} 
            alt={item.name} 
            className="w-full h-[320px] md:h-[400px] object-cover rounded-lg mb-3 bg-gray-100 dark:bg-gray-800"
          />
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <span className="text-sm text-foreground/70">{item.category}</span>
          </div>
        </div>
      )}
    />
  )
}
