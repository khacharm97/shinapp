import { useTranslation } from 'react-i18next'
import { Calculator } from '@/components/calculator'
import bannerAm from '@/assets/banner_am.png'
import bannerEn from '@/assets/banner_en.png'
import bannerRu from '@/assets/banner_ru.png'

export default function HomePage() {
  const { t, i18n } = useTranslation()

  // Select banner based on current language
  const currentLang = i18n.language || 'en'
  let bannerSrc = bannerEn
  if (currentLang.startsWith('am')) {
    bannerSrc = bannerAm
  } else if (currentLang.startsWith('ru')) {
    bannerSrc = bannerRu
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] text-center px-4">
        <div className="space-y-6 max-w-2xl w-full flex flex-col items-center">
          {bannerSrc && (
            <div className="w-full max-w-md overflow-hidden rounded-2xl shadow-md hover:shadow-xl border border-border/40 transition-all duration-300 hover:scale-[1.02] animate-in fade-in zoom-in duration-700">
              <img
                src={bannerSrc}
                alt="ShinApp Banner"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-primary animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-2">
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
