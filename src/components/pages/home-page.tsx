import { HeroSection } from '@/components/home/hero-section'
import { WhoAreWeSection } from '@/components/home/who-are-we-section'
import { FeaturedSkillsSection } from '@/components/home/featured-skills-section'
import { OurMastersSection } from '@/components/home/our-masters-section'
import { OurTechniqueSection } from '@/components/home/our-technique-section'
import { WhyTrustUsSection } from '@/components/home/why-trust-us-section'
import { useAppSelector } from '@/store/hooks'
import { SEO } from '@/components/seo'

export default function HomePageContent() {
  const token = useAppSelector((state) => state.auth.token)

  return (
    <div className="flex flex-col items-center justify-start w-full flex-1">
      <SEO />
      <HeroSection />
      {!token && <WhoAreWeSection />}
      <FeaturedSkillsSection />
      <OurMastersSection />
      <OurTechniqueSection />
      <WhyTrustUsSection />
    </div>
  )
}

