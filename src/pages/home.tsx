import { HeroSection } from '@/components/home/hero-section'
import { WhoAreWeSection } from '@/components/home/who-are-we-section'
import { OurMastersSection } from '@/components/home/our-masters-section'
import { OurTechniqueSection } from '@/components/home/our-technique-section'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-start w-full flex-1">
      <HeroSection />
      <WhoAreWeSection />
      <OurMastersSection />
      <OurTechniqueSection />
    </div>
  )
}
