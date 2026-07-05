import { useTranslation } from 'react-i18next'

export function WhoAreWeSection() {
  const { t } = useTranslation()

  return (
    <section className="w-full max-w-[1740px] mx-auto px-4 md:px-20 py-8 md:py-24 text-start">
      <h2 className="text-2xl md:text-4xl font-bold text-brand mb-8">
        {t('who_are_we_title')}
      </h2>
      <div className="space-y-4 text-base md:text-lg text-foreground/80 w-full leading-relaxed">
        <p className="font-bold text-foreground">{t('who_are_we_desc_1')}</p>
        <p>{t('who_are_we_desc_2')}</p>
        <p>{t('who_are_we_desc_3')}</p>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-2">
          {t('who_are_we_desc_4')}
        </p>
      </div>
    </section>
  )
}
