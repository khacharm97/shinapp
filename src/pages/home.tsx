import { useTranslation } from 'react-i18next'
import { ComingSoonBanner } from '@/components/coming-soon-banner'
import { Calculator } from '@/components/calculator'

export default function HomePage() {
  const { t } = useTranslation()

  return (
    <>
      <ComingSoonBanner />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] text-center">
        <div className="space-y-6 max-w-2xl mt-8">
        <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-primary animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {t('welcome')}
        </h2>
        <div className="pt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <Calculator />
        </div>
      </div>
    </div>
    </>
  )
}
