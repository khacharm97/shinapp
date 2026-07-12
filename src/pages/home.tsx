import { HeroSection } from '@/components/home/hero-section'
import { WhoAreWeSection } from '@/components/home/who-are-we-section'
import { FeaturedSkillsSection } from '@/components/home/featured-skills-section'
import { OurMastersSection } from '@/components/home/our-masters-section'
// import { OurTechniqueSection } from '@/components/home/our-technique-section'
import { WhyTrustUsSection } from '@/components/home/why-trust-us-section'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-start w-full flex-1">
      <HeroSection />
      <WhoAreWeSection />
      <FeaturedSkillsSection />
      <OurMastersSection />
      {/* <OurTechniqueSection /> */}
      <WhyTrustUsSection />
    </div>
  )
}
