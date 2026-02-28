import { useTranslation } from 'react-i18next'
import { Sparkles } from 'lucide-react'

export function ComingSoonBanner() {
  const { t } = useTranslation()

  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-primary/10 px-6 py-2.5 sm:px-3.5 sm:before:flex-1 w-full justify-center border-b border-primary/20">
      <div
        aria-hidden="true"
        className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-primary to-primary/50 opacity-30"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl"
      >
        <div
          style={{
            clipPath:
              'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)',
          }}
          className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-primary/50 to-primary opacity-30"
        />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm/6 flex items-center gap-2 font-medium text-foreground">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <strong className="font-semibold text-primary">{t('coming_soon_title')}</strong>
          <span className="hidden sm:inline">-</span>
          <span className="opacity-80">{t('coming_soon_desc')}</span>
        </p>
      </div>
      <div className="flex flex-1 justify-end sm:hidden">
      </div>
    </div>
  )
}
