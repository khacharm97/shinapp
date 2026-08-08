import { lazy, Suspense } from 'react'
import { HeroSection } from '@/components/home/hero-section'
import { useAppSelector } from '@/store/hooks'
import { SEO } from '@/components/seo'

const WhoAreWeSection = lazy(() => import('@/components/home/who-are-we-section').then(m => ({ default: m.WhoAreWeSection })))
const FeaturedSkillsSection = lazy(() => import('@/components/home/featured-skills-section').then(m => ({ default: m.FeaturedSkillsSection })))
const OurMastersSection = lazy(() => import('@/components/home/our-masters-section').then(m => ({ default: m.OurMastersSection })))
// const OurTechniqueSection = lazy(() => import('@/components/home/our-technique-section').then(m => ({ default: m.OurTechniqueSection })))
const WhyTrustUsSection = lazy(() => import('@/components/home/why-trust-us-section').then(m => ({ default: m.WhyTrustUsSection })))

export default function HomePageContent() {
  const token = useAppSelector((state) => state.auth.token)

  return (
    <div className="flex flex-col items-center justify-start w-full flex-1">
      <SEO title="Home" />
      <HeroSection />
      
      <Suspense fallback={<div className="h-32 w-full animate-pulse bg-slate-50/50" />}>
        {!token && <WhoAreWeSection />}
        <FeaturedSkillsSection />
        <OurMastersSection />
        {/* <OurTechniqueSection /> */}
        <WhyTrustUsSection />
      </Suspense>
    </div>
  )
}

